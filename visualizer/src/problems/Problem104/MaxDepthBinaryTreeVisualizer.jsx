import { useState, useMemo, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { generateSteps } from './algorithm'
import TreeDiagram from '../../components/shared/TreeDiagram'
import StoryPanel from '../../components/shared/StoryPanel'
import VisualizerPlaybackSection from '../../components/VisualizerPlaybackSection'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { useApplyExample } from '../../hooks/useApplyExample'
import { useVisualizationFeatures } from '../../hooks/useVisualizationFeatures'
import { getVisualizationFeatures } from '../../config/visualizationRegistry'
import { getExamples } from '../../config/examplesRegistry'
import './MaxDepthBinaryTreeVisualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import LuminoDockPanel from '../../components/LuminoDockPanel'


// ─── Pattern annotations ───────────────────────────────────────────────────
const SOLUTION_CODE = [
  { line: 1, text: 'def maxDepth(root):' },
  { line: 2, text: '    if not root:' },
  { line: 3, text: '        return 0' },
  { line: 4, text: '    left = maxDepth(root.left)' },
  { line: 5, text: '    right = maxDepth(root.right)' },
  { line: 6, text: '    return 1 + max(left, right)' },
]

const EXAMPLES = getExamples('max-depth-binary-tree')

const SNIPPETS = [
    { id: 'init', label: 'Init', lines: [3] },
    { id: 'loop', label: 'DFS Calls', lines: [4, 5] },
    { id: 'update', label: 'Depth Update', lines: [6] },
    { id: 'return', label: 'Return', lines: [6] },
]

function snippetIdForPhase(phase) {
    if (phase === 'done') return 'return'
    if (phase === 'call' || phase === 'right') return 'loop'
    if (phase === 'return') return 'update'
    return 'init'
}

export default function MaxDepthBinaryTreeVisualizer() {
    // Load solution code from registry

    const [arrInput, setArrInput] = useState('[3,9,20,null,null,15,7]')

    const { steps, positions, edges, nodes, inputError } = useMemo(() => {
        try {
            const generated = generateSteps(arrInput);
            return { ...generated, inputError: '', steps: generated.steps.map(s => ({...s, snippetId: snippetIdForPhase(s.phase), relatedLines: [s.activeLine]})) };
        } catch(error) { return { steps: [], positions: new Map(), edges: [], nodes: [], inputError: error.message }; }
    }, [arrInput]);
    const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } = usePlaybackState(steps.length)
    const step = stepIndex >= 0 ? steps[stepIndex] : null

    const applyExample = useApplyExample((ex) => {
        setArrInput(JSON.stringify(ex.arr))
    }, handleReset)

    const connectivity = useCodeVisualConnectivity({
        steps,
        stepIndex,
        snippetOptions: SNIPPETS,
        onStepJump: setStepIndex,
    })

    // Use modular visualization features system
    const vizFeatureDefs = getVisualizationFeatures('max-depth-binary-tree')
    const { items: vizFeatures, toggle: toggleVizFeature } = useVisualizationFeatures(vizFeatureDefs)

    const primaryPanel = (
    <>

      <ManualInputPanel
        fields={[{"key":"arr","label":"arr","type":"string"}]}
        values={{ arr: arrInput }}
        onChange={(k, v) => { if (k === 'arr') setArrInput(v); handleReset() }}
        examples={EXAMPLES}
        applyExample={applyExample}
        inputError={inputError}
      />

        <div className="mdbt-panel main">
            <header className="mdbt-head">
                <span>Binary Tree DFS</span>
                {inputError && <span className="mdbt-error">{inputError}</span>}
            </header>
            <div className="mdbt-body">
                {!inputError && <StoryPanel title="Carry the deepest route upward" description={step?.message ?? 'Each node returns one plus the deeper of its two children.'}>
                    <TreeDiagram positions={positions} edges={edges} nodes={nodes}
                        activeIds={new Set(step?.path ?? (step?.activeId >= 0 ? [step.activeId] : []))}
                        labelForNode={node => step?.returnValues?.has(node.id) ? `depth ${step.returnValues.get(node.id)}` : 'not returned'}
                        onNodeSelect={node => connectivity.setVisualFocus({lines:[4,5,6],reason:`Node ${node.val} selected.`,targetType:'node',targetId:String(node.id)})} />
                    {step?.left != null && step?.right != null && <p>Left depth {step.left}; right depth {step.right}. Add one for the current node.</p>}
                    {step?.phase === 'done' && <p>Highlighted route contains {step.total} nodes. Equal-depth ties choose the left route.</p>}
                </StoryPanel>}
            </div>
        </div>
    
    </>)

    const statePanel = (
        <div className="mdbt-panel side">
            <header className="mdbt-head"><span>Call Stack</span></header>
            <div className="mdbt-body">
                <div className="mdbt-stack">
                    {(step?.callStack ?? []).map((val, i) => (
                        <div key={i} className={`mdbt-frame ${i === (step.callStack.length - 1) ? 'top' : ''}`}>
                            maxDepth({val})
                        </div>
                    ))}
                    {(step?.callStack?.length === 0) && <div className="mdbt-empty">—</div>}
                </div>
                <div className={`mdbt-result ${step?.phase === 'done' ? 'ok' : ''}`}>
                    {step?.phase === 'done' ? step.message : 'Traversing…'}
                </div>
            </div>
        </div>
    )

    const codePanel = (
        <div style={{ position: 'relative', height: '100%' }}>
            <VisualizerPlaybackSection
              floatingPlayback
                step={step}
                codeLines={SOLUTION_CODE}
                statusClassName="mdbt-status"
                statusDone={step?.phase === 'done'}
                statusMessage={step?.message}
                fallbackStatus="Press Play to begin."
                playback={{
                    stepIndex,
                    stepForward,
                    stepBack,
                    togglePlay,
                    handleReset,
                    isPlaying,
                    speed,
                    setSpeed,
                    isDone,
                }}
                connectivity={{
                    snippetOptions: SNIPPETS,
                    activeSnippetId: connectivity.activeSnippetId,
                    highlightedLines: connectivity.highlightedLines,
                    linkInfo: connectivity.linkInfo,
                    onLineSelect: connectivity.handleLineSelect,
                    onSnippetSelect: connectivity.handleSnippetSelect,
                }}
                visualizationFeatures={vizFeatures}
                onVisualizationToggle={toggleVizFeature}
                disableResizer
            />
        </div>
    )

    const statusPanel = (
        <div className="mdbt-status">
            {step?.message || 'Press Play to begin.'}
        </div>
    )

    const [panelDivs, setPanelDivs] = useState(null)
    const panelConfigs = useMemo(
        () => [
            { id: 'primary', title: 'Binary Tree DFS', dockMode: 'split-right' },
            { id: 'state', title: 'Call Stack', dockMode: 'split-right' },
            { id: 'code', title: 'Code', dockMode: 'split-bottom' },
            { id: 'status', title: 'Status', dockMode: 'split-bottom', ratio: 0.08 },
        ],
        []
    )
    const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

    return (
        <div className="vis-shell mdbt-shell">
            <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
            {panelDivs && (
              <>
                    {panelDivs.primary && createPortal(primaryPanel, panelDivs.primary)}
                    {panelDivs.state && createPortal(statePanel, panelDivs.state)}
                    {panelDivs.code && createPortal(codePanel, panelDivs.code)}
                    {panelDivs.status && createPortal(statusPanel, panelDivs.status)}
                </>
            )}
        </div>
    )
}
