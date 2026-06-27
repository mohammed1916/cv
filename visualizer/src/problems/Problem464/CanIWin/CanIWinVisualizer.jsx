import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import DockableWorkspace from '../../../components/shared/DockableWorkspace'
import FloatingPanel from '../../../components/shared/FloatingPanel'
import CodeTracePanel from '../../../components/CodeTracePanel'
import PlaybackControls from '../../../components/PlaybackControls'
import PatternOverlay from '../../../components/PatternOverlay'
import { usePlaybackState } from '../../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../../hooks/usePatternOverlay'
import { getExamples } from '../../../config/examplesRegistry'
import './CanIWinVisualizer.css'

const EXAMPLES = getExamples('can-i-win')

const SOLUTION_CODE_INLINE = [
  { line: 1, text: 'def canIWin(maxChoosableInteger, desiredTotal):' },
  { line: 2, text: '    if desiredTotal <= 0: return True' },
  { line: 3, text: '    if sum(1..maxChoosableInteger) < desiredTotal: return False' },
  { line: 4, text: '    memo = {}' },
  { line: 5, text: '    def dfs(available, currentSum):' },
  { line: 6, text: '        if currentSum >= desiredTotal: return True' },
  { line: 7, text: '        if available == 0: return False' },
  { line: 8, text: '        if available in memo: return memo[available]' },
  { line: 9, text: '        for i in range(1, maxChoosableInteger+1):' },
  { line: 10, text: '            if (available >> (i-1)) & 1:' },
  { line: 11, text: '                new_available = available ^ (1 << (i-1))' },
  { line: 12, text: '                if not dfs(new_available, currentSum+i):' },
  { line: 13, text: '                    memo[available] = True' },
  { line: 14, text: '                    return True' },
  { line: 15, text: '        memo[available] = False' },
  { line: 16, text: '        return False' },
  { line: 17, text: '    return dfs((1<<maxChoosableInteger)-1, 0)' },
]

const SOLUTION_CODE = SOLUTION_CODE_INLINE

function generateSteps(maxChoosableInteger, desiredTotal) {
  const steps = []
  const memo = {}
  const choices = []

  steps.push({
    activeLine: 1,
    maxChoosableInteger,
    desiredTotal,
    currentSum: 0,
    availableNumbers: Array.from({ length: maxChoosableInteger }, (_, i) => i + 1),
    usedNumbers: new Set(),
    canWin: false,
    depth: 0,
    message: 'Initialize: Game theory problem - can first player win?'
  })

  function backtrack(currentSum, availableSet, depth) {
    if (currentSum >= desiredTotal) {
      return true
    }

    const mask = availableSet
    if (memo[mask]) return memo[mask]

    for (let i = 1; i <= maxChoosableInteger; i++) {
      if ((availableSet & (1 << (i - 1))) === 0) continue

      const newSum = currentSum + i
      const newSet = availableSet ^ (1 << (i - 1))

      if (depth < 3) {
        const usedNums = new Set()
        for (let j = 0; j < maxChoosableInteger; j++) {
          if ((availableSet & (1 << j)) === 0) usedNums.add(j + 1)
        }

        steps.push({
          activeLine: 2,
          maxChoosableInteger,
          desiredTotal,
          currentSum,
          availableNumbers: Array.from({ length: maxChoosableInteger }, (_, i) => i + 1),
          usedNumbers: usedNums,
          currentChoice: i,
          newSum,
          canWin: false,
          depth,
          message: `Player chooses ${i}, sum becomes ${newSum}`
        })

        const opponentWins = backtrack(newSum, newSet, depth + 1)
        const canCurrentWin = !opponentWins || newSum >= desiredTotal

        steps.push({
          activeLine: 3,
          maxChoosableInteger,
          desiredTotal,
          currentSum,
          availableNumbers: Array.from({ length: maxChoosableInteger }, (_, i) => i + 1),
          usedNumbers: usedNums,
          currentChoice: i,
          newSum,
          canWin: canCurrentWin,
          depth,
          message: `Choice ${i}: ${canCurrentWin ? 'Leads to WIN' : 'Leads to loss'}`
        })

        if (canCurrentWin) {
          steps.push({
            activeLine: 4,
            maxChoosableInteger,
            desiredTotal,
            currentSum,
            availableNumbers: Array.from({ length: maxChoosableInteger }, (_, i) => i + 1),
            usedNumbers: usedNums,
            currentChoice: i,
            newSum,
            canWin: true,
            depth,
            message: `Found winning move: ${i}`
          })
          return true
        }
      } else {
        if (!opponentWins || newSum >= desiredTotal) {
          return true
        }
      }
    }

    return false
  }

  const result = backtrack(0, (1 << maxChoosableInteger) - 1, 0)

  steps.push({
    activeLine: 5,
    maxChoosableInteger,
    desiredTotal,
    currentSum: 0,
    availableNumbers: Array.from({ length: maxChoosableInteger }, (_, i) => i + 1),
    usedNumbers: new Set(),
    canWin: result,
    depth: 0,
    done: true,
    message: result ? 'YES! First player can force a win!' : 'NO. Second player can always win.'
  })

  return steps
}

