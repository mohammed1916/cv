import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Nothing is chosen yet.' },
    { id: 'take', label: 'Take', description: 'The candidate has no partner among the chosen values.' },
    { id: 'skip', label: 'Skip', description: 'The candidate would pair with a chosen value to make k.' },
    { id: 'done', label: 'Complete', description: 'Report the minimum sum.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with n and k (JSON), n from 1 to 20, k from 1 to 40',
  url: 'https://leetcode.com/problems/determine-the-minimum-sum-of-a-k-avoiding-array/',
  complexity: 'O(n * k) with the simple membership test. The visualization caps n at 20.',
  question: "Build a sorted array of distinct positive numbers of a given length where no two values add up to k, and return the smallest possible sum.",
  approaches: [
    { name: "Greedy with membership test", intuition: "Take the smallest candidate whose partner is not already chosen, repeating until the length is reached.", time: "O(n k)", space: "O(n)" },
    { name: "Closed-form pairing", intuition: "The smallest values form pairs around half of k, so the sum has a direct formula.", time: "O(1)", space: "O(1)" },
  ],
  examples: [
    { label: 'Eight, k of three', input: '{"n":8,"k":3}' },
    { label: 'Single position', input: '{"n":1,"k":1}' },
    { label: "Single item", input: "{\"n\":1,\"k\":1}" },
    { label: "Equal split", input: "{\"n\":4,\"k\":4}" },
    { label: "Largest n and k", input: "{\"n\":20,\"k\":40}" },
    { label: "Long run: 20 by 37", input: "{\"n\":20,\"k\":37}" },
  ],
}

export default function KAvoidingSum() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IndexedSequence label="Chosen values" length={step.chosen.length} valueAt={i => step.chosen[i]} />
    <output aria-label="Candidate">{`Candidate ${step.candidate || '-'}, running sum ${step.sum}`}</output>
  </>} renderReasoning={() => <>
    <p>Taking the smallest values first keeps the sum small, so the only reason to skip a value is that its partner for k is already in the array.</p>
    <p>The value k divided by two may be used once, because the elements must be distinct.</p>
  </>} />
}
