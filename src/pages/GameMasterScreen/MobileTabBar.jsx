import React from 'react';
import { C } from '../../constants/theme';

// Réglages n'est volontairement pas un onglet ici : c'est une action occasionnelle,
// pas une zone de jeu au même niveau que Filtres/Jeu/Scores. Elle vit dans le bouton
// ⚙️ flottant (voir GameMasterScreen/index.jsx), accessible depuis n'importe quel onglet.
export default function MobileTabBar({
  activeTab,
  setActiveTab,
}) {
  return (
    <nav style={{
      display: 'flex', height: 64, borderTop: '1px solid rgba(255,255,255,0.08)',
      background: 'rgba(20, 10, 31, 0.92)', backdropFilter: 'blur(20px)',
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 200, flexShrink: 0,
    }}>
      {[
        { id: 'filters', label: 'Filtres', icon: '📑' },
        { id: 'jeu',     label: 'Jeu',     icon: '🎮' },
        { id: 'scores',  label: 'Scores',  icon: '🏆' },
      ].map(t => {
        const active = activeTab === t.id;

        return (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className="no-tap-highlight"
            style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              background: 'none', border: 'none',
              cursor: 'pointer',
              gap: 4,
              color: active ? C.sky : 'rgba(251,243,238,0.45)',
              transition: 'all 0.2s',
              touchAction: 'manipulation',
            }}
          >
            <span style={{ fontSize: 20, transform: active ? 'scale(1.15)' : 'scale(1)', transition: 'transform 0.2s' }}>{t.icon}</span>
            <span style={{
              fontSize: 10, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif",
              letterSpacing: '0.02em',
            }}>{t.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
