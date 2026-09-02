import { useState } from 'react';
import { useLang } from '../i18n';
import { checkin, normalizePhone } from '../api';

const PURPOSES = ['opd', 'ipd', 'office', 'other'];

export default function VisitorForm({ mode, onDone }) {
  const { t } = useLang();
  const [f, setF] = useState({
    name: '',
    phone: '',
    purpose: '',
    patientName: '',
    appointmentNo: '',
    wardBed: '',
    department: '',
    consent: false,
  });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const up = (k, v) => setF((s) => ({ ...s, [k]: v }));

  function valid() {
    if (f.name.trim().length < 2) return t('err_name');
    if (!/^[6-9]\d{9}$/.test(normalizePhone(f.phone))) return t('err_phone');
    if (!f.purpose) return t('err_purpose');
    if (!f.consent) return t('err_consent');
    return '';
  }

  async function submit(e) {
    e.preventDefault();
    const v = valid();
    if (v) {
      setErr(v);
      return;
    }
    setErr('');
    setBusy(true);
    try {
      const visitor = await checkin({
        name: f.name.trim(),
        phone: normalizePhone(f.phone),
        purpose: f.purpose,
        patientName: f.patientName.trim(),
        appointmentNo: f.appointmentNo.trim(),
        wardBed: f.wardBed.trim(),
        department: f.department.trim(),
        consent: true,
        mode,
      });
      onDone(visitor);
    } catch (ex) {
      setErr(t('err_server'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="form" onSubmit={submit} noValidate>
      {err && <div className="err">{err}</div>}

      <label className="field">
        <span>{t('name')} *</span>
        <input
          value={f.name}
          onChange={(e) => up('name', e.target.value)}
          placeholder={t('name_ph')}
          maxLength={80}
          autoComplete="name"
        />
      </label>

      <label className="field">
        <span>{t('phone')} *</span>
        <input
          value={f.phone}
          onChange={(e) => up('phone', e.target.value)}
          placeholder={t('phone_ph')}
          inputMode="tel"
          maxLength={14}
          autoComplete="tel"
        />
      </label>

      <fieldset className="field">
        <legend>{t('purpose')} *</legend>
        <div className="purpose-grid">
          {PURPOSES.map((p) => (
            <button
              type="button"
              key={p}
              className={'pill' + (f.purpose === p ? ' on' : '')}
              onClick={() => up('purpose', p)}
            >
              {t(p)}
            </button>
          ))}
        </div>
      </fieldset>

      {(f.purpose === 'opd' || f.purpose === 'ipd') && (
        <label className="field">
          <span>{t('patient_name')}</span>
          <input
            value={f.patientName}
            onChange={(e) => up('patientName', e.target.value)}
            maxLength={80}
          />
        </label>
      )}
      {f.purpose === 'opd' && (
        <label className="field">
          <span>{t('appointment_no')}</span>
          <input
            value={f.appointmentNo}
            onChange={(e) => up('appointmentNo', e.target.value)}
            maxLength={40}
          />
        </label>
      )}
      {f.purpose === 'ipd' && (
        <label className="field">
          <span>{t('ward_bed')}</span>
          <input
            value={f.wardBed}
            onChange={(e) => up('wardBed', e.target.value)}
            maxLength={40}
          />
        </label>
      )}
      {f.purpose === 'office' && (
        <label className="field">
          <span>{t('department')}</span>
          <input
            value={f.department}
            onChange={(e) => up('department', e.target.value)}
            maxLength={80}
          />
        </label>
      )}

      <label className="consent">
        <input
          type="checkbox"
          checked={f.consent}
          onChange={(e) => up('consent', e.target.checked)}
        />
        <span>{t('consent')}</span>
      </label>

      <button className="primary" disabled={busy}>
        {busy ? t('submitting') : t('submit')}
      </button>
    </form>
  );
}
