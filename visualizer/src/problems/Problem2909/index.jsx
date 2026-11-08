import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import IndexedSequence from "../../components/shared/IndexedSequence";
import { code, python, parseInput, buildTrace } from "./algorithm";

const definition = {
  number: "2909",
  phases: [
    { id: "suffix", label: "Suffix", description: "Smallest value at or after each index." },
    { id: "scan", label: "Scan", description: "Treat each index as the peak j." },
    { id: "record", label: "Record", description: "Keep the smallest valid triplet sum." },
    { id: "result", label: "Result", description: "Report the minimum sum or -1." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON object with key nums (e.g. {"nums": [8,6,1,5,3]})',
  url: "https://leetcode.com/problems/minimum-sum-of-mountain-triplets-ii/",
  complexity: "O(n) time and O(n) space for array length n. The visualization caps nums at 50 elements.",
  examples: [
    { label: "Example 1", input: '{"nums": [8,6,1,5,3]}' },
    { label: "Example 2", input: '{"nums": [5,4,8,7,10,2]}' },
    { label: "Example 3", input: '{"nums": [6,5,4,3,4,5]}' },
    { label: "Smallest length", input: "{\"nums\":[1,1,1]}" },
    { label: "Equal values", input: "{\"nums\":[4,4,4,4]}" },
    { label: "Largest values, 50 entries", input: "{\"nums\":[100000000,1,100000000,1,100000000,1,100000000,1,100000000,1,100000000,1,100000000,1,100000000,1,100000000,1,100000000,1,100000000,1,100000000,1,100000000,1,100000000,1,100000000,1,100000000,1,100000000,1,100000000,1,100000000,1,100000000,1,100000000,1,100000000,1,100000000,1,100000000,1,100000000,1]}" },
    { label: "Long run: 50 values", input: "{\"nums\":[36345799,13581977,63589800,34847533,13442122,71271985,23045283,72900145,36010121,69946529,68463654,85616742,30316967,72258030,20905974,38575810,23333642,52938150,96549350,28981581,89689286,81079280,10721354,84986545,52238823,49388696,42578982,3392865,31556370,89477866,68244637,27295199,64666926,37249409,95211647,90227432,38328841,37444216,55831817,78375804,7179573,1411225,42697505,87420957,92057214,57162356,93730736,75571383,78810311,55775093]}" },
  ],
};

export default function Problem2909() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ run, step }) => <>
      <IndexedSequence label="nums" length={step.values.length} valueAt={i => String(step.values[i])}
        active={step.active} roleAt={i => step.marks[i] || ""} />
      <table aria-label="Smallest value to the left and right of each index" style={{ borderCollapse: 'collapse', color: 'var(--text)' }}>
        <thead><tr>{['index', 'value', 'smallest to the left', 'smallest to the right'].map(h => <th key={h} scope="col" style={{ padding: '4px 8px', textAlign: 'left', borderBottom: '2px solid var(--border, currentColor)' }}>{h}</th>)}</tr></thead>
        <tbody>{step.values.map((v, i) => {
          const left = run.input.nums.slice(0, i).reduce((m, x) => Math.min(m, x), Infinity)
          const right = step.suffixMin[i + 1]
          return <tr key={i} data-current={i === step.active} style={{ background: i === step.active ? 'var(--surface2)' : 'transparent' }}>
            <td style={{ padding: '4px 8px' }}>{i}</td><td style={{ padding: '4px 8px' }}>{v}</td>
            <td style={{ padding: '4px 8px' }}>{left === Infinity ? 'none' : left}</td>
            <td style={{ padding: '4px 8px' }}>{right === null || right === undefined ? 'none' : right}</td>
          </tr>
        })}</tbody>
      </table>
      <p style={{ color: 'var(--text)' }}>{step.summary}</p>
    </>}
    renderReasoning={({ step }) => <p>{step.message}</p>} />;
}
