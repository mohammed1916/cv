import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import PatternOverlay from '../../components/PatternOverlay'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamples } from '../../config/examplesRegistry'
import './FourSumVisualizer.css'
import FloatingPanel from '../../components/shared/FloatingPanel'

const FOURSUM_PATTERNS = ['sort', 'fix_i', 'skip_i', 'fix_j', 'skip_j', 'calc', 'found', 'move_l', 'move_r', 'done']

// Map which code line corresponds to which pattern
const LINE_PATTERN_MAP = {
  3: 'sort',    // nums.sort()
  4: 'fix_i',   // result = []
  5: 'fix_i',   // for i in range(len(nums) - 3):
  6: 'skip_i',  // if i > 0 and nums[i] == nums[i - 1]:
  7: 'skip_i',  // continue  # skip i-duplicates
  8: 'fix_j',   // for j in range(i + 1, len(nums) - 2):
  9: 'skip_j',  // if j > i + 1 and nums[j] == nums[j - 1]:
  10: 'skip_j', // continue  # skip j-duplicates
  11: 'calc',   // l, r = j + 1, len(nums) - 1
  12: 'calc',   // while l < r:
  13: 'calc',   // s = nums[i] + nums[j] + nums[l] + nums[r]
  14: 'found',  // if s == target:
  15: 'found',  // result.append([nums[i], nums[j], nums[l], nums[r]])
  16: 'move_l', // l += 1
  17: 'move_r', // r -= 1
  18: 'move_l', // elif s < target:
  19: 'move_l', // l += 1
  20: 'move_r', // else:
  21: 'move_r', // r -= 1
}

const SOLUTION_CODE = [
    { line: 1, text: 'class Solution:' },
    { line: 2, text: '    def fourSum(self, nums: List[int], target: int) -> List[List[int]]:' },
    { line: 3, text: '        nums.sort()' },
    { line: 4, text: '        result = []' },
    { line: 5, text: '        for i in range(len(nums) - 3):' },
    { line: 6, text: '            if i > 0 and nums[i] == nums[i - 1]:' },
    { line: 7, text: '                continue  # skip i-duplicates' },
    { line: 8, text: '            for j in range(i + 1, len(nums) - 2):' },
    { line: 9, text: '                if j > i + 1 and nums[j] == nums[j - 1]:' },
    { line: 10, text: '                    continue  # skip j-duplicates' },
    { line: 11, text: '                l, r = j + 1, len(nums) - 1' },
    { line: 12, text: '                while l < r:' },
    { line: 13, text: '                    s = nums[i] + nums[j] + nums[l] + nums[r]' },
    { line: 14, text: '                    if s == target:' },
    { line: 15, text: '                        result.append([nums[i], nums[j], nums[l], nums[r]])' },
    { line: 16, text: '                        l += 1' },
    { line: 17, text: '                        while l < r and nums[l] == nums[l-1]: l += 1' },
    { line: 18, text: '                    elif s < target:' },
    { line: 19, text: '                        l += 1' },
    { line: 20, text: '                    else:' },
    { line: 21, text: '                        r -= 1' },
    { line: 22, text: '        return result' },
]

