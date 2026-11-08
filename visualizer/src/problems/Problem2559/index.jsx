import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin the prefix counts at zero.' },
    { id: 'prefix', label: 'Prefix counts', description: 'Add one for each word that starts and ends with a vowel.' },
    { id: 'query', label: 'Queries', description: 'Answer each range with one subtraction.' },
    { id: 'done', label: 'Complete', description: 'Every query is answered.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with words and queries ([l, r] pairs)',
  url: 'https://leetcode.com/problems/count-vowel-strings-in-ranges/',
  complexity: 'O(total length + q) time with prefix counts. The visualization caps words at 12 and queries at 8.',
  examples: [
    { label: 'Six words, three ranges', input: '{"words":["sun","moon","star","sea","tide","dune"],"queries":[[0,2],[3,5],[2,4]]}' },
    { label: 'Two words, two queries', input: '{"words":["oak","pine"],"queries":[[0,1],[1,1]]}' },
    { label: 'Single word', input: '{"words":["a"],"queries":[[0,0]]}' },
    { label: 'Equal words', input: '{"words":["aa","aa","aa"],"queries":[[0,2],[1,1]]}' },
    { label: 'Twelve longest words', input: '{"words":["abcdefghij","abcdefghij","abcdefghij","abcdefghij","abcdefghij","abcdefghij","abcdefghij","abcdefghij","abcdefghij","abcdefghij","abcdefghij","abcdefghij"],"queries":[[0,11],[11,11]]}' },
    { label: 'Long run: twelve words, eight queries', input: '{"words":["qvxuutzesb","gcdibwehx","aculxmg","a","quoornjf","xswfrvqat","yiskguo","wohtpaf","mlgghjay","tyoai","f","krngj"],"queries":[[6,11],[2,2],[9,11],[11,11],[4,11],[6,7],[7,7],[7,8]]}' },
  ],
}

export default function VowelStrings() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { words } = run.input
    const [l, r] = step.query || [-1, -1]
    return <>
      <IndexedSequence label="words" length={words.length} valueAt={i => words[i]} active={step.index >= 0 ? step.index : l}
        roleAt={i => (step.query && i >= l && i <= r ? 'in range' : '')} />
      <output aria-label="Answers so far">{`Answers: ${step.answers.join(', ') || '(none yet)'}`}</output>
    </>
  }} renderReasoning={() => <>
    <p>A word counts when its first and last letters are both vowels. Prefix counts turn each range into the difference of two stored totals.</p>
    <p>Each range answer is prefix[r + 1] minus prefix[l], so the words are scanned only once.</p>
  </>} />
}
