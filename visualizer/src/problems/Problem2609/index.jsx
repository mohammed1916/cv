import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Binary string s (JSON), e.g. {"s": "01000111"}',
  url: 'https://leetcode.com/problems/find-the-longest-balanced-substring-of-a-binary-string/',
  complexity: 'O(n) time and O(1) space for string length n (at most 50 in this visualization).',
  phases: [
    { id: 'setup', label: 'Setup', description: 'Reset the zero run, one run and best length.' },
    { id: 'scan', label: 'Scan', description: 'Read the next character.' },
    { id: 'zero', label: 'Zero', description: 'A zero extends the current zero run.' },
    { id: 'reset', label: 'Reset', description: 'Ones followed by a zero start a new run.' },
    { id: 'one', label: 'One', description: 'A one extends the current one run.' },
    { id: 'check', label: 'Check', description: 'Compare ones with zeros to decide if a balanced block ends here.' },
    { id: 'record', label: 'Record', description: 'Keep the longer balanced substring.' },
    { id: 'done', label: 'Result', description: 'Report the longest balanced substring length.' },
  ],
  examples: [
    { label: 'Mixed runs', input: '{"s": "0011000111"}' },
    { label: 'Zeros then ones', input: '{"s": "1000011"}' },
    { label: 'Only ones', input: '{"s": "111"}' },
    { label: 'Single zero', input: '{"s":"0"}' },
    { label: 'Alternating equal runs', input: '{"s":"0101"}' },
    { label: 'All ones at the length limit', input: '{"s":"11111111111111111111111111111111111111111111111111"}' },
    { label: 'Long run: 50 random bits', input: '{"s":"01010101010101010101010101010101010101010101010101"}' },
  ],
}

function LongestBalancedSubstring() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const inWindow = i => step.windowStart !== null && i >= step.windowStart && i <= step.windowEnd
    return <>
      <IndexedSequence label="String s" length={run.input.s.length} active={step.index ?? -1}
        valueAt={i => run.input.s[i]}
        roleAt={i => i === step.windowStart ? 'l' : i === step.index ? 'r' : inWindow(i) ? 'balanced' : (step.index !== null && i > step.index ? 'unread' : run.input.s[i] === '0' ? 'zero' : 'one')} />
      <output aria-label="Counters">
        Zeros in run: {step.zeros} · Ones in run: {step.ones} · Best: {step.best}
      </output>
    </>
  }} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>l marks the start of the balanced block being checked and r marks the character being read.</p>
    <p>A balanced substring has the form 0...01...1 with equal counts. Each one can close a block of length 2 * ones when the one count does not exceed the current zero run.</p>
  </>} />
}

export default LongestBalancedSubstring
