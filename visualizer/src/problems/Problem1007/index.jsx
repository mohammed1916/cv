import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'
import authoredExamples from '../../config/examples/collection--1007.js'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Only the first domino can fix the shared value, so its two faces are the candidates.' },
    { id: 'candidate', label: 'Candidate', description: 'Pick one candidate and reset the two rotation counters.' },
    { id: 'scan', label: 'Scan dominoes', description: 'Every domino must show the candidate. Count the rotations each row would need.' },
    { id: 'record', label: 'Record', description: 'A candidate that every domino allowed updates the best count.' },
    { id: 'done', label: 'Complete', description: 'Return the smallest recorded count, or -1.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with tops and bottoms (JSON)',
  url: 'https://leetcode.com/problems/minimum-domino-rotations-for-equal-row/',
  complexity: 'O(n) time and O(1) auxiliary state for n dominoes, because only two candidates are checked.',
  examples: authoredExamples,
}

export default function MinimumDominoRotations() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { tops, bottoms } = run.input
    const s = step.state
    return <>
      <div aria-label="Dominoes" role="img" style={{ display: 'grid', gridTemplateColumns: `auto repeat(${tops.length}, 44px)`, gap: 4, fontFamily: 'monospace', width: 'max-content' }}>
        <span />
        {tops.map((_, i) => <span key={`h${i}`} style={{ textAlign: 'center', color: i === s.index ? 'var(--text)' : 'var(--text-dim)' }}>{i}</span>)}
        <span style={{ color: 'var(--text-dim)' }}>top</span>
        {tops.map((v, i) => <div key={`t${i}`} data-domino-top={i} style={cell(i === s.index, s.target !== null && v !== s.target ? 'rotate' : v === s.target ? 'match' : null)}>{v}</div>)}
        <span style={{ color: 'var(--text-dim)' }}>bottom</span>
        {bottoms.map((v, i) => <div key={`b${i}`} data-domino-bottom={i} style={cell(i === s.index, s.target !== null && v !== s.target ? 'rotate' : v === s.target ? 'match' : null)}>{v}</div>)}
      </div>
      <output aria-label="Rotation counts">{`Target ${s.target ?? '-'}: top moves ${s.topMoves}, bottom moves ${s.bottomMoves}. Best ${s.best ?? '-'}.`}</output>
    </>
  }} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Why only two candidates:</strong> the first domino must show the shared value, so only its two faces can work.</p>
    <p><strong>Counting moves:</strong> a top face that differs from the target needs a rotation, and so does a bottom face that differs. The cheaper row wins for that target.</p>
  </>} />
}

function cell(current, kind) {
  return {
    width: 44, height: 40, boxSizing: 'border-box', display: 'grid', placeItems: 'center',
    borderWidth: current ? 2 : 1, borderStyle: 'solid', borderColor: current ? 'var(--text)' : 'var(--border)',
    background: kind === 'match' ? '#bbf7d0' : kind === 'rotate' ? 'var(--surface2)' : 'transparent',
    color: '#1c1917',
  }
}
