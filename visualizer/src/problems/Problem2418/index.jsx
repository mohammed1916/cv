import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Pair up', description: 'Each name stays paired with its height.' },
    { id: 'find', label: 'Find tallest', description: 'Scan the remaining people for the greatest height.' },
    { id: 'take', label: 'Take', description: 'Move the tallest remaining person to the result.' },
    { id: 'done', label: 'Complete', description: 'Report the names from tallest to shortest.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with names and heights (distinct heights)',
  url: 'https://leetcode.com/problems/sort-the-people/',
  complexity: 'O(n^2) time for this selection walk, O(n) space. The visualization caps input at 12 people.',
  examples: [
    { label: 'Three people', input: '{"names":["Ana","Ben","Cleo"],"heights":[150,190,170]}' },
    { label: 'Two people', input: '{"names":["Dev","Eli"],"heights":[160,175]}' },
    { label: 'Single person', input: '{"names":["Zoe"],"heights":[100]}' },
    { label: 'Extreme heights', input: '{"names":["Ivy","Max"],"heights":[1,1000]}' },
    { label: 'Twelve people', input: '{"names":["Ana","Bo","Cy","Dee","Eve","Fay","Gus","Hal","Ivy","Jo","Kai","Lu"],"heights":[1000,999,998,997,996,995,994,993,992,991,990,989]}' },
    { label: 'Long run: 12 people', input: '{"names":["Ras","Dqp","Yut","Vxo","Kgg","Vxe","Kho","Ieq","Zde","Nel","Qmw","Yvy"],"heights":[417,50,580,558,712,106,606,332,251,547,148,936]}' },
  ],
}

export default function SortThePeople() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="People in input order" length={run.input.names.length} valueAt={i => `${run.input.names[i]} (${run.input.heights[i]})`}
      active={step.picked ?? -1} roleAt={i => (step.taken.includes(i) ? 'taken' : '')} />
    <output aria-label="Result so far">{`Order so far: ${step.result.join(', ') || '(none yet)'}`}</output>
  </>} renderReasoning={() => <>
    <p>Heights are distinct, so the tallest remaining person is unambiguous at every step.</p>
    <p>Pairing each name with its height before reordering keeps every name attached to its own height.</p>
  </>} />
}
