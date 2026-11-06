import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'
import authoredExamples from '../../config/examples/collection--1010.js'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Create sixty remainder buckets, all empty.' },
    { id: 'pair', label: 'Count partners', description: 'Look up how many earlier songs have the complementary remainder.' },
    { id: 'add', label: 'Store song', description: 'Record the current song in its remainder bucket.' },
    { id: 'done', label: 'Complete', description: 'Return the total number of pairs.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with time, a list of song durations (JSON)',
  url: 'https://leetcode.com/problems/pairs-of-songs-with-total-durations-divisible-by-60/',
  complexity: 'O(n) time and O(1) auxiliary space, because there are always exactly sixty buckets.',
  examples: authoredExamples,
}

export default function PairsDivisibleBy60() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const s = step.state
    return <>
      <IndexedSequence label="Songs (time)" length={run.input.time.length} valueAt={k => run.input.time[k]} active={s.index} roleAt={k => (k < s.index ? 'paired' : '')} />
      <div aria-label="Remainder buckets" role="img" style={{ display: 'flex', flexWrap: 'wrap', gap: 6, fontFamily: 'monospace', maxWidth: 520 }}>
        {(s.buckets.length ? s.buckets : [{ remainder: null, count: 0 }]).map(bucket => <div key={bucket.remainder ?? 'none'} data-bucket={bucket.remainder ?? ''} style={{
          minWidth: 56, padding: 6, boxSizing: 'border-box', textAlign: 'center', borderWidth: bucket.remainder === s.remainder || bucket.remainder === s.need ? 2 : 1,
          borderStyle: 'solid', borderColor: bucket.remainder === s.need ? 'var(--text)' : 'var(--border)',
          background: bucket.remainder === s.need ? 'var(--surface2)' : 'transparent', color: 'var(--text)',
        }}>{bucket.remainder === null ? 'empty' : `r ${bucket.remainder}: ${bucket.count}`}</div>)}
      </div>
      <output aria-label="Pair total">{`Song ${s.song ?? '-'}: partners ${s.partners}. Total ${s.total}.`}</output>
    </>
  }} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Complement buckets:</strong> a remainder r pairs with remainder (60 - r) mod 60. Remainder 0 and remainder 30 pair with themselves.</p>
    <p><strong>Order:</strong> each song counts only earlier partners, so every unordered pair is counted exactly once.</p>
  </>} />
}
