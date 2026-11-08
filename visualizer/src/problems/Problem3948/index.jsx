import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import MexCutView from './MexCutView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin at the first index with an empty answer.' },
    { id: 'suffix', label: 'Target', description: 'Find the largest mex the remaining values can give.' },
    { id: 'extend', label: 'Extend', description: 'Grow the segment until it holds every smaller value.' },
    { id: 'cut', label: 'Cut', description: 'Record the mex and continue after the cut.' },
    { id: 'done', label: 'Result', description: 'The lexicographically greatest answer.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON array of small nonnegative integers (e.g. [1,0,2,0])',
  url: 'https://leetcode.com/problems/lexicographically-maximum-mex-array/',
  complexity: 'This trace rescans the suffix for each cut, so it is O(n^2) on the small visual inputs. The official limit is 100000 values.',
  examples: [
    { label: 'Mixed', input: '[1,0,2,0]' },
    { label: 'Repeated zeros', input: '[0,1,0,0]' },
    { label: 'Single cut', input: '[2,3,0]' },
    { label: 'Single value', input: '[1]' },
    { label: 'Equal values', input: '[2,2,2,2]' },
    { label: 'Full run to eleven', input: '[0,1,2,3,4,5,6,7,8,9,10,11]' },
    { label: 'Long run: 12 items', input: '[8,6,5,14,10,13,18,0,4,1,20,19]' },
  ],
}

export default function LexicographicallyMaximumMexArray() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <MexCutView run={run} step={step} />} renderReasoning={({ run, step }) => (
    <p>
      The first segment should have the largest mex the whole remaining suffix can reach, and the shortest such segment leaves the most values for later cuts. {run ? `The answer has ${run.result.length} value${run.result.length === 1 ? '' : 's'}.` : ''}
    </p>
  )} />
}
