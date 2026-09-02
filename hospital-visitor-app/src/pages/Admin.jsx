import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLang, fmtTime, fmtDT, fmtAgo } from '../i18n';
import { getPin, listVisitors, summary, checkout, clearPin } from '../api';
import LangSwitch from '../components/LangSwitch';
import PinGate from '../components/PinGate';

const PURPOSES = ['opd', 'ipd', 'office', 'other'];

function toCsv(rows) {
  const head = [
    'badge', 'name', 'phone', 'purpose', 'patient_name', 'appointment_no',
    'ward_bed', 'department', 'mode', 'checked_in_at', 'checked_out_at', 'checkout_type',
  ];
  const esc = (x) => {
    x = x == null ? '' : String(x);
    return /[",\n]/.test(x) ? '"' + x.replace(/"/g, '""') + '"' : x;
  };
  return (
    '\uFEFF' +
    [head.join(','), ...rows.map((r) => head.map((h) => esc(r[h])).join(','))].join('\n')
  );
}

export default function Admin() {
  const { t } = useLang();
  const [authed, setAuthed] = useState(() => getPin() !== '');
  const [tab, setTab] = useState('inside'); // inside | today | history
  const [rows, setRows] = useState([]);
  const [stats, setStats] = useState(null);
  const [qInput, setQInput] = useState('');
  const [q, setQ] = useState('');
  const [purpose, setPurpose] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setQ(qInput.trim()), 400);
    return () => clearTimeout(id);
  }, [qInput]);

  async function refresh() {
    try {
      const params = tab === 'inside' ? { status: 'in' } : tab === 'today' ? { status: 'today' } : { status: 'all' };
      if (q) params.q = q;
      if (purpose) params.purpose = purpose;
      const [list, sum] = await Promise.all([listVisitors(params), summary()]);
      setRows(list.visitors || []);
      setStats(sum);
    } catch (e) {
      if (e.status === 401) {
        clearPin();
        setAuthed(false);
      }
    }
  }

  useEffect(() => {
    if (!authed) return;
    setBusy(true);
    refresh().finally(() => setBusy(false));
    const id = setInterval(() => refresh(), 15000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authed, tab, q, purpose]);

  async function out(v) {
    try {
      await checkout(v.code, 'manual');
      refresh();
    } catch {}
  }

  function exportCsv() {
    const params = tab === 'inside' ? { status: 'in' } : tab === 'today' ? { status: 'today' } : { status: 'all' };
    if (q) params.q = q;
    if (purpose) params.purpose = purpose;
    listVisitors(params)
      .then((r) => {
        const blob = new Blob([toCsv(r.visitors || [])], { type: 'text/csv;charset=utf-8' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `visitors-${tab}-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(a.href);
      })
      .catch(() => {});
  }

  if (!authed) {
    return (
      <div className="page">
        <div className="topbar">
          <span className="hname">🏥 {t('admin_title')}</span>
          <LangSwitch />
        </div>
        <PinGate onOk={() => setAuthed(true)} />
      </div>
    );
  }

  return (
    <div className="page">
      <div className="topbar">
        <span className="hname">🏥 {t('admin_title')} {busy ? '' : '· ' + t('live')}</span>
        <div className="topbar-right">
          <LangSwitch />
          <Link className="ghost small" to="/print-qr" target="_blank">
            🖨 {t('print_qr')}
          </Link>
          <button className="ghost small" onClick={() => { clearPin(); setAuthed(false); }}>
            🔒 {t('pin_locked')}
          </button>
        </div>
      </div>

      {stats && (
        <div className="stat-grid">
          <div className="stat"><div className="num">{stats.in_now}</div><div className="cap">{t('stat_in')}</div></div>
          <div className="stat"><div className="num">{stats.today_total}</div><div className="cap">{t('stat_today')}</div></div>
          <div className="stat"><div className="num">{stats.out_today}</div><div className="cap">{t('stat_out')}</div></div>
          <div className="stat"><div className="num">{stats.auto_today}</div><div className="cap">{t('stat_auto')}</div></div>
        </div>
      )}

      <div className="tabs no-print">
        {[['inside', t('tab_inside')], ['today', t('tab_today')], ['history', t('tab_history')]].map(([k, l]) => (
          <button key={k} className={'tab' + (tab === k ? ' on' : '')} onClick={() => setTab(k)}>
            {l}
          </button>
        ))}
      </div>

      <div className="searchrow no-print">
        <input value={qInput} onChange={(e) => setQInput(e.target.value)} placeholder={t('search_ph')} />
        <select value={purpose} onChange={(e) => setPurpose(e.target.value)}>
          <option value="">{t('all')}</option>
          {PURPOSES.map((p) => (
            <option key={p} value={p}>{t(p)}</option>
          ))}
        </select>
        <button className="ghost" onClick={exportCsv}>⬇ {t('export_csv')}</button>
      </div>

      <div className="table-wrap card">
        {rows.length === 0 ? (
          <p className="sub center">{t('none_found')}</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>{t('col_name')}</th>
                <th>{t('col_phone')}</th>
                <th>{t('col_purpose')}</th>
                <th>{t('col_details')}</th>
                <th>{t('col_in')}</th>
                <th>{t('col_out')}</th>
                <th className="no-print">{t('col_action')}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>
                    {r.name}
                    {r.mode === 'staff' && <em className="tag">{t('staff_badge')}</em>}
                  </td>
                  <td className="mono">{r.phone}</td>
                  <td>{t(r.purpose) || r.purpose}</td>
                  <td>
                    {[r.patient_name, r.ward_bed, r.appointment_no ? '#' + r.appointment_no : '', r.department]
                      .filter(Boolean)
                      .join(' · ')}
                  </td>
                  <td>
                    {fmtTime(r.checked_in_at)}
                    <div className="ago">
                      {r.checked_out_at ? '' : fmtAgo(r.checked_in_at)}
                    </div>
                  </td>
                  <td>
                    {r.checked_out_at ? (
                      <>
                        {fmtTime(r.checked_out_at)}
                        <div className="ago">{t('type_' + (r.checkout_type || 'manual'))}</div>
                      </>
                    ) : (
                      <span className="dot-in">●</span>
                    )}
                  </td>
                  <td className="no-print">
                    {!r.checked_out_at && (
                      <button className="out-btn" onClick={() => out(r)}>
                        {t('checkout_short')}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <p className="sub">
        {fmtDT(new Date().toISOString())}
      </p>
    </div>
  );
}
