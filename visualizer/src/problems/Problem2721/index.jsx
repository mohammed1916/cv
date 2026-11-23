import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import * as model from './algorithm'
import ParallelLanesView from './ParallelLanesView'

const definition = {
  question: "Given an array of asynchronous functions, run them in parallel and return their results in order.",
  approaches: [
    { name: "Promise.all", intuition: "Start all functions together and wait for their results to resolve in order.", time: "O(n)", space: "O(n)" },
  ],
  phases: model.PHASES, parse: model.parseInput, build: model.buildTrace, code: model.code, python: model.python,
  inputLabel: model.INPUT_LABEL, url: model.URL, complexity: model.COMPLEXITY, examples: model.EXAMPLES,
}

export default function ProblemVisual() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ run, step }) => <>
      <ParallelLanesView tasks={run.input} step={step} />
      <p style={{ color: 'var(--text)' }}>Result: <code>{step.phase === 'done' ? JSON.stringify(run.result) : 'not yet'}</code></p>
    </>}
    renderReasoning={() => <>{model.WHY.map((text, index) => <p key={index}>{text}</p>)}</>} />
}
