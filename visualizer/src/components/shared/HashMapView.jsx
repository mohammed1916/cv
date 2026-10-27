import { describeHashOps, hashEntryRoles, hashKeyText, limitHashEntries } from './hashmapModel.js'
import './HashMapView.css'

const ROLE_NAME = { hit: 'looked up: hit', miss: 'looked up: miss', insert: 'just inserted', update: 'just updated', delete: 'just deleted' }

/**
 * Hash map / hash set state with its operations: every entry in insertion order, and a plain-language
 * line per lookup (hit or miss and why it matters), insert, update and delete since the previous step.
 * Data comes from hashmapView() in hashmapModel.js.
 */
export default function HashMapView({ maps = [], ops = [], skipped = 0 }) {
  const lines = describeHashOps(ops)
  const roles = {}
  ops.forEach(op => { (roles[op.map] ??= []).push(op) })
  return <section className="hash-view" aria-label="Hash map state">
    <h3>Hash {maps.every(m => m.isSet) ? 'set' : 'map'}</h3>
    {(lines.length > 0 || skipped > 0) && <ol className="hash-view__ops" aria-label="Operations this step">
      {skipped > 0 && <li className="is-note">{skipped} earlier operations in this step are not listed.</li>}
      {lines.map((line, i) => <li key={i} className={`is-${line.kind}`}><b>{line.kind}</b> {line.text}</li>)}
    </ol>}
    <div className="hash-view__maps">
      {maps.map(map => {
        const touched = hashEntryRoles(roles[map.name] ?? [])
        const { shown, hidden } = limitHashEntries(map.entries)
        const present = new Set(map.entries.map(([key]) => hashKeyText(key)))
        const misses = Object.keys(touched).filter(key => touched[key] === 'miss' && !present.has(key))
        const deleted = Object.keys(touched).filter(key => touched[key] === 'delete' && !present.has(key))
        return <figure key={map.name} className="hash-view__map">
          <figcaption>{map.name} <span>{map.isSet ? `${map.keyLabel}s` : `${map.keyLabel} → ${map.valueLabel}`} · {map.entries.length} {map.entries.length === 1 ? 'entry' : 'entries'}</span></figcaption>
          <ul>
            {shown.map(([key, value], index) => {
              const role = touched[hashKeyText(key)]
              return <li key={index} className={role ? `is-${role}` : undefined} title={role ? ROLE_NAME[role] : undefined}>
                <i>{index}</i><b>{hashKeyText(key)}</b>{!map.isSet && <><em>→</em><span>{hashKeyText(value)}</span></>}
              </li>
            })}
            {misses.map(key => <li key={`miss-${key}`} className="is-miss is-ghost" title={ROLE_NAME.miss}><b>{key}</b><span>not in map</span></li>)}
            {deleted.map(key => <li key={`del-${key}`} className="is-delete is-ghost" title={ROLE_NAME.delete}><b>{key}</b><span>removed</span></li>)}
            {map.entries.length === 0 && misses.length + deleted.length === 0 && <li className="is-empty">empty</li>}
          </ul>
          {hidden > 0 && <p className="hash-view__more">+{hidden} more entries not shown</p>}
        </figure>
      })}
    </div>
    <p className="hash-view__legend">
      <span className="is-hit">hit (key found)</span>
      <span className="is-miss">miss (key absent)</span>
      <span className="is-insert">inserted</span>
      <span className="is-update">value updated</span>
      <span className="is-delete">deleted</span>
    </p>
  </section>
}
