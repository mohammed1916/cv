import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import RaceView from './RaceView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2188',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON with tires, changeTime and numLaps, e.g. {"tires":[[2,3],[3,3]],"changeTime":5,"numLaps":4}',
  url: 'https://leetcode.com/problems/minimum-time-to-finish-the-race/',
  complexity: 'O(tires * log(changeTime)) to build the stint costs and O(numLaps * 17) for the lap table. The page caps tires at 3, f at 5, r at 3, changeTime at 10 and laps at 6.',
  examples: [
    { label: 'Two tires', input: '{"tires":[[2,3],[3,3]],"changeTime":5,"numLaps":4}' },
    { label: 'Three tires', input: '{"tires":[[1,3],[2,2],[3,3]],"changeTime":3,"numLaps":5}' },
    { label: 'Single lap', input: '{"tires":[[1,2]],"changeTime":1,"numLaps":1}' },
    { label: 'Equal tires tie', input: '{"tires":[[2,2],[2,2]],"changeTime":1,"numLaps":3}' },
    { label: 'One tire, many laps', input: '{"tires":[[3,2]],"changeTime":4,"numLaps":6}' },
    { label: 'Largest values, six laps', input: '{"tires":[[5,3],[4,3],[5,2]],"changeTime":10,"numLaps":6}' },
  ],
}

export default function Problem2188Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <RaceView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
