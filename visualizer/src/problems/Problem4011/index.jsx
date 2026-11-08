import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import ParityRatioView from './ParityRatioView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: "start", label: "Start", description: "Set the ratio limit." },
    { id: "left", label: "Left end", description: "Start subarrays at this index." },
    { id: "count", label: "Counts", description: "The subarray qualifies." },
    { id: "skip", label: "Skipped", description: "The subarray fails the test." },
    { id: "done", label: "Result", description: "Report the total." },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: "Object with nums, a and b, e.g. {\"nums\":[1,2,3,4],\"a\":1,\"b\":1}",
  url: "https://leetcode.com/problems/count-subarrays-with-even-odd-ratio-i/",
  complexity: "O(n^2) time and O(1) extra space.",
  examples: [
    { label: "Small ratio", input: "{\"nums\":[1,2,3,4],\"a\":1,\"b\":1}" },
    { label: "Mixed values", input: "{\"nums\":[2,5,4,7,6],\"a\":2,\"b\":3}" },
    { label: "Single value", input: '{"nums":[5],"a":1,"b":1}' },
    { label: "Equal ratio tie", input: '{"nums":[4,8,12],"a":2,"b":4}' },
    { label: "Largest ratio", input: '{"nums":[1000,1,1000],"a":1000,"b":1}' },
    { label: "Long run: 12 values", input: '{"nums":[791,92,185,141,581,691,234,330,965,8,691,520],"a":37,"b":120}' },
  ],
}

export default function Problem4011() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <ParityRatioView run={run} step={step} />} renderReasoning={({ step }) => <p>{step ? step.message : 'Press Play to start the trace.'}</p>} />
}
