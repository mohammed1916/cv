import { useCallback, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import './Visualizer.css'

const EXAMPLES = [{ label: 'Mixed duplicates', input: [1, 1, 2, 3, 3] }, { label: 'All same', input: [7, 7, 7, 7] }, { label: 'Already unique', input: [1, 2, 3] }, { label: 'Empty list', input: [] }]
const CODE = [
  { line: 1, text: 'def deleteDuplicates(head):' }, { line: 2, text: '    current = head' },
  { line: 3, text: '    while current and current.next:' }, { line: 4, text: '        if current.val == current.next.val:' },
  { line: 5, text: '            current.next = current.next.next' }, { line: 6, text: '        else: current = current.next' }, { line: 7, text: '    return head' },
]

function generateSteps(values) {
  const nodes = [...values]
  const steps = [{ activeLine: 2, message: nodes.length ? 'Start at the head of the sorted list.' : 'The list is empty; there is nothing to remove.', state: { nodes, current: nodes.length ? 0 : -1 } }]
  let current = 0
  while (current < nodes.length - 1) {
    steps.push({ activeLine: 3, message: `Compare node ${current} (${nodes[current]}) with its next node (${nodes[current + 1]}).`, state: { nodes: [...nodes], current } })
    if (nodes[current] === nodes[current + 1]) {
      const duplicate = nodes[current + 1]; nodes.splice(current + 1, 1)
      steps.push({ activeLine: 5, message: `${duplicate} is a duplicate, so bypass it. Keep current here to compare the replacement next node.`, state: { nodes: [...nodes], current } })
    } else { current += 1; steps.push({ activeLine: 6, message: 'The values differ, so advance the current pointer.', state: { nodes: [...nodes], current } }) }
  }
  steps.push({ activeLine: 7, message: `Done. The de-duplicated list is [${nodes.join(', ')}].`, state: { nodes, current: -1 } })
  return steps
}

export default function Problem83Visualizer() {
  const [inputText, setInputText] = useState(JSON.stringify(EXAMPLES[0].input))
  const { values, inputError } = useMemo(() => {
    try {
      const parsed = JSON.parse(inputText)
      if (!Array.isArray(parsed) || !parsed.every(Number.isFinite)) throw new Error('Enter a JSON array of numbers, for example [1,1,2].')
      const sorted = [...parsed].sort((a, b) => a - b)
      return { values: sorted, inputError: parsed.some((value, index) => index && value < parsed[index - 1]) ? 'The list was sorted automatically because this algorithm requires sorted input.' : '' }
    } catch (error) { return { values: EXAMPLES[0].input, inputError: error.message } }
  }, [inputText])
  const steps = useMemo(() => generateSteps(values), [values])
  const { stepIndex, isPlaying, speed, setSpeed, stepForward, stepBack, togglePlay, handleReset, isDone } = usePlaybackState(steps.length)
  const step = steps[Math.max(0, stepIndex)] || steps[0]
  const [panelDivs, setPanelDivs] = useState(null)
  const applyExample = useCallback((example) => { setInputText(JSON.stringify(example.input)); handleReset() }, [handleReset])
  const panels = useMemo(() => [{ id: 'input', title: 'Input' }, { id: 'visualization', title: 'Visualization', dockMode: 'split-bottom' }, { id: 'code', title: 'Code Trace', dockMode: 'split-right' }], [])
  return <div className="problem83-shell">
    <LuminoDockPanel panels={panels} onPanelReady={setPanelDivs} />
    {panelDivs && <>
      {panelDivs.input && createPortal(<ManualInputPanel fields={[{ key: 'list', label: 'Sorted list (JSON)', type: 'string' }]} values={{ list: inputText }} onChange={(_, value) => { setInputText(value); handleReset() }} examples={EXAMPLES} activeLabel={null} applyExample={applyExample} inputError={inputError} />, panelDivs.input)}
      {panelDivs.visualization && createPortal(<div className="problem83-visualization"><p className="problem83-message">{step.message}</p><div className="problem83-list">{step.state.nodes.length ? step.state.nodes.map((value, index) => <motion.div key={`${value}-${index}`} className={`problem83-node ${index === step.state.current ? 'problem83-node-active' : ''}`} initial={{ opacity: 0, scale: .8 }} animate={{ opacity: 1, scale: 1 }}>{value}<small>{index}</small></motion.div>) : <em>∅</em>}</div><p className="problem83-hint">The highlighted node is the current pointer.</p></div>, panelDivs.visualization)}
      {panelDivs.code && createPortal(<CodeTracePanel codeLines={CODE} step={step} />, panelDivs.code)}
    </>}
    {createPortal(<FloatingPanel title="Playback Controls"><PlaybackControls onReset={handleReset} onPrev={stepBack} onNext={stepForward} onPlayToggle={togglePlay} isPlaying={isPlaying} isDone={isDone} prevDisabled={stepIndex < 0} nextDisabled={isDone} resetDisabled={stepIndex < 0} speed={speed} onSpeedChange={(event) => setSpeed(Number(event.target.value))} /></FloatingPanel>, document.body)}
  </div>
}
