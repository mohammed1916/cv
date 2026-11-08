
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState
} from 'react'

import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import RecordStateTable from '../../components/shared/RecordStateTable'

import {
  buildTrace,
  parseInput,
  code,
  python,
  pythonLineMap,
  phases
} from './algorithm'

const definition = {
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  inputLabel: 'Arrays and distance (JSON object with arr1, arr2, d)',
  url: 'https://leetcode.com/problems/find-the-distance-value-between-two-arrays/',
  complexity:
    'O(n·m) time and O(1) auxiliary space for the counting algorithm. ' +
    'The visualizer stores O(n·m) trace frames and their snapshots.',
  examples: [
    {
      label: 'Far values',
      input: '{"arr1":[6,2,20],"arr2":[1,30],"d":3}'
    },
    {
      label: 'Close pairs',
      input: '{"arr1":[1,4,9],"arr2":[2,8],"d":1}'
    },
    {
      label: 'Negatives',
      input: '{"arr1":[-5,0,7],"arr2":[-4,3],"d":2}'
    },
    {
      label: 'LeetCode example',
      input: '{"arr1":[4,5,8],"arr2":[10,9,1,8],"d":2}'
    },
    { label: "Single values, zero distance", input: "{\"arr1\":[0],\"arr2\":[0],\"d\":0}" },
    { label: "Exactly d apart counts as close", input: "{\"arr1\":[1],\"arr2\":[3],\"d\":2}" },
    { label: "Extreme values, distance 200", input: "{\"arr1\":[-100,100],\"arr2\":[100,-100],\"d\":100}" },
    { label: "Long run: 50 values each", input: "{\"arr1\":[55,81,-72,88,-12,-60,-34,2,-85,-71,-59,-60,13,-70,-52,-89,66,-27,85,68,36,-89,35,13,22,-66,-90,-98,-80,-78,-65,74,12,-54,-29,27,93,29,-35,-2,48,-56,24,33,6,86,86,-95,68,86],\"arr2\":[0,-97,52,-97,98,-90,-64,-27,-67,-97,-48,28,8,21,-92,90,52,-17,-2,-62,-48,-51,-40,55,36,91,-37,52,76,35,-27,82,32,6,70,-59,-8,78,-11,56,37,80,28,-31,-16,84,-76,22,36,86],\"d\":3}" },
  ]
}

