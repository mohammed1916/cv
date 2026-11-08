import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import RecordStateTable from '../../components/shared/RecordStateTable'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Build the KMP failure table for evil.' },
    { id: 'position', label: 'Position', description: 'Extend every live state by one letter.' },
    { id: 'done', label: 'Complete', description: 'Sum the counts of all live states.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object: n (1-4), s1, s2 (length n, lowercase), evil (1-3 letters)',
  url: 'https://leetcode.com/problems/find-all-good-strings/',
  complexity: 'O(n * m * 26) time with m the length of evil. The visualization caps n at 4.',
  examples: [
    { label: 'Example', input: '{"n":2,"s1":"aa","s2":"da","evil":"b"}' },
    { label: 'Zero', input: '{"n":2,"s1":"ab","s2":"ab","evil":"a"}' },
    { label: "Single letter, one string", input: "{\"n\":1,\"s1\":\"a\",\"s2\":\"a\",\"evil\":\"b\"}" },
    { label: "Equal bounds count once", input: "{\"n\":2,\"s1\":\"ab\",\"s2\":\"ab\",\"evil\":\"a\"}" },
    { label: "Full range with a short evil", input: "{\"n\":4,\"s1\":\"aaaa\",\"s2\":\"zzzz\",\"evil\":\"a\"}" },
    { label: "Long run: four letters, three-letter evil", input: "{\"n\":4,\"s1\":\"lenn\",\"s2\":\"uzjj\",\"evil\":\"xyz\"}" },
  ],
}

const cell = { display: 'inline-block', minWidth: 30, padding: '4px 6px', textAlign: 'center', fontFamily: 'monospace', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text)', background: 'var(--surface2)' }

// Letters of a word with the active position (and an optional matched prefix) marked.
function Letters({ label, word, active = -1, matched = 0 }) {
  return <div aria-label={label} style={{ marginBottom: 8 }}>
    <small style={{ color: 'var(--text)' }}>{label}</small>
    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
      {[...word].map((ch, i) => <span key={i} style={{ ...cell, borderWidth: i === active ? 2 : 1, borderColor: i === active ? 'var(--primary)' : 'var(--border)', background: i < matched ? 'var(--surface2)' : 'transparent' }}>
        {ch}<br /><small>{i}</small>
      </span>)}
    </div>
  </div>
}

export default function FindAllGoodStrings() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const n = run.input.n
    const position = step.position === null ? -1 : step.position
    const live = step.live || []
    const failRow = step.fail || []
    return <>
      <Letters label="Lower bound s1" word={run.input.s1} active={position + 1 < n ? position + 1 : -1} />
      <Letters label="Upper bound s2" word={run.input.s2} active={position + 1 < n ? position + 1 : -1} />
      <Letters label="Evil string (the match length is the state)" word={run.input.evil} matched={0} />
      <div style={{ marginBottom: 8 }}>
        <small style={{ color: 'var(--text)' }}>KMP fallback: after a mismatch at length k, fall back to fail[k - 1]</small>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {failRow.map((value, i) => <span key={i} style={cell}>{`${run.input.evil[i]}:${value}`}</span>)}
        </div>
      </div>
      <RecordStateTable label={`Live states after ${position < 0 ? 'start' : `position ${position + 1}`} (${step.states} states)`}
        columns={['matched', 'tightLow', 'tightHigh', 'ways']} rows={live} />
      <output aria-label="Total" style={{ display: 'block', marginTop: 8, color: 'var(--text)' }}>
        {step.total === null ? `Evil: ${run.input.evil}` : `Good strings: ${step.total}`}
      </output>
    </>
  }} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Each row is a state: how much of evil is matched so far, and whether the string written so far still equals the lower bound or the upper bound. Only tight rows limit the next letter.</p>
  </>} />
}
