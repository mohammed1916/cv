import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python, PREDICATES } from './algorithm'

const definition = {
  number: '2634',
  phases: [
    { id: 'start', label: 'Start', description: 'Create an empty result list.' },
    { id: 'check', label: 'Check', description: 'Test the element with its index.' },
    { id: 'keep', label: 'Keep', description: 'The test holds, so the element is kept.' },
    { id: 'skip', label: 'Skip', description: 'The test fails, so the element is dropped.' },
    { id: 'done', label: 'Result', description: 'The kept elements in order.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with arr (up to 10 whole numbers) and fn ("aboveIndex", "positive" or "even")',
  url: 'https://leetcode.com/problems/filter-elements-from-array/',
  complexity: 'O(n) time and O(n) space for the kept list.',
  examples: [
    { label: 'Above index', input: '{"arr":[4,1,9,0,12]}' },
    { label: 'Positive', input: '{"arr":[3,-2,0,7],"fn":"positive"}' },
    { label: 'Dropped', input: '{"arr":[0,1,2]}' },
  ],
}

export default function FilterElementsFromArray() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ run, step }) => {
      const { arr } = run.input
      const kept = new Set(step.view.keptIndices)
      const checked = step.view.focus
      const roleAt = index => {
        if (kept.has(index)) return 'kept'
        if (index < checked || (checked === -1 && step.phase === 'done')) return 'dropped'
        return ''
      }
      return <section aria-label="Filter state">
        <p className="algorithm-sequence__note">{`Test: ${PREDICATES[run.input.fn].label}. The index is the position in the input.`}</p>
        <IndexedSequence label="Input" length={arr.length} active={checked} valueAt={index => arr[index]} roleAt={roleAt} />
        <IndexedSequence label="Kept" length={step.view.keptIndices.length} active={-1} valueAt={index => arr[step.view.keptIndices[index]]} roleAt={index => `index ${step.view.keptIndices[index]}`} />
      </section>
    }}
    renderReasoning={({ step }) => <>
      <p>The callback is called once per element with that element and its index. A truthy answer keeps the element; a falsy answer drops it.</p>
      <p>{step.view.verdict === false ? 'This test failed, so nothing is added.' : step.view.verdict ? 'This test passed, so the element joins the kept list.' : 'The kept list keeps the original order.'}</p>
    </>} />
}
