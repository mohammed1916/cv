import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const sample = '{"Cities":[{"state":"Ardena","city":"Alder Bay"},{"state":"Ardena","city":"Arrow"},{"state":"Ardena","city":"Brook"},{"state":"Ardena","city":"Anvil"},{"state":"Belmar","city":"Cove"},{"state":"Belmar","city":"Dunes"},{"state":"Belmar","city":"Harbor"},{"state":"Cassel","city":"Cinder"},{"state":"Cassel","city":"Mesa"},{"state":"Cassel","city":"Quarry"}]}'
const fewCities = '{"Cities":[{"state":"Dorin","city":"Dune"},{"state":"Dorin","city":"Lake"}]}'

const definition = {
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with Cities (state, city), up to 14 rows',
  url: 'https://leetcode.com/problems/find-cities-in-each-state/',
  complexity: 'O(c log c) for c city rows: group by state, sort each group, then sort the kept states.',
  examples: [
    { label: 'Three states', input: sample },
    { label: 'Too few cities', input: fewCities },
    { label: 'Single city', input: '{"Cities":[{"state":"Solo","city":"Only"}]}' },
    { label: 'One state, three cities', input: '{"Cities":[{"state":"Dorin","city":"Dune"},{"state":"Dorin","city":"Lake"},{"state":"Dorin","city":"Mesa"}]}' },
    { label: 'Two states, equal city counts', input: '{"Cities":[{"state":"Ardena","city":"Town A"},{"state":"Belmar","city":"Town B"},{"state":"Ardena","city":"Town C"},{"state":"Belmar","city":"Town D"},{"state":"Ardena","city":"Town E"},{"state":"Belmar","city":"Town F"}]}' },
    { label: 'Largest table, 14 cities', input: '{"Cities":[{"state":"Ardena","city":"Town A"},{"state":"Belmar","city":"Town B"},{"state":"Cassel","city":"Town C"},{"state":"Dorin","city":"Town D"},{"state":"Ardena","city":"Town E"},{"state":"Belmar","city":"Town F"},{"state":"Cassel","city":"Town G"},{"state":"Dorin","city":"Town H"},{"state":"Ardena","city":"Town I"},{"state":"Belmar","city":"Town J"},{"state":"Cassel","city":"Town K"},{"state":"Dorin","city":"Town L"},{"state":"Ardena","city":"Town M"},{"state":"Belmar","city":"Town N"}]}' },
  ],
}

function RowsTable({ columns, rows, caption }) {
  return <table aria-label={caption}>
    <thead><tr>{columns.map(c => <th key={c} scope="col">{c}</th>)}</tr></thead>
    <tbody>{rows.length
      ? rows.map((row, i) => <tr key={i}>{columns.map(c => <td key={c}>{String(row[c])}</td>)}</tr>)
      : <tr><td colSpan={columns.length}>No rows yet</td></tr>}</tbody>
  </table>
}

export default function FindCitiesInEachState() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <div aria-label="States so far" style={{ display: 'grid', gap: 8, gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', margin: '8px 0' }}>
      {step.groups.map(g => {
        const status = g.count < 3 ? 'fewer than 3 cities' : g.matching === 0 ? 'no city starts with the state letter' : 'kept'
        const kept = g.count >= 3 && g.matching > 0
        return <div key={g.state} style={{ padding: 10, borderRadius: 8, color: 'var(--text)', border: `2px solid ${step.current === g.state ? 'var(--primary)' : 'var(--border)'}`, opacity: kept ? 1 : 0.6 }}>
          <strong>{g.state}</strong>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, margin: '6px 0' }}>
            {g.cities.split(', ').map(city => {
              const match = g.matchingCities.includes(city)
              return <span key={city} style={{ padding: '2px 6px', borderRadius: 5, fontSize: 12, background: match ? 'color-mix(in srgb, var(--primary) 22%, var(--surface2))' : 'var(--surface2)', color: 'var(--text)', border: '1px solid var(--border)' }}>{city}</span>
            })}
          </div>
          <small style={{ color: 'var(--muted, var(--text))' }}>{g.count} cities, {g.matching} starting with {g.state[0]}: {status}</small>
        </div>
      })}
    </div>
    <RowsTable caption="Result rows so far" columns={['state', 'cities', 'matching_letter_count']} rows={step.rows} />
    <output aria-label="Result">{`${run.result.length} state row${run.result.length === 1 ? '' : 's'} in the final result`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Cities are grouped by state. A state needs at least three cities, and at least one of them must start with the same letter as the state name.</p>
  </>} />
}
