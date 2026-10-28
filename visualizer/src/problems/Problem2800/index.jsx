import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'No candidate has been built yet.' },
    { id: 'try', label: 'Try order', description: 'Merge the three strings in this order and compare the result.' },
    { id: 'better', label: 'New best', description: 'This candidate is shorter, or equally short and smaller.' },
    { id: 'done', label: 'Complete', description: 'Report the shortest candidate.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Three strings (JSON object with a, b and c)',
  url: 'https://leetcode.com/problems/shortest-string-that-contains-three-strings/',
  complexity: 'O(1) orders, each merge O(n^2) for n total letters. The visualization caps each string at 6 letters.',
  examples: [
    { label: 'Example 1', input: '{"a":"abc","b":"bca","c":"aaa"}' },
    { label: 'Example 2', input: '{"a":"ab","b":"ba","c":"aba"}' },
  ],
}

export default function ShortestStringThatContainsThree() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <section aria-label="Input strings">
      <ol>
        {['a', 'b', 'c'].map(k => <li key={k}>{`${k} = ${run.input[k]}`}</li>)}
      </ol>
    </section>
    <output aria-label="Candidate">{`Order: ${step.order || '(none)'}, candidate: ${step.candidate || '(none)'}, best: ${step.best || '(none)'}`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Some pair of strings is always merged first. Overlapping the ends of two strings saves the most letters, and trying every order covers every merge.</p>
  </>} />
}
