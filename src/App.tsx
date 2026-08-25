import { createHashRouter, Navigate, RouterProvider } from 'react-router-dom';
import { AppShell } from '@/components/AppShell';
import { ModuleSequenceProvider } from '@/course/ModuleSequenceContext';
import { COURSE_MODULES } from '@/course/modules';
import HomePage from '@/pages/HomePage';

const router = createHashRouter([
  {
    element: <AppShell />,
    children: [
      { index: true, element: <HomePage /> },
      ...COURSE_MODULES.map((module, index) => ({
        path: `modules/${module.slug}`,
        element: (
          <ModuleSequenceProvider
            previous={COURSE_MODULES[index - 1]}
            next={COURSE_MODULES[index + 1]}
          >
            <module.Component module={module} />
          </ModuleSequenceProvider>
        ),
      })),
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
