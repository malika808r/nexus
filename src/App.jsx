import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { useAppStore } from './store/store';
import { router } from './routes';
import { ToastProvider } from './components/ui/Toast';

export default function App() {
  const { isInitializing, checkAuth, initTheme } = useAppStore();

  useEffect(() => {
    initTheme();
    checkAuth();
  }, []);

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center w-screen h-screen" style={{ backgroundColor: 'var(--bg-base)' }}>
        <div className="w-8 h-8 rounded-full border-2 border-muted-foreground/10 border-t-pink-500 animate-spin" />
      </div>
    );
  }

  return (
    <ToastProvider>
      <RouterProvider router={router} />
    </ToastProvider>
  );
}