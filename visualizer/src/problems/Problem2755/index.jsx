import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import RecordStateTable from '../../components/shared/RecordStateTable'
import * as model from './algorithm'

const definition = {
  phases: model.PHASES, parse: model.parseInput, build: model.buildTrace, code: model.code, python: model.python,
  inputLabel: model.INPUT_LABEL, url: model.URL, complexity: model.COMPLEXITY, examples: model.EXAMPLES,
}

const ORIGIN = { start: 'start', arrays: 'both arrays: by index', objects: 'both objects: by key', a: 'kept from a', b: 'taken from b', done: 'done' }

export default function ProblemVisual() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ run, step }) => {
      // Every decision frame is one row, so the table reads top to bottom as the merge walks the values.
      const rows = run.frames.filter(f => f.state?.path !== undefined).map(f => ({ path: f.state.path, origin: ORIGIN[f.state.origin] ?? f.state.origin }))
      const current = rows.findIndex(r => r.path === step.state?.path && r.origin === ORIGIN[step.state?.origin])
      return <>
        <RecordStateTable label="Merge decisions" columns={['path', 'origin']} rows={rows} activeRow={current} />
        {step.phase === 'done' && <pre style={{ color: 'var(--text)', whiteSpace: 'pre-wrap' }}>{JSON.stringify(run.result)}</pre>}
      </>
    }}
    renderReasoning={() => <>{model.WHY.map((text, i) => <p key={i}>{text}</p>)}</>} />
}
