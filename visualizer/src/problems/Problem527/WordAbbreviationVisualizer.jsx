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
import './WordAbbreviationVisualizer.css'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import { getSolutionCode } from '../../config/solutionCodeRegistry'
import { createPortal } from 'react-dom'
const SOLUTION_CODE = getSolutionCode('word-abbreviation')

const PATTERNS = ['compute_abbr', 'done', 'finalize', 'init', 'init_result', 'length_done', 'process_group', 'start_length']
const LINE_PATTERN_MAP = {
  1: 'init',
  4: 'init_result',
  6: 'start_length',
  8: 'process_group',
  9: 'process',
  11: 'check',
  15: 'length_done',
  16: 'done'
}


const EXAMPLES = getExamples('word-abbreviation')

function generateSteps(dict) {
  const steps = []
  const abbrev = (word, k) => {
    const middle = word.length - k - 1
    return middle > 0 ? word.slice(0, k) + middle + word[word.length - 1] : word
  }

  steps.push({
    activeLine: 1,
    dict: [...dict],
    result: new Array(dict.length).fill(null),
    groups: { 0: [0] },
    groupMap: {},
    currentLength: 0,
    phase: 'init',
    message: `Abbreviate ${dict.length} words`,
    relatedLines: [1]
  })

  const result = new Array(dict.length).fill(null)
  let groups = {}
  for (let i = 0; i < dict.length; i++) {
    groups[i] = [i]
  }

  steps.push({
    activeLine: 4,
    dict,
    result,
    groups,
    currentLength: 0,
    phase: 'init_result',
    message: 'Initialize result array and groups',
    relatedLines: [4]
  })

  for (let length = 1; length <= 10; length++) {
    steps.push({
      activeLine: 6,
      dict,
      result,
      groups,
      currentLength: length,
      phase: 'start_length',
      message: `Processing abbreviation length k=${length}`,
      relatedLines: [6]
    })

    const newGroups = {}
    const groupKeys = Object.keys(groups)

    for (const groupKey of groupKeys) {
      const group = groups[groupKey]

      if (group.length === 1) {
        const idx = group[0]
        if (!result[idx]) {
          result[idx] = dict[idx]
          steps.push({
            activeLine: 9,
            dict,
            result,
            groups,
            currentLength: length,
            idx,
            phase: 'finalize',
            message: `Word at index ${idx} ("${dict[idx]}") is unique`,
            relatedLines: [9]
          })
        }
        continue
      }

      steps.push({
        activeLine: 8,
        dict,
        result,
        groups,
        currentLength: length,
        phase: 'process_group',
        message: `Group has ${group.length} words, grouping by abbreviation`,
        relatedLines: [8]
      })

      const grouped = {}
      for (const idx of group) {
        const abbr = abbrev(dict[idx], length)
        steps.push({
          activeLine: 11,
          dict,
          result,
          idx,
          abbr,
          word: dict[idx],
          phase: 'compute_abbr',
          message: `Abbreviate "${dict[idx]}" with k=${length}: "${abbr}"`,
          relatedLines: [11]
        })

        if (!grouped[abbr]) {
          grouped[abbr] = []
        }
        grouped[abbr].push(idx)
      }

      Object.assign(newGroups, grouped)
    }

    groups = newGroups

    steps.push({
      activeLine: 15,
      dict,
      result,
      groups,
      currentLength: length,
      phase: 'length_done',
      message: `Length ${length} complete. ${Object.keys(groups).length} groups remain`,
      relatedLines: [15]
    })
  }

  steps.push({
    activeLine: 16,
    dict,
    result,
    groups,
    phase: 'done',
    message: `Word abbreviation complete. ${result.filter(x => x !== null).length}/${dict.length} finalized`,
    relatedLines: [16],
    done: true
  })

  return steps
}

function VisualizationPanel({ dict, step, applyEx }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 16 }}>
      {/* Story */}
      <div style={{ padding: 12, backgroundColor: '#f0f9ff', borderRadius: 6, borderLeft: '4px solid #0284c7' }}>
        <div style={{ fontSize: 12, color: '#075985', fontStyle: 'italic' }}>
          "Generate unique abbreviations for words by increasing prefix length until they are distinguishable."
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

      {/* Input Words */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>Input Words</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {dict.map((word, idx) => {
            const isProcessing = step?.idx === idx
            const abbr = step?.abbr
            return (
              <motion.div
                key={`word-${idx}`}
                style={{
                  padding: '10px 14px',
                  borderRadius: 6,
                  border: '2px solid',
                  fontFamily: 'monospace',
                  fontSize: 13,
                  fontWeight: 600,
                  backgroundColor: isProcessing ? '#fecaca' : '#f1f5f9',
                  borderColor: isProcessing ? '#f87171' : '#cbd5e1',
                  color: isProcessing ? '#7f1d1d' : '#1e293b'
                }}
                animate={{ scale: isProcessing ? 1.1 : 1 }}
              >
                {word}
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Current Abbreviation Processing */}
      {step?.phase === 'compute_abbr' && (
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
          <div style={{ fontSize: 12, color: '#92400e', fontWeight: 600, marginBottom: 8 }}>
            Abbreviating "{step.word}" with k={step.currentLength}
          </div>
          <div style={{ fontFamily: 'monospace', fontSize: 12, color: '#b45309', marginBottom: 4 }}>
            First {step.currentLength} chars: {step.word.slice(0, step.currentLength)}
          </div>
          <div style={{ fontFamily: 'monospace', fontSize: 12, color: '#b45309', marginBottom: 4 }}>
            Last 1 char: {step.word[step.word.length - 1]}
          </div>
          <div style={{ fontFamily: 'monospace', fontSize: 12, color: '#b45309', marginBottom: 4 }}>
            Middle count: {Math.max(0, step.word.length - step.currentLength - 1)}
          </div>
          <div style={{ fontFamily: 'monospace', fontSize: 13, color: '#10b981', fontWeight: 600, marginTop: 8 }}>
            Result: {step.abbr}
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
        <div style={{ fontSize: 13, fontWeight: 600, color: '#0c4a6e', marginBottom: 8 }}>Processing Status</div>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#0284c7', marginBottom: 8 }}>
          Length: k={step?.currentLength || 0}
        </div>
        <div style={{ fontSize: 12, color: '#0284c7' }}>
          {step?.message || ''}
        </div>
      </motion.div>
    </div>
  )
}

export default function WordAbbreviationVisualizer() {
  const [ex, setEx] = useState(EXAMPLES[0] || { dict: ['like', 'god', 'internal'] })

  const steps = useMemo(
    () =>
      generateSteps(ex.dict).map((current) => ({
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

  const panelConfigs = useMemo(() => [
    { id: 'code', title: 'Code' },
    { id: 'viz', title: '📝 Word Abbreviation', dockMode: 'split-right' },
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
    viz: (<VisualizationPanel
          dict={ex.dict}
          step={step}
          applyEx={applyEx}
        />),
  }), [step, SOLUTION_CODE, connectivity, setActiveLineDom, ex, applyEx])
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
