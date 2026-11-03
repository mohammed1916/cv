import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import OverlapView from './OverlapView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Compare', description: 'Check whether one word already contains the other.' },
    { id: 'candidate', label: 'Overlap', description: 'Try a shared overlap in one order.' },
    { id: 'done', label: 'Result', description: 'Pick the shortest chain, then the smallest.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with first and second (lowercase words)',
  url: 'https://leetcode.com/problems/find-the-shortest-superstring-ii/',
  complexity: 'O(L^2) character comparisons for words of length up to L, with O(L) candidates of length up to 2L. The visualization caps each word at 8 letters.',
  examples: [
    { label: 'Shared end', input: '{"first":"cabad","second":"adbac"}' },
    { label: 'Contained', input: '{"first":"stone","second":"one"}' },
  ],
}

export default function FindTheShortestSuperstringII() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ run, step }) => <OverlapView run={run} step={step} />}
    renderReasoning={({ step }) => <>
      <p>{step.message}</p>
      <p>Only an overlap that matches the end of one word with the start of the other can shorten the chain.</p>
    </>} />
}
