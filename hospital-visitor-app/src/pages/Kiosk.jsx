import { useEffect, useState } from 'react';
import { useLang, fmtAgo } from '../i18n';
import { getPin, listVisitors, checkout, clearPin } from '../api';
import LangSwitch from '../components/LangSwitch';
import PinGate from '../components/PinGate';
import VisitorForm from '../components/VisitorForm';

export default function Kiosk() {
  const { t } = useLang();
  const [authed, setAuthed] = useState(() => getPin() !== '');
  const [view, setView] = useState('home'); // home | form | done | inside
  const [rows, setRows] = useState([]);
  const [last, setLast] = useState(null);
  const [formKey, setFormKey] = useState(0);

  async function poll() {
    try {
      const r = await listVisitors({ status: 'in' });
      setRows(r.visitors || []);
    } catch {
      clearPin();
      setAuthed(false);
    }
  }

  useEffect(() => {
    if (!authed) return;
    poll();
    const id = setInterval(poll, 15000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authed]);

  async function out(v) {
    try {
      await checkout(v.code, 'manual');
      poll();
    } catch {}
  }

  if (!authed) {
    return (
      <div className="page">
        <div className="topbar">
          <span className="hname">🏥 {t('kiosk_title')}</span>
          <LangSwitch />
        </div>
        <PinGate big onOk={() => setAuthed(true)} />
      </div>
    );
  }

  return (
    <div className="page">
      <div className="topbar">
        <span className="hname">🏥 {t('kiosk_title')}</span>
        <div className="topbar-right">
          <LangSwitch />
          <button className="ghost small" onClick={() => { clearPin(); setAuthed(false); setView('home'); }}>
            🔒 {t('pin_locked')}
          </button>
        </div>
      </div>

      <p className="sub">{t('kiosk_sub')}</p>

      {view === 'home' && (
        <div className="kiosk-grid">
          <button className="kbtn teal" onClick={() => { setFormKey((k) => k + 1); setView('form'); }}>
            <span className="kicon">＋</span>
            {t('new_checkin')}
          </button>
          <button className="kbtn green" onClick={() => setView('inside')}>
            <span className="kicon">👥</span>
            {t('inside_now')}
            <span className="kcount">{rows.length}</span>
          </button>
        </div>
      )}

      {view === 'form' && (
        <div className="card">
          <VisitorForm
            key={formKey}
            mode="staff"
            onDone={(v) => {
              setLast(v);
              setView('done');
            }}
          />
          <button className="ghost" onClick={() => setView('home')}>
            ← {t('back')}
          </button>
        </div>
      )}

      {view === 'done' && last && (
        <div className="card center">
          <div className="done-big">✅ {t('thanks_title')}</div>
          <div className="badge-code huge">{last.code}</div>
          <div className="done-name">{last.name}</div>
          <p className="sub">{t('staff_done_sub')}</p>
          <button
            className="primary"
            onClick={() => {
              setLast(null);
              setFormKey((k) => k + 1);
              setView('form');
            }}
          >
            {t('next_visitor')}
          </button>
          <button className="ghost" onClick={() => setView('home')}>
            ← {t('back')}
          </button>
        </div>
      )}

      {view === 'inside' && (
        <div className="card">
          <h2>
            {t('inside_now')} · {rows.length}
          </h2>
          {rows.length === 0 && <p className="sub">{t('none_found')}</p>}
          <ul className="inside-list">
            {rows.map((r) => (
              <li key={r.id}>
                <div className="inside-info">
                  <span className="inside-name">
                    {r.name} {r.mode === 'staff' && <em className="tag">{t('staff_badge')}</em>}
                  </span>
                  <span className="inside-meta">
                    {t(r.purpose) || r.purpose} · {fmtAgo(r.checked_in_at)} · {r.ward_bed || ''}
                  </span>
                </div>
                <button className="out-btn" onClick={() => out(r)}>
                  {t('checkout_short')} →
                </button>
              </li>
            ))}
          </ul>
          <button className="ghost" onClick={() => setView('home')}>
            ← {t('back')}
          </button>
        </div>
      )}
    </div>
  );
}
