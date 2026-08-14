import React, { createContext, useContext, useState, useEffect } from 'react';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { ref, onValue, set, update, runTransaction } from 'firebase/database';
import { db, auth } from '../firebase/config';

const GameContext = createContext();

const HUMOROUS_NICKNAMES = [
  "Tonton Giga-Buzzer",
  "Tata Mirabelle",
  "Cousin Porsche 911",
  "Papi Whisky",
  "Mamie Rhum Arrangé",
  "Chirurgien du Dimanche",
  "Pilote de Karting",
  "Gaga Stéphanois",
  "L'Ancien de Metz",
  "L'Ardéchois Volant",
  "Cousine Turbo",
  "As de la Lorraine",
  "Buzzer Fou"
];

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

const withTimeout = (promise, ms, errorMessage = "Délai de connexion Firebase dépassé.") => {
  let timeoutId;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(errorMessage)), ms);
  });
  return Promise.race([
    promise.then((val) => { clearTimeout(timeoutId); return val; }),
    timeoutPromise
  ]);
};

export const GameProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [localMode, setLocalMode] = useState(false);
  const [connected, setConnected] = useState(false);
  const [players, setPlayers] = useState({});
  const [gameState, setGameState] = useState({
    buzzer_active: false,
    current_buzzer: null,
    active_question: null,
    show_answer: false,
    show_question: true,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper helper to run either Firebase or local action
  const runAction = async (firebaseUpdate, localStateUpdate) => {
    if (localMode) {
      localStateUpdate();
      return true;
    }
    try {
      await withTimeout(
        firebaseUpdate(),
        2500,
        "La base de données Firebase ne répond pas."
      );
      return true;
    } catch (err) {
      console.warn("[GameContext] Firebase write failed, falling back to local mode:", err);
      setLocalMode(true);
      localStateUpdate();
      return false;
    }
  };

  // 1. Authenticate anonymously on load
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setError(null);
        setLoading(false);
      } else {
        try {
          const credentials = await signInAnonymously(auth);
          setUser(credentials.user);
          setError(null);
          setLoading(false);
        } catch (authError) {
          console.warn("[GameContext] Anonymous auth failed, enabling offline local mode:", authError);
          setLocalMode(true);
          setError(null);
          setLoading(false);
        }
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // 2. Synchronize Players and Game State from Firebase
  useEffect(() => {
    if (!user || localMode) return;

    const playersRef = ref(db, 'players');
    const gameStateRef = ref(db, 'game_state');
    const connectedRef = ref(db, '.info/connected');

    const unsubscribePlayers = onValue(playersRef, (snapshot) => {
      const data = snapshot.val();
      setPlayers(data || {});
    });

    const unsubscribeGameState = onValue(gameStateRef, (snapshot) => {
      const data = snapshot.val();
      setGameState(data || {
        buzzer_active: false,
        current_buzzer: null,
        active_question: null,
        show_answer: false,
        show_question: true,
      });
    });


    const unsubscribeConnected = onValue(connectedRef, (snapshot) => {
      setConnected(snapshot.val() === true);
    });

    return () => {
      unsubscribePlayers();
      unsubscribeGameState();
      unsubscribeConnected();
    };
  }, [user, localMode]);

  const playerId = user?.uid || 'local-user';
  const currentPlayer = players[playerId] || null;

  // 3. Player Actions
  const joinGame = async (nicknameInput) => {
    let nickname = nicknameInput ? nicknameInput.trim() : "";
    if (!nickname) {
      const randomIndex = Math.floor(Math.random() * HUMOROUS_NICKNAMES.length);
      nickname = HUMOROUS_NICKNAMES[randomIndex];
    }

    const playerObj = {
      id: playerId,
      nickname,
      score: 0,
      active: true,
      buzzed: false,
    };

    await runAction(
      () => set(ref(db, `players/${playerId}`), playerObj),
      () => setPlayers(prev => ({ ...prev, [playerId]: playerObj }))
    );
  };

  const buzz = async () => {
    if (!playerId || !gameState.buzzer_active || currentPlayer?.buzzed) return false;

    if (localMode) {
      setGameState(prev => ({ ...prev, current_buzzer: playerId, buzzer_active: false }));
      setPlayers(prev => ({ ...prev, [playerId]: { ...prev[playerId], buzzed: true } }));
      return true;
    }

    const buzzerRef = ref(db, 'game_state/current_buzzer');
    try {
      const result = await runTransaction(buzzerRef, (currentVal) => {
        if (currentVal === null) return playerId;
        return;
      });

      if (result.committed && result.snapshot.val() === playerId) {
        await update(ref(db), {
          'game_state/buzzer_active': false,
          [`players/${playerId}/buzzed`]: true
        });
        return true;
      }
      return false;
    } catch (err) {
      console.warn("[GameContext] Buzz transaction failed, falling back to local:", err);
      setLocalMode(true);
      setGameState(prev => ({ ...prev, current_buzzer: playerId, buzzer_active: false }));
      setPlayers(prev => ({ ...prev, [playerId]: { ...prev[playerId], buzzed: true } }));
      return true;
    }
  };

  // 4. Game Master Actions
  const activateBuzzer = async (duration = null) => {
    const updates = {
      'game_state/buzzer_active': true,
      'game_state/current_buzzer': null,
      'game_state/timer_ends_at': duration ? Date.now() + (duration * 1000) : null,
      'game_state/timer_duration': duration || null,
    };

    await runAction(
      () => update(ref(db), updates),
      () => setGameState(prev => ({
        ...prev,
        buzzer_active: true,
        current_buzzer: null,
        timer_ends_at: duration ? Date.now() + (duration * 1000) : null,
        timer_duration: duration || null,
      }))
    );
  };

  const deactivateBuzzer = async () => {
    await runAction(
      () => update(ref(db), {
        'game_state/buzzer_active': false,
        'game_state/timer_ends_at': null,
      }),
      () => setGameState(prev => ({ ...prev, buzzer_active: false, timer_ends_at: null }))
    );
  };

  const resetBuzzer = async () => {
    await runAction(
      () => update(ref(db), {
        'game_state/buzzer_active': false,
        'game_state/current_buzzer': null,
        'game_state/timer_ends_at': null,
      }),
      () => setGameState(prev => ({ ...prev, buzzer_active: false, current_buzzer: null, timer_ends_at: null }))
    );
  };

  const resetBuzzedStatus = async () => {
    const dbUpdates = {};
    Object.keys(players).forEach((id) => {
      dbUpdates[`players/${id}/buzzed`] = false;
    });
    dbUpdates['game_state/current_buzzer'] = null;
    dbUpdates['game_state/buzzer_active'] = false;
    dbUpdates['game_state/timer_ends_at'] = null;

    await runAction(
      () => update(ref(db), dbUpdates),
      () => {
        setPlayers(prev => {
          const updated = {};
          Object.keys(prev).forEach((id) => {
            updated[id] = { ...prev[id], buzzed: false };
          });
          return updated;
        });
        setGameState(prev => ({ ...prev, current_buzzer: null, buzzer_active: false, timer_ends_at: null }));
      }
    );
  };

  const selectQuestion = async (theme, question, year = null) => {
    const cleanQuestion = {
      id: question.id || "",
      type: question.type || "open",
      question: question.question || "",
      answer: question.answer || "",
      difficulty: question.difficulty || "Moyen",
      options: question.options || null,
      explanation: question.explanation || null,
      theme: theme || "",
      year: year || null
    };

    const dbUpdates = {
      'game_state/active_question': cleanQuestion,
      'game_state/current_buzzer': null,
      'game_state/buzzer_active': false,
      'game_state/show_answer': false,
      'game_state/timer_ends_at': null,
      'game_state/timer_duration': null,
      'game_state/show_question': true,
    };
    Object.keys(players).forEach((id) => {
      dbUpdates[`players/${id}/buzzed`] = false;
    });

    await runAction(
      () => update(ref(db), dbUpdates),
      () => {
        setGameState(prev => ({
          ...prev,
          active_question: cleanQuestion,
          current_buzzer: null,
          buzzer_active: false,
          show_answer: false,
          timer_ends_at: null,
          timer_duration: null,
          show_question: true,
        }));
        setPlayers(prev => {
          const updated = {};
          Object.keys(prev).forEach((id) => {
            updated[id] = { ...prev[id], buzzed: false };
          });
          return updated;
        });
      }
    );
  };

  const revealAnswer = async (show = true) => {
    await runAction(
      () => update(ref(db), {
        'game_state/show_answer': show,
        'game_state/timer_ends_at': null,
      }),
      () => setGameState(prev => ({ ...prev, show_answer: show, timer_ends_at: null }))
    );
  };

  const revealQuestion = async (show = true) => {
    await runAction(
      () => update(ref(db), {
        'game_state/show_question': show,
      }),
      () => setGameState(prev => ({ ...prev, show_question: show }))
    );
  };

  const adjustScore = async (targetPlayerId, amount) => {
    const currentScore = players[targetPlayerId]?.score || 0;
    const newScore = Math.max(0, currentScore + amount);

    await runAction(
      () => update(ref(db), { [`players/${targetPlayerId}/score`]: newScore }),
      () => setPlayers(prev => {
        const p = prev[targetPlayerId];
        if (!p) return prev;
        return { ...prev, [targetPlayerId]: { ...p, score: newScore } };
      })
    );
  };

  const removePlayer = async (targetPlayerId) => {
    await runAction(
      () => set(ref(db, `players/${targetPlayerId}`), null),
      () => setPlayers(prev => {
        const updated = { ...prev };
        delete updated[targetPlayerId];
        return updated;
      })
    );
  };

  const clearAllPlayers = async () => {
    await runAction(
      async () => {
        await set(ref(db, 'players'), null);
        await update(ref(db), {
          'game_state/current_buzzer': null,
          'game_state/buzzer_active': false,
          'game_state/active_question': null,
          'game_state/show_answer': false,
          'game_state/timer_ends_at': null,
          'game_state/timer_duration': null,
          'game_state/show_question': true,
        });
      },
      () => {
        setPlayers({});
        setGameState({
          buzzer_active: false,
          current_buzzer: null,
          active_question: null,
          show_answer: false,
          timer_ends_at: null,
          timer_duration: null,
          show_question: true,
        });
      }
    );
  };

  const resetGameState = async () => {
    await runAction(
      () => update(ref(db), {
        'game_state/current_buzzer': null,
        'game_state/buzzer_active': false,
        'game_state/active_question': null,
        'game_state/show_answer': false,
        'game_state/timer_ends_at': null,
        'game_state/timer_duration': null,
        'game_state/show_question': true,
      }),
      () => setGameState(prev => ({
        ...prev,
        current_buzzer: null,
        buzzer_active: false,
        active_question: null,
        show_answer: false,
        timer_ends_at: null,
        timer_duration: null,
        show_question: true,
      }))
    );
  };

  const value = {
    user,
    playerId,
    players,
    gameState,
    currentPlayer,
    loading,
    error,
    setError,
    connected,
    localMode,
    setLocalMode,
    joinGame,
    buzz,
    activateBuzzer,
    deactivateBuzzer,
    resetBuzzer,
    resetBuzzedStatus,
    selectQuestion,
    revealAnswer,
    revealQuestion,
    adjustScore,
    removePlayer,
    clearAllPlayers,
    resetGameState,
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};
