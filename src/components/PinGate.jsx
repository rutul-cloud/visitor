import { useState } from 'react';
import { useLang } from '../i18n';
import { setPin } from '../api';

export default function PinGate({ onOk, big = false }) {
  const { t } = useLang();
  const [pin, set] = useState('');
  const [err, setErr] = useState('');

  async function go(e) {
    e.preventDefault();
    try {
      const res = await fetch('/api/pin-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });
      if (!res.ok) throw new Error('bad pin');
      setPin(pin);
      onOk();
    } catch {
      setErr(t('pin_wrong'));
      set('');
    }
  }

  return (
    <form className={'pin-box' + (big ? ' big' : '')} onSubmit={go}>
      <div className="pin-title">🔒 {t('pin_title')}</div>
      <input
        className="pin-input"
        value={pin}
        onChange={(e) => set(e.target.value.replace(/\D/g, '').slice(0, 4))}
        inputMode="numeric"
        autoFocus
        placeholder={t('pin_ph')}
      />
      {err && <div className="err">{err}</div>}
      <button className="primary" type="submit">
        {t('pin_btn')}
      </button>
    </form>
  );
}
