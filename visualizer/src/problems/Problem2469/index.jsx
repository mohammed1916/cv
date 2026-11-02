import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  number: '2469',
  phases: [
    { id: 'kelvin', label: 'Kelvin', description: 'Shift the scale by 273.15.' },
    { id: 'fahrenheit', label: 'Fahrenheit', description: 'Scale by 1.80 and add 32.' },
    { id: 'done', label: 'Result', description: 'Return both values.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON {"celsius": 36.5}',
  url: 'https://leetcode.com/problems/convert-the-temperature/',
  complexity: 'O(1) time and O(1) space.',
  examples: [
    { label: 'Example 1', input: '{"celsius":36.5}' },
    { label: 'Freezing', input: '{"celsius":0}' },
  ],
}

export default function ConvertTheTemperature() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <dl className="algorithm-readout" aria-label="Converted temperature">
      <dt>Celsius</dt><dd>{run.input.celsius}</dd>
      <dt>Kelvin</dt><dd>{step.kelvin === null ? '...' : step.kelvin.toFixed(5)}</dd>
      <dt>Fahrenheit</dt><dd>{step.fahrenheit === null ? '...' : step.fahrenheit.toFixed(5)}</dd>
    </dl>
    <p role="status">{step.message}</p>
  </>} renderReasoning={() => <>
    <p>Kelvin is Celsius shifted by 273.15. Fahrenheit is Celsius multiplied by 1.80 and then shifted by 32.</p>
    <p>Each conversion is a single formula, so the answer is computed directly.</p>
  </>} />
}
