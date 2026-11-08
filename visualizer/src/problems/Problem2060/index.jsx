import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import EncodingPointerView from './EncodingPointerView'
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
    { label: 'Fits', input: '{"s1":"a4b","s2":"5b"}' },
    { label: 'Does not fit', input: '{"s1":"abc","s2":"dffe"}' },
    { label: 'Numbers align', input: '{"s1":"3x","s2":"1y2"}' }, { label: "Single characters", input: "{\"s1\":\"a\",\"s2\":\"1\"}" }, { label: "Equal strings", input: "{\"s1\":\"ab3\",\"s2\":\"ab3\"}" }, { label: "Largest number", input: "{\"s1\":\"x999\",\"s2\":\"y999\"}" }, { label: "Long run: 40 characters", input: "{\"s1\":\"a1b22c3d4e5f6g7h8i9j10k11l12m13\",\"s2\":\"z9y8x7w6v5u4t3s2r1q5\"}" },
  ],
}

export default function CheckOriginalString() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <EncodingPointerView s1={run.input.s1} s2={run.input.s2} i={step.i ?? 0} j={step.j ?? 0} d={step.d ?? 0} />
    <output aria-label="Pending difference">{`pending difference d = ${step.d ?? 0}`}</output>
  </>} renderReasoning={() => <>
    <p>Each digit run means that many unknown characters. A positive pending difference is wildcards in s1 that s2 must still cover, and a negative one is the reverse.</p>
    <p>Visited (position, position, difference) states are remembered, so the search never repeats one.</p>
  </>} />
}
