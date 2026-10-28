import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Sort', description: 'Order the unique words from shortest to longest.' },
    { id: 'word', label: 'Start word', description: 'Begin a chain of length one at this word.' },
    { id: 'predecessor', label: 'Predecessor', description: 'Extend the chain when deleting one letter gives a known word.' },
    { id: 'done', label: 'Complete', description: 'Report the longest chain.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with words (JSON array of strings)',
  url: 'https://leetcode.com/problems/longest-string-chain/',
  complexity: 'O(n * L^2) time with a map lookup per deletion, for n words of length L. The visualization caps input at 8 words of up to 6 letters.',
  examples: [
    { label: 'Example 1', input: '{"words":["a","b","ba","bca","bda","bdca"]}' },
    { label: 'Example 2', input: '{"words":["xbc","pcxbcf","xb","cxbc","pcxbc"]}' },
  ],
}

export default function LongestStringChain() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const order = Object.keys(step.best)
    return <>
      <IndexedSequence label="Words by length" length={order.length} valueAt={i => order[i]}
        active={order.indexOf(step.word)} roleAt={i => `chain ${step.best[order[i]]}`} />
      <output aria-label="Chain">{step.phase === 'done' ? `Longest chain: ${run.result}` : step.word ? `${step.word}: chain ${step.best[step.word]}` : 'Sorting the words'}</output>
    </>
  }} renderReasoning={() => <>
    <p>A word can extend the chain of the word obtained by deleting one of its letters, and that shorter word is always processed first.</p>
    <p>Each word stores the length of the longest chain that ends at it, so the answer is the largest stored value.</p>
  </>} />
}
