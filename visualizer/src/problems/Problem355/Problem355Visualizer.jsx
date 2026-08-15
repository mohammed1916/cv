import { useState, useMemo, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import FloatingPanel from '../../components/shared/FloatingPanel'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'

import { usePlaybackState } from '../../hooks/usePlaybackState'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import './Problem355Visualizer.css'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import PatternOverlay from "../../components/PatternOverlay";

const PATTERNS = []

const SOLUTION_CODE_INLINE = [
  { line: 1, text: 'class Twitter:' },
  { line: 2, text: '    def __init__(self):' },
  { line: 3, text: '        self.tweets = {}  # userId -> [tweets]' },
  { line: 4, text: '        self.following = {}  # userId -> set(followees)' },
  { line: 5, text: '        self.time = 0' },
  { line: 6, text: '' },
  { line: 7, text: '    def postTweet(self, userId, tweetId):' },
  { line: 8, text: '        self.time += 1' },
  { line: 9, text: '        self.tweets[userId].append((self.time, tweetId))' },
  { line: 10, text: '' },
  { line: 11, text: '    def follow(self, followerId, followeeId):' },
  { line: 12, text: '        self.following[followerId].add(followeeId)' },
  { line: 13, text: '' },
  { line: 14, text: '    def getNewsFeed(self, userId):' },
  { line: 15, text: '        tweets = [t for f in following[userId] for t in tweets[f]]' },
  { line: 16, text: '        return sorted(tweets, key=lambda x: -x[0])[:10]' },
]
const SOLUTION_CODE = SOLUTION_CODE_INLINE

function generateSteps(scenario) {
  const steps = []
  const users = new Set()
  const tweets = {}
  const following = {}
  let timeCounter = 0

  // Helper to initialize user
  const initUser = (userId) => {
    if (!users.has(userId)) {
      users.add(userId)
      tweets[userId] = []
      following[userId] = new Set()
      following[userId].add(userId) // Users always follow themselves
    }
  }

  // Parse scenario
  const operations = scenario?.operations || []
  const params = scenario?.params || {}

  // Sets are not JSON-serializable, so snapshot them as plain arrays.
  const snapshotFollowing = () =>
    JSON.stringify(
      Object.fromEntries(Object.entries(following).map(([k, v]) => [k, Array.from(v)]))
    )

  // Initial state
  steps.push({
    activeLine: 2,
    users: Array.from(users),
    tweets: { ...tweets },
    following: snapshotFollowing(),
    message: 'Initialize Twitter system with empty data structures.',
  })

  // Execute operations
  operations.forEach((op, opIdx) => {
    if (op === 'postTweet') {
      const userId = params.postTweet?.[opIdx]?.[0] || 1
      const tweetId = params.postTweet?.[opIdx]?.[1] || opIdx + 1
      initUser(userId)
      timeCounter++

      steps.push({
        activeLine: 8,
        users: Array.from(users),
        tweets: { ...tweets },
        following: snapshotFollowing(),
        currentOp: `Post Tweet`,
        opUser: userId,
        opTweet: tweetId,
        message: `User ${userId} posts tweet ${tweetId} at time ${timeCounter}.`,
      })

      tweets[userId].push({ time: timeCounter, id: tweetId })

      steps.push({
        activeLine: 9,
        users: Array.from(users),
        tweets: { ...tweets },
        following: snapshotFollowing(),
        currentOp: `Post Tweet`,
        opUser: userId,
        opTweet: tweetId,
        message: `Tweet ${tweetId} added to user ${userId}'s timeline.`,
      })
    } else if (op === 'follow') {
      const followerId = params.follow?.[opIdx]?.[0] || 1
      const followeeId = params.follow?.[opIdx]?.[1] || 2
      initUser(followerId)
      initUser(followeeId)

      steps.push({
        activeLine: 11,
        users: Array.from(users),
        tweets: { ...tweets },
        following: snapshotFollowing(),
        currentOp: `Follow`,
        followerId,
        followeeId,
        message: `User ${followerId} starts following user ${followeeId}.`,
      })

      if (!following[followerId].has(followeeId)) {
        following[followerId].add(followeeId)

        steps.push({
          activeLine: 12,
          users: Array.from(users),
          tweets: { ...tweets },
          following: snapshotFollowing(),
          currentOp: `Follow`,
          followerId,
          followeeId,
          message: `${followeeId} added to ${followerId}'s following list.`,
        })
      }
    } else if (op === 'unfollow') {
      const followerId = params.unfollow?.[opIdx]?.[0] || 1
      const followeeId = params.unfollow?.[opIdx]?.[1] || 2
      initUser(followerId)
      initUser(followeeId)

      steps.push({
        activeLine: 11,
        users: Array.from(users),
        tweets: { ...tweets },
        following: snapshotFollowing(),
        currentOp: `Unfollow`,
        followerId,
        followeeId,
        message: `User ${followerId} unfollows user ${followeeId}.`,
      })

      if (followeeId !== followerId && following[followerId].has(followeeId)) {
        following[followerId].delete(followeeId)

        steps.push({
          activeLine: 12,
          users: Array.from(users),
          tweets: { ...tweets },
          following: snapshotFollowing(),
          currentOp: `Unfollow`,
          followerId,
          followeeId,
          message: `${followeeId} removed from ${followerId}'s following list.`,
        })
      }
    } else if (op === 'getNewsFeed') {
      const userId = params.getNewsFeed?.[opIdx] || 1
      initUser(userId)

      steps.push({
        activeLine: 14,
        users: Array.from(users),
        tweets: { ...tweets },
        following: snapshotFollowing(),
        currentOp: `Get Feed`,
        feedUserId: userId,
        message: `Fetch news feed for user ${userId}.`,
      })

      // Collect tweets from all followees
      const followees = Array.from(following[userId] || [])
      const feedTweets = []
      followees.forEach((followeeId) => {
        if (tweets[followeeId]) {
          tweets[followeeId].forEach((tweet) => {
            feedTweets.push({ ...tweet, authorId: followeeId })
          })
        }
      })

      // Sort by time descending and take top 10
      const newsFeed = feedTweets.sort((a, b) => b.time - a.time).slice(0, 10)

      steps.push({
        activeLine: 16,
        users: Array.from(users),
        tweets: { ...tweets },
        following: snapshotFollowing(),
        currentOp: `Get Feed`,
        feedUserId: userId,
        newsFeed,
        message: `News feed for user ${userId}: ${newsFeed.length} most recent tweets.`,
      })
    }
  })

  return steps
}

const EXAMPLES = [
  {
    label: 'Example 1: Simple Timeline',
    operations: ['postTweet', 'follow', 'postTweet', 'getNewsFeed'],
    params: {
      postTweet: [[1, 1], [2, 2]],
      follow: [[1, 2]],
      getNewsFeed: [1],
    },
  },
  {
    label: 'Example 2: Following Chain',
    operations: ['postTweet', 'postTweet', 'follow', 'follow', 'getNewsFeed'],
    params: {
      postTweet: [[1, 10], [2, 20]],
      follow: [[1, 2], [1, 3]],
      getNewsFeed: [1],
    },
  },
  {
    label: 'Example 3: Complex Network',
    operations: ['postTweet', 'postTweet', 'postTweet', 'follow', 'follow', 'unfollow', 'postTweet', 'getNewsFeed'],
    params: {
      postTweet: [[1, 100], [2, 200], [3, 300]],
      follow: [[1, 2], [1, 3]],
      unfollow: [[1, 3]],
      getNewsFeed: [1],
    },
  },
]

export default function Problem355Visualizer() {
  const [exIdx, setExIdx] = useState(0)
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const ex = EXAMPLES[exIdx]
  const [operationsInput, setOperationsInput] = useState(() => JSON.stringify(EXAMPLES[0].operations))
  const [paramsInput, setParamsInput] = useState(() => JSON.stringify(EXAMPLES[0].params))

  const { scenario, inputError } = useMemo(() => {
    try {
      const operations = JSON.parse(operationsInput)
      if (!Array.isArray(operations) || !operations.every((o) => typeof o === 'string')) {
        throw new Error('operations must be an array of strings, e.g. ["postTweet","getNewsFeed"]')
      }
      const params = JSON.parse(paramsInput)
      if (!params || typeof params !== 'object' || Array.isArray(params)) {
        throw new Error('params must be an object, e.g. {"postTweet":[[1,1]]}')
      }
      return { scenario: { operations, params }, inputError: '' }
    } catch (e) {
      return {
        scenario: { operations: EXAMPLES[0].operations, params: EXAMPLES[0].params },
        inputError: e.message,
      }
    }
  }, [operationsInput, paramsInput])

  const steps = useMemo(() => generateSteps(scenario), [scenario])
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })

  const applyExample = useCallback((idx) => {
    const next = EXAMPLES[idx]
    if (!next) return
    setExIdx(idx)
    setOperationsInput(JSON.stringify(next.operations))
    setParamsInput(JSON.stringify(next.params))
    handleReset()
  }, [handleReset])

  const codePanel = (
    <CodeTracePanel
      step={step}
      codeLines={SOLUTION_CODE}
      highlightedLines={connectivity.highlightedLines}
      onLineSelect={connectivity.handleLineSelect}
      onActiveLineDomChange={setActiveLineDom}
    />
  )

  const vizPanel = (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12, padding: 16, overflow: 'auto' }}>
          {/* Example selector */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {EXAMPLES.map((e, i) => (
              <button
                key={i}
                onClick={() => applyExample(i)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 4,
                  border: '1px solid var(--border)',
                  cursor: 'pointer',
                  fontSize: 12,
                  backgroundColor: exIdx === i ? '#1da1f2' : 'var(--surface2)',
                  color: exIdx === i ? '#fff' : 'var(--surface2)',
                  fontWeight: exIdx === i ? 600 : 400,
                }}
              >
                {e.label}
              </button>
            ))}
          </div>

          <ManualInputPanel
            fields={[
              { key: 'operations', label: 'operations', type: 'array' },
              { key: 'params', label: 'params', type: 'string' },
            ]}
            values={{ operations: operationsInput, params: paramsInput }}
            onChange={(k, v) => {
              if (k === 'operations') setOperationsInput(v)
              else if (k === 'params') setParamsInput(v)
              handleReset()
            }}
            examples={EXAMPLES}
            activeLabel={ex?.label}
            applyExample={(e) => applyExample(EXAMPLES.indexOf(e))}
            inputError={inputError}
          />

          {step && (
            <>
              {/* Current operation */}
              <div style={{ padding: 8, backgroundColor: '#fef3c7', borderRadius: 6, fontSize: 11, borderLeft: '3px solid #f59e0b' }}>
                <div style={{ fontWeight: 600, marginBottom: 4, color: '#92400e' }}>Current Operation</div>
                <div style={{ color: '#b45309', fontFamily: 'monospace' }}>{step.message}</div>
              </div>

              {/* User network */}
              <div style={{ padding: 8, backgroundColor: '#dbeafe', borderRadius: 6 }}>
                <div style={{ fontWeight: 600, marginBottom: 8, fontSize: 12, color: '#1e40af' }}>Users ({step.users.length})</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {step.users.map((userId) => {
                    const isInvolved = step.opUser === userId || step.followerId === userId || step.feedUserId === userId
                    return (
                      <motion.div
                        key={userId}
                        animate={{
                          scale: isInvolved ? 1.1 : 1,
                          backgroundColor: isInvolved ? '#0ea5e9' : '#e0f2fe',
                        }}
                        style={{
                          padding: '6px 12px',
                          borderRadius: 6,
                          border: isInvolved ? '2px solid #0284c7' : '1px solid #0ea5e9',
                          backgroundColor: isInvolved ? '#0ea5e9' : '#e0f2fe',
                          color: isInvolved ? '#fff' : '#0c4a6e',
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        User {userId}
                      </motion.div>
                    )
                  })}
                </div>
              </div>

              {/* Following relationships */}
              {step.users.length > 0 && (
                <div style={{ padding: 8, backgroundColor: '#ecfdf5', borderRadius: 6 }}>
                  <div style={{ fontWeight: 600, marginBottom: 8, fontSize: 12, color: '#065f46' }}>Following Relationships</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 11 }}>
                    {step.users.map((userId) => {
                      const following = JSON.parse(step.following)
                      const followees = Array.from(following[userId] || []).filter((f) => f !== userId)
                      if (followees.length === 0) return null
                      return (
                        <motion.div
                          key={userId}
                          style={{
                            padding: 6,
                            backgroundColor: '#f0fdf4',
                            borderRadius: 4,
                            border: '1px solid #86efac',
                          }}
                        >
                          <div style={{ color: '#15803d', fontWeight: 600, marginBottom: 2 }}>User {userId} follows:</div>
                          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                            {followees.map((followeeId) => (
                              <motion.span
                                key={followeeId}
                                animate={{
                                  backgroundColor:
                                    step.followeeId === followeeId ? '#22c55e' : '#dcfce7',
                                }}
                                style={{
                                  padding: '2px 8px',
                                  backgroundColor:
                                    step.followeeId === followeeId ? '#22c55e' : '#dcfce7',
                                  color: step.followeeId === followeeId ? '#fff' : '#166534',
                                  borderRadius: 3,
                                  fontSize: 10,
                                }}
                              >
                                → User {followeeId}
                              </motion.span>
                            ))}
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Tweets timeline */}
              {Object.keys(step.tweets).length > 0 && (
                <div style={{ padding: 8, backgroundColor: '#f3e8ff', borderRadius: 6 }}>
                  <div style={{ fontWeight: 600, marginBottom: 8, fontSize: 12, color: '#6b21a8' }}>Tweets Timeline</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 10 }}>
                    {Object.entries(step.tweets)
                      .filter(([_, tweetList]) => tweetList.length > 0)
                      .map(([userId, tweetList]) => (
                        <motion.div
                          key={userId}
                          style={{
                            padding: 6,
                            backgroundColor: '#faf5ff',
                            borderRadius: 4,
                            border: '1px solid #e9d5ff',
                          }}
                        >
                          <div style={{ color: '#7e22ce', fontWeight: 600, marginBottom: 2 }}>User {userId}:</div>
                          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                            {tweetList.map((tweet) => (
                              <motion.span
                                key={tweet.id}
                                animate={{
                                  backgroundColor:
                                    step.opTweet === tweet.id ? '#a78bfa' : '#ede9fe',
                                }}
                                style={{
                                  padding: '2px 8px',
                                  backgroundColor:
                                    step.opTweet === tweet.id ? '#a78bfa' : '#ede9fe',
                                  color: step.opTweet === tweet.id ? '#fff' : '#581c87',
                                  borderRadius: 3,
                                  fontFamily: 'monospace',
                                }}
                              >
                                T{tweet.id}
                              </motion.span>
                            ))}
                          </div>
                        </motion.div>
                      ))}
                  </div>
                </div>
              )}

              {/* News feed */}
              {step.newsFeed && step.newsFeed.length > 0 && (
                <div style={{ padding: 8, backgroundColor: '#fee2e2', borderRadius: 6 }}>
                  <div style={{ fontWeight: 600, marginBottom: 8, fontSize: 12, color: '#991b1b' }}>News Feed for User {step.feedUserId}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 10 }}>
                    {step.newsFeed.map((tweet, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        style={{
                          padding: 6,
                          backgroundColor: '#fca5a5',
                          borderRadius: 4,
                          color: '#7f1d1d',
                          fontFamily: 'monospace',
                          fontWeight: 600,
                        }}
                      >
                        [T{idx + 1}] Tweet {tweet.id} from User {tweet.authorId} (time: {tweet.time})
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {!step && (
            <div style={{ padding: 16, backgroundColor: 'var(--surface2)', borderRadius: 6, textAlign: 'center', color: '#617086' }}>
              Press Play or Step to begin.
            </div>
          )}
        </div>
  )

  const [panelDivs, setPanelDivs] = useState(null)
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  const panelConfigs = useMemo(() => [
    { id: 'code', title: 'Code' },
    { id: 'viz', title: '🐦 Twitter Network & Feed', dockMode: 'split-right' },
  ], [])

  return (
    <div className="problem-shell">
      <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
      {panelDivs && (
        <>
          {panelDivs.code && createPortal(codePanel, panelDivs.code)}
          {panelDivs.viz && createPortal(vizPanel, panelDivs.viz)}
        </>
      )}
      {createPortal(
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
        </FloatingPanel>,
        document.body
      )}
      {showPatternOverlay && step && <PatternOverlay step={step} activeLineDom={activeLineDom} />}
    </div>
  )
}
