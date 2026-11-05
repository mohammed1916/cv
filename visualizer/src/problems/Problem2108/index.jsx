import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import RecordStateTable from '../../components/shared/RecordStateTable'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2108',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Words as a JSON array (e.g. ["abc","aba"])',
  url: 'https://leetcode.com/problems/find-first-palindromic-string-in-the-array/',
  complexity: 'O(total length) time in the worst case and O(1) extra space per word.',
  examples: [
    { label: 'Third word', input: '["abc","car","ada","racecar","cool"]' },
    { label: 'None', input: '["abcd","xyz"]' },
    { label: 'Single letter', input: '["ab","z","aa"]' },
  ],
}

export default function Problem2108Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => (
        <>
          {step.word !== null && step.word !== undefined && (
            <IndexedSequence label={`Letters of "${step.word}"`} length={step.word.length} valueAt={i => step.word[i]} active={step.l} roleAt={i => (i === step.l ? 'l' : i === step.r ? 'r' : '')} />
          )}
          <RecordStateTable label="Words checked" columns={['word', 'verdict']} rows={step.checked} />
          <p>{run.input.words.length} words in the array.</p>
        </>
      )}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
