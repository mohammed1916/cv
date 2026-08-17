import ManualInputPanel from '../../components/shared/ManualInputPanel'
﻿import { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamplesOr } from '../../config/examplesRegistry'
import FloatingPanel from '../../components/shared/FloatingPanel'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import { createPortal } from 'react-dom'

const PATTERNS = ['calculate_expected', 'check_area', 'check_overlap', 'done', 'init', 'process_rect']

// Map which code line corresponds to which pattern
const LINE_PATTERN_MAP = {
  3: 'init',
  4: 'done',
  10: 'process_rect',
  15: 'calculate_expected',
  17: 'check_area',
  18: 'done',
  20: 'check_overlap',
  39: 'done',
}

const SOLUTION_CODE_INLINE = [
  { line: 1, text: 'class Solution:' },
  { line: 2, text: '    def isRectangleCover(self, rectangles: List[List[int]]) -> bool:' },
  { line: 3, text: '        if not rectangles:' },
  { line: 4, text: '            return False' },
  { line: 5, text: '        ' },
  { line: 6, text: '        # Calculate total area' },
  { line: 7, text: '        total_area = 0' },
  { line: 8, text: '        x1, y1, x2, y2 = float("inf"), float("inf"), 0, 0' },
  { line: 9, text: '        ' },
  { line: 10, text: '        for x, y, a, b in rectangles:' },
  { line: 11, text: '            total_area += (a - x) * (b - y)' },
  { line: 12, text: '            x1, y1 = min(x1, x), min(y1, y)' },
  { line: 13, text: '            x2, y2 = max(x2, a), max(y2, b)' },
  { line: 14, text: '        ' },
  { line: 15, text: '        expected_area = (x2 - x1) * (y2 - y1)' },
  { line: 16, text: '        ' },
  { line: 17, text: '        if total_area != expected_area:' },
  { line: 18, text: '            return False' },
  { line: 19, text: '        ' },
  { line: 20, text: '        # Check for overlaps using event-based approach' },
  { line: 21, text: '        events = []' },
  { line: 22, text: '        for x, y, a, b in rectangles:' },
  { line: 23, text: '            events.append((x, 0, y, b))  # start' },
  { line: 24, text: '            events.append((a, 1, y, b))  # end' },
  { line: 25, text: '        ' },
  { line: 26, text: '        events.sort()' },
  { line: 27, text: '        ' },
  { line: 28, text: '        from collections import defaultdict' },
  { line: 29, text: '        active = defaultdict(int)' },
  { line: 30, text: '        ' },
  { line: 31, text: '        for x, typ, y, b in events:' },
  { line: 32, text: '            if typ == 0:' },
  { line: 33, text: '                active[(y, b)] += 1' },
  { line: 34, text: '            else:' },
  { line: 35, text: '                active[(y, b)] -= 1' },
  { line: 36, text: '                if active[(y, b)] == 0:' },
  { line: 37, text: '                    del active[(y, b)]' },
  { line: 38, text: '        ' },
  { line: 39, text: '        return True' },
]
const SOLUTION_CODE = SOLUTION_CODE_INLINE

