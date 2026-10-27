import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Split', description: 'Separate the three channels.' },
    { id: 'channel', label: 'Snap a channel', description: 'Pick the nearest multiple of 17 for this channel.' },
    { id: 'done', label: 'Complete', description: 'Combine the three shorthand digits.' },
  ],
  parse: parseInput, build: buildTrace, code,
  inputLabel: 'Color (JSON string "#rrggbb")',
  url: 'https://leetcode.com/problems/similar-rgb-color/',
  complexity: 'O(1) time: each channel has only 16 candidates.',
  examples: [
    { label: 'Example 1', input: '"#09f166"' },
    { label: 'Already short', input: '"#112233"' },
  ],
}

export default function SimilarRgb() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IndexedSequence label="Chosen digits (red, green, blue)" length={3} active={step.channel ?? -1}
      valueAt={i => (step.digits[i] === undefined ? '-' : step.digits[i].toString(16) + step.digits[i].toString(16))} />
    <output aria-label="Channel">{step.value === null ? step.message : `Channel value ${step.value} → ${step.digit * 17}`}</output>
  </>} renderReasoning={() => <>
    <p>The channels do not affect each other, so the closest color is the closest value for each channel separately.</p>
    <p>A shorthand value is 17 times a digit, so each channel has just 16 candidates to compare.</p>
  </>} />
}
