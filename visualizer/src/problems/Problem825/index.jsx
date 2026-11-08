import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Bucket ages', description: 'Count how many people have each age.' },
    { id: 'age', label: 'Sender age', description: 'Add requests from every person of this age to all valid receivers.' },
    { id: 'done', label: 'Complete', description: 'Return the total number of requests.' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'Ages array (JSON)',
  url: 'https://leetcode.com/problems/friends-of-appropriate-ages/',
  complexity: 'O(n + A^2) time with A = 120 possible ages; O(A) space. A prefix sum would make it O(n + A).',
  examples: [{ label: 'Two people', input: '[16,16]' }, { label: 'Three people', input: '[16,17,18]' }, { label: 'Mixed', input: '[20,30,100,110,120]' }, { label: 'Single person', input: '[1]' }, { label: 'Equal ages', input: '[30,30,30]' }, { label: 'Youngest and oldest allowed', input: '[1,120]' }, { label: 'Long run: 200 people', input: '[27,16,66,93,93,111,78,74,38,56,16,44,62,53,25,68,76,114,44,9,45,95,118,67,52,48,58,76,53,53,39,92,88,25,58,107,93,75,51,45,107,53,1,116,32,81,12,105,24,84,7,48,119,73,97,70,77,95,24,100,44,29,44,113,50,11,61,24,54,73,68,102,69,83,41,90,90,43,42,43,15,93,7,27,70,33,94,44,5,10,49,118,78,73,65,94,50,49,64,94,89,96,18,39,2,66,25,22,26,117,43,66,15,85,116,17,42,45,91,109,30,58,110,90,107,88,4,44,33,16,62,19,52,104,68,38,12,33,25,73,114,47,62,93,114,90,104,19,75,119,41,73,111,30,38,40,43,58,78,108,30,82,45,65,97,58,19,20,58,73,33,41,105,64,76,46,87,119,41,74,81,111,55,32,9,63,51,64,102,79,14,60,105,23,94,6,87,77,31,26]' }],
}
export default function FriendsOfAppropriateAges() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const idx = run.entries.findIndex(e => e.age === step.sender)
    return <>
      <IndexedSequence label="Ages in input order" length={run.input.length} valueAt={i => run.input[i]} />
      <IndexedSequence label="Age buckets (age x count)" length={run.entries.length} active={idx} valueAt={i => `${run.entries[i].age} x${run.entries[i].count}`}
        roleAt={i => step.phase === 'age' && run.entries[i].age >= step.lo && run.entries[i].age <= step.sender && i !== idx ? 'receiver' : ''} />
      <output aria-label="Requests">Added {step.add} | total {step.total}</output>
    </>
  }} renderReasoning={({ step }) => <>
    <p>A sends to B unless B is 0.5*A + 7 or younger, or older than A. (The third rule is implied by the second.)</p>
    <p>Because only the age matters, everybody of the same age behaves identically, so one multiplication replaces many pair checks.</p>
    {step.phase === 'age' && <p>People of the same age may message each other but never themselves, hence the minus one.</p>}
  </>} />
}