const CSS = `
.dv-root {
  --dv-bg: var(--surface, #ffffff);
  --dv-surface: var(--surface2, #f7f7fb);
  --dv-text: var(--text, #1d1930);
  --dv-muted: var(--text-muted, #746e82);
  --dv-border: var(--border, #dedce8);
  --dv-violet: #7750c8;
  --dv-violet-soft: rgba(119,80,200,.10);
  --dv-teal: #087f78;
  --dv-teal-soft: rgba(8,127,120,.09);
  --dv-good: #087f62;
  --dv-good-soft: rgba(8,127,98,.09);
  --dv-bad: #c44361;
  --dv-bad-soft: rgba(196,67,97,.09);
  --dv-track: #e7e3ef;
  --dv-line: #a59db7;
  color: var(--dv-text);
  display: grid;
  gap: 16px;
  min-width: 0;
}

[data-theme="dark"] .dv-root,
.dark .dv-root,
.theme-dark .dv-root,
.dv-root[data-mode="dark"] {
  --dv-bg: var(--surface, #11101b);
  --dv-surface: var(--surface2, #1b1929);
  --dv-text: var(--text, #f0ecfa);
  --dv-muted: var(--text-muted, #a9a2bc);
  --dv-border: var(--border, #393347);
  --dv-violet: #b49aff;
  --dv-violet-soft: rgba(167,139,250,.14);
  --dv-teal: #70e0cf;
  --dv-teal-soft: rgba(112,224,207,.10);
  --dv-good: #65ddb0;
  --dv-good-soft: rgba(101,221,176,.10);
  --dv-bad: #ff839b;
  --dv-bad-soft: rgba(255,131,155,.10);
  --dv-track: #302b40;
  --dv-line: #645c77;
}

.dv-root *,
.dv-root *::before,
.dv-root *::after {
  box-sizing: border-box;
}

.dv-panel {
  min-width: 0;
  padding: clamp(14px, 2.3vw, 24px);
  border: 1px solid var(--dv-border);
  border-radius: 17px;
  background: var(--dv-bg);
}

.dv-heading {
  margin: 0 0 17px;
  font-size: 14px;
  font-weight: 800;
  letter-spacing: -.01em;
}

.dv-subheading {
  font-size: 11px;
  font-weight: 750;
  letter-spacing: .1em;
  text-transform: uppercase;
  color: var(--dv-muted);
}

.dv-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  margin-bottom: 18px;
  flex-wrap: wrap;
}

.dv-limit {
  padding: 6px 11px;
  border-radius: 999px;
  color: var(--dv-violet);
  background: var(--dv-violet-soft);
  font-size: 12px;
  font-weight: 800;
}

.dv-flow {
  position: relative;
  isolation: isolate;
  overflow: hidden;
}

.dv-arrays {
  display: grid;
  gap: 18px;
  position: relative;
  z-index: 2;
}

.dv-array-group {
  min-width: 0;
}

.dv-array-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 10px;
  gap: 8px;
}

.dv-array-name {
  font-size: 13px;
  font-weight: 800;
}

.dv-array-hint {
  font-size: 11px;
  color: var(--dv-muted);
}

.dv-array-scroll {
  overflow-x: auto;
  overflow-y: hidden;
  padding: 5px 3px 12px;
  scrollbar-width: thin;
}

.dv-array-items {
  display: flex;
  gap: 9px;
  width: max-content;
  min-width: 100%;
}

.dv-cell {
  width: clamp(48px, 6vw, 66px);
  height: 70px;
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  border-radius: 11px;
  background: var(--dv-surface);
  border: 1px solid var(--dv-border);
  color: var(--dv-text);
  position: relative;
  transition:
    background .24s ease,
    border-color .24s ease,
    box-shadow .24s ease,
    transform .24s ease;
}

.dv-cell-index {
  color: var(--dv-muted);
  font-size: 10px;
  font-weight: 650;
}

.dv-cell-value {
  font-size: 22px;
  font-weight: 850;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

.dv-cell.candidate {
  background: var(--dv-violet-soft);
  border-color: var(--dv-violet);
  box-shadow: 0 0 0 2px var(--dv-violet-soft);
  transform: translateY(-3px);
}

.dv-cell.blocker {
  background: var(--dv-teal-soft);
  border-color: var(--dv-teal);
  box-shadow: 0 0 0 2px var(--dv-teal-soft);
  transform: translateY(-3px);
}

.dv-cell.accepted {
  border-color: var(--dv-good);
  background: var(--dv-good-soft);
}

.dv-cell.rejected {
  border-color: var(--dv-bad);
  background: var(--dv-bad-soft);
}

.dv-cell.candidate .dv-cell-value {
  color: var(--dv-violet);
}

.dv-cell.blocker .dv-cell-value {
  color: var(--dv-teal);
}

.dv-bridge-space {
  height: clamp(90px, 13vw, 145px);
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dv-bridge-caption {
  position: relative;
  z-index: 3;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: .14em;
  color: var(--dv-muted);
  background: var(--dv-bg);
  padding: 8px 12px;
  border: 1px solid var(--dv-border);
  border-radius: 999px;
  pointer-events: none;
}

.dv-connectors {
  position: absolute;
  inset: 0;
  z-index: 1;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: visible;
}

.dv-path {
  fill: none;
  stroke-width: 2.5;
  stroke-linecap: round;
  transition: d .32s ease, opacity .2s ease;
}

.dv-path.candidate {
  stroke: var(--dv-violet);
}

.dv-path.blocker {
  stroke: var(--dv-teal);
}

.dv-path-glow {
  fill: none;
  stroke-width: 10;
  opacity: .11;
  stroke-linecap: round;
}

.dv-path-glow.candidate {
  stroke: var(--dv-violet);
}

.dv-path-glow.blocker {
  stroke: var(--dv-teal);
}

.dv-endpoint {
  stroke: var(--dv-bg);
  stroke-width: 2;
}

.dv-endpoint.candidate {
  fill: var(--dv-violet);
}

.dv-endpoint.blocker {
  fill: var(--dv-teal);
}

.dv-transfer {
  display: grid;
  grid-template-columns: minmax(0,1fr) 46px minmax(0,1fr);
  align-items: center;
  gap: 10px;
  position: relative;
  z-index: 2;
}

.dv-slot {
  min-height: 113px;
  padding: 14px;
  border-radius: 15px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 9px;
  border: 1px solid var(--dv-border);
  background: var(--dv-surface);
  transition: border-color .2s, background .2s;
}

.dv-slot.candidate.active {
  background: var(--dv-violet-soft);
  border-color: var(--dv-violet);
}

.dv-slot.blocker.active {
  background: var(--dv-teal-soft);
  border-color: var(--dv-teal);
}

.dv-slot-label {
  color: var(--dv-muted);
  font-size: 11px;
  font-weight: 750;
  letter-spacing: .06em;
}

.dv-slot-value {
  font-size: clamp(28px, 4vw, 45px);
  font-weight: 850;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

.dv-slot.candidate.active .dv-slot-value {
  color: var(--dv-violet);
}

.dv-slot.blocker.active .dv-slot-value {
  color: var(--dv-teal);
}

.dv-versus {
  text-align: center;
  color: var(--dv-muted);
  font-size: 13px;
  font-weight: 850;
}

.dv-equation {
  text-align: center;
  margin-top: 24px;
  font-size: clamp(19px, 2.7vw, 30px);
  font-weight: 850;
  letter-spacing: -.025em;
  font-variant-numeric: tabular-nums;
}

.dv-equation.good { color: var(--dv-good); }
.dv-equation.bad { color: var(--dv-bad); }

.dv-result-note {
  text-align: center;
  color: var(--dv-muted);
  font-size: 12px;
  margin-top: 8px;
  min-height: 20px;
}

.dv-ruler {
  margin-top: 27px;
}

.dv-ruler-top {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 17px;
  font-size: 12px;
  color: var(--dv-muted);
}

.dv-ruler-track {
  height: 14px;
  position: relative;
  background: var(--dv-track);
  border-radius: 99px;
}

.dv-ruler-zone {
  position: absolute;
  top: 0;
  height: 100%;
  border-radius: 99px;
  background: var(--dv-bad-soft);
  border: 1px solid var(--dv-bad);
}

.dv-ruler-marker {
  position: absolute;
  width: 3px;
  height: 30px;
  top: -8px;
  transform: translateX(-50%);
  border-radius: 5px;
}

.dv-ruler-marker.a {
  background: var(--dv-violet);
}

.dv-ruler-marker.b {
  background: var(--dv-teal);
}

.dv-ruler-bottom {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  margin-top: 13px;
  font-size: 11px;
  color: var(--dv-muted);
}

.dv-decision {
  margin-top: 20px;
  border-radius: 11px;
  padding: 13px 15px;
  background: var(--dv-violet-soft);
  border: 1px solid var(--dv-violet);
  color: var(--dv-violet);
  font-size: 13px;
  font-weight: 750;
  line-height: 1.55;
}

.dv-decision.good {
  background: var(--dv-good-soft);
  border-color: var(--dv-good);
  color: var(--dv-good);
}

.dv-decision.bad {
  background: var(--dv-bad-soft);
  border-color: var(--dv-bad);
  color: var(--dv-bad);
}

.dv-metrics {
  display: grid;
  grid-template-columns: repeat(3, minmax(0,1fr));
  gap: 10px;
}

.dv-metric {
  padding: 15px;
  border: 1px solid var(--dv-border);
  background: var(--dv-surface);
  border-radius: 13px;
  min-width: 0;
}

.dv-metric-label {
  display: block;
  font-size: 11px;
  color: var(--dv-muted);
  margin-bottom: 7px;
}

.dv-metric-value {
  font-size: clamp(19px, 3vw, 28px);
  font-weight: 850;
  font-variant-numeric: tabular-nums;
}

.dv-metric-value.good { color: var(--dv-good); }
.dv-metric-value.bad { color: var(--dv-bad); }

.dv-progress {
  height: 6px;
  border-radius: 99px;
  overflow: hidden;
  background: var(--dv-track);
  margin-top: 15px;
}

.dv-progress-fill {
  height: 100%;
  border-radius: inherit;
  background: var(--dv-violet);
  transition: width .3s ease;
}

.dv-progress-caption {
  margin-top: 9px;
  color: var(--dv-muted);
  font-size: 11px;
}

.dv-narration {
  line-height: 1.7;
  font-size: 14px;
}

.dv-explanation {
  color: var(--dv-muted);
  font-size: 13px;
  line-height: 1.7;
  margin-top: 13px;
}

.dv-root .dv-table-wrap {
  overflow-x: auto;
  min-width: 0;
}

@media (max-width: 600px) {
  .dv-panel { padding: 13px; }
  .dv-cell { width: 51px; height: 62px; }
  .dv-cell-value { font-size: 19px; }
  .dv-transfer {
    grid-template-columns: minmax(0,1fr) 24px minmax(0,1fr);
    gap: 6px;
  }
  .dv-slot { min-height: 92px; padding: 10px; }
  .dv-metric { padding: 11px; }
  .dv-bridge-space { height: 95px; }
}

@media (prefers-reduced-motion: reduce) {
  .dv-root *,
  .dv-root *::before,
  .dv-root *::after {
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
  }
}
`

