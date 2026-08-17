import { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'

import LuminoDockPanel from '../../components/LuminoDockPanel'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamplesOr } from '../../config/examplesRegistry'
import './MaximumProductofWordLengthsVisualizer.css'
import FloatingPanel from '../../components/shared/FloatingPanel'
import { BitmaskLane } from '../../components/shared'
import PointerRail from '../../components/shared/PointerRail'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import { createPortal } from 'react-dom'

const PATTERNS = ['init', 'encode', 'compare', 'done']
const LINE_PATTERN_MAP = {
  1: 'init',
  3: 'encode',
  7: 'compare',
  9: 'done'
}


const SOLUTION_CODE = [
  { line: 1, text: 'class Solution:' },
  { line: 2, text: '    def maxProduct(self, words: List[str]) -> int:' },
  { line: 3, text: '        masks = [sum(1 << (ord(ch) - ord("a")) for ch in set(word)) for word in words]' },
  { line: 4, text: '        best = 0' },
  { line: 5, text: '        for i in range(len(words)):' },
  { line: 6, text: '            for j in range(i + 1, len(words)):' },
  { line: 7, text: '                if masks[i] & masks[j] == 0:' },
  { line: 8, text: '                    best = max(best, len(words[i]) * len(words[j]))' },
  { line: 9, text: '        return best' },
]

function letters(word) { return [...new Set(word)].sort().join('') }

function generateSteps({ words }) {
  const steps = []
  const masks = []
  steps.push({ phase: 'init', activeLine: 1, words, masks: [], best: 0, message: 'Encode each word as a 26-bit set of the letters it contains.' })
  for (let index = 0; index < words.length; index += 1) {
    let mask = 0
    for (const character of words[index]) mask |= 1 << (character.charCodeAt(0) - 97)
    masks.push(mask)
    steps.push({ phase: 'encode', activeLine: 3, words, masks: [...masks], activeWord: index, best: 0, message: `${words[index]} becomes the set {${letters(words[index])}}.` })
  }
  let best = 0
  for (let i = 0; i < words.length; i += 1) for (let j = i + 1; j < words.length; j += 1) {
    const overlap = masks[i] & masks[j]
    const product = words[i].length * words[j].length
    const improves = overlap === 0 && product > best
    if (improves) best = product
    steps.push({ phase: 'compare', activeLine: 8, words, masks, pair: [i, j], overlap, product, improves, best, message: overlap ? `${words[i]} and ${words[j]} share {${letters(words[i]).split('').filter((ch) => letters(words[j]).includes(ch)).join('')}} — reject this pair.` : `${words[i]} and ${words[j]} are disjoint: product = ${product}${improves ? ', a new best.' : '.'}` })
  }
  steps.push({ phase: 'done', activeLine: 9, words, masks, best, message: `Every pair is checked. The maximum product is ${best}.` })
  return steps
}

const EXAMPLES = getExamplesOr('max-product-word-lengths', [
  { label: 'Classic', words: ['abcw', 'baz', 'foo', 'bar', 'xtfn', 'abcdef'] },
  { label: 'No disjoint pair', words: ['a', 'aa', 'aaa', 'aaaa'] },
  { label: 'Two words', words: ['abc', 'def'] },
])

