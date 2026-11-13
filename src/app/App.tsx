import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { ThemeProvider } from './providers/ThemeProvider';
import { PwaProvider } from '../features/pwa/providers/PwaProvider';

export function App() {
  return <ThemeProvider><PwaProvider><RouterProvider router={router} /></PwaProvider></ThemeProvider>;
}
