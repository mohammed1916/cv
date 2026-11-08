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
    { label: 'Single call', input: '{"homepage":"a.io","methods":["visit"],"args":[["b.io"]]}' },
    { label: 'Steps past history', input: '{"homepage":"home","methods":["back","forward"],"args":[[5],[3]]}' },
    { label: 'Longest names', input: '{"homepage":"abcdefghijklmnopqrst","methods":["visit","back","forward"],"args":[["abcdefghijklmnopqrst"],[100],[100]]}' },
    { label: 'Long run: 50 calls', input: '{"homepage":"home.io","methods":["visit","visit","visit","forward","visit","forward","forward","visit","visit","back","forward","back","visit","visit","back","forward","visit","visit","visit","back","visit","visit","back","forward","back","visit","back","forward","visit","forward","forward","back","visit","forward","back","visit","visit","visit","back","forward","forward","forward","visit","forward","forward","visit","visit","forward","back","back"],"args":[["home.io"],["beta.io"],["gamma.io"],[1],["sigma.io"],[2],[3],["omega.io"],["beta.io"],[3],[3],[1],["beta.io"],["gamma.io"],[3],[3],["gamma.io"],["sigma.io"],["delta.io"],[1],["omega.io"],["beta.io"],[3],[2],[2],["omega.io"],[3],[2],["gamma.io"],[2],[3],[1],["sigma.io"],[1],[3],["sigma.io"],["alpha.io"],["beta.io"],[1],[3],[2],[2],["delta.io"],[1],[1],["gamma.io"],["sigma.io"],[3],[1],[1]]}' },
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
