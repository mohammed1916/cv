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
    { label: 'Three values', input: '[1,2,3]' },
    { label: 'Full range, reversed', input: '[50,49,48,47,46,45,44,43,42,41,40,39,38,37,36,35,34,33,32,31,30,29,28,27,26,25,24,23,22,21,20,19,18,17,16,15,14,13,12,11,10,9,8,7,6,5,4,3,2,1]' },
    { label: 'Long run: 50 values', input: '[2,30,7,23,43,48,4,31,10,12,29,21,20,18,14,36,19,38,40,24,28,27,8,37,39,49,50,13,46,3,32,34,45,17,26,41,44,11,16,25,1,47,6,9,22,35,15,33,42,5]' },
  ],
}

export default function DistributeTwoArrays() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <DistributeLanesView nums={run.input} step={step} />} renderReasoning={() => <>
    <p>The first two values start the arrays. Each later value is compared with the last elements of the two arrays, and it joins the first array only when that last element is larger.</p>
    <p>Joining the arrays at the end keeps every value in the order it was placed.</p>
  </>} />
}
