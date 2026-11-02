import DashboardScreen from './pages/DashboardScreen';
import type { ReactNode } from 'react';

export interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
  /** Accessible without login. Routes without this flag require authentication. Has no effect when RouteGuard is not in use. */
  public?: boolean;
}

export const routes: RouteConfig[] = [
  {
    name: '热线诉求大屏',
    path: '/',
    element: <DashboardScreen />,
    public: true,
  },
];
