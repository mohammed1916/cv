import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import ScoreboardView from './ScoreboardView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '3921',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON array of 1 to 30 tokens from 0, 1, 2, 3, 4, 6, WD, NB, W',
  url: 'https://leetcode.com/problems/score-validator/',
  complexity: 'O(n) time and O(1) extra space for n tokens. The visualization caps the event list at 30 tokens.',
  examples: [
    { label: 'Mixed innings', input: '["1", "2", "W", "WD", "4", "6", "W", "NB"]' },
    { label: 'Ten down', input: '["6", "W", "W", "W", "W", "W", "W", "W", "W", "W", "W", "4"]' },
    { label: 'Single ball', input: '["1"]' },
    { label: 'Equal dot balls', input: '["0","0","0"]' },
    { label: 'Thirty tokens with extras', input: '["6","W","WD","NB","0","1","2","3","4","W","6","W","WD","NB","0","1","2","3","4","W","6","W","WD","NB","0","1","2","3","4","W"]' },
    { label: 'Long run: 30 tokens', input: '["WD","WD","6","4","2","6","3","W","1","2","3","WD","3","4","3","W","0","0","0","2","W","6","1","W","4","1","4","6","1","6"]' },
  ],
}

export default function Problem3921Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <ScoreboardView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
