import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Empty set', description: 'Start with no prefixes stored.' },
    { id: 'insert', label: 'Store arr1', description: 'Store every decimal prefix of an arr1 number.' },
    { id: 'query', label: 'Query arr2', description: 'Find the longest prefix of an arr2 number that is stored.' },
    { id: 'done', label: 'Complete', description: 'Report the longest shared prefix.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with arr1 and arr2 (JSON lists of positive integers)',
  url: 'https://leetcode.com/problems/find-the-length-of-the-longest-common-prefix/',
  complexity: 'O((n + m) * d) time, where d is the number of digits. The visualization caps each array at 8 values.',
  examples: [
    { label: 'Example 1', input: '{"arr1":[1,10,100],"arr2":[1000]}' },
    { label: 'No match', input: '{"arr1":[1,2,3],"arr2":[4,4,4]}' },
  ],
}

export default function LongestCommonPrefixLength() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IndexedSequence label="Stored prefixes" length={step.prefixes.length} valueAt={i => step.prefixes[i]} />
    <output aria-label="Current number">{step.current === null ? 'Building the prefix set' : `Number ${step.current}: ${step.found === undefined ? 'stored as prefixes' : `longest shared prefix ${step.found}`}. Best ${step.best}.`}</output>
  </>} renderReasoning={() => <>
    <p>Every decimal prefix of an arr1 number goes into one set, so a prefix shared by several numbers is stored once.</p>
    <p>For an arr2 number, the longest prefix that is stored gives the best match, so checking from longest to shortest stops early.</p>
  </>} />
}
