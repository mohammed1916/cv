import TutorialScene from './TutorialScene';
import { buildTutorialSequence, tutorialPosition } from './tutorialSequence.js';
import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import LuminoDockPanel from '../LuminoDockPanel'
import PlaybackControls from '../PlaybackControls'
import AlgorithmCodePanel from './AlgorithmCodePanel'
import FloatingPanel from './FloatingPanel'
import CompactPlayback from './CompactPlayback'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import './AlgorithmWorkspace.css'

const PANELS = [
  { id: 'visual', title: 'Algorithm state' },
  { id: 'story', title: 'Story · Why this works', dockMode: 'split-right' },
  { id: 'code', title: 'Solution code', dockMode: 'split-bottom' },
  { id: 'input', title: 'Input & examples', dockMode: 'split-bottom', ref: 'visual', ratio: .24 },
]

const TUTORIAL_PANELS = [{ id: 'story', title: 'Tutorial story' }, { id: 'input', title: 'Input & examples', dockMode: 'split-right', ratio: .3 }];

// Problems own validation, execution states, and views. This owns only the shell.
export default function AlgorithmWorkspace({ definition, renderVisual, renderReasoning, tutorial }) {
  const [draft, setDraft] = useState(definition.examples[0].input)
  const [run, setRun] = useState(() => definition.build(definition.parse(definition.examples[0].input)))
  const [error, setError] = useState('')
  const [panelDivs, setPanelDivs] = useState(null)
  const [tutorialDivs, setTutorialDivs] = useState(null)
  const [tutorialMode, setTutorialMode] = useState('off')
  const [floating, setFloating] = useState(true)
  const sequence = useMemo(() => buildTutorialSequence(run, tutorial, tutorialMode), [run, tutorial, tutorialMode])
  const directed = !!tutorial && tutorialMode !== 'off'
  const total = directed ? sequence.length : run?.frames.length || 0
  const playback = usePlaybackState(total)
  const position = Math.min(Math.max(0, playback.stepIndex), Math.max(0, total - 1))
  const beat = directed ? sequence[position] : null
  const frameIndex = beat?.frameIndex ?? position
  const step = run?.frames[frameIndex]
  function changeMode(mode) {
    playback.setIsPlaying(false)
    const next = buildTutorialSequence(run, tutorial, mode)
    playback.setStepIndex(mode === 'off' ? frameIndex : tutorialPosition(next, frameIndex))
    if (mode !== 'off' && !directed) { playback.setSpeed(2400); setFloating(false) }
    if (mode === 'off') playback.setSpeed(500)
    setTutorialMode(mode)
  }
  useEffect(() => { window.dispatchEvent(new Event('resize')) }, [directed])
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
    story: <>
      <p className="algorithm-workspace__event" role="status">{step.message}</p>
      {renderReasoning({ run, step })}
      <p>{definition.complexity}</p>
      {definition.url && <a href={definition.url} target="_blank" rel="noreferrer">Official problem statement</a>}
    </>,
    code: <AlgorithmCodePanel key={definition.number} definition={definition} step={step} input={draft} />,
  } : {}
  const inputPanel = <form className="algorithm-workspace__input" onSubmit={event => { event.preventDefault(); execute(draft) }}>
    <label>{definition.inputLabel}<textarea aria-label={definition.inputLabel} value={draft} onChange={event => setDraft(event.target.value)} rows={4} /></label>
    <button type="submit">Run input</button>
    <div className="algorithm-workspace__examples">{definition.examples.map(example =>
      <button type="button" key={example.label} onClick={() => execute(example.input)}>{example.label}</button>)}</div>
    {error && <p role="alert">{error}</p>}
  </form>
  const tutorialViews = { input: inputPanel, story: run && beat
    ? <TutorialScene beat={beat} definition={definition} step={step}>{renderVisual({run,step})}</TutorialScene>
    : <p role="status">Open Input & examples below to enter valid input.</p> }
  const controls = <div className="algorithm-workspace__playback">
    <button type="button" onClick={() => setFloating(value => !value)}>{floating ? 'Dock controls' : 'Float controls'}</button>
    {run && <>
      {!directed && <nav className="algorithm-workspace__phases" aria-label="Algorithm states">
        {definition.phases.map(phase => <button type="button" key={phase.id}
          data-phase={phase.id} aria-current={step.phase === phase.id ? 'step' : undefined}
          disabled={!phaseStarts.has(phase.id)} title={phase.description}
          onClick={() => seek(phaseStarts.get(phase.id))}>{phase.label}</button>)}
      </nav>}
      <p role="status" className="algorithm-workspace__current-state">
        {definition.phases.find(phase => phase.id === step.phase)?.label} · Pseudocode line {step.activeLine}: {directed ? `${beat.kind === 'reason' ? 'Why' : beat.kind === 'code' ? 'Code' : 'Effect'} scene` : step.message}
      </p>
      <PlaybackControls onReset={() => seek(0)} onPrev={() => seek(Math.max(0, playback.stepIndex - 1))}
        onNext={() => seek(Math.min(total - 1, position + 1))}
        onPlayToggle={() => {
          if (playback.isDone || playback.stepIndex < 0) playback.setStepIndex(0)
          playback.setIsPlaying(value => !value)
        }} isPlaying={playback.isPlaying} isDone={playback.isDone}
        prevDisabled={!playback.canPrev} nextDisabled={!playback.canNext}
        speed={playback.speed} speedMin={directed ? 1000 : 80} speedMax={directed ? 5000 : 1400} speedStep={directed ? 100 : 60} onSpeedChange={event => playback.setSpeed(Number(event.target.value))}
        activeStep={position} totalSteps={total} />
    </>}
    <label>Timeline <input aria-label="Algorithm timeline" type="range" min={0} max={Math.max(0, total - 1)}
      value={position} disabled={!run} onChange={event => seek(Number(event.target.value))} /></label>
    <span>{run ? `${position + 1} / ${total} ${directed ? 'scenes' : 'frames'}` : 'No valid input'}</span>
  </div>
  return <div className={`algorithm-workspace ${directed ? 'algorithm-workspace--tutorial' : ''}`}>
    {tutorial && <div className="tutorial-mode-switch" role="group" aria-label="Tutorial mode">
      <span>Tutorial</span>{[['off','Off · Full view'],['steps','Step-by-step'],['why','Reason-first']].map(([value,label]) =>
        <button key={value} type="button" aria-pressed={tutorialMode===value} onClick={()=>changeMode(value)}>{label}</button>)}
    </div>}
    {tutorial && <div className="algorithm-workspace__dock" style={!directed ? {display:'none'} : undefined}>
      <LuminoDockPanel panels={TUTORIAL_PANELS} initialCollapsed={['input']} onPanelReady={setTutorialDivs} />
      {Object.entries(tutorialViews).map(([id, content]) => tutorialDivs?.[id]
        ? createPortal(<div className="algorithm-workspace__panel">{content}</div>, tutorialDivs[id], id) : null)}
    </div>}
    <div className="algorithm-workspace__dock" style={directed ? {display:'none'} : undefined}>
      <LuminoDockPanel panels={PANELS} onPanelReady={setPanelDivs} />
      {Object.entries({...views, input: inputPanel}).map(([id, content]) => panelDivs?.[id]
        ? createPortal(<div className="algorithm-workspace__panel">{content}</div>, panelDivs[id], id) : null)}
    </div>
    {floating ? createPortal(<FloatingPanel title="Playback Controls" storageKey="algorithm-workspace-playback-size"
      defaultSize={{ width: Math.min(520, window.innerWidth - 16), height: Math.min(380, window.innerHeight - 32) }}
      collapsedBar={<CompactPlayback isPlaying={playback.isPlaying} isDone={playback.isDone}
        onPlayToggle={() => {
          if (playback.isDone || playback.stepIndex < 0) playback.setStepIndex(0)
          playback.setIsPlaying(value => !value)
        }}
        onPrev={() => seek(Math.max(0, playback.stepIndex - 1))}
        onNext={() => seek(Math.min(total - 1, position + 1))}
        prevDisabled={!playback.canPrev} nextDisabled={!playback.canNext}
        stepIndex={position} total={total} onSeek={seek} />}>{controls}</FloatingPanel>, document.body) : controls}
  </div>
}
