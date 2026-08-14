import { useState, useMemo, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamplesOr } from '../../config/examplesRegistry'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import SvgViewport from '../../components/shared/SvgViewport'
import './OptimalAccountBalancingVisualizer.css'

const PATTERNS = ['init', 'net_balance', 'filter', 'dfs_enter', 'settle', 'backtrack', 'base_case', 'best', 'done', 'error']

const LINE_PATTERN_MAP = {
  2: 'net_balance',
  6: 'filter',
  9: 'base_case',
  13: 'dfs_enter',
  15: 'settle',
  17: 'backtrack',
  21: 'best',
}

const SOLUTION_CODE = [
  { line: 1, text: 'def minTransfers(transactions):' },
  { line: 2, text: '    balance = defaultdict(int)' },
  { line: 3, text: '    for f, t, amount in transactions:' },
  { line: 4, text: '        balance[f] -= amount' },
  { line: 5, text: '        balance[t] += amount' },
  { line: 6, text: '    debts = [v for v in balance.values() if v != 0]' },
  { line: 7, text: '' },
  { line: 8, text: '    def dfs(i):' },
  { line: 9, text: '        while i < len(debts) and debts[i] == 0:' },
  { line: 10, text: '            i += 1' },
  { line: 11, text: '        if i == len(debts):' },
  { line: 12, text: '            return 0' },
  { line: 13, text: '        best = float("inf")' },
  { line: 14, text: '        for j in range(i + 1, len(debts)):' },
  { line: 15, text: '            if debts[i] * debts[j] < 0:' },
  { line: 16, text: '                debts[j] += debts[i]' },
  { line: 17, text: '                best = min(best, 1 + dfs(i + 1))' },
  { line: 18, text: '                debts[j] -= debts[i]' },
  { line: 19, text: '        return best' },
  { line: 20, text: '' },
  { line: 21, text: '    return dfs(0)' },
]

const EXAMPLES = getExamplesOr('optimal-account-balancing', [
  { label: 'Example 1', text: '[[0,1,10],[2,0,5]]' },
  { label: 'Example 2', text: '[[0,1,10],[1,0,1],[1,2,5],[2,0,5]]' },
  { label: 'Three-way', text: '[[0,1,4],[1,2,4],[2,0,4]]' },
])

function parseTransactions(text) {
  const nums = text.match(/-?\d+/g)
  if (!nums) throw new Error('Enter triples like [[0,1,10],[2,0,5]]')
  if (nums.length % 3 !== 0) throw new Error('Each transaction needs 3 numbers: from, to, amount')
  const out = []
  for (let i = 0; i < nums.length; i += 3) {
    const from = Number(nums[i])
    const to = Number(nums[i + 1])
    const amount = Number(nums[i + 2])
    if (from === to) throw new Error('A person cannot pay themselves')
    if (amount <= 0) throw new Error('Amounts must be positive')
    out.push([from, to, amount])
  }
  if (out.length > 8) throw new Error('Keep it to 8 transactions or fewer')
  return out
}

/** Lay debt nodes out on a circle so the settlement edges stay readable. */
function layoutNodes(people) {
  const cx = 200
  const cy = 150
  const r = 105
  return people.map((person, idx) => {
    const angle = (idx / people.length) * Math.PI * 2 - Math.PI / 2
    return { person, x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) }
  })
}

