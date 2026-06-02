// app.jsx — Prototype shell: phone + desktop + master mobile, with scenario stepper

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "view": "split",
  "playerScene": "buzz-active",
  "masterScene": "game-question",
  "glass": 78,
  "buzzerSize": 96,
  "aurora": 90,
  "showGrain": true,
  "themeColor": "#ff8466",
  "accent": ["#ff8466", "#f5b54a", "#6fe0c4"]
}/*EDITMODE-END*/;

// ─── App ───────────────────────────────────────────────────────────────────
function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  const setPlayerScene = (id) => setTweak('playerScene', id);
  const setMasterScene = (id) => setTweak('masterScene', id);
  const setView = (v) => setTweak('view', v);

  const view = t.view;

  return (
    <div className="relative min-h-screen w-full">
      <Aurora intensity={t.aurora / 100} />

      <div className="relative z-10">
        <TopBar view={view} setView={setView} />

        {view === 'split' && (
          <SplitView t={t} setPlayerScene={setPlayerScene} setMasterScene={setMasterScene} />
        )}

        {view === 'player' && (
          <PlayerView t={t} setPlayerScene={setPlayerScene} />
        )}

        {view === 'master-mobile' && (
          <MasterMobileView t={t} setMasterScene={setMasterScene} />
        )}

        {view === 'master-desktop' && (
          <MasterDesktopView t={t} setMasterScene={setMasterScene} />
        )}
      </div>

      {/* Tweaks panel */}
      <TweaksPanel title="Tweaks">
        <TweakSection label="Vue">
          <TweakSelect label="Affichage" value={t.view}
            options={[
              { value: 'split',          label: 'Vue d\'ensemble' },
              { value: 'player',         label: 'Joueur · mobile' },
              { value: 'master-mobile',  label: 'Maître · mobile' },
              { value: 'master-desktop', label: 'Maître · PC' },
            ]}
            onChange={(v) => setTweak('view', v)} />
        </TweakSection>

        <TweakSection label="Effets visuels">
          <TweakSlider label="Glassmorphism" value={t.glass} min={20} max={100} unit="%"
            onChange={(v) => setTweak('glass', v)} />
          <TweakSlider label="Aurora" value={t.aurora} min={0} max={100} unit="%"
            onChange={(v) => setTweak('aurora', v)} />
          <TweakSlider label="Taille buzzer" value={t.buzzerSize} min={60} max={110} unit="%"
            onChange={(v) => setTweak('buzzerSize', v)} />
        </TweakSection>

        <TweakSection label="Scènes">
          <TweakSelect label="Écran joueur" value={t.playerScene}
            options={PLAYER_SCENES.map(s => ({ value: s.id, label: s.label }))}
            onChange={(v) => setTweak('playerScene', v)} />
          <TweakSelect label="Écran maître" value={t.masterScene}
            options={MASTER_SCENES.map(s => ({ value: s.id, label: s.label }))}
            onChange={(v) => setTweak('masterScene', v)} />
        </TweakSection>

        <TweakSection label="Palette">
          <TweakColor label="Accents" value={t.accent}
            options={[
              ['#ff8466', '#f5b54a', '#6fe0c4'], // warm aubergine (default)
              ['#ff6f9c', '#f5b54a', '#7eb8ff'], // rose / amber / sky
              ['#7eb8ff', '#a78bfa', '#6fe0c4'], // cool dusk
              ['#f5b54a', '#ff8466', '#ff6f9c'], // sunset warm
            ]}
            onChange={(v) => setTweak('accent', v)} />
          <TweakColor label="Couleur buzzer (thème)" value={t.themeColor}
            options={['#ff8466', '#6fe0c4', '#7eb8ff', '#ff6f9c', '#f5b54a']}
            onChange={(v) => setTweak('themeColor', v)} />
        </TweakSection>
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
