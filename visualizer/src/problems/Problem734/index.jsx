import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Load pairs', description: 'Store each similar pair in both orders.' },
    { id: 'match', label: 'Compare a position', description: 'Equal words match, or a listed pair must connect them.' },
    { id: 'fail', label: 'Mismatch', description: 'A position has neither equal words nor a listed pair.' },
    { id: 'done', label: 'Similar', description: 'Every position matched.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Sentences and similar pairs (JSON)',
  url: 'https://leetcode.com/problems/sentence-similarity/',
  complexity: 'O(n + p) time for n words and p pairs. The visualization caps input at 20 words and 20 pairs.',
  examples: [
    { label: 'Similar', input: '{"s1":["great","acting","skills"],"s2":["fine","drama","talent"],"pairs":[["great","fine"],["acting","drama"],["skills","talent"]]}' },
    { label: 'Not similar', input: '{"s1":["an","extraordinary","meal"],"s2":["one","good","dinner"],"pairs":[["great","good"],["any","one"],["some","one"]]}' },
  ],
}

export default function SentenceSimilarity() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="First sentence" length={run.s1.length} active={step.index ?? -1} valueAt={i => run.s1[i]}
      roleAt={i => (step.index !== null && i < step.index ? 'read' : '')} />
    <IndexedSequence label="Second sentence" length={run.s2.length} active={step.index ?? -1} valueAt={i => run.s2[i]}
      roleAt={i => (step.index !== null && i < step.index ? 'read' : '')} />
    <output aria-label="Comparison">{step.result === undefined || step.result === null ? step.message : `Similar: ${step.result}`}</output>
  </>} renderReasoning={() => <>
    <p>Positions are compared one at a time. A position is fine when the words are equal or when the two words appear together in the list.</p>
    <p>Similarity is not transitive, so a pair that connects a to b and b to c does not connect a to c. The check only looks at direct pairs.</p>
  </>} />
}
