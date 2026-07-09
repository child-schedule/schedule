import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { TeachersProvider } from './context/TeachersContext';
import { ClassroomsProvider } from './context/ClassroomsContext';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import LoginPage from './components/Auth/LoginPage';
import CalendarPage from './components/Calendar/CalendarPage';
import SchedulePage from './components/Schedule/SchedulePage';

function App() {
  return (
    <AuthProvider>
      <TeachersProvider>
        <ClassroomsProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <CalendarPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/schedule/:date"
                element={
                  <ProtectedRoute>
                    <SchedulePage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </BrowserRouter>
        </ClassroomsProvider>
      </TeachersProvider>
    </AuthProvider>
  );
}

export default App;