function useDarkMode(ref) {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const readTheme = () => {
      const ancestors = []
      let node = element

      while (node) {
        ancestors.push(node)
        node = node.parentElement
      }

      const hasDarkAttribute = ancestors.some(el => {
        const theme = el.getAttribute?.('data-theme')
        const mode = el.getAttribute?.('data-mode')

        return (
          theme === 'dark' ||
          mode === 'dark' ||
          el.classList?.contains('dark') ||
          el.classList?.contains('theme-dark')
        )
      })

      const hasLightAttribute = ancestors.some(el => {
        const theme = el.getAttribute?.('data-theme')
        const mode = el.getAttribute?.('data-mode')

        return (
          theme === 'light' ||
          mode === 'light' ||
          el.classList?.contains('light') ||
          el.classList?.contains('theme-light')
        )
      })

      if (hasDarkAttribute) {
        setDark(true)
      } else if (hasLightAttribute) {
        setDark(false)
      } else {
        const bg = getComputedStyle(element).backgroundColor
        const match = bg.match(
          /rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/
        )

        if (match) {
          const r = Number(match[1])
          const g = Number(match[2])
          const b = Number(match[3])
          setDark((r * 299 + g * 587 + b * 114) / 1000 < 128)
        } else {
          setDark(
            window.matchMedia('(prefers-color-scheme: dark)').matches
          )
        }
      }
    }

    readTheme()

    const observer = new MutationObserver(readTheme)
    let node = element

    while (node) {
      observer.observe(node, {
        attributes: true,
        attributeFilter: ['class', 'data-theme', 'data-mode', 'style']
      })
      node = node.parentElement
    }

    const media = window.matchMedia('(prefers-color-scheme: dark)')
    media.addEventListener?.('change', readTheme)

    return () => {
      observer.disconnect()
      media.removeEventListener?.('change', readTheme)
    }
  }, [ref])

  return dark
}

