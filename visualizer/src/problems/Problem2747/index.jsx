import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
  {
    "id": "setup",
    "label": "Setup",
    "description": "Start with an empty answer list."
  },
  {
    "id": "query",
    "label": "Query",
    "description": "Take the next query and an empty busy set."
  },
  {
    "id": "log",
    "label": "Log",
    "description": "Read one request log."
  },
  {
    "id": "check",
    "label": "Check",
    "description": "Test whether the log falls in the window."
  },
  {
    "id": "mark",
    "label": "Mark",
    "description": "Mark the server as busy."
  },
  {
    "id": "answer",
    "label": "Answer",
    "description": "Count the idle servers for this query."
  },
  {
    "id": "done",
    "label": "Result",
    "description": "Return the answers."
  }
],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: "Object with n, logs, x, queries (JSON), e.g. {\"n\":3,\"logs\":[[1,3],[2,6],[1,5]],\"x\":5,\"queries\":[10,11]}",
  url: "https://leetcode.com/problems/count-zero-request-servers/",
  complexity: "O(queries * logs) time for this visualization, which caps input at 10 servers, 10 logs and 10 queries. The official limit is 10^5 for each.",
  examples: [
  {
    "label": "Example 1",
    "input": "{\"n\":3,\"logs\":[[1,3],[2,6],[1,5]],\"x\":5,\"queries\":[10,11]}"
  }
],
}

export default function CountZeroRequestServersVisualizer() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Servers" length={run.input.n} valueAt={i => i + 1} active={-1}
      roleAt={i => (step.busy.includes(i + 1) ? 'window' : '')} />
    <output aria-label="Answers">{`Query ${step.query >= 0 ? step.query : '-'}, answers [${step.answer.join(', ')}]`}</output>
  </>} renderReasoning={({ step }) => <p>{step.message}</p>} />
}
