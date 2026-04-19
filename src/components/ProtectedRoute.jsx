import { Navigate } from 'react-router-dom';
import { useAppStore } from '../store/store';

export default function ProtectedRoute({ children }) {
  const user = useAppStore((state) => state.user);

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  return children;
}