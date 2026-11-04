import { monthLengths } from './algorithm.js'

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const WEEK = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
const tint = { start: 'var(--surface3)', next: 'var(--success-glow)', ghost: 'var(--error-glow)' }

function weekdayOfFirst(year, month) {
  const date = new Date(Date.UTC(2000, 0, 1))
  date.setUTCFullYear(year, month - 1, 1)
  return date.getUTCDay()
}

function Field({ label, value, width, changed }) {
  return <div style={{ textAlign: 'center' }}>
    <small style={{ color: 'var(--text-muted)' }}>{label}</small>
    <div data-field={label} data-changed={changed || undefined} style={{ fontSize: 26, fontWeight: 700, fontFamily: 'var(--font-mono, monospace)', padding: '4px 10px', borderRadius: 8, color: 'var(--text)', background: changed ? 'var(--warning-glow)' : 'var(--surface2)', border: `2px solid ${changed ? 'var(--warning)' : 'var(--border)'}` }}>
      {String(value).padStart(width, '0')}
    </div>
  </div>
}

// One month as a calendar. The ghost cell is the day that does not exist.
function Calendar({ year, month, marks, ghost }) {
  const length = monthLengths(year)[month - 1]
  const lead = weekdayOfFirst(year, month)
  const cell = { minWidth: 30, height: 30, display: 'grid', placeItems: 'center', borderRadius: 6, fontSize: 13, color: 'var(--text)' }
  return <figure style={{ margin: 0 }}>
    <figcaption style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>{MONTHS[month - 1]} {String(year).padStart(4, '0')}</figcaption>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 30px)', gap: 3 }}>
      {WEEK.map((day, index) => <small key={index} style={{ ...cell, height: 18, color: 'var(--text-muted)' }}>{day}</small>)}
      {Array.from({ length: lead }, (_, index) => <span key={`lead-${index}`} />)}
      {Array.from({ length }, (_, index) => {
        const day = index + 1
        const mark = marks[day]
        return <div key={day} data-day={day} data-mark={mark} style={{ ...cell, background: mark ? tint[mark] : 'var(--surface2)', border: `2px solid ${mark === 'next' ? 'var(--success)' : mark === 'start' ? 'var(--text-muted)' : 'transparent'}`, fontWeight: mark ? 700 : 400 }}>{day}</div>
      })}
      {ghost && <div data-day={ghost} data-mark="ghost" title="This day does not exist" style={{ ...cell, background: tint.ghost, border: '2px dashed var(--error)', textDecoration: 'line-through', fontWeight: 700 }}>{ghost}</div>}
    </div>
  </figure>
}

// Three connected views: the fields that carry, the leap-year test behind month length, and the calendar itself.
export default function NextDayView({ run, step }) {
  const [startYear, startMonth, startDay] = run.input.date.split('-').map(Number)
  const { year, month, day, carried, tests, leap, last } = step
  const moved = month !== startMonth || year !== startYear
  const ghost = !moved && day > (last ?? Infinity) ? day : null
  const marks = { [startDay]: 'start' }
  if (!moved && !ghost && !step.overflow && day !== startDay) marks[day] = 'next'
  return <section aria-label="Next day" style={{ display: 'grid', gap: 16, color: 'var(--text)' }}>
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, flexWrap: 'wrap' }}>
        <Field label="year" value={year} width={4} changed={carried === 'year'} />
        <strong style={{ paddingBottom: 10 }}>-</strong>
        <Field label="month" value={month} width={2} changed={carried === 'month'} />
        <strong style={{ paddingBottom: 10 }}>-</strong>
        <Field label="day" value={day} width={2} changed={carried === 'day' || step.phase === 'add'} />
      </div>
      {step.overflow === true && <p style={{ margin: '6px 0 0', color: 'var(--text-muted)' }}>Carries run right to left, like an odometer: day into month, month into year.</p>}
    </div>

    {tests && <div aria-label="Leap year test" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
      {tests.map(test => <span key={test.divisor} data-divisor={test.divisor} data-passes={test.passes} style={{ padding: '4px 10px', borderRadius: 999, color: 'var(--text)', background: test.passes ? 'var(--success-glow)' : 'var(--surface2)', border: `1px solid ${test.passes ? 'var(--success)' : 'var(--border)'}` }}>
        {startYear} ÷ {test.divisor}: {test.passes ? 'whole' : 'not whole'}
      </span>)}
      <strong data-leap={leap}>{leap ? 'Leap year: February has 29 days' : 'Not a leap year: February has 28 days'}</strong>
    </div>}

    <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>
      <Calendar year={startYear} month={startMonth} marks={marks} ghost={ghost} />
      {moved && <Calendar year={year} month={month} marks={{ 1: 'next' }} />}
    </div>

    <dl style={{ display: 'flex', gap: 20, flexWrap: 'wrap', margin: 0 }}>
      <div><dt style={{ color: 'var(--text-muted)' }}>original date</dt><dd style={{ margin: 0, fontWeight: 600 }}>{run.input.date} (never changes)</dd></div>
      <div><dt style={{ color: 'var(--text-muted)' }}>last day of the month</dt><dd style={{ margin: 0, fontWeight: 600 }}>{last ?? 'not known yet'}</dd></div>
      <div><dt style={{ color: 'var(--text-muted)' }}>returned</dt><dd style={{ margin: 0, fontWeight: 600 }}>{step.result ?? 'nothing yet'}</dd></div>
    </dl>
  </section>
}
