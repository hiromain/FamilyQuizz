// master-desktop-view.jsx — Desktop master page view

function MasterDesktopScene({ scene, tweaks, onChange }) {
  switch (scene) {
    case 'config':         return <MasterConfig tweaks={tweaks} onStart={() => onChange('game-question')} />;
    case 'game-question':  return <MasterGame tweaks={tweaks} phase="question" onPhase={(p) => onChange('game-' + p)} />;
    case 'game-buzzed':    return <MasterGame tweaks={tweaks} phase="buzzed"   onPhase={(p) => onChange('game-' + p)} />;
    case 'game-reveal':    return <MasterGame tweaks={tweaks} phase="reveal"   onPhase={(p) => onChange('game-' + p)} />;
    default: return null;
  }
}

function MasterDesktopView({ t, setMasterScene }) {
  return (
    <div className="px-8 pb-16 flex justify-center">
      <div className="flex items-start gap-6 flex-wrap">
        <SceneSelector
          scenes={MASTER_SCENES}
          current={t.masterScene}
          onPick={setMasterScene}
          accent="#7eb8ff"
          title="Scénarios maître" />
        <ScaledFrame scale={0.88} w={1200} h={760}>
          <DesktopShell>
            <MasterDesktopScene scene={t.masterScene} tweaks={t} onChange={setMasterScene} />
          </DesktopShell>
        </ScaledFrame>
      </div>
    </div>
  );
}

Object.assign(window, {
  MasterDesktopScene,
  MasterDesktopView,
});
