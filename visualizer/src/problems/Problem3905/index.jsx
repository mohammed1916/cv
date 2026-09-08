import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import PagedGrid from '../../components/shared/PagedGrid'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, cellAtStep } from './algorithm'

const definition = {
  parse: parseInput, build: buildTrace, code, inputLabel: 'Grid dimensions and sources (JSON object)',
  url: 'https://leetcode.com/problems/multi-source-flood-fill/',
  complexity: 'O(n × m) time and space. Each cell joins one frontier; at most four neighbors propose a color. Arrival times reconstruct every frame without copying the whole grid per step.',
  phases: [
    { id: 'start', label: 'Sources', description: 'Place all initial sources simultaneously.' },
    { id: 'propose', label: 'Spread / resolve ties', description: 'Gather proposals without allowing pending cells to spread.' },
    { id: 'commit', label: 'Commit wave', description: 'Apply each winning color simultaneously.' },
    { id: 'done', label: 'Complete', description: 'Inspect the final grid.' },
  ],
  examples: [
    { label: 'Competing corners', input: '{"n":3,"m":3,"sources":[[0,0,1],[2,2,2]]}' },
    { label: 'Adjacent sources', input: '{"n":3,"m":3,"sources":[[0,1,3],[1,1,5]]}' },
    { label: 'Single source', input: '{"n":2,"m":2,"sources":[[1,1,5]]}' },
    { label: 'Already filled', input: '{"n":1,"m":2,"sources":[[0,0,1],[0,1,9]]}' },
  ],
}

export default function MultiSourceFloodFill() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <p>Time {step.time} · {step.colored} / {run.n * run.m} committed cells. “?” marks a proposal, not a committed color.</p>
    <PagedGrid rows={run.n} columns={run.m} cellAt={(r, c) => cellAtStep(run, step, r, c)} label="Flood fill grid" />
    <IndexedSequence label="Current wave frontier [row,column]" length={run.layers[step.layer].length}
      valueAt={i => { const index = run.layers[step.layer][i]; return `[${Math.floor(index / run.m)},${index % run.m}]` }} />
    {step.phase === 'done' && <output aria-label="Final grid">{JSON.stringify(run.result)}</output>}
  </>} renderReasoning={({ step }) => <>
    <p>All cells in the current wave spread together. Pending targets only join the next wave after every competing proposal is collected.</p>
    <p><strong>Tie rule:</strong> maximize color only among arrivals at the same time. A later, larger color cannot overwrite an already colored cell.</p>
    {step.phase === 'propose' && <p>Pending cells: {step.pending}. Cells with multiple distinct colors: {step.conflicts}.</p>}
    <p>Select any grid cell to inspect its incoming colors and arrival time. Row and column pages retain the grid geometry; every coordinate is accessible.</p>
  </>} />
}