function generateSteps(nums, target) {
    const steps = []
    const n = nums.length

    if (n < 4) {
        steps.push({
            phase: 'done', activeLine: 22, sorted: [...nums],
            i: null, j: null, l: null, r: null, sum: null, result: [],
            message: 'Need at least 4 elements. Return [].',
        })
        return steps
    }

    const sorted = [...nums].sort((a, b) => a - b)
    const snapshot = () => result.map(q => [...q])

    steps.push({
        phase: 'sort', activeLine: 3, sorted: [...sorted],
        i: null, j: null, l: null, r: null, sum: null, result: [],
        message: `Sort array → [${sorted.join(', ')}]`,
    })

    const result = []

    for (let i = 0; i <= n - 4; i++) {
        if (i > 0 && sorted[i] === sorted[i - 1]) {
            steps.push({
                phase: 'skip_i', activeLine: 7, sorted: [...sorted],
                i, j: null, l: null, r: null, sum: null, result: snapshot(),
                message: `Skip duplicate at i=${i}: nums[${i}]=${sorted[i]} equals nums[${i - 1}]=${sorted[i - 1]}.`,
            })
            continue
        }

        for (let j = i + 1; j <= n - 3; j++) {
            if (j > i + 1 && sorted[j] === sorted[j - 1]) {
                steps.push({
                    phase: 'skip_j', activeLine: 10, sorted: [...sorted],
                    i, j, l: null, r: null, sum: null, result: snapshot(),
                    message: `Skip duplicate at j=${j}: nums[${j}]=${sorted[j]} equals nums[${j - 1}]=${sorted[j - 1]}.`,
                })
                continue
            }

            let l = j + 1
            let r = n - 1

            steps.push({
                phase: 'fix_j', activeLine: 11, sorted: [...sorted],
                i, j, l, r, sum: null, result: snapshot(),
                message: `Fix i=${i}, j=${j}. Set l=${l}, r=${r}.`,
            })

            while (l < r) {
                const s = sorted[i] + sorted[j] + sorted[l] + sorted[r]

                steps.push({
                    phase: 'calc', activeLine: 13, sorted: [...sorted],
                    i, j, l, r, sum: s, result: snapshot(),
                    message: `nums[${i}]=${sorted[i]} + nums[${j}]=${sorted[j]} + nums[${l}]=${sorted[l]} + nums[${r}]=${sorted[r]} = ${s}.`,
                })

                if (s === target) {
                    result.push([sorted[i], sorted[j], sorted[l], sorted[r]])
                    steps.push({
                        phase: 'found', activeLine: 15, sorted: [...sorted],
                        i, j, l, r, sum: s, result: snapshot(),
                        message: `Sum is ${target}! Quadruplet [${sorted[i]}, ${sorted[j]}, ${sorted[l]}, ${sorted[r]}] added. Total: ${result.length}.`,
                    })
                    l++
                    while (l < r && sorted[l] === sorted[l - 1]) {
                        steps.push({
                            phase: 'skip_l', activeLine: 17, sorted: [...sorted],
                            i, j, l, r, sum: s, result: snapshot(),
                            message: `Skip l-duplicate: nums[${l}]=${sorted[l]} == nums[${l - 1}]=${sorted[l - 1]}. l → ${l + 1}.`,
                        })
                        l++
                    }
                } else if (s < target) {
                    steps.push({
                        phase: 'move_l', activeLine: 19, sorted: [...sorted],
                        i, j, l, r, sum: s, result: snapshot(),
                        message: `Sum ${s} < ${target}. Need bigger value. Move l right: ${l} → ${l + 1}.`,
                    })
                    l++
                } else {
                    steps.push({
                        phase: 'move_r', activeLine: 21, sorted: [...sorted],
                        i, j, l, r, sum: s, result: snapshot(),
                        message: `Sum ${s} > ${target}. Need smaller value. Move r left: ${r} → ${r - 1}.`,
                    })
                    r--
                }
            }
        }
    }

    steps.push({
        phase: 'done', activeLine: 22, sorted: [...sorted],
        i: null, j: null, l: null, r: null, sum: null, result: snapshot(),
        message: `Done! Found ${result.length} unique quadruplet(s).`,
    })

    return steps
}

const EXAMPLES = getExamples('four-sum')

