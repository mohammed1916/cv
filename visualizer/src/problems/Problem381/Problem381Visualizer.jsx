import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import './Problem381Visualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import { createPortal } from 'react-dom'

const PATTERNS = ['build_map', 'complete', 'init', 'pick', 'remap']

// Map which code line corresponds to which pattern
const LINE_PATTERN_MAP = {
  2: 'init',
  6: 'build_map',
  7: 'build_map',
  9: 'remap',
  11: 'remap',
  12: 'remap',
  14: 'pick',
  15: 'pick',
  16: 'complete',
}

const SOLUTION_CODE_INLINE = [
  { line: 1, text: 'class Solution:' },
  { line: 2, text: '    def __init__(self, n, blacklist):' },
  { line: 3, text: '        self.n = n' },
  { line: 4, text: '        self.blacklist_map = {}' },
  { line: 5, text: '        # Build mapping for blacklist values' },
  { line: 6, text: '        for b in blacklist:' },
  { line: 7, text: '            self.blacklist_map[b] = None' },
  { line: 8, text: '        # Map blacklist to valid range' },
  { line: 9, text: '        whitelist_idx = n - len(blacklist)' },
  { line: 10, text: '        for b in blacklist:' },
  { line: 11, text: '            if b < whitelist_idx:' },
  { line: 12, text: '                self.blacklist_map[b] = whitelist_idx' },
  { line: 13, text: '                whitelist_idx -= 1' },
  { line: 14, text: '    def pick(self):' },
  { line: 15, text: '        rand = random.randint(0, self.whitelist_size - 1)' },
  { line: 16, text: '        return self.blacklist_map.get(rand, rand)' },
]
const SOLUTION_CODE = SOLUTION_CODE_INLINE

function generateSteps(n, blacklist) {
  const steps = []
  const blSet = new Set(blacklist)
  const blMap = new Map()

  // Step 1: Initialize
  steps.push({
    activeLine: 2,
    phase: 'init',
    n,
    blacklist,
    blMap: new Map(),
    whitelistSize: n - blacklist.length,
    message: `Initialize: n=${n}, blacklist has ${blacklist.length} elements`,
  })

  // Step 2: Build initial blacklist map
  steps.push({
    activeLine: 6,
    phase: 'build_map',
    n,
    blacklist,
    blMap: new Map(),
    whitelistSize: n - blacklist.length,
    message: 'Mark blacklist values in map',
  })

  blacklist.forEach((b) => {
    blMap.set(b, null)
    steps.push({
      activeLine: 7,
      phase: 'build_map',
      n,
      blacklist,
      blMap: new Map(blMap),
      whitelistSize: n - blacklist.length,
      highlighted: b,
      message: `Mark blacklist[${b}]`,
    })
  })

  // Step 3: Remap blacklist values
  const whitelistSize = n - blacklist.length
  let whitelistIdx = whitelistSize

  steps.push({
    activeLine: 9,
    phase: 'remap',
    n,
    blacklist,
    blMap: new Map(blMap),
    whitelistSize,
    message: `Calculate whitelist size: ${whitelistSize}. Start remapping from position ${whitelistSize}`,
  })

  blacklist.sort((a, b) => a - b).forEach((b) => {
    if (b < whitelistSize) {
      steps.push({
        activeLine: 11,
        phase: 'remap',
        n,
        blacklist,
        blMap: new Map(blMap),
        whitelistSize,
        highlighted: b,
        message: `Blacklist[${b}] < ${whitelistSize}: needs remapping`,
      })

      blMap.set(b, whitelistIdx)

      steps.push({
        activeLine: 12,
        phase: 'remap',
        n,
        blacklist,
        blMap: new Map(blMap),
        whitelistSize,
        highlighted: b,
        remappedTo: whitelistIdx,
        message: `Map ${b} → ${whitelistIdx}`,
      })

      whitelistIdx -= 1
    } else {
      steps.push({
        activeLine: 11,
        phase: 'remap',
        n,
        blacklist,
        blMap: new Map(blMap),
        whitelistSize,
        highlighted: b,
        message: `Blacklist[${b}] >= ${whitelistSize}: no remapping needed`,
      })
    }
  })

  // Step 4: Show pick operation
  steps.push({
    activeLine: 14,
    phase: 'pick',
    n,
    blacklist,
    blMap: new Map(blMap),
    whitelistSize,
    message: 'Pick random number from valid range',
  })

  for (let rand = 0; rand < whitelistSize && rand < 5; rand++) {
    const result = blMap.has(rand) ? blMap.get(rand) : rand
    steps.push({
      activeLine: 15,
      phase: 'pick',
      n,
      blacklist,
      blMap: new Map(blMap),
      whitelistSize,
      randomValue: rand,
      result,
      message: `Pick ${rand} → ${result === null ? 'invalid' : result}`,
    })
  }

  steps.push({
    activeLine: 16,
    phase: 'complete',
    n,
    blacklist,
    blMap: new Map(blMap),
    whitelistSize,
    message: 'Setup complete! Ready to pick random numbers',
  })

  return steps
}

