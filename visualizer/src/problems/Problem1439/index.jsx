import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import HeapView from '../../components/shared/HeapView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'The empty choice has sum 0.' },
    { id: 'pop', label: 'Pop', description: 'Take the smallest candidate sum and push its successor in the same row.' },
    { id: 'done', label: 'Complete', description: 'Report the k-th smallest sum.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON {"mat": [[sorted row], ...] (values 1 to 20), "k": rank}',
  url: 'https://leetcode.com/problems/find-the-kth-smallest-sum-of-a-matrix-with-sorted-rows/',
  complexity: 'O(m * k * log k) time for m rows and k kept sums. The visualization caps the matrix at 4 by 4.',
  examples: [
    { label: 'Own case 1', input: '{"mat":[[2,4,12],[3,5,7]],"k":6}' },
    { label: 'Own case 2', input: '{"mat":[[2,11,11],[2,5,6],[3,4,7]],"k":8}' },
    { label: 'One cell', input: '{"mat":[[1]],"k":1}' },
    { label: 'Equal values', input: '{"mat":[[2,2],[2,2]],"k":3}' },
    { label: 'Largest values in a 4 by 4 grid', input: '{"mat":[[17,18,19,20],[17,18,19,20],[17,18,19,20],[17,18,19,20]],"k":16}' },
    { label: 'Long run: 4 by 4 grid', input: '{"mat":[[1,1,17,20],[8,10,18,19],[8,15,18,20],[7,9,10,20]],"k":9}' },
  ],
}

export default function KthSmallestMatrixSum() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    {step.heap && <HeapView {...step.heap} />}
    <output aria-label="Kept sums">{`Kept sums so far: [${step.popped.join(', ')}]`}</output>
    <p>{step.message}</p>
  </>} renderReasoning={() => <>
    <p>Each row is merged into the kept sums with a heap. Each entry is a pair of a kept sum and a column in the row, so the heap always yields the next smallest combination.</p>
    <p>Only k sums are kept per row, because a larger sum can never reach the k-th smallest overall.</p>
  </>} />
}
