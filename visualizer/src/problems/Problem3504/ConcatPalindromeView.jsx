const ROLE = {
  outer: { color: 'var(--primary)', label: 'run' },
  core: { color: 'var(--success)', label: 'core' },
  span: { color: 'var(--success)', label: '' },
  blocked: { color: 'var(--error)', label: '' },
}

function Lane({ name, text, roles = {}, values, valuesName, marks = {} }) {
  const size = 34
  return <div style={{ display: 'grid', gridTemplateColumns: '52px 1fr', alignItems: 'center', gap: 4 }}>
    <code style={{ color: 'var(--text)', fontWeight: 700 }}>{name}</code>
    <div style={{ display: 'flex', gap: 2 }}>
      {[...text].map((char, index) => {
        const role = ROLE[roles[index]]
        return <div key={index} data-lane={name} data-index={index} data-role={roles[index] ?? ''} style={{ width: size, textAlign: 'center', color: 'var(--text)' }}>
          <small style={{ display: 'block', color: 'var(--text-muted)', fontSize: 10 }}>{index}</small>
          <div style={{ height: size, lineHeight: `${size - 4}px`, boxSizing: 'border-box', borderRadius: 5, fontWeight: 700, border: `2px solid ${role ? role.color : 'var(--border)'}`, background: role ? `color-mix(in srgb, ${role.color} 20%, var(--surface))` : 'var(--surface)' }}>{char}</div>
          <small style={{ display: 'block', minHeight: 14, fontSize: 10, fontWeight: 700, color: 'var(--text)' }}>{marks[index] ?? ' '}</small>
          {values && <small data-g={values[index]} style={{ display: 'block', fontSize: 11, color: values[index] > 0 ? 'var(--text)' : 'var(--text-muted)' }}>{values[index]}</small>}
        </div>
      })}
      {values && <small style={{ alignSelf: 'flex-end', marginLeft: 4, color: 'var(--text-muted)', fontSize: 11 }}>← {valuesName}</small>}
    </div>
  </div>
}

function rangeRoles(from, to, role, into = {}) {
  for (let k = from; k < to; k++) into[k] = role
  return into
}

// Which letters of s, r and t take part in what this frame is doing.
function rolesFor(step, run) {
  const roles = { s: {}, r: {}, t: {} }
  const marks = { s: {}, r: {} }
  if (step.which) {
    const role = step.blocked ? 'blocked' : 'span'
    rangeRoles(step.left, step.right + 1, 'span', roles[step.which])
    if (step.blocked) { roles[step.which][step.left] = role; roles[step.which][step.right] = role }
    marks[step.which][step.left] = 'left'
    marks[step.which][step.right] = step.left === step.right ? 'left, right' : 'right'
  }
  if (step.cell && step.run) {
    const [i, j] = step.cell
    rangeRoles(i - step.run, i, 'outer', roles.s)
    rangeRoles(j - step.run, j, 'outer', roles.r)
    if (step.candidate) {
      const { core, coreIn } = step.candidate
      if (coreIn === 's') rangeRoles(i, i + core, 'core', roles.s)
      else rangeRoles(j, j + core, 'core', roles.r)
    }
  } else if (step.cell) {
    const [i, j] = step.cell
    roles.s[i - 1] = 'blocked'
    roles.r[j - 1] = 'blocked'
    if (run.input.s[i - 1] === run.input.r[j - 1]) { roles.s[i - 1] = 'outer'; roles.r[j - 1] = 'outer' }
  }
  const m = run.input.r.length
  for (const [index, role] of Object.entries(roles.r)) roles.t[m - 1 - Number(index)] = role
  return { roles, marks }
}

