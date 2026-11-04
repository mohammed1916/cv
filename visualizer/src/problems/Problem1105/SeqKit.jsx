import IndexedSequence from '../../components/shared/IndexedSequence'
import '../../components/shared/AlgorithmWorkspace.css'
import './SeqKit.css'

// Array or string cells with named pointers (l, r, i, j, read, write ...) and optional cell roles
// (window, written, shifted, pending). The first pointer on a cell names it.
export function Sequence({ label, values, pointers = {}, marks = {} }) {
  const roleAt = index => {
    const name = Object.keys(pointers).find(key => pointers[key] === index)
    return name ?? marks[index] ?? ''
  }
  return <IndexedSequence label={label} length={values.length} valueAt={index => String(values[index])} roleAt={roleAt} />
}

// The variables this step holds, one line each.
export function Vars({ vars }) {
  return <dl className="seq-vars">
    {Object.entries(vars).map(([name, value]) => <div key={name}><dt>{name}</dt><dd>{value === null || value === undefined ? '-' : String(value)}</dd></div>)}
  </dl>
}
