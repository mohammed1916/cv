import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import { buildTrace, parseInput, code, python, phases, examples, complexity, inputLabel } from './algorithm'

const definition = {
  number: meta.number,
  phases, parse: parseInput, build: buildTrace, code, python, inputLabel,
  url: `https://leetcode.com/problems/${meta.slug}/`,
  complexity, examples,
}

function GcdView({ step }) {
  return <div>
    <ol aria-label="Values" style={{ display: 'flex', flexWrap: 'wrap', gap: 8, listStyle: 'none', padding: 0 }}>
      {step.nums.map((v, i) => <li key={i} style={{ padding: '6px 10px', border: `2px solid ${i === step.index ? 'var(--primary)' : 'currentColor'}`, borderRadius: 6, opacity: step.index === undefined || i <= step.index ? 1 : 0.5 }}>{v}</li>)}
    </ol>
    <p>Running gcd: <strong>{step.g}</strong>{step.a !== undefined && step.b !== undefined && step.b !== null ? ` · Euclid pair (${step.a}, ${step.b})` : ''}</p>
    <p>{step.g === 1 ? 'The running gcd is 1, so the array is good.' : 'The array is good only if the running gcd ends at 1.'}</p>
  </div>
}

export default function GoodArrayVisual() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ step }) => <GcdView step={step} />}
    renderReasoning={() => <p>Every integer combination of the values is a multiple of their gcd. If the gcd is 1, some combination reaches 1; otherwise none can. The running gcd and its Euclid steps show this.</p>} />
}
