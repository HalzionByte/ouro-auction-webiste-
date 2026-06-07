import { createBrowserRouter } from 'react-router';
import { RootLayout } from './layouts/RootLayout';
import { Homepage } from './pages/Homepage';
import { AuctionDetailPage } from './pages/AuctionDetailPage';
import { UserDashboard } from './pages/UserDashboard';
import { CreateAuctionPage } from './pages/CreateAuctionPage';
import { RegisterPage } from './pages/RegisterPage';
import { LoginPage } from './pages/LoginPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminDashboard } from './pages/AdminDashboard';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: RootLayout,
    children: [
      {
        index: true,
        Component: Homepage,
      },
      {
        path: 'auction/:id',
        Component: AuctionDetailPage,
      },
      {
        path: 'dashboard',
        Component: UserDashboard,
      },
      {
        path: 'create-auction',
        Component: CreateAuctionPage,
      },
      {
        path: 'register',
        Component: RegisterPage,
      },
      {
        path: 'login',
        Component: LoginPage,
      },
      {
        path: 'profile',
        Component: ProfilePage,
      },
      {
        path: 'admin',
        Component: AdminDashboard,
      },
    ],
  },
]);
