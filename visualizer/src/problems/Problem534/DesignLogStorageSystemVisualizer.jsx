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
import './DesignLogStorageSystemVisualizer.css'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import { getSolutionCode } from '../../config/solutionCodeRegistry'
import { createPortal } from 'react-dom'
const SOLUTION_CODE = getSolutionCode('design-log-storage-system')

const PATTERNS = ['done', 'filter', 'init', 'match', 'put', 'retrieve', 'set_precision', 'truncate']
const LINE_PATTERN_MAP = {
  1: 'init',
  5: 'put',
  6: 'retrieve',
  7: 'process',
  8: 'process',
  10: 'process'
}


const EXAMPLES = getExamples('design-log-storage-system')

const PRECISIONS = { Year: 4, Month: 7, Day: 10, Hour: 13, Minute: 16, Second: 19 }

const FALLBACK = {
  logEntries: [
    { id: 1, timestamp: '2017:01:01:23:59:59' },
    { id: 2, timestamp: '2017:01:02:23:59:59' },
  ],
  start: '2017:01:01:23:59:59',
  end: '2017:01:02:23:59:59',
  granularity: 'Second',
}

// Turn a registry example ({ operations, values }) into the editable field values.
function exToFields(e) {
  const ops = Array.isArray(e?.operations) ? e.operations : []
  const vals = Array.isArray(e?.values) ? e.values : []
  const logEntries = []
  let start = FALLBACK.start
  let end = FALLBACK.end
  let granularity = FALLBACK.granularity

  ops.forEach((op, i) => {
    const v = Array.isArray(vals[i]) ? vals[i] : []
    if (op === 'put' && v.length >= 2) {
      logEntries.push({ id: v[v.length - 2], timestamp: String(v[v.length - 1]) })
    } else if (op === 'retrieve' && v.length >= 3) {
      const tail = v.slice(-3)
      start = String(tail[0])
      end = String(tail[1])
      granularity = String(tail[2])
    }
  })

  return {
    logEntries: logEntries.length ? logEntries : FALLBACK.logEntries,
    start,
    end,
    granularity,
  }
}

function generateSteps(logEntries, start, end, granularity) {
  const steps = []
  const logs = []

  steps.push({
    activeLine: 1,
    logs: [],
    phase: 'init',
    message: 'Initialize LogSystem',
    relatedLines: [1]
  })

  for (const entry of logEntries) {
    logs.push(entry)
    steps.push({
      activeLine: 5,
      logs: [...logs],
      entry,
      phase: 'put',
      message: `Put log: id=${entry.id}, timestamp=${entry.timestamp}`,
      relatedLines: [5]
    })
  }

  steps.push({
    activeLine: 6,
    logs,
    phase: 'retrieve',
    message: 'Retrieve logs in range with granularity',
    relatedLines: [6]
  })

  const precisions = PRECISIONS

  steps.push({
    activeLine: 7,
    logs,
    start,
    end,
    granularity,
    precision: precisions[granularity],
    phase: 'set_precision',
    message: `Set precision for ${granularity}: ${precisions[granularity]}`,
    relatedLines: [7]
  })

  const startTruncated = start.slice(0, precisions[granularity])
  const endTruncated = end.slice(0, precisions[granularity])

  steps.push({
    activeLine: 8,
    logs,
    start,
    end,
    startTruncated,
    endTruncated,
    phase: 'truncate',
    message: `Truncate timestamps: "${start}" → "${startTruncated}", "${end}" → "${endTruncated}"`,
    relatedLines: [8]
  })

  const results = []
  for (const log of logs) {
    const logTruncated = log.timestamp.slice(0, precisions[granularity])
    steps.push({
      activeLine: 10,
      logs,
      log,
      logTruncated,
      startTruncated,
      endTruncated,
      results,
      phase: 'filter',
      message: `Check log: "${logTruncated}" in range ["${startTruncated}", "${endTruncated}"]`,
      relatedLines: [10]
    })

    if (logTruncated >= startTruncated && logTruncated <= endTruncated) {
      results.push(log.id)
      steps.push({
        activeLine: 10,
        logs,
        log,
        logTruncated,
        startTruncated,
        endTruncated,
        results: [...results],
        phase: 'match',
        message: `Match! id=${log.id}`,
        relatedLines: [10]
      })
    }
  }

  steps.push({
    activeLine: 10,
    logs,
    results,
    phase: 'done',
    message: `Retrieved ${results.length} logs`,
    relatedLines: [10],
    done: true,
    result: results
  })

  return steps
}

