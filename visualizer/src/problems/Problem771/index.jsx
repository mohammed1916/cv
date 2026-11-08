import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Jewel set', description: 'Put the jewel types in a set.' },
    { id: 'jewel', label: 'Jewel stone', description: 'A stone whose letter is in the set is counted.' },
    { id: 'stone', label: 'Plain stone', description: 'A stone whose letter is not in the set is skipped.' },
    { id: 'done', label: 'Complete', description: 'Return the count.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'jewels and stones (JSON object of letter strings)',
  url: 'https://leetcode.com/problems/jewels-and-stones/',
  complexity: 'O(j + s) time for j jewel types and s stones, and O(j) extra space.',
  examples: [
    { label: 'Mixed case', input: '{"jewels":"aB","stones":"aAbBcC"}' },
    { label: 'None', input: '{"jewels":"xyz","stones":"abc"}' }, { label: 'Single stone match', input: '{"jewels":"a","stones":"a"}' }, { label: 'Case matters', input: '{"jewels":"aA","stones":"aAaA"}' }, { label: 'No matches', input: '{"jewels":"xyz","stones":"abc"}' }, { label: 'Long run: 50 stones', input: '{"jewels":"aeiouAEIOU","stones":"eaddozczAxxuzuAecbAcezbxaIuIAoOyazeocdoOcuzyzAuoeA"}' },
  ],
}

export default function JewelsAndStones() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label={`Stones (jewel types: ${run.input.jewels || 'none'})`} length={run.input.stones.length} active={step.index}
      valueAt={i => run.input.stones[i]}
      roleAt={i => (i < step.index ? (run.input.jewels.includes(run.input.stones[i]) ? 'jewel' : 'stone') : '')} />
    <output aria-label="Count">{`Jewel stones so far: ${step.count}`}</output>
    <p role="status">{step.message}</p>
  </>} renderReasoning={() => <>
    <p>Letters are case sensitive, so a and A are different types. A set answers each membership question in constant time.</p>
  </>} />
}
