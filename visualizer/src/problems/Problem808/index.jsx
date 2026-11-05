import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import RecordStateTable from '../../components/shared/RecordStateTable'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Units', description: 'Convert millilitres to 25 ml units.' },
    { id: 'done', label: 'Result', description: 'Read the probability for the start state.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'n in millilitres (JSON integer)',
  url: 'https://leetcode.com/problems/soup-servings/',
  complexity: 'O(units^2) states with a memo, and the units are capped at 200 by the closed-form stop.',
  examples: [
    { label: 'Small', input: '100' },
    { label: 'Medium', input: '300' },
    { label: 'Large', input: '5000' },
  ],
}

export default function SoupServings() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <RecordStateTable label="States evaluated (A units, B units, chance)" columns={['A units', 'B units', 'chance']}
      rows={step.rows.map(r => ({ 'A units': r.a, 'B units': r.b, chance: r.p }))} activeRow={-1} />
    <output aria-label="Step">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>Each turn chooses one of four pours with equal chance. When one side is empty first, the outcome is decided; when both are empty together, it counts as a half.</p>
    <p>Beyond a few hundred millilitres the chance is so close to 1 that the table is not needed.</p>
  </>} />
}
