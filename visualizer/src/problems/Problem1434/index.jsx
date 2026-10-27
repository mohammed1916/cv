import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { DPTable } from '../../components/shared/AlgorithmStatePrimitives'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'No hats', description: 'Nobody has a hat yet; the empty set has one assignment.' },
    { id: 'hat', label: 'Next hat', description: 'Offer this hat to each person who likes it and who has none yet.' },
    { id: 'done', label: 'Complete', description: 'Report the assignments in which everyone has a hat.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Preferences (JSON object with hats as one list of hat numbers per person)',
  url: 'https://leetcode.com/problems/number-of-ways-to-wear-different-hats-to-each-other/',
  complexity: 'O(40 * 2^n * n) time and O(2^n) space. The visualization caps the group at 5 people.',
  examples: [
    { label: 'Example 1', input: '{"hats":[[3,4],[4,5],[5]]}' },
    { label: 'Example 2', input: '{"hats":[[3,5,1],[3,5]]}' },
  ],
}

export default function DifferentHats() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const n = run.hats.length
    return <>
      <DPTable title="ways[mask]: people in mask have hats" values={[step.dp]} rowLabels={['ways']}
        columnLabels={step.dp.map((_, mask) => mask.toString(2).padStart(n, '0'))} />
      <output aria-label="Status">{step.hat === null ? step.message : `Hat ${step.hat}: ${step.message}`}</output>
    </>
  }} renderReasoning={() => <>
    <p>A mask records which people already wear a hat. Hats are processed one at a time, so no hat can be given twice.</p>
    <p>Offering a hat either leaves a mask alone or adds one person who likes it, which is why each hat contributes at most once.</p>
  </>} />
}
