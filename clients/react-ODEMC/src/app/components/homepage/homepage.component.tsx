import { useTheme } from '../../services/theme/theme.service';
import './homepage.component.scss';

export const HomepageComponent = () => {
  const { theme } = useTheme();
  
  return (
    <div className="homepage-container">
      <h1>Homepage Works!</h1>
      <p className="theme-info">Current theme: {theme}</p>
    </div>
  );
};