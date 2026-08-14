import { Navigate, RouterProvider, createHashRouter } from 'react-router-dom';
import CourseShell from '@/layouts/CourseShell';
import CourseHome from '@/pages/CourseHome';
import Lecture01Page from '@/pages/Lecture01Page';
import Lecture02Page from '@/pages/Lecture02Page';

const router = createHashRouter([{ element: <CourseShell />, children: [
  { index: true, element: <Navigate to="/welcome" replace /> },
  { path: 'welcome', element: <CourseHome /> },
  { path: 'lecture-1', element: <Lecture01Page /> },
  { path: 'lecture-2', element: <Lecture02Page /> },
  { path: '*', element: <Navigate to="/welcome" replace /> },
]}]);

export default function PilotApp() { return <RouterProvider router={router} />; }

