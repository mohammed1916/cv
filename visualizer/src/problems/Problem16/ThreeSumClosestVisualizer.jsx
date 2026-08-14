import { useState, useMemo, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import PatternOverlay from '../../components/PatternOverlay'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamples } from '../../config/examplesRegistry'
import './ThreeSumClosestVisualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import FloatingPanel from '../../components/shared/FloatingPanel'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import { useAutoScroll } from '../../hooks/useAutoScroll'

const SOLUTION_CODE = [
    { line: 1, text: 'class Solution:' },
    { line: 2, text: '    def threeSumClosest(self, nums: List[int], target: int) -> int:' },
    { line: 3, text: '        nums.sort()' },
    { line: 4, text: '        closest = nums[0] + nums[1] + nums[2]' },
    { line: 5, text: '        for i in range(len(nums) - 2):' },
    { line: 6, text: '            l, r = i + 1, len(nums) - 1' },
    { line: 7, text: '            while l < r:' },
    { line: 8, text: '                s = nums[i] + nums[l] + nums[r]' },
    { line: 9, text: '                if abs(s - target) < abs(closest - target):' },
    { line: 10, text: '                    closest = s' },
    { line: 11, text: '                if s < target: l += 1' },
    { line: 12, text: '                else: r -= 1' },
    { line: 13, text: '        return closest' },
]

const THREESUMCLOSEST_PATTERNS = ['init', 'fix_i', 'calc', 'update', 'move_l', 'move_r', 'done']

// Map which code line corresponds to which pattern
const LINE_PATTERN_MAP = {
  3: 'init',    // nums.sort()
  4: 'init',    // closest = nums[0] + nums[1] + nums[2]
  5: 'fix_i',   // for i in range(len(nums) - 2):
  6: 'fix_i',   // l, r = i + 1, len(nums) - 1
  7: 'calc',    // while l < r:
  8: 'calc',    // s = nums[i] + nums[l] + nums[r]
  9: 'update',  // if abs(s - target) < abs(closest - target):
  10: 'update', // closest = s
  11: 'move_l', // if s < target: l += 1
  12: 'move_r', // else: r -= 1
  13: 'done',   // return closest
}

function generateSteps(nums, target) {
    const steps = []
    const n = nums.length

    if (n < 3) {
        steps.push({
            phase: 'done', activeLine: 13, sorted: [...nums],
            i: null, l: null, r: null, sum: null, closest: 0, diff: null,
            message: 'Need at least 3 elements. Return initial sum.',
        })
        return steps
    }

    const sorted = [...nums].sort((a, b) => a - b)

    let closest = sorted[0] + sorted[1] + sorted[2]
    steps.push({
        phase: 'init', activeLine: 4, sorted: [...sorted],
        i: null, l: null, r: null, sum: null, closest: closest, diff: Math.abs(closest - target),
        message: `Sort array → [${sorted.join(', ')}]. Initialize closest = ${closest} (diff = ${Math.abs(closest - target)})`,
    })

    for (let i = 0; i <= n - 3; i++) {
        let l = i + 1
        let r = n - 1

        steps.push({
            phase: 'fix_i', activeLine: 6, sorted: [...sorted],
            i, l, r, sum: null, closest: closest, diff: Math.abs(closest - target),
            message: `Fix i=${i} (nums[i]=${sorted[i]}). Set l=${l}, r=${r}.`,
        })

        while (l < r) {
            const s = sorted[i] + sorted[l] + sorted[r]
            const diff = Math.abs(s - target)
            const closestDiff = Math.abs(closest - target)

            steps.push({
                phase: 'calc', activeLine: 8, sorted: [...sorted],
                i, l, r, sum: s, closest: closest, diff: diff,
                message: `nums[${i}]=${sorted[i]} + nums[${l}]=${sorted[l]} + nums[${r}]=${sorted[r]} = ${s} (diff: ${diff})`,
            })

            if (diff < closestDiff) {
                closest = s
                steps.push({
                    phase: 'update', activeLine: 10, sorted: [...sorted],
                    i, l, r, sum: s, closest: closest, diff: diff,
                    message: `New closest! ${s} is closer to ${target} than ${s === closest ? closest : closest}. (diff: ${diff})`,
                })
            }

            if (s < target) {
                steps.push({
                    phase: 'move_l', activeLine: 11, sorted: [...sorted],
                    i, l, r, sum: s, closest: closest, diff: Math.abs(closest - target),
                    message: `Sum ${s} < ${target}. Need bigger. Move l right: ${l} → ${l + 1}.`,
                })
                l++
            } else {
                steps.push({
                    phase: 'move_r', activeLine: 12, sorted: [...sorted],
                    i, l, r, sum: s, closest: closest, diff: Math.abs(closest - target),
                    message: `Sum ${s} >= ${target}. Need smaller. Move r left: ${r} → ${r - 1}.`,
                })
                r--
            }
        }
    }

    steps.push({
        phase: 'done', activeLine: 13, sorted: [...sorted],
        i: null, l: null, r: null, sum: null, closest: closest, diff: Math.abs(closest - target),
        result: closest,
        message: `Done! Closest sum to ${target} is ${closest} (difference: ${Math.abs(closest - target)})`,
    })

    return steps
}

