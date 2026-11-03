import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import * as model from './algorithm'

const definition = {
  phases: model.PHASES, parse: model.parseInput, build: model.buildTrace, code: model.code, python: model.python,
  inputLabel: model.INPUT_LABEL, url: model.URL, complexity: model.COMPLEXITY, examples: model.EXAMPLES,
}

export default function ProblemVisual() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ run, step }) => <section aria-label="Current state">
      <output>{step.message}</output>
      <dl>{Object.entries(step.state || {}).map(([key, value]) => <div key={key}><dt>{key}</dt><dd><code>{JSON.stringify(value)}</code></dd></div>)}</dl>
      <p>Result: <code>{step.phase === 'done' ? JSON.stringify(run.result) : 'not yet'}</code></p>
    </section>}
    renderReasoning={() => <>{model.WHY.map((text, index) => <p key={index}>{text}</p>)}</>} />
}
