import { createBrowserRouter, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import AuthLayout from './components/Auth/AuthLayout';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Feed from './pages/Feed';
import CollabSpace from './pages/CollabSpace';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import Welcome from './pages/Welcome';
import ErrorBoundary from './components/ErrorBoundary';
import ChatInterface from './components/ChatInterface';
import CommunityRooms from './pages/CommunityRooms';
import FindCompanion from './components/FindCompanion';
import Basecamp from './pages/Basecamp';
import MapView from './pages/Events';
import Support from './pages/Support';
import Notifications from './pages/Notifications';

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
        path: 'support',
        element: <ProtectedRoute><Support /></ProtectedRoute>,
      },
      {
        path: 'events',
        element: <ProtectedRoute><MapView /></ProtectedRoute>,
      },
      {
        path: 'collab',
        element: <ProtectedRoute><CollabSpace /></ProtectedRoute>,
      },
      {
        path: 'profile',
        element: <ProtectedRoute><Profile /></ProtectedRoute>,
      },
      {
        path: 'profile/:id',
        element: <ProtectedRoute><Profile /></ProtectedRoute>,
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
      {
        path: 'search',
        element: <ProtectedRoute><FindCompanion /></ProtectedRoute>,
      },
    ],
  },
  {
    path: '/auth',
    element: <AuthLayout />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        path: 'login',
        element: <Login />,
      },
      {
        path: 'register',
        element: <Register />,
      },
    ],
  },
  {
    path: '/login',
    element: <Navigate to="/auth/login" replace />,
  },
  {
    path: '/register',
    element: <Navigate to="/auth/register" replace />,
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);