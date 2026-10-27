import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start index', description: 'Choose where the match could begin.' },
    { id: 'prefix', label: 'Prefix', description: 'The prefix does not start here.' },
    { id: 'suffix', label: 'Suffix', description: 'Look for the suffix after the prefix.' },
    { id: 'found', label: 'Found', description: 'The suffix follows the prefix.' },
    { id: 'done', label: 'Result', description: 'Report whether a match exists.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with s and p = prefix*suffix (lowercase, one star)',
  url: 'https://leetcode.com/problems/substring-matching-pattern/',
  complexity: 'O(n * m) time with direct string search. The visualization caps s at 20 characters.',
  examples: [
    { label: 'Example', input: '{"s":"leetcode","p":"ee*e"}' },
    { label: 'No match', input: '{"s":"xzz","p":"x*y"}' },
  ],
}

export default function SubstringMatchingPattern() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="s" length={run.input.s.length} valueAt={i => run.input.s[i]} active={step.start >= 0 ? step.start : step.at}
      roleAt={i => (step.at >= 0 && i === step.at ? 'suffix' : '')} />
    <output aria-label="Pattern">{`p = ${run.input.p}${step.start >= 0 ? `, prefix tried at ${step.start}` : ''}`}</output>
  </>} renderReasoning={() => <>
    <p>The star matches any run of characters, so only the earliest possible prefix position matters.</p>
    <p>Once the prefix starts at some index, any later suffix occurrence completes a match.</p>
  </>} />
}
