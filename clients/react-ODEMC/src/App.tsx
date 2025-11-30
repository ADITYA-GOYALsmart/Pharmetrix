import type { ReactNode } from 'react';
import { NavigationComponent } from './app/components/navigation/navigation.component';
import './App.scss';

interface AppProps {
  children?: ReactNode;
}
function App({ children }: AppProps) {
  return (
    <div className="app-container">
      <NavigationComponent />
      <main className="app-content">
        {children}
      </main>
    </div>
  );
}

export default App;
