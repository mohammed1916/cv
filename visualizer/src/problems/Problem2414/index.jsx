import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  number: '2414',
  phases: [
    { id: 'extend', label: 'Extend', description: 'The next letter follows the previous one, so the run grows.' },
    { id: 'restart', label: 'Restart', description: 'The next letter breaks the sequence, so a new run starts.' },
    { id: 'done', label: 'Result', description: 'Return the longest run.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON {"s": "dcfgbcdef"}',
  url: 'https://leetcode.com/problems/length-of-the-longest-alphabetical-continuous-substring/',
  complexity: 'O(n) time and O(1) extra space.',
  examples: [
    { label: 'Example', input: '{"s":"dcfgbcdef"}' },
    { label: 'Short', input: '{"s":"bcdz"}' },
    { label: 'Single letter', input: '{"s":"a"}' },
    { label: 'Repeated letters', input: '{"s":"aaaa"}' },
    { label: 'Longest decreasing run', input: '{"s":"zyxwvutsrqponmlkjihgfedc"}' },
    { label: 'Long run: 24 letters', input: '{"s":"kuqwqayqolnozugaoiniuldu"}' },
  ],
}

export default function AlphabeticalRun() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const s = run.input.s
    return <>
      <IndexedSequence label="letters" length={s.length} valueAt={i => s[i]} active={step.r}
        roleAt={i => (step.l >= 0 && i === step.l ? 'l' : i === step.r ? 'r' : step.l >= 0 && i >= step.l && i <= step.r ? 'window' : '')} />
      <output aria-label="Longest run">{`longest ${step.best}`}</output>
      <p role="status">{step.message}</p>
    </>
  }} renderReasoning={() => <>
    <p>An alphabetical continuous string climbs one letter at a time, such as bcd. A run continues while each letter is the next one in the alphabet.</p>
    <p>Track where the current run started (l). When the letter at r does not follow the previous one, l moves to r.</p>
  </>} />
}
