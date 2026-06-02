import React, { useState, useEffect } from 'react';
import { GameProvider, useGame } from './context/GameContext';
import WelcomeScreen from './pages/WelcomeScreen';
import PlayerScreen from './pages/PlayerScreen';
import GameMasterScreen from './pages/GameMasterScreen';
import ProjectionScreen from './pages/ProjectionScreen';
import AsyncDuelScreen from './pages/AsyncDuelScreen';

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
      <GameMasterScreen
        onBackToWelcome={() => {
          window.history.pushState({}, '', '/');
          window.dispatchEvent(new Event('popstate'));
        }}
      />
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
    return <AsyncDuelScreen onBackToWelcome={() => setLocalRole(null)} />;
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
