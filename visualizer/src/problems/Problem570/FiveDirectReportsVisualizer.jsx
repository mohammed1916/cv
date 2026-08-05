import { useState, useMemo, useCallback } from 'react'
import { createPortal } from 'react-dom'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'

import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamplesOr } from '../../config/examplesRegistry'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import './FiveDirectReportsVisualizer.css'

const THRESHOLD = 5

const PATTERNS = ['init', 'scan', 'group', 'having_pass', 'having_fail', 'join', 'done', 'error']

const LINE_PATTERN_MAP = {
  2: 'init',
  4: 'join',
  6: 'scan',
  7: 'group',
  8: 'having_pass',
}

const SOLUTION_CODE = [
  { line: 1, text: '-- Managers with at Least 5 Direct Reports (MySQL)' },
  { line: 2, text: 'SELECT m.name' },
  { line: 3, text: 'FROM Employee AS e' },
  { line: 4, text: 'JOIN Employee AS m' },
  { line: 5, text: '    ON e.managerId = m.id' },
  { line: 6, text: 'GROUP BY e.managerId, m.name' },
  { line: 7, text: 'HAVING COUNT(*) >= 5;' },
]

/** Parse rows of "id,name,managerId" — managerId may be null. */
function parseEmployees(text) {
  const lines = String(text).split('\n').map((l) => l.trim()).filter(Boolean)
  if (!lines.length) throw new Error('Enter at least one row: id,name,managerId')
  if (lines.length > 40) throw new Error('Keep the table to 40 rows or fewer')

  const rows = lines.map((line, idx) => {
    const parts = line.split(',').map((p) => p.trim())
    if (parts.length !== 3) throw new Error(`Row ${idx + 1}: expected "id,name,managerId"`)
    const id = Number(parts[0])
    if (!Number.isFinite(id)) throw new Error(`Row ${idx + 1}: id "${parts[0]}" is not a number`)
    if (!parts[1]) throw new Error(`Row ${idx + 1}: name is empty`)
    const raw = parts[2].toLowerCase()
    let managerId = null
    if (raw !== 'null' && raw !== '' && raw !== 'none') {
      managerId = Number(parts[2])
      if (!Number.isFinite(managerId)) throw new Error(`Row ${idx + 1}: managerId "${parts[2]}" is not a number or null`)
    }
    return { id, name: parts[1], managerId }
  })

  const ids = new Set(rows.map((r) => r.id))
  if (ids.size !== rows.length) throw new Error('Employee ids must be unique')

  return rows
}

/**
 * LC 570 — self-join Employee to itself on e.managerId = m.id, group by manager,
 * and keep groups whose COUNT(*) reaches 5. Rows with a NULL managerId, or a
 * managerId that matches no employee, drop out at the JOIN.
 */
