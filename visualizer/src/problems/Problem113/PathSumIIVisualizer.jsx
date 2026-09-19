import { useState, useMemo, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { generateSteps } from './algorithm'
import StoryPanel from '../../components/shared/StoryPanel'
import TreeDiagram from '../../components/shared/TreeDiagram'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import FloatingPanel from '../../components/shared/FloatingPanel'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { useAutoScroll } from '../../hooks/useAutoScroll'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import './PathSumIIVisualizer.css'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'


// ─── Pattern annotations ───────────────────────────────────────────────────
const LINE_PATTERN_MAP = { 2: 'init', 5: 'visit', 6: 'check', 7: 'compare', 8: 'found', 10: 'visit', 11: 'visit', 12: 'backtrack', 13: 'done' }
const PATTERNS = ['init','visit','check','compare','found','backtrack','done']

const SOLUTION_CODE = [
    { line: 1, text: 'def pathSum(root, targetSum):' },
    { line: 2, text: '    result = []' },
    { line: 3, text: '    def dfs(node, path, sum):' },
    { line: 4, text: '        if not node: return' },
    { line: 5, text: '        path.append(node.val)' },
    { line: 6, text: '        if not node.left and not node.right:' },
    { line: 7, text: '            if sum == node.val:' },
    { line: 8, text: '                result.append(path[:])' },
    { line: 9, text: '        else:' },
    { line: 10, text: '            dfs(node.left, path, sum - node.val)' },
    { line: 11, text: '            dfs(node.right, path, sum - node.val)' },
    { line: 12, text: '        path.pop()' },
    { line: 13, text: '    dfs(root, [], targetSum); return result' },
]

// Examples registry will be loaded by the visualizer if needed
// getExamples('path-sum-ii') can be called within a component for example buttons

function TreeVisualizationPanel({ step, positions, edges, allNodes }) {
    return <StoryPanel title="Collect every matching leaf route" description={step?.message ?? 'Grow a path, test the leaf, save a copy when it matches, then backtrack.'}>
        <p>Path total: {step?.currentSum ?? 0}. A matching total at an internal node is not a complete route.</p>
        <TreeDiagram positions={positions} edges={edges} nodes={allNodes} activeIds={step?.onPathNode ?? new Set()} labelForNode={n=>n.id===step?.activeId?'Current':step?.onPathNode?.has(n.id)?'On route':!n.left&&!n.right?'Leaf':''}/>
        <p>Saved paths remain intact when the working path pops its last node.</p>
    </StoryPanel>;
}

function StatePanel({ step }) {
    return (
        <div className="psi-state-panel">
            <div className="psi-metric">
                <span className="psi-label">Target Sum</span>
                <div className="psi-value">{step?.targetSum ?? 0}</div>
            </div>
            <div className="psi-metric">
                <span className="psi-label">Current Path</span>
                <div className="psi-path-display">
                    {step?.pathStack && step.pathStack.length > 0
                        ? `[${step.pathStack.join(', ')}]`
                        : '[]'}
                </div>
            </div>
            <div className="psi-metric">
                <span className="psi-label">Current Sum</span>
                <div className="psi-value">{step?.currentSum ?? 0}</div>
            </div>
            <div className="psi-metric">
                <span className="psi-label">Valid Paths ({step?.completedPaths?.length || 0})</span>
                <div className="psi-paths-list">
                    {step?.completedPaths && step.completedPaths.length > 0
                        ? step.completedPaths.map((p, i) => (
                            <div key={i} className="psi-path-item">[{p.join(', ')}]</div>
                        ))
                        : <span className="psi-empty">none yet</span>}
                </div>
            </div>

        </div>
    )
}

export default function PathSumIIVisualizer() {
    const [arrInput, setArrInput] = useState('[5,4,8,11,null,13,4,7,2,null,null,5,1]')
    const [targetInput, setTargetInput] = useState('22')

    const { steps, inputError } = useMemo(() => {
        try {
            const target=Number(targetInput);
            if(!targetInput.trim() || !Number.isSafeInteger(target))throw new Error('Target must be an integer.');
            return { steps: generateSteps(arrInput, target), inputError: '' };
        } catch(error) { return { steps: [], inputError: error.message }; }
    }, [arrInput,targetInput]);
    const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } = usePlaybackState(steps.length)
    const step = stepIndex >= 0 ? steps[stepIndex] : null
    const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()
    const [autoScrollCode, setAutoScrollCode] = useAutoScroll()

    const positions = (step ?? steps[0])?.positions ?? new Map()
    const edges = (step ?? steps[0])?.edges ?? []
    const allNodes = (step ?? steps[0])?.allNodes ?? []

    const connectivity = useCodeVisualConnectivity({
        steps,
        stepIndex,
        onStepJump: setStepIndex,
    })

    // Step 2: Extract panels into consts
    const primaryPanel = (
        <div className="psi-panel" style={{ flex: 1 }}>
            <div className="psi-panel-head">Tree Visualization</div>
            <div className="psi-panel-body">
                <ManualInputPanel
                    fields={[
                        { key: 'tree', label: 'tree', type: 'array' },
                        { key: 'targetSum', label: 'targetSum', type: 'number' },
                    ]}
                    values={{ tree: arrInput, targetSum: targetInput }}
                    onChange={(k, v) => {
                        if (k === 'tree') setArrInput(v)
                        else if (k === 'targetSum') setTargetInput(v)
                        handleReset()
                    }}
                    inputError={inputError}
                    showExamples={false}
                />
                <TreeVisualizationPanel step={step} positions={positions} edges={edges} allNodes={allNodes} />
            </div>
        </div>
    )

    const statePanel = (
        <div className="psi-panel" style={{ flex: 1 }}>
            <div className="psi-panel-head">State</div>
            <div className="psi-panel-body">
                <StatePanel step={step} />
            </div>
        </div>
    )

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

    const statusPanel = (
        <div className="psi-status">{step?.message || 'Press Play to begin.'}</div>
    )

    const playbackPanel = (
      <>
            <PlaybackControls
                onReset={handleReset}
                onPrev={stepBack}
                onPlayToggle={togglePlay}
                onNext={stepForward}
                resetDisabled={steps.length === 0}
                prevDisabled={stepIndex < 0}
                nextDisabled={isDone}
                isPlaying={isPlaying}
                isDone={isDone}
                speed={speed}
                onSpeedChange={(e) => setSpeed(Number(e.target.value))}
                speedIndicator={`${speed}ms`}
                autoScroll={autoScrollCode}
                onAutoScrollChange={setAutoScrollCode}
                autoScrollLabel="Auto-scroll code"
                showAutoScroll
                showPatternOverlay={showPatternOverlay}
                onShowPatternOverlayChange={setShowPatternOverlay}
                patternOverlayLabel="Show pattern overlay"
                showPatternOverlayToggle
            />
            {showPatternOverlay && (
                <PatternLegend currentPhase={step?.phase} usedPatterns={PATTERNS} />
            )}
        </>
    )

    // Step 3: Add state + config
    const [panelDivs, setPanelDivs] = useState(null)
    const panelConfigs = useMemo(
        () => [
            { id: 'primary', title: 'Tree Visualization', dockMode: 'split-right' },
            { id: 'state', title: 'State', dockMode: 'split-right' },
            { id: 'code', title: 'Code Trace', dockMode: 'split-right' },
            { id: 'status', title: 'Status', dockMode: 'split-bottom', ratio: 0.08 },
        ],
        []
    )
    const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

    // Step 4: Replace return with portals
    return (
        <div className="vis-shell psi-shell">
            <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
            {panelDivs && (
              <>
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
        </div>
    )
}
