import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Ends', description: 'Both pointers start at the last characters.' },
    { id: 'skip', label: 'Backspace', description: 'A # erases the character before it.' },
    { id: 'match', label: 'Compare', description: 'Surviving characters must match.' },
    { id: 'mismatch', label: 'Mismatch', description: 'The typed results differ.' },
    { id: 'done', label: 'Complete', description: 'Return the comparison.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 's and t (JSON object of strings with # for backspace)',
  url: 'https://leetcode.com/problems/backspace-string-compare/',
  complexity: 'O(n + m) time and O(1) extra space.',
  examples: [
    { label: 'Erased', input: '{"s":"ab#zz","t":"ab#czz"}' },
    { label: 'Differs', input: '{"s":"xy##","t":"x#y"}' },
    { label: 'Empty result', input: '{"s":"p##q","t":"#q#"}' },
    { label: 'Single letters match', input: '{"s":"a","t":"a"}' },
    { label: 'Both erase to empty', input: '{"s":"a#","t":"b#"}' },
    { label: 'Longest strings, both empty', input: '{"s":"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa####################################################################################################","t":"b#b#b#b#b#b#b#b#b#b#b#b#b#b#b#b#b#b#b#b#b#b#b#b#b#b#b#b#b#b#b#b#b#b#b#b#b#b#b#b#b#b#b#b#b#b#b#b#b#b#b#b#b#b#b#b#b#b#b#b#b#b#b#b#b#b#b#b#b#b#b#b#b#b#b#b#b#b#b#b#b#b#b#b#b#b#b#b#b#b#b#b#b#b#b#b#b#b#b#b#"}' },
    { label: 'Long run: 200 characters', input: '{"s":"#abb#b#b###aa#ab#b###bbb#ba###babb####a#baababbaaaaab#ab###ba##abaa#bab#babbaa#baaa##aba##baa##bab#bb#b#ab#bb#ab#bbbabbabaab#ab#bb##bbabaa####aa####aa#b##aba###a#aaaa#bbaabbbb#aaaa#b#a#bbaa##b###aaa#b","t":"b#####a#abbaaab##aba#bb#b#ba#baaa#a##b#abbb##babbbbb#abaa##baa#ba##abaaa###aabbba#babbaba#bbbaaaabb#ba#####aaabaaabbab#baa##bbabb#####bbbaababaab#ab#b#a#b##abbbaa#ab#a##b#baa#ab##a#baa#b#bbab#aa##aa##"}' },
  ],
}

function Pointer({ label, text, pointer, name, erased }) {
  return <IndexedSequence label={label} length={text.length} active={pointer}
    valueAt={i => text[i]}
    roleAt={i => (i === pointer ? name : erased?.includes(i) ? 'erased' : '')} />
}

export default function BackspaceCompare() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <Pointer label="s (pointer i)" text={run.input.s} pointer={step.i} name="i" erased={step.erased?.s} />
    <Pointer label="t (pointer j)" text={run.input.t} pointer={step.j} name="j" erased={step.erased?.t} />
    <output aria-label="Step">{step.message}</output>
  </>} renderReasoning={() => <>
    <p>Two pointers walk from the ends. A # adds one pending erase, and each pending erase skips one earlier character, so no string is rebuilt.</p>
    <p>Only the survivors are compared, one pair at a time.</p>
  </>} />
}
