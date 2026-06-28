import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import AppHeader from '../common/AppHeader';
import TeacherScheduleGrid from './TeacherScheduleGrid';
import { buildSlots } from '../../utils/teacherScheduleStates';
import './TeachersView.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function TeacherResultPage() {
  const { teacherId, date } = useParams();
  const [scheduleData, setScheduleData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/schedule/${date}/teacher/${teacherId}`
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const slots = buildSlots(data.blocks);
        setScheduleData({ teacherName: data.teacherName, date: data.date, slots });
      } catch {
        setError('Could not load schedule. Please go back and try again.');
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [teacherId, date]);

  return (
    <>
      <AppHeader />
      <main className="tv-result-page">
        <Link to="/teachers-view" className="back-link">‹ Back</Link>

        {isLoading && (
          <p className="tv-result-loading">Loading…</p>
        )}

        {error && (
          <p className="tv-error" role="alert">{error}</p>
        )}

        {scheduleData && (
          <div className="tv-result-card surface-card">
            <div className="tv-grid-wrapper">
              <TeacherScheduleGrid
                teacherName={scheduleData.teacherName}
                slots={scheduleData.slots}
              />
            </div>
          </div>
        )}
      </main>
    </>
  );
}
