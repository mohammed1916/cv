import { useState, useMemo, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import './Visualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'

const PATTERNS = ['init', 'scan', 'keep', 'skip', 'done']

const LINE_PATTERN_MAP = {
  1: 'init',
  2: 'scan',
  3: 'keep',
  4: 'keep',
  5: 'keep',
  6: 'skip',
  7: 'done',
}

const EXAMPLES = [
  { label: 'Example 1', nums: [1, 1, 1, 2, 2, 3] },
  { label: 'Example 2', nums: [0, 0, 1, 1, 1, 1, 2, 3, 3] },
]

const SOLUTION_CODE = [
  { line: 1, text: 'write = 0' },
  { line: 2, text: 'for read in range(len(nums)):' },
  { line: 3, text: '    if write < 2 or nums[read] > nums[write - 2]:' },
  { line: 4, text: '        nums[write] = nums[read]' },
  { line: 5, text: '        write += 1' },
  { line: 6, text: '    # else: skip duplicate' },
  { line: 7, text: 'return write' },
]

function generateSteps(input) {
  const steps = []
  const nums = [...input]
  const n = nums.length
  let write = 0

  steps.push({
    activeLine: 1,
    phase: 'init',
    nums: [...nums],
    read: -1,
    write,
    kept: new Set(),
    message: `Initialize write=0. Keep each unique value at most twice in the sorted array.`,
  })

  for (let read = 0; read < n; read++) {
    const canKeep = write < 2 || nums[read] > nums[write - 2]

    steps.push({
      activeLine: 3,
      phase: 'scan',
      nums: [...nums],
      read,
      write,
      kept: new Set(Array.from({ length: write }, (_, i) => i)),
      message:
        write < 2
          ? `read=${read}: write=${write} < 2 → always keep nums[${read}]=${nums[read]}.`
          : `read=${read}: compare nums[${read}]=${nums[read]} with nums[write-2]=nums[${write - 2}]=${nums[write - 2]}.`,
    })

    if (canKeep) {
      nums[write] = nums[read]
      const newWrite = write + 1
      steps.push({
        activeLine: 5,
        phase: 'keep',
        nums: [...nums],
        read,
        write: newWrite,
        kept: new Set(Array.from({ length: newWrite }, (_, i) => i)),
        keptIndex: write,
        message: `Keep nums[${read}]=${nums[read]} → write to index ${write}. write becomes ${newWrite}.`,
      })
      write = newWrite
    } else {
      steps.push({
        activeLine: 6,
        phase: 'skip',
        nums: [...nums],
        read,
        write,
        kept: new Set(Array.from({ length: write }, (_, i) => i)),
        skipIndex: read,
        message: `Skip nums[${read}]=${nums[read]} (would be a 3rd copy). write stays ${write}.`,
      })
    }
  }

  steps.push({
    activeLine: 7,
    phase: 'done',
    nums: [...nums],
    read: n,
    write,
    kept: new Set(Array.from({ length: write }, (_, i) => i)),
    done: true,
    message: `Done! New length k=${write}. Result prefix: [${nums.slice(0, write).join(', ')}].`,
  })

  return steps
}

function VisualizationPanel({ step }) {
  if (!step) {
    return (
      <div style={{ padding: 16, color: '#155e75', fontSize: 13 }}>
        Press play to remove duplicates in-place with two pointers.
      </div>
    )
  }

  const { nums = [], read = -1, write = 0, kept = new Set(), keptIndex, skipIndex } = step

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 16 }}>
      <div
        style={{
          padding: 12,
          backgroundColor: '#cffafe',
          borderRadius: 8,
          borderLeft: '4px solid #0891b2',
        }}
      >
        <div style={{ fontSize: 12, color: '#155e75', fontStyle: 'italic' }}>
          Two pointers: <strong>read</strong> scans every element; <strong>write</strong> marks where the
          next kept value goes. An element is kept if fewer than 2 are written or it exceeds the value two
          slots back in the accepted prefix.
        </div>
      </div>

      {/* Array cells */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', paddingTop: 24 }}>
        {nums.map((v, i) => {
          const isKept = kept.has(i)
          const isRead = i === read
          const isWrite = i === write
          const justKept = i === keptIndex
          const justSkipped = i === skipIndex
          return (
            <div key={i} style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {/* pointer markers above the cell */}
              <div style={{ height: 18, fontSize: 11, fontWeight: 700, display: 'flex', gap: 4 }}>
                {isRead && <span style={{ color: '#b45309' }}>read</span>}
                {isWrite && <span style={{ color: '#7c3aed' }}>write</span>}
              </div>
              <motion.div
                animate={{ scale: isRead ? 1.12 : 1 }}
                transition={{ duration: 0.25 }}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 18,
                  fontWeight: 700,
                  color: isKept ? '#0c4a6e' : 'var(--text-muted)',
                  backgroundColor: justSkipped
                    ? '#fecaca'
                    : justKept
                    ? '#a7f3d0'
                    : isKept
                    ? '#bae6fd'
                    : 'var(--surface2)',
                  border: isRead
                    ? '3px solid #f59e0b'
                    : isWrite
                    ? '3px solid #7c3aed'
                    : justKept
                    ? '2px solid #059669'
                    : justSkipped
                    ? '2px solid #dc2626'
                    : '1px solid var(--border)',
                }}
              >
                {v}
              </motion.div>
              <div style={{ fontSize: 10, color: '#627794', marginTop: 4 }}>{i}</div>
            </div>
          )
        })}
      </div>

      {/* Pointer / length status */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: 8,
          fontSize: 12,
        }}
      >
        <div style={{ padding: 8, backgroundColor: '#fef3c7', borderRadius: 6, textAlign: 'center', color: '#92400e' }}>
          read = <strong>{read}</strong>
        </div>
        <div style={{ padding: 8, backgroundColor: '#ede9fe', borderRadius: 6, textAlign: 'center', color: '#5b21b6' }}>
          write = <strong>{write}</strong>
        </div>
        <div style={{ padding: 8, backgroundColor: '#dbeafe', borderRadius: 6, textAlign: 'center', color: '#1e40af' }}>
          k (kept) = <strong>{write}</strong>
        </div>
      </div>

      <div
        style={{
          padding: 12,
          backgroundColor: '#ecfeff',
          borderRadius: 6,
          border: '2px solid #0891b2',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 12, color: '#155e75' }}>{step.message}</div>
      </div>
    </div>
  )
}

