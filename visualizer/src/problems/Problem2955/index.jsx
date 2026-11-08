import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import RangeLetterView from './RangeLetterView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Prefix', description: 'Build running letter counts.' },
    { id: 'query', label: 'Query', description: 'Take the next inclusive range.' },
    { id: 'letter', label: 'Letter', description: 'Count one letter inside the range.' },
    { id: 'answer', label: 'Answer', description: 'Store the answer for this range.' },
    { id: 'done', label: 'Result', description: 'Report every answer.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with s and queries (zero-based inclusive [l, r]), e.g. {"s":"abcabca","queries":[[0,6],[1,3],[2,2]]}',
  url: 'https://leetcode.com/problems/number-of-same-end-substrings/',
  complexity: 'O(26 n + 26 q) time with prefix counts, where q is the number of queries; the visualization caps s at 30 letters and the queries at 6. Ranges are zero-based inclusive in this visualization.',
  examples: [
    { label: 'Three ranges', input: '{"s":"abcabca","queries":[[0,6],[1,3],[2,2]]}' },
    { label: 'Repeated letters', input: '{"s":"zzyz","queries":[[0,3],[1,2]]}' },
    { label: 'One letter', input: '{"s":"a","queries":[[0,0]]}' },
    { label: 'Same letter at both ends', input: '{"s":"aaaa","queries":[[0,3]]}' },
    { label: 'Whole word at max length', input: '{"s":"abcdefghijklmnopqrstuvwxyzabcd","queries":[[0,29],[0,0]]}' },
    { label: 'Long run: 30 letters', input: '{"s":"tcsytmscghnjwndckbmgejygfdjbbx","queries":[[5,23],[4,12],[6,13],[11,29],[1,19],[11,12]]}' },
  ],
}

export default function NumberOfSameEndSubstrings() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ run, step }) => <RangeLetterView run={run} step={step} />}
    renderReasoning={({ step }) => <>
      <p>{step.message}</p>
      <p>Prefix counts make each letter count in a range a subtraction, so every query only checks the letters that exist.</p>
    </>} />
}
