import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import FencePairView from './FencePairView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: "start", label: "Start", description: "Count the originals and list candidates." },
    { id: "candidate", label: "Candidate", description: "Count singles and pairs for one height." },
    { id: "done", label: "Result", description: "Report the best height." },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: "Object with heights, e.g. {\"heights\":[4,1,3,3,2]}",
  url: "https://leetcode.com/problems/widest-possible-fence/",
  complexity: "O(c * n) time for c candidate heights and n originals; the visualization caps n at 8.",
  examples: [
    { label: "Mixed heights", input: "{\"heights\":[4,1,3,3,2]}" },
    { label: "Equal heights", input: "{\"heights\":[2,2,2,2]}" },
    { label: "Paired heights", input: "{\"heights\":[1,1,2,2]}" },
    { label: "Single height", input: '{"heights":[9]}' },
    { label: "Equal maximum heights", input: '{"heights":[1000,1000,1000,1000,1000,1000,1000,1000]}' },
    { label: "Alternating extremes", input: '{"heights":[1000,1,1000,1,1000,1,1000,1]}' },
    { label: "Long run: 8 heights", input: '{"heights":[789,729,446,993,915,700,510,665]}' },
  ],
}

export default function Problem4007() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <FencePairView run={run} step={step} />} renderReasoning={({ step }) => <p>{step ? step.message : 'Press Play to start the trace.'}</p>} />
}
