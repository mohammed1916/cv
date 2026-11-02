import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'setup', label: 'Setup', description: 'Put n on the board.' },
    { id: 'while', label: 'Pass check', description: 'Repeat while the last pass added something.' },
    { id: 'pass', label: 'Pass', description: 'Reset the change flag for this pass.' },
    { id: 'scan', label: 'Scan', description: 'Look at each value already on the board.' },
    { id: 'add', label: 'Add', description: 'A value x adds i when x mod i is 1.' },
    { id: 'done', label: 'Result', description: 'Count the distinct numbers on the board.' },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Board object (JSON, e.g. {"n": 5})',
  url: 'https://leetcode.com/problems/count-distinct-numbers-on-board/',
  complexity: 'The loop is a fixpoint over values 1 to n, so the visualization runs in O(n^3) for n up to 30.',
  examples: [
    { label: 'Example', input: '{"n": 5}' },
    { label: 'Smallest', input: '{"n": 1}' },
    { label: 'Chain', input: '{"n": 10}' },
  ],
}

export default function CountDistinctNumbersOnBoard() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="values 1 to n" length={run.input.n} indexOffset={1} valueAt={i => i + 1}
      active={step.current !== null ? step.current - 1 : step.added !== null ? step.added - 1 : -1}
      roleAt={i => (step.board.includes(i + 1) ? 'on board' : '')} />
    <output aria-label="Board state">{`board = {${step.board.join(', ')}}; ${step.board.length} distinct`}</output>
  </>} renderReasoning={() => <>
    <p>The board only grows: a value i is added when some value x already on the board has x mod i equal to 1.</p>
    <p>Passes repeat until a full pass adds nothing, which means the board has reached its final set.</p>
  </>} />
}
