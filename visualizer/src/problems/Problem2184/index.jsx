import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import WallView from './WallView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2184',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON with height, width and bricks, e.g. {"height":2,"width":3,"bricks":[1,2]}',
  url: 'https://leetcode.com/problems/number-of-ways-to-build-sturdy-brick-wall/',
  complexity: 'Layouts grow with the width, so the cost is the number of layouts squared per row. The page caps width at 10, height at 3 and bricks at 4 widths.',
  examples: [
    { label: 'Two rows', input: '{"height":2,"width":3,"bricks":[1,2]}' },
    { label: 'Four width', input: '{"height":1,"width":4,"bricks":[1,2]}' },
    { label: 'Three rows', input: '{"height":3,"width":4,"bricks":[1,2]}' },
    { label: 'Single cell wall', input: '{"height":1,"width":1,"bricks":[1]}' },
    { label: 'Equal rows, two layouts', input: '{"height":2,"width":2,"bricks":[1,2]}' },
    { label: 'No layout fits', input: '{"height":2,"width":3,"bricks":[2]}' },
    { label: 'Largest wall', input: '{"height":3,"width":10,"bricks":[1,2,3,4]}' },
    { label: 'Long run: nine wide', input: '{"height":3,"width":9,"bricks":[1,3,4]}' },
  ],
}

export default function Problem2184Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <WallView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