function VisualizationPanel({ step, applyEx }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 16 }}>
      {/* Story */}
      <div style={{ padding: 12, backgroundColor: '#f0f9ff', borderRadius: 6, borderLeft: '4px solid #0284c7' }}>
        <div style={{ fontSize: 12, color: '#075985', fontStyle: 'italic' }}>
          "Design a log storage system with put and retrieve operations supporting multiple granularities."
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

      {/* Logs */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>Stored Logs</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {step?.logs?.map((log, idx) => {
            const isCurrent = step?.log?.id === log.id
            return (
              <motion.div
                key={`log-${idx}`}
                style={{
                  padding: '10px 12px',
                  borderRadius: 6,
                  border: '2px solid',
                  fontFamily: 'monospace',
                  fontSize: 12,
                  backgroundColor: isCurrent ? '#dbeafe' : '#f1f5f9',
                  borderColor: isCurrent ? '#0284c7' : '#cbd5e1',
                  color: isCurrent ? '#0c4a6e' : '#334155'
                }}
                animate={{ scale: isCurrent ? 1.05 : 1 }}
              >
                ID: {log.id} | {log.timestamp}
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Time Range & Granularity */}
      {step?.phase === 'retrieve' && (
        <motion.div
          style={{
            padding: 12,
            backgroundColor: '#fef3c7',
            borderRadius: 6,
            border: '1px solid #fbbf24'
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div style={{ color: '#92400e', marginBottom: 8, fontWeight: 600 }}>
            Retrieve Parameters
          </div>
          <div style={{ color: '#b45309', fontSize: 11, marginBottom: 4 }}>
            Start: {step.start}
          </div>
          <div style={{ color: '#b45309', fontSize: 11, marginBottom: 4 }}>
            End: {step.end}
          </div>
          <div style={{ color: '#b45309', fontSize: 11 }}>
            Granularity: {step.granularity}
          </div>
        </motion.div>
      )}

      {/* Results */}
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
        <div style={{ fontSize: 13, fontWeight: 600, color: '#0c4a6e', marginBottom: 8 }}>Retrieved Logs</div>
        <div style={{ fontSize: 28, fontWeight: 'bold', color: '#0284c7', marginBottom: 8 }}>
          {step?.results?.length || 0}
        </div>
        {step?.results?.length > 0 && (
          <div style={{ fontSize: 12, color: '#0284c7', fontFamily: 'monospace' }}>
            IDs: {step.results.join(', ')}
          </div>
        )}
        <div style={{ fontSize: 11, color: '#0284c7', marginTop: 8 }}>
          {step?.message || ''}
        </div>
      </motion.div>
    </div>
  )
}

export default function DesignLogStorageSystemVisualizer() {
  const seed = useMemo(() => exToFields(EXAMPLES[0]), [])

  const [logsInput, setLogsInput] = useState(JSON.stringify(seed.logEntries))
  const [startInput, setStartInput] = useState(seed.start)
  const [endInput, setEndInput] = useState(seed.end)
  const [granularityInput, setGranularityInput] = useState(seed.granularity)
  const [activeLabel, setActiveLabel] = useState(EXAMPLES[0]?.label || '')

  const { logEntries, start, end, granularity, inputError } = useMemo(() => {
    try {
      const parsed = JSON.parse(logsInput)
      if (!Array.isArray(parsed) || parsed.length === 0) {
        throw new Error('logs must be a non-empty array of { "id": number, "timestamp": "Y:M:D:h:m:s" }')
      }
      for (const entry of parsed) {
        if (!entry || typeof entry !== 'object' || Array.isArray(entry)) throw new Error('each log must be an object')
        if (entry.id === undefined) throw new Error('each log needs an "id"')
        if (typeof entry.timestamp !== 'string') throw new Error('each log needs a string "timestamp"')
      }
      if (!PRECISIONS[granularityInput]) {
        throw new Error(`granularity must be one of ${Object.keys(PRECISIONS).join(', ')}`)
      }
      return {
        logEntries: parsed,
        start: startInput,
        end: endInput,
        granularity: granularityInput,
        inputError: '',
      }
    } catch (e) {
      return {
        logEntries: FALLBACK.logEntries,
        start: FALLBACK.start,
        end: FALLBACK.end,
        granularity: FALLBACK.granularity,
        inputError: e.message,
      }
    }
  }, [logsInput, startInput, endInput, granularityInput])

  const steps = useMemo(
    () =>
      generateSteps(logEntries, start, end, granularity).map((current) => ({
        ...current,
        relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
      })),
    [logEntries, start, end, granularity]
  )

  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)

  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const applyEx = useCallback((e) => {
    const f = exToFields(e)
    setLogsInput(JSON.stringify(f.logEntries))
    setStartInput(f.start)
    setEndInput(f.end)
    setGranularityInput(f.granularity)
    setActiveLabel(e?.label || '')
    handleReset()
  }, [handleReset])

  const handleFieldChange = useCallback((key, text) => {
    if (key === 'logs') setLogsInput(text)
    else if (key === 'start') setStartInput(text)
    else if (key === 'end') setEndInput(text)
    else if (key === 'granularity') setGranularityInput(text)
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
    { id: 'viz', title: '📋 Design Log Storage System', dockMode: 'split-right' },
  ], [])
  const panelContents = useMemo(() => ({
    code: (<div style={{ position: 'relative' }}>

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

        </div>),
    viz: (<>
        <ManualInputPanel
          fields={[
            { key: 'logs', label: 'logs', type: 'array' },
            { key: 'start', label: 'start', type: 'string' },
            { key: 'end', label: 'end', type: 'string' },
            { key: 'granularity', label: 'granularity', type: 'string' },
          ]}
          values={{ logs: logsInput, start: startInput, end: endInput, granularity: granularityInput }}
          onChange={handleFieldChange}
          examples={EXAMPLES}
          activeLabel={activeLabel}
          applyExample={applyEx}
          inputError={inputError}
        />
        <VisualizationPanel
          step={step}
          applyEx={applyEx}
        />
      </>),
  }), [step, connectivity, setActiveLineDom, logsInput, startInput, endInput, granularityInput, activeLabel, inputError, handleFieldChange, applyEx, showPatternOverlay, activeLineDom])
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
