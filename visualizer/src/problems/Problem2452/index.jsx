import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  number: '2452',
  phases: [
    { id: 'setup', label: 'Setup', description: 'Start with an empty result list.' },
    { id: 'query', label: 'Query', description: 'Take the next query in order.' },
    { id: 'word', label: 'Dictionary', description: 'Pick a dictionary word to compare with.' },
    { id: 'reset', label: 'Reset', description: 'Start the mismatch count.' },
    { id: 'count', label: 'Count', description: 'Count a position where the letters differ.' },
    { id: 'check', label: 'Check', description: 'Decide whether at most two letters differ.' },
    { id: 'record', label: 'Record', description: 'Keep the query and stop checking its other words.' },
    { id: 'done', label: 'Result', description: 'Return the kept queries in their original order.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON {"queries": ["cat","dog"], "dictionary": ["cot","fog"]}',
  url: 'https://leetcode.com/problems/words-within-two-edits-of-dictionary/',
  complexity: 'O(q * d * L) time and O(q) extra space for q queries, d dictionary words and word length L. The visualization caps each list at 8 words of up to 8 letters.',
  examples: [
    { label: 'Example', input: '{"queries":["cat","dog","sun"],"dictionary":["cot","fog","zzz"]}' },
    { label: 'Far', input: '{"queries":["abc"],"dictionary":["xyz"]}' },
    { label: 'Single letter', input: '{"queries":["a"],"dictionary":["b"]}' },
    { label: 'Exact match', input: '{"queries":["abc"],"dictionary":["abc"]}' },
    { label: 'Largest lists', input: '{"queries":["abcdefgh","abcdefgh","abcdefgh","abcdefgh","abcdefgh","abcdefgh","abcdefgh","abcdefgh"],"dictionary":["hgfedcba","hgfedcba","hgfedcba","hgfedcba","hgfedcba","hgfedcba","hgfedcba","hgfedcba"]}' },
    { label: 'Long run: 8 words each', input: '{"queries":["tcgxcuzc","ijbucupk","lxdiahte","arbujlbb","uxyebnsa","xkwqdabm","wrhkzdwl","fslxotaa"],"dictionary":["uvvkmism","jbxnllni","bqnpmopv","cazyicvx","kajpbojc","mhtlkrpg","zgwmoyzc","ygcmsefj"]}' },
  ],
}

export default function WordsWithinTwoEdits() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const query = step.q >= 0 ? run.input.queries[step.q] : ''
    const word = step.w >= 0 ? run.input.dictionary[step.w] : ''
    return <>
      <IndexedSequence label="query" length={run.input.queries[0].length} valueAt={i => query[i] ?? ''} active={step.at}
        roleAt={i => (query && word && query[i] !== word[i] ? 'differs' : '')} />
      <IndexedSequence label="dictionary" length={run.input.dictionary.length} valueAt={i => run.input.dictionary[i]} active={step.w}
        roleAt={i => (step.q >= 0 && i === step.w && step.phase === 'record' ? 'kept' : '')} />
      <output aria-label="Edit count">{`query ${query || '-'}, word ${word || '-'}, differences ${step.diff}`}</output>
      <p role="status">{step.message}</p>
    </>
  }} renderReasoning={() => <>
    <p>A query belongs in the answer when some dictionary word matches it in at most two positions. Words are the same length, so compare position by position.</p>
    <p>As soon as one dictionary word works, the query is kept and the remaining words are skipped.</p>
  </>} />
}
