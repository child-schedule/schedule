import { Link } from 'react-router-dom';
import './LandingPage.css';

const BOXES = [
  {
    label: 'Teachers View',
    sublabel: "Look up a teacher's day",
    icon: '👩‍🏫',
    accent: 'teal',
    path: '/teachers-view',
  },
  {
    label: 'Classroom View',
    sublabel: "See what's happening in a room",
    icon: '🏫',
    accent: 'indigo',
    path: '/classroom-view',
  },
  {
    label: 'Dashboard',
    sublabel: 'Build and manage the schedule',
    icon: '📅',
    accent: 'amber',
    path: '/dashboard',
  },
];

export default function LandingPage() {
  return (
    <div className="landing-page">
      <h1 className="landing-title">Childcare Care Center</h1>
      <p className="landing-subtitle">Select a view to get started</p>
      <nav className="landing-boxes" aria-label="Main navigation">
        {BOXES.map(({ label, sublabel, icon, accent, path }) => (
          <Link
            key={path}
            to={path}
            className={`landing-box ${accent}`}
            aria-label={`${label} — ${sublabel}`}
          >
            <span className="box-icon" aria-hidden="true">{icon}</span>
            <span className="box-label">{label}</span>
            <span className="box-sublabel">{sublabel}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
