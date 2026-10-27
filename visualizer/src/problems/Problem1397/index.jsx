import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Build the KMP failure table for evil.' },
    { id: 'position', label: 'Position', description: 'Extend every live state by one letter.' },
    { id: 'done', label: 'Complete', description: 'Sum the counts of all live states.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object: n (1-4), s1, s2 (length n, lowercase), evil (1-3 letters)',
  url: 'https://leetcode.com/problems/find-all-good-strings/',
  complexity: 'O(n * m * 26) time with m the length of evil. The visualization caps n at 4.',
  examples: [
    { label: 'Example', input: '{"n":2,"s1":"aa","s2":"da","evil":"b"}' },
    { label: 'Zero', input: '{"n":2,"s1":"ab","s2":"ab","evil":"a"}' },
  ],
}

export default function FindAllGoodStrings() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <output aria-label="States">{`Position ${step.position === null ? 0 : step.position + 1} of ${run.input.n}: ${step.states} live states`}</output>
    <output aria-label="Total">{step.total === null ? `Evil: ${run.input.evil}` : `Good strings: ${step.total}`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Each state remembers how much of evil is matched, which the KMP table updates in constant time per letter, and whether the prefix still equals a bound, so letters can be limited to the allowed range.</p>
  </>} />
}
