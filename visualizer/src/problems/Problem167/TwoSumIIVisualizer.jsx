import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { useTutorialScene } from '../../components/shared/TutorialScene'
import { buildTrace, parseInput, code, python, phases } from './algorithm'
import { twoSumTutorial } from './tutorial'
import authoredExamples from '../../config/examples/two-sum-ii.js'
import './TwoSumIIVisualizer.css'

const definition = {
  number: '167',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON object with a sorted numbers list and target (e.g. {"numbers":[2,7,11,15],"target":9})',
  url: 'https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/',
  complexity: 'O(n) time and O(1) extra space: each pointer moves at most n times.',
  examples: authoredExamples.map(example => ({
    label: example.label,
    input: JSON.stringify({ numbers: example.numbers, target: example.target }),
  })),
}

// Roles name the pointer on each real index; the window is rendered with its real indices as offsets.
function roleFor(index, s) {
  if (index === s.left && index === s.right) return 'both'
  if (index === s.left) return 'left'
  if (index === s.right) return 'right'
  return ''
}

// Two pointed cells with their real positions: the only cells the comparison reads.
function PairCells({ numbers, s, found }) {
  const cells = [s.left, s.right]
  return <div className="ts2-pair" role="group" aria-label="Pointed values">
    {cells.map((index, slot) => <div key={slot} className={`ts2-pair__cell ${found ? 'is-found' : ''}`} data-role={slot === 0 ? 'left' : 'right'}>
      <small>{slot === 0 ? 'left' : 'right'} · [{index + 1}]</small>
      <strong>{numbers[index]}</strong>
    </div>)}
    <div className="ts2-pair__sum">
      <span>{numbers[s.left]} + {numbers[s.right]}</span>
      <strong>{s.total === null ? '' : `= ${s.total}`}</strong>
      <span>target {s.target}</span>
    </div>
  </div>
}

// Scene focus: window shows only the live range [left..right]; pair shows only the two ends.
export function FocusedTwoSum({ step, focus, numbers }) {
  const s = step.snapshot
  if (focus.includes('empty')) {
    return <p className="ts2-note" role="status">The pointers met at positions {s.left + 1} and {s.right + 1}. No pair is left in the window.</p>
  }
  if (focus.includes('pair')) {
    return <PairCells numbers={numbers} s={s} found={focus.includes('result')} />
  }
  const length = s.right - s.left + 1
  return <IndexedSequence label="Live window (left to right)" length={length} active={-1} indexOffset={s.left}
    valueAt={k => numbers[s.left + k]} roleAt={k => roleFor(s.left + k, s)} />
}

export function FullTwoSum({ step, numbers }) {
  const s = step.snapshot
  return <div className="ts2-full">
    <IndexedSequence label="Sorted numbers" length={numbers.length} active={s.left}
      valueAt={k => numbers[k]} roleAt={k => roleFor(k, s)} />
    <dl className="ts2-facts" aria-label="Pointer state">
      <dt>left</dt><dd>{s.left + 1}</dd>
      <dt>right</dt><dd>{s.right + 1}</dd>
      <dt>sum</dt><dd>{s.total ?? 'not computed'}</dd>
      <dt>target</dt><dd>{s.target}</dd>
    </dl>
  </div>
}

function TwoSumView({ run, step }) {
  const scene = useTutorialScene()
  const numbers = run.input.numbers
  return scene
    ? <FocusedTwoSum step={step} focus={scene.focus || []} numbers={numbers} />
    : <FullTwoSum step={step} numbers={numbers} />
}

export default function TwoSumIIVisualizer() {
  return <AlgorithmWorkspace
    definition={definition}
    tutorial={twoSumTutorial}
    renderVisual={({ run, step }) => <TwoSumView run={run} step={step} />}
    renderReasoning={({ step }) => <>
      <p>The array is sorted. Starting from both ends, the sum tells which pointer can be safely discarded: a small sum drops left, a large sum drops right.</p>
      <p>{step.message}</p>
    </>}
  />
}
