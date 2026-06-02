import React from 'react';
import { C } from '../../constants/design';

/** Avatar with initials */
export default function Avatar({ name = '?', tone = C.coral, size = 36 }) {
  const initials = name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  return (
    <div style={{
      width: size, height: size, borderRadius: 9999, fontSize: size * 0.42, fontWeight: 700,
      background: `linear-gradient(135deg, ${tone}, ${tone}99)`,
      boxShadow: `inset 0 1px 0 rgba(255,255,255,.25), 0 0 0 0.5px ${tone}55, 0 6px 14px ${tone}33`,
      color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
      letterSpacing: '-0.02em', flexShrink: 0,
    }}>{initials}</div>
  );
}
