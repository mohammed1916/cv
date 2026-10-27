import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'First window', description: 'Count the white blocks in the first k blocks.' },
    { id: 'slide', label: 'Slide', description: 'Move the window one block: the leaving block and the entering block change the count.' },
    { id: 'record', label: 'Record', description: 'Keep the smallest white count seen.' },
    { id: 'done', label: 'Complete', description: 'Report the minimum recolors.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with blocks (letters W and B) and k, for example {"blocks":"WBBWWBBWBW","k":7}',
  url: 'https://leetcode.com/problems/minimum-recolors-to-get-k-consecutive-black-blocks/',
  complexity: 'O(n) time and O(1) extra space. The visualization caps blocks at 40 characters.',
  examples: [
    { label: 'Example 1', input: '{"blocks":"WBBWWBBWBW","k":7}' },
    { label: 'Already black', input: '{"blocks":"WBWBBBW","k":2}' },
  ],
}

export default function MinimumRecolors() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Blocks" length={run.input.blocks.length} valueAt={index => run.input.blocks[index]} active={step.start}
      roleAt={index => (step.start >= 0 && step.start <= index && index < step.start + run.input.k ? 'window' : '')} />
    <output aria-label="White count">{`Window of ${run.input.k} blocks has ${step.white} white. Best recolors: ${step.best}`}</output>
  </>} renderReasoning={() => <>
    <p>Each white block in a window of k needs one recolor, so the task is to find the window with the fewest white blocks.</p>
    <p>Moving the window by one block changes the count by at most two, so each step updates the count in constant time.</p>
  </>} />
}