const EXAMPLES = getExamples('three-sum-closest')

export default function ThreeSumClosestVisualizer() {
    const [numsInput, setNumsInput] = useState('[-1,2,1,-4]')
    const [targetInput, setTargetInput] = useState('1')
    const [panelDivs, setPanelDivs] = useState(null)
    const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

    const { nums, target, inputError } = useMemo(() => {
        try {
            const n = JSON.parse(numsInput)
            const t = JSON.parse(targetInput)
            if (!Array.isArray(n)) throw new Error('nums must be an array')
            if (typeof t !== 'number') throw new Error('target must be a number')
            if (n.length > 12) throw new Error('Max 12 elements for clarity')
            return { nums: n, target: t, inputError: '' }
        } catch (e) {
            return { nums: [-1, 2, 1, -4], target: 1, inputError: e.message || 'Invalid input' }
        }
    }, [numsInput, targetInput])

    const steps = useMemo(() => generateSteps(nums, target), [nums, target])

    const {
        stepIndex, stepForward, stepBack, togglePlay,
        handleReset, isPlaying, speed, setSpeed, isDone,
    } = usePlaybackState(steps.length)

    const step = stepIndex >= 0 ? steps[stepIndex] : null

    const applyExample = useCallback((ex) => {
        setNumsInput(JSON.stringify(ex.nums))
        setTargetInput(JSON.stringify(ex.target))
        handleReset()
    }, [handleReset])

    const sorted = step?.sorted ?? [...nums].sort((a, b) => a - b)

    // Step 2: Extract panels into consts
    const primaryPanel = (
    <>

      <ManualInputPanel
        fields={[{"key":"nums","label":"nums","type":"array"},{"key":"target","label":"target","type":"array"}]}
        values={{ nums: numsInput, target: targetInput }}
        onChange={(k, v) => { if (k === 'nums') setNumsInput(v); if (k === 'target') setTargetInput(v); handleReset(); }}
        examples={EXAMPLES}
        activeLabel={ex?.label}
        applyExample={applyEx}
        inputError={inputError}
        showExamples={false}
      />

      <div className="tsc3-panel main">
        <header className="tsc3-head">
          <span>Sorted Array · Two Pointers</span>
          {inputError && <span className="tsc3-error">{inputError}</span>}
        </header>
        <div className="tsc3-body">
          <div className="tsc3-examples">
            {EXAMPLES.map((ex) => (
              <button key={ex.label} className="tsc3-chip" onClick={() => applyExample(ex)}>
                {ex.label}
              </button>
            ))}
          </div>
          <div className="tsc3-input-row">
            <input
              className="tsc3-input"
              value={numsInput}
              onChange={(e) => { setNumsInput(e.target.value); handleReset() }}
              placeholder="[-1,2,1,-4]"
            />
            <input
              className="tsc3-input target"
              value={targetInput}
              onChange={(e) => { setTargetInput(e.target.value); handleReset() }}
              placeholder="1"
            />
          </div>

          <div className="tsc3-array">
            {sorted.map((val, idx) => {
              const isI = step?.i === idx
              const isL = step?.l === idx
              const isR = step?.r === idx
              const isActive = step?.phase === 'calc' && (isI || isL || isR)
              const lifted = isI || isL || isR
              return (
                <div key={idx} className="tsc3-cell-wrap">
                  <motion.div
                    className={`tsc3-cell${isI ? ' i' : ''}${isL ? ' left' : ''}${isR ? ' right' : ''}${isActive ? ' active' : ''}`}
                    animate={{ y: lifted ? -12 : 0, scale: lifted ? 1.15 : 1 }}
                    transition={{ type: 'spring', stiffness: 420, damping: 26 }}
                  >
                    {val}
                  </motion.div>
                  <span className="tsc3-idx">{idx}</span>
                  <div className="tsc3-ptrs">
                    {isI && <span className="tsc3-ptr tsc3-ptr-i">i</span>}
                    {isL && <span className="tsc3-ptr tsc3-ptr-l">l</span>}
                    {isR && <span className="tsc3-ptr tsc3-ptr-r">r</span>}
                  </div>
                </div>
              )
            })}
          </div>

          {step?.sum != null && (
            <div className="tsc3-sum-box">
              <span className="tsc3-sum-label">Current Sum</span>
              <span className="tsc3-sum-val mono">{step.sum}</span>
              <span className={`tsc3-sum-diff${step.phase === 'update' ? ' updated' : ''}`}>
                diff: {step.diff}
              </span>
              <span className={`tsc3-sum-verdict${step.sum === target ? ' match' : step.sum < target ? ' less' : ' greater'}`}>
                {step.sum === target ? '= target' : step.sum < target ? '< target' : '> target'}
              </span>
            </div>
          )}
        </div>
      </div>
    
    </>)

    const statePanel = (
      <div className="tsc3-panel results">
        <header className="tsc3-head"><span>Tracking Closest</span></header>
        <div className="tsc3-body">
          <div className="tsc3-closest-display">
            <div className="tsc3-closest-label">Target</div>
            <div className="tsc3-closest-value mono">{target}</div>
          </div>
          <div className="tsc3-closest-display">
            <div className="tsc3-closest-label">Current Closest</div>
            <motion.div
              key={String(step?.closest)}
              className="tsc3-closest-value mono"
              initial={{ scale: 1.3 }}
              animate={{ scale: 1 }}
            >
              {step?.closest ?? (nums.length >= 3 ? nums.slice(0, 3).reduce((a, b) => a + b) : 0)}
            </motion.div>
          </div>
          <div className="tsc3-closest-display">
            <div className="tsc3-closest-label">Difference</div>
            <motion.div
              key={String(step?.diff)}
              className="tsc3-closest-value mono"
              initial={{ scale: 1.3 }}
              animate={{ scale: 1 }}
            >
              {step?.diff ?? 0}
            </motion.div>
          </div>
          {step?.result != null && (
            <div className="tsc3-result-box">
              <div className="tsc3-result-label">Final Answer</div>
              <motion.div
                className="tsc3-result-value mono"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
              >
                {step.result}
              </motion.div>
            </div>
          )}
        </div>
      </div>
    )

    const codePanel = (
      <div style={{ position: 'relative', height: '100%' }}>
        <CodeTracePanel
          step={step}
          codeLines={SOLUTION_CODE}
          onActiveLineDomChange={setActiveLineDom}
          disableResizer
        />
        {showPatternOverlay && (
          <CodePatternAnnotations
            linePatterns={LINE_PATTERN_MAP}
            currentPhase={step?.phase}
            activeLineDom={activeLineDom}
          />
        )}
      </div>
    )

    const statusPanel = (
      <div className={`tsc3-status${step?.phase === 'update' ? ' highlight' : step?.phase === 'done' ? ' done' : ''}`}>
        {step?.message ?? 'Press Play or Step to begin.'}
      </div>
    )

    const playbackPanel = (
        {showPatternOverlay && (
          <PatternLegend currentPhase={step?.phase} usedPatterns={THREESUMCLOSEST_PATTERNS} />
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

    // Step 3: Add panelConfigs with status panel at bottom
    const panelConfigs = useMemo(
      () => [
        { id: 'primary', title: 'Sorted Array · Two Pointers', dockMode: 'split-right' },
        { id: 'state', title: 'Tracking Closest', dockMode: 'split-right' },
        { id: 'code', title: 'Code', dockMode: 'split-bottom' },
        { id: 'status', title: 'Status', dockMode: 'split-bottom', ratio: 0.08 },
      ],
      []
    )
    const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

    // Step 4: Replace return with portals
    return (
      <div className="tsc3-shell">
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
          document.body
        )}
        {showPatternOverlay && step && <PatternOverlay step={step} activeLineDom={activeLineDom} />}
      </div>
    )
}
