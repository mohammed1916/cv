import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import HashMapView from '../../components/shared/HashMapView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Remainders', description: 'Prepare to count remainders modulo value.' },
    { id: 'count', label: 'Count', description: 'Add each number to the count for its remainder.' },
    { id: 'use', label: 'Build m', description: 'Spend one number with remainder m mod value.' },
    { id: 'missing', label: 'Missing', description: 'No number is left for this remainder, so m is the answer.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Numbers and value as JSON: {"nums": [...], "value": v}',
  url: 'https://leetcode.com/problems/smallest-missing-non-negative-integer-after-operations/',
  complexity: 'O(n + answer) time with a table of at most value entries. The visualization caps input at 20 numbers.',
  examples: [
    { label: 'Example 1', input: '{"nums":[1,-10,7,13,6,8],"value":5}' },
    { label: 'Example 2', input: '{"nums":[1,-10,7,13,6,8],"value":7}' },
  ],
}

export default function SmallestMissingMex() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <p>{`Target m = ${step.target ?? 'not started'}, remainder ${step.target === null ? '-' : step.target % run.input.value} (mod ${run.input.value})`}</p>
    <HashMapView maps={step.maps} ops={step.ops} />
    <output aria-label="Current m">{step.phase === 'missing' ? `Answer: ${step.result}` : `Building m = ${step.target ?? 0}`}</output>
  </>} renderReasoning={() => <>
    <p>Adding or subtracting value keeps a number’s remainder mod value fixed, so the numbers are sorted into remainder groups.</p>
    <p>Building 0, 1, 2, and so on, each target uses one number from its remainder group. The first target whose group is empty is the largest achievable answer.</p>
  </>} />
}
