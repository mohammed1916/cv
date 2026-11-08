import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start run', description: 'Begin the first run of equal letters.' },
    { id: 'short', label: 'Short run', description: 'Runs of one or two letters are ignored.' },
    { id: 'group', label: 'Large group', description: 'Runs of three or more are reported.' },
    { id: 'done', label: 'Complete', description: 'Return every large group.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 's (JSON string of lowercase letters)',
  url: 'https://leetcode.com/problems/positions-of-large-groups/',
  complexity: 'O(n) time and O(1) extra space besides the output.',
  examples: [
    { label: 'Two groups', input: '"aaabbbbcc"' },
    { label: 'Edge run', input: '"xyzzzzw"' },
    { label: 'None', input: '"abcdef"' },
    { label: 'Single letter', input: '"a"' },
    { label: 'Equal groups of two', input: '"aabb"' },
    { label: 'Longest allowed (1000 letters)', input: '"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"' },
    { label: 'Long run: 1000 letters in runs', input: '"cfccccaaaaahhhaaccccccdeeeeegggggddhhhhhhhffffdddccffffaaaabbbbbdddddfffbbbeebbbeeghhhhhddddbbbbbdddghhhhhbbbbbhhhheeefffffcccceeeeggggdccbbbbbhhaahhhccccdeeeggggfhhhhehhhhheeeegggbffaaaadddaaaaaaaaacccdbbbbbfffbbbbbccccccddddbeedddfffffbbbbbddddbbbfffcgggggggggffffffgggggfffffgggebbbbbdddddffffafffffffeedddccchhhhaaaaaccchhhbbddecchhheeeeccccccccccaaahhhccccchhcccccbhhhhgggggdddddhhfahhgggggaaaabbbhcceeeeeegggggceeeddddeeeaaaaafbggddddccdcccggaaaaeeebbbbbbhhhhggggggeehbbbddbggghhhhehffehhhaaaaaaagabaccccgeeeeeddbbbbcaaabbbbbfffffggggghhhhgggaeeeeegbbbbbdeeeecfffbeeffffhhhbffeeffffffggggghhhfeeeeeadfffffcccbddddeeeehhehhhggeegggaaaaabbbgggggbbbdcggaaaaagggeeeaaaacccccffffffffffffffffggggggggddaffffffcghhehhaaaaabbcccccahhhcccccccaaaaaccccggggghhfffdfbbfffdddddddeeeefffffccccaaeecccccccaaaaggggggggggccchhhhhhhhaaaaddddehhffbbbbeegggggdeehhhhhggggbbhhbhhhgggggcccgggggggbbccchhbbbbbbbfffffbbbbaaaaaggggggbbbbbddddbbbbaaaggggffaaaaaffffffffffeeeeeccceeeeeeeehhbbbdddddbbcccffffbbbbeehhhehggg"' },
  ],
}

export default function LargeGroups() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="s (current run and large groups marked)" length={run.input.length} active={step.i < run.input.length ? step.i : -1}
      valueAt={i => run.input[i]}
      roleAt={i => (i === step.start && step.phase !== 'done' ? 'l' : i === step.i - 1 && step.phase !== 'done' ? 'r' : step.runs.some(([a, b]) => i >= a && i <= b) ? 'group' : '')} />
    <output aria-label="Groups">{`Groups so far: ${step.runs.map(([a, b]) => `[${a}, ${b}]`).join(' ') || 'none'}`}</output>
    <p role="status">{step.message}</p>
  </>} renderReasoning={() => <>
    <p>A group is a maximal run of one letter. The scan closes a run when the letter changes, so each run's length is known exactly when it ends.</p>
  </>} />
}