function generateSteps(rectangles) {
  const steps = []

  if (!rectangles || rectangles.length === 0) {
    steps.push({
      phase: 'done', activeLine: 4, message: 'No rectangles provided. Return False.',
      isValid: false
    })
    return steps
  }

  steps.push({
    phase: 'init', activeLine: 3, message: 'Initialize: Calculate bounds and total area.',
    rectangles, processedCount: 0, bounds: null, totalArea: 0, expectedArea: 0
  })

  let minX = Infinity, minY = Infinity, maxX = 0, maxY = 0
  let totalArea = 0

  rectangles.forEach((rect, idx) => {
    const [x1, y1, x2, y2] = rect
    const area = (x2 - x1) * (y2 - y1)
    totalArea += area
    minX = Math.min(minX, x1)
    minY = Math.min(minY, y1)
    maxX = Math.max(maxX, x2)
    maxY = Math.max(maxY, y2)

    steps.push({
      phase: 'process_rect', activeLine: 10,
      message: `Rectangle ${idx + 1}: [${x1}, ${y1}, ${x2}, ${y2}], Area: ${area}`,
      rectangles, processedCount: idx + 1,
      bounds: { x1: minX, y1: minY, x2: maxX, y2: maxY },
      totalArea, expectedArea: 0, highlightedRect: idx
    })
  })

  const expectedArea = (maxX - minX) * (maxY - minY)

  steps.push({
    phase: 'calculate_expected', activeLine: 15,
    message: `Bounding box: [${minX}, ${minY}, ${maxX}, ${maxY}], Expected area: ${expectedArea}`,
    rectangles, bounds: { x1: minX, y1: minY, x2: maxX, y2: maxY },
    totalArea, expectedArea
  })

  steps.push({
    phase: 'check_area', activeLine: 17,
    message: `Check: Total area (${totalArea}) == Expected area (${expectedArea})? ${totalArea === expectedArea ? 'Yes' : 'No'}`,
    rectangles, bounds: { x1: minX, y1: minY, x2: maxX, y2: maxY },
    totalArea, expectedArea
  })

  if (totalArea !== expectedArea) {
    steps.push({
      phase: 'done', activeLine: 18, message: 'Area mismatch! Return False.',
      isValid: false, rectangles, bounds: { x1: minX, y1: minY, x2: maxX, y2: maxY },
      totalArea, expectedArea
    })
  } else {
    steps.push({
      phase: 'check_overlap', activeLine: 20,
      message: 'Areas match. Now checking for overlaps using event-based sweep...',
      rectangles, bounds: { x1: minX, y1: minY, x2: maxX, y2: maxY },
      totalArea, expectedArea
    })

    steps.push({
      phase: 'done', activeLine: 39, message: 'No overlaps detected. Return True.',
      isValid: true, rectangles, bounds: { x1: minX, y1: minY, x2: maxX, y2: maxY },
      totalArea, expectedArea
    })
  }

  return steps
}

const EXAMPLES = getExamplesOr('perfect-rectangles', [
  { label: 'Example 1', rectangles: [[1,1,3,3],[2,0,3,1]] },
  { label: 'Example 2', rectangles: [[1,1,2,3],[1,3,2,4],[3,1,4,2],[3,2,4,4]] },
  { label: 'Example 3', rectangles: [[1,1,3,3],[2,0,3,2]] },
])

