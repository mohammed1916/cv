import React, { useState, useCallback, useMemo } from 'react'
import DockableWorkspace from '../../components/DockableWorkspace'
import FloatingPanel from '../../components/FloatingPanel'
import './Problem369Visualizer.css'

const SOLUTION_CODE = `class ListNode {
  constructor(val = 0, next = null) {
    this.val = val
    this.next = next
  }
}

const plusOne = (head) => {
  const dummy = new ListNode(0)
  dummy.next = head
  let notNine = dummy
  let node = head

  // Find last non-9 node
  while (node) {
    if (node.val !== 9) notNine = node
    node = node.next
  }

  // Increment and propagate carry
  notNine.val++
  node = notNine.next
  while (node) {
    node.val = 0
    node = node.next
  }

  return dummy.val ? dummy : dummy.next
}`

class LinkedListNode {
  constructor(val, id) {
    this.val = val
    this.id = id
    this.next = null
  }
}

function createLinkedList(values) {
  if (!values || values.length === 0) return null
  const head = new LinkedListNode(values[0], 0)
  let current = head
  for (let i = 1; i < values.length; i++) {
    current.next = new LinkedListNode(values[i], i)
    current = current.next
  }
  return head
}

function listToArray(head) {
  const result = []
  let current = head
  let id = 0
  while (current) {
    result.push({ val: current.val, id: id })
    current = current.next
    id++
  }
  return result
}

function generateSteps(head) {
  if (!head) return []

  const steps = []
  const nodeArray = listToArray(head)

  // Step 1: Identify starting position (rightmost node)
  steps.push({
    type: 'start',
    title: 'Find Rightmost Node',
    description: 'Locate the last node in the linked list',
    nodeArray,
    currentIdx: nodeArray.length - 1,
    carry: 0,
    phase: 'scan',
  })

  // Step 2-3: Process carry propagation from right to left
  const processedArray = JSON.parse(JSON.stringify(nodeArray))
  let carry = 1

  for (let i = nodeArray.length - 1; i >= 0; i--) {
    const sum = processedArray[i].val + carry
    const oldVal = processedArray[i].val
    processedArray[i].val = sum % 10
    carry = Math.floor(sum / 10)

    steps.push({
      type: 'process',
      title: `Add Carry to Node ${i}`,
      description: `${oldVal} + ${carry === 0 ? 1 : '1 (with carry)'} = ${processedArray[i].val}${carry ? ' (carry 1)' : ''}`,
      nodeArray: JSON.parse(JSON.stringify(processedArray)),
      currentIdx: i,
      carry: carry,
      phase: 'propagate',
    })

    if (carry === 0) break
  }

  // Step 4: Handle remaining carry (need new node)
  if (carry === 1) {
    const newArray = [{ val: 1, id: -1 }, ...processedArray]
    steps.push({
      type: 'insert',
      title: 'Insert New Node',
      description: 'Carry persists - insert new node with value 1 at head',
      nodeArray: newArray,
      currentIdx: 0,
      carry: 0,
      phase: 'insert',
    })
  }

  // Step 5: Final result
  steps.push({
    type: 'complete',
    title: 'Result',
    description: 'Plus one operation completed successfully',
    nodeArray: carry === 1 ? [{ val: 1, id: -1 }, ...processedArray] : processedArray,
    currentIdx: -1,
    carry: 0,
    phase: 'complete',
  })

  return steps
}

const EXAMPLES = [
  {
    name: 'Example 1: 999 → 1000',
    values: [9, 9, 9],
    description: 'All nines require new node insertion',
  },
  {
    name: 'Example 2: 123 → 124',
    values: [1, 2, 3],
    description: 'Simple increment without carry propagation',
  },
  {
    name: 'Example 3: 189 → 190',
    values: [1, 8, 9],
    description: 'Carry propagates through multiple nodes',
  },
]

