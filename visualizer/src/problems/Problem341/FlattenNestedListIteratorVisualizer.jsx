import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import FloatingPanel from '../../components/shared/FloatingPanel'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { getExamples } from '../../config/examplesRegistry'
import './FlattenNestedListIteratorVisualizer.css'

const SOLUTION_CODE = [
  { line: 1, text: 'class NestedIterator:' },
  { line: 2, text: '    def __init__(self, nestedList):' },
  { line: 3, text: '        self.stack = list(reversed(nestedList))' },
  { line: 4, text: '' },
  { line: 5, text: '    def hasNext(self):' },
  { line: 6, text: '        while self.stack:' },
  { line: 7, text: '            top = self.stack[-1]' },
  { line: 8, text: '            if top.isInteger():' },
  { line: 9, text: '                return True' },
  { line: 10, text: '            self.stack.pop()' },
  { line: 11, text: '            for item in reversed(top.getList()):' },
  { line: 12, text: '                self.stack.append(item)' },
  { line: 13, text: '        return False' },
  { line: 14, text: '' },
  { line: 15, text: '    def next(self):' },
  { line: 16, text: '        return self.stack.pop().getInteger()' },
]

function isInt(value) {
  return typeof value === 'number' && Number.isFinite(value) && Math.floor(value) === value
}

// A valid nested list is an array whose elements are integers or nested lists.
function isValidNested(value) {
  if (!Array.isArray(value)) return false
  return value.every((el) => isInt(el) || isValidNested(el))
}

function describeValue(value) {
  return Array.isArray(value) ? JSON.stringify(value) : String(value)
}

/**
 * Simulate the stack-based flattening iterator over `nestedList`.
 * Mirrors a consumer loop: while it.hasNext(): out.append(it.next()).
 * hasNext() peeks the top of the stack and expands lists (pushing their
 * items reversed) until an integer is on top; next() pops that integer.
 */
function generateSteps(nestedList) {
  if (!isValidNested(nestedList)) return []

  const steps = []
  let uid = 0
  const makeItem = (value) => ({
    id: uid++,
    value,
    display: describeValue(value),
    isInteger: isInt(value),
  })

  // stack is stored bottom-to-top; the top of the stack is the LAST element.
  const stack = nestedList.slice().reverse().map(makeItem)
  const output = []
  const MAX_STEPS = 600

  const snapshot = (extra) => ({
    stack: stack.map((it) => ({ id: it.id, display: it.display, isInteger: it.isInteger })),
    output: [...output],
    ...extra,
  })

  steps.push(
    snapshot({
      phase: 'init',
      action: 'init',
      activeLine: 3,
      relatedLines: [1, 2, 3],
      emitted: null,
      hasNextResult: null,
      topId: stack.length ? stack[stack.length - 1].id : null,
      message: nestedList.length
        ? 'Initialize the stack with the nested list reversed, so the first element sits on top.'
        : 'Initialize the stack. The input list is empty.',
    }),
  )

  while (steps.length < MAX_STEPS) {
    // hasNext(): expand lists until the top is an integer or the stack is empty.
    let found = false
    while (stack.length > 0 && steps.length < MAX_STEPS) {
      const top = stack[stack.length - 1]

      steps.push(
        snapshot({
          phase: 'loop',
          action: 'peek',
          activeLine: 7,
          relatedLines: [6, 7],
          emitted: null,
          hasNextResult: null,
          topId: top.id,
          message: `hasNext(): peek at the top of the stack -> ${top.display}.`,
        }),
      )

      if (top.isInteger) {
        steps.push(
          snapshot({
            phase: 'loop',
            action: 'has-next',
            activeLine: 9,
            relatedLines: [8, 9],
            emitted: null,
            hasNextResult: true,
            topId: top.id,
            message: `Top ${top.display} is an integer -> hasNext() returns True.`,
          }),
        )
        found = true
        break
      }

      // Top is a list: pop it and push its items back in reverse order.
      stack.pop()
      const listVal = top.value
      const pushed = listVal.slice().reverse().map(makeItem)
      pushed.forEach((it) => stack.push(it))

      steps.push(
        snapshot({
          phase: 'expand',
          action: 'expand',
          activeLine: 12,
          relatedLines: [8, 10, 11, 12],
          emitted: null,
          hasNextResult: null,
          topId: stack.length ? stack[stack.length - 1].id : null,
          message: listVal.length
            ? `Top ${top.display} is a list -> pop it and push its ${listVal.length} item(s) back reversed.`
            : `Top ${top.display} is an empty list -> pop it and push nothing.`,
        }),
      )
    }

    if (!found) {
      steps.push(
        snapshot({
          phase: 'done',
          action: 'done',
          activeLine: 13,
          relatedLines: [6, 13],
          emitted: null,
          hasNextResult: false,
          topId: null,
          message: 'Stack is empty -> hasNext() returns False. Iteration complete.',
        }),
      )
      break
    }

    // next(): pop the integer now on top and add it to the flattened output.
    const emittedItem = stack.pop()
    output.push(emittedItem.value)
    steps.push(
      snapshot({
        phase: 'update',
        action: 'emit',
        activeLine: 16,
        relatedLines: [15, 16],
        emitted: emittedItem.value,
        emittedIndex: output.length - 1,
        hasNextResult: null,
        topId: stack.length ? stack[stack.length - 1].id : null,
        message: `next(): pop ${emittedItem.value} and return it. Flattened output now holds ${output.length} value(s).`,
      }),
    )
  }

  return steps
}

