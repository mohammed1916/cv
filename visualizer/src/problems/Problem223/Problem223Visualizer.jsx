import { useState, useMemo, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
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
import './Problem223Visualizer.css'

const PATTERNS = ['init', 'area_a', 'area_b', 'overlap', 'combine', 'done', 'error']
const LINE_PATTERN_MAP = {
  2: 'area_a',
  3: 'area_b',
  5: 'overlap',
  6: 'overlap',
  8: 'combine',
}

const SOLUTION_CODE = [
  { line: 1, text: 'def computeArea(ax1, ay1, ax2, ay2, bx1, by1, bx2, by2):' },
  { line: 2, text: '    area_a = (ax2 - ax1) * (ay2 - ay1)' },
  { line: 3, text: '    area_b = (bx2 - bx1) * (by2 - by1)' },
  { line: 4, text: '    ' },
  { line: 5, text: '    overlap_w = min(ax2, bx2) - max(ax1, bx1)' },
  { line: 6, text: '    overlap_h = min(ay2, by2) - max(ay1, by1)' },
  { line: 7, text: '    overlap = max(overlap_w, 0) * max(overlap_h, 0)' },
  { line: 8, text: '    return area_a + area_b - overlap' },
]

const FIELDS = ['ax1', 'ay1', 'ax2', 'ay2', 'bx1', 'by1', 'bx2', 'by2']

function generateSteps(vals) {
  const steps = []
  try {
    const nums = {}
    for (const f of FIELDS) {
      const v = Number(vals[f])
      if (!Number.isFinite(v)) throw new Error(`${f} must be a number`)
      nums[f] = v
    }
    const { ax1, ay1, ax2, ay2, bx1, by1, bx2, by2 } = nums
    if (ax2 < ax1 || ay2 < ay1) throw new Error('Rectangle A needs ax2 >= ax1 and ay2 >= ay1')
    if (bx2 < bx1 || by2 < by1) throw new Error('Rectangle B needs bx2 >= bx1 and by2 >= by1')

    const base = { ...nums }

    steps.push({
      phase: 'init',
      activeLine: 1,
      message: `A = (${ax1},${ay1})→(${ax2},${ay2}), B = (${bx1},${by1})→(${bx2},${by2}). Total covered area = A + B − overlap.`,
      ...base,
    })

    const areaA = (ax2 - ax1) * (ay2 - ay1)
    steps.push({
      phase: 'area_a',
      activeLine: 2,
      message: `area_a = (${ax2} − ${ax1}) × (${ay2} − ${ay1}) = ${areaA}`,
      ...base, areaA, showA: true,
    })

    const areaB = (bx2 - bx1) * (by2 - by1)
    steps.push({
      phase: 'area_b',
      activeLine: 3,
      message: `area_b = (${bx2} − ${bx1}) × (${by2} − ${by1}) = ${areaB}`,
      ...base, areaA, areaB, showA: true, showB: true,
    })

    const ow = Math.min(ax2, bx2) - Math.max(ax1, bx1)
    steps.push({
      phase: 'overlap',
      activeLine: 5,
      message: `overlap width = min(${ax2},${bx2}) − max(${ax1},${bx1}) = ${ow}${ow <= 0 ? ' (no horizontal overlap)' : ''}`,
      ...base, areaA, areaB, ow, showA: true, showB: true,
    })

    const oh = Math.min(ay2, by2) - Math.max(ay1, by1)
    steps.push({
      phase: 'overlap',
      activeLine: 6,
      message: `overlap height = min(${ay2},${by2}) − max(${ay1},${by1}) = ${oh}${oh <= 0 ? ' (no vertical overlap)' : ''}`,
      ...base, areaA, areaB, ow, oh, showA: true, showB: true,
    })

    const overlap = Math.max(ow, 0) * Math.max(oh, 0)
    const overlapRect = overlap > 0
      ? { x1: Math.max(ax1, bx1), y1: Math.max(ay1, by1), x2: Math.min(ax2, bx2), y2: Math.min(ay2, by2) }
      : null

    steps.push({
      phase: 'overlap',
      activeLine: 7,
      message: overlap > 0
        ? `overlap = max(${ow},0) × max(${oh},0) = ${overlap}`
        : 'The rectangles do not intersect → overlap = 0',
      ...base, areaA, areaB, ow, oh, overlap, overlapRect, showA: true, showB: true,
    })

    const result = areaA + areaB - overlap
    steps.push({
      phase: 'combine',
      activeLine: 8,
      message: `total = ${areaA} + ${areaB} − ${overlap} = ${result}`,
      ...base, areaA, areaB, ow, oh, overlap, overlapRect, result, showA: true, showB: true,
    })

    steps.push({
      phase: 'done',
      activeLine: 8,
      message: `Total area covered by both rectangles is ${result}`,
      ...base, areaA, areaB, ow, oh, overlap, overlapRect, result, showA: true, showB: true,
    })
  } catch (e) {
    steps.push({ phase: 'error', activeLine: 1, message: `Error: ${e.message}`, error: true })
  }
  return steps
}

const EXAMPLES = getExamplesOr('rectangle-area', [
  { label: 'Example 1', vals: { ax1: '-3', ay1: '0', ax2: '3', ay2: '4', bx1: '0', by1: '-1', bx2: '9', by2: '2' } },
  { label: 'Example 2', vals: { ax1: '-2', ay1: '-2', ax2: '2', ay2: '2', bx1: '-2', by1: '-2', bx2: '2', by2: '2' } },
  { label: 'Disjoint', vals: { ax1: '0', ay1: '0', ax2: '2', ay2: '2', bx1: '4', by1: '4', bx2: '6', by2: '6' } },
])

const DEFAULT_VALS = { ax1: '-3', ay1: '0', ax2: '3', ay2: '4', bx1: '0', by1: '-1', bx2: '9', by2: '2' }

export default function Problem223Visualizer() {
  const [vals, setVals] = useState(DEFAULT_VALS)
  const [panelDivs, setPanelDivs] = useState(null)

  const steps = useMemo(
    () => generateSteps(vals).map((current) => ({
      ...current,
      relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
    })),
    [vals],
  )

  const inputError = steps.length === 1 && steps[0].error ? steps[0].message : ''

  const {
    stepIndex, setStepIndex, stepForward, stepBack, togglePlay,
    handleReset, isPlaying, speed, setSpeed, isDone,
  } = usePlaybackState(steps.length)

  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const setField = useCallback((f, v) => {
    setVals((prev) => ({ ...prev, [f]: v }))
    handleReset()
  }, [handleReset])

  const applyExample = useCallback((ex) => {
    setVals(ex.vals)
    handleReset()
  }, [handleReset])

  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  /* ── SVG viewport from current numeric inputs ── */
  const view = useMemo(() => {
    const n = FIELDS.map((f) => Number(vals[f]))
    if (n.some((v) => !Number.isFinite(v))) return null
    const [ax1, ay1, ax2, ay2, bx1, by1, bx2, by2] = n
    const minX = Math.min(ax1, bx1)
    const maxX = Math.max(ax2, bx2)
    const minY = Math.min(ay1, by1)
    const maxY = Math.max(ay2, by2)
    const padX = Math.max(1, (maxX - minX) * 0.1)
    const padY = Math.max(1, (maxY - minY) * 0.1)
    return {
      minX: minX - padX, maxX: maxX + padX,
      minY: minY - padY, maxY: maxY + padY,
      A: { x1: ax1, y1: ay1, x2: ax2, y2: ay2 },
      B: { x1: bx1, y1: by1, x2: bx2, y2: by2 },
    }
  }, [vals])

  const W = 420
  const H = 280
  const toSvg = (v) => {
    if (!view) return { x: 0, y: 0, w: 0, h: 0 }
    const sx = W / (view.maxX - view.minX)
    const sy = H / (view.maxY - view.minY)
    return {
      x: (v.x1 - view.minX) * sx,
      y: H - (v.y2 - view.minY) * sy,
      w: (v.x2 - v.x1) * sx,
      h: (v.y2 - v.y1) * sy,
    }
  }

  const primaryPanel = (
    <div className="p223-panel-primary">
      <div className="p223-card">
        <div className="p223-section-label">Input Coordinates</div>
        <div className="p223-grid-inputs">
          {FIELDS.map((f) => (
            <div className="p223-field" key={f}>
              <label className="p223-input-label" htmlFor={`p223-${f}`}>{f}</label>
              <input
                id={`p223-${f}`}
                className={`p223-input mono ${inputError ? 'has-error' : ''}`}
                value={vals[f]}
                onChange={(e) => setField(f, e.target.value)}
              />
            </div>
          ))}
        </div>
        <p className={`p223-hint ${inputError ? 'error' : ''}`}>
          {inputError || 'Axis-aligned rectangles A and B given by bottom-left and top-right corners.'}
        </p>
        <div className="p223-example-row">
          {EXAMPLES.map((ex) => (
            <button
              type="button"
              key={ex.label}
              className="p223-example-btn"
              onClick={() => applyExample(ex)}
            >
              {ex.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p223-card">
        <div className="p223-section-label">Geometry</div>
        {view ? (
          <svg className="p223-svg" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Rectangle overlap diagram">
            <rect x="0" y="0" width={W} height={H} className="p223-bg" />
            {(() => {
              const a = toSvg(view.A)
              const b = toSvg(view.B)
              return (
                  <motion.rect
                    x={b.x} y={b.y} width={b.w} height={b.h}
                    className="p223-rect-b"
                    animate={{ opacity: step?.showB ? 1 : 0.25 }}
                  />
                  <motion.rect
                    x={a.x} y={a.y} width={a.w} height={a.h}
                    className="p223-rect-a"
                    animate={{ opacity: step?.showA ? 1 : 0.25 }}
                  />
                  {step?.overlapRect && (() => {
                    const o = toSvg(step.overlapRect)
                    return (
                      <motion.rect
                        x={o.x} y={o.y} width={o.w} height={o.h}
                        className="p223-rect-o"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      />
                    )
                  })()}
                </>
              )
            })()}
          </svg>
        ) : (
          <p className="p223-hint error">Fix the coordinates to draw the rectangles.</p>
        )}
        <div className="p223-pointer-key">
          <span className="p223-key rect-a">Rectangle A</span>
          <span className="p223-key rect-b">Rectangle B</span>
          <span className="p223-key rect-o">Overlap</span>
        </div>
      </div>

      {step?.result !== undefined && (
        <div className="p223-result">
          <div className="p223-section-label" style={{ marginBottom: '0.3rem' }}>Total Covered Area</div>
          <div className="p223-result-val">{step.result}</div>
        </div>
      )}
    </div>
  )

  const statePanel = (
    <div className="p223-panel-state">
      <div className="p223-card">
        <div className="p223-section-label">Computed Values</div>
        <div className="p223-stat-grid">
          <div className="p223-stat"><span className="p223-stat-key">area_a</span><span className="p223-stat-val">{step?.areaA ?? '—'}</span></div>
          <div className="p223-stat"><span className="p223-stat-key">area_b</span><span className="p223-stat-val">{step?.areaB ?? '—'}</span></div>
          <div className="p223-stat"><span className="p223-stat-key">overlap w</span><span className="p223-stat-val">{step?.ow ?? '—'}</span></div>
          <div className="p223-stat"><span className="p223-stat-key">overlap h</span><span className="p223-stat-val">{step?.oh ?? '—'}</span></div>
          <div className="p223-stat highlight"><span className="p223-stat-key">overlap</span><span className="p223-stat-val">{step?.overlap ?? '—'}</span></div>
          <div className="p223-stat highlight"><span className="p223-stat-key">total</span><span className="p223-stat-val">{step?.result ?? '—'}</span></div>
        </div>
      </div>

      <div className="p223-card">
        <div className="p223-section-label">Rectangles</div>
        <div className="p223-stat">
          <span className="p223-stat-key">A</span>
          <span className="p223-stat-val">({vals.ax1},{vals.ay1}) → ({vals.ax2},{vals.ay2})</span>
        </div>
        <div className="p223-stat" style={{ marginTop: '0.4rem' }}>
          <span className="p223-stat-key">B</span>
          <span className="p223-stat-val">({vals.bx1},{vals.by1}) → ({vals.bx2},{vals.by2})</span>
        </div>
        {step?.overlapRect && (
          <div className="p223-stat" style={{ marginTop: '0.4rem' }}>
            <span className="p223-stat-key">overlap</span>
            <span className="p223-stat-val">
              ({step.overlapRect.x1},{step.overlapRect.y1}) → ({step.overlapRect.x2},{step.overlapRect.y2})
            </span>
          </div>
        )}
      </div>

      <div className="p223-card">
        <div className="p223-section-label">Key Idea</div>
        <p className="p223-hint">
          Inclusion–exclusion: the union of two rectangles is the sum of their areas minus the
          intersection. The intersection is itself a rectangle whose sides are clamped to zero
          when the projections do not overlap. O(1) time and space.
        </p>
      </div>
    </div>
  )

  const codePanel = (
    <div className="p223-panel-code">
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
    <div className="p223-panel-status">
      <div className={`p223-status ${step?.phase === 'done' ? 'done' : step?.error ? 'error' : ''}`}>
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
      { id: 'state', title: 'State', dockMode: 'split-right' },
      { id: 'code', title: 'Code', dockMode: 'split-bottom' },
      { id: 'status', title: 'Status', dockMode: 'split-bottom', ratio: 0.08 },
    ],
    [],
  )

  return (
    <div className="p223-shell">
      <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
      {panelDivs && (
          {panelDivs.primary && createPortal(primaryPanel, panelDivs.primary)}
          {panelDivs.state && createPortal(statePanel, panelDivs.state)}
          {panelDivs.code && createPortal(codePanel, panelDivs.code)}
          {panelDivs.status && createPortal(statusPanel, panelDivs.status)}
        </>
      )}
      {createPortal(
        <FloatingPanel title="Playback Controls">{playbackPanel}</FloatingPanel>,
        document.body,
      )}
    </div>
  )
}