function generateSteps(input) {
  const steps = []

  try {
    const rows = parseEmployees(input)
    const byId = new Map(rows.map((r) => [r.id, r]))

    steps.push({
      phase: 'init',
      activeLine: 3,
      message: `Employee has ${rows.length} row(s). Self-join it as e (report) and m (manager).`,
      rows,
      joined: [],
      groups: [],
      output: [],
    })

    // JOIN: each employee with a resolvable managerId contributes one row.
    const joined = []
    const unmatched = []
    rows.forEach((r) => {
      if (r.managerId != null && byId.has(r.managerId)) {
        joined.push({
          empId: r.id,
          empName: r.name,
          managerId: r.managerId,
          managerName: byId.get(r.managerId).name,
        })
      } else {
        unmatched.push(r)
      }
    })

    steps.push({
      phase: 'join',
      activeLine: 5,
      message: `ON e.managerId = m.id keeps ${joined.length} row(s); ${unmatched.length} row(s) drop out (NULL or unknown managerId).`,
      rows,
      joined: [...joined],
      groups: [],
      output: [],
      unmatchedIds: unmatched.map((r) => r.id),
    })

    // GROUP BY manager, in first-seen order.
    const order = []
    const counts = new Map()
    joined.forEach((j) => {
      if (!counts.has(j.managerId)) { counts.set(j.managerId, []); order.push(j.managerId) }
      counts.get(j.managerId).push(j)
    })

    const groups = order.map((mid) => ({
      managerId: mid,
      managerName: byId.get(mid).name,
      reports: counts.get(mid).map((j) => j.empName),
      count: counts.get(mid).length,
    }))

    steps.push({
      phase: 'group',
      activeLine: 6,
      message: `GROUP BY e.managerId, m.name produces ${groups.length} group(s).`,
      rows,
      joined: [...joined],
      groups,
      output: [],
    })

    const output = []

    for (const g of groups) {
      const pass = g.count >= THRESHOLD

      steps.push({
        phase: pass ? 'having_pass' : 'having_fail',
        activeLine: 7,
        message: pass
          ? `${g.managerName} (id=${g.managerId}) has COUNT(*) = ${g.count} >= 5 — kept.`
          : `${g.managerName} (id=${g.managerId}) has COUNT(*) = ${g.count} < 5 — filtered out by HAVING.`,
        rows,
        joined: [...joined],
        groups,
        output: [...output],
        activeManagerId: g.managerId,
        passed: pass,
      })

      if (pass) output.push({ name: g.managerName })
    }

    steps.push({
      phase: 'done',
      activeLine: 2,
      message: output.length
        ? `Result: ${output.map((r) => r.name).join(', ')}.`
        : 'Result: no manager has 5 or more direct reports — empty result set.',
      rows,
      joined: [...joined],
      groups,
      output,
      result: output.length,
    })
  } catch (e) {
    steps.push({
      phase: 'error',
      activeLine: 1,
      message: `Error: ${e.message}`,
      error: true,
    })
  }

  return steps
}

const DEFAULT_TABLE = [
  '101,John,null',
  '102,Dan,101',
  '103,James,101',
  '104,Amy,101',
  '105,Anne,101',
  '106,Ron,101',
].join('\n')

const EXAMPLES = getExamplesOr('managers-with-at-least-5-direct-reports', [
  { label: 'LeetCode sample', table: DEFAULT_TABLE },
  {
    label: 'Two managers',
    table: [
      '1,Boss,null',
      '2,Ann,1', '3,Ben,1', '4,Cal,1', '5,Dee,1', '6,Eve,1',
      '7,Mid,1',
      '8,Fay,7', '9,Gus,7', '10,Hal,7',
    ].join('\n'),
  },
  {
    label: 'Nobody qualifies',
    table: '1,Boss,null\n2,Ann,1\n3,Ben,1\n4,Cal,1',
  },
])

