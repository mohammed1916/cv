import AdaptiveStage from './adaptive/AdaptiveStage';
import {buildAdaptiveSequence} from './adaptive/planner.js';
import TutorialScene from './TutorialScene';
import { buildTutorialSequence, tutorialPosition } from './tutorialSequence.js';
import { narrationLine, narrationUrl } from './tutorialNarration.js';
import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import LuminoDockPanel from '../LuminoDockPanel'
import PlaybackControls from '../PlaybackControls'
import AlgorithmCodePanel from './AlgorithmCodePanel'
import FloatingPanel from './FloatingPanel'
import CompactPlayback from './CompactPlayback'
import TabSwitch from './TabSwitch'
import './TabSwitch.css'
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
export default function AlgorithmWorkspace({ definition, renderVisual, renderReasoning, tutorial, visuals, narration }) {
  const [draft, setDraft] = useState(definition.examples[0].input)
  const [run, setRun] = useState(() => definition.build(definition.parse(definition.examples[0].input)))
  const [error, setError] = useState('')
  const [panelDivs, setPanelDivs] = useState(null)
  const [tutorialDivs, setTutorialDivs] = useState(null)
  const [tutorialMode, setTutorialMode] = useState('off')
  const [floating, setFloating] = useState(true)
  const [goalTab, setGoalTab] = useState('visual')
  // Narration: pre-recorded clips per fixed preset. Clips drive the advance; a missing clip uses the normal timing.
  const [presetIndex, setPresetIndex] = useState(() => definition.examples.findIndex(example => example.input === definition.examples[0].input))
  const [narrationOn, setNarrationOn] = useState(false)
  const [narrating, setNarrating] = useState(false)
  const audioRef = useRef(null)
  const adaptive = !!visuals
  const supportsTutorial = adaptive || !!tutorial
  const directed = supportsTutorial && tutorialMode !== 'off'
  const narrated = !!narration && narrationOn && directed && presetIndex >= 0
  const sequence = useMemo(() => adaptive ? buildAdaptiveSequence(run, tutorial, tutorialMode) : buildTutorialSequence(run, tutorial, tutorialMode), [run, tutorial, tutorialMode, adaptive])
  const total = directed ? sequence.length : run?.frames.length || 0
  const playback = usePlaybackState(total)
  const position = Math.min(Math.max(0, playback.stepIndex), Math.max(0, total - 1))
  const beat = directed ? sequence[position] : null
  const frameIndex = beat?.frameIndex ?? position
  const step = run?.frames[frameIndex]
  function changeMode(mode) {
    playback.setIsPlaying(false)
    const next = adaptive ? buildAdaptiveSequence(run, tutorial, mode) : buildTutorialSequence(run, tutorial, mode)
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
  const seek = index => { setNarrating(false); playback.setIsPlaying(false); playback.setStepIndex(index) }
  // Create/unlock the audio element inside a user gesture so later programmatic play() calls are allowed.
  function unlockAudio() {
    const audio = audioRef.current ??= new Audio()
    audio.play().catch(() => {})
    if ('speechSynthesis' in window) window.speechSynthesis.resume()
  }
  function togglePlay() {
    if (narrated) {
      unlockAudio()
      if (position >= total - 1) seek(0)
      setNarrating(value => !value)
      return
    }
    if (playback.isDone || playback.stepIndex < 0) playback.setStepIndex(0)
    playback.setIsPlaying(value => !value)
  }
  useEffect(() => {
    if (!narrated || !narrating || !beat) return
    if (position >= total - 1) { setNarrating(false); return }
    const audio = audioRef.current ??= new Audio()
    const canSpeak = 'speechSynthesis' in window
    let timer = null
    let handled = false
    const advance = () => { clearTimeout(timer); playback.setStepIndex(position + 1) }
    // Timed fallback keeps the tutorial moving when neither a recorded clip nor a browser voice is available.
    const timed = () => { clearTimeout(timer); timer = setTimeout(advance, playback.speed) }
    // A missing or blocked recorded clip is read aloud by the browser's built-in voice.
    const speak = () => {
      if (handled) return
      handled = true
      if (!canSpeak) return timed()
      const utterance = new SpeechSynthesisUtterance(narrationLine(beat))
      utterance.onend = advance
      utterance.onerror = timed
      window.speechSynthesis.speak(utterance)
    }
    audio.onended = advance
    audio.onerror = speak
    audio.src = narrationUrl(narration, presetIndex, beat)
    audio.play().catch(speak)
    return () => {
      clearTimeout(timer); audio.onended = null; audio.onerror = null; audio.pause()
      if (canSpeak) window.speechSynthesis.cancel()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [narrated, narrating, position])
  useEffect(() => { if (!narrated) setNarrating(false) }, [narrated])
  function execute(text) {
    setDraft(text)
    setPresetIndex(definition.examples.findIndex(example => example.input === text))
    setNarrating(false)
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
    visual: adaptive ? <AdaptiveStage visuals={visuals} definition={definition} run={run} step={step}
      previousStep={run.frames[frameIndex-1]} mode={tutorialMode} beat={beat} /> : renderVisual({ run, step }),
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
  const tutorialViews = adaptive ? {} : { input: inputPanel, story: run && beat
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
        onPlayToggle={togglePlay} isPlaying={narrated ? narrating : playback.isPlaying} isDone={narrated ? position >= total - 1 : playback.isDone}
        prevDisabled={!playback.canPrev} nextDisabled={!playback.canNext}
        speed={playback.speed} speedMin={directed ? 1000 : 80} speedMax={directed ? 5000 : 1400} speedStep={directed ? 100 : 60} onSpeedChange={event => playback.setSpeed(Number(event.target.value))}
        activeStep={position} totalSteps={total} />
    </>}
    <label>Timeline <input aria-label="Algorithm timeline" type="range" min={0} max={Math.max(0, total - 1)}
      value={position} disabled={!run} onChange={event => seek(Number(event.target.value))} /></label>
    {narration && directed && <label className="algorithm-workspace__narration" style={{marginInlineStart: 16, paddingInlineStart: 12, borderInlineStart: '1px solid var(--border)'}}>
      <input type="checkbox" checked={narrationOn} disabled={presetIndex < 0}
        onChange={event => { if (event.target.checked) unlockAudio(); setNarrationOn(event.target.checked); setNarrating(false); playback.setIsPlaying(false) }} />
      Narration{presetIndex < 0 ? ' (fixed examples only)' : ''}
    </label>}
    <span>{run ? `${position + 1} / ${total} ${directed ? 'scenes' : 'frames'}` : 'No valid input'}</span>
  </div>
  // The one-line goal always shows; the Goal tab expands the full requirement beside the mode switch.
  const goal = definition.goal && <section className="algorithm-workspace__goal" aria-label="Problem goal">
    <p><strong>Goal:</strong> {definition.goal.summary}</p>
    {goalTab === 'goal' && <>
      {definition.goalDiagram}
      <ul>{definition.goal.requirement.map(item => <li key={item}>{item}</li>)}</ul>
      <p><strong>Worked example:</strong> {definition.goal.example}</p>
    </>}
  </section>
  const hideWorkspace = goalTab === 'goal' && !directed
  return <div className={`algorithm-workspace ${directed ? 'algorithm-workspace--tutorial' : ''}`}>
    {goal}
    <div className="algorithm-workspace__tabs">
      {supportsTutorial && <TabSwitch label="Tutorial mode" className="tutorial-mode-switch" value={tutorialMode} onChange={changeMode}
        options={[{value:'off',label:'Full view'},{value:'steps',label:'Step-by-step'},{value:'why',label:'Reason-first'}]} />}
      {definition.goal && <TabSwitch label="Problem goal" className="goal-tab-switch" value={goalTab} onChange={setGoalTab}
        options={[{value:'visual',label:'Visualization'},{value:'goal',label:'Goal'}]} />}
    </div>
    {tutorial && !adaptive && <div className="algorithm-workspace__dock" style={!directed ? {display:'none'} : undefined}>
      <LuminoDockPanel panels={TUTORIAL_PANELS} initialCollapsed={['input']} onPanelReady={setTutorialDivs} />
      {Object.entries(tutorialViews).map(([id, content]) => tutorialDivs?.[id]
        ? createPortal(<div className="algorithm-workspace__panel">{content}</div>, tutorialDivs[id], id) : null)}
    </div>}
    <div className="algorithm-workspace__dock" style={directed && !adaptive || hideWorkspace ? {display:'none'} : undefined}>
      <LuminoDockPanel panels={PANELS} focusPanel={adaptive && directed ? "visual" : null} onPanelReady={setPanelDivs} />
      {Object.entries({...views, input: inputPanel}).map(([id, content]) => panelDivs?.[id]
        ? createPortal(<div className={`algorithm-workspace__panel${id === "visual" ? " is-visual" : ""}`}>{content}</div>, panelDivs[id], id) : null)}
    </div>
    {floating ? createPortal(<FloatingPanel title="Playback Controls" storageKey="algorithm-workspace-playback-size"
      defaultSize={{ width: Math.min(520, window.innerWidth - 16), height: Math.min(380, window.innerHeight - 32) }}
      collapsedBar={<CompactPlayback isPlaying={narrated ? narrating : playback.isPlaying} isDone={narrated ? position >= total - 1 : playback.isDone}
        onPlayToggle={togglePlay}
        onPrev={() => seek(Math.max(0, playback.stepIndex - 1))}
        onNext={() => seek(Math.min(total - 1, position + 1))}
        prevDisabled={!playback.canPrev} nextDisabled={!playback.canNext}
        stepIndex={position} total={total} onSeek={seek} />}>{controls}</FloatingPanel>, document.body) : controls}
  </div>
}