const EXAMPLES = [
  {
    label: 'Simple',
    n: 7,
    blacklist: [2],
  },
  {
    label: 'Multiple Blacklist',
    n: 10,
    blacklist: [1, 3, 5, 7],
  },
  {
    label: 'Upper Range',
    n: 10,
    blacklist: [8, 9],
  },
]

export default function Problem381Visualizer() {
  const [exIdx, setExIdx] = useState(0)
  const [nInput, setNInput] = useState(String(EXAMPLES[0]?.n ?? 0));
  const [blacklistInput, setBlacklistInput] = useState("");
  const { n, blacklist, inputError } = useMemo(() => {
    try {
      const parsedN = Number(nInput); if (isNaN(parsedN)) throw new Error('n must be a number');
      const parsedBlacklist = JSON.parse(blacklistInput); if (!Array.isArray(parsedBlacklist)) throw new Error('blacklist must be an array');
      return { n: parsedN, blacklist: parsedBlacklist, inputError: '' };
    } catch (e) {
      return { n: EXAMPLES[exIdx]?.n ?? '', blacklist: EXAMPLES[exIdx]?.blacklist ?? '', inputError: e.message };
    }
  }, [nInput, blacklistInput]);
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const ex = EXAMPLES[exIdx]
  const steps = useMemo(
    () => generateSteps(n, blacklist).map((current) => ({
      ...current,
      relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
    })),
    [ex],
  )
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })

  const applyExample = useCallback((i) => { setExIdx(i); setNInput(String(EXAMPLES[i].n)); setBlacklistInput(JSON.stringify(EXAMPLES[i].blacklist)); handleReset(); }, [handleReset]);

  const panelConfigs = useMemo(() => [
    { id: 'code', title: 'Code' },
    { id: 'viz', title: '🎲 Blacklist Mapping', dockMode: 'split-right' },
  ], [])
  const panelContents = useMemo(() => ({
    code: (<div style={{ position: "relative" }}>
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
    viz: (<div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12, padding: 16, overflow: 'auto' }}>
          {/* Example selector */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {EXAMPLES.map((e, i) => (
              <button
                key={i}
                onClick={() => applyExample(i)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 4,
                  border: '1px solid #cbd5e1',
                  cursor: 'pointer',
                  fontSize: 12,
                  backgroundColor: exIdx === i ? '#dbeafe' : '#f1f5f9',
                  fontWeight: exIdx === i ? 600 : 400,
                }}
              >
                {e.label}
              </button>
            ))}
          </div>

          {step && (
            <>
              {/* Message */}
              <div style={{ padding: 8, backgroundColor: '#f8fafc', borderRadius: 6, fontSize: 12, fontWeight: 500 }}>
                {step.message}
              </div>

              {/* Parameters */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div style={{ padding: 10, backgroundColor: '#f0f9ff', borderRadius: 6, fontSize: 12 }}>
                  <div style={{ fontWeight: 600, color: '#0c4a6e' }}>n (total range)</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#0284c7', marginTop: 4 }}>{step.n}</div>
                </div>
                <div style={{ padding: 10, backgroundColor: '#fef3c7', borderRadius: 6, fontSize: 12 }}>
                  <div style={{ fontWeight: 600, color: '#92400e' }}>Valid range</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#f59e0b', marginTop: 4 }}>[0, {step.whitelistSize - 1}]</div>
                </div>
              </div>

              {/* Blacklist */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>Blacklist</div>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {step.blacklist.map((val) => (
                    <motion.div
                      key={`bl-${val}`}
                      animate={{
                        scale: step.highlighted === val ? 1.2 : 1,
                        backgroundColor: step.highlighted === val ? '#fca5a5' : '#fee2e2',
                      }}
                      style={{
                        padding: '8px 12px',
                        borderRadius: 4,
                        border: step.highlighted === val ? '2px solid #ef4444' : '1px solid #fca5a5',
                        backgroundColor: '#fee2e2',
                        fontSize: 12,
                        fontWeight: 600,
                        color: '#991b1b',
                      }}
                    >
                      {val}
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Mapping Display */}
              {step.phase !== 'init' && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>Blacklist → Valid Mapping</div>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {Array.from(step.blMap.entries()).map(([key, val]) => (
                      <motion.div
                        key={`map-${key}`}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        style={{
                          padding: '8px 12px',
                          borderRadius: 4,
                          border: '2px solid',
                          fontSize: 12,
                          fontWeight: 600,
                          backgroundColor: step.remappedTo === key ? '#dcfce7' : '#f1f5f9',
                          borderColor: step.remappedTo === key ? '#10b981' : '#cbd5e1',
                          color: step.remappedTo === key ? '#047857' : '#334155',
                        }}
                      >
                        {key} → {val === null ? 'ignore' : val}
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Random Pick Result */}
              {step.phase === 'pick' && step.randomValue !== undefined && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    padding: 12,
                    backgroundColor: '#f0fdf4',
                    border: '2px solid #10b981',
                    borderRadius: 6,
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#166534' }}>
                    Random pick: {step.randomValue} → Result: {step.result}
                  </div>
                </motion.div>
              )}

              {step.phase === 'complete' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{
                    padding: 10,
                    backgroundColor: '#dbeafe',
                    border: '2px solid #0284c7',
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 600,
                    color: '#0c4a6e',
                  }}
                >
                  ✓ Complete! O(n log n) preprocessing, O(1) pick time
                </motion.div>
              )}
            </>
          )}
        </div>),
  }), [step, connectivity, setActiveLineDom, exIdx, applyExample])
  const [panelDivs, setPanelDivs] = useState(null)
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  return (
    <div className="problem-shell">
        <ManualInputPanel
          fields={[{"key":"n","label":"n","type":"number"},{"key":"blacklist","label":"blacklist","type":"array"}]}
          values={{ n: nInput, blacklist: blacklistInput }}
          onChange={(k, v) => { if (k === 'n') setNInput(v); if (k === 'blacklist') setBlacklistInput(v); handleReset() }}
          examples={EXAMPLES}
          activeLabel={ex?.label}
          applyExample={(e) => applyExample(EXAMPLES.indexOf(e))}
          inputError={inputError}
        />
      
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
          prevDisabled={stepIndex <= 0}
          nextDisabled={isDone}
          resetDisabled={stepIndex < 0}
          onSpeedChange={(e) => setSpeed(Number(e.target.value))}
          showPatternOverlay={showPatternOverlay}
          onShowPatternOverlayChange={setShowPatternOverlay}
          patternOverlayLabel="Show pattern overlay"
          showPatternOverlayToggle
        />
      </FloatingPanel>
    </div>
  )
}
