import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Mappings', description: 'Collect the allowed replacements.' },
    { id: 'window', label: 'Window', description: 'Place sub at this start index.' },
    { id: 'match', label: 'Match', description: 'The letters agree directly.' },
    { id: 'replace', label: 'Replace', description: 'A listed replacement covers the letters.' },
    { id: 'fail', label: 'Fail', description: 'This start index cannot work.' },
    { id: 'found', label: 'Found', description: 'Every position of sub fits.' },
    { id: 'done', label: 'Result', description: 'Report whether a match exists.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with s, sub and mappings ([old, new] letter pairs)',
  url: 'https://leetcode.com/problems/match-substring-after-replacement/',
  complexity: 'O(n * m) time with a set of replacements. The visualization caps s at 20 characters.',
  examples: [
    { label: 'Example', input: '{"s":"fooleyzbar","sub":"leet","mappings":[["e","3"],["t","7"],["t","8"]]}' },
    { label: 'No match', input: '{"s":"abcd","sub":"ef","mappings":[["e","b"]]}' },
  ],
}

export default function MatchSubstringAfterReplacement() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="s" length={run.input.s.length} valueAt={i => run.input.s[i]} active={step.at >= 0 ? step.at : step.start}
      roleAt={i => (step.start >= 0 && i >= step.start && i < step.start + run.input.sub.length ? 'window' : '')} />
    <output aria-label="Replacement check">{`sub = ${run.input.sub}, window at ${step.start >= 0 ? step.start : 'none'}, ${step.ok === false ? 'fails' : step.ok ? 'fits' : 'checking'}`}</output>
  </>} renderReasoning={() => <>
    <p>Each start index is tested independently: every letter of sub must equal the letter it covers, or be a listed replacement for it.</p>
    <p>Storing the replacements in a set makes each letter check a constant-time lookup.</p>
  </>} />
}
