import questionsData from '../data/questions';
import { DIFF } from '../constants/theme';

// ─── Pure helpers for the "Défi temps décalé" (asynchronous turn-by-turn duel) ──
//
// A duel is a 2-player, turn-based, asynchronous quiz. Both players answer the
// exact same pre-generated rounds; only QCM (multiple-choice) questions are used
// so the scoring can be done automatically, with no game master in the loop.

// ─── Theme metadata (reuse the same category mapping logic as design.js) ──────
const themeCategory = (key) => {
  if (key.includes(' : ')) return key.split(' : ')[0].trim();
  if (['whisky', 'rhum'].includes(key)) return 'Dégustation';
  if (['Martinique', 'lorraine', 'Ardeche', 'Saint Etienne', 'Metz'].includes(key)) return 'Terroirs & Régions';
  if (['rallye', 'porsche'].includes(key)) return 'Sports mécaniques';
  if (key === 'chirurgie cardiaque') return 'Sciences & Médecine';
  if (key === 'annees') return 'Époques (1939-2026)';
  return 'Divers';
};

const themeLabel = (key) => (key.includes(' : ') ? key.split(' : ')[1].trim() : key);

// ─── Build the pool of themes that have enough QCM questions ──────────────────
// Returns: [{ key, label, category, count }]
export const getQcmThemes = (minCount = 3) => {
  return Object.entries(questionsData)
    .map(([key, list]) => {
      const qcm = (list || []).filter((q) => q.type === 'qcm' && Array.isArray(q.options) && q.options.length >= 2);
      return { key, label: themeLabel(key), category: themeCategory(key), count: qcm.length };
    })
    .filter((t) => t.count >= minCount)
    .sort((a, b) => a.category.localeCompare(b.category) || a.label.localeCompare(b.label));
};

// ─── Random sampling helper ───────────────────────────────────────────────────
const sample = (arr, n) => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, n);
};

const diffPoints = (d) => {
  const key = (d || 'moyen').toLowerCase();
  return DIFF[key]?.points || 2;
};

// ─── Normalize an answer string (case / accent insensitive) ───────────────────
const normalize = (s) =>
  (s || '')
    .toString()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();

// ─── Find the index of the correct option for a QCM question ──────────────────
const correctIndexOf = (q) => {
  const direct = q.options.findIndex((o) => o === q.answer);
  if (direct !== -1) return direct;
  return q.options.findIndex((o) => normalize(o) === normalize(q.answer));
};

// ─── Build the rounds for a new duel ──────────────────────────────────────────
// Each round = one theme + `qPerRound` QCM questions (options shuffled).
// `themeKeys` optionally restricts the pool; otherwise all eligible themes.
export const buildRounds = ({ rounds = 5, qPerRound = 3, themeKeys = null } = {}) => {
  const pool = getQcmThemes(qPerRound).filter((t) => !themeKeys || themeKeys.includes(t.key));
  const chosenThemes = sample(pool, Math.min(rounds, pool.length));

  return chosenThemes.map((theme) => {
    const qcm = (questionsData[theme.key] || []).filter(
      (q) => q.type === 'qcm' && Array.isArray(q.options) && q.options.length >= 2
    );
    const picked = sample(qcm, qPerRound).map((q) => {
      // Shuffle options but remember which one is correct
      const correctText = q.options[correctIndexOf(q)] ?? q.answer;
      const shuffled = sample(q.options, q.options.length);
      const correctIndex = Math.max(0, shuffled.findIndex((o) => o === correctText));
      return {
        id: q.id || '',
        question: q.question || '',
        options: shuffled,
        correctIndex,
        answer: correctText,
        difficulty: q.difficulty || 'Moyen',
        points: diffPoints(q.difficulty),
        explanation: q.explanation || null,
      };
    });
    return { theme: theme.label, category: theme.category, themeKey: theme.key, questions: picked };
  });
};

// ─── Score a player's picks for a single round ────────────────────────────────
// picks: array of selected option indexes (one per question; -1 if skipped)
export const scoreRound = (round, picks) => {
  let correct = 0;
  let points = 0;
  round.questions.forEach((q, i) => {
    if (picks?.[i] === q.correctIndex) {
      correct += 1;
      points += q.points;
    }
  });
  return { correct, total: round.questions.length, points };
};

// ─── Whose turn is it? ────────────────────────────────────────────────────────
// Returns the playerId who should play next, or null (waiting / finished).
export const whoseTurn = (duel) => {
  if (!duel || duel.status !== 'active') return null;
  const order = duel.playerOrder || Object.keys(duel.players || {});
  if (order.length < 2) return null;
  const [p0, p1] = order;
  const prog0 = duel.players?.[p0]?.progress || 0;
  const prog1 = duel.players?.[p1]?.progress || 0;
  const total = duel.config?.rounds || 0;
  if (prog0 >= total && prog1 >= total) return null; // finished
  if (prog0 <= prog1 && prog0 < total) return p0;
  if (prog1 < total) return p1;
  return null;
};

// ─── Has the whole duel finished? ─────────────────────────────────────────────
export const isDuelOver = (duel) => {
  if (!duel) return false;
  const order = duel.playerOrder || Object.keys(duel.players || {});
  if (order.length < 2) return false;
  const total = duel.config?.rounds || 0;
  return order.every((id) => (duel.players?.[id]?.progress || 0) >= total);
};

// ─── Status label from a single player's point of view ────────────────────────
export const duelStatusForPlayer = (duel, playerId) => {
  if (!duel) return { label: 'Inconnu', tone: 'dim' };
  if (duel.status === 'waiting') {
    return duel.createdBy === playerId
      ? { label: "En attente d'un adversaire", tone: 'amber' }
      : { label: 'Prêt à rejoindre', tone: 'mint' };
  }
  if (isDuelOver(duel)) return { label: 'Terminé', tone: 'sky' };
  const turn = whoseTurn(duel);
  if (turn === playerId) return { label: 'À toi de jouer !', tone: 'coral' };
  const opponent = (duel.playerOrder || []).find((id) => id !== playerId);
  return { label: `Au tour de ${duel.players?.[opponent]?.nickname || "l'adversaire"}`, tone: 'dim' };
};

// ─── Short shareable code generator ───────────────────────────────────────────
export const generateCode = () => {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no ambiguous chars
  let code = '';
  for (let i = 0; i < 4; i++) code += alphabet[Math.floor(Math.random() * alphabet.length)];
  return code;
};

export { normalize };
