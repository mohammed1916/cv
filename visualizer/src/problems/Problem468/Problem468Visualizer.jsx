import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import DockableWorkspace from '../../components/shared/DockableWorkspace'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'

import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamples } from '../../config/examplesRegistry'
import './Problem468Visualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import PatternOverlay from "../../components/PatternOverlay";
import { getSolutionCode } from '../../config/solutionCodeRegistry'
const SOLUTION_CODE = getSolutionCode('validate-ip-address')

const PATTERNS = []

const EXAMPLES = getExamples('validate-ip-address')

function validateIP(ip) {
  const isIPv4 = ip.includes('.') && !ip.includes(':')
  const isIPv6 = ip.includes(':') && !ip.includes('.')

  if (isIPv4) {
    const parts = ip.split('.')
    if (parts.length !== 4) return 'Invalid: IPv4 should have 4 parts'
    for (let part of parts) {
      if (!/^\d+$/.test(part) || parseInt(part) > 255) {
        return 'Invalid: IPv4 part out of range'
      }
    }
    return 'Valid IPv4'
  } else if (isIPv6) {
    const parts = ip.split(':')
    if (parts.length !== 8) return 'Invalid: IPv6 should have 8 parts'
    for (let part of parts) {
      if (!/^[0-9a-fA-F]+$/.test(part) || part.length === 0 || part.length > 4) {
        return 'Invalid: IPv6 part format'
      }
    }
    return 'Valid IPv6'
  }
  return 'Invalid: Neither IPv4 nor IPv6'
}

function generateSteps(ip) {
  const steps = []
  const validation = validateIP(ip)
  const isIPv4 = ip.includes('.') && !ip.includes(':')
  const isIPv6 = ip.includes(':') && !ip.includes('.')

  steps.push({
    activeLine: 1,
    ip,
    validation,
    currentPart: '',
    partIndex: 0,
    message: 'Check IP format and extract parts'
  })

  if (isIPv4) {
    const parts = ip.split('.')
    steps.push({
      activeLine: 2,
      ip,
      validation,
      parts,
      currentPart: '',
      partIndex: parts.length,
      message: `IPv4 detected: ${parts.length} parts found`
    })

    for (let i = 0; i < parts.length && i < 4; i++) {
      const part = parts[i]
      steps.push({
        activeLine: 3,
        ip,
        validation,
        parts,
        currentPart: part,
        partIndex: i,
        message: `Validate part[${i}]: "${part}" = ${parseInt(part)}`
      })
    }
  } else if (isIPv6) {
    const parts = ip.split(':')
    steps.push({
      activeLine: 5,
      ip,
      validation,
      parts,
      currentPart: '',
      partIndex: parts.length,
      message: `IPv6 detected: ${parts.length} parts found`
    })

    for (let i = 0; i < parts.length && i < 4; i++) {
      const part = parts[i]
      steps.push({
        activeLine: 6,
        ip,
        validation,
        parts,
        currentPart: part,
        partIndex: i,
        message: `Validate hex part[${i}]: "${part}"`
      })
    }
  }

  steps.push({
    activeLine: 7,
    ip,
    validation,
    parts: [],
    currentPart: '',
    partIndex: 0,
    done: true,
    message: validation
  })

  return steps
}

