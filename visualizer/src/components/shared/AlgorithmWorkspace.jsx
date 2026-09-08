import { useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import LuminoDockPanel from '../LuminoDockPanel'
import PlaybackControls from '../PlaybackControls'
import CodeTracePanel from '../CodeTracePanel'
import FloatingPanel from './FloatingPanel'
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
  const [floating, setFloating] = useState(true)
  const playback = usePlaybackState(run?.frames.length || 0)
  const step = run?.frames[Math.max(0, playback.stepIndex)]
  const phaseStarts = useMemo(() => {
    const starts = new Map()
    run?.frames.forEach((frame, index) => { if (!starts.has(frame.phase)) starts.set(frame.phase, index) })
    return starts
  }, [run])
  const seek = index => { playback.setIsPlaying(false); playback.setStepIndex(index) }
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
  const controls = <div className="algorithm-workspace__playback">
    <button type="button" onClick={() => setFloating(value => !value)}>{floating ? 'Dock controls' : 'Float controls'}</button>
    {run && <>
      <nav className="algorithm-workspace__phases" aria-label="Algorithm states">
        {definition.phases.map(phase => <button type="button" key={phase.id}
          data-phase={phase.id} aria-current={step.phase === phase.id ? 'step' : undefined}
          disabled={!phaseStarts.has(phase.id)} title={phase.description}
          onClick={() => seek(phaseStarts.get(phase.id))}>{phase.label}</button>)}
      </nav>
      <p role="status" className="algorithm-workspace__current-state">
        {definition.phases.find(phase => phase.id === step.phase)?.label} · Code line {step.activeLine}: {step.message}
      </p>
      <PlaybackControls onReset={() => seek(0)} onPrev={() => seek(Math.max(0, playback.stepIndex - 1))}
        onNext={() => seek(Math.min(run.frames.length - 1, Math.max(0, playback.stepIndex) + 1))}
        onPlayToggle={() => {
          if (playback.isDone || playback.stepIndex < 0) playback.setStepIndex(0)
          playback.setIsPlaying(value => !value)
        }} isPlaying={playback.isPlaying} isDone={playback.isDone}
        prevDisabled={!playback.canPrev} nextDisabled={!playback.canNext}
        speed={playback.speed} onSpeedChange={event => playback.setSpeed(Number(event.target.value))}
        activeStep={Math.max(0, playback.stepIndex)} totalSteps={run.frames.length} />
    </>}
    <label>Timeline <input aria-label="Algorithm timeline" type="range" min={0} max={Math.max(0, (run?.frames.length || 1) - 1)}
      value={Math.max(0, playback.stepIndex)} disabled={!run} onChange={event => seek(Number(event.target.value))} /></label>
    <span>{run ? `${Math.max(0, playback.stepIndex) + 1} / ${run.frames.length}` : 'No valid input'}</span>
  </div>
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
    {floating ? createPortal(<FloatingPanel title="Playback Controls" storageKey="algorithm-workspace-playback-size"
      defaultSize={{ width: Math.min(520, window.innerWidth - 16), height: Math.min(380, window.innerHeight - 32) }}>{controls}</FloatingPanel>, document.body) : controls}
  </div>
}