function VisualizationPanel({ maxChoosableInteger, desiredTotal, step, applyEx }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 16 }}>
      {/* Story */}
      <div style={{ padding: 12, backgroundColor: '#fce7f3', borderRadius: 6, borderLeft: '4px solid #ec4899' }}>
        <div style={{ fontSize: 12, color: '#9d174d', fontStyle: 'italic' }}>
          "Two players take turns choosing numbers from 1 to n. Each chosen number adds to a sum. The player who first reaches the desired total wins. Can the first player force a win with optimal play?"
        </div>
      </div>

      {/* Examples */}
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

      {/* Game Parameters */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <motion.div
          style={{
            padding: 12,
            backgroundColor: '#fce7f3',
            borderRadius: 6,
            border: '2px solid #ec4899',
            textAlign: 'center'
          }}
          animate={{ scale: 1 }}
        >
          <div style={{ fontSize: 11, color: '#9d174d', fontWeight: 600 }}>Available Numbers</div>
          <div style={{ fontSize: 18, fontWeight: 'bold', color: '#ec4899', marginTop: 4 }}>
            1 to {maxChoosableInteger}
          </div>
        </motion.div>

        <motion.div
          style={{
            padding: 12,
            backgroundColor: '#dbeafe',
            borderRadius: 6,
            border: '2px solid #0284c7',
            textAlign: 'center'
          }}
          animate={{ scale: 1 }}
        >
          <div style={{ fontSize: 11, color: '#1e40af', fontWeight: 600 }}>Desired Total</div>
          <div style={{ fontSize: 18, fontWeight: 'bold', color: '#0284c7', marginTop: 4 }}>
            {desiredTotal}
          </div>
        </motion.div>
      </div>

      {/* Available Numbers */}
      <motion.div
        style={{
          padding: 16,
          backgroundColor: '#f1f5f9',
          borderRadius: 6,
          border: '2px solid #cbd5e1'
        }}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 12 }}>
          Available Choices
        </div>
        <div style={{
          display: 'flex',
          gap: 6,
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          {Array.from({ length: maxChoosableInteger }, (_, i) => i + 1).map(num => {
            const isUsed = step?.usedNumbers?.has(num)
            const isCurrent = step?.currentChoice === num

            return (
              <motion.div
                key={num}
                style={{
                  padding: '10px 14px',
                  borderRadius: 4,
                  border: '2px solid',
                  fontFamily: 'monospace',
                  fontSize: 14,
                  fontWeight: 600,
                  backgroundColor: isCurrent ? '#bfdbfe' : isUsed ? '#e5e7eb' : '#ffffff',
                  borderColor: isCurrent ? '#0284c7' : isUsed ? '#cbd5e1' : '#cbd5e1',
                  color: isCurrent ? '#0c4a6e' : isUsed ? '#9ca3af' : '#334155',
                  opacity: isUsed ? 0.5 : 1
                }}
                animate={{
                  scale: isCurrent ? 1.15 : 1,
                  boxShadow: isCurrent ? '0 0 15px rgba(2, 132, 199, 0.5)' : 'none'
                }}
              >
                {num}
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      {/* Game State */}
      {step && step.currentSum !== undefined && (
        <motion.div
          style={{
            padding: 16,
            backgroundColor: '#f8f4ff',
            borderRadius: 6,
            border: '2px solid #8b5cf6'
          }}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div style={{ fontSize: 13, fontWeight: 600, color: '#5b21b6', marginBottom: 12 }}>
            Game State
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 12
          }}>
            <div style={{
              padding: 10,
              backgroundColor: '#e9d5ff',
              borderRadius: 4,
              border: '2px solid #c084fc',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: 11, color: '#6b21a8', fontWeight: 600 }}>Current Sum</div>
              <div style={{ fontSize: 18, fontWeight: 'bold', color: '#7c3aed', marginTop: 4 }}>
                {step.currentSum}
              </div>
            </div>

            <div style={{
              padding: 10,
              backgroundColor: '#e9d5ff',
              borderRadius: 4,
              border: '2px solid #c084fc',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: 11, color: '#6b21a8', fontWeight: 600 }}>Remaining</div>
              <div style={{ fontSize: 18, fontWeight: 'bold', color: '#7c3aed', marginTop: 4 }}>
                {Math.max(0, desiredTotal - step.currentSum)}
              </div>
            </div>
          </div>

          {step.newSum !== undefined && (
            <div style={{ marginTop: 12 }}>
              <div style={{
                padding: 10,
                backgroundColor: '#dbeafe',
                borderRadius: 4,
                border: '2px solid #0284c7',
                fontSize: 12,
                fontWeight: 600,
                color: '#0c4a6e',
                textAlign: 'center'
              }}>
                After choosing {step.currentChoice}: sum = {step.newSum}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Result */}
      <motion.div
        style={{
          padding: 16,
          backgroundColor: step?.canWin ? '#d1fae5' : '#fee2e2',
          borderRadius: 6,
          border: `2px solid ${step?.canWin ? '#22c55e' : '#ef4444'}`,
          textAlign: 'center'
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div style={{
          fontSize: 16,
          fontWeight: 'bold',
          color: step?.canWin ? '#16a34a' : '#991b1b'
        }}>
          {step?.canWin ? '✓ YES - FIRST PLAYER WINS' : '✗ NO - SECOND PLAYER WINS'}
        </div>
        <div style={{
          fontSize: 12,
          color: step?.canWin ? '#15803d' : '#7f1d1d',
          marginTop: 8
        }}>
          {step?.message || ''}
        </div>
      </motion.div>
    </div>
  )
}

export default function CanIWinVisualizer() {
  const [ex, setEx] = useState(EXAMPLES[0] || { maxChoosableInteger: 10, desiredTotal: 40 })

  const steps = useMemo(
    () =>
      generateSteps(ex.maxChoosableInteger, ex.desiredTotal).map((current) => ({
        ...current,
        relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
      })),
    [ex]
  )

  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)

  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const applyEx = useCallback((e) => { setEx(e); handleReset(); }, [handleReset])

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
      title: '🎮 Game Theory',
      content: (
        <VisualizationPanel
          maxChoosableInteger={ex.maxChoosableInteger}
          desiredTotal={ex.desiredTotal}
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
          onSpeedChange={e => setSpeed(Number(e.target.value))}
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
