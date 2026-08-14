// ─── Design tokens (mirrors index.css variables) ───────────────────────────
// Kept deliberately free of any question-data import: this file is pulled in
// by almost every screen (including the mobile Player/Welcome screens), so it
// must stay tiny. Category-tree data lives in ./design.js instead.
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
