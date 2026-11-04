import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import * as model from './algorithm'

const definition = {
  phases: model.PHASES, parse: model.parseInput, build: model.buildTrace, code: model.code, python: model.python,
  inputLabel: model.INPUT_LABEL, url: model.URL, complexity: model.COMPLEXITY, examples: model.EXAMPLES,
}

export default function ProblemVisual() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ run, step }) => {
      const { lo = 0, hi = run.input.arr.length, mid = -1 } = step.state || {}
      // Highlight the live window [lo, hi) and mark its ends so the narrowing is visible.
      const roleAt = index => {
        if (index === mid) return 'mid'
        if (index === lo && index === hi - 1) return 'lo and hi-1'
        if (index === lo) return 'lo'
        if (index === hi - 1) return 'hi-1'
        if (index >= lo && index < hi) return 'in range'
        return 'outside'
      }
      return <>
        <IndexedSequence label="Sorted array" length={run.input.arr.length} valueAt={index => run.input.arr[index]} active={mid} roleAt={roleAt} />
        <p style={{ color: 'var(--text)' }}>Search range is [{lo}, {hi}). Target {run.input.target}. Result: <code>{step.phase === 'done' ? run.result : 'not yet'}</code></p>
      </>
    }}
    renderReasoning={() => <>{model.WHY.map((text, index) => <p key={index}>{text}</p>)}</>} />
}
