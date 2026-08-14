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
import './MedianEmployeeSalaryVisualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'

const PATTERNS = ['init', 'partition', 'rank', 'bounds', 'test_row', 'keep', 'drop', 'done', 'error']

const LINE_PATTERN_MAP = {
  2: 'init',
  5: 'rank',
  8: 'partition',
  12: 'bounds',
  16: 'test_row',
  17: 'keep',
}

const SOLUTION_CODE = [
  { line: 1, text: '-- Median Employee Salary (MySQL 8+)' },
  { line: 2, text: 'WITH ranked AS (' },
  { line: 3, text: '    SELECT' },
  { line: 4, text: '        e.id,' },
  { line: 5, text: '        e.company,' },
  { line: 6, text: '        e.salary,' },
  { line: 7, text: '        ROW_NUMBER() OVER (' },
  { line: 8, text: '            PARTITION BY e.company' },
  { line: 9, text: '            ORDER BY e.salary, e.id' },
  { line: 10, text: '        ) AS rn,' },
  { line: 11, text: '        COUNT(*) OVER (' },
  { line: 12, text: '            PARTITION BY e.company' },
  { line: 13, text: '        ) AS cnt' },
  { line: 14, text: '    FROM Employee AS e' },
  { line: 15, text: ')' },
  { line: 16, text: 'SELECT id, company, salary' },
  { line: 17, text: 'FROM ranked' },
  { line: 18, text: 'WHERE rn >= cnt / 2' },
  { line: 19, text: '  AND rn <= cnt / 2 + 1' },
  { line: 20, text: 'ORDER BY company, salary;' },
]

/** Parse rows of "id,company,salary" — one per line. */
function parseEmployees(text) {
  const lines = String(text).split('\n').map((l) => l.trim()).filter(Boolean)
  if (!lines.length) throw new Error('Enter at least one row: id,company,salary')
  if (lines.length > 30) throw new Error('Keep the table to 30 rows or fewer')

  return lines.map((line, idx) => {
    const parts = line.split(',').map((p) => p.trim())
    if (parts.length !== 3) throw new Error(`Row ${idx + 1}: expected "id,company,salary"`)
    const id = Number(parts[0])
    const salary = Number(parts[2])
    if (!Number.isFinite(id)) throw new Error(`Row ${idx + 1}: id "${parts[0]}" is not a number`)
    if (!parts[1]) throw new Error(`Row ${idx + 1}: company is empty`)
    if (!Number.isFinite(salary)) throw new Error(`Row ${idx + 1}: salary "${parts[2]}" is not a number`)
    return { id, company: parts[1], salary }
  })
}

/**
 * LC 569 — walk the query the way MySQL evaluates it: partition Employee by
 * company, number rows by ascending salary, then keep the one or two middle
 * row numbers. `rn BETWEEN cnt/2 AND cnt/2 + 1` picks one row for odd counts
 * and both middles for even counts.
 */
