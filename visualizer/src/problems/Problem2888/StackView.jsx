import RecordStateTable from '../../components/shared/RecordStateTable'

const COLORS = { df1: 'var(--primary)', df2: 'var(--success)' }

function sourceRows(rows, name, step, copied) {
  return rows.map((row, i) => ({ ...row, status: i < copied ? 'copied' : step.source === name && step.sourceIndex === i ? 'copying' : 'waiting' }))
}

// Source tables on the left, the growing result on the right, and a stack strip showing where each row landed.
export default function StackView({ run, step }) {
  const { df1, df2 } = run.input
  const copied = name => step.out.filter(r => r.from.startsWith(name)).length
  const total = df1.length + df2.length
  const columns = ['student_id', 'name', 'age', 'status']
  return <section aria-label="Stacking two DataFrames" style={{ display: 'flex', flexDirection: 'column', gap: 12, color: 'var(--text)' }}>
    <div aria-label="Stack strip" style={{ display: 'flex', gap: 3, flexWrap: 'wrap', alignItems: 'center' }}>
      <strong style={{ marginRight: 6 }}>Result rows</strong>
      {Array.from({ length: total }, (_, i) => {
        const row = step.out[i]
        const name = row?.from.split(' ')[0]
        return <span key={i} data-slot={i} style={{
          minWidth: 30, textAlign: 'center', padding: '3px 4px', borderRadius: 4, fontSize: 12,
          border: `2px ${row ? 'solid' : 'dashed'} ${row ? COLORS[name] : 'var(--border)'}`,
          background: row ? 'var(--surface2)' : 'transparent', fontWeight: i === step.out.length - 1 ? 700 : 400,
        }}>{i}</span>
      })}
      {total === 0 && <em>no rows at all</em>}
    </div>
    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-start' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: '1 1 260px', minWidth: 0 }}>
        <div style={{ borderLeft: `4px solid ${COLORS.df1}`, paddingLeft: 8 }}>
          <RecordStateTable label="df1 (goes on top)" columns={columns} rows={sourceRows(df1, 'df1', step, copied('df1') - (step.source === 'df1' && step.sourceIndex >= 0 ? 1 : 0))} activeRow={step.source === 'df1' ? step.sourceIndex : -1} />
        </div>
        <div style={{ borderLeft: `4px solid ${COLORS.df2}`, paddingLeft: 8 }}>
          <RecordStateTable label="df2 (goes underneath)" columns={columns} rows={sourceRows(df2, 'df2', step, copied('df2') - (step.source === 'df2' && step.sourceIndex >= 0 ? 1 : 0))} activeRow={step.source === 'df2' ? step.sourceIndex : -1} />
        </div>
      </div>
      <div style={{ flex: '1 1 300px', minWidth: 0 }}>
        <RecordStateTable label={`result (${step.out.length} of ${total} rows)`} columns={['index', 'student_id', 'name', 'age', 'from']} rows={step.out}
          activeRow={step.sourceIndex >= 0 ? step.out.length - 1 : -1} />
      </div>
    </div>
  </section>
}
