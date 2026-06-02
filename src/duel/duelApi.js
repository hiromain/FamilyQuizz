import { ref, push, set, get, update, onValue, query, orderByChild, equalTo } from 'firebase/database';
import { db } from '../firebase/config';
import { buildRounds, scoreRound, whoseTurn, isDuelOver, generateCode } from './duelLogic';

// ─── Firebase data access for asynchronous duels ──────────────────────────────
// Data model (under /duels/{duelId}):
//   id, code, createdAt, createdBy, status: 'waiting'|'active'|'finished',
//   config: { rounds, qPerRound },
//   players: { [pid]: { id, nickname, score, progress, joinedAt } },
//   playerOrder: [creatorId, opponentId],
//   rounds: [ { theme, category, questions:[{...,correctIndex,points}] } ],
//   answers: { [pid]: { [roundIndex]: { picks, correct, points } } }

const duelsRef = () => ref(db, 'duels');

// ─── Create a new duel and return { id, code } ────────────────────────────────
export const createDuel = async ({ playerId, nickname, rounds = 5, qPerRound = 3, themeKeys = null }) => {
  const builtRounds = buildRounds({ rounds, qPerRound, themeKeys });
  const code = generateCode();
  const node = push(duelsRef());
  const duel = {
    id: node.key,
    code,
    createdAt: Date.now(),
    createdBy: playerId,
    status: 'waiting',
    config: { rounds: builtRounds.length, qPerRound },
    players: {
      [playerId]: { id: playerId, nickname: nickname || 'Joueur', score: 0, progress: 0, joinedAt: Date.now() },
    },
    playerOrder: [playerId],
    rounds: builtRounds,
    answers: {},
  };
  await set(node, duel);
  return { id: node.key, code };
};

// ─── Look up a duel by its short code ─────────────────────────────────────────
export const findDuelByCode = async (code) => {
  const snap = await get(query(duelsRef(), orderByChild('code'), equalTo(code.toUpperCase())));
  const val = snap.val();
  if (!val) return null;
  const id = Object.keys(val)[0];
  return { id, ...val[id] };
};

// ─── Join a duel as the second player ─────────────────────────────────────────
export const joinDuel = async ({ duelId, playerId, nickname }) => {
  const dRef = ref(db, `duels/${duelId}`);
  const snap = await get(dRef);
  const duel = snap.val();
  if (!duel) throw new Error("Ce défi n'existe plus.");
  if (duel.players?.[playerId]) return duel; // already in
  const order = duel.playerOrder || Object.keys(duel.players || {});
  if (order.length >= 2) throw new Error('Ce défi est déjà complet (2 joueurs).');

  await update(ref(db), {
    [`duels/${duelId}/players/${playerId}`]: {
      id: playerId, nickname: nickname || 'Joueur', score: 0, progress: 0, joinedAt: Date.now(),
    },
    [`duels/${duelId}/playerOrder`]: [...order, playerId],
    [`duels/${duelId}/status`]: 'active',
  });
  return duel;
};

// ─── Submit a player's answers for the round they are currently on ────────────
// Validates it is actually this player's turn, scores the round, advances them.
export const submitRound = async ({ duelId, playerId, picks }) => {
  const dRef = ref(db, `duels/${duelId}`);
  const snap = await get(dRef);
  const duel = snap.val();
  if (!duel) throw new Error("Ce défi n'existe plus.");
  if (whoseTurn(duel) !== playerId) throw new Error("Ce n'est pas ton tour.");

  const roundIndex = duel.players[playerId].progress || 0;
  const round = duel.rounds[roundIndex];
  const result = scoreRound(round, picks);
  const newScore = (duel.players[playerId].score || 0) + result.points;
  const newProgress = roundIndex + 1;

  const updates = {
    [`duels/${duelId}/answers/${playerId}/${roundIndex}`]: { picks, ...result },
    [`duels/${duelId}/players/${playerId}/score`]: newScore,
    [`duels/${duelId}/players/${playerId}/progress`]: newProgress,
  };

  // Mark the duel finished once both players have completed every round
  const projected = {
    ...duel,
    players: { ...duel.players, [playerId]: { ...duel.players[playerId], progress: newProgress } },
  };
  if (isDuelOver(projected)) updates[`duels/${duelId}/status`] = 'finished';

  await update(ref(db), updates);
  return { roundIndex, round, result };
};

// ─── Realtime subscription to a single duel ───────────────────────────────────
export const subscribeDuel = (duelId, cb) => {
  const dRef = ref(db, `duels/${duelId}`);
  return onValue(dRef, (snap) => cb(snap.val()));
};

// ─── Realtime subscription to every duel this player is part of ───────────────
// (Family-scale data set — we filter client-side rather than maintain an index.)
export const subscribeMyDuels = (playerId, cb) => {
  return onValue(duelsRef(), (snap) => {
    const all = snap.val() || {};
    const mine = Object.values(all)
      .filter((d) => d.players && d.players[playerId])
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    cb(mine);
  });
};
