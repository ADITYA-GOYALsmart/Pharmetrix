import { NavLink } from 'react-router-dom';
import { useTheme } from '../../services/theme/theme.service';
import './navigation.component.scss';

export const NavigationComponent = () => {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <nav className="navigation">
      <div className="navigation-brand">
        <span>Reactron</span>
      </div>
      
      <div className="navigation-links">
        <NavLink 
          to="/" 
          className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
          end
        >
          Welcome
        </NavLink>
        <NavLink 
          to="/home" 
          className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
        >
          Home
        </NavLink>
      </div>
      
      <div className="theme-toggle">
        <button 
          onClick={toggleTheme} 
          className="theme-toggle-button"
          title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
        >
          <span className="toggle-icon">{theme === 'light' ? '🌙' : '☀️'}</span>
          <span className="toggle-text">{theme === 'light' ? 'Dark' : 'Light'}</span>
        </button>
      </div>
    </nav>
  );
};