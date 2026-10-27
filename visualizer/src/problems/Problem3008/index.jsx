import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'List the occurrences of both patterns.' },
    { id: 'advance', label: 'Advance', description: 'Move the b pointer past starts that are too far left.' },
    { id: 'match', label: 'Match', description: 'The next b start is within k of this a start.' },
    { id: 'miss', label: 'Miss', description: 'No b start is close enough.' },
    { id: 'done', label: 'Complete', description: 'Report the beautiful indices.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with s, a, b and k (JSON)',
  url: 'https://leetcode.com/problems/find-beautiful-indices-in-the-given-array-ii/',
  complexity: 'O(n + m) time after finding occurrences, and O(n) space. The visualization caps s at 40 letters.',
  examples: [
    { label: 'Example 1', input: '{"s":"isawsquirrelnearmysquirrelhouseohmy","a":"my","b":"squirrel","k":15}' },
    { label: 'Example 2', input: '{"s":"abcd","a":"a","b":"a","k":4}' },
  ],
}

export default function BeautifulIndicesII() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Characters of s" length={run.input.s.length} valueAt={i => run.input.s[i]} roleAt={i => (step.found.includes(i) ? 'beautiful' : '')} active={step.index} />
    <output aria-label="Pointer">{`Pointer into b starts: ${step.p}. Beautiful so far: [${step.found.join(', ')}]`}</output>
  </>} renderReasoning={() => <>
    <p>Both occurrence lists are sorted, so as the starts of a move right the nearest candidate start of b only moves right too.</p>
    <p>One pointer sweep therefore finds each answer in amortized constant time after the occurrences are listed.</p>
  </>} />
}
