import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { code, python, parseInput, buildTrace } from './algorithm'

const definition = {
  phases: [
    { id: 'init', label: 'Setup', description: 'Read the array length and start with no match.' },
    { id: 'scan', label: 'Scan', description: 'Visit each position of the circular array.' },
    { id: 'check', label: 'Check', description: 'Test for the target and measure both directions.' },
    { id: 'update', label: 'Update', description: 'Keep the shorter distance.' },
    { id: 'done', label: 'Result', description: 'Return the shortest distance or -1.' },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Words object (JSON, e.g. {"words": ["a", "b"], "target": "a", "startIndex": 0})',
  url: 'https://leetcode.com/problems/shortest-distance-to-target-string-in-a-circular-array/',
  complexity: 'O(n) time and O(1) extra space for n words. The visualization caps the array at 100 words.',
  examples: [
    { label: 'Wraps the other way', input: '{"words": ["p","q","r","s","t","u","v","w"], "target": "p", "startIndex": 7}' },
    { label: 'Halfway round', input: '{"words": ["one","two","three","four","five","six"], "target": "four", "startIndex": 0}' },
    { label: 'Not present', input: '{"words": ["cat","dog","cat","bird"], "target": "fish", "startIndex": 2}' },
    { label: 'Single word', input: '{"words":["hello"],"target":"hello","startIndex":0}' },
    { label: 'Repeated target', input: '{"words":["a","b","a","b"],"target":"b","startIndex":0}' },
    { label: 'Target at the far end', input: '{"words":["x","y","x","z"],"target":"x","startIndex":3}' },
    { label: 'Long run: 100 words', input: '{"words":["aaa","dca","aca","aac","bcc","aba","abb","abc","acc","ddb","dca","abd","acc","cca","ccb","bab","caa","baa","bcb","cba","bba","add","dba","cbc","acc","bad","cad","daa","dbb","bdc","dab","ddd","acd","acd","bbc","bca","bda","add","bca","dac","bdd","cdb","dca","abd","adb","dac","daa","acb","dbd","cad","dcc","bdd","aad","aac","ccc","aba","ccb","cdc","bbd","bca","zzz","ddc","adc","ddd","aab","aab","adb","cbc","ddd","bcb","acd","bbc","ddc","bca","cca","bbd","ddb","bbd","bad","dba","aca","cdc","ccc","bdb","dca","acc","ddd","ddb","caa","bbb","bdc","aad","cca","acc","ccb","ddd","bcb","bdd","cdb","caa"],"target":"zzz","startIndex":99}' },
  ],
}

export default function ShortestDistanceCircularArray() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => (
        <>
          <IndexedSequence
            label="Circular words"
            length={run.input.words.length}
            active={step.index ?? -1}
            valueAt={(i) => run.input.words[i]}
            roleAt={(i) => (run.input.words[i] === run.input.target ? 'target' : i === run.input.startIndex ? 'start' : '')}
          />
          <output aria-label="Best distance so far">Best: {step.best}</output>
        </>
      )}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
