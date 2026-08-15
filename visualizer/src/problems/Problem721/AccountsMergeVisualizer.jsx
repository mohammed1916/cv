import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import PatternOverlay from '../../components/PatternOverlay'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { getExamples } from '../../config/examplesRegistry'
import './AccountsMerge.css'
import { createPortal } from 'react-dom'

const SOLUTION_CODE_INLINE = [
  { line: 1, text: 'def accountsMerge(accounts):' },
  { line: 2, text: '    uf = UnionFind()' },
  { line: 3, text: '    emailToName = {}' },
  { line: 4, text: '    for name, *emails in accounts:' },
  { line: 5, text: '        emailToName[emails[0]] = name' },
  { line: 6, text: '        for email in emails[1:]:' },
  { line: 7, text: '            uf.union(emails[0], email)' },
  { line: 8, text: '    groups = {}' },
  { line: 9, text: '    for email in emailToName:' },
  { line: 10, text: '        root = uf.find(email)' },
  { line: 11, text: '        if root not in groups: groups[root] = []' },
  { line: 12, text: '        groups[root].append(email)' },
  { line: 13, text: '    return [[emailToName[root], *sorted(emails)] for root, emails in groups.items()]' },
]

const SOLUTION_CODE = SOLUTION_CODE_INLINE

function generateSteps(accounts) {
  const steps = []
  const parent = {}
  const emailToName = {}
  const groups = {}

  // Init
  const allEmails = new Set()
  accounts.forEach(([name, ...emails]) => {
    emailToName[emails[0]] = name
    emails.forEach(email => {
      allEmails.add(email)
      parent[email] = email
    })
  })

  steps.push({
    activeLine: 2,
    parent: { ...parent },
    groups: { ...groups },
    emailToName: { ...emailToName },
    message: `Initialize: ${allEmails.size} emails, each is own parent.`,
  })

  // Union-Find process
  accounts.forEach(([name, ...emails]) => {
    for (let i = 0; i < emails.length - 1; i++) {
      const email1 = emails[i]
      const email2 = emails[i + 1]

      const find = (x) => {
        if (parent[x] === x) return x
        parent[x] = find(parent[x])
        return parent[x]
      }

      const root1 = find(email1)
      const root2 = find(email2)

      if (root1 !== root2) {
        parent[root2] = root1
        steps.push({
          activeLine: 7,
          parent: { ...parent },
          groups: { ...groups },
          emailToName: { ...emailToName },
          highlighted: [email1, email2],
          message: `Union: connect ${email2} to ${email1} (root ${root2} → ${root1}).`,
        })
      }
    }
  })

  // Group by root
  allEmails.forEach(email => {
    const find = (x) => {
      if (parent[x] === x) return x
      parent[x] = find(parent[x])
      return parent[x]
    }
    const root = find(email)
    if (!groups[root]) groups[root] = []
    groups[root].push(email)
  })

  steps.push({
    activeLine: 12,
    parent: { ...parent },
    groups: { ...groups },
    emailToName: { ...emailToName },
    message: `Group emails by root. Build final accounts.`,
  })

  return steps
}

const EXAMPLES = [
  {
    label: 'Example 1',
    accounts: [
      ['John', 'j1@com', 'j2@com'],
      ['John', 'j1@com', 'j3@com'],
      ['Mary', 'm1@com'],
    ],
  },
  {
    label: 'Example 2',
    accounts: [
      ['David', 'd0@com', 'd1@com'],
      ['David', 'd3@com', 'd4@com'],
      ['David', 'd4@com', 'd5@com'],
      ['David', 'd2@com', 'd3@com'],
      ['David', 'd1@com', 'd2@com'],
    ],
  },
]

export default function AccountsMergeVisualizer() {
  const [exIdx, setExIdx] = useState(0)
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const ex = EXAMPLES[exIdx]
  const steps = useMemo(() => generateSteps(ex.accounts), [ex])
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })

  const applyExample = useCallback((idx) => {
    setExIdx(idx)
    handleReset()
  }, [handleReset])

  const emailNodes = step ? Object.keys(step.parent) : []

  const panelConfigs = useMemo(() => [
    { id: 'code', title: 'Code' },
    { id: 'viz', title: '🔗 Union-Find Graph', dockMode: 'split-right' },
  ], [])
  const panelContents = useMemo(() => ({
    code: (<CodeTracePanel
          step={step}
          codeLines={SOLUTION_CODE}
          highlightedLines={connectivity.highlightedLines}
          onLineSelect={connectivity.handleLineSelect}
          onActiveLineDomChange={setActiveLineDom}
        />),
    viz: (<div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12, padding: 16, overflow: 'auto' }}>
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
                }}
              >
                {e.label}
              </button>
            ))}
          </div>

          {step && (
            <>
              <div style={{ padding: 8, backgroundColor: '#f8fafc', borderRadius: 6, fontSize: 11 }}>
                <div style={{ fontWeight: 600, marginBottom: 8 }}>{step.message}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {emailNodes.map((email) => {
                    const parent = step.parent[email]
                    const isHighlighted = step.highlighted?.includes(email)
                    const isRoot = parent === email
                    return (
                      <motion.div
                        key={email}
                        animate={{ scale: isHighlighted ? 1.15 : 1 }}
                        style={{
                          padding: 8,
                          borderRadius: 4,
                          border: isHighlighted ? '2px solid #0ea5e9' : '1px solid #cbd5e1',
                          backgroundColor: isHighlighted ? '#0ea5e9' : isRoot ? '#dcfce7' : '#f1f5f9',
                          color: isHighlighted ? '#fff' : '#1e293b',
                          fontSize: 11,
                          fontWeight: 600,
                        }}
                      >
                        {email} → {parent !== email ? parent : 'ROOT'}
                      </motion.div>
                    )
                  })}
                </div>
              </div>

              {Object.keys(step.groups).length > 0 && (
                <div style={{ padding: 8, backgroundColor: '#dbeafe', borderRadius: 6, fontSize: 11 }}>
                  <div style={{ fontWeight: 600, marginBottom: 8, color: '#1e40af' }}>Groups:</div>
                  {Object.entries(step.groups).map(([root, emails]) => (
                    <div key={root} style={{ marginBottom: 6 }}>
                      <div style={{ fontWeight: 600, color: '#1e40af' }}>{step.emailToName[root]} ({root})</div>
                      <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        {emails.sort().map((email) => (
                          <span
                            key={email}
                            style={{
                              padding: '2px 6px',
                              backgroundColor: '#f0f9ff',
                              border: '1px solid #0ea5e9',
                              borderRadius: 3,
                              color: '#1e40af',
                              fontSize: 10,
                            }}
                          >
                            {email}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>),
  }), [step, SOLUTION_CODE, connectivity, setActiveLineDom, exIdx, applyExample, emailNodes])
  const [panelDivs, setPanelDivs] = useState(null)
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  return (
    <div className="problem-shell">
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
      {showPatternOverlay && step && <PatternOverlay step={step} activeLineDom={activeLineDom} />}
    </div>
  )
}
