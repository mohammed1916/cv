import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import Faulty1826View from './Faulty1826View'
import './Faulty1826View.css'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Readings', description: 'Read both sensor lists.' },
    { id: 'candidate', label: 'Candidate', description: 'Pick the sensor to test as faulty.' },
    { id: 'drop', label: 'Drop', description: 'Choose which original index went missing.' },
    { id: 'compare', label: 'Compare', description: 'Check a value against its original slot.' },
    { id: 'mismatch', label: 'Mismatch', description: 'This dropped index cannot explain the readings.' },
    { id: 'explained', label: 'Explained', description: 'The drop explains every value before the free last one.' },
    { id: 'reject', label: 'Reject', description: 'No drop explains this candidate.' },
    { id: 'done', label: 'Result', description: 'Return the single faulty sensor, or -1.' },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with sensor1 and sensor2 (equal-length lists)',
  url: 'https://leetcode.com/problems/faulty-sensor/',
  complexity: 'O(n^2) time and O(n) space for readings of length n, checked by trying every dropped index for both sensors. The visualization caps each reading at 10 values from 0 to 99.',
  examples: [
    { label: 'Sensor 2 faulty', input: '{"sensor1":[1,2,3,4,5],"sensor2":[1,2,4,5,6]}' },
    { label: 'Ambiguous', input: '{"sensor1":[7,7,7],"sensor2":[7,7,7]}' },
    { label: 'Sensor 1 faulty', input: '{"sensor1":[4,2,8,1],"sensor2":[4,9,2,8]}' },
    { label: 'Unrelated', input: '{"sensor1":[5,6,7],"sensor2":[1,2,3]}' },
  { label: 'Two readings, one mismatch', input: "{\"sensor1\":[1,2],\"sensor2\":[1,3]}" },
  { label: 'All zero readings', input: "{\"sensor1\":[0,0,0,0],\"sensor2\":[0,0,0,0]}" },
  { label: 'Largest values, ten readings', input: "{\"sensor1\":[10,20,30,40,50,60,70,80,90,99],\"sensor2\":[10,20,30,40,50,60,70,80,90,98]}" },
  { label: 'Long run: ten readings', input: "{\"sensor1\":[77,23,90,39,34,18,48,44,4,84],\"sensor2\":[77,23,90,40,34,18,48,49,4,84]}" },
  ],
}

export default function FaultySensorVisualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <Faulty1826View run={run} step={step} />}
      renderReasoning={({ step }) => (
        <p>{step.message}</p>
      )}
    />
  )
}
