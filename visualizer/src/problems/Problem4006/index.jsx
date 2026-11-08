import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import PrefixBalanceView from './PrefixBalanceView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: "start", label: "Start", description: "No prefix counted yet." },
    { id: "add", label: "Add bit", description: "Extend the prefix by one character." },
    { id: "count", label: "Counts", description: "The prefix balances, so it counts." },
    { id: "skip", label: "Too far", description: "The prefix is off by more than one." },
    { id: "done", label: "Result", description: "Report the count." },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: "Object with a binary string s, e.g. {\"s\":\"1011000\"}",
  url: "https://leetcode.com/problems/count-valid-prefixes/",
  complexity: "O(n) time and O(1) extra space.",
  examples: [
    { label: "Mixed string", input: "{\"s\":\"1011000\"}" },
    { label: "Three ones", input: "{\"s\":\"111000\"}" },
    { label: "Single zero", input: "{\"s\":\"0\"}" },
    { label: "Single one", input: '{"s":"1"}' },
    { label: "All equal bits", input: '{"s":"0000"}' },
    { label: "Longest allowed string", input: '{"s":"1010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010"}' },
    { label: "Long run: 100 bits", input: '{"s":"1111010101001111001000010011100001100001110001011111111110110101100010101111101111000011101000011011"}' },
  ],
}

export default function Problem4006() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <PrefixBalanceView run={run} step={step} />} renderReasoning={({ step }) => <p>{step ? step.message : 'Press Play to start the trace.'}</p>} />
}
