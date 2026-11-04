import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1487',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with a names list (JSON)',
  url: 'https://leetcode.com/problems/making-file-names-unique/',
  complexity: 'About O(n) expected time with hash sets and maps, plus the length of any suffix search for repeated names.',
  examples: [
    { label: 'Repeated doc', input: '{"names":["doc","doc","doc","doc"]}' },
    { label: 'Mixed names', input: '{"names":["notes","todo","notes","notes","todo"]}' },
    { label: 'All distinct', input: '{"names":["one","two","three"]}' },
  ],
}

const KEPT = 'color-mix(in srgb, var(--success) 35%, var(--surface2))'
const SUFFIXED = 'color-mix(in srgb, var(--primary) 35%, var(--surface2))'
const WAITING = 'var(--surface2)'

function Chip({ children, background, outline, title }) {
  return <span title={title} style={{
    display: 'inline-block', padding: '4px 8px', margin: 2, fontFamily: 'monospace', color: 'var(--text)',
    background, border: `${outline ? 2 : 1}px solid ${outline ? 'var(--text)' : 'var(--border)'}`,
  }}>{children}</span>
}

export default function UniqueFileNames() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { names } = run.input
    const { index, current: requestedName, candidate, used, result, nextSuffix } = step.snapshot
    const current = index ?? -1
    const taken = new Set(used)
    return <>
      <section aria-label="Requests in order">
        <h3>Requests, in order</h3>
        <p>Each request is compared with every name reserved so far. A reused name gets the smallest free suffix.</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {names.map((requested, i) => {
            const assigned = i < result.length ? result[i] : null
            const background = assigned === null ? WAITING : assigned === requested ? KEPT : SUFFIXED
            return <Chip key={i} background={background} outline={i === current} title={assigned ? `request ${i}: ${requested} becomes ${assigned}` : `request ${i}`}>
              {requested}{assigned && assigned !== requested ? ` → ${assigned}` : ''}
            </Chip>
          })}
        </div>
      </section>
      <section aria-label="Reserved names">
        <h3>Reserved names (a hash set: each name is checked in one lookup)</h3>
        <div>{used.length ? used.map(value => <Chip key={value} background={value === candidate ? SUFFIXED : KEPT}>{value}</Chip>) : <em>none yet</em>}</div>
      </section>
      <section aria-label="Next suffix to try">
        <h3>Next suffix per base name (a hash map)</h3>
        {nextSuffix.length === 0 ? <p>No base name has needed a suffix yet.</p> : (
          <table>
            <thead><tr><th scope="col">base name</th><th scope="col">resume at</th></tr></thead>
            <tbody>{nextSuffix.map(([base, k]) => <tr key={base} data-base={base} style={base === requestedName ?{ background: 'var(--surface2)', fontWeight: 600 } : undefined}>
              <td>{base}</td><td>{k}</td></tr>)}</tbody>
          </table>
        )}
      </section>
      <p>{candidate ? `Candidate: ${candidate}${taken.has(candidate) ? ' (reserved)' : ''}` : 'No candidate chosen for this step.'}</p>
    </>
  }} renderReasoning={() => <>
    <p><strong>Reserve as you go:</strong> a name is kept only if it is still free when its request arrives, so the answer is built in request order.</p>
    <p><strong>Resume counters:</strong> remembering the next suffix per base name skips suffixes that are already known to be taken.</p>
  </>} />
}
