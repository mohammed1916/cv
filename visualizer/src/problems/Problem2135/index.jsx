import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import RecordStateTable from '../../components/shared/RecordStateTable'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2135',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON object with startWords and targetWords',
  url: 'https://leetcode.com/problems/count-words-obtained-after-adding-a-letter/',
  complexity: 'O(total length) time with a set of start masks; O(number of start words) space.',
  question: "Count the target words that can be made from some start word by adding one new letter and rearranging the letters.",
  approaches: [
    { name: "Letter bitmask and set lookup", intuition: "Store each word as a 26-bit letter mask; a target matches when removing one of its letters gives a start mask.", time: "O(n * 26 + m * 26)", space: "O(n)" },
  ],
  examples: [
    { label: 'Two obtained', input: '{"startWords":["abc","de"],"targetWords":["abcd","dea","xyz","be"]}' },
    { label: 'Nothing matches', input: '{"startWords":["ab","cd"],"targetWords":["abe","xyz"]}' },
    { label: 'Single word each', input: '{"startWords":["a"],"targetWords":["ab"]}' },
    { label: 'Anagram starts give one target', input: '{"startWords":["ab","ba"],"targetWords":["abc","abd"]}' },
    { label: 'Alphabet-long words', input: '{"startWords":["abcdefghijklmnopqrstuvwxy"],"targetWords":["abcdefghijklmnopqrstuvwxyz"]}' },
    { label: 'Same length, nothing added', input: '{"startWords":["ab"],"targetWords":["ab"]}' },
    { label: 'Long run: 12 start words', input: '{"startWords":["gvcz","lcd","lct","j","sh","sdi","rco","rujs","xquc","rz","ykrb","p"],"targetWords":["vrqa","mx","tdf","wbqiz","g","dgfj","drjwq","w","z","d","yxh","av"]}' },
  ],
}

export default function Problem2135Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ step }) => (
        <>
          <RecordStateTable label="Target words: letter removed and outcome" columns={['target', 'removing', 'result']} rows={step.rows} activeRow={step.current} />
          <p>Obtained so far: {step.count}</p>
        </>
      )}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
