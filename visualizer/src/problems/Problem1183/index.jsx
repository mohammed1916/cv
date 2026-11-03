import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import MaxOnesView from './MaxOnesView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  phases,
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with width, height, sideLength and maxOnes',
  url: 'https://leetcode.com/problems/maximum-number-of-ones/',
  complexity: 'O(S * S + W * H) time and O(S * S + W * H) space for a W by H board with window side S. The visualization caps the board at 12 by 12 and the window at 6. If no full window fits, the board is treated as unconstrained; the official feasibility guarantee is not verified here.',
  examples: [
    { label: 'Tiled 7 by 5', input: '{"width":7,"height":5,"sideLength":3,"maxOnes":4}' },
    { label: 'Square board', input: '{"width":6,"height":6,"sideLength":4,"maxOnes":5}' },
    { label: 'Window too large', input: '{"width":3,"height":8,"sideLength":5,"maxOnes":1}' },
  ],
}

export default function MaximumNumberOfOnes() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <MaxOnesView run={run} step={step} />}
      renderReasoning={({ run, step }) => (
        <p>
          {step.message} {run ? `Best total so far: ${step.total ?? 0}.` : ''}
        </p>
      )}
    />
  )
}
