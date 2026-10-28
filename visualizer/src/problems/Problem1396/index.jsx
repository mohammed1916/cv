import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import HashMapView from '../../components/shared/HashMapView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Empty tables', description: 'Both hash maps start empty.' },
    { id: 'checkin', label: 'Check in', description: 'Store the station and time under the customer id.' },
    { id: 'checkout', label: 'Check out', description: 'Pair with the check-in and add the trip to its route.' },
    { id: 'query', label: 'Average', description: 'Divide the route total by its trip count.' },
    { id: 'done', label: 'Complete', description: 'Every operation has been answered.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Operations as JSON: {"operations": [["checkIn", id, station, time], ...]}',
  url: 'https://leetcode.com/problems/design-underground-system/',
  complexity: 'O(1) time per operation with hash maps; the visualization caps input at 40 operations.',
  examples: [
    { label: 'Example 1', input: '{"operations":[["checkIn",45,"Leyton",3],["checkIn",32,"Paradise",8],["checkIn",27,"Leyton",10],["checkOut",45,"Waterloo",15],["checkOut",27,"Waterloo",20],["checkOut",32,"Cambridge",22],["getAverageTime","Paradise","Cambridge"],["getAverageTime","Leyton","Waterloo"],["checkIn",10,"Leyton",24],["getAverageTime","Leyton","Waterloo"],["checkOut",10,"Waterloo",38],["getAverageTime","Leyton","Waterloo"]]}' },
    { label: 'Two trips', input: '{"operations":[["checkIn",1,"Ab",1],["checkOut",1,"Cd",5],["checkIn",2,"Ab",6],["checkOut",2,"Cd",8],["getAverageTime","Ab","Cd"]]}' },
  ],
}

export default function UndergroundSystem() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <HashMapView maps={step.maps} ops={step.ops} />
    <output aria-label="Latest answer">{step.result === null ? 'No average yet' : `Average: ${step.result}`}</output>
  </>} renderReasoning={() => <>
    <p>A check-in waits in one hash map keyed by customer id. The matching check-out finds it in one lookup, so no trip is ever searched for.</p>
    <p>Each route keeps a running total and a trip count. An average is one division, so getAverageTime costs the same no matter how many trips exist.</p>
  </>} />
}
