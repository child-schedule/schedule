import { BrowserRouter, Routes, Route } from 'react-router-dom';
import CalendarPage from './components/Calendar/CalendarPage';
import SchedulePage from './components/Schedule/SchedulePage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CalendarPage />} />
        <Route path="/schedule/:date" element={<SchedulePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