export default function Problem80Visualizer() {
  const [ex, setEx] = useState(EXAMPLES[0]);
  const [numsInput, setNumsInput] = useState("[1,1,1,2,2,3]");
  const { nums, inputError } = useMemo(() => {
    try {
      const parsedNums = JSON.parse(numsInput); if (!Array.isArray(parsedNums)) throw new Error('nums must be an array');
      return { nums: parsedNums, inputError: '' };
    } catch (e) {
      return { nums: "[1,1,1,2,2,3]", inputError: e.message };
    }
  }, [numsInput]);
  const steps = useMemo(
    () => generateSteps(nums).map((c) => ({
      ...c,
      relatedLines: c.relatedLines ?? (c.activeLine != null ? [c.activeLine] : []),
    })),
    [nums]
  )
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const applyEx = useCallback((e) => { setEx(e); setNumsInput(JSON.stringify(e.nums)); handleReset(); }, [handleReset]);
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  // Extract panels into consts
  const codePanel = (
    <div style={{ position: 'relative', height: '100%' }}>
      <CodeTracePanel
        step={step}
        codeLines={SOLUTION_CODE}
        highlightedLines={connectivity.highlightedLines}
        onLineSelect={connectivity.handleLineSelect}
        onActiveLineDomChange={setActiveLineDom}
        disableResizer
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

  const primaryPanel = (
    <>
      <ManualInputPanel
        fields={[{"key":"nums","label":"nums","type":"array"}]}
        values={{ nums: numsInput }}
        onChange={(k, v) => { if (k === 'nums') setNumsInput(v); handleReset() }}
        examples={EXAMPLES}
        activeLabel={ex?.label}
        applyExample={applyEx}
        inputError={inputError}
      />
    <div className="problem80-panel">
      <VisualizationPanel step={step} />
    </div>
  
    </>)

  const statusPanel = (
    <div className="problem80-status">
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', padding: '8px 12px' }}>
        {EXAMPLES.map((e) => (
          <button
            key={e.label}
            onClick={() => applyEx(e)}
            style={{
              padding: '6px 12px',
              borderRadius: 4,
              border: ex.label === e.label ? '2px solid #0891b2' : '1px solid var(--border)',
              cursor: 'pointer',
              fontSize: 12,
              backgroundColor: ex.label === e.label ? '#cffafe' : 'var(--surface2)',
              color: '#155e75',
              fontWeight: 600,
            }}
          >
            {e.label}: [{e.nums.join(',')}]
          </button>
        ))}
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

  // Lumino panel config
  const [panelDivs, setPanelDivs] = useState(null)
  const panelConfigs = useMemo(
    () => [
      { id: 'primary', title: '🔢 Remove Duplicates II', dockMode: 'split-right' },
      { id: 'code', title: 'Code', dockMode: 'split-bottom' },
      { id: 'status', title: 'Status', dockMode: 'split-bottom', ratio: 0.08 },
    ],
    []
  )
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  return (
    <div className="problem80-shell">
      <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
      {panelDivs && (
        <>
          {panelDivs.primary && createPortal(primaryPanel, panelDivs.primary)}
          {panelDivs.code && createPortal(codePanel, panelDivs.code)}
          {panelDivs.status && createPortal(statusPanel, panelDivs.status)}
        </>
      )}
      {createPortal(
        <FloatingPanel title="Playback Controls">{playbackPanel}</FloatingPanel>,
        document.body
      )}
    </div>
  )
}
