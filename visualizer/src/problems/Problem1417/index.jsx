import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { phases, parseInput, buildTrace, code, python, pythonLineMap } from './algorithm'

const definition = {
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  inputLabel: 'JSON string of lowercase letters and digits (e.g. "a1b2c3")',
  url: 'https://leetcode.com/problems/reformat-the-string/',
  complexity: 'O(n) time and O(n) space, where n is the string length.',
  examples: [
    { label: 'Mixed', input: '"a1b2c3"' },
    { label: 'Digits first', input: '"123abc4"' },
    { label: 'Impossible', input: '"ab12cd"' },
    { label: 'Single pair', input: '"z9"' },
    { label: 'Single letter', input: '"a"' },
    { label: 'Single digit', input: '"7"' },
    { label: 'Eight letters and eight digits', input: '"abcdefgh12345678"' },
    { label: 'Long run: 500 characters', input: '"p6d5j2t5x0a1e8d7x7u8d8m3w5c1k7z3u6f5h1r1c6v8u5f0h7n4x2p9k2r1l4v2g6d0p8q7l5q8r6b5p3v8h0t3c5d7o7t0y6e6r4n0m3s1q3i0v4f8v8w2q6l6r0e5q9l9u5o6h3d1p0f4y4i3i6x1w1t6h7i9d6f6s6x3j3q7t5q8p4n4g2h1d5y3q4a5x1b8z0w3r2e0c9r0m6e6v6t2f9q7e5m8q3j7w2z8j2i5v8h1z4t5f0w0h4a5u5o1h2j6g7g6o9v6s4q2g9s3q1b9r0l1r5b2b5l0k6m5i7a2b2y8g7v8l4f1z3s4v7h5g7y8y6w1n4m5k0k0n1q1d0y3a2u6a7z1q9u0n9s2n6q2i2f4d0z8g3i5r8t8r2a0z6z9y6a8f3n8m2u4o4s4q7i3d6a6e7f3y5v2p2f2j1j2p7g6b6j9p9p9v8u7g9c9m1e1z4d6x7v9w6c9t8k6l1d1r2o3l5s0j3z5h3i7g6e6a5g2v0t3"' },
  ],
}

function ReformatScene({ run, step }) {
  const { input } = run
  const snap = step.snapshot
  return <>
    <IndexedSequence label="Input characters" length={input.length} valueAt={i => input[i]} active={snap.current}
      roleAt={i => (/\d/.test(input[i]) ? 'digit' : 'letter')} />
    <IndexedSequence label="Output so far" length={snap.output.length} valueAt={i => snap.output[i]} active={snap.output.length - 1} />
    <p>Letter group: {snap.letters.length} · digit group: {snap.digits.length}</p>
  </>
}

export default function Reformat() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <ReformatScene run={run} step={step} />}
      renderReasoning={({ step }) => <p>{phases.find(p => p.id === step.phase)?.description}</p>}
    />
  )
}
