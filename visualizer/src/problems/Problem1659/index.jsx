import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { DPTable } from '../../components/shared/AlgorithmStatePrimitives'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Empty grid', description: 'No one is seated, so there is one empty profile.' },
    { id: 'cell', label: 'Next cell', description: 'Try leaving this cell empty or seating an introvert or an extrovert.' },
    { id: 'done', label: 'Complete', description: 'Report the best total over all profiles.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Grid (JSON object with m, n, introverts, and extroverts)',
  url: 'https://leetcode.com/problems/maximize-grid-happiness/',
  complexity: 'O(m * n * 3^n * (intro * extro)) time. The visualization caps the grid at 3 by 3.',
  examples: [
    { label: 'Two by three', input: '{"m":2,"n":3,"introverts":1,"extroverts":2}' },
    { label: 'Three by one', input: '{"m":3,"n":1,"introverts":2,"extroverts":1}' },
    { label: 'One cell', input: '{"m":1,"n":1,"introverts":1,"extroverts":0}' },
    { label: 'Equal counts', input: '{"m":2,"n":2,"introverts":2,"extroverts":2}' },
    { label: 'No extroverts', input: '{"m":3,"n":2,"introverts":3,"extroverts":0}' },
    { label: 'Long run: full 3 by 3 grid', input: '{"m":3,"n":3,"introverts":5,"extroverts":4}' },
  ],
}

export default function GridHappiness() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const cells = run.input.m * run.input.n
    return <>
      <DPTable title="Profiles kept after each cell (row-major)" values={[step.counts.map(v => (v === null ? '–' : v))]}
        rowLabels={['profiles']} columnLabels={Array.from({ length: cells }, (_, i) => i + 1)}
        activeCell={step.cell ? { row: 0, column: step.cell[0] * run.input.n + step.cell[1] } : null} />
      <output aria-label="Status">{step.message}</output>
    </>
  }} renderReasoning={() => <>
    <p>Only the cell above and the cell to the left can touch a new person, so the state is the last n cells plus how many of each type are placed.</p>
    <p>Every new neighbour pair adds the effect on both people: introverts lose 30 and extroverts gain 20 for each neighbour.</p>
  </>} />
}
