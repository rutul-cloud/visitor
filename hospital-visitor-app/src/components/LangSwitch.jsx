import { useLang } from '../i18n';

export default function LangSwitch() {
  const { lang, set } = useLang();
  return (
    <div className="lang no-print">
      <button type="button" className={lang === 'en' ? 'on' : ''} onClick={() => set('en')}>
        EN
      </button>
      <button type="button" className={lang === 'gu' ? 'on' : ''} onClick={() => set('gu')}>
        ગુજરાતી
      </button>
    </div>
  );
}
