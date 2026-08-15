import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'

import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamples } from '../../config/examplesRegistry'
import './LonelyPixelIIVisualizer.css'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import { getSolutionCode } from '../../config/solutionCodeRegistry'
import { createPortal } from 'react-dom'
const SOLUTION_CODE = getSolutionCode('lonely-pixel-ii')

const PATTERNS = ['check', 'count_done', 'done', 'init', 'lonely']

const LINE_PATTERN_MAP = {
  1: 'init',
  9: 'process',
  11: 'check',
  13: 'check',
  14: 'check'
}

const EXAMPLES = getExamples('lonely-pixel-ii')

const DEFAULT_EX = EXAMPLES[0] || {
  label: 'Default',
  picture: [['W', 'B', 'W'], ['W', 'B', 'W'], ['W', 'B', 'W']],
  N: 2,
}

function generateSteps(picture, N) {
  const steps = []
  const rows = picture.length
  const cols = picture[0]?.length || 0
  const rowCount = new Array(rows).fill(0)
  const colCount = new Array(cols).fill(0)

  steps.push({
    activeLine: 1,
    picture,
    N,
    rowCount,
    colCount,
    count: 0,
    phase: 'init',
    message: `Find lonely pixels where exactly ${N} black pixels in both row and column`,
    relatedLines: [1]
  })

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (picture[r][c] === 'B') {
        rowCount[r]++
        colCount[c]++
      }
    }
  }

  steps.push({
    activeLine: 9,
    picture,
    N,
    rowCount: [...rowCount],
    colCount: [...colCount],
    count: 0,
    phase: 'count_done',
    message: 'Row and column counts completed',
    relatedLines: [9]
  })

  let lonelyCount = 0
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      steps.push({
        activeLine: 11,
        picture,
        N,
        r,
        c,
        rowCount,
        colCount,
        count: lonelyCount,
        phase: 'check',
        message: `Check [${r}, ${c}]: B=${picture[r][c] === 'B'}, rowCount[${r}]=${rowCount[r]}, colCount[${c}]=${colCount[c]}`,
        relatedLines: [11]
      })

      if (picture[r][c] === 'B' && rowCount[r] === N && colCount[c] === N) {
        lonelyCount++

        steps.push({
          activeLine: 13,
          picture,
          N,
          r,
          c,
          rowCount,
          colCount,
          count: lonelyCount,
          phase: 'lonely',
          message: `Found lonely pixel at [${r}, ${c}]`,
          relatedLines: [13]
        })
      }
    }
  }

  steps.push({
    activeLine: 14,
    picture,
    N,
    rowCount,
    colCount,
    count: lonelyCount,
    phase: 'done',
    message: `Total lonely pixels (N=${N}): ${lonelyCount}`,
    relatedLines: [14],
    done: true,
    result: lonelyCount
  })

  return steps
}