function MatchTable({ step, run }) {
  const { s, r } = run.input
  const size = 30
  const [ci, cj] = step.cell ?? [-1, -1]
  const onRun = (i, j) => step.cell && step.run && i - j === ci - cj && i <= ci && i > ci - step.run
  const head = { width: size, height: size, lineHeight: `${size}px`, textAlign: 'center', fontWeight: 700, color: 'var(--text)', fontSize: 13 }
  return <div style={{ overflowX: 'auto' }}>
    <div role="grid" aria-label="Matched run length f" style={{ display: 'grid', gridTemplateColumns: `repeat(${r.length + 2}, ${size}px)`, gap: 2, width: 'max-content' }}>
      <div style={{ ...head, fontSize: 11, color: 'var(--text-muted)' }}>s\r</div>
      <div style={head} />
      {[...r].map((char, j) => <div key={j} style={{ ...head, color: j + 1 === cj ? 'var(--primary)' : 'var(--text)' }}>{char}</div>)}
      {step.f.map((row, i) => [
        <div key={`h${i}`} style={{ ...head, color: i === ci ? 'var(--primary)' : 'var(--text)' }}>{i > 0 ? s[i - 1] : ''}</div>,
        ...row.map((value, j) => {
          const current = i === ci && j === cj
          const previous = !!step.cell && step.phase === 'match' && i === ci - 1 && j === cj - 1
          const run_ = onRun(i, j)
          const border = i === 0 || j === 0
          const accent = current ? 'var(--primary)' : previous ? 'var(--warning)' : run_ ? 'var(--primary)' : null
          return <div key={`${i}:${j}`} data-row={i} data-column={j} aria-current={current ? 'step' : undefined} style={{ ...head, fontWeight: value > 0 || current ? 700 : 400, lineHeight: `${size - 2}px`, boxSizing: 'border-box', borderRadius: 4, border: `${accent ? 2 : 1}px solid ${accent ?? 'var(--border)'}`, background: run_ ? 'color-mix(in srgb, var(--primary) 20%, var(--surface))' : value > 0 ? 'var(--surface3)' : border ? 'transparent' : 'var(--surface)', color: value > 0 ? 'var(--text)' : 'var(--text-muted)' }}>{value ?? ''}</div>
        }),
      ])}
    </div>
  </div>
}

// The palindrome itself: the part cut from s, then the part cut from t, coloured by what mirrors what.
function Assembly({ a, b, outer, title, note }) {
  const letters = [...`${a}${b}`]
  const total = letters.length
  const colorAt = index => (index < outer || index >= total - outer ? 'var(--primary)' : 'var(--success)')
  return <div>
    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{title}</div>
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2, marginTop: 2 }}>
      {letters.map((char, index) => <span key={index} style={{ display: 'flex', alignItems: 'center' }}>
        {index === a.length && index > 0 && <span aria-label="s piece ends, t piece starts" style={{ alignSelf: 'stretch', borderLeft: '2px dashed var(--text-muted)', margin: '0 4px' }} />}
        <span style={{ width: 26, height: 28, lineHeight: '24px', textAlign: 'center', boxSizing: 'border-box', fontWeight: 700, color: 'var(--text)', borderRadius: 4, border: `2px solid ${colorAt(index)}`, background: `color-mix(in srgb, ${colorAt(index)} 18%, var(--surface))` }}>{char}</span>
      </span>)}
      <strong style={{ marginLeft: 8, color: 'var(--text)' }}>{note}</strong>
    </div>
  </div>
}

export default function ConcatPalindromeView({ run, step }) {
  const { s, t, r } = run.input
  const { roles, marks } = rolesFor(step, run)
  const candidate = step.candidate
  return <section aria-label="Palindrome from a piece of s and a piece of t" style={{ display: 'grid', gap: 10, color: 'var(--text)', fontSize: 13 }}>
    <div style={{ display: 'grid', gap: 6, overflowX: 'auto' }}>
      <Lane name="s" text={s} roles={roles.s} marks={marks.s} values={step.g1} valuesName="g1: longest palindrome starting here" />
      <Lane name="t" text={t} roles={roles.t} />
      <Lane name="r" text={r} roles={roles.r} marks={marks.r} values={step.g2} valuesName="g2: longest palindrome starting here" />
    </div>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'flex-start' }}>
      <MatchTable step={step} run={run} />
      <div style={{ flex: '1 1 240px', display: 'grid', gap: 10, minWidth: 0 }}>
        {candidate && <Assembly title="This candidate" a={candidate.a} b={candidate.b} outer={candidate.run} note={`2 × ${candidate.run} + ${candidate.core} = ${candidate.value}`} />}
        {step.best && <Assembly title="Best so far" a={step.best.a} b={step.best.b} outer={step.best.outer} note={`length ${step.best.length}`} />}
        <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)' }}>Purple letters are a run and its mirror. Green letters are the palindromic core between them. The dashed line is where the s piece meets the t piece.</p>
      </div>
    </div>
  </section>
}
