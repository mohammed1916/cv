import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import StrengthSearchView from './StrengthSearchView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: "start", label: "Start", description: "Set the search bounds." },
    { id: "probe", label: "Probe", description: "Test one starting strength." },
    { id: "monster", label: "Monster", description: "Compare current strength with the monster." },
    { id: "fail", label: "Defeated?", description: "This monster cannot be defeated." },
    { id: "narrow", label: "Narrow", description: "Shrink the search interval." },
    { id: "done", label: "Result", description: "Report the least strength." },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: "Object with strengths and boosts ([left, right, value] triples), e.g. {\"strengths\":[4,2,6],\"boosts\":[[0,1,3]]}",
  url: "https://leetcode.com/problems/minimum-initial-strength-to-defeat-all-monsters/",
  complexity: "O(n * m * log S) time for n monsters, m boost ranges and strength sum S. The visualization caps n at 8.",
  examples: [
    { label: "One boosted range", input: "{\"strengths\":[4,2,6],\"boosts\":[[0,1,3]]}" },
    { label: "Large first monster", input: "{\"strengths\":[10,1,1],\"boosts\":[[1,2,2]]}" },
    { label: "Single monster", input: '{"strengths":[5],"boosts":[]}' },
    { label: "Equal strengths", input: '{"strengths":[3,3,3],"boosts":[[0,2,3]]}' },
    { label: "Maximum strengths and boosts", input: '{"strengths":[30,30,30,30,30,30,30,30],"boosts":[[0,7,20],[3,3,20],[7,7,1],[0,0,1],[2,5,20]]}' },
    { label: "Long run: 8 monsters", input: '{"strengths":[24,25,4,1,18,14,29,18],"boosts":[[6,7,17],[6,6,10],[6,6,4],[6,6,18],[6,6,12]]}' },
  ],
}

export default function Problem4008() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <StrengthSearchView run={run} step={step} />} renderReasoning={({ step }) => <p>{step ? step.message : 'Press Play to start the trace.'}</p>} />
}
