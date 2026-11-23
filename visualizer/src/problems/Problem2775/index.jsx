import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import * as model from './algorithm'

const definition = {
  question: "Convert every undefined marker in a nested value into null, keeping the rest of the structure unchanged.",
  approaches: [
    { name: "Recursive rebuild", intuition: "Visit arrays and objects recursively, replacing each undefined marker as it is reached.", time: "O(size of value)", space: "O(depth)" },
    { name: "Iterative walk with an explicit stack", intuition: "Process nested containers with a work list to avoid deep recursion.", time: "O(size of value)", space: "O(size of value)" },
  ],
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
