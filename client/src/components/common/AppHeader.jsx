import { Link } from 'react-router-dom';

function AppHeader() {
  return (
    <header className="app-header">
      <Link to="/" className="app-header__logo" aria-label="Go to home">
        <span className="app-header__mark" aria-hidden="true" />
        <span className="app-header__name">Childcare Scheduler</span>
      </Link>
    </header>
  );
}

export default AppHeader;
