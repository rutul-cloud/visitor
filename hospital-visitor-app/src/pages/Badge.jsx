import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useLang, fmtTime, fmtAgo } from '../i18n';
import { getVisitor, checkout, getConfig } from '../api';
import { haversineM } from '../geo';
import LangSwitch from '../components/LangSwitch';

export default function Badge() {
  const { code } = useParams();
  const { t } = useLang();
  const [v, setV] = useState(null);
  const [cfg, setCfg] = useState(null);
  const [loadErr, setLoadErr] = useState(false);
  const [geo, setGeo] = useState(null); // {state:'on'|'denied'|'unsupported', dist}
  const [, tick] = useState(0);
  const outsideRef = useRef(0);

  async function load() {
    try {
      setV(await getVisitor(code));
      setLoadErr(false);
    } catch {
      setLoadErr(true);
    }
  }

  useEffect(() => {
    load();
    getConfig().then(setCfg).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  // re-render every 30s so "time in" stays fresh
  useEffect(() => {
    if (!v || v.checked_out_at) return;
    const id = setInterval(() => tick((x) => x + 1), 30000);
    return () => clearInterval(id);
  }, [v]);

  // geofence + timeout watcher
  useEffect(() => {
    if (!v || v.checked_out_at || !cfg) return;

    const timeoutMs = (cfg.timeoutHours || 3) * 3600 * 1000;
    if (Date.now() - new Date(v.checked_in_at).getTime() > timeoutMs) {
      doOut('timeout');
      return;
    }
    if (typeof navigator.geolocation === 'undefined') {
      setGeo({ state: 'unsupported' });
      return;
    }

    let cancelled = false;
    setGeo({ state: 'on' });
    outsideRef.current = 0;
    const id = navigator.geolocation.watchPosition(
      async (pos) => {
        if (cancelled) return;
        const { latitude: lat, longitude: lng } = pos.coords;
        const dist = haversineM(lat, lng, cfg.lat, cfg.lng);
        setGeo({ state: 'on', dist });
        if (dist > (cfg.radiusM || 100)) {
          outsideRef.current += 1;
          // two consecutive fixes outside => really left (avoids GPS jitter at the gate)
          if (outsideRef.current >= 2) {
            cancelled = true;
            await doOut('geofence', { lat, lng });
          }
        } else {
          outsideRef.current = 0;
        }
      },
      () => {
        if (!cancelled) {
          outsideRef.current = 0;
          setGeo({ state: 'denied' });
        }
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 }
    );
    return () => {
      cancelled = true;
      try {
        navigator.geolocation.clearWatch(id);
      } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [v?.id, v?.checked_out_at, cfg]);

  async function doOut(type, geoPos) {
    try {
      const r = await checkout(code, type, geoPos);
      setV(r.visitor || r);
    } catch {}
  }

  if (loadErr) {
    return (
      <div className="page narrow">
        <div className="topbar">
          <span className="hname">🏥</span>
          <LangSwitch />
        </div>
        <div className="card center">
          <p>{t('invalid_badge')}</p>
          <Link className="primary" to="/">
            {t('reload')}
          </Link>
        </div>
      </div>
    );
  }
  if (!v) {
    return (
      <div className="page narrow">
        <div className="topbar">
          <span className="hname">🏥</span>
          <LangSwitch />
        </div>
        <div className="card center">…</div>
      </div>
    );
  }

  const inHouse = !v.checked_out_at;
  const purposeLabel = t(v.purpose) || v.purpose;
  let detail = '';
  if (v.purpose === 'ipd') detail = [v.patient_name, v.ward_bed].filter(Boolean).join(' · ');
  else if (v.purpose === 'opd') detail = [v.patient_name, v.appointment_no ? '#' + v.appointment_no : ''].filter(Boolean).join(' · ');
  else if (v.purpose === 'office') detail = v.department || '';

  const geoNote =
    geo?.state === 'on'
      ? t('tracking_on') +
        (typeof geo.dist === 'number' ? `  (${Math.round(geo.dist)} m ${t('away')})` : '')
      : geo?.state === 'denied'
      ? t('tracking_denied')
      : geo?.state === 'unsupported'
      ? t('tracking_unsupported')
      : '';

  return (
    <div className="page narrow">
      <div className="topbar">
        <span className="hname">🏥 {cfg?.hospitalName || 'Hospital'}</span>
        <LangSwitch />
      </div>

      <div className={'badge-card ' + (inHouse ? 'in' : 'out')}>
        <div className="badge-status-row">
          <span className={'status ' + (inHouse ? 'in' : 'out')}>
            {inHouse ? '🟢 ' + t('status_in') : '⚪ ' + t('status_out')}
          </span>
          <span className="badge-code">{v.code}</span>
        </div>
        <div className="badge-name">{v.name}</div>
        <div className="badge-rows">
          <div>
            <span className="lbl">{t('code')}</span>
            <span className="val mono">{v.code}</span>
          </div>
          <div>
            <span className="lbl">{t('purpose_label')}</span>
            <span className="val">{purposeLabel}</span>
          </div>
          {detail && (
            <div>
              <span className="lbl">{t('visiting')}</span>
              <span className="val">{detail}</span>
            </div>
          )}
          <div>
            <span className="lbl">{t('checked_in_at')}</span>
            <span className="val">{fmtTime(v.checked_in_at)}</span>
          </div>
          {inHouse && (
            <div>
              <span className="lbl">{t('time_in')}</span>
              <span className="val">{fmtAgo(v.checked_in_at)}</span>
            </div>
          )}
        </div>

        {inHouse ? (
          <>
            {geoNote && <div className={'tracking-note ' + (geo.state === 'on' ? 'ok' : 'warn')}>{geoNote}</div>}
            <button className="primary" onClick={() => doOut('manual')}>
              {t('checkout_btn')}
            </button>
          </>
        ) : (
          <>
            <div className="out-reason">
              {t('type_' + (v.checkout_type || 'manual'))} · {fmtTime(v.checked_out_at)}
            </div>
            <p className="done-line">{t('checkout_done')}</p>
          </>
        )}
      </div>

      {inHouse && <p className="tip">{t('add_home')}</p>}
    </div>
  );
}
