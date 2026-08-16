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
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import './LonelyPixelIVisualizer.css'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import { getSolutionCode } from '../../config/solutionCodeRegistry'
import { createPortal } from 'react-dom'
const SOLUTION_CODE = getSolutionCode('lonely-pixel-i')

const PATTERNS = ['check', 'count', 'count_done', 'done', 'init', 'lonely', 'scan']

const LINE_PATTERN_MAP = {
  1: 'init',
  8: 'process',
  9: 'process',
  11: 'count_done',
  13: 'check',
  15: 'check',
  16: 'done'
}

const EXAMPLES = getExamples('lonely-pixel-i')

const FALLBACK_PICTURE = [['W', 'W', 'B'], ['W', 'B', 'W'], ['B', 'W', 'W']]

function generateSteps(picture) {
  const steps = []
  const rows = picture.length
  const cols = picture[0]?.length || 0
  const rowCount = new Array(rows).fill(0)
  const colCount = new Array(cols).fill(0)

  steps.push({
    activeLine: 1,
    picture,
    rowCount,
    colCount,
    count: 0,
    phase: 'init',
    message: 'Count black pixels in each row and column',
    relatedLines: [1]
  })

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      steps.push({
        activeLine: 8,
        picture,
        r,
        c,
        rowCount,
        colCount,
        count: 0,
        phase: 'scan',
        message: `Scanning [${r}, ${c}]: ${picture[r][c]}`,
        relatedLines: [8]
      })

      if (picture[r][c] === 'B') {
        rowCount[r]++
        colCount[c]++

        steps.push({
          activeLine: 9,
          picture,
          r,
          c,
          rowCount: [...rowCount],
          colCount: [...colCount],
          count: 0,
          phase: 'count',
          message: `Found black pixel at [${r}, ${c}]. Row[${r}]=${rowCount[r]}, Col[${c}]=${colCount[c]}`,
          relatedLines: [9]
        })
      }
    }
  }

  steps.push({
    activeLine: 11,
    picture,
    rowCount,
    colCount,
    count: 0,
    phase: 'count_done',
    message: 'Counting complete. Now finding lonely pixels',
    relatedLines: [11]
  })

  let lonelyCount = 0
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      steps.push({
        activeLine: 13,
        picture,
        r,
        c,
        rowCount,
        colCount,
        count: lonelyCount,
        phase: 'check',
        message: `Check [${r}, ${c}]: B=${picture[r][c] === 'B'}, rowCount[${r}]=${rowCount[r]}, colCount[${c}]=${colCount[c]}`,
        relatedLines: [13]
      })

      if (picture[r][c] === 'B' && rowCount[r] === 1 && colCount[c] === 1) {
        lonelyCount++

        steps.push({
          activeLine: 15,
          picture,
          r,
          c,
          rowCount,
          colCount,
          count: lonelyCount,
          phase: 'lonely',
          message: `Found lonely pixel at [${r}, ${c}]`,
          relatedLines: [15]
        })
      }
    }
  }

  steps.push({
    activeLine: 16,
    picture,
    rowCount,
    colCount,
    count: lonelyCount,
    phase: 'done',
    message: `Total lonely pixels: ${lonelyCount}`,
    relatedLines: [16],
    done: true,
    result: lonelyCount
  })

  return steps
}

