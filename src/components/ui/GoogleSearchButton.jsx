import React, { useState } from 'react';
import { C } from '../../constants/theme';

export default function GoogleSearchButton({ question, style }) {
  const [isHov, setIsHov] = useState(false);

  const handleClick = () => {
    const url = `https://www.google.com/search?q=${encodeURIComponent(question)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <button
      onClick={handleClick}
      onMouseEnter={() => setIsHov(true)}
      onMouseLeave={() => setIsHov(false)}
      style={{
        alignSelf: 'flex-start',
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '7px 13px', borderRadius: 10,
        background: isHov ? 'rgba(245, 181, 74, 0.16)' : 'rgba(255,255,255,0.08)',
        border: `1.5px solid ${isHov ? `${C.amber}88` : 'rgba(255,255,255,0.15)'}`,
        color: isHov ? C.amber : '#fff',
        fontSize: 12, fontWeight: 700, cursor: 'pointer',
        transition: 'all 0.15s',
        ...style,
      }}
    >
      🔍 Vérifier sur Google
    </button>
  );
}