export default function FourSumVisualizer() {
    const [numsInput, setNumsInput] = useState('[1000000000,1000000000,1000000000,1000000000]')
    const [targetInput, setTargetInput] = useState('-294967296')
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
            return { nums: [1000000000, 1000000000, 1000000000, 1000000000], target: -294967296, inputError: e.message || 'Invalid input' }
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

    return (
        <div className="fs4-shell">
            <div className="fs4-top">
                {/* ── Left: array + pointers ── */}
                <section className="fs4-panel main">
                    <header className="fs4-head">
                        <span>Sorted Array · Two Pointers</span>
                        {inputError && <span className="fs4-error">{inputError}</span>}
                    </header>
                    <div className="fs4-body">
                        <div className="fs4-examples">
                            {EXAMPLES.map((ex) => (
                                <button key={ex.label} className="fs4-chip" onClick={() => applyExample(ex)}>
                                    {ex.label}
                                </button>
                            ))}
                        </div>
                        <div className="fs4-input-row">
                            <input
                                className="fs4-input"
                                value={numsInput}
                                onChange={(e) => { setNumsInput(e.target.value); handleReset() }}
                                placeholder="[1,0,-1,0,-2,2]"
                            />
                            <input
                                className="fs4-input target"
                                value={targetInput}
                                onChange={(e) => { setTargetInput(e.target.value); handleReset() }}
                                placeholder="0"
                            />
                        </div>

                        <div className="fs4-array">
                            {sorted.map((val, idx) => {
                                const isI = step?.i === idx
                                const isJ = step?.j === idx
                                const isL = step?.l === idx
                                const isR = step?.r === idx
                                const isFound = step?.phase === 'found' && (isI || isJ || isL || isR)
                                const lifted = isI || isJ || isL || isR
                                return (
                                    <div key={idx} className="fs4-cell-wrap">
                                        <motion.div
                                            className={`fs4-cell${isI ? ' i' : ''}${isJ ? ' j' : ''}${isL ? ' left' : ''}${isR ? ' right' : ''}${isFound ? ' found' : ''}`}
                                            animate={{ y: lifted ? -12 : 0, scale: lifted ? 1.15 : 1 }}
                                            transition={{ type: 'spring', stiffness: 420, damping: 26 }}
                                        >
                                            {val}
                                        </motion.div>
                                        <span className="fs4-idx">{idx}</span>
                                        <div className="fs4-ptrs">
                                            {isI && <span className="fs4-ptr fs4-ptr-i">i</span>}
                                            {isJ && <span className="fs4-ptr fs4-ptr-j">j</span>}
                                            {isL && <span className="fs4-ptr fs4-ptr-l">l</span>}
                                            {isR && <span className="fs4-ptr fs4-ptr-r">r</span>}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        {step?.sum != null && (
                            <div className="fs4-sum-box">
                                <span className="fs4-sum-label">nums[i] + nums[j] + nums[l] + nums[r] =</span>
                                <span className="fs4-sum-val mono">{step.sum}</span>
                                <span className={`fs4-sum-verdict${step.sum === target ? ' match' : step.sum < target ? ' neg' : ' pos'}`}>
                                    {step.sum === target ? `= ${target} ✓` : step.sum < target ? `< ${target} → l →` : `> ${target} → ← r`}
                                </span>
                            </div>
                        )}
                    </div>
                </section>

                {/* ── Right: results ── */}
                <section className="fs4-panel results">
                    <header className="fs4-head"><span>Quadruplets Found</span></header>
                    <div className="fs4-body">
                        <AnimatePresence>
                            {(step?.result ?? []).map((quad) => (
                                <motion.div
                                    key={quad.join(',')}
                                    className="fs4-quad"
                                    initial={{ opacity: 0, x: 24 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0 }}
                                >
                                    <span className="mono">[{quad.join(', ')}]</span>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        {(!step?.result || step.result.length === 0) && (
                            <div className="fs4-empty">No quadruplets yet</div>
                        )}
                    </div>
                </section>
            </div>

            <div style={{ position: 'relative' }}>
              <CodeTracePanel step={step} codeLines={SOLUTION_CODE} onActiveLineDomChange={setActiveLineDom} />
              {showPatternOverlay && (
                <CodePatternAnnotations
                  linePatterns={LINE_PATTERN_MAP}
                  currentPhase={step?.phase}
                  activeLineDom={activeLineDom}
                />
              )}
            </div>

            <div className={`fs4-status${step?.phase === 'found' ? ' ok' : step?.phase === 'done' ? ' done' : ''}`}>
                {step?.message ?? 'Press Play or Step to begin.'}
            </div>

            <FloatingPanel title="Playback Controls">
        {showPatternOverlay && (
          <PatternLegend currentPhase={step?.phase} usedPatterns={FOURSUM_PATTERNS} />
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
            {showPatternOverlay && step && <PatternOverlay step={step} activeLineDom={activeLineDom} />}
        </div>
    )
}
