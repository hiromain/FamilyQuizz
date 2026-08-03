import React, { useState, useEffect, Suspense, lazy } from 'react';
import { GameProvider, useGame } from './context/GameContext';
import WelcomeScreen from './pages/WelcomeScreen';
import PlayerScreen from './pages/PlayerScreen';
import ProjectionScreen from './pages/ProjectionScreen';
import DotsLoader from './components/ui/DotsLoader';
import { C } from './constants/theme';

// ─── Heavy screens, loaded on demand only ──────────────────────────────────
// Both of these pull in the full question bank (~1MB gzipped). Nobody joining
// as a Player or opening the Projection screen should ever pay that cost, so
// they're code-split and fetched only once someone actually opens the
// Cockpit or a Duel.
const GameMasterScreen = lazy(() => import('./pages/GameMasterScreen'));
const AsyncDuelScreen = lazy(() => import('./pages/AsyncDuelScreen'));

function RouteLoader() {
  return (
    <div style={{
      display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center',
      background: C.bg,
    }}>
      <DotsLoader color={C.coral} />
    </div>
  );
}

// ─── Simple Router Component ──────────────────────────────────────────────
function Router() {
  const [path, setPath] = useState(window.location.pathname);
  // 'player' | 'duel' | null. Default to 'duel' when arriving via a ?duel=CODE share link.
  const [localRole, setLocalRole] = useState(() =>
    new URLSearchParams(window.location.search).get('duel') ? 'duel' : null
  );

  useEffect(() => {
    const handleLocationChange = () => setPath(window.location.pathname);
    window.addEventListener('popstate', handleLocationChange);
    const interval = setInterval(() => {
      if (window.location.pathname !== path) setPath(window.location.pathname);
    }, 200);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      clearInterval(interval);
    };
  }, [path]);

  if (path === '/master' || window.location.hash === '#/master') {
    return (
      <Suspense fallback={<RouteLoader />}>
        <GameMasterScreen
          onBackToWelcome={() => {
            window.history.pushState({}, '', '/');
            window.dispatchEvent(new Event('popstate'));
          }}
        />
      </Suspense>
    );
  }

  if (['/projection', '/screen', '/tv'].includes(path) || ['#/projection', '#/screen', '#/tv'].includes(window.location.hash)) {
    return <ProjectionScreen />;
  }

  const { error } = useGame();

  if (!localRole) {
    return (
      <WelcomeScreen
        error={error}
        onSelectRole={(role) => {
          if (role === 'master') {
            window.history.pushState({}, '', '/master');
            window.dispatchEvent(new Event('popstate'));
          } else if (role === 'duel') {
            setLocalRole('duel');
          } else {
            setLocalRole('player');
          }
        }}
      />
    );
  }

  if (localRole === 'duel') {
    return (
      <Suspense fallback={<RouteLoader />}>
        <AsyncDuelScreen onBackToWelcome={() => setLocalRole(null)} />
      </Suspense>
    );
  }

  return <PlayerScreen onBackToWelcome={() => setLocalRole(null)} />;
}

// ─── App entry point ──────────────────────────────────────────────────────
export default function App() {
  return (
    <GameProvider>
      <Router />
    </GameProvider>
  );
}
