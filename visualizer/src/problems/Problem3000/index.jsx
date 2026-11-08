import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'init', label: 'Setup', description: "Start with no best rectangle." },
    { id: 'scan', label: 'Scan', description: "Read the next rectangle." },
    { id: 'update', label: 'Update', description: "Replace the best rectangle." },
    { id: 'done', label: 'Result', description: "Return the best area." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: "JSON object: {\"dimensions\": [[length,width],...]} (1 to 50 rectangles for this view)",
  url: "https://leetcode.com/problems/maximum-area-of-longest-diagonal-rectangle/",
  complexity: "O(n) time and O(1) extra space. The visualization caps input at 50 rectangles; LeetCode allows up to 100.",
  examples: [
    { label: "Longest diagonal wins", input: "{\"dimensions\": [[5, 12], [9, 2], [7, 6]]}" },
    { label: "Tie broken by area", input: "{\"dimensions\": [[2, 8], [8, 2], [6, 4]]}" },
    { label: "Single rectangle", input: '{"dimensions":[[3,4]]}' },
    { label: "Equal diagonals and areas", input: '{"dimensions":[[6,8],[8,6]]}' },
    { label: "Largest sides", input: '{"dimensions":[[1000,1000],[1,1]]}' },
    { label: "Long run: 50 rectangles", input: '{"dimensions":[[755,644],[540,155],[902,442],[760,460],[438,112],[59,967],[961,912],[646,723],[567,260],[170,501],[529,737],[956,935],[654,883],[741,111],[793,172],[32,294],[165,28],[205,781],[726,566],[13,941],[559,620],[731,690],[573,690],[19,282],[581,129],[249,984],[957,57],[666,997],[792,15],[481,484],[829,128],[574,690],[406,931],[11,514],[411,11],[993,120],[749,889],[855,807],[513,469],[532,903],[16,509],[94,376],[904,573],[44,651],[485,971],[880,605],[433,183],[172,947],[242,448],[389,589]]}' },
  ],
}

export default function Problem3000() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ run, step }) => <>
      <IndexedSequence label={"Squared diagonals per rectangle"} length={step.seq.length} valueAt={i => step.seq[i]} active={step.index} />
      <dl className="algorithm-workspace__stats">
        {Object.entries(step.stats || {}).map(([name, value]) => <div key={name}><dt>{name}</dt><dd>{typeof value === 'object' ? JSON.stringify(value) : String(value)}</dd></div>)}
      </dl>
      <p role="status">{step.message}</p>
      <p>Result: <output>{JSON.stringify(run.result)}</output></p>
    </>}
    renderReasoning={({ step }) => <>
      <p>{"The longest diagonal is the largest l*l + w*w. Ties on the diagonal are broken by the larger area."}</p>
      <p>{step.message}</p>
    </>}
  />
}
