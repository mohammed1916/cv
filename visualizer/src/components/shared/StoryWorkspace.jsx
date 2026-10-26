import { useState } from 'react'
import CodeTracePanel from '../CodeTracePanel'
import PlaybackControls from '../PlaybackControls'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import './StoryWorkspace.css'

/**
 * Step-by-step explanation: code on the left, one scene and its narration on the right, and play controls
 * (including rewind) underneath. Each frame carries its own narration (`message`), a `chapter` heading, and
 * the `activeLine` to highlight in the code. The reader always sees what happens next.
 *
 * definition: { inputLabel, rules[], parse(text), build(parsed) -> { frames[], ... }, code, examples[], url }
 * renderScene({ run, frame, index }) draws the current frame.
 */
export default function StoryWorkspace({ definition, renderScene }) {
  const [draft, setDraft] = useState(definition.examples[0].input)
  const [run, setRun] = useState(() => definition.build(definition.parse(definition.examples[0].input)))
  const [error, setError] = useState('')
  const playback = usePlaybackState(run?.frames.length || 0)
  const index = Math.max(0, playback.stepIndex)
  const frame = run?.frames[index]
  const next = run?.frames[index + 1]

  const seek = target => { playback.setIsPlaying(false); playback.setStepIndex(target) }

  function execute(text) {
    setDraft(text)
    playback.handleReset()
    try {
      setRun(definition.build(definition.parse(text)))
      setError('')
    } catch (failure) {
      setRun(null)
      setError(failure.message)
    }
  }

  return <div className="story">
    <form className="story__input" onSubmit={event => { event.preventDefault(); execute(draft) }}>
      <label>{definition.inputLabel}
        <textarea aria-label={definition.inputLabel} value={draft} rows={2} onChange={event => setDraft(event.target.value)} />
      </label>
      <button type="submit">Run input</button>
      <div className="story__examples">{definition.examples.map(example =>
        <button type="button" key={example.label} onClick={() => execute(example.input)}>{example.label}</button>)}</div>
      {error && <p role="alert">{error}</p>}
    </form>

    {definition.rules?.length > 0 && <ul className="story__rules">{definition.rules.map(rule => <li key={rule}>{rule}</li>)}</ul>}

    {run && frame ? <>
      <div className="story__stage">
        <div className="story__code">
          <CodeTracePanel codeLines={definition.code} step={frame} disableResizer />
        </div>
        <div className="story__main">
          <div className="story__chapter">
            <span>{frame.chapter}</span>
            <span className="story__count">Step {index + 1} of {run.frames.length}</span>
          </div>
          <div className="story__scene">{renderScene({ run, frame, index })}</div>
          <p className="story__now" role="status"><strong>Now:</strong> {frame.message}</p>
          <p className="story__next"><strong>Next:</strong> {next ? next.message : 'That was the last step. Rewind to replay any part.'}</p>
        </div>
      </div>
      <div className="story__controls">
        <PlaybackControls onReset={() => seek(0)} onPrev={() => seek(Math.max(0, playback.stepIndex - 1))}
          onNext={() => seek(Math.min(run.frames.length - 1, index + 1))}
          onPlayToggle={() => {
            if (playback.isDone || playback.stepIndex < 0) playback.setStepIndex(0)
            playback.setIsPlaying(value => !value)
          }}
          isPlaying={playback.isPlaying} isDone={playback.isDone}
          prevDisabled={index === 0} nextDisabled={index >= run.frames.length - 1}
          speed={playback.speed} onSpeedChange={event => playback.setSpeed(Number(event.target.value))}
          activeStep={index} totalSteps={run.frames.length} />
        <label className="story__timeline">Timeline
          <input aria-label="Story timeline" type="range" min={0} max={Math.max(0, run.frames.length - 1)} value={index}
            onChange={event => seek(Number(event.target.value))} />
        </label>
      </div>
    </> : <p className="story__empty">Enter a valid input to see the story.</p>}
  </div>
}
