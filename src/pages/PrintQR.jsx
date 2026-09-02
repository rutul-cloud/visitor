import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { useLang } from '../i18n';
import { getConfig } from '../api';

export default function PrintQR() {
  const { t } = useLang();
  const [cfg, setCfg] = useState(null);
  const [urls, setUrls] = useState({ self: '', kiosk: '' });

  useEffect(() => {
    getConfig().then(setCfg).catch(() => {});
    const base = window.location.origin;
    QRCode.toDataURL(base + '/', { width: 560, margin: 2, color: { dark: '#0f172a', light: '#ffffff' } })
      .then((u) => setUrls((s) => ({ ...s, self: u })))
      .catch(() => {});
    QRCode.toDataURL(base + '/kiosk', { width: 560, margin: 2, color: { dark: '#0f172a', light: '#ffffff' } })
      .then((u) => setUrls((s) => ({ ...s, kiosk: u })))
      .catch(() => {});
  }, []);

  return (
    <div className="page print-page">
      <div className="topbar">
        <span className="hname">🏥 {cfg?.hospitalName || ''}</span>
        <button className="primary small no-print" onClick={() => window.print()}>
          🖨 {t('print_btn')}
        </button>
      </div>
      <h1 className="center">{t('print_qr_title')}</h1>
      <div className="qr-grid">
        <div className="qr-card">
          <img src={urls.self} alt="Self check-in QR" />
          <div className="qr-title">{t('print_qr_self')}</div>
          <div className="qr-url mono">{window.location.origin}/</div>
        </div>
        <div className="qr-card">
          <img src={urls.kiosk} alt="Kiosk QR" />
          <div className="qr-title">{t('print_qr_kiosk')}</div>
          <div className="qr-url mono">{window.location.origin}/kiosk</div>
        </div>
      </div>
    </div>
  );
}
