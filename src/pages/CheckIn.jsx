import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLang } from '../i18n';
import { getConfig } from '../api';
import LangSwitch from '../components/LangSwitch';
import VisitorForm from '../components/VisitorForm';

export default function CheckIn() {
  const { t } = useLang();
  const nav = useNavigate();
  const [cfg, setCfg] = useState(null);

  useEffect(() => {
    getConfig().then(setCfg).catch(() => {});
  }, []);

  const hname = cfg?.hospitalName || 'Hospital';

  return (
    <div className="page narrow">
      <div className="topbar">
        <span className="hname">🏥 {hname}</span>
        <LangSwitch />
      </div>
      <div className="card">
        <h1>{t('checkin_title')}</h1>
        <p className="sub">{t('checkin_sub')}</p>
        <VisitorForm mode="self" onDone={(v) => nav(`/badge/${v.code}`)} />
      </div>
      <div className="foot-link">
        <Link to="/kiosk">{t('staff_link')} →</Link>
      </div>
    </div>
  );
}
