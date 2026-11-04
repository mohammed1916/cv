import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'convert', label: 'To fraction', description: 'Turn a repeating decimal into numerator over denominator.' },
    { id: 'compare', label: 'Compare', description: 'Two fractions are equal when their cross products match.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Two numbers (JSON strings)',
  url: 'https://leetcode.com/problems/equal-rational-numbers/',
  complexity: 'O(1) big-integer arithmetic on the digit lengths.',
  examples: [
    { label: 'Equal', input: '{"s":"0.(52)","t":"0.5(25)"}' },
    { label: 'Not equal', input: '{"s":"0.(6)","t":"0.(9)"}' },
  ],
}

const chip = { display: 'inline-block', minWidth: 28, padding: '4px 6px', margin: 2, textAlign: 'center', fontFamily: 'monospace', border: '1px solid var(--border)', color: 'var(--text)' }

// Split a decimal into its parts so each part can be shown as a labelled chip.
function partsOf(s) {
  const [whole, rest = ''] = s.split('.')
  const open = rest.indexOf('(')
  const nonRepeat = open === -1 ? rest : rest.slice(0, open)
  const repeat = open === -1 ? '' : rest.slice(open + 1, -1)
  return { whole, nonRepeat, repeat }
}

function Parts({ label, text }) {
  const { whole, nonRepeat, repeat } = partsOf(text)
  return <div style={{ marginBottom: 6 }}>
    <div style={{ color: 'var(--text)' }}>{label}: <code>{text}</code></div>
    <div>
      <span style={chip} title="whole part">{whole}</span>
      <span style={{ color: 'var(--text)' }}>.</span>
      {nonRepeat && <span style={chip} title="digits before the repeat">{nonRepeat}</span>}
      {repeat && <span style={{ ...chip, border: '2px solid var(--primary)' }} title="repeating block">{repeat} (repeats)</span>}
    </div>
  </div>
}

export default function EqualRationalNumbers() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <Parts label="s" text={run.input.s} />
    <Parts label="t" text={run.input.t} />
    <output aria-label="Fraction" style={{ display: 'block', color: 'var(--text)', marginTop: 8 }}>
      {step.num === null ? step.message : `${step.text}: ${step.num} / ${step.den}`}
    </output>
    {step.equal !== null && <p style={{ color: 'var(--text)' }}>{step.equal ? 'The two numbers are equal.' : 'The two numbers differ.'}</p>}
  </>} renderReasoning={() => <>
    <p>A repeating decimal is an exact fraction. The non-repeating digits set the power of ten, and the repeating block adds a term whose denominator is 9 for each repeated digit.</p>
    <p>Comparing fractions without division avoids rounding: a × d equals c × b exactly.</p>
  </>} />
}
