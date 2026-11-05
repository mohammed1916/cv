import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'
import DistributeLanesView from './DistributeLanesView'

const definition = {
  phases: [
    { id: 'start', label: 'Seed', description: 'The first two values start the two arrays.' },
    { id: 'arr1', label: 'First', description: 'The last value of the first array is larger.' },
    { id: 'arr2', label: 'Second', description: 'The last value of the second array is at least as large.' },
    { id: 'done', label: 'Result', description: 'Join the two arrays.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON array of 3 to 50 distinct integers from 1 to 50',
  url: 'https://leetcode.com/problems/distribute-elements-into-two-arrays-i/',
  complexity: 'O(n) time and O(n) space for the two arrays.',
  examples: [
    { label: 'Example 1', input: '[4,9,2,7]' },
    { label: 'Example 2', input: '[10,3,8,6,1]' },
  ],
}

export default function DistributeTwoArrays() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <DistributeLanesView nums={run.input} step={step} />} renderReasoning={() => <>
    <p>The first two values start the arrays. Each later value is compared with the last elements of the two arrays, and it joins the first array only when that last element is larger.</p>
    <p>Joining the arrays at the end keeps every value in the order it was placed.</p>
  </>} />
}
