import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Budget', description: 'Start with the full budget and an empty result.' },
    { id: 'pick', label: 'Pick', description: 'Choose the smallest letter this position can afford.' },
    { id: 'done', label: 'Result', description: 'The smallest string within the budget.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with s (lowercase, 1 to 30 letters) and k (0 to 100)',
  url: 'https://leetcode.com/problems/lexicographically-smallest-string-after-operations-with-constraint/',
  complexity: 'O(26 * n) time with the cost computed directly for each letter.',
  examples: [
    { label: 'Example 1', input: '{"s":"azb","k":1}' },
    { label: 'Example 2', input: '{"s":"mnop","k":3}' },
    { label: 'Example 3', input: '{"s":"zzz","k":0}' },
    { label: "Single letter, no operations", input: "{\"s\":\"a\",\"k\":0}" },
    { label: "Two letters, large budget", input: "{\"s\":\"ab\",\"k\":100}" },
    { label: "Equal letters", input: "{\"s\":\"zzzzzz\",\"k\":4}" },
    { label: "Long run: 30 letters", input: "{\"s\":\"tupwhkxyloxadktqlkfalatetqzezq\",\"k\":57}" },
  ],
}

export default function SmallestStringWithBudget() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="s" length={run.input.s.length} valueAt={i => run.input.s[i]} active={step.at} roleAt={i => (i < step.out.length ? 'done' : '')} />
    {step.at >= 0 && <div className="algorithm-alphabet" aria-label="Letters around the cycle" style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
      {'abcdefghijklmnopqrstuvwxyz'.split('').map(c => {
        const d = Math.abs(run.input.s.charCodeAt(step.at) - c.charCodeAt(0))
        const cost = Math.min(d, 26 - d)
        const affordable = cost <= step.budget + (step.cost ?? 0)
        return <span key={c} style={{ padding: '2px 5px', border: '1px solid var(--text-muted)', color: 'var(--text)', background: c === step.letter ? 'var(--primary)' : affordable ? 'var(--surface2)' : 'transparent' }}
          title={`cost ${cost}${affordable ? ', affordable' : ', too expensive'}`}>{c}{cost}</span>
      })}
    </div>}
    <output aria-label="Budget and result">{`budget left ${step.budget}, result so far "${step.out}"`}</output>
  </>} renderReasoning={() => <>
    <p>Positions are decided from left to right, so an earlier smaller letter always beats any later change. Each position takes the smallest letter whose cyclic distance still fits the remaining budget.</p>
  </>} />
}
