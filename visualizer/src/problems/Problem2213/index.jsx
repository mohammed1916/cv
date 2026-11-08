import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import RunsView from './RunsView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2213',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON with s, queryCharacters and queryIndices, e.g. {"s":"aabbb","queryCharacters":"ab","queryIndices":[0,2]}',
  url: 'https://leetcode.com/problems/longest-substring-of-one-repeating-character/',
  complexity: 'O(q * n) time in this rescan version, where q is the number of queries. The efficient version uses a segment tree in O(log n) per query. The page caps s at 12 letters and queries at 4.',
  examples: [
    { label: 'Runs grow', input: '{"s":"aabbb","queryCharacters":"ab","queryIndices":[0,2]}' },
    { label: 'Single letter', input: '{"s":"x","queryCharacters":"x","queryIndices":[0]}' },
    { label: 'Split a run', input: '{"s":"aaaaa","queryCharacters":"bb","queryIndices":[2,3]}' },
    { label: 'Longest string, four queries', input: '{"s":"abcdefghijkl","queryCharacters":"mnop","queryIndices":[0,4,8,11]}' },
    { label: 'Same letters repeated', input: '{"s":"aaaa","queryCharacters":"aa","queryIndices":[1,1]}' },
    { label: 'Long run: one letter string', input: '{"s":"zzzzzzzzzzzz","queryCharacters":"yxzw","queryIndices":[0,5,6,11]}' },
  ],
}

export default function Problem2213Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <RunsView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
