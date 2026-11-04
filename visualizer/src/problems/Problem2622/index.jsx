import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'
import CacheView from './CacheView'

const definition = {
  number: '2622',
  phases: [
    { id: 'op', label: 'Operation', description: 'Take the next operation in time order.' },
    { id: 'set', label: 'Set', description: 'Check liveness, then store with a new expiry.' },
    { id: 'get', label: 'Get', description: 'Return a live value or -1.' },
    { id: 'count', label: 'Count', description: 'Count live keys.' },
    { id: 'done', label: 'Result', description: 'All answers.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with ops: [time, "set", key, value, duration], [time, "get", key] or [time, "count"]',
  url: 'https://leetcode.com/problems/cache-with-time-limit/',
  complexity: 'O(1) per get and set, O(n) for a count over n stored keys.',
  examples: [
    { label: 'Overwrite', input: '{"ops":[[0,"set","a",1,100],[40,"set","a",5,100],[60,"get","a"],[100,"get","a"],[100,"count"]]}' },
    { label: 'Expiry', input: '{"ops":[[0,"set","k",1,10],[10,"get","k"],[10,"count"]]}' },
  ],
}

export default function CacheWithTimeLimit() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ step }) => <CacheView view={step.view} />}
    renderReasoning={() => <>
      <p>Each key stores its value with an expiry time. A key is alive while the current time is before that expiry.</p>
      <p>Get and count both check liveness first, so expired entries never leak into an answer.</p>
    </>} />
}
