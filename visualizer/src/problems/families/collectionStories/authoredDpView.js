// Builds the `dpDeps` payload SequenceStory renders with DPDependencyView: the active DP cell, the
// earlier cells it reads, the source that won, the recurrence and the reason for the transition.
const copy = values => (Array.isArray(values[0]) ? values.map(row => [...row]) : [...values]);

/** `sources` are {cell, note, chosen}; `cell` is an index for 1-D tables and [row, column] for 2-D. */
export function dpView({ shape, title, values, target, sources, recurrence, why, rowLabels, columnLabels }) {
  const labels = rowLabels || columnLabels ? { rows: rowLabels, columns: columnLabels } : undefined;
  return { dpDeps: { shape, title, values: copy(values), target, sources, recurrence, why, labels } };
}

/** Mark the sources whose candidate value equals the winner as chosen. */
export const markChosen = (sources, candidates, winner) => sources.map((s, i) => ({ ...s, chosen: candidates[i] === winner }));
