import { useState } from 'react'
import { createPortal } from 'react-dom'
import LuminoDockPanel from '../LuminoDockPanel'
import PlaybackControls from '../PlaybackControls'
import CodeTracePanel from '../CodeTracePanel'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import './AlgorithmWorkspace.css'

const PANELS = [
  { id: 'visual', title: 'Algorithm state' },
  { id: 'reasoning', title: 'Why this works', dockMode: 'split-right' },
  { id: 'code', title: 'Solution code', dockMode: 'split-bottom' },
]

// Problems own validation, execution states, and views. This owns only the shell.
export default function AlgorithmWorkspace({ definition, renderVisual, renderReasoning }) {
  const [draft, setDraft] = useState(definition.examples[0].input)
  const [run, setRun] = useState(() => definition.build(definition.parse(definition.examples[0].input)))
  const [error, setError] = useState('')
  const [panelDivs, setPanelDivs] = useState(null)
  const playback = usePlaybackState(run?.frames.length || 0)
  const step = run?.frames[Math.max(0, playback.stepIndex)]
  function execute(text) {
    setDraft(text)
    playback.handleReset()
    playback.setStepIndex(0)
    try {
      setRun(definition.build(definition.parse(text)))
      setError('')
    } catch (failure) {
      setRun(null)
      setError(failure.message)
    }
  }
  const views = run ? {
    visual: renderVisual({ run, step }),
    reasoning: <>
      <p className="algorithm-workspace__event" role="status">{step.message}</p>
      {renderReasoning({ run, step })}
      <p>{definition.complexity}</p>
      <a href={definition.url} target="_blank" rel="noreferrer">Official problem statement</a>
    </>,
    code: <CodeTracePanel codeLines={definition.code} step={step} disableResizer />,
  } : {}
  return <div className="algorithm-workspace">
    <form className="algorithm-workspace__input" onSubmit={event => { event.preventDefault(); execute(draft) }}>
      <label>{definition.inputLabel}<textarea aria-label={definition.inputLabel} value={draft} onChange={event => setDraft(event.target.value)} rows={2} /></label>
      <button type="submit">Run input</button>
      <div className="algorithm-workspace__examples">{definition.examples.map(example =>
        <button type="button" key={example.label} onClick={() => execute(example.input)}>{example.label}</button>)}</div>
      {error && <p role="alert">{error}</p>}
    </form>
    <div className="algorithm-workspace__dock">
      <LuminoDockPanel panels={PANELS} onPanelReady={setPanelDivs} />
      {Object.entries(views).map(([id, content]) => panelDivs?.[id]
        ? createPortal(<div className="algorithm-workspace__panel">{content}</div>, panelDivs[id], id) : null)}
    </div>
    <div className="algorithm-workspace__playback">
      {run && <PlaybackControls onReset={() => { playback.handleReset(); playback.setStepIndex(0) }} onPrev={playback.stepBack}
        onNext={() => playback.setStepIndex(Math.min(run.frames.length - 1, Math.max(0, playback.stepIndex) + 1))}
        onPlayToggle={run ? playback.togglePlay : undefined} isPlaying={playback.isPlaying} isDone={playback.isDone}
        prevDisabled={!run || !playback.canPrev} nextDisabled={!run || !playback.canNext} resetDisabled={!run}
        speed={playback.speed} onSpeedChange={event => playback.setSpeed(Number(event.target.value))}
        activeStep={Math.max(0, playback.stepIndex)} totalSteps={run.frames.length} />}
      <label>Timeline <input aria-label="Algorithm timeline" type="range" min={0} max={Math.max(0, (run?.frames.length || 1) - 1)}
        value={Math.max(0, playback.stepIndex)} disabled={!run} onChange={event => { playback.setIsPlaying(false); playback.setStepIndex(Number(event.target.value)) }} /></label>
      <span>{run ? `${Math.max(0, playback.stepIndex) + 1} / ${run.frames.length}` : 'No valid input'}</span>
    </div>
  </div>
}
