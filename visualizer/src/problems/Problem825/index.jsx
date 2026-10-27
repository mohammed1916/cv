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
  examples: [{ label: 'Two people', input: '[16,16]' }, { label: 'Three people', input: '[16,17,18]' }, { label: 'Mixed', input: '[20,30,100,110,120]' }],
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
