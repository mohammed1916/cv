import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import IndexedSequence from "../../components/shared/IndexedSequence";
import { code, python, parseInput, buildTrace } from "./algorithm";

const definition = {
  number: "2910",
  phases: [
    { id: "count", label: "Count", description: "Count how often each distinct value appears." },
    { id: "try", label: "Try size", description: "Try each group size from the smallest count down." },
    { id: "split", label: "Split", description: "Split each count into groups of size s or s+1." },
    { id: "record", label: "Record", description: "Keep the fewest groups over valid sizes." },
    { id: "result", label: "Result", description: "Report the minimum number of groups." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON object with key nums (e.g. {"nums": [3,2,3,2,3]})',
  url: "https://leetcode.com/problems/minimum-number-of-groups-to-create-a-valid-assignment/",
  complexity: "O(D * m) time for D distinct values and smallest count m, plus O(n) counting. The visualization caps nums at 50 elements.",
  examples: [
    { label: "Example 1", input: '{"nums": [3,2,3,2,3]}' },
    { label: "Example 2", input: '{"nums": [10,10,10,3,1,1]}' },
  ],
};

export default function Problem2910() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ step }) => <>
      <IndexedSequence label="count per value" length={step.values.length} valueAt={i => String(step.values[i])}
        active={step.active} roleAt={i => step.marks[i] || ""} />
      {step.s !== undefined && <table aria-label="Split of each count for the current size" style={{ borderCollapse: 'collapse', color: 'var(--text)' }}>
        <thead><tr>{['count c', 'groups t = ceil(c / (s + 1))', 'valid for size s?'].map(h => <th key={h} scope="col" style={{ padding: '4px 8px', textAlign: 'left', borderBottom: '2px solid var(--border, currentColor)' }}>{h}</th>)}</tr></thead>
        <tbody>{step.values.map((c, i) => {
          const t = Math.ceil(c / (step.s + 1))
          return <tr key={i} data-current={i === step.active} style={{ background: i === step.active ? 'var(--surface2)' : 'transparent' }}>
            <td style={{ padding: '4px 8px' }}>{c}</td><td style={{ padding: '4px 8px' }}>{t}</td>
            <td style={{ padding: '4px 8px' }}>{t * step.s > c ? 'no' : 'yes'}</td>
          </tr>
        })}</tbody>
      </table>}
      <p style={{ color: 'var(--text)' }}>{step.summary}</p>
    </>}
    renderReasoning={({ step }) => <p>{step.message}</p>} />;
}
