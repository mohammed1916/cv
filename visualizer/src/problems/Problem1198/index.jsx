import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import PointerTracksView from './PointerTracksView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1198',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Matrix of strictly increasing rows (e.g. [[1,2,3],[2,3,4],[2,3,5]])',
  url: 'https://leetcode.com/problems/find-smallest-common-element-in-all-rows/',
  complexity: 'O(R · C) time and O(R) space for R rows of C values, moving each pointer forward only. The visualization caps the matrix at 6 rows and 10 columns with values from 0 to 1000; the official bounds were not verified.',
  examples: [
    { label: 'Common 3', input: '[[2,3,6,9],[1,3,4,9],[3,5,9,10],[3,9,11,12]]' },
    { label: 'No common value', input: '[[1,2],[3,4]]' },
    { label: 'Single cell', input: '[[5]]' },
    { label: 'Several common values, smallest wins', input: '[[1,4,7],[4,7,9],[2,4,7]]' },
    { label: 'Largest allowed values in six rows', input: '[[0,1000],[0,1000],[0,1000],[0,1000],[0,1000],[0,1000]]' },
    { label: 'Long run: six rows of ten values', input: '[[13,100,191,379,500,701,726,811,942,949],[142,162,186,360,405,500,522,542,894,897],[7,87,155,339,447,500,555,655,811,978],[45,78,292,419,500,568,657,674,835,859],[92,316,500,585,593,762,785,860,930,978],[96,138,231,284,327,500,538,689,715,851]]' },
  ],
}

export default function SmallestCommonElement() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <PointerTracksView run={run} step={step} />}
      renderReasoning={({ run, step }) => (
        <p>
          The largest pointer value is a floor for any common value, so every smaller value at the front of a row can be discarded.
          {run ? ` The answer is ${run.answer}.` : ''} {step.advanced && step.advanced.length ? `${step.advanced.length} row${step.advanced.length === 1 ? '' : 's'} moved on this step.` : ''}
        </p>
      )}
    />
  )
}
