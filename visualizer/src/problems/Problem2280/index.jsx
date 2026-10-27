import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import CoordinatePlane from '../../components/shared/CoordinatePlane'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'The first segment needs one line.' },
    { id: 'turn', label: 'Check point', description: 'Compare the slopes on either side of a point.' },
    { id: 'done', label: 'Complete', description: 'Report the number of lines.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Points as JSON [[day, price], ...] (1 to 20, distinct days)',
  url: 'https://leetcode.com/problems/minimum-lines-to-represent-a-line-chart/',
  complexity: 'O(n log n) time from the sort, O(1) extra space. The visualization caps input at 10 points.',
  examples: [
    { label: 'Example 1', input: '[[1,7],[2,6],[3,5],[4,4],[5,4],[6,3],[7,2],[8,1]]' },
    { label: 'Collinear', input: '[[3,4],[1,2],[7,8],[2,3]]' },
  ],
}

export default function MinimumLinesLineChart() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const sorted = step.sorted
    const triple = step.index === null ? [] : [step.index - 1, step.index, step.index + 1]
    const points = sorted.map(([x, y], i) => ({ x, y, label: `${i}`, role: triple.includes(i) ? 'active' : undefined }))
    return <>
      <CoordinatePlane title="Points sorted by day" points={points} />
      <output aria-label="Lines">{`Lines so far: ${step.lines}`}</output>
      <p>{step.message}</p>
    </>
  }} renderReasoning={() => <>
    <p>A straight segment is a run of points with equal slopes. Two neighbouring segments with different slopes need two lines.</p>
    <p>Slopes are compared by cross multiplication, so no division or rounding is involved.</p>
  </>} />
}