const ACTION_META = {
  init: { label: 'INIT', color: '#94a3b8' },
  peek: { label: 'PEEK TOP', color: '#60a5fa' },
  'has-next': { label: 'hasNext -> True', color: '#f59e0b' },
  expand: { label: 'EXPAND LIST', color: '#a78bfa' },
  emit: { label: 'next() -> EMIT', color: '#22c55e' },
  done: { label: 'DONE', color: '#22c55e' },
}

const PREFIX = 'flatten-nested-list-iterator'

// Recursively render the original nested structure with brackets.
function renderNode(value, keyStr) {
  if (Array.isArray(value)) {
    return (
      <span key={keyStr} className={`${PREFIX}-nested-list`}>
        <span className={`${PREFIX}-bracket`}>[</span>
        {value.map((child, i) => (
          <span key={i} className={`${PREFIX}-nested-item`}>
            {renderNode(child, `${keyStr}.${i}`)}
            {i < value.length - 1 ? <span className={`${PREFIX}-comma`}>,</span> : null}
          </span>
        ))}
        <span className={`${PREFIX}-bracket`}>]</span>
      </span>
    )
  }
  return (
    <span key={keyStr} className={`${PREFIX}-nested-int`}>
      {value}
    </span>
  )
}

const REGISTRY_EXAMPLES = getExamples('flatten-nested-list-iterator') || []
const FALLBACK_EXAMPLES = [
  { label: '[[1,1],2,[1,1]]', inputs: [[1, 1], 2, [1, 1]] },
  { label: '[1,[4,[6]]]', inputs: [1, [4, [6]]] },
  { label: '[3,[2,[1,[]]],4]', inputs: [3, [2, [1, []]], 4] },
  { label: '[[]] (empty)', inputs: [[]] },
]
const EXAMPLES = REGISTRY_EXAMPLES.length > 0 ? REGISTRY_EXAMPLES : FALLBACK_EXAMPLES

