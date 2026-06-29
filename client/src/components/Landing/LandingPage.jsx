import { Link } from 'react-router-dom';
import './LandingPage.css';

const BOXES = [
  {
    label: 'Teachers View',
    sublabel: "Look up a teacher's day",
    accent: 'teal',
    path: '/teachers-view',
  },
  {
    label: 'Classroom View',
    sublabel: "See what's happening in a room",
    accent: 'indigo',
    path: '/classroom-view',
  },
  {
    label: 'Dashboard',
    sublabel: 'Build and manage the schedule',
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
        {BOXES.map(({ label, sublabel, accent, path }) => (
          <Link
            key={path}
            to={path}
            className={`landing-box ${accent}`}
            aria-label={`${label} — ${sublabel}`}
          >
            <span className="box-label">{label}</span>
            <span className="box-sublabel">{sublabel}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
