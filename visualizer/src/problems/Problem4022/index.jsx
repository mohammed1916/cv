import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import DigitBlockView from './DigitBlockView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: "start", label: "Start", description: "Read the position." },
    { id: "short", label: "First block", description: "Block 0 holds the digits 1 to 9." },
    { id: "skip", label: "Skip group", description: "Skip all numbers with this digit count." },
    { id: "group", label: "Group", description: "The position lies in this group." },
    { id: "block", label: "Block", description: "Locate the tens block." },
    { id: "number", label: "Number", description: "Locate the number inside the block." },
    { id: "done", label: "Result", description: "Report the digit." },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: "Object with k, the one-based position, e.g. {\"k\":15}",
  url: "https://leetcode.com/problems/k-th-digit-in-infinite-string/",
  complexity: "O(log k) time and O(1) extra space.",
  examples: [
    { label: "Inside block one", input: "{\"k\":15}" },
    { label: "Early block", input: "{\"k\":1000}" },
    { label: "Larger position", input: "{\"k\":123456}" },
    { label: "First position", input: "{\"k\":1}" },
    { label: "Two-digit start", input: "{\"k\":10}" },
    { label: "Largest position", input: "{\"k\":1000000000000000}" },
    { label: "Long run: 15-digit position", input: "{\"k\":734517298645103}" },
  ],
}

export default function Problem4022() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <DigitBlockView run={run} step={step} />} renderReasoning={({ step }) => <p>{step ? step.message : 'Press Play to start the trace.'}</p>} />
}
