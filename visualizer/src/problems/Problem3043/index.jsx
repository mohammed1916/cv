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
    { label: 'Own case 1', input: '{"arr1":[2,11,101],"arr2":[1001]}' },
    { label: 'No match', input: '{"arr1":[1,2,3],"arr2":[4,4,4]}' },
    { label: 'Single values', input: '{"arr1":[1],"arr2":[1]}' },
    { label: 'Equal values', input: '{"arr1":[7,7],"arr2":[7,7,7]}' },
    { label: 'Largest values', input: '{"arr1":[99999,99999,99999],"arr2":[99999,1]}' },
    { label: 'Long run: 8 values each', input: '{"arr1":[75856,64932,45010,5125,4816,74672,34370,28821],"arr2":[37871,82788,41737,66682,84332,9083,84103,43319]}' },
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
