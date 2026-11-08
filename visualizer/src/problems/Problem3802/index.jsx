import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import SheetSplitView from './SheetSplitView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Setup', description: 'Read n and the two limits.' },
    { id: 'split', label: 'Split', description: 'Cut the sheets after x of them.' },
    { id: 'checkA', label: 'A first', description: 'Colour A on the left, colour B on the right.' },
    { id: 'checkB', label: 'B first', description: 'Colour B on the left, colour A on the right.' },
    { id: 'done', label: 'Result', description: 'Report the count modulo 1000000007.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with n, limitA and limitB (integers, 2 to 14 sheets)',
  url: 'https://leetcode.com/problems/number-of-ways-to-paint-sheets/',
  complexity: 'O(n) time and O(1) space: each split point is tested once in each colour order.',
  examples: [
    { label: 'Six sheets', input: '{"n":6,"limitA":4,"limitB":3}' },
    { label: 'Seven sheets', input: '{"n":7,"limitA":2,"limitB":5}' },
    { label: 'Smallest board', input: '{"n":2,"limitA":1,"limitB":1}' },
    { label: 'Equal limits', input: '{"n":6,"limitA":3,"limitB":3}' },
    { label: 'Limits at the maximum', input: '{"n":14,"limitA":14,"limitB":14}' },
    { label: 'Long run: n = 14', input: '{"n":14,"limitA":7,"limitB":9}' },
  ],
}

export default function NumberOfWaysToPaintSheets() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <SheetSplitView run={run} step={step} />} renderReasoning={({ run, step }) => <>
    <p>{step.message}</p>
    <p>Every painting uses one split point and one colour order, so counting valid split points for each order gives the answer.</p>
    {run ? <p>Final answer: {run.result}.</p> : null}
  </>} />
}
