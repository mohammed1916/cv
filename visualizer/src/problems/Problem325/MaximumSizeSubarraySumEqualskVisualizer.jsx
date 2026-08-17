import { useState, useCallback, useMemo } from 'react'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import PointerRail from '../../components/shared/PointerRail'
import FloatingPanel from '../../components/shared/FloatingPanel'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamplesOr } from '../../config/examplesRegistry'
import { createPortal } from 'react-dom'
import './MaximumSizeSubarraySumEqualskVisualizer.css'

const PATTERNS = ['done', 'init', 'process']
const LINE_PATTERN_MAP = { 3: 'init', 6: 'process', 7: 'process', 9: 'process', 10: 'done' }
const SOLUTION_CODE = [
  { line: 1, text: 'class Solution:' }, { line: 2, text: '    def maxSubArrayLen(self, nums, k):' },
  { line: 3, text: '        first = {0: -1}; prefix = best = 0' }, { line: 4, text: '        for i, value in enumerate(nums):' },
  { line: 5, text: '            prefix += value' }, { line: 6, text: '            if prefix - k in first:' },
  { line: 7, text: '                best = max(best, i - first[prefix - k])' }, { line: 8, text: '            if prefix not in first:' },
  { line: 9, text: '                first[prefix] = i' }, { line: 10, text: '        return best' },
]
function generateSteps({ nums, k }) {
  const steps = [{ phase: 'init', activeLine: 3, message: 'Store each prefix sum’s first index. Prefix 0 occurs before index 0.', prefix: 0, best: 0, first: { 0: -1 }, index: null }]
  const first = new Map([[0, -1]]); let prefix = 0; let best = 0
  nums.forEach((value, index) => {
    prefix += value; const needed = prefix - k; const previous = first.get(needed); const before = best
    if (previous !== undefined) best = Math.max(best, index - previous)
    steps.push({ phase: 'process', activeLine: previous !== undefined ? 7 : 6, message: previous !== undefined ? `Prefix ${needed} was first seen at ${previous}: [${previous + 1}, ${index}] sums to ${k}.` : `Need prefix ${needed}; it has not appeared yet.`, prefix, needed, best, previous, improved: best > before, first: Object.fromEntries(first), index })
    if (!first.has(prefix)) { first.set(prefix, index); steps.push({ phase: 'process', activeLine: 9, message: `Remember prefix ${prefix} at its first position, ${index}.`, prefix, needed, best, first: Object.fromEntries(first), index }) }
  })
  steps.push({ phase: 'done', activeLine: 10, message: `The longest subarray with sum ${k} has length ${best}.`, prefix, best, first: Object.fromEntries(first), index: null })
  return steps
}
const EXAMPLES = getExamplesOr('max-size-subarray-sum-k', [{ label: 'Classic', nums: [1, -1, 5, -2, 3], k: 3 }])
function parseInput(raw) { try { const data = JSON.parse(raw); if (!Array.isArray(data.nums) || !data.nums.every(Number.isFinite) || !Number.isFinite(data.k)) throw new Error('Use { "nums": [numbers], "k": number }.'); return { input: data, inputError: '' } } catch (error) { return { input: null, inputError: error.message } } }

