import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import MiddleModeView from './MiddleModeView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  phases,
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums (5 to 24 integers here)',
  url: 'https://leetcode.com/problems/subsequences-with-a-unique-middle-mode-ii/',
  complexity: 'O(n) expected time and O(k) space for k distinct values, using five running sums. The official length is up to 100,000; the visualization caps nums at 24 entries.',
  examples: [
    { label: 'Mixed', input: '{"nums":[7,2,7,9,4,7,2]}' },
    { label: 'Tie risk', input: '{"nums":[3,8,3,8,5,6]}' },
    { label: 'All equal', input: '{"nums":[4,4,4,4,4]}' },
    { label: 'All different: none', input: '{"nums":[10,20,30,40,50,60]}' },
    { label: 'Smallest run: five values', input: '{"nums":[1,2,3,4,5]}' },
    { label: 'Equal values tie', input: '{"nums":[7,7,7,7,7]}' },
    { label: 'Boundary magnitudes', input: '{"nums":[1000000000,-1000000000,1000000000,-1000000000,1000000000]}' },
    { label: 'Long run: 24 items', input: '{"nums":[48,-16,39,-47,8,-24,-23,-1,2,35,4,23,-3,-49,45,-5,39,17,-40,6,7,-21,-46,-14]}' },
  ],
}

export default function SubsequencesWithUniqueMiddleModeII() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <MiddleModeView run={run} step={step} />} renderReasoning={() => <>
    <p>Fix the middle element and call its value x. A pick takes two elements from the left and two from the right, so only one question matters: how many of those four are also x?</p>
    <p>Zero extra copies never works, because x appears once and any other value ties it. Two or more extra copies always work, because x appears at least three times and only two other elements remain. One extra copy works only when the other three elements all differ, since any repeat would tie x at two.</p>
    <p>The nine-cell grid applies those rules. Most cells are plain multiplication. The two cells with exactly one extra copy need the count of differing triples, and the table beneath shows that count value by value. Expanding that sum leaves only totals of L², R², L·R, L·R² and L²·R, which change in constant time when one element moves across the middle.</p>
  </>} />
}
