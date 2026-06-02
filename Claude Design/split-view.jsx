// split-view.jsx — Vue d'ensemble dashboard view

function SplitView({ t, setPlayerScene, setMasterScene }) {
  return (
    <div className="px-8 pb-16 space-y-14">
      {/* PLAYER */}
      <section>
        <div className="max-w-[1100px] mx-auto">
          <SectionHeader dotColor="#ff8466" label="Joueur · Mobile"
            caption={PLAYER_SCENES.find(s => s.id === t.playerScene)?.label} />
          <div className="flex items-start gap-6 justify-center flex-wrap">
            <SceneSelector scenes={PLAYER_SCENES} current={t.playerScene} onPick={setPlayerScene} accent="#ff8466" title="Scénarios" />
            <ScaledFrame scale={0.88} w={380} h={800}>
              <PhoneShell>
                <PlayerScene scene={t.playerScene} tweaks={t} />
              </PhoneShell>
            </ScaledFrame>
            <FocusInfo
              title="Buzzer plein écran"
              desc="Le bouton occupe quasiment tout l'écran. Impossible à rater, même à un mètre, même les doigts qui tremblent. Glass + aurora qui respirent derrière."
              accent="#ff8466" />
          </div>
        </div>
      </section>

      {/* MASTER MOBILE */}
      <section>
        <div className="max-w-[1100px] mx-auto">
          <SectionHeader dotColor="#f5b54a" label="Maître · Mobile"
            caption={MASTER_SCENES.find(s => s.id === t.masterScene)?.label} />
          <div className="flex items-start gap-6 justify-center flex-wrap">
            <SceneSelector scenes={MASTER_SCENES} current={t.masterScene} onPick={setMasterScene} accent="#f5b54a" title="Scénarios" />
            <ScaledFrame scale={0.88} w={380} h={800}>
              <PhoneShell>
                <MasterMobileScene scene={t.masterScene} tweaks={t} onChange={setMasterScene} />
              </PhoneShell>
            </ScaledFrame>
            <FocusInfo
              title="Maître depuis le canapé"
              desc="Pas besoin de PC : le Maître pilote la soirée depuis son téléphone. Onglets pour basculer entre les votes, le classement et la file de buzz. Actions principales toujours en bas, au pouce."
              accent="#f5b54a" />
          </div>
        </div>
      </section>

      {/* MASTER DESKTOP */}
      <section>
        <div className="max-w-[1500px] mx-auto">
          <SectionHeader dotColor="#7eb8ff" label="Maître · Desktop (TV/projo)"
            caption={MASTER_SCENES.find(s => s.id === t.masterScene)?.label} />
          <div className="flex items-start gap-6 justify-center flex-wrap">
            <SceneSelector scenes={MASTER_SCENES} current={t.masterScene} onPick={setMasterScene} accent="#7eb8ff" title="Scénarios" />
            <ScaledFrame scale={0.78} w={1200} h={760}>
              <DesktopShell>
                <MasterDesktopScene scene={t.masterScene} tweaks={t} onChange={setMasterScene} />
              </DesktopShell>
            </ScaledFrame>
          </div>
        </div>
      </section>

      <FlowHint />
    </div>
  );
}

Object.assign(window, {
  SplitView,
});
