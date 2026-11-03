import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { phases, parseInput, buildTrace, code, python, pythonLineMap } from './algorithm'

const definition = {
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  inputLabel: 'JSON string of lowercase letters and digits (e.g. "a1b2c3")',
  url: 'https://leetcode.com/problems/reformat-the-string/',
  complexity: 'O(n) time and O(n) space, where n is the string length.',
  examples: [
    { label: 'Mixed', input: '"a1b2c3"' },
    { label: 'Digits first', input: '"123abc4"' },
    { label: 'Impossible', input: '"ab12cd"' },
    { label: 'Single pair', input: '"z9"' },
  ],
}

function ReformatScene({ run, step }) {
  const { input } = run
  const snap = step.snapshot
  return <>
    <IndexedSequence label="Input characters" length={input.length} valueAt={i => input[i]} active={snap.current}
      roleAt={i => (/\d/.test(input[i]) ? 'digit' : 'letter')} />
    <IndexedSequence label="Output so far" length={snap.output.length} valueAt={i => snap.output[i]} active={snap.output.length - 1} />
    <p>Letter group: {snap.letters.length} · digit group: {snap.digits.length}</p>
  </>
}

export default function Reformat() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <ReformatScene run={run} step={step} />}
      renderReasoning={({ step }) => <p>{phases.find(p => p.id === step.phase)?.description}</p>}
    />
  )
}
