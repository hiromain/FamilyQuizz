import React from 'react';

/** Glass card wrapper */
export default function GlassCard({ children, style, className = '' }) {
  return (
    <div className={`glass rounded-2xl ${className}`} style={style}>
      {children}
    </div>
  );
}