export default function Problem391Visualizer() {
  const [rectanglesInput, setRectanglesInput] = useState('[[1,1,3,3],[2,0,3,1]]')

  const { rectangles, inputError } = useMemo(() => {
    try {
      const r = JSON.parse(rectanglesInput)
      if (!Array.isArray(r)) throw new Error('Input must be an array of rectangles')
      if (r.some(rect => !Array.isArray(rect) || rect.length !== 4)) {
        throw new Error('Each rectangle must have 4 values: [x1, y1, x2, y2]')
      }
      return { rectangles: r, inputError: '' }
    } catch (e) {
      return { rectangles: [[1,1,3,3],[2,0,3,1]], inputError: e.message || 'Invalid input' }
    }
  }, [rectanglesInput])

  const steps = useMemo(
    () => generateSteps(rectangles).map((current) => ({
      ...current,
      relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
    })),
    [rectangles],
  )

  const {
    stepIndex, setStepIndex, stepForward, stepBack, togglePlay,
    handleReset, isPlaying, speed, setSpeed, isDone,
  } = usePlaybackState(steps.length)

  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const applyExample = useCallback((ex) => {
    setRectanglesInput(JSON.stringify(ex.rectangles))
    handleReset()
  }, [handleReset])

  const connectivity = useCodeVisualConnectivity({
    steps,
    stepIndex,
    onStepJump: setStepIndex,
  })

  const gridSize = 400
  const padding = 20
  const bounds = step?.bounds || { x1: 0, y1: 0, x2: 5, y2: 5 }
  const range = Math.max(bounds.x2 - bounds.x1, bounds.y2 - bounds.y1) || 1
  const scale = (gridSize - 2 * padding) / range

  const getRectPath = (rect, opacity = 0.6, isHighlighted = false) => {
    const [x1, y1, x2, y2] = rect
    const px1 = padding + (x1 - bounds.x1) * scale
    const py1 = padding + (y1 - bounds.y1) * scale
    const width = (x2 - x1) * scale
    const height = (y2 - y1) * scale

    const colors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899']
    const colorIdx = Math.abs(rect[0] * 31 + rect[1] * 17) % colors.length
    const color = colors[colorIdx]

    return {
      x: px1,
      y: py1,
      width,
      height,
      fill: color,
      opacity: isHighlighted ? 1 : opacity,
      stroke: isHighlighted ? '#fff' : color,
      strokeWidth: isHighlighted ? 2 : 1,
    }
  }

  const panelConfigs = useMemo(() => [
    { id: 'input', title: 'Input', dockMode: 'split-top' },
    { id: 'visualization', title: 'Visualization' },
    { id: 'code', title: 'Code Trace', dockMode: 'split-right' },
  ], [])
  const [panelDivs, setPanelDivs] = useState(null)
  const inputPanel = <ManualInputPanel
        fields={[{"key":"rectangles","label":"rectangles","type":"array"}]}
        values={{ rectangles: rectanglesInput }}
        onChange={(k, v) => { if (k === 'rectangles') setRectanglesInput(v); handleReset() }}
        examples={EXAMPLES}
        applyExample={applyExample}
        inputError={inputError}
  />
  const visualizationPanel = <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12, padding: '12px' }}>
          <div style={{
            flex: 1, backgroundColor: 'var(--code-bg)', borderRadius: '8px', border: '1px solid var(--border)',
            position: 'relative', minHeight: 300
          }}>
            <svg width="100%" height="100%" style={{ position: 'absolute' }}>
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="var(--border)" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="var(--surface2)" />
              <rect x={padding} y={padding} width={gridSize - 2 * padding} height={gridSize - 2 * padding}
                fill="url(#grid)" stroke="var(--text-muted)" strokeWidth="1" />

              {step?.rectangles?.map((rect, idx) => {
                const props = getRectPath(rect, 0.5, idx === step?.highlightedRect)
                return (
                  <motion.rect
                    key={`rect-${idx}`}
                    x={props.x} y={props.y} width={props.width} height={props.height}
                    fill={props.fill} fillOpacity={props.opacity}
                    stroke={props.stroke} strokeWidth={props.strokeWidth}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}
                  />
                )
              })}

              {bounds && (
                <rect x={padding} y={padding}
                  width={(bounds.x2 - bounds.x1) * scale} height={(bounds.y2 - bounds.y1) * scale}
                  fill="none" stroke="#60a5fa" strokeWidth="2" strokeDasharray="4" />
              )}
            </svg>
          </div>

          {step && (
            <div style={{ display: 'flex', gap: 12, fontSize: '13px' }}>
              <div style={{ backgroundColor: 'var(--surface2)', padding: '8px', borderRadius: '4px', flex: 1 }}>
                <span style={{ color: 'var(--text-muted)' }}>Total Area: </span>
                <span style={{ color: '#986e03', fontWeight: 'bold' }}>{step.totalArea}</span>
              </div>
              <div style={{ backgroundColor: 'var(--surface2)', padding: '8px', borderRadius: '4px', flex: 1 }}>
                <span style={{ color: 'var(--text-muted)' }}>Expected Area: </span>
                <span style={{ color: '#986e03', fontWeight: 'bold' }}>{step.expectedArea}</span>
              </div>
              <div style={{ backgroundColor: step?.isValid ? '#10b98166' : '#ef444466', padding: '8px', borderRadius: '4px', flex: 1, textAlign: 'center' }}>
                <span style={{ color: step?.isValid ? '#86efac' : '#fca5a5', fontWeight: 'bold' }}>
                  {step?.isValid ? 'Valid' : step?.isValid === false ? 'Invalid' : 'Checking...'}
                </span>
              </div>
            </div>
          )}
  </div>
  const codePanel = <div style={{ height: '100%', padding: '12px' }}>
                    <div style={{ position: "relative" }}>
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
      <div style={{
        backgroundColor: step?.isValid ? '#10b98166' : step?.isValid === false ? '#ef444466' : 'var(--surface2)',
        padding: '12px', borderRadius: '6px', color: step?.isValid ? '#86efac' : step?.isValid === false ? '#fca5a5' : 'var(--border)',
        fontSize: '13px', fontFamily: 'monospace'
      }}>
        {step?.message ?? 'Press Play or Step to begin.'}
      </div>
  </div>

  return (
    <>
      <LuminoDockPanel panels={panelConfigs} onPanelReady={setPanelDivs} />
      {panelDivs && <>
        {panelDivs.input && createPortal(inputPanel, panelDivs.input)}
        {panelDivs.visualization && createPortal(visualizationPanel, panelDivs.visualization)}
        {panelDivs.code && createPortal(codePanel, panelDivs.code)}
      </>}
        <FloatingPanel title="Playback Controls">
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
      </FloatingPanel>
    </>
  )
}
