import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom';
import { WelcomePage } from './app/pages/welcome/welcome';
import { HomepageComponent } from './app/components/homepage/homepage.component';
import App from './App';

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <App>
        <Outlet />
      </App>
    ),
    errorElement: <Navigate to="/" replace />,
    children: [
      {
        index: true,
        element: <WelcomePage />,
      },
      {
        path: 'home',
        element: <HomepageComponent />,
      },
      // Redirect any unknown routes to the welcome page
      {
        path: '*',
        element: <Navigate to="/" replace />,
      }
    ]
  }
], {
  // Enable strict routing (no trailing slashes)
  basename: '/',
});

export const AppRouter = () => {
  return <RouterProvider router={router} />;
};