export default function Problem369Visualizer() {
  const [selectedExample, setSelectedExample] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  const head = useMemo(() => {
    return createLinkedList(EXAMPLES[selectedExample].values)
  }, [selectedExample])

  const steps = useMemo(() => {
    return generateSteps(head)
  }, [head])

  const currentStepData = steps[currentStep] || steps[0]

  const handleNextStep = useCallback(() => {
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1))
  }, [steps.length])

  const handlePrevStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 0))
  }, [])

  const handleReset = useCallback(() => {
    setCurrentStep(0)
    setIsPlaying(false)
  }, [])

  const handleExampleChange = useCallback((idx) => {
    setSelectedExample(idx)
    setCurrentStep(0)
    setIsPlaying(false)
  }, [])

  React.useEffect(() => {
    if (!isPlaying) return
    const timer = setTimeout(handleNextStep, 800)
    return () => clearTimeout(timer)
  }, [isPlaying, currentStep, handleNextStep, steps.length])

  const handlePlayPause = useCallback(() => {
    if (currentStep === steps.length - 1) {
      setCurrentStep(0)
      setIsPlaying(true)
    } else {
      setIsPlaying(!isPlaying)
    }
  }, [currentStep, steps.length])

  return (
    <DockableWorkspace>
      <FloatingPanel position="left" width={500}>
        <div className="p369-container">
          <div className="p369-header">
            <h1>Problem 369: Plus One Linked List</h1>
            <p className="p369-difficulty">Medium</p>
          </div>

          <div className="p369-description">
            <h3>Problem</h3>
            <p>
              Given a non-negative integer represented as a linked list of digits, plus one to the
              integer.
            </p>
            <p>
              The most significant digit comes first and each node contains a single digit. Return
              the head of the modified linked list.
            </p>
          </div>

          <div className="p369-story">
            <h4>The Story: Ripple Effect</h4>
            <p>
              Imagine a chain of dominoes, each labeled with a digit. You add one to the rightmost
              domino. If it becomes 10, it falls and pushes the next domino, cascading the carry
              leftward like a ripple through water. Watch as the change propagates through the
              entire chain, transforming the number one node at a time.
            </p>
          </div>

          <div className="p369-code-section">
            <h3>Solution</h3>
            <pre className="p369-code">
              <code>{SOLUTION_CODE}</code>
            </pre>
          </div>
        </div>
      </FloatingPanel>

      <FloatingPanel position="center" width="auto">
        <div className="p369-visualization">
          <div className="p369-step-info">
            <h3>{currentStepData.title}</h3>
            <p>{currentStepData.description}</p>
          </div>

          <div className="p369-list-container">
            <div className="p369-linked-list">
              {currentStepData.nodeArray.map((node, idx) => (
                <React.Fragment key={node.id}>
                  <div
                    className={`p369-node ${
                      idx === currentStepData.currentIdx ? 'active' : ''
                    } ${node.val === 9 ? 'will-carry' : ''} ${
                      currentStepData.phase === 'insert' && node.id === -1 ? 'newly-inserted' : ''
                    }`}
                  >
                    <div className="p369-node-value">{node.val}</div>
                    {idx === currentStepData.currentIdx && currentStepData.phase === 'propagate' && (
                      <div className="p369-carry-indicator">{currentStepData.carry}</div>
                    )}
                  </div>
                  {idx < currentStepData.nodeArray.length - 1 && (
                    <div className="p369-arrow">→</div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="p369-phase-indicator">
            <span className="p369-phase-badge">{currentStepData.phase.toUpperCase()}</span>
          </div>
        </div>
      </FloatingPanel>

      <FloatingPanel position="right" width={450}>
        <div className="p369-control-panel">
          <div className="p369-examples-section">
            <h3>Examples</h3>
            <div className="p369-examples">
              {EXAMPLES.map((example, idx) => (
                <div
                  key={idx}
                  className={`p369-example ${selectedExample === idx ? 'selected' : ''}`}
                  onClick={() => handleExampleChange(idx)}
                >
                  <div className="p369-example-name">{example.name}</div>
                  <div className="p369-example-desc">{example.description}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="p369-controls-section">
            <h3>Controls</h3>
            <div className="p369-playback-controls">
              <button onClick={handlePrevStep} disabled={currentStep === 0}>
                ← Previous
              </button>
              <button onClick={handlePlayPause} className="p369-play-btn">
                {isPlaying ? '⏸ Pause' : currentStep === steps.length - 1 ? '🔄 Restart' : '▶ Play'}
              </button>
              <button onClick={handleNextStep} disabled={currentStep === steps.length - 1}>
                Next →
              </button>
            </div>
            <button onClick={handleReset} className="p369-reset-btn">
              Reset
            </button>
          </div>

          <div className="p369-progress">
            <div className="p369-progress-bar">
              <div
                className="p369-progress-fill"
                style={{
                  width: `${((currentStep + 1) / steps.length) * 100}%`,
                }}
              ></div>
            </div>
            <div className="p369-progress-text">
              Step {currentStep + 1} of {steps.length}
            </div>
          </div>

          <div className="p369-info-section">
            <h4>Algorithm Overview</h4>
            <ul className="p369-algorithm-steps">
              <li>Find the rightmost non-nine node (optimization point)</li>
              <li>Add one to that node</li>
              <li>Set all nodes to its right to zero</li>
              <li>Handle edge case: all nines (insert new node)</li>
              <li>Return the modified list head</li>
            </ul>
          </div>

          <div className="p369-complexity">
            <div className="p369-complexity-item">
              <strong>Time Complexity:</strong> O(n) - single pass through list
            </div>
            <div className="p369-complexity-item">
              <strong>Space Complexity:</strong> O(1) - only pointers used
            </div>
          </div>
        </div>
      </FloatingPanel>
    </DockableWorkspace>
  )
}
