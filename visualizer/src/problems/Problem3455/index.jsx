import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start index', description: 'Choose the index where the match begins.' },
    { id: 'prefix', label: 'Prefix', description: 'The prefix must start at this index.' },
    { id: 'middle', label: 'Middle', description: 'Find the earliest middle after the prefix.' },
    { id: 'suffix', label: 'Suffix', description: 'Find the earliest suffix after the middle.' },
    { id: 'record', label: 'Record', description: 'Keep the shortest span found.' },
    { id: 'done', label: 'Result', description: 'Report the shortest length.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with s and p (p has exactly two *)',
  url: 'https://leetcode.com/problems/shortest-matching-substring/',
  complexity: 'O(n * n) time in this scan. The visualization caps s at 20 characters.',
  examples: [
    { label: 'Example', input: '{"s":"abcbc","p":"a*bc*"}' },
    { label: 'No match', input: '{"s":"xyz","p":"a*b*c"}' },
  ],
}

export default function ShortestMatchingSubstring() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="s" length={run.input.s.length} valueAt={i => run.input.s[i]} active={step.start}
      roleAt={i => (step.middle >= 0 && i === step.middle ? 'middle' : step.start >= 0 && i >= step.start && i < step.end ? 'span' : '')} />
    <output aria-label="Pattern parts">{`Pattern p = ${run.input.p}, best: ${step.best ?? 'none'}`}</output>
  </>} renderReasoning={() => <>
    <p>The pattern is a prefix, a middle and a suffix separated by two stars, so each part can be placed greedily.</p>
    <p>For a fixed start, taking the earliest middle and then the earliest suffix gives the shortest possible end.</p>
  </>} />
}
