import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import SequenceParityView from './SequenceParityView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: "total", label: "All splits", description: "Count every ordered split." },
    { id: "parity", label: "Parity", description: "Check whether all-odd splits can exist." },
    { id: "odd", label: "All odd", description: "Count the all-odd splits." },
    { id: "done", label: "Result", description: "Subtract and reduce modulo 1000000007." },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: "Object with n and k, e.g. {\"n\":6,\"k\":3}",
  url: "https://leetcode.com/problems/count-valid-sequences/",
  complexity: "O(k log MOD) time for the binomial coefficients and O(1) extra space. The visualization caps n at 30.",
  examples: [
    { label: "Two parts", input: "{\"n\":4,\"k\":2}" },
    { label: "Three parts", input: "{\"n\":6,\"k\":3}" },
    { label: "All ones", input: "{\"n\":5,\"k\":5}" },
    { label: "One part", input: '{"n":1,"k":1}' },
    { label: "Equal split tie", input: '{"n":6,"k":2}' },
    { label: "Largest n with n parts", input: '{"n":30,"k":30}' },
    { label: "Long run: 30 into 7", input: '{"n":30,"k":7}' },
  ],
}

export default function Problem4002() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <SequenceParityView run={run} step={step} />} renderReasoning={({ step }) => <p>{step ? step.message : 'Press Play to start the trace.'}</p>} />
}
