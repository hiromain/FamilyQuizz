import questionsData from '../data/questions';

// ─── HEAVY MODULE — do not import from lightweight/mobile-first screens ────
// This file drags in the full question bank (all 16 JSON files, ~3.7MB raw).
// Only the Game Master cockpit needs it. Everything else (WelcomeScreen,
// PlayerScreen, ProjectionScreen, shared ui/ components) must import color
// tokens (C, DIFF) from ./theme.js instead, or the question data ends up in
// the bundle every player downloads just to join. GameMasterScreen is lazy
// loaded (see App.jsx) specifically so this module's cost is only paid by
// whoever actually opens the Cockpit.

// ─── Helper to restructure flat themes into a nested Category Tree ─────────
const getCategoryTree = () => {
  const tree = {};
  Object.entries(questionsData).forEach(([key, list]) => {
    let category = 'Divers';
    let subcategory = key;

    if (key.includes(' : ')) {
      const parts = key.split(' : ');
      category = parts[0].trim();
      subcategory = parts[1].trim();
    } else {
      if (['whisky', 'rhum', 'Cépages', 'Accords mets et vins'].includes(key)) {
        category = 'Dégustation';
      } else if (['Martinique', 'lorraine', 'Ardeche', 'Saint Etienne', 'Metz'].includes(key)) {
        category = 'Terroirs & Régions';
      } else if (['rallye', 'porsche'].includes(key)) {
        category = 'Sports mécaniques';
      } else if (['chirurgie cardiaque', 'Anesthésie-Réanimation', 'Médecine Générale'].includes(key)) {
        category = 'Sciences & Médecine';
      } else if (key === 'annees') {
        category = 'Époques (1939-2026)';
      }
    }

    if (!tree[category]) tree[category] = {};
    tree[category][subcategory] = list;
  });
  return tree;
};

export const CATEGORY_TREE = getCategoryTree();

// ─── Category emoji map ──────────────────────────────────────────────────
export const CAT_EMOJI = {
  'Cinéma':                       '🎬',
  'Musique':                      '🎵',
  'Cuisine':                      '🍽️',
  'Sport':                        '⚽',
  'Géographie':                   '🗺️',
  'Histoire':                     '📖',
  'Sciences & Médecine':          '🔬',
  'Sports mécaniques':            '🏎️',
  'Dégustation':                  '🥃',
  'Terroirs & Régions':           '📍',
  'Époques (1939-2026)':          '🕰️',
  'Art, Littérature & Mythologie': '🎨',
  'Nature & Animaux':             '🐾',
  'Langue Française':             '🗣️',
  'Inventions & Découvertes':     '💡',
  'Informatique':                 '💻',
  'Divers':                       '✨',
};
