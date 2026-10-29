import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import LinkedListLane from '../../components/shared/LinkedListLane'
import { buildTrace, parseInput, code, python, pythonLineMap } from './algorithm'

const definition = {
  phases: [
    { id: 'init', label: 'Start', description: 'The history starts with the homepage.' },
    { id: 'loop', label: 'Call', description: 'Process the next visit, back or forward call.' },
    { id: 'visit', label: 'Visit', description: 'Drop forward pages and append the new URL.' },
    { id: 'back', label: 'Back', description: 'Move the current page toward the start, at most the given steps.' },
    { id: 'forward', label: 'Forward', description: 'Move the current page toward the end, at most the given steps.' },
    { id: 'done', label: 'Result', description: 'Return the outputs of the calls.' },
  ],
  parse: parseInput, build: buildTrace, code, python, pythonLineMap,
  inputLabel: 'History calls (JSON with homepage, methods, args)',
  url: 'https://leetcode.com/problems/design-browser-history/',
  complexity: 'O(steps) time per back or forward call and O(1) time per visit in a stack-style history, with O(n) space for n stored pages. The visualization caps input at 50 calls.',
  examples: [
    {
      label: 'LeetCode example',
      input: '{"homepage":"leetcode.com","methods":["visit","visit","visit","back","back","forward","visit","forward","back","back"],"args":[["google.com"],["facebook.com"],["youtube.com"],[1],[1],[1],["linkedin.com"],[2],[2],[7]]}',
    },
  ],
}

export default function DesignBrowserHistory() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <LinkedListLane
    title="Browser history" note={`current page index ${step.cur}`}
    nodes={step.history.map((url, index) => ({ id: `p${index}`, value: url }))}
    pointers={[{ label: 'current', id: `p${step.cur}` }]}
    roles={{ [`p${step.cur}`]: 'active' }} />}
    renderReasoning={({ step }) => <>
      <p>{step.message}</p>
      {step.results.length > 0 && <p>Outputs so far: {step.results.map(value => value === null ? 'null' : `"${value}"`).join(', ')}</p>}
    </>} />
}
