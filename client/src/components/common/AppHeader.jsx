import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function AppHeader() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <header className="app-header">
      <Link to="/" className="app-header__logo" aria-label="Go to home">
        <span className="app-header__mark" aria-hidden="true" />
        <span className="app-header__name">Childcare Scheduler</span>
      </Link>
      <button
        type="button"
        className="app-header__logout"
        onClick={handleLogout}
      >
        Logout
      </button>
    </header>
  );
}

export default AppHeader;
