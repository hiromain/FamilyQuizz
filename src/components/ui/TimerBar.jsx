import React, { useState, useEffect } from 'react';
import { C } from '../../constants/design';

/** Synchronized Timer / Countdown progress bar */
export default function TimerBar({ endsAt, duration, onExpire }) {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (!endsAt) {
      setTimeLeft(0);
      return;
    }

    const updateTimer = () => {
      const remaining = Math.max(0, endsAt - Date.now());
      setTimeLeft(remaining);

      if (remaining === 0) {
        clearInterval(interval);
        if (onExpire) onExpire();
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 100);

    return () => clearInterval(interval);
  }, [endsAt]);

  if (!endsAt || timeLeft === 0 || !duration) return null;

  const seconds = Math.ceil(timeLeft / 1000);
  const pct = (timeLeft / (duration * 1000)) * 100;
  const isDanger = seconds <= 5;
  const barColor = isDanger ? C.red : pct < 50 ? C.amber : C.mint;

  return (
    <div style={{ width: '100%', marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6, animation: 'pop-in 0.3s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{
          fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
          color: 'rgba(251,243,238,0.40)', letterSpacing: '0.12em', textTransform: 'uppercase'
        }}>
          ⏳ Temps restant
        </span>
        <span style={{
          fontFamily: "'JetBrains Mono', monospace", fontSize: 14, fontWeight: 800,
          color: barColor, letterSpacing: '-0.02em',
          animation: isDanger ? 'buzz-breathe 0.5s infinite' : 'none'
        }}>
          {seconds}s
        </span>
      </div>
      <div style={{
        width: '100%', height: 6, borderRadius: 99, background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden', position: 'relative'
      }}>
        <div style={{
          width: `${pct}%`,
          height: '100%',
          background: barColor,
          borderRadius: 99,
          transition: 'width 0.1s linear, background-color 0.3s',
          boxShadow: `0 0 12px ${barColor}aa`
        }} />
      </div>
    </div>
  );
}
