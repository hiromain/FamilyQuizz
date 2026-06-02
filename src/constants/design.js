import questionsData from '../data/questions';

// ─── Design tokens (mirrors index.css variables) ───────────────────────────
export const C = {
  coral:  '#ff8466',
  amber:  '#f5b54a',
  mint:   '#6fe0c4',
  rose:   '#ff6f9c',
  sky:    '#7eb8ff',
  red:    '#ef5973',
  ink:    '#fbf3ee',
  bg:     '#140a1f',
};

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

// ─── Difficulty config ────────────────────────────────────────────────────
export const DIFF = {
  facile:    { color: C.mint,  points: 1, label: 'Facile'    },
  moyen:     { color: C.amber, points: 2, label: 'Moyen'     },
  difficile: { color: C.coral, points: 3, label: 'Difficile' },
};

export const getDiffStyle = (d) => {
  const key = d?.toLowerCase() || 'moyen';
  const cfg = DIFF[key] || DIFF.moyen;
  return {
    background: `${cfg.color}22`,
    border: `1px solid ${cfg.color}66`,
    color: cfg.color,
  };
};
