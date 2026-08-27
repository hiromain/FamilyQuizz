import React from 'react';
import { C, DIFF } from '../../constants/theme';
import { CATEGORY_TREE, CAT_EMOJI } from '../../constants/design';
import MonoLabel from '../../components/ui/MonoLabel';
import Pill from '../../components/ui/Pill';

export function parseYearQuery(query) {
  if (!query) return [];
  const years = new Set();
  const parts = query.toString().split(/[,;&]|\bet\b|\band\b/i);
  
  for (let part of parts) {
    part = part.trim();
    if (!part) continue;
    
    // Check range: e.g. "1995-2000" or "1995 à 2000" or "1995 to 2000" or "1995..2000"
    const rangeMatch = part.match(/^(\d{3,4})\s*(?:-|à|to|\.\.|_)\s*(\d{3,4})$/i);
    if (rangeMatch) {
      const start = parseInt(rangeMatch[1], 10);
      const end = parseInt(rangeMatch[2], 10);
      if (!isNaN(start) && !isNaN(end)) {
        const min = Math.min(start, end);
        const max = Math.max(start, end);
        if (max - min <= 500) {
          for (let y = min; y <= max; y++) {
            years.add(y);
          }
        }
        continue;
      }
    }
    
    // Split by spaces to find individual years
    const tokens = part.split(/\s+/);
    for (let token of tokens) {
      const year = parseInt(token, 10);
      if (!isNaN(year) && year >= 0 && year <= 9999) {
        years.add(year);
      }
    }
  }
  
  return Array.from(years).sort((a, b) => a - b);
}


// Recherche insensible aux accents ("epoques" doit trouver "Époques").
const ACCENT_MAP = { à: 'a', â: 'a', ä: 'a', é: 'e', è: 'e', ê: 'e', ë: 'e', î: 'i', ï: 'i', ô: 'o', ö: 'o', ù: 'u', û: 'u', ü: 'u', ç: 'c', œ: 'oe' };
const normalize = (s) => s.toLowerCase().replace(/[àâäéèêëîïôöùûüçœ]/g, (c) => ACCENT_MAP[c] || c);

