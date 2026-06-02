// master-mobile-view.jsx — Mobile master page view

function MasterMobileScene({ scene, tweaks, onChange }) {
  switch (scene) {
    case 'config':         return <MasterConfigMobile tweaks={tweaks} onStart={() => onChange('game-question')} />;
    case 'game-question':  return <MasterGameMobile tweaks={tweaks} phase="question" onPhase={(p) => onChange('game-' + p)} />;
    case 'game-buzzed':    return <MasterGameMobile tweaks={tweaks} phase="buzzed"   onPhase={(p) => onChange('game-' + p)} />;
    case 'game-reveal':    return <MasterGameMobile tweaks={tweaks} phase="reveal"   onPhase={(p) => onChange('game-' + p)} />;
    default: return null;
  }
}

function MasterMobileView({ t, setMasterScene }) {
  return (
    <SingleView
      scenes={MASTER_SCENES} current={t.masterScene} onPick={setMasterScene} accent="#f5b54a" title="Scénarios maître">
      <PhoneShell>
        <MasterMobileScene scene={t.masterScene} tweaks={t} onChange={setMasterScene} />
      </PhoneShell>
      <FocusInfo
        title="Maître mobile"
        desc="La soirée tient dans une main. Onglets Jeu / Classement / File de buzz, actions principales en bas. Tout interactif."
        accent="#f5b54a" />
    </SingleView>
  );
}

Object.assign(window, {
  MasterMobileScene,
  MasterMobileView,
});
