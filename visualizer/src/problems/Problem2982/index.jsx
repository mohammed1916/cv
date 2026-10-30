import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'init', label: 'Setup', description: "Create the top lists." },
    { id: 'scan', label: 'Run', description: "Find the next run of one letter." },
    { id: 'run', label: 'Run length', description: "Measure the run." },
    { id: 'candidate', label: 'Candidate', description: "Insert a candidate length." },
    { id: 'answer', label: 'Letter', description: "Check a letter with three candidates." },
    { id: 'done', label: 'Result', description: "Return the answer." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: "JSON object: {\"s\": \"...\"} (3 to 60 lowercase letters for this view)",
  url: "https://leetcode.com/problems/find-longest-special-substring-that-occurs-thrice-ii/",
  complexity: "O(n) time and O(1) extra space. The visualization caps s at 60 characters; LeetCode allows up to 5 * 10^5.",
  examples: [
    { label: "aaaa", input: "{\"s\": \"aaaa\"}" },
    { label: "abcdef", input: "{\"s\": \"abcdef\"}" },
  ],
}

export default function Problem2982() {
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
      <p>{"The per-letter top-three lists are the same as in the first version. Only the input bound differs."}</p>
      <p>{step.message}</p>
    </>}
  />
}
