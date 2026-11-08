import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with a total of zero.' },
    { id: 'index', label: 'Position', description: 'Look at one position of s and t.' },
    { id: 'same', label: 'Equal', description: 'Matching letters cost nothing.' },
    { id: 'forward', label: 'Forward', description: 'Sum the next-step costs around the alphabet.' },
    { id: 'backward', label: 'Backward', description: 'Sum the previous-step costs the other way.' },
    { id: 'choose', label: 'Choose', description: 'Keep the cheaper direction.' },
    { id: 'done', label: 'Result', description: 'The total is the shift distance.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with s, t, nextCost and previousCost (26 costs each, indexed by the starting letter)',
  url: 'https://leetcode.com/problems/shift-distance-between-two-strings/description/',
  complexity: 'O(n * 26) time and O(1) extra space. The visualization caps the strings at 6 letters.',
  examples: [
    { label: 'Invented pair', input: JSON.stringify({ s: 'ccd', t: 'bba', nextCost: Array(26).fill(3), previousCost: Array(26).fill(2) }) },
    { label: 'Short mix', input: JSON.stringify({ s: 'ab', t: 'ca', nextCost: Array.from({ length: 26 }, (_, i) => i % 4), previousCost: Array(26).fill(1) }) },
    { label: 'Single letter', input: '{"s":"a","t":"a","nextCost":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"previousCost":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]}' },
    { label: 'Identical strings', input: '{"s":"abc","t":"abc","nextCost":[4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4],"previousCost":[4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4]}' },
    { label: 'Largest costs, six letters', input: '{"s":"fedcba","t":"abcdef","nextCost":[100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100],"previousCost":[100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100]}' },
    { label: 'Long run: six letters', input: '{"s":"ypjber","t":"xujvko","nextCost":[33,3,16,46,68,52,35,74,62,17,62,80,35,8,95,37,22,30,73,32,71,83,50,36,15,32],"previousCost":[39,2,2,86,47,71,42,70,73,19,73,48,75,60,88,13,73,90,98,33,42,36,0,94,79,99]}' },
  ],
}

export default function ShiftDistanceBetweenTwoStrings() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="s" length={run.input.s.length} valueAt={i => run.input.s[i]} active={step.at}
      roleAt={i => (i === step.at ? 'window' : '')} />
    <IndexedSequence label="t" length={run.input.t.length} valueAt={i => run.input.t[i]} active={step.at} />
    <output aria-label="Shift totals">{`forward ${step.forward ?? '-'}, backward ${step.backward ?? '-'}, total ${step.total}`}</output>
  </>} renderReasoning={() => <>
    <p>Positions do not interact, so the answer is a sum. Each position needs the cheaper of two walks around a 26-letter circle.</p>
    <p>Forward walks cost the next-step values; backward walks cost the previous-step values.</p>
  </>} />
}
