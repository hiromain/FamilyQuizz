import React from 'react';
import { C } from '../../constants/design';

/** Animated dots loader */
export default function DotsLoader({ color = C.amber }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      {[0, 1, 2].map(i => (
        <span key={i} style={{
          width: 7, height: 7, borderRadius: 9999, background: color,
          animation: `dot-bounce 1.4s ease-in-out ${i * 0.15}s infinite`,
        }} />
      ))}
    </div>
  );
}
