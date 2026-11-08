import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with an empty stream.' },
    { id: 'add', label: 'Add', description: 'Append a value to the stream.' },
    { id: 'calc', label: 'Calculate', description: 'Take the last m values, drop the k smallest and k largest, and average the rest.' },
    { id: 'done', label: 'Complete', description: 'Report the record of every operation.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with m, k and operations such as ["add", 3] or ["calc"], for example {"m":3,"k":1,"operations":[["add",3],["add",1],["calc"]]}',
  url: 'https://leetcode.com/problems/finding-mk-average/',
  complexity: 'The visualization sorts the last m values on each calculation, so it costs O(m log m) per calc. The statement is solved with ordered sets in O(log m) per operation. Input is capped at 60 operations.',
  examples: [
    { label: 'Example', input: '{"m":3,"k":1,"operations":[["add",3],["add",1],["calc"],["add",10],["calc"],["add",5],["add",5],["add",5],["calc"]]}' },
    { label: 'Too short', input: '{"m":4,"k":1,"operations":[["add",2],["calc"]]}' },
  { label: 'Smallest window, no values', input: "{\"m\":3,\"k\":1,\"operations\":[[\"calc\"]]}" },
  { label: 'Repeated values', input: "{\"m\":5,\"k\":2,\"operations\":[[\"add\",7],[\"add\",7],[\"add\",7],[\"calc\"]]}" },
  { label: 'Largest window', input: "{\"m\":30,\"k\":14,\"operations\":[[\"add\",1000],[\"calc\"],[\"add\",1000],[\"calc\"],[\"add\",1000],[\"calc\"],[\"add\",1000],[\"calc\"],[\"add\",1000],[\"calc\"],[\"add\",1000],[\"calc\"],[\"add\",1000],[\"calc\"],[\"add\",1000],[\"calc\"],[\"add\",1000],[\"calc\"],[\"add\",1000],[\"calc\"],[\"add\",1000],[\"calc\"],[\"add\",1000],[\"calc\"],[\"add\",1000],[\"calc\"],[\"add\",1000],[\"calc\"],[\"add\",1000],[\"calc\"],[\"add\",1000],[\"calc\"],[\"add\",1000],[\"calc\"],[\"add\",1000],[\"calc\"],[\"add\",1000],[\"calc\"],[\"add\",1000],[\"calc\"],[\"add\",1000],[\"calc\"],[\"add\",1000],[\"calc\"],[\"add\",1000],[\"calc\"],[\"add\",1000],[\"calc\"],[\"add\",1000],[\"calc\"],[\"add\",1000],[\"calc\"],[\"add\",1000],[\"calc\"],[\"add\",1000],[\"calc\"],[\"add\",1000],[\"calc\"],[\"add\",1000],[\"calc\"]]}" },
  { label: 'Long run: 60 operations', input: "{\"m\":20,\"k\":5,\"operations\":[[\"calc\"],[\"calc\"],[\"add\",805],[\"add\",756],[\"add\",864],[\"add\",530],[\"calc\"],[\"add\",277],[\"add\",539],[\"add\",267],[\"add\",997],[\"add\",579],[\"calc\"],[\"add\",911],[\"add\",742],[\"calc\"],[\"add\",115],[\"add\",429],[\"add\",31],[\"add\",858],[\"add\",36],[\"add\",43],[\"add\",429],[\"add\",519],[\"add\",31],[\"add\",188],[\"calc\"],[\"add\",619],[\"add\",360],[\"calc\"],[\"calc\"],[\"calc\"],[\"calc\"],[\"calc\"],[\"add\",21],[\"calc\"],[\"calc\"],[\"add\",263],[\"add\",4],[\"calc\"],[\"calc\"],[\"add\",388],[\"add\",489],[\"add\",63],[\"add\",164],[\"add\",116],[\"add\",664],[\"add\",417],[\"add\",84],[\"add\",331],[\"add\",814],[\"add\",147],[\"calc\"],[\"calc\"],[\"add\",506],[\"add\",89],[\"add\",807],[\"add\",177],[\"add\",706],[\"calc\"]]}" },
  ],
}

export default function FindingMKAverage() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Stream" length={step.stream.length} valueAt={index => step.stream[index]} active={step.stream.length - 1}
      roleAt={index => (index >= step.stream.length - run.input.m ? 'last m' : '')} />
    <output aria-label="Records">{`Records so far: [${step.results.map(r => (r === null ? 'add' : r)).join(', ')}]${step.last === null ? '' : `. This calculation: ${step.last}`}`}</output>
  </>} renderReasoning={() => <>
    <p>Only the last m values count. Among them, the k smallest and k largest are dropped so that outliers do not move the average.</p>
    <p>A fast solution keeps those values in ordered structures; this visualization sorts them again on every calculation so each step stays easy to follow.</p>
  </>} />
}
