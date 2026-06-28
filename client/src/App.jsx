import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { TeachersProvider } from './context/TeachersContext';
import { ClassroomsProvider } from './context/ClassroomsContext';
import CalendarPage from './components/Calendar/CalendarPage';
import SchedulePage from './components/Schedule/SchedulePage';
import LandingPage from './components/Landing/LandingPage';
import TeachersViewPage from './components/TeachersView/TeachersViewPage';
import TeacherResultPage from './components/TeachersView/TeacherResultPage';
import ClassroomViewPage from './components/ClassroomView/ClassroomViewPage';

function App() {
  return (
    <TeachersProvider>
      <ClassroomsProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/dashboard" element={<CalendarPage />} />
            <Route path="/schedule/:date" element={<SchedulePage />} />
            <Route path="/teachers-view" element={<TeachersViewPage />} />
            <Route path="/teachers-view/:teacherId/:date" element={<TeacherResultPage />} />
            <Route path="/classroom-view" element={<ClassroomViewPage />} />
          </Routes>
        </BrowserRouter>
      </ClassroomsProvider>
    </TeachersProvider>
  );
}

export default App;
