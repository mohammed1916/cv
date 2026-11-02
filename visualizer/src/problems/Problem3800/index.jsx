import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin counting mismatches.' },
    { id: 'scan', label: 'Scan', description: 'Classify each index by its bits.' },
    { id: 'costs', label: 'Prices', description: 'Price mixed and same-type pairs.' },
    { id: 'try', label: 'Try', description: 'Try one number of mixed pairs.' },
    { id: 'best', label: 'Best', description: 'Record a cheaper total.' },
    { id: 'done', label: 'Result', description: 'Report the cheapest total.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with s, t (equal-length binary strings), flipCost, swapCost and crossCost',
  url: 'https://leetcode.com/problems/minimum-cost-to-make-two-binary-strings-equal/',
  complexity: 'O(n) time to classify mismatches, then O(min(a, b)) candidates. The visualization caps the strings at 40 characters.',
  examples: [
    { label: 'Example 1', input: '{"s":"01000","t":"10111","flipCost":10,"swapCost":2,"crossCost":2}' },
    { label: 'Example 2', input: '{"s":"001","t":"110","flipCost":2,"swapCost":100,"crossCost":100}' },
    { label: 'Equal', input: '{"s":"1010","t":"1010","flipCost":5,"swapCost":5,"crossCost":5}' },
  ],
}

export default function MinimumCostToMakeTwoBinaryStringsEqual() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="s" length={run.input.s.length} valueAt={i => run.input.s[i]} active={step.index}
      roleAt={i => (run.input.s[i] !== run.input.t[i] ? 'mismatch' : '')} />
    <IndexedSequence label="t" length={run.input.t.length} valueAt={i => run.input.t[i]} active={step.index}
      roleAt={i => (run.input.s[i] !== run.input.t[i] ? 'mismatch' : '')} />
    <output aria-label="Pairing state">{`type A ${step.typeA ?? '?'}, type B ${step.typeB ?? '?'}, mixed pairs ${step.mixed >= 0 ? step.mixed : 'none'}, best ${step.best ?? 'none'}`}</output>
  </>} renderReasoning={() => <>
    <p>Only indices where the bits disagree matter. Type A has s 0 and t 1; type B has s 1 and t 0.</p>
    <p>A mixed pair is fixed by one within-string swap or by two flips. A same-type pair is fixed by two flips or by a cross swap plus a within-string swap. A lone mismatch needs one flip.</p>
    <p>Try every number of mixed pairs and keep the cheapest total.</p>
  </>} />
}
