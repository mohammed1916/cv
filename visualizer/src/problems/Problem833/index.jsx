import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Order', description: 'Sort operations by index, largest first.' },
    { id: 'skip', label: 'Skip', description: 'The source does not match at its index.' },
    { id: 'replace', label: 'Replace', description: 'The source matches, so swap in the target.' },
    { id: 'done', label: 'Complete', description: 'Return the edited string.' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'Object with s, indices, sources, targets (JSON)',
  url: 'https://leetcode.com/problems/find-and-replace-in-string/',
  complexity: 'O(k log k + k * L) time for k operations and string length L; O(L) space.',
  examples: [
    { label: 'Both match', input: '{"s":"abcd","indices":[0,2],"sources":["a","cd"],"targets":["eee","ffff"]}' },
    { label: 'One mismatch', input: '{"s":"abcd","indices":[0,2],"sources":["ab","ec"],"targets":["eee","ffff"]}' },
    { label: 'Unordered', input: '{"s":"vmokgggqzp","indices":[3,5,1],"sources":["kg","ggq","mo"],"targets":["s","so","bfr"]}' },
    { label: 'Single replacement', input: '{"s":"a","indices":[0],"sources":["a"],"targets":["b"]}' },
    { label: 'Equal length replacements side by side', input: '{"s":"abc","indices":[0,1],"sources":["a","b"],"targets":["x","y"]}' },
    { label: 'Fifteen replacements in 60 letters', input: '{"s":"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa","indices":[0,4,8,12,16,20,24,28,32,36,40,44,48,52,56],"sources":["a","a","a","a","a","a","a","a","a","a","a","a","a","a","a"],"targets":["bb","bb","bb","bb","bb","bb","bb","bb","bb","bb","bb","bb","bb","bb","bb"]}' },
    { label: 'Long run: 15 replacements', input: '{"s":"aaaaacccacaabcacbcbbcbbbaabcacabaaacbcacbabababacbbcbbcbcaab","indices":[0,4,8,12,16,20,24,28,32,36,40,44,48,52,56],"sources":["a","a","a","b","b","c","a","a","a","b","b","b","c","b","c"],"targets":["xy","xy","xy","xy","xy","xy","xy","xy","xy","xy","xy","xy","xy","xy","xy"]}' },
  ],
}
export default function FindAndReplaceInString() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const op = step.op && step.op.source ? step.op : null
    return <>
      <IndexedSequence label="Original string" length={run.input.s.length} valueAt={i => run.input.s[i]}
        roleAt={i => run.ops.some(o => i >= o.index && i < o.index + o.source.length) ? 'source range' : ''} />
      <IndexedSequence label="Current string" length={step.cur.length} active={op ? op.index : -1} valueAt={i => step.cur[i]}
        roleAt={i => op && step.phase === 'replace' && i >= op.index && i < op.index + op.target.length ? 'replaced' : ''} />
      <IndexedSequence label="Operations (right to left)" length={run.ops.length} active={op ? run.ops.findIndex(o => o.id === op.id) : -1}
        valueAt={i => `${run.ops[i].index}: ${run.ops[i].source} -> ${run.ops[i].target}`} />
    </>
  }} renderReasoning={() => <>
    <p>Every operation is checked against the original positions. Going right to left means a replacement changes only text after all remaining indices, so the remaining indices stay valid even when targets are longer or shorter.</p>
    <p>The non-overlap guarantee makes the operations independent: a match test on the current string equals the test on the original.</p>
  </>} />
}