function VisualizationPanel({ step }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 16 }}>
      {/* Story */}
      <div style={{ padding: 12, backgroundColor: '#f0f9ff', borderRadius: 6, borderLeft: '4px solid #0284c7' }}>
        <div style={{ fontSize: 12, color: '#075985', fontStyle: 'italic' }}>
          "Find pixels that are black and are the only black pixel in their row and column."
        </div>
      </div>

      {/* Grid */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--surface2)', marginBottom: 8 }}>Picture</div>
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
                    backgroundColor: cell === 'B' ? '#1f2937' : 'var(--surface2)',
                    borderColor: isLonely ? '#10b981' : isCurrent ? '#f59e0b' : cell === 'B' ? '#374151' : 'var(--border)',
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
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--surface2)', marginBottom: 6 }}>Row Counts</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {step?.rowCount?.map((count, idx) => (
              <div
                key={`row-${idx}`}
                style={{
                  padding: '6px 10px',
                  borderRadius: 4,
                  backgroundColor: step?.r === idx ? '#dbeafe' : 'var(--surface2)',
                  border: `1px solid ${step?.r === idx ? '#0284c7' : 'var(--border)'}`,
                  fontFamily: 'monospace',
                  fontSize: 12,
                  color: step?.r === idx ? '#0c4a6e' : 'var(--border)'
                }}
              >
                Row[{idx}]: {count}
              </div>
            ))}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--surface2)', marginBottom: 6 }}>Col Counts</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {step?.colCount?.map((count, idx) => (
              <div
                key={`col-${idx}`}
                style={{
                  padding: '6px 10px',
                  borderRadius: 4,
                  backgroundColor: step?.c === idx ? '#dbeafe' : 'var(--surface2)',
                  border: `1px solid ${step?.c === idx ? '#0284c7' : 'var(--border)'}`,
                  fontFamily: 'monospace',
                  fontSize: 12,
                  color: step?.c === idx ? '#0c4a6e' : 'var(--border)'
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
        <div style={{ fontSize: 13, fontWeight: 600, color: '#0c4a6e', marginBottom: 8 }}>Lonely Pixels</div>
        <div style={{ fontSize: 28, fontWeight: 'bold', color: '#027bba' }}>
          {step?.count !== undefined ? step.count : '...'}
        </div>
        <div style={{ fontSize: 12, color: '#027bba', marginTop: 8 }}>
          {step?.message || ''}
        </div>
      </motion.div>
    </div>
  )
}

export default function LonelyPixelIVisualizer() {
  const [pictureInput, setPictureInput] = useState(JSON.stringify(EXAMPLES[0]?.picture ?? FALLBACK_PICTURE))
  const [activeLabel, setActiveLabel] = useState(EXAMPLES[0]?.label ?? '')

  const { picture, inputError } = useMemo(() => {
    try {
      const parsed = JSON.parse(pictureInput)
      if (!Array.isArray(parsed) || parsed.length === 0) throw new Error('picture must be a non-empty 2D array')
      const width = Array.isArray(parsed[0]) ? parsed[0].length : 0
      if (width === 0) throw new Error('picture rows must be non-empty arrays')
      if (!parsed.every((row) => Array.isArray(row) && row.length === width && row.every((cell) => cell === 'B' || cell === 'W')))
        throw new Error("picture rows must be equal-length arrays of 'B' or 'W'")
      return { picture: parsed, inputError: '' }
    } catch (e) {
      return { picture: FALLBACK_PICTURE, inputError: e.message }
    }
  }, [pictureInput])

  const steps = useMemo(
    () =>
      generateSteps(picture).map((current) => ({
        ...current,
        relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
      })),
    [picture]
  )

  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)

  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const applyEx = useCallback((e) => {
    setPictureInput(JSON.stringify(e.picture))
    setActiveLabel(e.label)
    handleReset()
  }, [handleReset])

  const handleFieldChange = useCallback((key, text) => {
    if (key === 'picture') setPictureInput(text)
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
    { id: 'viz', title: '🔍 Lonely Pixel I', dockMode: 'split-right' },
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
          fields={[{ key: 'picture', label: 'picture', type: 'array' }]}
          values={{ picture: pictureInput }}
          onChange={handleFieldChange}
          examples={EXAMPLES}
          activeLabel={activeLabel}
          applyExample={applyEx}
          inputError={inputError}
        />
        <VisualizationPanel step={step} />
      </>),
  }), [step, connectivity, setActiveLineDom, showPatternOverlay, activeLineDom, pictureInput, activeLabel, inputError, applyEx, handleFieldChange])
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
