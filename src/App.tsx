import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import LockerRoom from './pages/LockerRoom';
import Match from './pages/Match';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LockerRoom />} />
        <Route path="/match" element={<Match />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
