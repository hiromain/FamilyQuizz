// shells.jsx — Device frame wrapper components

function PhoneShell({ children, width = 380, height = 800 }) {
  return (
    <div style={{
      width, height, borderRadius: 52, position: 'relative',
      background: 'linear-gradient(170deg, #2a1f3a 0%, #0c0716 100%)',
      padding: 8,
      boxShadow: '0 0 0 1.5px rgba(255,255,255,0.08), 0 60px 120px -20px rgba(0,0,0,0.8), 0 24px 48px rgba(0,0,0,0.4)',
    }}>
      <div style={{
        width: '100%', height: '100%', borderRadius: 44, overflow: 'hidden',
        background: 'radial-gradient(ellipse at 30% 0%, #1f1130 0%, #100820 60%)',
        position: 'relative',
      }}>
        {/* Dynamic island */}
        <div style={{
          position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)',
          width: 110, height: 32, borderRadius: 24, background: '#000', zIndex: 50,
          boxShadow: '0 0 0 1px rgba(0,0,0,0.5)',
        }} />
        {children}
      </div>
    </div>
  );
}

function DesktopShell({ children, width = 1200, height = 760, title = 'FamilyQuizz — Maître du jeu' }) {
  return (
    <div style={{
      width, height, borderRadius: 16,
      background: '#150a22', overflow: 'hidden',
      boxShadow: '0 0 0 1px rgba(255,255,255,0.08), 0 70px 140px -30px rgba(0,0,0,0.85), 0 30px 60px rgba(0,0,0,0.4)',
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{
        height: 38, background: 'rgba(255,255,255,0.035)', borderBottom: '0.5px solid rgba(255,255,255,0.08)',
        display: 'flex', alignItems: 'center', padding: '0 14px', gap: 14, flexShrink: 0,
      }}>
        <div className="flex gap-2">
          <div style={{ width: 12, height: 12, borderRadius: 9999, background: '#ff5f57' }} />
          <div style={{ width: 12, height: 12, borderRadius: 9999, background: '#febc2e' }} />
          <div style={{ width: 12, height: 12, borderRadius: 9999, background: '#28c840' }} />
        </div>
        <div className="flex-1 text-center text-[12px] text-white/55 font-medium tracking-tight">{title}</div>
        <div className="w-[54px]" />
      </div>
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <div className="desktop-aurora" />
        {children}
      </div>
    </div>
  );
}

function ScaledFrame({ scale, w, h, children }) {
  return (
    <div style={{ width: w * scale, height: h * scale, flexShrink: 0 }}>
      <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left', width: w, height: h }}>
        {children}
      </div>
    </div>
  );
}

Object.assign(window, {
  PhoneShell,
  DesktopShell,
  ScaledFrame,
});