function generateSteps(text) {
  const steps = []

  try {
    const transactions = parseTransactions(text)

    const balance = new Map()
    const bump = (p, delta) => balance.set(p, (balance.get(p) ?? 0) + delta)
    // Seed every participant at zero so people who net out still appear.
    transactions.forEach(([f, t]) => { bump(f, 0); bump(t, 0) })

    steps.push({
      phase: 'init',
      activeLine: 2,
      message: `${transactions.length} transaction(s). Compute each person's net balance first.`,
      transactions,
      balances: [...balance.entries()],
      settlements: [],
    })

    transactions.forEach(([f, t, a], idx) => {
      bump(f, -a)
      bump(t, a)
      steps.push({
        phase: 'net_balance',
        activeLine: 4,
        message: `Transaction ${idx + 1}: person ${f} pays ${a} to person ${t}. balance[${f}] ${balance.get(f) >= 0 ? '+' : ''}${balance.get(f)}, balance[${t}] ${balance.get(t) >= 0 ? '+' : ''}${balance.get(t)}`,
        transactions,
        activeTransaction: idx,
        balances: [...balance.entries()],
        settlements: [],
      })
    })

    // Only non-zero balances matter — anyone already square is out of the game.
    const people = [...balance.entries()].filter(([, v]) => v !== 0).map(([p]) => p)
    const debts = people.map((p) => balance.get(p))

    steps.push({
      phase: 'filter',
      activeLine: 6,
      message: debts.length === 0
        ? 'Every balance is already zero — no transfers needed.'
        : `Non-zero balances: [${debts.join(', ')}]. Now backtrack to settle them with the fewest transfers.`,
      transactions,
      balances: [...balance.entries()],
      people,
      debts: [...debts],
      settlements: [],
    })

    if (debts.length === 0) {
      steps.push({
        phase: 'done',
        activeLine: 21,
        message: 'Minimum number of transactions: 0',
        transactions,
        balances: [...balance.entries()],
        people,
        debts: [],
        settlements: [],
        result: 0,
      })
      return steps
    }

    const working = [...debts]
    const settlements = []
    let bestOverall = Infinity
    let bestSettlements = []
    let guard = 0

    const dfs = (i, depth) => {
      // Safety valve: the search is exponential, so bail out on pathological input
      // rather than freezing the UI mid-render.
      if (guard++ > 4000) return 0

      let idx = i
      while (idx < working.length && working[idx] === 0) idx += 1

      if (idx === working.length) {
        steps.push({
          phase: 'base_case',
          activeLine: 12,
          message: `All balances zero after ${settlements.length} transfer(s).`,
          transactions,
          balances: [...balance.entries()],
          people,
          debts: [...working],
          settlements: settlements.map((s) => ({ ...s })),
          depth,
          leafCount: settlements.length,
        })
        if (settlements.length < bestOverall) {
          bestOverall = settlements.length
          bestSettlements = settlements.map((s) => ({ ...s }))
        }
        return 0
      }

      steps.push({
        phase: 'dfs_enter',
        activeLine: 13,
        message: `Settle person ${people[idx]} (balance ${working[idx]}). Try every counterparty with an opposite sign.`,
        transactions,
        balances: [...balance.entries()],
        people,
        debts: [...working],
        settlements: settlements.map((s) => ({ ...s })),
        cursor: idx,
        depth,
      })

      let best = Infinity
      for (let j = idx + 1; j < working.length; j += 1) {
        if (working[idx] * working[j] >= 0) continue

        const amount = Math.abs(working[idx])
        const from = working[idx] < 0 ? people[idx] : people[j]
        const to = working[idx] < 0 ? people[j] : people[idx]
        working[j] += working[idx]
        settlements.push({ from, to, amount })

        steps.push({
          phase: 'settle',
          activeLine: 16,
          message: `Person ${from} pays ${amount} to person ${to}. Person ${people[j]} balance becomes ${working[j]}.`,
          transactions,
          balances: [...balance.entries()],
          people,
          debts: working.map((v, k) => (k === idx ? 0 : v)),
          settlements: settlements.map((s) => ({ ...s })),
          cursor: idx,
          partner: j,
          depth,
        })

        const savedI = working[idx]
        working[idx] = 0
        const sub = dfs(idx + 1, depth + 1)
        working[idx] = savedI
        best = Math.min(best, 1 + sub)

        settlements.pop()
        working[j] -= working[idx]

        steps.push({
          phase: 'backtrack',
          activeLine: 18,
          message: `Undo: restore person ${people[j]} to ${working[j]}. Best from here so far: ${best === Infinity ? '∞' : best}`,
          transactions,
          balances: [...balance.entries()],
          people,
          debts: [...working],
          settlements: settlements.map((s) => ({ ...s })),
          cursor: idx,
          partner: j,
          depth,
        })
      }

      return best === Infinity ? 0 : best
    }

    const result = dfs(0, 0)
    const finalCount = bestOverall === Infinity ? result : bestOverall

    steps.push({
      phase: 'best',
      activeLine: 21,
      message: `Search complete. Fewest transfers found: ${finalCount}`,
      transactions,
      balances: [...balance.entries()],
      people,
      debts: debts.map(() => 0),
      settlements: bestSettlements,
      result: finalCount,
    })

    steps.push({
      phase: 'done',
      activeLine: 21,
      message: `Minimum number of transactions: ${finalCount}`,
      transactions,
      balances: [...balance.entries()],
      people,
      debts: debts.map(() => 0),
      settlements: bestSettlements,
      result: finalCount,
      done: true,
    })
  } catch (e) {
    steps.push({
      phase: 'error',
      activeLine: 1,
      message: `Error: ${e.message}`,
      error: true,
    })
  }

  return steps
}

