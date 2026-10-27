import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Set up the search for both patterns.' },
    { id: 'match', label: 'Match', description: 'A start of a has a start of b close enough.' },
    { id: 'miss', label: 'Miss', description: 'No start of b is close enough to this start of a.' },
    { id: 'done', label: 'Complete', description: 'Report the beautiful indices.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with s, a, b and k (JSON)',
  url: 'https://leetcode.com/problems/find-beautiful-indices-in-the-given-array-i/',
  complexity: 'O(n * m) time in this direct scan, and O(n) space. The visualization caps s at 40 letters.',
  examples: [
    { label: 'Example 1', input: '{"s":"isawsquirrelnearmysquirrelhouseohmy","a":"my","b":"squirrel","k":15}' },
    { label: 'Example 2', input: '{"s":"abcd","a":"a","b":"a","k":4}' },
  ],
}

export default function BeautifulIndicesI() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Characters of s" length={run.input.s.length} valueAt={i => run.input.s[i]} roleAt={i => (step.found.includes(i) ? 'beautiful' : '')} active={step.index} />
    <output aria-label="Beautiful so far">{`Beautiful so far: [${step.found.join(', ')}]`}</output>
  </>} renderReasoning={() => <>
    <p>An index is beautiful when a starts there and some start of b is within k of it.</p>
    <p>The direct scan compares each start of a with each start of b, which is simple and easy to verify.</p>
  </>} />
}
