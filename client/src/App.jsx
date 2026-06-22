import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { TeachersProvider } from './context/TeachersContext';
import { ClassroomsProvider } from './context/ClassroomsContext';
import CalendarPage from './components/Calendar/CalendarPage';
import SchedulePage from './components/Schedule/SchedulePage';

function App() {
  return (
    <TeachersProvider>
      <ClassroomsProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<CalendarPage />} />
            <Route path="/schedule/:date" element={<SchedulePage />} />
          </Routes>
        </BrowserRouter>
      </ClassroomsProvider>
    </TeachersProvider>
  );
}

export default App;
