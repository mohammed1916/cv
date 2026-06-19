import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import DockableWorkspace from '../../components/shared/DockableWorkspace'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import PatternOverlay from '../../components/PatternOverlay'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import './Problem535Visualizer.css'

const SOLUTION_CODE = [
  { line: 1, text: 'class Codec:' },
  { line: 2, text: '    def __init__(self):' },
  { line: 3, text: '        self.url_to_code = {}' },
  { line: 4, text: '        self.code_to_url = {}' },
  { line: 5, text: '        self.count = 0' },
  { line: 6, text: '    def encode(self, longUrl):' },
  { line: 7, text: '        self.count += 1' },
  { line: 8, text: '        code = str(self.count)' },
  { line: 9, text: '        self.url_to_code[longUrl] = code' },
  { line: 10, text: '        self.code_to_url[code] = longUrl' },
  { line: 11, text: '        return "http://tinyurl.com/" + code' },
  { line: 12, text: '    def decode(self, shortUrl):' },
  { line: 13, text: '        code = shortUrl.split("/")[-1]' },
  { line: 14, text: '        return self.code_to_url[code]' },
]

function generateSteps(urls) {
  const steps = []
  const urlMap = {}
  const codeMap = {}
  let count = 0

  steps.push({
    activeLine: 1,
    urlMap: {},
    codeMap: {},
    count: 0,
    message: 'Initialize TinyURL codec.',
  })

  urls.forEach((url) => {
    count++
    const code = count.toString()
    urlMap[url] = code
    codeMap[code] = url

    steps.push({
      activeLine: 7,
      urlMap: { ...urlMap },
      codeMap: { ...codeMap },
      count,
      currentUrl: url,
      message: `Encode URL: ${url.substring(0, 30)}...`,
    })

    steps.push({
      activeLine: 11,
      urlMap: { ...urlMap },
      codeMap: { ...codeMap },
      count,
      currentUrl: url,
      shortUrl: `http://tinyurl.com/${code}`,
      message: `Generated short URL: http://tinyurl.com/${code}`,
    })
  })

  steps.push({
    activeLine: 12,
    urlMap: { ...urlMap },
    codeMap: { ...codeMap },
    count,
    message: 'Ready to decode short URLs.',
  })

  return steps
}

const EXAMPLES = [
  {
    label: 'Example 1',
    urls: ['https://leetcode.com/problems/design-tinyurl', 'https://www.example.com'],
  },
]

export default function Problem535Visualizer() {
  const [exIdx, setExIdx] = useState(0)
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const ex = EXAMPLES[exIdx]
  const steps = useMemo(() => generateSteps(ex.urls), [ex])
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })

  const applyExample = useCallback((idx) => {
    setExIdx(idx)
    handleReset()
  }, [handleReset])

  const dockPanels = useMemo(
    () => [
      {
        id: 'code',
        title: 'Code',
        content: (
          <CodeTracePanel
            step={step}
            codeLines={SOLUTION_CODE}
            highlightedLines={connectivity.highlightedLines}
            onLineSelect={connectivity.handleLineSelect}
            onActiveLineDomChange={setActiveLineDom}
          />
        ),
      },
      {
        id: 'viz',
        title: '🔗 TinyURL Encoding/Decoding',
        content: (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12, padding: 16, overflow: 'auto' }}>
            <div style={{ padding: 8, backgroundColor: '#f8fafc', borderRadius: 6, fontSize: 11 }}>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>{step?.message}</div>

              {/* Count */}
              <div style={{ padding: 6, backgroundColor: '#fef3c7', borderRadius: 4, marginBottom: 12 }}>
                <div style={{ fontSize: 9, color: '#92400e', fontWeight: 600 }}>ID Counter</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#92400e' }}>{step?.count}</div>
              </div>

              {/* URL Map */}
              {Object.keys(step?.urlMap || {}).length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontWeight: 600, marginBottom: 4, fontSize: 10, color: '#334155' }}>Mappings:</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 200, overflow: 'auto' }}>
                    {Object.entries(step?.urlMap || {}).map(([url, code]) => (
                      <div
                        key={code}
                        style={{
                          padding: '6px 8px',
                          backgroundColor: step?.currentUrl === url ? '#dbeafe' : '#f1f5f9',
                          border: `1px solid ${step?.currentUrl === url ? '#0ea5e9' : '#cbd5e1'}`,
                          borderRadius: 3,
                          fontSize: 9,
                          fontFamily: 'monospace',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {code}: {url.substring(0, 40)}...
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Short URL */}
              {step?.shortUrl && (
                <motion.div
                  animate={{ scale: 1.02 }}
                  style={{
                    padding: 8,
                    backgroundColor: '#dcfce7',
                    border: '1px solid #10b981',
                    borderRadius: 4,
                    fontFamily: 'monospace',
                    fontSize: 10,
                  }}
                >
                  {step.shortUrl}
                </motion.div>
              )}
            </div>
          </div>
        ),
      },
    ],
    [step, connectivity, setActiveLineDom, exIdx, applyExample]
  )

  return (
    <div className="problem-shell">
      <DockableWorkspace panels={dockPanels} initialLayout={{ rows: [['code', 'viz']], minimized: [] }} />
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
