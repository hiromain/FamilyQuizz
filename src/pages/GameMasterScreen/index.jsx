import React, { useState, useEffect, useMemo } from 'react';
import { useGame } from '../../context/GameContext';
import { C, DIFF } from '../../constants/theme';
import { CATEGORY_TREE } from '../../constants/design';
import DotsLoader from '../../components/ui/DotsLoader';
import FilterPanel, { parseYearQuery } from './FilterPanel';
import GamePanel from './GamePanel';
import ScorePanel from './ScorePanel';
import MobileTabBar from './MobileTabBar';
import MasterSettingsPage from '../MasterSettingsPage';

export default function GameMasterScreen({ onBackToWelcome }) {
  const {
    players, gameState,
    activateBuzzer, deactivateBuzzer, resetBuzzer, resetBuzzedStatus,
    selectQuestion, revealAnswer, revealQuestion, adjustScore, removePlayer, clearAllPlayers,
    resetGameState,
    error: firebaseError,
    loading: firebaseLoading,
    connected,
    localMode,
    setLocalMode,
  } = useGame();

  const [activeSubcategories, setActiveSubcategories] = useState({});
  // Chaîne vide = aucune restriction d'année (toutes les questions "Époques" sont dans le pool).
  const [selectedYear, setSelectedYear] = useState('');
  const [activeDifficulties, setActiveDifficulties] = useState({ facile: true, moyen: true, difficile: true });
  const [bonusPoints, setBonusPoints] = useState(0);
  const [expandedSubcatPanel, setExpandedSubcatPanel] = useState(() => new Set()); // Set<category name> — plusieurs catégories dépliables en même temps

  const [width, setWidth] = useState(window.innerWidth);
  const [activeTab, setActiveTab] = useState('jeu'); // 'filters' | 'jeu' | 'scores' — Réglages n'est pas un onglet, voir showSettings
  const [revealedAnswer, setRevealedAnswer] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [masterError, setMasterError] = useState(null);
  const [quizMode, setQuizMode] = useState(false);

  useEffect(() => {
    if (gameState?.active_question && !quizMode) {
      setQuizMode(true);
    }
  }, [gameState?.active_question]);

  const handleEnterQuizMode = () => {
    if (activeQuestionPool.length === 0) return;
    setQuizMode(true);
    if (!gameState?.active_question) {
      handleRandomQuestionDraw();
    }
    // On mobile, jump straight to the Jeu tab so starting the session from
    // the Filtres tab lands you where the drawn question actually shows up.
    setActiveTab('jeu');
  };

  const handleExitQuizMode = async () => {
    if (window.confirm("Arrêter le quiz en cours ? L'affichage joueur sera réinitialisé et vous retournerez à la configuration des thèmes.")) {
      setQuizMode(false);
      await resetGameState();
    }
  };

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = width < 1024;

  const activeQuestion  = gameState.active_question;
  const buzzerWinnerId  = gameState.current_buzzer;
  const isBuzzerActive  = gameState.buzzer_active;

  useEffect(() => { setBonusPoints(0); setRevealedAnswer(false); }, [buzzerWinnerId, activeQuestion?.id]);
  useEffect(() => { setRevealedAnswer(false); }, [activeQuestion?.id]);

  useEffect(() => {
    const initialToggles = {};
    Object.keys(CATEGORY_TREE).forEach(cat => {
      Object.keys(CATEGORY_TREE[cat]).forEach(sub => { initialToggles[sub] = true; });
    });
    setActiveSubcategories(initialToggles);
  }, []);

  const toggleSubcatPanel = (cat) =>
    setExpandedSubcatPanel(prev => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });

  const toggleSubcategory = (sub) =>
    setActiveSubcategories(prev => ({ ...prev, [sub]: !prev[sub] }));

  const toggleDifficulty = (level) =>
    setActiveDifficulties(prev => ({ ...prev, [level]: !prev[level] }));

  const handleSelectAllDifficulties = (v) =>
    setActiveDifficulties({ facile: v, moyen: v, difficile: v });

  const toggleBulkCategory = (cat, v) => {
    const upd = { ...activeSubcategories };
    Object.keys(CATEGORY_TREE[cat]).forEach(sub => { upd[sub] = v; });
    setActiveSubcategories(upd);
  };

  const handleSelectAllCategories = () => {
    const upd = {};
    Object.keys(CATEGORY_TREE).forEach(cat =>
      Object.keys(CATEGORY_TREE[cat]).forEach(sub => { upd[sub] = true; }));
    setActiveSubcategories(upd);
  };

  const handleDeselectAllCategories = () => {
    const upd = {};
    Object.keys(CATEGORY_TREE).forEach(cat =>
      Object.keys(CATEGORY_TREE[cat]).forEach(sub => { upd[sub] = false; }));
    setActiveSubcategories(upd);
  };

  const activeQuestionPool = useMemo(() => {
    const pool = [];
    Object.keys(CATEGORY_TREE).forEach(cat => {
      Object.keys(CATEGORY_TREE[cat]).forEach(sub => {
        if (activeSubcategories[sub]) {
          const list = CATEGORY_TREE[cat][sub];
          const filtered = list.filter(q => activeDifficulties[q.difficulty?.toLowerCase() || 'facile']);
          if (sub === 'annees') {
            const targetYears = parseYearQuery(selectedYear);
            // Pas d'année tapée = pas de restriction (toutes les questions passent).
            const yearFiltered = targetYears.length > 0
              ? filtered.filter(q => targetYears.includes(q.year))
              : filtered;
            yearFiltered.forEach(q =>
              pool.push({ category: cat, subcategory: sub, questionObj: q }));
          } else {
            filtered.forEach(q => pool.push({ category: cat, subcategory: sub, questionObj: q }));
          }
        }
      });
    });
    // Mélange le pool (Fisher-Yates) pour que les questions des différentes
    // catégories sélectionnées s'enchaînent aléatoirement, au lieu d'épuiser
    // une catégorie avant de passer à la suivante.
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool;
  }, [activeSubcategories, activeDifficulties, selectedYear]);

  const handleRandomQuestionDraw = async () => {
    try {
      setMasterError(null);
      if (activeQuestionPool.length === 0) {
        throw new Error("Aucune question disponible. Choisissez des thèmes et difficultés dans le panneau de gauche.");
      }
      const sel = activeQuestionPool[Math.floor(Math.random() * activeQuestionPool.length)];
      await selectQuestion(
        `${sel.category} : ${sel.subcategory}`,
        sel.questionObj,
        sel.subcategory === 'annees' ? sel.questionObj.year : null
      );
    } catch (err) {
      console.error("Error drawing random question:", err);
      setMasterError(`Impossible de tirer une question : ${err.message || err}`);
    }
  };

  const handleManualQuestionSelect = async (cat, sub, q) => {
    try {
      setMasterError(null);
      await selectQuestion(`${cat} : ${sub}`, q, sub === 'annees' ? q.year : null);
    } catch (err) {
      console.error("Error selecting manual question:", err);
      setMasterError(`Impossible de sélectionner la question : ${err.message || err}`);
    }
  };

  const handleValidateAnswer = async (pid, correct, bonus = 0) => {
    const key = activeQuestion?.difficulty?.toLowerCase() || 'moyen';
    const basePoints = DIFF[key]?.points || 2;
    if (correct) {
      await adjustScore(pid, basePoints + bonus);
      await revealAnswer(true);
      await resetBuzzer();
    } else {
      const duration = parseInt(localStorage.getItem('fq_timer_duration') || '30', 10);
      await activateBuzzer(duration);
    }
  };

  if (firebaseLoading) {
    return (
      <div style={{
        display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center',
        background: C.bg,
      }}>
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <DotsLoader color={C.mint} />
          <p style={{ color: 'rgba(251,243,238,0.55)', fontSize: 14, fontFamily: "'JetBrains Mono', monospace" }}>
            Initialisation du Cockpit Maître…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      height: '100vh',
      background: C.bg,
      color: C.ink,
      overflow: 'hidden',
      position: 'relative',
    }}>

      {/* Aurora (subtle, behind everything) */}
      <div className="aurora" style={{ opacity: 0.4, pointerEvents: 'none' }}>
        <i className="blob-3" style={{ pointerEvents: 'none' }} />
        <i className="blob-4" style={{ pointerEvents: 'none' }} />
        <i className="blob-5" style={{ pointerEvents: 'none' }} />
      </div>

      {/* ── LEFT PANEL : Filters (sidebar or mobile tab) ── */}
      {(!isMobile || activeTab === 'filters') && (
        <div style={{
          width: isMobile ? '100%' : 320,
          height: isMobile ? 'calc(100vh - 64px)' : '100%',
          flexShrink: 0,
          borderRight: isMobile ? 'none' : '1px solid rgba(255,255,255,0.07)',
          overflow: 'hidden',
        }}>
          <FilterPanel
            connected={connected}
            activeQuestionPool={activeQuestionPool}
            activeDifficulties={activeDifficulties}
            toggleDifficulty={toggleDifficulty}
            handleSelectAllDifficulties={handleSelectAllDifficulties}
            activeSubcategories={activeSubcategories}
            toggleSubcategory={toggleSubcategory}
            toggleBulkCategory={toggleBulkCategory}
            handleSelectAllCategories={handleSelectAllCategories}
            handleDeselectAllCategories={handleDeselectAllCategories}
            selectedYear={selectedYear}
            setSelectedYear={setSelectedYear}
            expandedSubcatPanel={expandedSubcatPanel}
            toggleSubcatPanel={toggleSubcatPanel}
            quizMode={quizMode}
            onEnterQuizMode={handleEnterQuizMode}
          />
        </div>
      )}

      {/* ── CENTER PANEL : Game space (sidebar or mobile tab) ── */}
      {(!isMobile || activeTab === 'jeu') && (
        <div style={{
          flex: 1,
          height: isMobile ? 'calc(100vh - 64px)' : '100%',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}>
          <GamePanel
            onBackToWelcome={onBackToWelcome}
            activeQuestionPool={activeQuestionPool}
            activeQuestion={activeQuestion}
            buzzerWinnerId={buzzerWinnerId}
            isBuzzerActive={isBuzzerActive}
            revealedAnswer={revealedAnswer}
            setRevealedAnswer={setRevealedAnswer}
            setShowSettings={setShowSettings}
            masterError={masterError}
            setMasterError={setMasterError}
            firebaseError={firebaseError}
            connected={connected}
            localMode={localMode}
            setLocalMode={setLocalMode}
            bonusPoints={bonusPoints}
            setBonusPoints={setBonusPoints}
            players={players}
            gameState={gameState}
            handleRandomQuestionDraw={handleRandomQuestionDraw}
            handleManualQuestionSelect={handleManualQuestionSelect}
            handleValidateAnswer={handleValidateAnswer}
            activateBuzzer={activateBuzzer}
            deactivateBuzzer={deactivateBuzzer}
            resetBuzzer={resetBuzzer}
            resetBuzzedStatus={resetBuzzedStatus}
            revealAnswer={revealAnswer}
            revealQuestion={revealQuestion}
            selectedYear={selectedYear}
            isMobile={isMobile}
            quizMode={quizMode}
            onEnterQuizMode={handleEnterQuizMode}
            onExitQuizMode={handleExitQuizMode}
          />
        </div>
      )}

      {/* ── RIGHT PANEL : Leaderboard scores (sidebar or mobile tab) ── */}
      {(!isMobile || activeTab === 'scores') && (
        <div style={{
          width: isMobile ? '100%' : 280,
          height: isMobile ? 'calc(100vh - 64px)' : '100%',
          flexShrink: 0,
          borderLeft: isMobile ? 'none' : '1px solid rgba(255,255,255,0.07)',
          background: 'rgba(255,255,255,0.025)',
        }}>
          <ScorePanel
            players={players}
            buzzerWinnerId={buzzerWinnerId}
            clearAllPlayers={clearAllPlayers}
            adjustScore={adjustScore}
            removePlayer={removePlayer}
            isMobile={isMobile}
          />
        </div>
      )}

      {/* Mobile Bottom Tab Bar */}
      {isMobile && (
        <MobileTabBar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      )}

      {/* Settings Panel Overlay */}
      {showSettings && (
        <MasterSettingsPage
          onBackToWelcome={onBackToWelcome}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}
