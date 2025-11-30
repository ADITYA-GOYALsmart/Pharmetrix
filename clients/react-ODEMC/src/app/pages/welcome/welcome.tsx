import { useState } from 'react';
import { useTheme } from '../../services/theme/theme.service';
import reactLogo from '../../../assets/react.svg';
import viteLogo from '/vite.svg';
import './welcome.scss';

export const WelcomePage = () => {
  const [count, setCount] = useState(0);
  const { theme } = useTheme();

  return (
    <div className="welcome-container">
      <div className="logos">
        <a href="https://vite.dev" target="_blank" rel="noreferrer">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank" rel="noreferrer">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      
      <h1>Reactron by @imprakhartripathi</h1>
      <h2>Vite + React + TypeScript</h2>
      
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/app/pages/welcome/welcome.tsx</code> and save to test HMR
        </p>
      </div>
      
      <div className="theme-info">
        <p>Current theme: {theme}</p>
        <p>Use the toggle in the navigation bar to switch themes</p>
      </div>
      
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </div>
  );
};