export default function FilterPanel({
  connected,
  activeQuestionPool,
  activeDifficulties,
  toggleDifficulty,
  handleSelectAllDifficulties,
  activeSubcategories,
  toggleSubcategory,
  toggleBulkCategory,
  handleSelectAllCategories,
  handleDeselectAllCategories,
  selectedYear,
  setSelectedYear,
  expandedSubcatPanel,
  toggleSubcatPanel,
  quizMode = false,
  onEnterQuizMode,
}) {
  const poolCount = activeQuestionPool.length;
  const [categorySearch, setCategorySearch] = React.useState('');
  const searchTerm = normalize(categorySearch.trim());
  const visibleCategories = !searchTerm ? Object.keys(CATEGORY_TREE) : Object.keys(CATEGORY_TREE).filter(cat => {
    if (normalize(cat).includes(searchTerm)) return true;
    return Object.keys(CATEGORY_TREE[cat]).some(sub => normalize(sub).includes(searchTerm));
  });
  return (
    <aside style={{
      width: '100%',
      background: 'rgba(255,255,255,0.025)',
      display: 'flex', flexDirection: 'column',
      height: '100%',
      overflow: 'hidden', position: 'relative', zIndex: 10, flexShrink: 0,
    }}>

      {/* ─ Header with live question counter ─ */}
      <div style={{
        padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)',
        background: 'rgba(255,255,255,0.03)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 11,
            background: `conic-gradient(from 140deg, ${C.coral}, ${C.amber}, ${C.mint}, ${C.sky}, ${C.coral})`,
            boxShadow: `0 8px 22px -6px ${C.coral}66`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <span style={{ fontSize: 16 }}>⚡</span>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, letterSpacing: '-0.03em', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>Thèmes & Filtres</span>
              <span style={{
                display: 'inline-block', width: 7, height: 7, borderRadius: '50%',
                background: connected ? C.mint : C.red,
                boxShadow: `0 0 8px ${connected ? C.mint : C.red}`,
              }} title={connected ? "Connecté à Firebase" : "Déconnecté de Firebase"} />
            </div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, letterSpacing: '0.18em', color: 'rgba(251,243,238,0.40)', textTransform: 'uppercase' }}>Sélection des questions</div>
          </div>
        </div>
        {/* Live counter */}
        {(() => {
          const n = activeQuestionPool.length;
          const color = n > 20 ? C.mint : n > 5 ? C.amber : C.coral;
          return (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2,
            }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 20, fontWeight: 800, color, letterSpacing: '-0.04em', lineHeight: 1 }}>{n}</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, letterSpacing: '0.12em', color: 'rgba(251,243,238,0.40)', textTransform: 'uppercase' }}>questions</div>
            </div>
          );
        })()}
      </div>

      {/* ─ Difficulty pills ─ */}
      <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <MonoLabel>Difficulté</MonoLabel>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => handleSelectAllDifficulties(true)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 10, color: C.mint, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>
              Toutes
            </button>
            <button onClick={() => handleSelectAllDifficulties(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 10, color: C.red, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>
              Aucune
            </button>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {['facile', 'moyen', 'difficile'].map((level) => {
            const on = activeDifficulties[level];
            const cfg = DIFF[level];
            return (
              <button key={level} onClick={() => toggleDifficulty(level)} style={{
                padding: '12px 6px', borderRadius: 12,
                border: `1.5px solid ${on ? cfg.color + 'aa' : 'rgba(255,255,255,0.08)'}`,
                background: on ? `${cfg.color}22` : 'rgba(255,255,255,0.03)',
                color: on ? cfg.color : 'rgba(251,243,238,0.30)',
                fontWeight: 800, fontSize: 11, cursor: 'pointer',
                fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase',
                letterSpacing: '0.04em', transition: 'all .2s',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                boxShadow: on ? `0 4px 12px ${cfg.color}33` : 'none',
              }}>
                <span>{cfg.label}</span>
                <span style={{ fontSize: 9, opacity: 0.7 }}>{cfg.points}pt{cfg.points > 1 ? 's' : ''}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─ Bulk toggles ─ */}
      <div style={{ display: 'flex', gap: 6, padding: '8px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        {[['✓ Toutes', handleSelectAllCategories, C.mint], ['✗ Aucune', handleDeselectAllCategories, C.red]].map(([label, fn, color]) => (
          <button key={label} onClick={fn} style={{
            flex: 1, padding: '7px 8px', borderRadius: 8,
            background: 'rgba(255,255,255,0.04)', border: `1px solid ${color}33`,
            color, fontSize: 10, fontWeight: 700,
            cursor: 'pointer', fontFamily: "'JetBrains Mono', monospace",
            textTransform: 'uppercase', letterSpacing: '0.05em', transition: 'all .15s',
          }}
            onMouseEnter={e => e.currentTarget.style.background = `${color}18`}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
          >Catégories {label}</button>
        ))}
      </div>

      {/* ─ Category search ─ */}
      <div style={{ padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ position: 'relative' }}>
          <span style={{
            position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
            fontSize: 13, opacity: 0.4, pointerEvents: 'none',
          }}>🔎</span>
          <input
            type="text"
            value={categorySearch}
            onChange={(e) => setCategorySearch(e.target.value)}
            placeholder="Chercher une catégorie ou un thème…"
            style={{
              width: '100%', padding: '9px 12px 9px 32px', borderRadius: 10,
              background: 'rgba(255,255,255,0.04)', border: '1.5px solid rgba(255,255,255,0.08)',
              color: C.ink, fontSize: 12, fontWeight: 500, outline: 'none',
              fontFamily: "'Space Grotesk', sans-serif", boxSizing: 'border-box',
            }}
            onFocus={e => { e.target.style.borderColor = C.sky; }}
            onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; }}
          />
        </div>
        {searchTerm && (
          <div style={{ marginTop: 6, fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: 'rgba(251,243,238,0.35)' }}>
            {visibleCategories.length} catégorie{visibleCategories.length > 1 ? 's' : ''} trouvée{visibleCategories.length > 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* ─ Category cards grid ─ */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 12px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {visibleCategories.map((cat) => {
            const subs = CATEGORY_TREE[cat];
            const subKeys = Object.keys(subs);
            const checkedCount = subKeys.filter(s => activeSubcategories[s]).length;
            const allChecked = checkedCount === subKeys.length;
            const partialChecked = checkedCount > 0 && checkedCount < subKeys.length;
            const noneChecked = checkedCount === 0;
            const isEpoques = cat === 'Époques (1939-2026)';
            const isSubcatOpen = expandedSubcatPanel.has(cat);

            // Active question count for this category
            const catQCount = subKeys.reduce((acc, sub) => {
              if (!activeSubcategories[sub]) return acc;
              const list = subs[sub];
              const filtered = list.filter(q => activeDifficulties[q.difficulty?.toLowerCase() || 'facile']);
              if (sub === 'annees') {
                const targetYears = parseYearQuery(selectedYear);
                return acc + (targetYears.length > 0 ? filtered.filter(q => targetYears.includes(q.year)).length : filtered.length);
              }
              return acc + filtered.length;
            }, 0);

            const borderColor = allChecked ? C.mint : partialChecked ? C.amber : 'rgba(255,255,255,0.08)';
            const bgColor = allChecked ? `${C.mint}14` : partialChecked ? `${C.amber}10` : 'rgba(255,255,255,0.03)';

            return (
              <div key={cat}>
                {/* ── Category card ── */}
                <div style={{
                  borderRadius: 14,
                  border: `1.5px solid ${borderColor}`,
                  background: bgColor,
                  overflow: 'hidden',
                  transition: 'all .25s cubic-bezier(0.2, 0.8, 0.2, 1)',
                }}>
                  {/* Main row: click to expand/collapse */}
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 14px', cursor: 'pointer',
                    userSelect: 'none',
                  }}
                    onClick={() => toggleSubcatPanel(cat)}
                  >
                    {/* Emoji icon — doubles as a quick "toute la catégorie on/off" toggle, sans avoir à déplier */}
                    <div
                      onClick={(e) => { e.stopPropagation(); toggleBulkCategory(cat, noneChecked || partialChecked); }}
                      title={allChecked ? 'Désactiver toute la catégorie' : 'Activer toute la catégorie'}
                      style={{
                        width: 40, height: 40, borderRadius: 10, flexShrink: 0, cursor: 'pointer',
                        background: allChecked ? `${C.mint}22` : noneChecked ? 'rgba(255,255,255,0.04)' : `${C.amber}18`,
                        border: `1px solid ${allChecked ? C.mint + '44' : noneChecked ? 'rgba(255,255,255,0.08)' : C.amber + '44'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 20, transition: 'all .2s',
                        filter: noneChecked ? 'grayscale(0.7) opacity(0.5)' : 'none',
                      }}
                    >
                      {CAT_EMOJI[cat] || '📁'}
                    </div>

                    {/* Name + count */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontWeight: 700, fontSize: 13, letterSpacing: '-0.01em',
                        color: noneChecked ? 'rgba(251,243,238,0.40)' : C.ink,
                        transition: 'color .2s',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      }}>
                        {cat}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
                        <span style={{
                          fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fontWeight: 700,
                          color: catQCount > 0 ? (allChecked ? C.mint : C.amber) : 'rgba(251,243,238,0.25)',
                        }}>
                          {catQCount}Q dispo
                        </span>
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: 'rgba(251,243,238,0.30)' }}>
                          · {checkedCount}/{subKeys.length} sous-cat.
                        </span>
                      </div>
                    </div>

                    {/* Accordion Chevron Indicator */}
                    <div style={{
                      width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      color: isSubcatOpen ? C.sky : 'rgba(251,243,238,0.45)',
                      fontSize: 10, display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                      transition: 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1), color 0.2s',
                      transform: isSubcatOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    }}>
                      ▼
                    </div>
                  </div>

                  {/* ── Subcategory Drawer (revealed on expand) ── */}
                  {isSubcatOpen && (
                    <div style={{
                      padding: '12px 14px 16px',
                      borderTop: '1px solid rgba(255,255,255,0.06)',
                      background: 'rgba(0,0,0,0.18)',
                    }}>
                      {/* Drawer Bulk Select Toggles */}
                      <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleBulkCategory(cat, true); }}
                          style={{
                            flex: 1, padding: '6px 8px', borderRadius: 8,
                            background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.mint}33`,
                            color: C.mint, fontSize: 10, fontWeight: 700,
                            cursor: 'pointer', fontFamily: "'JetBrains Mono', monospace",
                            textTransform: 'uppercase', letterSpacing: '0.04em', transition: 'all .15s',
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = `${C.mint}18`}
                          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                        >
                          ✓ Tout activer
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleBulkCategory(cat, false); }}
                          style={{
                            flex: 1, padding: '6px 8px', borderRadius: 8,
                            background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.red}33`,
                            color: C.red, fontSize: 10, fontWeight: 700,
                            cursor: 'pointer', fontFamily: "'JetBrains Mono', monospace",
                            textTransform: 'uppercase', letterSpacing: '0.04em', transition: 'all .15s',
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = `${C.red}18`}
                          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                        >
                          ✗ Tout désactiver
                        </button>
                      </div>

                      {/* Year text input for Époques */}
                      {isEpoques && (
                        <div style={{
                          marginBottom: 12,
                          padding: '12px 14px',
                          borderRadius: 12,
                          background: 'rgba(255,255,255,0.02)',
                          border: '1px solid rgba(255,255,255,0.06)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 8,
                          boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.2)'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{
                              fontFamily: "'JetBrains Mono', monospace",
                              fontSize: 10,
                              color: 'rgba(251,243,238,0.45)',
                              textTransform: 'uppercase',
                              letterSpacing: '0.12em'
                            }}>
                              Années cibles
                            </span>
                            {(() => {
                              const isEmptyQuery = !selectedYear || !selectedYear.trim();
                              const parsed = parseYearQuery(selectedYear);
                              // Champ vide = pas de restriction (toutes les années passent) : ce n'est pas
                              // une absence de sélection, donc pas de couleur "alerte" comme un vrai 0 résultat.
                              const label = isEmptyQuery
                                ? 'Toutes les années'
                                : parsed.length > 0
                                  ? `${parsed.length} an${parsed.length > 1 ? 's' : ''} sélectionné${parsed.length > 1 ? 's' : ''}`
                                  : 'Aucune correspondance';
                              const tone = isEmptyQuery ? C.mint : parsed.length > 0 ? C.sky : C.coral;
                              return (
                                <span style={{
                                  fontFamily: "'JetBrains Mono', monospace",
                                  fontSize: 11,
                                  fontWeight: 700,
                                  color: tone,
                                  background: `${tone}18`,
                                  padding: '2px 8px',
                                  borderRadius: 6,
                                  border: `1px solid ${tone}33`
                                }}>
                                  {label}
                                </span>
                              );
                            })()}
                          </div>
                          
                          <input
                            type="text"
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                            placeholder="Laisser vide = toutes les années. Ex: 1998, 2000-2005"
                            style={{
                              width: '100%',
                              padding: '10px 12px',
                              borderRadius: 8,
                              background: 'rgba(0, 0, 0, 0.25)',
                              border: '1.5px solid rgba(255, 255, 255, 0.1)',
                              color: C.ink,
                              fontSize: 13,
                              fontWeight: 600,
                              fontFamily: "'Space Grotesk', sans-serif",
                              outline: 'none',
                              transition: 'all 0.2s ease',
                              boxSizing: 'border-box'
                            }}
                            onFocus={e => {
                              e.target.style.borderColor = C.sky;
                              e.target.style.boxShadow = `0 0 10px ${C.sky}33`;
                            }}
                            onBlur={e => {
                              e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                              e.target.style.boxShadow = 'none';
                            }}
                          />
                          
                          <div style={{
                            fontSize: 10,
                            color: 'rgba(251,243,238,0.35)',
                            lineHeight: 1.4,
                            marginTop: 2
                          }}>
                            Séparez par des virgules ou espaces. Utilisez un tiret pour les plages (ex: <b>1998-2005</b>).
                          </div>

                          {/* Quick Year suggestions/presets tags */}
                          {(() => {
                            const presets = [
                              { label: 'Toutes', query: '' },
                              { label: 'Années 80', query: '1980-1989' },
                              { label: 'Années 90', query: '1990-1999' },
                              { label: 'Années 2000', query: '2000-2009' },
                              { label: 'Années 2010', query: '2010-2019' },
                            ];
                            return (
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 6 }}>
                                {presets.map((preset) => {
                                  const isActive = selectedYear === preset.query;
                                  return (
                                    <button
                                      key={preset.label}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedYear(preset.query);
                                      }}
                                      style={{
                                        padding: '4px 8px',
                                        borderRadius: 6,
                                        border: `1.5px solid ${isActive ? C.sky : 'rgba(255,255,255,0.06)'}`,
                                        background: isActive ? `${C.sky}22` : 'rgba(255,255,255,0.03)',
                                        color: isActive ? C.sky : 'rgba(251,243,238,0.40)',
                                        fontSize: 9,
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                        fontFamily: "'JetBrains Mono', monospace",
                                        transition: 'all 0.15s'
                                      }}
                                      onMouseEnter={e => {
                                        if (!isActive) e.currentTarget.style.color = '#fff';
                                      }}
                                      onMouseLeave={e => {
                                        if (!isActive) e.currentTarget.style.color = 'rgba(251,243,238,0.40)';
                                      }}
                                    >
                                      {preset.label}
                                    </button>
                                  );
                                })}
                              </div>
                            );
                          })()}

                          {/* Une année précise : grille de pills cliquables (un clic = une seule année sélectionnée) */}
                          {(() => {
                            const epoquesYears = [...new Set(subs['annees'].map(q => q.year))].sort((a, b) => a - b);
                            const activeYears = parseYearQuery(selectedYear);
                            return (
                              <div style={{ marginTop: 8 }}>
                                <div style={{
                                  fontFamily: "'JetBrains Mono', monospace",
                                  fontSize: 9,
                                  color: 'rgba(251,243,238,0.35)',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.1em',
                                  marginBottom: 5,
                                }}>
                                  Ou une année précise
                                </div>
                                <div style={{
                                  display: 'flex', flexWrap: 'wrap', gap: 4,
                                  maxHeight: 130, overflowY: 'auto',
                                  padding: '2px 2px 2px 0',
                                }}>
                                  {epoquesYears.map((year) => {
                                    const isActive = activeYears.length === 1 && activeYears[0] === year;
                                    return (
                                      <button
                                        key={year}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setSelectedYear(String(year));
                                        }}
                                        style={{
                                          padding: '4px 7px',
                                          borderRadius: 6,
                                          border: `1.5px solid ${isActive ? C.mint : 'rgba(255,255,255,0.06)'}`,
                                          background: isActive ? `${C.mint}22` : 'rgba(255,255,255,0.03)',
                                          color: isActive ? C.mint : 'rgba(251,243,238,0.40)',
                                          fontSize: 9,
                                          fontWeight: 700,
                                          cursor: 'pointer',
                                          fontFamily: "'JetBrains Mono', monospace",
                                          transition: 'all 0.15s'
                                        }}
                                        onMouseEnter={e => {
                                          if (!isActive) e.currentTarget.style.color = '#fff';
                                        }}
                                        onMouseLeave={e => {
                                          if (!isActive) e.currentTarget.style.color = 'rgba(251,243,238,0.40)';
                                        }}
                                      >
                                        {year}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      )}

                      {/* Chips */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {subKeys.map((sub) => {
                          const isChecked = !!activeSubcategories[sub];
                          const count = subs[sub].length;
                          const yearTargets = sub === 'annees' ? parseYearQuery(selectedYear) : null;
                          const displayCount = sub === 'annees'
                            ? (yearTargets.length > 0 ? subs[sub].filter(q => yearTargets.includes(q.year)).length : count)
                            : count;
                          return (
                            <button
                              key={sub}
                              onClick={(e) => { e.stopPropagation(); toggleSubcategory(sub); }}
                              style={{
                                padding: '5px 10px', borderRadius: 8, cursor: 'pointer',
                                border: `1px solid ${isChecked ? C.sky + '88' : 'rgba(255,255,255,0.12)'}`,
                                background: isChecked ? `${C.sky}22` : 'rgba(255,255,255,0.04)',
                                color: isChecked ? C.sky : 'rgba(251,243,238,0.45)',
                                fontSize: 11, fontWeight: 600, transition: 'all .15s',
                                display: 'flex', alignItems: 'center', gap: 5,
                              }}
                            >
                              <span>{sub}</span>
                              <span style={{
                                fontFamily: "'JetBrains Mono', monospace", fontSize: 9, fontWeight: 700,
                                opacity: 0.7,
                              }}>{displayCount}Q</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─ Sticky footer: start the session with the categories picked above ─ */}
      {onEnterQuizMode && (
        <div style={{
          flexShrink: 0, padding: '12px 16px',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          background: 'rgba(0,0,0,0.20)',
        }}>
          {!quizMode ? (
            <button
              onClick={onEnterQuizMode}
              disabled={poolCount === 0}
              style={{
                width: '100%', height: 48, borderRadius: 14, border: 'none',
                cursor: poolCount === 0 ? 'not-allowed' : 'pointer',
                opacity: poolCount === 0 ? 0.4 : 1,
                background: `linear-gradient(135deg, ${C.mint}, #52c9b0)`,
                boxShadow: poolCount === 0 ? 'none' : `0 10px 26px -8px ${C.mint}66`,
                color: '#0d2820', fontWeight: 800, fontSize: 14, letterSpacing: '-0.01em',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'transform 0.15s, box-shadow 0.15s',
                touchAction: 'manipulation',
              }}
            >
              🚀 Démarrer la session
              <span style={{ background: 'rgba(0,0,0,0.15)', padding: '2px 9px', borderRadius: 8, fontSize: 12 }}>
                {poolCount} Q
              </span>
            </button>
          ) : (
            <button
              onClick={onEnterQuizMode}
              style={{
                width: '100%', height: 48, borderRadius: 14,
                border: `1px solid ${C.mint}44`,
                cursor: 'pointer',
                background: `${C.mint}14`,
                color: C.mint, fontWeight: 700, fontSize: 13,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                touchAction: 'manipulation',
              }}
            >
              ✓ Session en cours · Aller au jeu →
            </button>
          )}
        </div>
      )}

    </aside>
  );
}
