import { createBrowserRouter, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import AuthLayout from './components/Auth/AuthLayout';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Feed from './pages/Feed';
import People from './pages/People';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import Welcome from './pages/Welcome';
import ErrorBoundary from './components/ErrorBoundary';
import ChatInterface from './components/ChatInterface';
import CommunityRooms from './pages/CommunityRooms';
import Basecamp from './pages/Basecamp';
import Support from './pages/Support';
import Notifications from './pages/Notifications';
import AdminPanel from './pages/AdminPanel';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Welcome />,
  },
  {
    path: '/app',
    element: <Layout />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        index: true,
        element: <ProtectedRoute><Feed /></ProtectedRoute>,
      },
      {
        path: 'feed',
        element: <ProtectedRoute><Feed /></ProtectedRoute>,
      },
      {
        path: 'goals',
        element: <ProtectedRoute><Basecamp /></ProtectedRoute>,
      },
      {
        path: 'people', // Теперь это главная страница для поиска напарников
        element: <ProtectedRoute><People /></ProtectedRoute>,
      },
      {
        path: 'support',
        element: <ProtectedRoute><Support /></ProtectedRoute>,
      },
      {
        path: 'profile',
        element: <ProtectedRoute><Profile /></ProtectedRoute>,
      },
      {
        path: 'profile/:id', // Динамический роут для просмотра других
        element: <ProtectedRoute><Profile /></ProtectedRoute>,
      },
      {
        path: 'admin', // Обязательная страница по ТЗ
        element: <ProtectedRoute><AdminPanel /></ProtectedRoute>,
      },
      {
        path: 'notifications',
        element: <ProtectedRoute><Notifications /></ProtectedRoute>,
      },
      {
        path: 'chats',
        element: <ProtectedRoute><CommunityRooms /></ProtectedRoute>,
      },
      {
        path: 'chats/:roomId',
        element: <ProtectedRoute><ChatInterface /></ProtectedRoute>,
      },
      // Старые ссылки теперь ведут на список людей
      {
        path: 'collab',
        element: <Navigate to="/app/people" replace />,
      },
      {
        path: 'collab/:id',
        element: <Navigate to="/app/people" replace />,
      },
    ],
  },
  {
    path: '/auth',
    element: <AuthLayout />,
    errorElement: <ErrorBoundary />,
    children: [
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> },
    ],
  },
  { path: '/login', element: <Navigate to="/auth/login" replace /> },
  { path: '/register', element: <Navigate to="/auth/register" replace /> },
  { path: '*', element: <NotFound /> },
]);