export default function MaximumProductofWordLengthsVisualizer() {
  const [inputValue, setInputValue] = useState(JSON.stringify(EXAMPLES[0]))

  const { input, inputError } = useMemo(() => {
    try {
      const data = JSON.parse(inputValue)
      if (!Array.isArray(data.words) || !data.words.every((word) => typeof word === 'string' && /^[a-z]+$/.test(word))) throw new Error('Use { "words": ["lowercase", "words"] }.')
      if (data.words.length > 10) throw new Error('Use at most 10 words so every comparison stays visible.')
      return { input: data, inputError: '' }
    } catch (e) {
      return { input: null, inputError: e.message }
    }
  }, [inputValue])

  const steps = useMemo(() => {
    return input ? generateSteps(input) : []
  }, [input])

  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } = usePlaybackState(steps.length)

  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const applyExample = useCallback((ex) => {
    setInputValue(JSON.stringify(ex))
    handleReset()
  }, [handleReset])

  const connectivity = useCodeVisualConnectivity({
    steps,
    stepIndex,
    onStepJump: setStepIndex,
  })

  const renderVisualization = () => {
    if (!input) return <div className="maximum-productof-word-lengths-error">{inputError}</div>

    return (
      <div className="maximum-productof-word-lengths-viz">
        <div className="maximum-productof-word-lengths-step-info">
          <h3>{step?.message ?? 'Press Play or Step to begin.'}</h3>
        </div>
        <BitmaskLane
          entries={(step?.words || input.words).map((word) => ({ label: word, letters: step?.masks?.length ? letters(word) : '' }))}
          active={step?.activeWord === undefined ? [] : [step.activeWord]}
          pair={step?.pair}
          overlap={Boolean(step?.overlap)}
        />
        {step?.pair && <PointerRail title="Pair scan pointers" values={step.words} pointers={[{ id: 'i', label: 'i', index: step.pair[0], tone: 'primary' }, { id: 'j', label: 'j', index: step.pair[1], tone: 'warning' }]} note="Compare only pairs i < j." />}
        {step?.pair && <div className={`maximum-productof-word-lengths-pair ${step.overlap ? 'overlap' : 'disjoint'}`}><span>Pair</span><code>{step.words[step.pair[0]]} × {step.words[step.pair[1]]} = {step.product}</code><span>{step.overlap ? 'shared letters' : 'disjoint'}</span></div>}
        <div className="maximum-productof-word-lengths-best"><span>best product</span><strong>{step?.best ?? 0}</strong></div>
      </div>
    )
  }

  const panelConfigs = useMemo(() => [
    { id: 'code', title: 'Code' },
    { id: 'input', title: 'Input', dockMode: 'split-bottom' },
    { id: 'viz', title: '🔤 Bitmask comparison', dockMode: 'split-right' },
  ], [])
  const panelContents = {
    code: (<div style={{ position: 'relative', height: '100%', minHeight: 0 }}><CodeTracePanel step={step} codeLines={SOLUTION_CODE} highlightedLines={connectivity.highlightedLines} onLineSelect={connectivity.handleLineSelect} onActiveLineDomChange={setActiveLineDom} disableResizer />{showPatternOverlay && <CodePatternAnnotations linePatterns={LINE_PATTERN_MAP} currentPhase={step?.phase} activeLineDom={activeLineDom} activeLine={step?.activeLine} />}</div>),
    input: (<div className="maximum-productof-word-lengths-panel"><div className="maximum-productof-word-lengths-panel-head">Words input</div><div className="maximum-productof-word-lengths-panel-body"><textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="maximum-productof-word-lengths-textarea"
                placeholder="Enter input..."
              />
              <div className="maximum-productof-word-lengths-examples">{EXAMPLES.map((example) => <button key={example.label} className="maximum-productof-word-lengths-example-btn" onClick={() => applyExample(example)}>{example.label}</button>)}</div></div></div>),
    viz: (<div className="maximum-productof-word-lengths-panel maximum-productof-word-lengths-panel-viz"><div className="maximum-productof-word-lengths-panel-head">Bitmasks</div><div className="maximum-productof-word-lengths-panel-body">{renderVisualization()}</div></div>),
  }
  const [panelDivs, setPanelDivs] = useState(null)
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])
  return (
    <div className="maximum-productof-word-lengths-shell">
      <>
        <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
        {panelDivs && (
          <>
            {panelDivs.code && createPortal(panelContents.code, panelDivs.code)}
            {panelDivs.input && createPortal(panelContents.input, panelDivs.input)}
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
