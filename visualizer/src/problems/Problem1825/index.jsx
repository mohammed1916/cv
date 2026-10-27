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
