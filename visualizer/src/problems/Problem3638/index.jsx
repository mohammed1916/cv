import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import ShipmentBarsView from './ShipmentBarsView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  number: '3638',
  phases: [
    { id: 'start', label: 'Start', description: 'Nothing is open yet.' },
    { id: 'compare', label: 'Compare', description: 'Test the next parcel against the peak.' },
    { id: 'raise', label: 'Raise peak', description: 'The parcel is at least as heavy, so it cannot end the shipment.' },
    { id: 'ship', label: 'Ship', description: 'A lighter parcel closes the shipment at once.' },
    { id: 'done', label: 'Result', description: 'Report how many shipments closed.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with weight',
  url: 'https://leetcode.com/problems/maximum-balanced-shipments/',
  complexity: 'O(n) time and O(1) space. The official length reaches 100000; this page caps weight at 40 parcels so every bar stays readable.',
  examples: [
    { label: 'Three shipments', input: '{"weight":[7,2,9,9,6,3,8,1]}' },
    { label: 'Equal weights do not count', input: '{"weight":[5,5,5,2,5,5]}' },
    { label: 'Rising line: none', input: '{"weight":[3,3,5,8]}' },
  ],
}

export default function MaximumBalancedShipments() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <ShipmentBarsView run={run} step={step} />} renderReasoning={() => <>
    <p>A shipment needs some parcel strictly heavier than its last one. The first moment a parcel is lighter than the running peak, the shipment can end there.</p>
    <p>Ending it right away is never worse. Any longer version uses up more parcels and still counts as one shipment, while the shorter one leaves a longer line for the rest.</p>
    <p>A parcel equal to the peak cannot end a shipment, because the comparison is strict.</p>
  </>} />
}
