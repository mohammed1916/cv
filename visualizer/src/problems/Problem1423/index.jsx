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
  inputLabel: 'JSON object with "cards" and "k" (e.g. {"cards": [3, 1, 6, 8, 2, 9], "k": 3})',
  url: 'https://leetcode.com/problems/maximum-points-you-can-obtain-from-cards/',
  complexity: 'O(k) time and O(1) extra space: the window of left and right cards is updated by one swap per step.',
  examples: [
    { label: 'Sample', input: '{"cards": [3, 1, 6, 8, 2, 9], "k": 3}' },
    { label: 'Four cards', input: '{"cards": [5, 7, 1, 9], "k": 2}' },
    { label: 'Take all', input: '{"cards": [4, 4, 4], "k": 3}' },
  ],
}

function CardsScene({ run, step }) {
  const { cards } = run.input
  const snap = step.snapshot
  const n = cards.length
  const k = run.input.k
  // The left pointer marks the rightmost card currently taken from the left; the right pointer marks the newest card taken from the right.
  const role = i => {
    if (i === snap.added) return 'r'
    if (i === snap.removed) return 'l'
    if (i < snap.leftCount || i >= n - snap.rightCount) return 'window'
    return ''
  }
  return <>
    <IndexedSequence label="Cards in a row" length={n} valueAt={i => cards[i]} active={snap.added >= 0 ? snap.added : -1}
      roleAt={role} />
    <p>Cards taken: {k}. The left pointer is on card {snap.removed >= 0 ? snap.removed : k - 1} and the right pointer is on card {snap.added >= 0 ? snap.added : n - 1}.</p>
    <p>Taken from left: {snap.leftCount} · from right: {snap.rightCount} · total: {snap.total} · best: {snap.best}</p>
  </>
}

export default function CardPoints() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <CardsScene run={run} step={step} />}
      renderReasoning={({ step }) => <p>{phases.find(p => p.id === step.phase)?.description}</p>}
    />
  )
}
