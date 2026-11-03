import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'

const code = [
  'tables: name -> {columns, next_id, rows}',
  'create(name, columns): make an empty table',
  'insert(name, row): check the row width, give it the next id, return that id',
  'delete(name, id): remove the row if it still exists',
  'select(name, id, column): return the cell, or null when the row or column is missing',
  'return one result per operation',
].map((text, index) => ({ line: index + 1, text }))

const python = `def run_ops(ops):
    tables, out = {}, []
    for op in ops:
        name = op[0]
        if name == "create":
            tables[op[1]] = {"columns": op[2], "next_id": 1, "rows": {}}
            out.append(None)
        elif name == "insert":
            t = tables[op[1]]
            row = op[2]
            if len(row) != t["columns"]:
                out.append(None)
                continue
            rid = t["next_id"]
            t["next_id"] += 1
            t["rows"][rid] = row
            out.append(rid)
        elif name == "delete":
            t = tables[op[1]]
            out.append(t["rows"].pop(op[2], None) is not None)
        else:
            t = tables[op[1]]
            row = t["rows"].get(op[2])
            col = op[3]
            out.append(row[col - 1] if row and 1 <= col <= t["columns"] else None)
    return out
`

const PY = { create: 6, insert: 8, delete: 20, select: 25, done: 26 }

export function parse(text) {
  const input = JSON.parse(text)
  if (!Array.isArray(input?.ops) || input.ops.length > 20) throw new Error('ops is at most 20 operations.')
  input.ops.forEach(op => {
    if (!Array.isArray(op) || !['create', 'insert', 'delete', 'select'].includes(op[0])) throw new Error('Operations are create, insert, delete or select.')
  })
  return { ops: input.ops }
}

export function build({ ops }) {
  const tables = new Map()
  const frames = []
  const results = []
  const snap = () => [...tables.entries()].map(([name, t]) => ({
    name, columns: t.columns, rows: [...t.rows.entries()].sort((a, b) => a[0] - b[0]).map(([id, row]) => ({ id, row })),
  }))
  ops.forEach((op, index) => {
    const [name, table, third, fourth] = op
    let result = null
    let phase = name, line = 2, pyLine = PY.create
    if (name === 'create') {
      tables.set(table, { columns: third, nextId: 1, rows: new Map() })
    } else if (name === 'insert') {
      line = 3; pyLine = PY.insert
      const t = tables.get(table)
      if (t && third.length === t.columns) {
        result = t.nextId
        t.rows.set(t.nextId, third)
        t.nextId += 1
      }
    } else if (name === 'delete') {
      line = 4; pyLine = PY.delete
      const t = tables.get(table)
      result = !!t && t.rows.delete(third)
    } else {
      line = 5; pyLine = PY.select
      const t = tables.get(table)
      const row = t?.rows.get(third)
      result = row && fourth >= 1 && fourth <= t.columns ? row[fourth - 1] : null
    }
    results.push(result)
    frames.push({ phase, activeLine: line, pythonLine: pyLine, message: `Operation ${index + 1}: ${op.map(v => JSON.stringify(v)).join(' ')}`, op, state: snap(), result })
  })
  frames.push({ phase: 'done', activeLine: 6, pythonLine: PY.done, message: 'All operations processed.', op: null, state: snap(), result: null })
  return { input: { ops }, result: results, frames }
}

const definition = {
  phases: [
    { id: 'create', label: 'Create', description: 'Make an empty table.' },
    { id: 'insert', label: 'Insert', description: 'Add a row under a new id.' },
    { id: 'delete', label: 'Delete', description: 'Remove a row by id.' },
    { id: 'select', label: 'Select', description: 'Read one cell.' },
    { id: 'done', label: 'Result', description: 'All operations processed.' },
  ],
  parse, build, code, python,
  inputLabel: 'Object with ops: [\'create\', name, columns], [\'insert\', name, row], [\'delete\', name, id], [\'select\', name, id, column]',
  url: 'https://leetcode.com/problems/design-sql/',
  complexity: 'Each operation is a dictionary lookup plus a constant amount of work on the row. Row ids are never reused, so deleted ids stay empty.',
  examples: [
    { label: 'Example', input: '{"ops":[["create","Users",2],["insert","Users",["ana","pt"]],["insert","Users",["ben","nz"]],["delete","Users",1],["select","Users",1,1],["select","Users",2,2],["insert","Users",["cy"]]]}' },
  ],
}

export default function DesignSQL() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    {step.state.map(table => <table key={table.name} aria-label={`Table ${table.name}`}>
      <caption>{table.name} ({table.columns} columns)</caption>
      <thead><tr><th>row id</th>{Array.from({ length: table.columns }, (_, c) => <th key={c}>col {c + 1}</th>)}</tr></thead>
      <tbody>{table.rows.map(r => <tr key={r.id}><td>{r.id}</td>{r.row.map((cell, c) => <td key={c}>{cell}</td>)}</tr>)}</tbody>
    </table>)}
    <output aria-label="Operation result">{step.op ? `${JSON.stringify(step.op)} → ${JSON.stringify(step.result)}` : `${run.result.length} operations`}</output>
  </>} renderReasoning={() => <>
    <p>Row ids come from a counter that only moves forward, so a deleted id is never handed out again. Reads check that the row exists and that the column number is in range.</p>
  </>} />
}