function generateSteps(input) {
  const steps = []

  try {
    const rows = parseEmployees(input)

    steps.push({
      phase: 'init',
      activeLine: 14,
      message: `Employee has ${rows.length} row(s). The CTE will number rows within each company.`,
      rows,
      ranked: [],
      output: [],
    })

    // Group by company, preserving first-seen company order.
    const companies = []
    const byCompany = new Map()
    rows.forEach((r) => {
      if (!byCompany.has(r.company)) { byCompany.set(r.company, []); companies.push(r.company) }
      byCompany.get(r.company).push(r)
    })

    const ranked = []
    const output = []

    for (const company of companies) {
      const group = byCompany.get(company)
      const cnt = group.length

      steps.push({
        phase: 'partition',
        activeLine: 8,
        message: `PARTITION BY company = '${company}': ${cnt} row(s) in this partition.`,
        rows,
        ranked: [...ranked],
        output: [...output],
        company,
        cnt,
      })

      // ORDER BY salary, id — id breaks salary ties deterministically.
      const sorted = [...group].sort((a, b) => (a.salary - b.salary) || (a.id - b.id))
      const groupRanked = sorted.map((r, idx) => ({ ...r, rn: idx + 1, cnt }))
      groupRanked.forEach((r) => ranked.push(r))

      steps.push({
        phase: 'rank',
        activeLine: 7,
        message: `ORDER BY salary, id then ROW_NUMBER(): '${company}' salaries become ${groupRanked.map((r) => `${r.salary}(rn=${r.rn})`).join(', ')}.`,
        rows,
        ranked: [...ranked],
        output: [...output],
        company,
        cnt,
        activeCompany: company,
      })

      const lo = cnt / 2
      const hi = cnt / 2 + 1

      steps.push({
        phase: 'bounds',
        activeLine: 18,
        message: `cnt = ${cnt}, so keep rows with rn between ${lo} and ${hi} — that is rn ${groupRanked.filter((r) => r.rn >= lo && r.rn <= hi).map((r) => r.rn).join(' and ') || 'none'}.`,
        rows,
        ranked: [...ranked],
        output: [...output],
        company,
        cnt,
        lo,
        hi,
        activeCompany: company,
      })

      for (const r of groupRanked) {
        const keep = r.rn >= lo && r.rn <= hi

        steps.push({
          phase: keep ? 'keep' : 'drop',
          activeLine: keep ? 17 : 18,
          message: keep
            ? `Row id=${r.id} (rn=${r.rn}) is within [${lo}, ${hi}] — it is a median row for '${company}'.`
            : `Row id=${r.id} (rn=${r.rn}) is outside [${lo}, ${hi}] — filtered out.`,
          rows,
          ranked: [...ranked],
          output: [...output],
          company,
          cnt,
          lo,
          hi,
          activeCompany: company,
          testingId: r.id,
          keptId: keep ? r.id : null,
          droppedId: keep ? null : r.id,
        })

        if (keep) output.push({ id: r.id, company: r.company, salary: r.salary })
      }
    }

    // ORDER BY company, salary on the final projection.
    const finalOutput = [...output].sort(
      (a, b) => a.company.localeCompare(b.company) || (a.salary - b.salary),
    )

    steps.push({
      phase: 'done',
      activeLine: 20,
      message: `ORDER BY company, salary. Result: ${finalOutput.length} median row(s) across ${companies.length} company/companies.`,
      rows,
      ranked: [...ranked],
      output: finalOutput,
      result: finalOutput.length,
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
  '1,A,2341',
  '2,A,341',
  '3,A,15',
  '4,A,15314',
  '5,A,451',
  '6,A,513',
  '7,B,15',
  '8,B,13',
  '9,B,1154',
  '10,B,1345',
  '11,B,1221',
  '12,B,234',
].join('\n')

const EXAMPLES = getExamplesOr('median-employee-salary', [
  { label: 'LeetCode sample', table: DEFAULT_TABLE },
  { label: 'Odd counts', table: '1,A,100\n2,A,200\n3,A,300\n4,B,50\n5,B,60\n6,B,70' },
  { label: 'Single row', table: '1,A,999' },
])

export default function MedianEmployeeSalaryVisualizer() {
  const [tableInput, setTableInput] = useState(DEFAULT_TABLE);
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

  /* ── Panels ───────────────────────────────────────────────── */
  const primaryPanel = (
    <div className="p569-panel-primary">
      <div className="p569-card">
        <div className="p569-section-label">Sample Employee Rows</div>
        <div className="p569-example-row">
          {EXAMPLES.map((ex) => (
            <button
              type="button"
              key={ex.label}
              className={`p569-example-btn ${tableInput === ex.table ? 'active' : ''}`}
              onClick={() => applyExample(ex)}
            >
              {ex.label}
            </button>
          ))}
        </div>
        <p className={`p569-hint ${inputError ? 'error' : ''}`} style={inputError ? { color: 'var(--error, #f87171)' } : undefined}>
          {inputError || 'Pick a sample table. Each row is id, company, salary.'}
        </p>
      </div>

      <div className="p569-card">
        <div className="p569-section-label">Input — Employee</div>
        <div className="p569-table-wrap">
          <table className="p569-table">
            <thead>
              <tr><th>id</th><th>company</th><th>salary</th></tr>
            </thead>
            <tbody>
              {(step?.rows ?? []).map((r) => (
                <tr
                  key={r.id}
                  className={
                    step?.activeCompany && r.company === step.activeCompany ? 'band active' : 'dim'
                  }
                >
                  <td>{r.id}</td>
                  <td>{r.company}</td>
                  <td>{r.salary}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="p569-hint">Highlighted rows are the partition the query is currently inside.</p>
      </div>

      <div className="p569-card">
        <div className="p569-section-label">CTE `ranked` (ROW_NUMBER + COUNT per company)</div>
        {step?.ranked?.length ? (
          <div className="p569-table-wrap">
            <table className="p569-table">
              <thead>
                <tr><th>id</th><th>company</th><th>salary</th><th>rn</th><th>cnt</th><th>median?</th></tr>
              </thead>
              <tbody>
                {step.ranked.map((r) => {
                  const isTesting = step.testingId === r.id
                  const inWindow = step.lo != null
                    && r.company === step.activeCompany
                    && r.rn >= step.lo && r.rn <= step.hi
                  const cls = isTesting
                    ? (step.keptId === r.id ? 'kept' : step.droppedId === r.id ? 'dropped' : 'active')
                    : inWindow ? 'kept' : ''
                  return (
                    <tr key={`${r.company}-${r.id}`} className={cls}>
                      <td>{r.id}</td>
                      <td>{r.company}</td>
                      <td>{r.salary}</td>
                      <td>{r.rn}</td>
                      <td>{r.cnt}</td>
                      <td>
                        {inWindow
                          ? <span className="p569-badge keep">keep</span>
                          : step.lo != null && r.company === step.activeCompany
                            ? <span className="p569-badge drop">drop</span>
                            : <span className="p569-badge">—</span>}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p569-empty">The CTE has not been populated yet.</div>
        )}
      </div>

      <div className="p569-card">
        <div className="p569-section-label">Output Rows</div>
        {step?.output?.length ? (
          <div className="p569-table-wrap">
            <table className="p569-table">
              <thead>
                <tr><th>id</th><th>company</th><th>salary</th></tr>
              </thead>
              <tbody>
                {step.output.map((r) => (
                  <tr key={`out-${r.id}`} className="kept">
                    <td>{r.id}</td>
                    <td>{r.company}</td>
                    <td>{r.salary}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p569-empty">No rows emitted yet.</div>
        )}
      </div>
    </div>
  
    </>)

  const statePanel = (
    <div className="p569-panel-state">
      <div className="p569-card">
        <div className="p569-section-label">Current Partition</div>
        <div className="p569-stat-grid">
          <div className="p569-stat highlight"><span className="p569-stat-key">company</span><span className="p569-stat-val">{step?.company ?? '—'}</span></div>
          <div className="p569-stat"><span className="p569-stat-key">cnt</span><span className="p569-stat-val">{step?.cnt ?? '—'}</span></div>
          <div className="p569-stat"><span className="p569-stat-key">rn ≥</span><span className="p569-stat-val">{step?.lo ?? '—'}</span></div>
          <div className="p569-stat"><span className="p569-stat-key">rn ≤</span><span className="p569-stat-val">{step?.hi ?? '—'}</span></div>
        </div>
      </div>

      <div className="p569-card">
        <div className="p569-section-label">Totals</div>
        <div className="p569-stat-grid">
          <div className="p569-stat"><span className="p569-stat-key">input rows</span><span className="p569-stat-val">{step?.rows?.length ?? 0}</span></div>
          <div className="p569-stat"><span className="p569-stat-key">ranked rows</span><span className="p569-stat-val">{step?.ranked?.length ?? 0}</span></div>
          <div className="p569-stat highlight"><span className="p569-stat-key">output rows</span><span className="p569-stat-val">{step?.output?.length ?? 0}</span></div>
        </div>
      </div>

      <div className="p569-card">
        <div className="p569-section-label">Why cnt/2 … cnt/2+1</div>
        <p className="p569-hint" style={{ marginTop: 0 }}>
          For an odd cnt (say 5) the window is [2.5, 3.5], so only rn = 3 qualifies — the single
          middle salary. For an even cnt (say 6) it is [3, 4], catching both middle rows, which is
          what LeetCode expects for this problem.
        </p>
      </div>
    </div>
  )

  const codePanel = (
    <div className="p569-panel-code">
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
    <div className="p569-panel-status">
      <div className={`p569-status ${step?.phase === 'done' ? 'done' : step?.error ? 'error' : ''}`}>
        {step?.message ?? 'Press Play or Step to begin.'}
      </div>
    </div>
  )

  const playbackPanel = (
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
    <div className="p569-shell">
      <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
      {panelDivs && (
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
