import { lazy, Suspense } from 'react';
import { createHashRouter, RouterProvider, Navigate, useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import AppShell from './layouts/AppShell.tsx';

const WelcomePage = lazy(() => import('./pages/WelcomePage.tsx'));
const Topic01IntroPage = lazy(() => import('./pages/Topic01IntroPage.tsx'));
const Topic02AgentsPage = lazy(() => import('./pages/Topic02AgentsPage.tsx'));
const Topic03UninformedPage = lazy(() => import('./pages/Topic03UninformedPage.tsx'));
const Topic04InformedPage = lazy(() => import('./pages/Topic04InformedPage.tsx'));
const Topic05LocalPage = lazy(() => import('./pages/Topic05LocalPage.tsx'));
const Topic06AdversarialPage = lazy(() => import('./pages/Topic06AdversarialPage.tsx'));
const Topic07ConstraintPage = lazy(() => import('./pages/Topic07ConstraintPage.tsx'));
const Topic08ProbabilityPage = lazy(() => import('./pages/Topic08ProbabilityPage.tsx'));
const Topic09HMMPage = lazy(() => import('./pages/Topic09HMMPage.tsx'));
const Topic10ClassificationPage = lazy(() => import('./pages/Topic10ClassificationPage.tsx'));
const Topic11RegressionPage = lazy(() => import('./pages/Topic11RegressionPage.tsx'));
const Topic12ClusteringPage = lazy(() => import('./pages/Topic12ClusteringPage.tsx'));
const MlSetupPage = lazy(() => import('./pages/MlSetupPage.tsx'));

function normalizeLegacyHashUrl() {
  if (typeof window === 'undefined') return;
  const { hash, pathname, search } = window.location;
  const legacyMatch = hash.match(/^#\/([^?#]+)%23([^?#]+)/);

  if (!legacyMatch) return;

  const [, rawPath, rawSection] = legacyMatch;
  const normalizedHash = `#/${rawPath}#${decodeURIComponent(rawSection)}`;
  window.history.replaceState(null, '', `${pathname}${search}${normalizedHash}`);
}

normalizeLegacyHashUrl();

function NotReleasedPage() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center py-32 text-center px-4">
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
        <Lock className="size-7 text-muted-foreground" />
      </div>
      <h2 className="text-xl font-semibold mb-2">Not released yet :)</h2>
      <p className="text-sm text-muted-foreground mb-6 max-w-sm">
        This topic will be available on the day of its lecture. Check back soon!
      </p>
      <button
        onClick={() => navigate('/welcome')}
        className="text-sm font-medium text-primary hover:underline underline-offset-2"
      >
        Back to course map
      </button>
    </div>
  );
}

const router = createHashRouter([
  {
    element: <AppShell />,
    children: [
      { index: true, element: <Navigate to="/welcome" replace /> },
      {
        path: 'welcome',
        element: (
          <Suspense fallback={null}>
            <WelcomePage />
          </Suspense>
        ),
      },
      {
        path: 'topic-01',
        element: (
          <Suspense fallback={null}>
            <Topic01IntroPage />
          </Suspense>
        ),
      },
      {
        path: 'topic-02',
        element: (
          <Suspense fallback={null}>
            <Topic02AgentsPage />
          </Suspense>
        ),
      },
      {
        path: 'topic-03',
        element: (
          <Suspense fallback={null}>
            <Topic03UninformedPage />
          </Suspense>
        ),
      },
      {
        path: 'topic-04',
        element: (
          <Suspense fallback={null}>
            <Topic04InformedPage />
          </Suspense>
        ),
      },
      {
        path: 'topic-05',
        element: (
          <Suspense fallback={null}>
            <Topic05LocalPage />
          </Suspense>
        ),
      },
      {
        path: 'topic-06',
        element: (
          <Suspense fallback={null}>
            <Topic06AdversarialPage />
          </Suspense>
        ),
      },
      {
        path: 'topic-07',
        element: (
          <Suspense fallback={null}>
            <Topic07ConstraintPage />
          </Suspense>
        ),
      },
      {
        path: 'topic-08',
        element: (
          <Suspense fallback={null}>
            <Topic08ProbabilityPage />
          </Suspense>
        ),
      },
      {
        path: 'topic-09',
        element: (
          <Suspense fallback={null}>
            <Topic09HMMPage />
          </Suspense>
        ),
      },
      {
        path: 'topic-10',
        element: (
          <Suspense fallback={null}>
            <Topic10ClassificationPage />
          </Suspense>
        ),
      },
      {
        path: 'topic-11',
        element: (
          <Suspense fallback={null}>
            <Topic11RegressionPage />
          </Suspense>
        ),
      },
      {
        path: 'topic-12',
        element: (
          <Suspense fallback={null}>
            <Topic12ClusteringPage />
          </Suspense>
        ),
      },
      {
        path: 'ml-setup',
        element: (
          <Suspense fallback={null}>
            <MlSetupPage />
          </Suspense>
        ),
      },
      {
        path: '*',
        element: <NotReleasedPage />,
      },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
