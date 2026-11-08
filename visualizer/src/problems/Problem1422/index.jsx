import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import RecordStateTable from '../../components/shared/RecordStateTable'
import { phases, parseInput, buildTrace, code, python, pythonLineMap } from './algorithm'

const definition = {
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  inputLabel: 'JSON string of 0 and 1 characters (e.g. "10010")',
  url: 'https://leetcode.com/problems/maximum-score-after-splitting-a-string/',
  complexity: 'O(n) time and O(1) extra space: one pass moves the cut and keeps two running counts.',
  examples: [
    { label: 'Mixed', input: '"10010"' },
    { label: 'All ones', input: '"11111"' },
    { label: 'All zeros', input: '"0000"' },
    { label: 'Two characters', input: '"01"' },
    { label: 'Equal counts of zeros and ones', input: '"1100"' },
    { label: 'Largest allowed: 500 characters', input: '"10101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010"' },
    { label: 'Long run: 300 bits', input: '"100001100010001101001011110110011101100111100110001001000101000011010110001111101000000110001101100111010010111101001110111111011010101111111000101100000111110010000100100100100100110100001001101110101111101011010010011001111101011011000000110010110010010000000011100100111001011000011010000101001011"' },
  ],
}

function SplitScene({ run, step }) {
  const snap = step.snapshot
  const { input } = run
  return <>
    <IndexedSequence label="Binary string" length={input.length} valueAt={i => input[i]} active={snap.current}
      roleAt={i => (snap.current < 0 ? '' : i <= snap.current ? 'left' : 'right')} />
    <RecordStateTable label="Scores for each split" columns={['split after', 'zeros left', 'ones right', 'score']}
      activeRow={snap.current}
      rows={input.slice(0, -1).map((_, i) => {
        const zl = input.slice(0, i + 1).split('').filter(c => c === '0').length
        const or = input.slice(i + 1).split('').filter(c => c === '1').length
        return { 'split after': `position ${i}`, 'zeros left': zl, 'ones right': or, score: zl + or }
      }).slice(0, Math.max(0, snap.current + 1))} />
    <p>Left zeros: {snap.zerosLeft} · right ones: {snap.onesRight} · best: {snap.best}{snap.score !== null ? ` · this split: ${snap.score}` : ''}</p>
  </>
}

export default function SplitScore() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <SplitScene run={run} step={step} />}
      renderReasoning={({ step }) => <p>{phases.find(p => p.id === step.phase)?.description}</p>}
    />
  )
}
