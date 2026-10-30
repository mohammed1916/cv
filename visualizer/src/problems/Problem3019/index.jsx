import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'init', label: 'Setup', description: "Start with zero changes." },
    { id: 'scan', label: 'Compare', description: "Compare adjacent letters ignoring case." },
    { id: 'count', label: 'Count', description: "Count a key change." },
    { id: 'done', label: 'Result', description: "Return the count." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: "JSON object: {\"s\": \"...\"} (1 to 100 English letters)",
  url: "https://leetcode.com/problems/number-of-changing-keys/",
  complexity: "O(n) time and O(1) extra space.",
  examples: [
    { label: "aAbBcC", input: "{\"s\": \"aAbBcC\"}" },
    { label: "AaAaAaaA", input: "{\"s\": \"AaAaAaaA\"}" },
  ],
}

export default function Problem3019() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ run, step }) => <>
      <IndexedSequence label={"Characters of s"} length={step.seq.length} valueAt={i => step.seq[i]} active={step.index} />
      <dl className="algorithm-workspace__stats">
        {Object.entries(step.stats || {}).map(([name, value]) => <div key={name}><dt>{name}</dt><dd>{typeof value === 'object' ? JSON.stringify(value) : String(value)}</dd></div>)}
      </dl>
      <p role="status">{step.message}</p>
      <p>Result: <output>{JSON.stringify(run.result)}</output></p>
    </>}
    renderReasoning={({ step }) => <>
      <p>{"A key change is a switch to a different key. Case does not matter, so each adjacent pair is compared after lowercasing."}</p>
      <p>{step.message}</p>
    </>}
  />
}
