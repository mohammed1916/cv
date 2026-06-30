import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import DockableWorkspace from '../../components/shared/DockableWorkspace'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'

import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamples } from '../../config/examplesRegistry'
import './EncodeAndDecodeTinyURLVisualizer.css'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'

const PATTERNS = ['decode_done', 'decode_start', 'encode_done', 'encode_start', 'extract_code', 'generate_code', 'init']

const LINE_PATTERN_MAP = {
  1: 'init',
  6: 'encode_start',
  8: 'process',
  12: 'check',
  13: 'check',
  14: 'check',
  15: 'check'
}

const PATTERNS = ['decode_done', 'decode_start', 'encode_done', 'encode_start', 'extract_code', 'generate_code', 'init']

const EXAMPLES = getExamples('encode-and-decode-tinyurl')

function generateSteps(url) {
  const steps = []

  steps.push({
    activeLine: 1,
    url,
    urlToCode: new Map(),
    codeToUrl: new Map(),
    counter: 0,
    phase: 'init',
    message: 'Initialize Codec',
    relatedLines: [1]
  })

  const urlToCode = new Map()
  const codeToUrl = new Map()
  let counter = 0

  steps.push({
    activeLine: 6,
    url,
    urlToCode,
    codeToUrl,
    counter,
    phase: 'encode_start',
    message: `Encode URL: ${url.slice(0, 30)}...`,
    relatedLines: [6]
  })

  if (!urlToCode.has(url)) {
    const code = String(counter)
    urlToCode.set(url, code)
    codeToUrl.set(code, url)

    steps.push({
      activeLine: 8,
      url,
      code,
      urlToCode: new Map(urlToCode),
      codeToUrl: new Map(codeToUrl),
      counter,
      phase: 'generate_code',
      message: `Generate code: ${code}`,
      relatedLines: [8]
    })

    counter++
  }

  const tinyUrl = `http://tinyurl.com/${urlToCode.get(url)}`

  steps.push({
    activeLine: 12,
    url,
    tinyUrl,
    urlToCode: new Map(urlToCode),
    codeToUrl: new Map(codeToUrl),
    counter,
    phase: 'encode_done',
    message: `Encoded: ${tinyUrl}`,
    relatedLines: [12]
  })

  steps.push({
    activeLine: 13,
    url,
    tinyUrl,
    urlToCode: new Map(urlToCode),
    codeToUrl: new Map(codeToUrl),
    counter,
    phase: 'decode_start',
    message: `Decode: ${tinyUrl}`,
    relatedLines: [13]
  })

  const code = tinyUrl.split('/').pop()

  steps.push({
    activeLine: 14,
    url,
    tinyUrl,
    code,
    urlToCode: new Map(urlToCode),
    codeToUrl: new Map(codeToUrl),
    counter,
    phase: 'extract_code',
    message: `Extract code: ${code}`,
    relatedLines: [14]
  })

  const decodedUrl = codeToUrl.get(code)

  steps.push({
    activeLine: 15,
    url: decodedUrl,
    tinyUrl,
    code,
    urlToCode: new Map(urlToCode),
    codeToUrl: new Map(codeToUrl),
    counter,
    phase: 'decode_done',
    message: `Decoded: ${decodedUrl}`,
    relatedLines: [15],
    done: true,
    result: { original: url, tiny: tinyUrl, decoded: decodedUrl }
  })

  return steps
}

function VisualizationPanel({ url, step, applyEx }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 16 }}>
      {/* Story */}
      <div style={{ padding: 12, backgroundColor: '#f0f9ff', borderRadius: 6, borderLeft: '4px solid #0284c7' }}>
        <div style={{ fontSize: 12, color: '#075985', fontStyle: 'italic' }}>
          "Design a codec to encode and decode URLs using hash maps for bidirectional lookup."
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

      {/* URL Mapping */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>URL Mappings</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {step?.urlToCode && Array.from(step.urlToCode.entries()).map(([originalUrl, code]) => (
            <motion.div
              key={`map-${code}`}
              style={{
                padding: '10px 12px',
                borderRadius: 6,
                border: '2px solid #cbd5e1',
                backgroundColor: '#f1f5f9',
                fontFamily: 'monospace',
                fontSize: 11
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div style={{ color: '#334155', marginBottom: 4, wordBreak: 'break-all' }}>
                {originalUrl.slice(0, 40)}...
              </div>
              <div style={{ color: '#0284c7', fontWeight: 600 }}>
                → http://tinyurl.com/{code}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Current Operation */}
      {step?.phase === 'encode_done' && (
        <motion.div
          style={{
            padding: 12,
            backgroundColor: '#dbeafe',
            borderRadius: 6,
            border: '1px solid #0284c7'
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div style={{ color: '#0c4a6e', fontWeight: 600, marginBottom: 8 }}>Encoded URL</div>
          <div style={{ color: '#0284c7', fontFamily: 'monospace', fontSize: 12, wordBreak: 'break-all' }}>
            {step.tinyUrl}
          </div>
        </motion.div>
      )}

      {step?.phase === 'decode_done' && (
        <motion.div
          style={{
            padding: 12,
            backgroundColor: '#dbeafe',
            borderRadius: 6,
            border: '1px solid #0284c7'
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div style={{ color: '#0c4a6e', fontWeight: 600, marginBottom: 8 }}>Decoded URL</div>
          <div style={{ color: '#0284c7', fontFamily: 'monospace', fontSize: 11, wordBreak: 'break-all' }}>
            {step.url}
          </div>
        </motion.div>
      )}

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
        <div style={{ fontSize: 13, fontWeight: 600, color: '#0c4a6e', marginBottom: 8 }}>Status</div>
        <div style={{ fontSize: 12, color: '#0284c7' }}>
          {step?.message || ''}
        </div>
      </motion.div>
    </div>
  )
}

export default function EncodeAndDecodeTinyURLVisualizer() {
  const [ex, setEx] = useState(EXAMPLES[0] || { url: 'https://leetcode.com/problems/design-tinyurl' })

  const steps = useMemo(
    () =>
      generateSteps(ex.url).map((current) => ({
        ...current,
        relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
      })),
    [ex]
  )

  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)

  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const applyEx = useCallback((e) => { setEx(e); handleReset(); }, [handleReset])

  const connectivity = useCodeVisualConnectivity({
    steps,
    stepIndex,
    onStepJump: setStepIndex,
  })

  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const dockPanels = useMemo(() => [
    {
      id: 'code',
      title: 'Code',
      content: (
        <div style={{ position: 'relative' }}>

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

        </div>      ),
    },
    {
      id: 'viz',
      title: '🔗 Encode/Decode Tiny URL',
      content: (
        <VisualizationPanel
          url={ex.url}
          step={step}
          applyEx={applyEx}
        />
      ),
    },
  ], [step, SOLUTION_CODE, connectivity, setActiveLineDom, ex, applyEx])

  return (
    <div className="problem-shell">
      <DockableWorkspace
        panels={dockPanels}
        initialLayout={{ rows: [['code', 'viz']], minimized: [] }}
      />
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
