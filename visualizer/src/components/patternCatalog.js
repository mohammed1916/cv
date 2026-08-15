// One vocabulary for code annotations, legends, and the floating pattern cue.
// Visualizers may use a bespoke phase name; resolvePattern still turns it into
// a readable instruction instead of silently dropping it from the guide.
export const PATTERN_CATALOG = {
  init: ['◯', 'Set up state', 'var(--info)'],
  setup_sets: ['◯', 'Create disjoint sets', 'var(--info)'],
  state_setup: ['◯', 'Prepare search state', 'var(--info)'],
  candidate_loop: ['⟳', 'Try each candidate', 'var(--primary)'],
  loop: ['⟳', 'Iterate candidates', 'var(--primary)'],
  check: ['? ', 'Check constraint', 'var(--warning)'],
  conflict_check: ['? ', 'Test for conflict', 'var(--warning)'],
  prune_conflict: ['×', 'Prune invalid choice', 'var(--error)'],
  skip: ['×', 'Skip invalid choice', 'var(--error)'],
  place: ['♛', 'Commit a choice', 'var(--primary)'],
  remove: ['↩', 'Undo choice', 'var(--error)'],
  backtrack: ['↩', 'Backtrack', 'var(--error)'],
  recursive_search: ['↳', 'Recurse to next state', 'var(--primary)'],
  solution: ['✓', 'Record a solution', 'var(--success)'],
  done: ['✓', 'Return result', 'var(--success)'],
  find_root: ['↑', 'Find component root', 'var(--info)'],
  path_compression: ['⇡', 'Path compression', 'var(--primary)'],
  union_roots: ['⟷', 'Union components', 'var(--success)'],
  scan_edges: ['⌕', 'Scan connections', 'var(--primary)'],
  count_components: ['#', 'Count components', 'var(--success)'],
  memo: ['▣', 'Memoize result', 'var(--primary)'],
  cache_hit: ['↺', 'Reuse cached result', 'var(--success)'],
  dp: ['▦', 'DP transition', 'var(--primary)'],
  compare: ['↔', 'Compare candidates', 'var(--warning)'],
  update: ['↑', 'Update best answer', 'var(--success)'],
  merge: ['⇄', 'Merge results', 'var(--primary)'],
  partition: ['│', 'Partition range', 'var(--warning)'],
};

const titleCase = (value) => value
  .replace(/[_-]+/g, ' ')
  .replace(/\b\w/g, (letter) => letter.toUpperCase());

export function resolvePattern(phase) {
  if (!phase) return null;
  if (PATTERN_CATALOG[phase]) {
    const [icon, label, color] = PATTERN_CATALOG[phase];
    return { icon, label, color };
  }

  const normalized = phase.toLowerCase();
  const inferred = Object.keys(PATTERN_CATALOG).find((key) => normalized.includes(key));
  if (inferred) {
    const [icon, label, color] = PATTERN_CATALOG[inferred];
    return { icon, label, color };
  }
  return { icon: '•', label: titleCase(phase), color: 'var(--text-muted)' };
}
