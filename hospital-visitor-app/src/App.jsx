import { Routes, Route } from 'react-router-dom';
import CheckIn from './pages/CheckIn.jsx';
import Badge from './pages/Badge.jsx';
import Kiosk from './pages/Kiosk.jsx';
import Admin from './pages/Admin.jsx';
import PrintQR from './pages/PrintQR.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<CheckIn />} />
      <Route path="/badge/:code" element={<Badge />} />
      <Route path="/kiosk" element={<Kiosk />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/print-qr" element={<PrintQR />} />
      <Route path="*" element={<CheckIn />} />
    </Routes>
  );
}
