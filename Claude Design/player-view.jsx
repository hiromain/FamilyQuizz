// player-view.jsx — Mobile player page view

function PlayerScene({ scene, tweaks }) {
  switch (scene) {
    case 'login':        return <PlayerLogin tweaks={tweaks} />;
    case 'lobby':        return <PlayerLobby tweaks={tweaks} />;
    case 'buzz-wait':    return <PlayerBuzzer tweaks={tweaks} state="wait" />;
    case 'buzz-active':  return <PlayerBuzzer tweaks={tweaks} state="active" />;
    case 'buzz-won':     return <PlayerBuzzer tweaks={tweaks} state="won" />;
    case 'buzz-blocked': return <PlayerBuzzer tweaks={tweaks} state="blocked" />;
    case 'qcm-live':     return <PlayerQCM tweaks={tweaks} state="live" />;
    case 'qcm-locked':   return <PlayerQCM tweaks={tweaks} state="locked" />;
    case 'qcm-right':    return <PlayerQCM tweaks={tweaks} state="right" />;
    case 'qcm-wrong':    return <PlayerQCM tweaks={tweaks} state="wrong" />;
    case 'score':        return <PlayerScore tweaks={tweaks} />;
    default: return null;
  }
}

function PlayerView({ t, setPlayerScene }) {
  return (
    <SingleView
      scenes={PLAYER_SCENES} current={t.playerScene} onPick={setPlayerScene} accent="#ff8466" title="Scénarios joueur">
      <PhoneShell>
        <PlayerScene scene={t.playerScene} tweaks={t} />
      </PhoneShell>
      <FocusInfo
        title="Buzzer plein écran"
        desc="Le bouton occupe quasiment tout l'écran. Glass texture clairement visible grâce à l'aurora locale."
        accent="#ff8466" />
    </SingleView>
  );
}

Object.assign(window, {
  PlayerScene,
  PlayerView,
});
