import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { code, python, pythonLineMap, phases, parseInput, buildTrace } from './algorithm'

const definition = {
  number: '1170',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  inputLabel: 'JSON {"queries": [strings], "words": [strings]}',
  url: 'https://leetcode.com/problems/compare-strings-by-frequency-of-the-smallest-character/description/',
  complexity: 'O(L (Q + W)) time for Q queries, W words and string length L, plus the space for the word scores. The visualization caps each list at 20 strings.',
  examples: [
    { label: 'Sample', input: '{"queries":["cbd","zzz","aaaa"],"words":["cc","ab","bbb","abcd"]}' },
    { label: 'Ties', input: '{"queries":["ab"],"words":["bb","ax","c"]}' },
    { label: 'Large query', input: '{"queries":["zzzz","a"],"words":["ccc","bb","aa"]}' },
    { label: 'Single letter lists', input: '{"queries":["a"],"words":["a"]}' },
    { label: 'No matching word', input: '{"queries":["zz"],"words":["ab"]}' },
    { label: 'Largest list sizes', input: '{"queries":["yxmqcvrrnd","riypunvkbn","rynpxmqeem","ffztinhesr","asvsedziso","zbbjilhzec","hbtzszzgli","elqbxzharl","zdpxazhzxc","trcumenzkq","hitpbqxkaz","obkjxustaz","mbxhttpzdf","tidyxilvvz","msmrpzshmz","jwnmijwxdd","mxahsslvyx","lgxvtgyjvv","msjruogsni","yblxohmpwr"],"words":["yywdunsx","lszzxyt","qoxb","xhfyf","fvw","yt","u","pdjx","aq","vkndim","ycn","iiasbq","nala","qcuewz","lpbxqy","lvldgdj","qf","cubvxwq","k","p"]}' },
    { label: 'Long run: 20 short strings', input: '{"queries":["dca","b","abca","dca","c","ba","daaa","aa","ca","a","c","c","c","dab","cbd","b","a","cd","cd","dc"],"words":["bcb","c","b","dad","dca","d","dad","cc","c","caa","b","aca","bb","a","aab","dcd","cbd","daa","bac","dc"]}' },
  ],
}

export default function CompareStringsByFrequencyVisualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => {
        const snap = step.snapshot
        const counted = new Set(snap.counted)
        return <>
          <IndexedSequence
            label="Word scores"
            length={snap.wordScores.length}
            active={snap.wordIndex}
            valueAt={index => `${run.input.words[index]} : ${snap.wordScores[index]}`}
            roleAt={index => counted.has(index) ? 'counted' : ''}
          />
          <p>{snap.queryIndex >= 0 ? `Query ${run.input.queries[snap.queryIndex]} has target ${snap.target}.` : 'No query yet.'}</p>
        </>
      }}
      renderReasoning={({ step }) => <p>Answers so far: {step.snapshot.answers.length ? step.snapshot.answers.join(', ') : 'none yet'}</p>}
    />
  )
}
