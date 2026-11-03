import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'
import authoredExamples from '../../config/examples/collection--1009.js'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Write n in binary and fix the width of the written form.' },
    { id: 'flip', label: 'Flip digits', description: 'Replace each written digit with its opposite, keeping the width.' },
    { id: 'done', label: 'Complete', description: 'Read the flipped digits back as a base 10 integer.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with n (JSON)',
  url: 'https://leetcode.com/problems/complement-of-base-10-integer/',
  complexity: 'O(log n) time and space, proportional to the number of written binary digits.',
  examples: authoredExamples,
}

export default function ComplementBase10() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const s = step.state
    const cells = s.bits.split('')
    return <>
      <div aria-label="Binary digits" role="img" style={{ display: 'grid', gridTemplateColumns: `repeat(${cells.length}, 36px)`, gap: 4, fontFamily: 'monospace', width: 'max-content' }}>
        {cells.map((bit, i) => <div key={`b${i}`} data-bit={i} style={box(i === s.position)}>{bit}</div>)}
        {cells.map((_, i) => <div key={`f${i}`} data-flip={i} style={box(i === s.position, i < s.flipped.length ? '#bbf7d0' : null)}>{s.flipped[i] ?? ''}</div>)}
      </div>
      <output aria-label="Complement so far">{`Written digits ${s.bits}; complement so far ${s.flipped || '-'}.`}</output>
    </>
  }} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Width matters:</strong> the complement flips only the digits that are written. Leading zeros are not part of the number, so they must not turn into ones.</p>
    <p><strong>Zero is special:</strong> it is written as one zero digit, so its complement is one.</p>
  </>} />
}

function box(current, background = null) {
  return {
    width: 36, height: 36, boxSizing: 'border-box', display: 'grid', placeItems: 'center',
    borderWidth: current ? 2 : 1, borderStyle: 'solid', borderColor: current ? 'var(--text)' : 'var(--border)',
    background: background ?? 'transparent', color: 'var(--text)',
  }
}
