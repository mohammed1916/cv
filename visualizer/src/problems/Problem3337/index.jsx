import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Count letters', description: 'Count how many times each letter appears in s.' },
    { id: 'apply', label: 'Apply table', description: 'A set bit of t means the counts move forward by that many rounds at once.' },
    { id: 'square', label: 'Square table', description: 'Square the table so it covers twice as many rounds.' },
    { id: 'done', label: 'Complete', description: 'Add up the counts to get the length.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with s, t, and nums (26 integers from 1 to 25) (JSON)',
  url: 'https://leetcode.com/problems/total-characters-in-string-after-transformations-ii/',
  complexity: 'O(26^3 * log t) time and O(26^2) space. The visualization caps s at 12 letters and t at 1000 rounds.',
  examples: [
    { label: 'Own case 1', input: '{"s":"bcdzz","t":3,"nums":[2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,3]}' },
    { label: 'Example 2', input: '{"s":"a","t":2,"nums":[2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]}' },
    { label: 'Zero transformations', input: '{"s":"a","t":0,"nums":[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]}' },
    { label: 'Repeated letter, largest mapping', input: '{"s":"zz","t":1,"nums":[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,25]}' },
    { label: 'Longest allowed s, t = 1000', input: '{"s":"ckbyavhuwgfc","t":1000,"nums":[11,4,25,2,13,16,9,13,10,22,19,13,21,12,22,5,3,17,15,7,7,6,1,5,18,16]}' },
    { label: 'Long run: 777 rounds', input: '{"s":"bybcbcyyacyz","t":777,"nums":[23,8,18,4,16,25,15,25,9,20,6,2,5,11,3,8,7,22,13,23,19,20,12,9,4,25]}' },
  ],
}

export default function TotalCharactersII() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Count of each letter (0 = a, 25 = z)" length={26} valueAt={index => step.counts[index]}
      roleAt={index => (step.counts[index] > 0 ? 'present' : '')} />
    <output aria-label="Length">{`Table bit ${step.bit}. Length: ${step.length} for t = ${run.input.t}`}</output>
  </>} renderReasoning={() => <>
    <p>The transformation is the same every round, so the effect of t rounds is a 26 by 26 table raised to the power t.</p>
    <p>Repeated squaring applies only the table powers whose bits are set in t, so a huge t needs about log t steps.</p>
  </>} />
}
