import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { parseInput, buildTrace, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'The end pointer starts after the last character.' },
    { id: 'scan', label: 'Scan', description: 'Look at the character just before the end pointer.' },
    { id: 'drop', label: 'Drop', description: 'A trailing zero moves the end pointer left.' },
    { id: 'done', label: 'Result', description: 'Keep the characters before the end pointer.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with num (a string of digits, at most 20 characters)',
  url: 'https://leetcode.com/problems/remove-trailing-zeros-from-a-string/',
  complexity: 'O(n) time. The end pointer only moves left, and the string is never rebuilt until the end.',
  examples: [
    { label: 'Trailing zeros', input: '{"num":"5020700"}' },
    { label: 'Zeros in the middle only', input: '{"num":"1009"}' },
    { label: 'Single digit', input: '{"num":"7"}' },
    { label: 'All zeros after first digit', input: '{"num":"1000000"}' },
    { label: 'Equal digits', input: '{"num":"5555"}' },
    { label: 'Long run: 1000 digits', input: '{"num":"1985490149432323032981018589234745214781892387656345052545276781870709470343630327012707050181856903812527296387658585216141652789858145476741216145634543658727610745294727478705232305256121654721632709074589494785816167432547054929658589896949494587250569058765612125678781616365870707816321234587496525898923852743416303616587894707254943010761878343254309814323430329610525878529272729416567654581638963636749036367018909490561654543630709476307896925256301638167214965098785230781230101414907218323016103618561272349052361810147414741090129652303476745858129870761074129858749856345276907872305436321252743676125050327630325038387414707296929618525812707014147454303212163296383436107012345838121294781694329294181692369410165816709890725058729070723212569014583258521698169470789458169492961654787014381436505058785256569050769036343238781852347012927878989270521430901412901812303898549052749810527014969252709816549658507274949254701216367014725292987652543234361018549816329216383652107014725"}' },
  ],
}

export default function RemoveTrailingZeros() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const num = run.input.num
    const end = step.end ?? num.length
    // Characters before the end pointer are kept; the ones at or after it are dropped.
    return <>
      <IndexedSequence label="Digits of num" length={num.length} valueAt={i => num[i]} active={step.index ?? -1}
        roleAt={i => (i >= end ? 'dropped' : i === end - 1 ? 'end (kept)' : 'kept')} />
      <p style={{ color: 'var(--text)' }}>End pointer after index {end - 1}. Result: <code>{step.phase === 'done' ? JSON.stringify(run.result) : 'not yet'}</code></p>
    </>
  }} renderReasoning={({ step }) => <p>{step.message}</p>} />
}
