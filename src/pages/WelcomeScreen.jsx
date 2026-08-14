import React, { useState, useEffect } from 'react';
import { C } from '../constants/theme';
import GlassCard from '../components/ui/GlassCard';
import Pill from '../components/ui/Pill';

/** Welcome / Role Selection Screen */
export default function WelcomeScreen({ onSelectRole, error }) {
  const [width, setWidth] = useState(window.innerWidth);
  const [hovered, setHovered] = useState(null); // 'player' | 'master' | 'duel' | null
  const [pendingTurns, setPendingTurns] = useState(() => parseInt(localStorage.getItem('fq_pending_turns') || '0', 10));

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === 'fq_pending_turns') setPendingTurns(parseInt(e.newValue || '0', 10));
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const isMobile = width < 768;
  
  // Touch detection to prevent sticky hover styles on mobile
  const hasTouch = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);
  const canHover = !hasTouch;

  return (
    <div style={{ position: 'fixed', inset: 0, overflowY: 'auto', background: C.bg }}>
      {/* Background Aurora Blobs */}
      <div className="aurora grain" style={{ zIndex: 0, pointerEvents: 'none' }}>
        <i className="blob-3" style={{ pointerEvents: 'none' }} />
        <i className="blob-4" style={{ pointerEvents: 'none' }} />
        <i className="blob-5" style={{ pointerEvents: 'none' }} />
      </div>
      
      <div style={{
        position: 'relative', zIndex: 10, pointerEvents: 'auto',
        display: 'flex', minHeight: '100vh', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center', padding: isMobile ? '24px 16px' : '40px 20px',
      }}>
        
        {/* Header / Logo */}
        <div style={{ textAlign: 'center', marginBottom: isMobile ? 24 : 48, animation: 'pop-in 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)' }}>
          <div style={{
            width: isMobile ? 56 : 72, height: isMobile ? 56 : 72, borderRadius: isMobile ? 18 : 22, margin: '0 auto 16px',
            background: `conic-gradient(from 140deg, ${C.coral}, ${C.amber}, ${C.mint}, ${C.sky}, ${C.coral})`,
            boxShadow: `0 16px 40px -10px ${C.coral}88`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'buzz-breathe 2.5s ease-in-out infinite',
          }}>
            <span style={{ fontSize: isMobile ? 26 : 34 }}>⚡</span>
          </div>
          <h1 style={{
            fontSize: isMobile ? 36 : 56, fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1,
            margin: 0, marginBottom: 8,
            background: `linear-gradient(135deg, #fff 30%, rgba(255,255,255,0.7) 100%)`,
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            FamilyQuizz
          </h1>
          <p style={{
            fontFamily: "'JetBrains Mono', monospace", fontSize: isMobile ? 10 : 13, letterSpacing: '0.22em',
            color: 'rgba(251,243,238,0.50)', textTransform: 'uppercase', margin: 0,
          }}>
            L'arène de quiz familiale en temps réel
          </p>
        </div>

        {error && (
          <div style={{
            maxWidth: 600, width: '100%', padding: '16px 20px', borderRadius: 16,
            background: `${C.red}22`, border: `1px solid ${C.red}55`,
            color: C.red, marginBottom: 32, fontSize: 13, lineHeight: 1.5,
            textAlign: 'center', boxShadow: `0 12px 24px ${C.red}11`,
            animation: 'pop-in 0.4s ease',
          }}>
            <span style={{ fontSize: 18, marginRight: 8 }}>⚠️</span>
            <strong>Problème de connexion Firebase :</strong><br/>
            {error}
          </div>
        )}

        {/* Roles Selection Grid */}
        <div style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? 18 : 28,
          width: '100%',
          maxWidth: 1180,
          perspective: 1000,
          animation: 'rise-in 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)',
        }}>
          
          {/* Card 1: Joueur */}
          <div
            onClick={() => onSelectRole('player')}
            onMouseEnter={() => setHovered('player')}
            onMouseLeave={() => setHovered(null)}
            style={{
              flex: 1,
              transition: 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.4s cubic-bezier(0.2, 0.8, 0.2, 1), border-color 0.4s',
              transform: (canHover && hovered === 'player') ? 'translateY(-6px) scale(1.02)' : 'translateY(0) scale(1)',
              cursor: 'pointer',
            }}
          >
            <GlassCard style={{
              height: '100%',
              padding: isMobile ? '28px 20px' : '36px 28px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              border: (canHover && hovered === 'player') ? `1px solid ${C.coral}88` : '1px solid rgba(255, 255, 255, 0.20)',
              boxShadow: (canHover && hovered === 'player')
                ? `0 30px 60px rgba(0, 0, 0, 0.50), 0 0 50px ${C.coral}33`
                : '0 22px 50px rgba(0, 0, 0, 0.40)',
            }}>
              {/* Badge */}
              <div style={{ marginBottom: 16 }}>
                <Pill color={C.coral}>SMARTPHONE / TABLETTE</Pill>
              </div>

              {/* Icon */}
              <div style={{
                width: isMobile ? 52 : 64, height: isMobile ? 52 : 64, borderRadius: 20, marginBottom: isMobile ? 18 : 24,
                background: `${C.coral}22`, border: `1px solid ${C.coral}55`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 8px 24px ${C.coral}22`,
              }}>
                <span style={{ fontSize: isMobile ? 26 : 32 }}>🎮</span>
              </div>

              {/* Title */}
              <h2 style={{
                fontSize: isMobile ? 22 : 26, fontWeight: 700, margin: '0 0 10px 0',
                color: C.ink, letterSpacing: '-0.02em',
              }}>
                Rejoindre en Joueur
              </h2>

              {/* Description */}
              <p style={{
                fontSize: 13, color: 'rgba(251,243,238,0.65)', lineHeight: 1.5,
                margin: isMobile ? '0 0 24px 0' : '0 0 32px 0', flex: 1, maxWidth: 280,
              }}>
                Prends ton téléphone, choisis un pseudo croustillant et prépare-toi à buzzer plus vite que tout le monde !
              </p>

              {/* CTA */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectRole('player');
                }}
                style={{
                  width: '100%', height: 50, borderRadius: 14, border: 'none', cursor: 'pointer',
                  background: `linear-gradient(135deg, ${C.coral} 0%, ${C.amber} 100%)`,
                  boxShadow: `0 12px 24px -6px ${C.coral}55, inset 0 1px 0 rgba(255,255,255,0.25)`,
                  color: '#fff', fontSize: 15, fontWeight: 700, letterSpacing: '-0.01em',
                  transition: 'transform 0.2s',
                  transform: (canHover && hovered === 'player') ? 'scale(1.02)' : 'scale(1)',
                  touchAction: 'manipulation',
                }}
              >
                Entrer dans l'arène ⚡
              </button>
            </GlassCard>
          </div>

          {/* Card 2: Maître du Jeu */}
          <div
            onClick={() => onSelectRole('master')}
            onMouseEnter={() => setHovered('master')}
            onMouseLeave={() => setHovered(null)}
            style={{
              flex: 1,
              transition: 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.4s cubic-bezier(0.2, 0.8, 0.2, 1), border-color 0.4s',
              transform: (canHover && hovered === 'master') ? 'translateY(-6px) scale(1.02)' : 'translateY(0) scale(1)',
              cursor: 'pointer',
            }}
          >
            <GlassCard style={{
              height: '100%',
              padding: isMobile ? '28px 20px' : '36px 28px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              border: (canHover && hovered === 'master') ? `1px solid ${C.mint}88` : '1px solid rgba(255, 255, 255, 0.20)',
              boxShadow: (canHover && hovered === 'master')
                ? `0 30px 60px rgba(0, 0, 0, 0.50), 0 0 50px ${C.mint}25`
                : '0 22px 50px rgba(0, 0, 0, 0.40)',
            }}>
              {/* Badge */}
              <div style={{ marginBottom: 16 }}>
                <Pill color={C.mint}>ÉCRAN PC / COCKPIT</Pill>
              </div>

              {/* Icon */}
              <div style={{
                width: isMobile ? 52 : 64, height: isMobile ? 52 : 64, borderRadius: 20, marginBottom: isMobile ? 18 : 24,
                background: `${C.mint}22`, border: `1px solid ${C.mint}55`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 8px 24px ${C.mint}22`,
              }}>
                <span style={{ fontSize: isMobile ? 26 : 32 }}>👑</span>
              </div>

              {/* Title */}
              <h2 style={{
                fontSize: isMobile ? 22 : 26, fontWeight: 700, margin: '0 0 10px 0',
                color: C.ink, letterSpacing: '-0.02em',
              }}>
                Lancer en Maître
              </h2>

              {/* Description */}
              <p style={{
                fontSize: 13, color: 'rgba(251,243,238,0.65)', lineHeight: 1.5,
                margin: isMobile ? '0 0 24px 0' : '0 0 32px 0', flex: 1, maxWidth: 280,
              }}>
                Pilote la soirée depuis ton ordinateur : choisis les thèmes, lis les questions et attribue les points aux joueurs.
              </p>

              {/* CTA */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectRole('master');
                }}
                style={{
                  width: '100%', height: 50, borderRadius: 14, border: 'none', cursor: 'pointer',
                  background: `linear-gradient(135deg, ${C.mint} 0%, ${C.sky} 100%)`,
                  boxShadow: `0 12px 24px -6px ${C.mint}55, inset 0 1px 0 rgba(255,255,255,0.25)`,
                  color: '#0d2820', fontSize: 15, fontWeight: 700, letterSpacing: '-0.01em',
                  transition: 'transform 0.2s',
                  transform: (canHover && hovered === 'master') ? 'scale(1.02)' : 'scale(1)',
                  touchAction: 'manipulation',
                }}
              >
                Ouvrir le Cockpit 🕹️
              </button>
            </GlassCard>
          </div>

          {/* Card 3: Défi temps décalé */}
          <div
            onClick={() => onSelectRole('duel')}
            onMouseEnter={() => setHovered('duel')}
            onMouseLeave={() => setHovered(null)}
            style={{
              flex: 1,
              transition: 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.4s cubic-bezier(0.2, 0.8, 0.2, 1), border-color 0.4s',
              transform: (canHover && hovered === 'duel') ? 'translateY(-6px) scale(1.02)' : 'translateY(0) scale(1)',
              cursor: 'pointer',
            }}
          >
            <GlassCard style={{
              height: '100%',
              padding: isMobile ? '28px 20px' : '36px 28px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              border: (canHover && hovered === 'duel') ? `1px solid ${C.amber}88` : '1px solid rgba(255, 255, 255, 0.20)',
              boxShadow: (canHover && hovered === 'duel')
                ? `0 30px 60px rgba(0, 0, 0, 0.50), 0 0 50px ${C.amber}33`
                : '0 22px 50px rgba(0, 0, 0, 0.40)',
            }}>
              <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                <Pill color={C.amber}>SANS MAÎTRE · ASYNCHRONE</Pill>
                {pendingTurns > 0 && (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    minWidth: 22, height: 22, borderRadius: 9999, padding: '0 6px',
                    background: C.coral, color: '#1a0f12', fontSize: 12, fontWeight: 800,
                    boxShadow: `0 4px 12px ${C.coral}66`,
                    animation: 'badge-pop 0.4s cubic-bezier(0.2,0.8,0.2,1)',
                  }}>{pendingTurns}</span>
                )}
              </div>

              <div style={{
                width: isMobile ? 52 : 64, height: isMobile ? 52 : 64, borderRadius: 20, marginBottom: isMobile ? 18 : 24,
                background: `${C.amber}22`, border: `1px solid ${C.amber}55`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 8px 24px ${C.amber}22`,
              }}>
                <span style={{ fontSize: isMobile ? 26 : 32 }}>⏳</span>
              </div>

              <h2 style={{
                fontSize: isMobile ? 22 : 26, fontWeight: 700, margin: '0 0 10px 0',
                color: C.ink, letterSpacing: '-0.02em',
              }}>
                Défi temps décalé
              </h2>

              <p style={{
                fontSize: 13, color: 'rgba(251,243,238,0.65)', lineHeight: 1.5,
                margin: isMobile ? '0 0 24px 0' : '0 0 32px 0', flex: 1, maxWidth: 280,
              }}>
                Affronte un proche en duel tour par tour : créez un défi, partagez le code, et répondez chacun à votre rythme. Le score se calcule tout seul !
              </p>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectRole('duel');
                }}
                style={{
                  width: '100%', height: 50, borderRadius: 14, border: 'none', cursor: 'pointer',
                  background: `linear-gradient(135deg, ${C.amber} 0%, ${C.coral} 100%)`,
                  boxShadow: `0 12px 24px -6px ${C.amber}55, inset 0 1px 0 rgba(255,255,255,0.25)`,
                  color: '#1a0f12', fontSize: 15, fontWeight: 700, letterSpacing: '-0.01em',
                  transition: 'transform 0.2s',
                  transform: (canHover && hovered === 'duel') ? 'scale(1.02)' : 'scale(1)',
                  touchAction: 'manipulation',
                }}
              >
                Lancer un duel ⚔️
              </button>
            </GlassCard>
          </div>

        </div>

        {/* Footer info */}
        <p style={{
          marginTop: isMobile ? 28 : 36, fontFamily: "'JetBrains Mono', monospace", fontSize: 11,
          color: 'rgba(251,243,238,0.30)', textAlign: 'center', margin: isMobile ? '28px 0 0 0' : '36px 0 0 0',
        }}>
          FamilyQuizz v1.1 • Fait avec ❤️ pour la famille
        </p>

      </div>
    </div>
  );
}
