import React from 'react';
import { C } from '../../constants/design';

export default function MobileTabBar({
  activeTab,
  setActiveTab,
  setShowSettings,
  quizMode = false,
}) {
  return (
    <nav style={{
      display: 'flex', height: 64, borderTop: '1px solid rgba(255,255,255,0.08)',
      background: 'rgba(20, 10, 31, 0.92)', backdropFilter: 'blur(20px)',
      position: 'relative', zIndex: 110, flexShrink: 0,
    }}>
      {[
        { id: 'filters', label: 'Filtres', icon: '📑' },
        { id: 'jeu',     label: 'Jeu',     icon: '🎮' },
        { id: 'scores',  label: 'Scores',  icon: '🏆' },
        { id: 'settings', label: 'Réglages', icon: '⚙️' },
      ].map(t => {
        const active = activeTab === t.id;
        const isFiltersLocked = t.id === 'filters' && quizMode;
        const displayIcon = isFiltersLocked ? '🔒' : t.icon;
        const displayLabel = isFiltersLocked ? 'Bloqué' : t.label;

        return (
          <button
            key={t.id}
            onClick={() => {
              if (isFiltersLocked) {
                alert("Le quiz est en cours. Veuillez d'abord arrêter le quiz pour modifier la configuration.");
                return;
              }
              setActiveTab(t.id);
              if (t.id === 'settings') {
                setShowSettings(true);
              } else {
                setShowSettings(false);
              }
            }}
            className="no-tap-highlight"
            style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              background: 'none', border: 'none', 
              cursor: isFiltersLocked ? 'not-allowed' : 'pointer', 
              gap: 4,
              color: active ? C.sky : 'rgba(251,243,238,0.45)',
              opacity: isFiltersLocked ? 0.35 : 1,
              transition: 'all 0.2s',
              touchAction: 'manipulation',
            }}
          >
            <span style={{ fontSize: 20, transform: active ? 'scale(1.15)' : 'scale(1)', transition: 'transform 0.2s' }}>{displayIcon}</span>
            <span style={{
              fontSize: 10, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif",
              letterSpacing: '0.02em',
            }}>{displayLabel}</span>
          </button>
        );
      })}
    </nav>
  );
}
