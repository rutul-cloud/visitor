// English + Gujarati strings
import { useState } from 'react';

export const DICT = {
  en: {
    app_name: 'Hospital Visitor',
    checkin_title: 'Visitor Check-In',
    checkin_sub: 'Enter your details to get your digital visitor badge.',
    staff_link: 'Gate staff? Open tablet mode',
    name: 'Full Name',
    name_ph: 'e.g. Rameshbhai Patel',
    phone: 'Mobile Number',
    phone_ph: '10-digit mobile number',
    purpose: 'Reason for visit',
    opd: 'OPD Consultation',
    ipd: 'Visit IPD Patient',
    office: 'Office Work',
    other: 'Other',
    patient_name: 'Patient Name',
    appointment_no: 'Appointment / Reg. No.',
    ward_bed: 'Ward / Bed No.',
    department: 'Department / Person to meet',
    consent: 'I agree that my details may be stored for 90 days for hospital visitor management.',
    submit: 'Get My Badge',
    submitting: 'Saving…',
    err_name: 'Please enter your name.',
    err_phone: 'Please enter a valid 10-digit Indian mobile number.',
    err_purpose: 'Please select a reason for your visit.',
    err_consent: 'Please tick the consent box to continue.',
    err_server: 'Something went wrong. Please try again.',
    thanks_title: 'You are checked in!',
    thanks_sub: 'Show this badge at the gate. You may now enter the hospital.',
    add_home: 'Tip: from the browser menu, choose “Add to Home Screen” to keep this badge handy.',
    badge: 'Visitor Badge',
    code: 'Badge No.',
    checked_in_at: 'Checked in',
    purpose_label: 'Purpose',
    visiting: 'Visiting',
    time_in: 'Time in hospital',
    status_in: 'In hospital',
    status_out: 'Checked out',
    checkout_btn: 'Check Out Now',
    checkout_done: 'Thank you for visiting. You have been checked out.',
    type_manual: 'Manual',
    type_geofence: 'Auto — left hospital area',
    type_timeout: 'Auto — 3 hour limit',
    tracking_on: 'Auto check-out is ON. You will be checked out automatically when you leave the hospital area (100 m).',
    tracking_denied: 'Location is off on this phone, so auto check-out cannot work. Please tap “Check Out Now” when you leave.',
    tracking_unsupported: 'This browser does not support location. Please tap “Check Out Now” when you leave.',
    away: 'from hospital',
    invalid_badge: 'This badge link is not valid. If you were checked in at the gate, please ask the front desk.',
    reload: 'Try again',
    kiosk_title: 'Staff Check-In',
    kiosk_sub: 'For gate staff — check in visitors on this tablet.',
    pin_title: 'Staff PIN',
    pin_ph: 'Enter 4-digit PIN',
    pin_btn: 'Unlock',
    pin_wrong: 'Wrong PIN. Try again.',
    pin_locked: 'Lock',
    new_checkin: 'New Check-In',
    inside_now: 'Inside Now',
    next_visitor: 'Done — next visitor',
    staff_done_sub: 'Visitor may enter. Show this screen if the visitor has no phone.',
    admin_title: 'Visitor Dashboard',
    stat_in: 'In hospital now',
    stat_today: 'Visitors today',
    stat_out: 'Checked out today',
    stat_auto: 'Auto check-outs today',
    tab_inside: 'Inside now',
    tab_today: 'Today',
    tab_history: 'History',
    search_ph: 'Search by name or phone…',
    all: 'All',
    col_name: 'Name',
    col_phone: 'Phone',
    col_purpose: 'Purpose',
    col_details: 'Details',
    col_in: 'In',
    col_out: 'Out',
    col_action: 'Action',
    checkout_short: 'Out',
    export_csv: 'Export CSV',
    print_qr: 'Print QR codes',
    none_found: 'No visitors found.',
    live: 'Live',
    staff_badge: 'staff',
    print_qr_title: 'QR Codes to Print',
    print_qr_self: 'Self Check-In — put at every entrance',
    print_qr_kiosk: 'Staff Kiosk — for the gate tablet',
    print_btn: 'Print',
    back: 'Back',
  },
  gu: {
    app_name: 'હોસ્પિટલ મહેમાન',
    checkin_title: 'મહેમાન નોંધણી',
    checkin_sub: 'તમારી વિગતો ભરીને તમારો ડિજિટલ મહેમાન પસંદ મેળવો.',
    staff_link: 'ગેટ સ્ટાફ? ટેબ્લેટ મોડ ખોલો',
    name: 'પૂરું નામ',
    name_ph: 'દા.ત. રમેશભાઈ પટેલ',
    phone: 'મોબાઇલ નંબર',
    phone_ph: '10 અંકનો મોબાઇલ નંબર',
    purpose: 'આવવાનું કારણ',
    opd: 'OPD પરીક્ષણ',
    ipd: 'IPD દર્દી મુલાકાત',
    office: 'ઓફિસ કામ',
    other: 'અન્ય',
    patient_name: 'દર્દીનું નામ',
    appointment_no: 'એપોઇન્ટમેન્ટ / રજિસ્ટ્રેશન નં.',
    ward_bed: 'વ્હાર્ડ / બેડ નં.',
    department: 'વિભાગ / કોને મળવા?',
    consent: 'હોસ્પિટલ મહેમાન વ્યવસ્થા માટે મારી વિગતો 90 દિવસ સુધી સાચવી શકાય તેની હું સંમત છું.',
    submit: 'મારો પસંદ મેળવો',
    submitting: 'સાચવું છે…',
    err_name: 'કૃપા કરીને તમારું નામ લખો.',
    err_phone: 'કૃપા કરીને સાચો 10 અંકનો મોબાઇલ નંબર લખો.',
    err_purpose: 'કૃપા કરીને આવવાનું કારણ પસંદ કરો.',
    err_consent: 'આગળ વધવા માટે કૃપા કરીને સંમતિ ટિક કરો.',
    err_server: 'કંઈક ખોટું થઈ ગયું. કૃપા કરીને ફરી પ્રયાસ કરો.',
    thanks_title: 'તમારી નોંધણી થઈ ગઈ!',
    thanks_sub: 'આ પસંદ ગેટ પર બતાવો. તમે હવે હોસ્પિટલમાં અંદર આવી શકો છો.',
    add_home: 'ટીપ: બ્રાઉઝર મેનુમાંથી “હોમ સ્ક્રીન પર ઉમેરો” પસંદ કરીને પસંદ હાથપકડમાં રાખો.',
    badge: 'મહેમાન પસંદ',
    code: 'પસંદ નંબર',
    checked_in_at: 'આવેલો સમય',
    purpose_label: 'કારણ',
    visiting: 'મુલાકાત',
    time_in: 'હોસ્પિટલમાં સમય',
    status_in: 'હોસ્પિટલમાં છો',
    status_out: 'ચેક આઉટ થઈ ગયું',
    checkout_btn: 'હમણાં ચેક આઉટ કરો',
    checkout_done: 'મુલાકાત માટે આભાર. તમારો ચેક આઉટ થઈ ગયો છે.',
    type_manual: 'હાથથી',
    type_geofence: 'સ્વચ્છલ — હોસ્પિટલ વિસ્તાર બહાર',
    type_timeout: 'સ્વચ્છલ — 3 કલાક',
    tracking_on: 'સ્વચ્છલ ચેક આઉટ ચાલુ છે. તમે હોસ્પિટલ વિસ્તાર (100 મીટર) બહાર જાઓ એટલે આપમેળે ચેક આઉટ થઈ જશો.',
    tracking_denied: 'આ ફોન પર લોકેશન બંધ છે, તેથી સ્વચ્છલ ચેક આઉટ શક્ય નથી. તમે જાય ત્યારે “ચેક આઉટ” દબાવો.',
    tracking_unsupported: 'આ બ્રાઉઝર લોકેશન સમર્થિત કરતો નથી. તમે જાય ત્યારે “ચેક આઉટ” દબાવો.',
    away: 'હોસ્પિટલથી',
    invalid_badge: 'આ લિંક સાચો નથી. જો તમે ગેટ પર નોંધાયેલા હો, તો કૃપા કરીને ફ્રન્ટ ડેસ્ક પૂછો.',
    reload: 'ફરી પ્રયાસ કરો',
    kiosk_title: 'સ્ટાફ ચેક-ઇન',
    kiosk_sub: 'ગેટ સ્ટાફ માટે — આ ટેબ્લેટ પર મહેમાન નોંધો.',
    pin_title: 'સ્ટાફ PIN',
    pin_ph: '4 અંકનો PIN દાખલ કરો',
    pin_btn: 'ખોલો',
    pin_wrong: 'ખોટો PIN. ફરી પ્રયાસ કરો.',
    pin_locked: 'લૉક કરો',
    new_checkin: 'નવી નોંધણી',
    inside_now: 'હાલમાં અંદર',
    next_visitor: 'બન્યું — આગલા મહેમાન',
    staff_done_sub: 'મહેમાન અંદર આવી શકે. જો મહેમાન પાસે ફોન ન હોય તો આ સ્ક્રીન બતાવો.',
    admin_title: 'મહેમાન ડેશબોર્ડ',
    stat_in: 'હાલમાં હોસ્પિટલમાં',
    stat_today: 'આજની મુલાકાતો',
    stat_out: 'આજે ચેક આઉટ',
    stat_auto: 'આજે સ્વચ્છલ ચેક આઉટ',
    tab_inside: 'હાલમાં અંદર',
    tab_today: 'આજે',
    tab_history: 'ઇતિહાસ',
    search_ph: 'નામ કે ફોનથી શોધો…',
    all: 'બધું',
    col_name: 'નામ',
    col_phone: 'ફોન',
    col_purpose: 'કારણ',
    col_details: 'વિગતો',
    col_in: 'આવ્યા',
    col_out: 'ગયા',
    col_action: 'ક્રિયા',
    checkout_short: 'બહાર',
    export_csv: 'CSV ડાઉનલોડ',
    print_qr: 'QR પ્રિન્ટ કરો',
    none_found: 'કોઈ મહેમાન મળ્યા નથી.',
    live: 'લાઇવ',
    staff_badge: 'સ્ટાફ',
    print_qr_title: 'પ્રિન્ટ કરવા માટે QR કોડ',
    print_qr_self: 'સેલ્ફ ચેક-ઇન — દરેક પ્રવેશદ્વાર પર લગાવો',
    print_qr_kiosk: 'સ્ટાફ કિઓસ્ક — ગેટ ટેબ્લેટ માટે',
    print_btn: 'પ્રિન્ટ',
    back: 'પાછળ',
  },
};

const LANG_KEY = 'hv_lang';

function readLang() {
  try {
    return localStorage.getItem(LANG_KEY) || 'en';
  } catch {
    return 'en';
  }
}

export function useLang() {
  const [lang, setLang] = useState(readLang);
  const t = (k) => DICT[lang]?.[k] ?? DICT.en[k] ?? k;
  const set = (l) => {
    try {
      localStorage.setItem(LANG_KEY, l);
    } catch {}
    setLang(l);
  };
  return { lang, set, t };
}

export function fmtTime(iso) {
  try {
    return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

export function fmtDT(iso) {
  try {
    return new Date(iso).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}

export function fmtAgo(iso) {
  const s = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  if (h > 0) return `${h}h ${m % 60}m`;
  if (m > 0) return `${m}m`;
  return `${s}s`;
}
