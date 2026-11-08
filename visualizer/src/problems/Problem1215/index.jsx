import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import SteppingWalkView from './SteppingWalkView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1215',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with low and high (e.g. {"low":0,"high":21})',
  url: 'https://leetcode.com/problems/stepping-numbers/description/',
  complexity: 'O(k) time for the k stepping numbers reached by the walks, plus O(k log k) to sort them. The visualization caps high at 1000; the draft does not state an exact official bound.',
  examples: [
    { label: 'Zero to 21', input: '{"low":0,"high":21}' },
    { label: 'Hundreds', input: '{"low":100,"high":150}' },
    { label: 'None', input: '{"low":11,"high":11}' },
    { label: 'Zero alone', input: '{\"low\":0,\"high\":0}' },
    { label: 'Largest allowed range', input: '{\"low\":999,\"high\":1000}' },
    { label: 'Long run: full range up to 1000', input: '{\"low\":0,\"high\":1000}' },
  ],
}

export default function Problem1215SteppingNumbers() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <SteppingWalkView run={run} step={step} />}
      renderReasoning={() => (
        <p>A stepping number is a walk of one-digit moves, so every stepping number is reached by a walk started at its leading digit. Walks that pass above high are cut off, because appending digits only makes a number larger.</p>
      )}
    />
  )
}
