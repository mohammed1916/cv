import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Tokenize', description: 'Lowercase the text and extract letter-only words.' },
    { id: 'skip', label: 'Skip banned', description: 'Ignore words in the banned set.' },
    { id: 'count', label: 'Count word', description: 'Increment the word frequency.' },
    { id: 'done', label: 'Complete', description: 'Return the word with the highest count.' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'Object with paragraph and banned (JSON)',
  url: 'https://leetcode.com/problems/most-common-word/',
  complexity: 'O(n + b) time for n characters and b banned words; O(n) space for the counts.',
  examples: [
    { label: 'Ball example', input: '{"paragraph": "Bob hit a ball, the hit BALL flew far after it was hit.", "banned": ["hit"]}' },
    { label: 'Single word', input: '{"paragraph": "a.", "banned": []}' },
    { label: 'Punctuation', input: '{"paragraph": "Bob. hIt, baLl", "banned": ["bob", "hit"]}' },
    { label: 'Single word, no bans', input: '{"paragraph":"a","banned":[]}' },
    { label: 'Equal counts keep the first', input: '{"paragraph":"red blue red blue","banned":[]}' },
    { label: 'Twenty banned words', input: '{"paragraph":"ba bb bc bd be bf bg bh bi bj bk bl bm bn bo bp bq br bs bt zebra zebra.","banned":["ba","bb","bc","bd","be","bf","bg","bh","bi","bj","bk","bl","bm","bn","bo","bp","bq","br","bs","bt"]}' },
    { label: 'Long run: 40 words with bans', input: '{"paragraph":"tea sun sky red sun sky cat cat blue red sky sky red cat dog tea tea blue sky sky blue cat dog cat sky cat cat tea red cat tea sun dog red cat sky blue blue blue cat, the end.","banned":["cat","sun","tea"]}' },
  ],
}
export default function MostCommonWord() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Words in the paragraph" length={run.words.length} active={step.index} valueAt={i => run.words[i]}
      roleAt={i => run.input.banned.includes(run.words[i]) ? 'banned' : ''} />
    <IndexedSequence label="Counts so far" length={step.counts.length} valueAt={i => `${step.counts[i][0]}: ${step.counts[i][1]}`}
      active={step.counts.findIndex(([w]) => w === step.word)} roleAt={i => step.counts[i][0] === step.bestWord ? 'best' : ''} />
    <output aria-label="Most common word">{step.phase === 'done' ? 'Answer' : 'Leader'}: {step.bestWord ?? 'none yet'}</output>
  </>} renderReasoning={({ step }) => <>
    <p>Punctuation and case are ignored: only runs of letters count as words, all lowercased.</p>
    <p>Banned words never enter the table, so they can never win even if they are frequent.</p>
    {step.word && <p>Current word: "{step.word}".</p>}
  </>} />
}