export default function FiveDirectReportsVisualizer() {
  const [tableInput, setTableInput] = useState(DEFAULT_TABLE)
  const [panelDivs, setPanelDivs] = useState(null)

  const inputError = useMemo(() => {
    try {
      parseEmployees(tableInput)
      return ''
    } catch (e) {
      return e.message
    }
  }, [tableInput])

  const steps = useMemo(
    () => generateSteps(tableInput).map((current) => ({
      ...current,
      relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
    })),
    [tableInput],
  )

  const {
    stepIndex, setStepIndex, stepForward, stepBack, togglePlay,
    handleReset, isPlaying, speed, setSpeed, isDone,
  } = usePlaybackState(steps.length)

  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const applyExample = useCallback((ex) => {
    setTableInput(ex.table)
    handleReset()
  }, [handleReset])

  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })

  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  // Scale the count bars so the 5-report threshold always sits at a sane spot.
  const maxCount = useMemo(() => {
    const counts = (step?.groups ?? []).map((g) => g.count)
    return Math.max(THRESHOLD + 1, ...counts, 1)
  }, [step])

  /* ── Panels ───────────────────────────────────────────────── */
  const primaryPanel = (
    <div className="p570-panel-primary">
      <div className="p570-card">
        <div className="p570-section-label">Sample Employee Rows</div>
        <div className="p570-example-row">
          {EXAMPLES.map((ex) => (
            <button
              type="button"
              key={ex.label}
              className={`p570-example-btn ${tableInput === ex.table ? 'active' : ''}`}
              onClick={() => applyExample(ex)}
            >
              {ex.label}
            </button>
          ))}
        </div>
        <p className={`p570-hint ${inputError ? 'error' : ''}`}>
          {inputError || 'Each row is id, name, managerId (use null for the top of the org).'}
        </p>
      </div>

      <div className="p570-card">
        <div className="p570-section-label">Input — Employee</div>
        <div className="p570-table-wrap">
          <table className="p570-table">
            <thead>
              <tr><th>id</th><th>name</th><th>managerId</th></tr>
            </thead>
            <tbody>
              {(step?.rows ?? []).map((r) => {
                const unmatched = step?.unmatchedIds?.includes(r.id)
                const inGroup = step?.activeManagerId != null && r.managerId === step.activeManagerId
                const cls = unmatched ? 'dropped' : inGroup ? 'grouped' : 'dim'
                return (
                  <tr key={r.id} className={cls}>
                    <td>{r.id}</td>
                    <td>{r.name}</td>
                    <td>{r.managerId ?? 'NULL'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="p570-card">
        <div className="p570-section-label">After JOIN (e ⋈ m ON e.managerId = m.id)</div>
        {step?.joined?.length ? (
          <div className="p570-table-wrap">
            <table className="p570-table">
              <thead>
                <tr><th>e.id</th><th>e.name</th><th>m.id</th><th>m.name</th></tr>
              </thead>
              <tbody>
                {step.joined.map((j) => (
                  <tr
                    key={`${j.empId}-${j.managerId}`}
                    className={step.activeManagerId === j.managerId ? 'grouped' : 'dim'}
                  >
                    <td>{j.empId}</td>
                    <td>{j.empName}</td>
                    <td>{j.managerId}</td>
                    <td>{j.managerName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p570-empty">The join has not been evaluated yet.</div>
        )}
      </div>

      <div className="p570-card">
        <div className="p570-section-label">Groups &amp; HAVING COUNT(*) &gt;= 5</div>
        {step?.groups?.length ? (
          <div className="p570-bars">
            {step.groups.map((g) => {
              const pass = g.count >= THRESHOLD
              return (
                <div key={g.managerId} className="p570-bar-row">
                  <span style={step.activeManagerId === g.managerId ? { color: 'var(--text)' } : undefined}>
                    {g.managerName} ({g.managerId})
                  </span>
                  <span className="p570-bar-track">
                    <span
                      className={`p570-bar-fill ${pass ? 'pass' : ''}`}
                      style={{ width: `${(g.count / maxCount) * 100}%` }}
                    />
                    <span
                      className="p570-bar-threshold"
                      style={{ left: `${(THRESHOLD / maxCount) * 100}%` }}
                    />
                  </span>
                  <span className="p570-bar-count">{g.count}</span>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="p570-empty">No groups formed yet.</div>
        )}
        <p className="p570-hint">The vertical tick marks the threshold of 5 direct reports.</p>
      </div>

      <div className="p570-card">
        <div className="p570-section-label">Output Rows</div>
        {step?.output?.length ? (
          <div className="p570-table-wrap">
            <table className="p570-table">
              <thead><tr><th>name</th></tr></thead>
              <tbody>
                {step.output.map((r) => (
                  <tr key={r.name} className="kept"><td>{r.name}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p570-empty">No rows emitted yet.</div>
        )}
      </div>
    </div>
  )

  const statePanel = (
    <div className="p570-panel-state">
      <div className="p570-card">
        <div className="p570-section-label">Current Group</div>
        <div className="p570-stat-grid">
          <div className="p570-stat highlight">
            <span className="p570-stat-key">managerId</span>
            <span className="p570-stat-val">{step?.activeManagerId ?? '—'}</span>
          </div>
          <div className="p570-stat">
            <span className="p570-stat-key">COUNT(*)</span>
            <span className="p570-stat-val">
              {step?.groups?.find((g) => g.managerId === step?.activeManagerId)?.count ?? '—'}
            </span>
          </div>
          <div className="p570-stat">
            <span className="p570-stat-key">HAVING</span>
            <span className="p570-stat-val">
              {step?.passed == null ? '—' : step.passed ? 'pass' : 'fail'}
            </span>
          </div>
        </div>
      </div>

      <div className="p570-card">
        <div className="p570-section-label">Group Detail</div>
        {step?.groups?.length ? (
          <div className="p570-table-wrap">
            <table className="p570-table">
              <thead>
                <tr><th>manager</th><th>reports</th><th>count</th><th>having</th></tr>
              </thead>
              <tbody>
                {step.groups.map((g) => {
                  const pass = g.count >= THRESHOLD
                  return (
                    <tr key={g.managerId} className={step.activeManagerId === g.managerId ? 'grouped' : ''}>
                      <td>{g.managerName}</td>
                      <td>{g.reports.join(', ')}</td>
                      <td>{g.count}</td>
                      <td>
                        <span className={`p570-badge ${pass ? 'keep' : 'drop'}`}>
                          {pass ? 'keep' : 'drop'}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p570-empty">Nothing grouped yet.</div>
        )}
      </div>

      <div className="p570-card">
        <div className="p570-section-label">Totals</div>
        <div className="p570-stat-grid">
          <div className="p570-stat"><span className="p570-stat-key">input rows</span><span className="p570-stat-val">{step?.rows?.length ?? 0}</span></div>
          <div className="p570-stat"><span className="p570-stat-key">joined rows</span><span className="p570-stat-val">{step?.joined?.length ?? 0}</span></div>
          <div className="p570-stat"><span className="p570-stat-key">groups</span><span className="p570-stat-val">{step?.groups?.length ?? 0}</span></div>
          <div className="p570-stat highlight"><span className="p570-stat-key">output rows</span><span className="p570-stat-val">{step?.output?.length ?? 0}</span></div>
        </div>
      </div>
    </div>
  )

  const codePanel = (
    <div className="p570-panel-code">
      <CodeTracePanel
        step={step}
        codeLines={SOLUTION_CODE}
        highlightedLines={connectivity.highlightedLines}
        onLineSelect={connectivity.handleLineSelect}
        onActiveLineDomChange={setActiveLineDom}
      />
      {showPatternOverlay && (
        <CodePatternAnnotations
          linePatterns={LINE_PATTERN_MAP}
          currentPhase={step?.phase}
          activeLineDom={activeLineDom}
          activeLine={step?.activeLine}
        />
      )}
    </div>
  )

  const statusPanel = (
    <div className="p570-panel-status">
      <div className={`p570-status ${step?.phase === 'done' ? 'done' : step?.error ? 'error' : ''}`}>
        {step?.message ?? 'Press Play or Step to begin.'}
      </div>
    </div>
  )

  const playbackPanel = (
    <>
      {showPatternOverlay && (
        <PatternLegend currentPhase={step?.phase} usedPatterns={PATTERNS} />
      )}
      <PlaybackControls
        isPlaying={isPlaying}
        isDone={isDone}
        speed={speed}
        onPlayToggle={togglePlay}
        onPrev={stepBack}
        onNext={stepForward}
        onReset={handleReset}
        prevDisabled={stepIndex < 0}
        nextDisabled={isDone}
        resetDisabled={stepIndex < 0}
        onSpeedChange={(e) => setSpeed(Number(e.target.value))}
        showPatternOverlay={showPatternOverlay}
        onShowPatternOverlayChange={setShowPatternOverlay}
        patternOverlayLabel="Show pattern overlay"
        showPatternOverlayToggle
      />
    </>
  )

  const panelConfigs = useMemo(
    () => [
      { id: 'primary', title: 'Visualization', dockMode: 'split-right' },
      { id: 'state',   title: 'State',         dockMode: 'split-right' },
      { id: 'code',    title: 'Code',          dockMode: 'split-bottom' },
      { id: 'status',  title: 'Status',        dockMode: 'split-bottom', ratio: 0.08 },
    ],
    []
  )

  return (
    <div className="p570-shell">
      <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
      {panelDivs && (
        <>
          {panelDivs.primary && createPortal(primaryPanel, panelDivs.primary)}
          {panelDivs.state   && createPortal(statePanel,   panelDivs.state)}
          {panelDivs.code    && createPortal(codePanel,    panelDivs.code)}
          {panelDivs.status  && createPortal(statusPanel,  panelDivs.status)}
        </>
      )}
      {createPortal(
        <FloatingPanel title="Playback Controls">{playbackPanel}</FloatingPanel>,
        document.body
      )}
    </div>
  )
}