function ArrayRow({
  label,
  hint,
  values,
  active,
  verdict,
  kind,
  registerCell
}) {
  return (
    <div className="dv-array-group">
      <div className="dv-array-header">
        <span className="dv-array-name">{label}</span>
        <span className="dv-array-hint">{hint}</span>
      </div>

      <div className="dv-array-scroll">
        <div className="dv-array-items">
          {values.map((value, i) => {
            let role = ''

            if (verdict) {
              if (verdict[i] === true) role = 'accepted'
              if (verdict[i] === false) role = 'rejected'
            }

            if (active === i) {
              role = kind
            }

            return (
              <div
                key={i}
                ref={el => registerCell(kind, i, el)}
                className={`dv-cell ${role}`}
                aria-label={`${label} index ${i}, value ${value}`}
              >
                <span className="dv-cell-index">[{i}]</span>
                <span className="dv-cell-value">{value}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function ConnectionOverlay({
  containerRef,
  candidateRefs,
  blockerRefs,
  candidateSlotRef,
  blockerSlotRef,
  index,
  other
}) {
  const [geometry, setGeometry] = useState({
    width: 0,
    height: 0,
    candidate: null,
    blocker: null
  })

  const measure = useCallback(() => {
    const container = containerRef.current
    if (!container) return

    const bounds = container.getBoundingClientRect()

    const point = (element, bottom) => {
      if (!element) return null

      const rect = element.getBoundingClientRect()

      return {
        x: rect.left + rect.width / 2 - bounds.left,
        y: (bottom ? rect.bottom : rect.top) - bounds.top
      }
    }

    const getPair = (source, target) => {
      if (!source || !target) return null

      return {
        from: point(source, true),
        to: point(target, false)
      }
    }

    setGeometry({
      width: bounds.width,
      height: bounds.height,
      candidate: getPair(
        index === null ? null : candidateRefs.current[index],
        candidateSlotRef.current
      ),
      blocker: getPair(
        other === null ? null : blockerRefs.current[other],
        blockerSlotRef.current
      )
    })
  }, [
    containerRef,
    candidateRefs,
    blockerRefs,
    candidateSlotRef,
    blockerSlotRef,
    index,
    other
  ])

  useLayoutEffect(() => {
    measure()

    const container = containerRef.current
    if (!container) return

    const observer = new ResizeObserver(measure)
    observer.observe(container)

    const observed = [
      ...candidateRefs.current,
      ...blockerRefs.current,
      candidateSlotRef.current,
      blockerSlotRef.current
    ].filter(Boolean)

    observed.forEach(element => observer.observe(element))

    const scrollContainers = new Set()
    observed.forEach(element => {
      let node = element.parentElement

      while (node && node !== container) {
        if (node.scrollWidth > node.clientWidth) {
          scrollContainers.add(node)
        }
        node = node.parentElement
      }
    })

    scrollContainers.forEach(element =>
      element.addEventListener('scroll', measure, { passive: true })
    )

    window.addEventListener('resize', measure)
    window.addEventListener('scroll', measure, true)

    return () => {
      observer.disconnect()
      scrollContainers.forEach(element =>
        element.removeEventListener('scroll', measure)
      )
      window.removeEventListener('resize', measure)
      window.removeEventListener('scroll', measure, true)
    }
  }, [measure, containerRef, candidateRefs, blockerRefs])

  const makePath = pair => {
    if (!pair) return ''

    const { from, to } = pair
    const distance = Math.max(30, Math.abs(to.y - from.y) * .45)

    return (
      `M ${from.x} ${from.y} ` +
      `C ${from.x} ${from.y + distance}, ` +
      `${to.x} ${to.y - distance}, ` +
      `${to.x} ${to.y}`
    )
  }

  const draw = (pair, kind) => {
    if (!pair) return null

    const d = makePath(pair)

    return (
      <g key={kind}>
        <path className={`dv-path-glow ${kind}`} d={d} />
        <path className={`dv-path ${kind}`} d={d} />

        <circle
          className={`dv-endpoint ${kind}`}
          cx={pair.from.x}
          cy={pair.from.y}
          r="5"
        />

        <circle
          className={`dv-endpoint ${kind}`}
          cx={pair.to.x}
          cy={pair.to.y}
          r="5"
        />
      </g>
    )
  }

  return (
    <svg
      className="dv-connectors"
      viewBox={`0 0 ${Math.max(1, geometry.width)} ${Math.max(1, geometry.height)}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {draw(geometry.candidate, 'candidate')}
      {draw(geometry.blocker, 'blocker')}
    </svg>
  )
}

function DistanceRuler({ a, b, d }) {
  if (a === null || b === null) {
    return (
      <div className="dv-ruler">
        <div className="dv-ruler-top">
          <span>Distance number line</span>
          <span>Waiting for comparison</span>
        </div>
        <div className="dv-ruler-track" />
      </div>
    )
  }

  const min = Math.min(a - d, a, b) - 2
  const max = Math.max(a + d, a, b) + 2
  const span = Math.max(1, max - min)

  const position = value =>
    ((value - min) / span) * 100

  const left = position(a - d)
  const right = position(a + d)

  return (
    <div className="dv-ruler">
      <div className="dv-ruler-top">
        <span>Distance number line</span>
        <span>Forbidden interval: [{a - d}, {a + d}]</span>
      </div>

      <div className="dv-ruler-track">
        <div
          className="dv-ruler-zone"
          style={{
            left: `${left}%`,
            width: `${right - left}%`
          }}
        />

        <div
          className="dv-ruler-marker a"
          style={{ left: `${position(a)}%` }}
          title={`Candidate ${a}`}
        />

        <div
          className="dv-ruler-marker b"
          style={{ left: `${position(b)}%` }}
          title={`Blocker ${b}`}
        />
      </div>

      <div className="dv-ruler-bottom">
        <span>{min}</span>
        <span>Violet: candidate · Teal: blocker</span>
        <span>{max}</span>
      </div>
    </div>
  )
}

function ConnectedComparison({ run, step }) {
  const rootRef = useRef(null)
  const flowRef = useRef(null)
  const candidateRefs = useRef([])
  const blockerRefs = useRef([])
  const candidateSlotRef = useRef(null)
  const blockerSlotRef = useRef(null)

  const dark = useDarkMode(rootRef)

  const { arr1, arr2, d } = run.input
  const snapshot = step.snapshot

  const i = snapshot.index
  const j = snapshot.other

  const a = i === null ? null : arr1[i]
  const b = j === null ? null : arr2[j]
  const gap = snapshot.gap

  const bad = gap !== null && gap <= d
  const good = gap !== null && gap > d

  const registerCell = useCallback((kind, index, element) => {
    const target =
      kind === 'candidate'
        ? candidateRefs.current
        : blockerRefs.current

    target[index] = element
  }, [])

  const completed = snapshot.verdict.filter(
    value => value !== null
  ).length

  const rejected = snapshot.verdict.filter(
    value => value === false
  ).length

  let decision = 'Select a candidate to begin.'
  let decisionClass = ''

  if (snapshot.event === 'candidate') {
    decision = `Candidate ${a} selected. Scan arr2 for a blocker.`
  } else if (snapshot.event === 'safe') {
    decision = `${b} is far enough away. Continue scanning arr2.`
    decisionClass = 'good'
  } else if (snapshot.event === 'boundary') {
    decision = `${b} is within the forbidden distance.`
    decisionClass = 'bad'
  } else if (snapshot.event === 'rejected') {
    decision = `Reject ${a}: one close blocker is enough.`
    decisionClass = 'bad'
  } else if (snapshot.event === 'accepted') {
    decision = `Accept ${a}: every checked blocker was farther than d.`
    decisionClass = 'good'
  } else if (snapshot.event === 'done') {
    decision = `Final distance value: ${snapshot.count}`
    decisionClass = 'good'
  }

  const rows = arr1.map((value, index) => {
    const verdict = snapshot.verdict[index]

    return {
      'arr1 value': value,
      'nearest gap': snapshot.nearest[index] ?? '—',
      'checked': snapshot.comparisons[index],
      'counted?':
        verdict === null
          ? 'pending'
          : verdict
            ? 'yes'
            : 'no'
    }
  })

  return (
    <div
      className="dv-root"
      ref={rootRef}
      data-mode={dark ? 'dark' : 'light'}
    >
      <style>{CSS}</style>

      <section className="dv-panel dv-flow" ref={flowRef}>
        <div className="dv-header-row">
          <span className="dv-subheading">
            Array inspection → Live comparison
          </span>
          <span className="dv-limit">d = {d}</span>
        </div>

        <div className="dv-arrays">
          <ArrayRow
            label="arr1 · Candidates"
            hint="Find values that qualify"
            values={arr1}
            active={i}
            verdict={snapshot.verdict}
            kind="candidate"
            registerCell={registerCell}
          />

          <ArrayRow
            label="arr2 · Possible blockers"
            hint="One close value rejects"
            values={arr2}
            active={j}
            kind="blocker"
            registerCell={registerCell}
          />
        </div>

        <div className="dv-bridge-space">
          <span className="dv-bridge-caption">
            VALUE TRANSFER
          </span>
        </div>

        <div className="dv-transfer">
          <div
            ref={candidateSlotRef}
            className={`dv-slot candidate ${a !== null ? 'active' : ''}`}
          >
            <span className="dv-slot-label">
              {i === null ? 'CANDIDATE' : `arr1[${i}]`}
            </span>
            <span className="dv-slot-value">
              {a ?? '—'}
            </span>
          </div>

          <span className="dv-versus">VS</span>

          <div
            ref={blockerSlotRef}
            className={`dv-slot blocker ${b !== null ? 'active' : ''}`}
          >
            <span className="dv-slot-label">
              {j === null ? 'BLOCKER' : `arr2[${j}]`}
            </span>
            <span className="dv-slot-value">
              {b ?? '—'}
            </span>
          </div>
        </div>

        <ConnectionOverlay
          containerRef={flowRef}
          candidateRefs={candidateRefs}
          blockerRefs={blockerRefs}
          candidateSlotRef={candidateSlotRef}
          blockerSlotRef={blockerSlotRef}
          index={i}
          other={j}
        />

        <div
          className={`dv-equation ${bad ? 'bad' : good ? 'good' : ''
            }`}
        >
          {gap === null
            ? `|a − b| > ${d}`
            : `|${a} − ${b}| = ${gap} ${bad ? '≤' : '>'} ${d}`}
        </div>

        <div className="dv-result-note">
          {gap === null
            ? 'Waiting for the next comparison'
            : bad
              ? 'Distance is too small'
              : 'Distance is safe so far'}
        </div>

        <DistanceRuler a={a} b={b} d={d} />

        <div
          className={`dv-decision ${decisionClass}`}
          aria-live="polite"
        >
          {decision}
        </div>
      </section>

      <section className="dv-panel">
        <h3 className="dv-heading">
          Decision progress
        </h3>

        <div className="dv-metrics">
          <div className="dv-metric">
            <span className="dv-metric-label">Accepted</span>
            <span className="dv-metric-value good">
              {snapshot.count}
            </span>
          </div>

          <div className="dv-metric">
            <span className="dv-metric-label">Rejected</span>
            <span className="dv-metric-value bad">
              {rejected}
            </span>
          </div>

          <div className="dv-metric">
            <span className="dv-metric-label">Comparisons</span>
            <span className="dv-metric-value">
              {snapshot.totalComparisons}
            </span>
          </div>
        </div>

        <div className="dv-progress">
          <div
            className="dv-progress-fill"
            style={{
              width: `${completed / arr1.length * 100}%`
            }}
          />
        </div>

        <div className="dv-progress-caption">
          {completed} of {arr1.length} candidates decided
        </div>
      </section>

      <section className="dv-panel">
        <h3 className="dv-heading">
          Candidate decision tracker
        </h3>

        <div className="dv-table-wrap">
          <RecordStateTable
            label="Observed comparisons"
            columns={[
              'arr1 value',
              'nearest gap',
              'checked',
              'counted?'
            ]}
            activeRow={i ?? -1}
            rows={rows}
          />
        </div>
      </section>
    </div>
  )
}

function DistanceReasoning({ step }) {
  return (
    <div className="dv-root">
      <style>{CSS}</style>

      <section className="dv-panel">
        <h3 className="dv-heading">
          Why this step matters
        </h3>

        <div className="dv-narration">
          {step.message}
        </div>

        <div className="dv-explanation">
          A candidate qualifies only when every blocker
          satisfies |a − b| &gt; d.
          Equality with d is not enough.
          The first blocker within distance d rejects
          the candidate immediately.
        </div>
      </section>
    </div>
  )
}

export default function DistanceValueBetweenArrays() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => (
        <ConnectedComparison run={run} step={step} />
      )}
      renderReasoning={({ step }) => (
        <DistanceReasoning step={step} />
      )}
    />
  )
}