function VisualizationPanel({ N, step, applyEx }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 16 }}>
      {/* Story */}
      <div style={{ padding: 12, backgroundColor: '#f0f9ff', borderRadius: 6, borderLeft: '4px solid #0284c7' }}>
        <div style={{ fontSize: 12, color: '#075985', fontStyle: 'italic' }}>
          "Find black pixels that are the only black pixel in their row and column with exactly N black pixels in both."
        </div>
      </div>

      {/* Examples */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>Examples</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {EXAMPLES.map(e => (
            <button
              key={e.label}
              onClick={() => applyEx(e)}
              style={{
                padding: '6px 12px',
                borderRadius: 4,
                border: '1px solid #cbd5e1',
                cursor: 'pointer',
                fontSize: 12,
                backgroundColor: '#f1f5f9'
              }}
            >
              {e.label}
            </button>
          ))}
        </div>
      </div>

      {/* N Parameter */}
      <div style={{ padding: 12, backgroundColor: '#fef3c7', borderRadius: 6, border: '1px solid #fbbf24', textAlign: 'center' }}>
        <div style={{ fontSize: 11, color: '#b45309', marginBottom: 4 }}>Threshold N</div>
        <div style={{ fontSize: 24, fontWeight: 'bold', color: '#f59e0b' }}>{N}</div>
      </div>

      {/* Grid */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>Picture</div>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${step?.picture[0]?.length || 3}, 1fr)`, gap: 4 }}>
          {step?.picture?.map((row, r) =>
            row.map((cell, c) => {
              const isCurrent = r === step?.r && c === step?.c
              const isLonely = step?.phase === 'lonely' && r === step?.r && c === step?.c
              return (
                <motion.div
                  key={`cell-${r}-${c}`}
                  style={{
                    width: 50,
                    height: 50,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 4,
                    border: '2px solid',
                    fontWeight: 600,
                    fontSize: 14,
                    backgroundColor: cell === 'B' ? '#1f2937' : '#f1f5f9',
                    borderColor: isLonely ? '#10b981' : isCurrent ? '#f59e0b' : cell === 'B' ? '#374151' : '#cbd5e1',
                    color: cell === 'B' ? '#f3f4f6' : '#1f2937'
                  }}
                  animate={{ scale: isLonely ? 1.2 : isCurrent ? 1.1 : 1 }}
                >
                  {cell}
                </motion.div>
              )
            })
          )}
        </div>
      </div>

      {/* Row and Column Counts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#1e293b', marginBottom: 6 }}>Row Counts</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {step?.rowCount?.map((count, idx) => (
              <div
                key={`row-${idx}`}
                style={{
                  padding: '6px 10px',
                  borderRadius: 4,
                  backgroundColor: step?.r === idx ? (count === N ? '#dbeafe' : '#fee2e2') : '#f1f5f9',
                  border: `1px solid ${step?.r === idx ? (count === N ? '#0284c7' : '#ef4444') : '#cbd5e1'}`,
                  fontFamily: 'monospace',
                  fontSize: 12,
                  color: step?.r === idx ? (count === N ? '#0c4a6e' : '#7f1d1d') : '#334155',
                  fontWeight: count === N ? 600 : 400
                }}
              >
                Row[{idx}]: {count}
              </div>
            ))}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#1e293b', marginBottom: 6 }}>Col Counts</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {step?.colCount?.map((count, idx) => (
              <div
                key={`col-${idx}`}
                style={{
                  padding: '6px 10px',
                  borderRadius: 4,
                  backgroundColor: step?.c === idx ? (count === N ? '#dbeafe' : '#fee2e2') : '#f1f5f9',
                  border: `1px solid ${step?.c === idx ? (count === N ? '#0284c7' : '#ef4444') : '#cbd5e1'}`,
                  fontFamily: 'monospace',
                  fontSize: 12,
                  color: step?.c === idx ? (count === N ? '#0c4a6e' : '#7f1d1d') : '#334155',
                  fontWeight: count === N ? 600 : 400
                }}
              >
                Col[{idx}]: {count}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Result */}
      <motion.div
        style={{
          padding: 16,
          backgroundColor: '#f0f9ff',
          borderRadius: 6,
          border: '2px solid #0284c7',
          textAlign: 'center'
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div style={{ fontSize: 13, fontWeight: 600, color: '#0c4a6e', marginBottom: 8 }}>Lonely Pixels (N={N})</div>
        <div style={{ fontSize: 28, fontWeight: 'bold', color: '#0284c7' }}>
          {step?.count !== undefined ? step.count : '...'}
        </div>
        <div style={{ fontSize: 12, color: '#0284c7', marginTop: 8 }}>
          {step?.message || ''}
        </div>
      </motion.div>
    </div>
  )
}

export default function LonelyPixelIIVisualizer() {
  const [pictureInput, setPictureInput] = useState(JSON.stringify(DEFAULT_EX.picture))
  const [nInput, setNInput] = useState(String(DEFAULT_EX.N))
  const [activeLabel, setActiveLabel] = useState(DEFAULT_EX.label)

  const { picture, N, inputError } = useMemo(() => {
    try {
      const parsed = JSON.parse(pictureInput)
      if (!Array.isArray(parsed) || parsed.length === 0 || !Array.isArray(parsed[0]) || parsed[0].length === 0) {
        throw new Error('picture must be a non-empty 2D array, e.g. [["W","B"],["B","W"]]')
      }
      const width = parsed[0].length
      for (const row of parsed) {
        if (!Array.isArray(row) || row.length !== width) throw new Error('every picture row must have the same length')
        for (const cell of row) {
          if (typeof cell !== 'string') throw new Error('picture cells must be strings like "B" or "W"')
        }
      }
      const n = Number(nInput)
      if (!Number.isFinite(n) || n < 0) throw new Error('N must be a non-negative number')
      return { picture: parsed, N: n, inputError: '' }
    } catch (e) {
      return { picture: DEFAULT_EX.picture, N: DEFAULT_EX.N, inputError: e.message }
    }
  }, [pictureInput, nInput])

  const steps = useMemo(
    () =>
      generateSteps(picture, N).map((current) => ({
        ...current,
        relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
      })),
    [picture, N]
  )

  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)

  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const applyEx = useCallback((e) => {
    setPictureInput(JSON.stringify(e.picture))
    setNInput(String(e.N))
    setActiveLabel(e.label)
    handleReset()
  }, [handleReset])

  const handleFieldChange = useCallback((key, text) => {
    if (key === 'picture') setPictureInput(text)
    else if (key === 'N') setNInput(text)
    setActiveLabel('')
    handleReset()
  }, [handleReset])

  const connectivity = useCodeVisualConnectivity({
    steps,
    stepIndex,
    onStepJump: setStepIndex,
  })

  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const panelConfigs = useMemo(() => [
    { id: 'code', title: 'Code' },
    { id: 'viz', title: '🔍 Lonely Pixel II', dockMode: 'split-right' },
  ], [])
  const panelContents = useMemo(() => ({
    code: (<div style={{ position: 'relative' }}>

          <div style={{ position: 'relative' }}>


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
          {showPatternOverlay && (

            <CodePatternAnnotations

              linePatterns={LINE_PATTERN_MAP}

              currentPhase={step?.phase}

              activeLineDom={activeLineDom}

              activeLine={step?.activeLine}

            />

          )}

        </div>),
    viz: (<>
        <ManualInputPanel
          fields={[
            { key: 'picture', label: 'picture', type: 'array' },
            { key: 'N', label: 'N', type: 'number' },
          ]}
          values={{ picture: pictureInput, N: nInput }}
          onChange={handleFieldChange}
          examples={EXAMPLES}
          activeLabel={activeLabel}
          applyExample={applyEx}
          inputError={inputError}
        />
        <VisualizationPanel
          N={N}
          step={step}
          applyEx={applyEx}
        />
      </>),
  }), [step, connectivity, setActiveLineDom, N, pictureInput, nInput, activeLabel, inputError, handleFieldChange, applyEx, showPatternOverlay, activeLineDom])
  const [panelDivs, setPanelDivs] = useState(null)
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  return (
    <div className="problem-shell">
      <>
        <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
        {panelDivs && (
          <>
            {panelDivs.code && createPortal(panelContents.code, panelDivs.code)}
            {panelDivs.viz && createPortal(panelContents.viz, panelDivs.viz)}
          </>
        )}
      </>
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
          onSpeedChange={e => setSpeed(Number(e.target.value))}
          showPatternOverlay={showPatternOverlay}
          onShowPatternOverlayChange={setShowPatternOverlay}
          patternOverlayLabel="Show pattern overlay"
          showPatternOverlayToggle
        />
      </FloatingPanel>
      
    </div>
  )
}