export default function MaximumSizeSubarraySumEqualskVisualizer() {
  const [inputValue, setInputValue] = useState(JSON.stringify(EXAMPLES[0] || { nums: [1, -1, 5, -2, 3], k: 3 }))
  const { input, inputError } = useMemo(() => parseInput(inputValue), [inputValue])
  const steps = useMemo(() => input ? generateSteps(input).map((step) => ({ ...step, relatedLines: [step.activeLine] })) : [], [input])
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } = usePlaybackState(steps.length)
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay(); const step = stepIndex >= 0 ? steps[stepIndex] : null
  const applyExample = useCallback((example) => { setInputValue(JSON.stringify(example)); handleReset() }, [handleReset])
  const visualization = !input ? <div className="maximum-size-subarray-sum-equalsk-error">{inputError}</div> : <div className="maximum-size-subarray-sum-equalsk-viz"><div className="maximum-size-subarray-sum-equalsk-step-info"><h3>{step?.message || 'Press play to trace prefix sums.'}</h3></div><PointerRail title="Numbers" values={input.nums} pointers={step?.index == null ? [] : [{ id: 'i', index: step.index, label: 'i', tone: 'primary' }]} /><div className="maximum-size-subarray-sum-equalsk-summary"><b>prefix</b><code>{step?.prefix ?? 0}</code><b>needed</b><code>{step?.needed ?? '—'}</code><b>best length</b><code>{step?.best ?? 0}</code></div></div>
  const state = <div className="maximum-size-subarray-sum-equalsk-panel maximum-size-subarray-sum-equalsk-panel-viz"><div className="maximum-size-subarray-sum-equalsk-panel-head">First prefix positions</div><div className="maximum-size-subarray-sum-equalsk-panel-body"><div className="maximum-size-subarray-sum-equalsk-prefix-map">{Object.entries(step?.first || { 0: -1 }).map(([sum, index]) => <span key={sum}><b>{sum}</b><i>→</i>{index}</span>)}</div><div className="maximum-size-subarray-sum-equalsk-panel-head">Examples</div><div className="maximum-size-subarray-sum-equalsk-examples">{EXAMPLES.map((example, index) => <button key={index} className="maximum-size-subarray-sum-equalsk-example-btn" onClick={() => applyExample(example)}>{example.label || `Example ${index + 1}`}</button>)}</div></div></div>
  const panelConfigs = useMemo(() => [{ id: 'input', title: 'Input' }, { id: 'code', title: 'Python code', dockMode: 'split-bottom' }, { id: 'viz', title: 'Prefix-sum trace', dockMode: 'split-right' }, { id: 'state', title: 'Remembered prefixes', dockMode: 'split-bottom' }], [])
  const panelContents = { input: <div className="maximum-size-subarray-sum-equalsk-panel maximum-size-subarray-sum-equalsk-panel-input"><div className="maximum-size-subarray-sum-equalsk-panel-head">Input</div><div className="maximum-size-subarray-sum-equalsk-panel-body"><textarea value={inputValue} onChange={(event) => setInputValue(event.target.value)} className="maximum-size-subarray-sum-equalsk-textarea" placeholder='{"nums":[1,-1,5,-2,3],"k":3}' /></div></div>, code: <CodeTracePanel step={step} codeLines={SOLUTION_CODE} highlightedLines={connectivity.highlightedLines} onLineSelect={connectivity.handleLineSelect} onActiveLineDomChange={setActiveLineDom} />, viz: <div className="maximum-size-subarray-sum-equalsk-panel maximum-size-subarray-sum-equalsk-panel-viz"><div className="maximum-size-subarray-sum-equalsk-panel-body">{visualization}</div></div>, state }
  const [panelDivs, setPanelDivs] = useState(null)
  return <div className="maximum-size-subarray-sum-equalsk-shell"><LuminoDockPanel panels={panelConfigs} onPanelReady={setPanelDivs} />{panelDivs && Object.entries(panelContents).map(([id, content]) => panelDivs[id] && createPortal(content, panelDivs[id]))}<FloatingPanel title="Playback Controls">{showPatternOverlay && <PatternLegend currentPhase={step?.phase} usedPatterns={PATTERNS} />}<PlaybackControls isPlaying={isPlaying} isDone={isDone} speed={speed} onPlayToggle={togglePlay} onPrev={stepBack} onNext={stepForward} onReset={handleReset} prevDisabled={stepIndex < 0} nextDisabled={isDone} resetDisabled={stepIndex < 0} onSpeedChange={(event) => setSpeed(Number(event.target.value))} showPatternOverlay={showPatternOverlay} onShowPatternOverlayChange={setShowPatternOverlay} patternOverlayLabel="Show pattern overlay" showPatternOverlayToggle /></FloatingPanel>{showPatternOverlay && <CodePatternAnnotations linePatterns={LINE_PATTERN_MAP} currentPhase={step?.phase} activeLineDom={activeLineDom} activeLine={step?.activeLine} />}</div>
}
