import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with both encodings at their first characters.' },
    { id: 'visit', label: 'Visit', description: 'Pop a state of positions and pending difference.' },
    { id: 'wild1', label: 's1 number', description: 'A number in s1 adds unknown characters to the pending difference.' },
    { id: 'wild2', label: 's2 number', description: 'A number in s2 subtracts unknown characters from the pending difference.' },
    { id: 'cover2', label: 'Cover s1', description: 'A letter in s2 pays off one pending wildcard of s1.' },
    { id: 'cover1', label: 'Cover s2', description: 'A letter in s1 pays off one pending wildcard of s2.' },
    { id: 'match', label: 'Match', description: 'Equal letters line up with no pending difference.' },
    { id: 'skip', label: 'Skip', description: 'This state was already explored.' },
    { id: 'found', label: 'Found', description: 'Both encodings are used up with no difference left.' },
    { id: 'done', label: 'Result', description: 'Report whether one original string fits both.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with s1 and s2 (encoded strings)',
  url: 'https://leetcode.com/problems/check-if-an-original-string-exists-given-two-encoded-strings/',
  complexity: 'The search keeps each (position in s1, position in s2, difference) state once. The visualization caps each string at 40 characters.',
  examples: [
    { label: 'Fits', input: '{"s1":"a5b","s2":"c5b"}' },
    { label: 'Does not fit', input: '{"s1":"abc","s2":"dffe"}' },
    { label: 'Numbers align', input: '{"s1":"2a2","s2":"5"}' },
  ],
}

export default function CheckOriginalString() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="s1" length={run.input.s1.length} valueAt={i => run.input.s1[i]} active={step.i ?? -1}
      roleAt={i => (i === step.i ? 'window' : '')} />
    <IndexedSequence label="s2" length={run.input.s2.length} valueAt={i => run.input.s2[i]} active={step.j ?? -1}
      roleAt={i => (i === step.j ? 'window' : '')} />
    <output aria-label="Pending difference">{`pending difference d = ${step.d ?? 0}`}</output>
  </>} renderReasoning={() => <>
    <p>Each digit run means that many unknown characters. A positive pending difference is wildcards in s1 that s2 must still cover, and a negative one is the reverse.</p>
    <p>Visited (position, position, difference) states are remembered, so the search never repeats one.</p>
  </>} />
}