export default function OptimalAccountBalancingVisualizer() {
  const [text, setText] = useState(EXAMPLES[0].text)
  const [panelDivs, setPanelDivs] = useState(null)

  const inputError = useMemo(() => {
    try {
      parseTransactions(text)
      return ''
    } catch (e) {
      return e.message
    }
  }, [text])

  const steps = useMemo(
    () => generateSteps(text).map((current) => ({
      ...current,
      relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
    })),
    [text],
  )

  const {
    stepIndex, setStepIndex, stepForward, stepBack, togglePlay,
    handleReset, isPlaying, speed, setSpeed, isDone,
  } = usePlaybackState(steps.length)

  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const applyExample = useCallback((ex) => {
    setText(ex.text)
    handleReset()
  }, [handleReset])

  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })

  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  const nodes = useMemo(() => layoutNodes(step?.people ?? []), [step?.people])

  const primaryPanel = (
    <div className="p465-panel-primary">
      <div className="p465-card">
        <div className="p465-section-label">Transactions</div>
        <input
          className={`p465-input mono ${inputError ? 'has-error' : ''}`}
          value={text}
          onChange={(e) => { setText(e.target.value); handleReset() }}
          placeholder="[[0,1,10],[2,0,5]]"
        />
        <p className={`p465-hint ${inputError ? 'error' : ''}`}>
          {inputError || 'Each triple is [from, to, amount]. Find the fewest transfers that zero everyone out.'}
        </p>
        <div className="p465-example-row">
          {EXAMPLES.map((ex) => (
            <button
              type="button"
              key={ex.label}
              className={`p465-example-btn ${text === ex.text ? 'active' : ''}`}
              onClick={() => applyExample(ex)}
            >
              {ex.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p465-card">
        <div className="p465-section-label">Debt Graph</div>
        <SvgViewport width={400} height={300}>
          {step?.settlements?.map((s, idx) => {
            const a = nodes.find((n) => n.person === s.from)
            const b = nodes.find((n) => n.person === s.to)
            if (!a || !b) return null
            return (
              <g key={`edge-${idx}`}>
                <line
                  x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                  stroke="var(--primary, #6366f1)"
                  strokeWidth="2"
                  opacity="0.75"
                />
                <text
                  x={(a.x + b.x) / 2}
                  y={(a.y + b.y) / 2 - 4}
                  textAnchor="middle"
                  fontSize="11"
                  fill="var(--text-dim)"
                >
                  {s.amount}
                </text>
              </g>
            )
          })}
          {nodes.map((n, idx) => {
            const bal = step?.debts?.[idx] ?? 0
            const isCursor = step?.cursor === idx
            const isPartner = step?.partner === idx
            return (
              <g key={`node-${n.person}`}>
                <circle
                  cx={n.x} cy={n.y} r="24"
                  fill={bal === 0 ? 'var(--surface3, #21213a)' : bal > 0 ? 'rgba(16,185,129,0.28)' : 'rgba(239,68,68,0.28)'}
                  stroke={isCursor ? 'var(--accent-400, #fbbf24)' : isPartner ? 'var(--primary, #6366f1)' : 'var(--border)'}
                  strokeWidth={isCursor || isPartner ? 3 : 1.5}
                />
                <text x={n.x} y={n.y - 2} textAnchor="middle" fontSize="12" fontWeight="700" fill="var(--text)">
                  P{n.person}
                </text>
                <text x={n.x} y={n.y + 11} textAnchor="middle" fontSize="10" fill="var(--text-dim)">
                  {bal > 0 ? `+${bal}` : bal}
                </text>
              </g>
            )
          })}
        </SvgViewport>
      </div>

      {step?.result !== undefined && (
        <div className="p465-result">
          <div className="p465-section-label" style={{ marginBottom: '0.3rem' }}>Minimum Transfers</div>
          <div className="p465-result-val">{step.result}</div>
        </div>
      )}
    </div>
  )

  const statePanel = (
    <div className="p465-panel-state">
      <div className="p465-card">
        <div className="p465-section-label">Net Balances</div>
        <div className="p465-stat-grid">
          {(step?.balances ?? []).map(([p, v]) => (
            <div key={p} className={`p465-stat ${v === 0 ? '' : v > 0 ? 'credit' : 'debit'}`}>
              <span className="p465-stat-key">person {p}</span>
              <span className="p465-stat-val">{v > 0 ? `+${v}` : v}</span>
            </div>
          ))}
          {!step && <p className="p465-hint">Press Play or Step to begin.</p>}
        </div>
      </div>

      {step?.debts && step.debts.length > 0 && (
        <div className="p465-card">
          <div className="p465-section-label">debts[] (search state)</div>
          <div className="p465-debt-row">
            {step.debts.map((v, idx) => (
              <motion.div
                key={idx}
                className={`p465-debt ${idx === step.cursor ? 'cursor' : ''} ${idx === step.partner ? 'partner' : ''} ${v === 0 ? 'zero' : ''}`}
                animate={{ scale: idx === step.cursor ? 1.12 : 1 }}
              >
                <span className="p465-debt-person">P{step.people?.[idx]}</span>
                <span className="p465-debt-val">{v > 0 ? `+${v}` : v}</span>
              </motion.div>
            ))}
          </div>
          {step.depth !== undefined && (
            <p className="p465-hint" style={{ marginTop: '0.5rem' }}>
              Recursion depth {step.depth} · {step.settlements?.length ?? 0} transfer(s) on the current path
            </p>
          )}
        </div>
      )}

      {step?.settlements?.length > 0 && (
        <div className="p465-card">
          <div className="p465-section-label">Transfers on This Path</div>
          <ul className="p465-list">
            {step.settlements.map((s, idx) => (
              <li key={idx} className="p465-list-item mono">
                P{s.from} → P{s.to} : {s.amount}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )

  const codePanel = (
    <div className="p465-panel-code">
      <CodeTracePanel
        step={step}
        codeLines={SOLUTION_CODE}
        highlightedLines={connectivity.highlightedLines}
        onLineSelect={connectivity.handleLineSelect}
        onActiveLineDomChange={setActiveLineDom}
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
    <div className="p465-panel-status">
      <div className={`p465-status ${step?.phase === 'done' ? 'done' : step?.error ? 'error' : ''}`}>
        {step?.message ?? 'Press Play or Step to begin.'}
      </div>
    </div>
  )

  const playbackPanel = (
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
    </>
  )

  const panelConfigs = useMemo(
    () => [
      { id: 'primary', title: 'Visualization', dockMode: 'split-right' },
      { id: 'state', title: 'State', dockMode: 'split-right' },
      { id: 'code', title: 'Code', dockMode: 'split-bottom' },
      { id: 'status', title: 'Status', dockMode: 'split-bottom', ratio: 0.08 },
    ],
    [],
  )

  return (
    <div className="p465-shell">
      <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
      {panelDivs && (
          {panelDivs.primary && createPortal(primaryPanel, panelDivs.primary)}
          {panelDivs.state && createPortal(statePanel, panelDivs.state)}
          {panelDivs.code && createPortal(codePanel, panelDivs.code)}
          {panelDivs.status && createPortal(statusPanel, panelDivs.status)}
        </>
      )}
      {createPortal(
        <FloatingPanel title="Playback Controls">{playbackPanel}</FloatingPanel>,
        document.body,
      )}
    </div>
  )
}
