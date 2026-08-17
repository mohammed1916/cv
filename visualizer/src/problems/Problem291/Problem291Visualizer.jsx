import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import PatternOverlay from '../../components/PatternOverlay'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import FloatingPanel from '../../components/shared/FloatingPanel'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { useAutoScroll } from '../../hooks/useAutoScroll'
import { getExamplesOr } from '../../config/examplesRegistry'
import './Problem291Visualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import { createPortal } from 'react-dom'


// ─── Pattern annotations ───────────────────────────────────────────────────
const LINE_PATTERN_MAP = {}  // Auto-generated: maps line numbers to phase names
const PATTERNS = []  // Auto-generated: list of phase names used in this visualizer
const SOLUTION_CODE = [
    { line: 1, text: '# Word Pattern II Solution' },
    { line: 2, text: 'def word_pattern_match(pattern, text):' },
    { line: 3, text: '    def search(i, j, mapping, used):' },
    { line: 4, text: '        if pattern[i] in mapping: verify its mapped prefix' },
    { line: 5, text: '        else: try each unused text prefix for the character' },
    { line: 6, text: '    return search(0, 0, {}, set())' },
]

function generateSteps(input) {
 const pattern=String(input?.[0]??''),text=String(input?.[1]??''),steps=[];let answer=false;const dfs=(i,j,map,used)=>{if(i===pattern.length)return j===text.length;const char=pattern[i];if(map[char])return text.startsWith(map[char],j)&&dfs(i+1,j+map[char].length,map,used);for(let end=j+1;end<=text.length;end++){const word=text.slice(j,end);if(used.has(word))continue;const next={...map,[char]:word};steps.push({activeLine:5,message:`Try ${char} → “${word}”.`,state:{pattern,text,map:next}});if(dfs(i+1,end,next,new Set([...used,word])))return true}return false};answer=dfs(0,0,{},new Set());steps.push({activeLine:6,message:answer?'A one-to-one mapping matches the full text.':'No one-to-one mapping matches.',state:{pattern,text,map:{},answer}});return steps
}

export default function Problem291Visualizer() {
    const examples = useMemo(() => getExamplesOr('291', []), [])
    const [currentExample, setCurrentExample] = useState(0)
  const [inputInput, setInputInput] = useState(JSON.stringify(examples[0]?.input ?? []));
  const { input, inputError } = useMemo(() => {
    try {
      const parsedInput = JSON.parse(inputInput); if (!Array.isArray(parsedInput)) throw new Error('input must be an array');
      return { input: parsedInput, inputError: '' };
    } catch (e) {
      return { input: examples[currentExample]?.input ?? '', inputError: e.message };
    }
  }, [inputInput]);
    const [currentStep, setCurrentStep] = useState(0)

    const example = examples[currentExample] || { input: [], output: [] }
const applyEx = useCallback((i) => { setCurrentExample(i); setInputInput(JSON.stringify(examples[i].input)); setCurrentStep(0); }, [setCurrentStep]);
      const steps = useMemo(() => generateSteps(input), [input])
    const step = steps[currentStep] || steps[0]

    const { isPlaying, setIsPlaying, canNext, canPrev } = usePlaybackState(steps, currentStep, setCurrentStep)
    const { pattern, togglePattern } = usePatternOverlay(false)

    const panelConfigs = useMemo(() => [
      { id: 'main', title: "Visualization" },
      { id: 'bottom', title: "Code Trace", dockMode: 'split-bottom' },
    ], [])
    const panelContents = {
      main: (<>
<ManualInputPanel
          fields={[{"key":"input","label":"input","type":"string"}]}
          values={{ input: inputInput }}
          onChange={(k, v) => { if (k === 'input') setInputInput(v) }}
          examples={examples}
          activeLabel={examples[currentExample]?.label}
          applyExample={(e) => applyEx(examples.indexOf(e))}
          inputError={inputError}
        />
<div className="problem291-visualizer-viz-panel">
                    <div className="problem291-visualizer-canvas">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                            className="problem291-visualizer-content"
                        >
                            <p>{step.message}</p><div className="problem291-map">{Object.entries(step.state.map || {}).map(([letter,word])=><span key={letter}>{letter} → <b>{word}</b></span>)}</div><code>{step.state.pattern} / {step.state.text}</code>
                        </motion.div>
                    </div>
                    <PlaybackControls
                        currentStep={currentStep}
                        totalSteps={steps.length}
                        onNext={() => setCurrentStep(c => c + 1)}
                        onPrev={() => setCurrentStep(c => c - 1)}
                        onPlayToggle={() => setIsPlaying(!isPlaying)}
                        isPlaying={isPlaying}
                        canNext={canNext}
                        canPrev={canPrev}
                    />
                </div>
</>),
      bottom: (<CodeTracePanel
                    code={SOLUTION_CODE}
                    activeLine={step.activeLine}
                    onTogglePattern={togglePattern}
                    patternActive={pattern}
                />),
    }
    const [panelDivs, setPanelDivs] = useState(null)
    const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])
    return (
        <>
          <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
          {panelDivs && (
            <>
              {panelDivs.main && createPortal(panelContents.main, panelDivs.main)}
              {panelDivs.bottom && createPortal(panelContents.bottom, panelDivs.bottom)}
            </>
          )}
        </>
    )
}