function VisualizationPanel({ ip, step, applyEx }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 16 }}>
      <div style={{ padding: 12, backgroundColor: '#f0f9ff', borderRadius: 6, borderLeft: '4px solid #0284c7' }}>
        <div style={{ fontSize: 12, color: '#075985', fontStyle: 'italic' }}>
          "Validate whether a string is a valid IPv4 or IPv6 address. IPv4 has 4 parts 0-255. IPv6 has 8 hex parts 1-4 chars each."
        </div>
      </div>

      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>Examples</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {EXAMPLES.map(e => (
            <button
              key={e.label}
              onClick={() => applyEx(e)}
              style={{
                padding: '6px 12px',
                borderRadius: 4,
                border: '1px solid #cbd5e1',
                cursor: 'pointer',
                fontSize: 12,
                backgroundColor: '#f1f5f9'
              }}
            >
              {e.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>
          IP Address: {ip}
        </div>
        <div style={{ fontSize: 12, color: '#475569' }}>
          Type: {ip.includes(':') ? 'IPv6 (Hexadecimal)' : ip.includes('.') ? 'IPv4 (Decimal)' : 'Unknown'}
        </div>
      </div>

      {step?.parts && step.parts.length > 0 && (
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>
            Parts
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {step.parts.map((part, idx) => {
              const isActive = step && idx === step.partIndex && !step.done
              const isProcessed = step && idx < step.partIndex
              return (
                <motion.div
                  key={`part-${idx}`}
                  style={{
                    padding: '10px 14px',
                    borderRadius: 4,
                    border: '2px solid',
                    fontFamily: 'monospace',
                    fontSize: 13,
                    fontWeight: 600,
                    backgroundColor: isActive ? '#fef08a' : isProcessed ? '#d1fae5' : '#f1f5f9',
                    borderColor: isActive ? '#eab308' : isProcessed ? '#10b981' : '#cbd5e1',
                    color: isActive ? '#854d0e' : isProcessed ? '#047857' : '#334155'
                  }}
                  animate={{ scale: isActive ? 1.15 : 1 }}
                >
                  {part}
                </motion.div>
              )
            })}
          </div>
        </div>
      )}

      <motion.div
        style={{
          padding: 16,
          backgroundColor: '#f0fdf4',
          borderRadius: 6,
          border: '2px solid #10b981'
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div style={{ fontSize: 13, fontWeight: 600, color: '#065f46', marginBottom: 8 }}>Validation Result</div>
        <div style={{ fontSize: 14, fontWeight: 600, color: step?.validation?.includes('Valid') ? '#10b981' : '#dc2626' }}>
          {step?.validation || validateIP(ip)}
        </div>
      </motion.div>

      <motion.div
        style={{
          padding: 16,
          backgroundColor: '#f8f4ff',
          borderRadius: 6,
          border: '2px solid #8b5cf6'
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 600, color: '#5b21b6', marginBottom: 8 }}>Status</div>
        <div style={{ fontSize: 12, color: '#7c3aed' }}>
          {step?.message || ''}
        </div>
      </motion.div>
    </div>
  )
}

export default function Problem468Visualizer() {
  const [ex, setEx] = useState(EXAMPLES[0]);
  const [ipInput, setIpInput] = useState("172.16.254.1");
  const { ip, inputError } = useMemo(() => {
    try {
      const parsedIp = ipInput;
      return { ip: parsedIp, inputError: '' };
    } catch (e) {
      return { ip: "172.16.254.1", inputError: e.message };
    }
  }, [ipInput]);

  const steps = useMemo(
    () =>
      generateSteps(ip).map((current) => ({
        ...current,
        relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
      })),
    [ip]
  )

  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)

  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const applyEx = useCallback((e) => { setEx(e); setIpInput(String(e.ip)); handleReset(); }, [handleReset]);

  const connectivity = useCodeVisualConnectivity({
    steps,
    stepIndex,
    onStepJump: setStepIndex,
  })

  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const dockPanels = useMemo(() => [
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
      title: '🌐 Validate IP Address',
      content: (
        <VisualizationPanel
          ip={ip}
          step={step}
          applyEx={applyEx}
        />
      ),
    },
  ], [step, SOLUTION_CODE, connectivity, setActiveLineDom, ex, applyEx])

  return (
    <div className="problem-shell">
      <DockableWorkspace
        panels={dockPanels}
        initialLayout={{ rows: [['code', 'viz']], minimized: [] }}
      />
      <FloatingPanel title="Playback Controls">
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
          onSpeedChange={e => setSpeed(Number(
            <>e.target.value
    </>))}
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