export default function FlattenNestedListIteratorVisualizer() {
  const [inputValue, setInputValue] = useState(
    JSON.stringify(EXAMPLES[0].inputs || EXAMPLES[0]),
  )

  const { parsed, inputError } = useMemo(() => {
    try {
      const data = JSON.parse(inputValue)
      if (!isValidNested(data)) {
        return {
          parsed: null,
          inputError: 'Input must be a nested list of integers, e.g. [[1,1],2,[1,1]].',
        }
      }
      return { parsed: data, inputError: '' }
    } catch (e) {
      return { parsed: null, inputError: e.message }
    }
  }, [inputValue])

  const steps = useMemo(() => (parsed ? generateSteps(parsed) : []), [parsed])
  const {
    stepIndex, setStepIndex, stepForward, stepBack, togglePlay,
    handleReset, isPlaying, speed, setSpeed, isDone,
  } = usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })

  const displayStack = step ? [...step.stack].reverse() : []
  const output = step ? step.output : []
  const actionMeta = step ? ACTION_META[step.action] || { label: '', color: '#94a3b8' } : null

  return (
    <div className="flatten-nested-list-iterator-shell">
      <div className="flatten-nested-list-iterator-panel">
        <div className="flatten-nested-list-iterator-panel-head">Input (nested list as JSON)</div>
        <div className="flatten-nested-list-iterator-panel-body">
          <textarea
            value={inputValue}
            onChange={(e) => { setInputValue(e.target.value); handleReset() }}
            className="flatten-nested-list-iterator-textarea"
            placeholder="e.g. [[1,1],2,[1,1]]"
            spellCheck={false}
          />
          {inputError && <div className="flatten-nested-list-iterator-error">{inputError}</div>}
        </div>
      </div>

      <div className="flatten-nested-list-iterator-panel">
        <div className="flatten-nested-list-iterator-panel-head">Visualization</div>
        <div className="flatten-nested-list-iterator-panel-body">
          <AnimatePresence mode="wait">
            <motion.div
              key={stepIndex}
              className="flatten-nested-list-iterator-viz"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <div className="flatten-nested-list-iterator-step-info">
                {actionMeta && (
                  <span
                    className="flatten-nested-list-iterator-action-badge"
                    style={{ background: `${actionMeta.color}22`, color: actionMeta.color, borderColor: actionMeta.color }}
                  >
                    {actionMeta.label}
                  </span>
                )}
                <h3>{step?.message || 'Press play or step to begin flattening the nested list.'}</h3>
              </div>

              {!parsed ? (
                <div className="flatten-nested-list-iterator-note">
                  Enter a valid nested list of integers to visualize the iterator.
                </div>
              ) : (
                <>
                  <div className="flatten-nested-list-iterator-columns">
                    <div className="flatten-nested-list-iterator-section">
                      <div className="flatten-nested-list-iterator-section-title">
                        Stack <span className="flatten-nested-list-iterator-hint">(top highlighted)</span>
                      </div>
                      <div className="flatten-nested-list-iterator-stack-col">
                        {displayStack.length === 0 ? (
                          <div className="flatten-nested-list-iterator-stack-empty">empty</div>
                        ) : (
                          displayStack.map((item, i) => {
                            const isTop = i === 0
                            const cls = [
                              'flatten-nested-list-iterator-stack-item',
                              item.isInteger ? 'int' : 'list',
                              isTop ? 'top' : '',
                            ].filter(Boolean).join(' ')
                            return (
                              <div key={item.id} className={cls}>
                                {isTop && <span className="flatten-nested-list-iterator-top-label">top</span>}
                                <span className="flatten-nested-list-iterator-stack-val">{item.display}</span>
                              </div>
                            )
                          })
                        )}
                      </div>
                    </div>

                    <div className="flatten-nested-list-iterator-section">
                      <div className="flatten-nested-list-iterator-section-title">Nested structure</div>
                      <div className="flatten-nested-list-iterator-nested-tree">
                        {renderNode(parsed, 'root')}
                      </div>
                    </div>
                  </div>

                  <div className="flatten-nested-list-iterator-section">
                    <div className="flatten-nested-list-iterator-section-title">
                      Flattened output <span className="flatten-nested-list-iterator-hint">({output.length})</span>
                    </div>
                    <div className="flatten-nested-list-iterator-output-row">
                      {output.length === 0 ? (
                        <div className="flatten-nested-list-iterator-output-empty">nothing emitted yet</div>
                      ) : (
                        output.map((val, i) => {
                          const isNewest = step?.action === 'emit' && i === step.emittedIndex
                          return (
                            <span
                              key={i}
                              className={`flatten-nested-list-iterator-output-chip${isNewest ? ' newest' : ''}`}
                            >
                              {val}
                            </span>
                          )
                        })
                      )}
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="flatten-nested-list-iterator-panel">
        <div className="flatten-nested-list-iterator-panel-head">Code</div>
        <div className="flatten-nested-list-iterator-panel-body">
          <CodeTracePanel
            step={step}
            codeLines={SOLUTION_CODE}
            highlightedLines={connectivity.highlightedLines}
            onLineSelect={connectivity.handleLineSelect}
          />
        </div>
      </div>

      {EXAMPLES.length > 0 && (
        <div className="flatten-nested-list-iterator-examples">
          {EXAMPLES.map((example, i) => (
            <button
              key={i}
              className="flatten-nested-list-iterator-example-btn"
              onClick={() => { setInputValue(JSON.stringify(example.inputs || example)); handleReset() }}
            >
              {example.label || `Example ${i + 1}`}
            </button>
          ))}
        </div>
      )}

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
          onSpeedChange={(e) => setSpeed(Number(e.target.value))}
        />
      </FloatingPanel>
    </div>
  )
}
