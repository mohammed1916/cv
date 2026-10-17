import { useEffect, useRef, useState } from 'react';
import scenes from './scenes.json';
import './TrailerStudio.css';

const visible = selector => [...document.querySelectorAll(selector)].find(el => el.getBoundingClientRect().width > 0 && getComputedStyle(el).visibility !== 'hidden' && !el.closest('[inert]'));
const click = selector => visible(selector)?.click();
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

export default function TrailerStudio({ onNavigate, canRecord }) {
  const [status, setStatus] = useState('Ready to prepare a real UI recording.');
  const [running, setRunning] = useState(false);
  const [preparing, setPreparing] = useState(false);
  const [scene, setScene] = useState(null);
  const [download, setDownload] = useState(null);
  const session = useRef(null);
  const url = useRef(null);
  const navigate = useRef(onNavigate);
  useEffect(() => { navigate.current = onNavigate; }, [onNavigate]);
  useEffect(() => () => {
    session.current?.stop();
    if (url.current) URL.revokeObjectURL(url.current);
  }, []);

  async function record() {
    if (session.current) return;
    setPreparing(true);
    let stream, context, recorder, source;
    let stopped = false;
    let failed = false;
    const chunks = [];
    const timers = new Set();
    const stop = () => {
      if (stopped) return;
      stopped = true;
      timers.forEach(clearTimeout);
      source?.stop(); source = null;
      if (recorder && recorder.state !== 'inactive') recorder.stop();
      stream?.getTracks().forEach(track => track.stop());
      context?.close();
      session.current = null;
      setRunning(false); setScene(null);
      setPreparing(false);
      delete document.body.dataset.trailerRecording;
    };
    session.current = { stop };
    try {
      if (!navigator.mediaDevices?.getDisplayMedia || !window.MediaRecorder) throw new Error('Use a desktop browser that supports tab recording, such as Chrome or Edge.');
      // The browser asks the user which tab to share. No upload or remote capture.
      stream = await navigator.mediaDevices.getDisplayMedia({ video: { displaySurface: 'browser', frameRate: 30 }, audio: false, preferCurrentTab: true });
      stream.getVideoTracks()[0].addEventListener('ended', stop, { once: true });
      context = new AudioContext();
      await context.resume();
      setStatus('Preparing narration…');
      const audio = await Promise.all(scenes.map(async (_, i) => {
        const response = await fetch(`${import.meta.env.BASE_URL}docs/promo/audio/scene-${i}.mp3`);
        if (!response.ok) throw new Error('Generate the narration first: see docs/promo/README.md.');
        return context.decodeAudioData(await response.arrayBuffer());
      }));
      if (stopped) return;
      const mix = context.createMediaStreamDestination();
      const output = new MediaStream([...stream.getVideoTracks(), ...mix.stream.getAudioTracks()]);
      const mimeType = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm'].find(type => MediaRecorder.isTypeSupported(type));
      if (!mimeType) throw new Error('This browser cannot export WebM. Try Chrome or Edge.');
      recorder = new MediaRecorder(output, { mimeType, videoBitsPerSecond: 8000000 });
      recorder.ondataavailable = event => { if (event.data.size) chunks.push(event.data); };
      recorder.onstop = () => {
        if (url.current) URL.revokeObjectURL(url.current);
        url.current = URL.createObjectURL(new Blob(chunks, { type: mimeType }));
        setDownload(url.current);
        if (!failed) setStatus('Recording saved locally. Preview it before publishing.');
      };
      recorder.onerror = () => { failed = true; setStatus('Recording failed. Check browser support and try again.'); stop(); };
      setRunning(true);
      setPreparing(false);
      document.body.dataset.trailerRecording = 'active';
      for (let i = 0; i < scenes.length && !stopped; i++) {
        const shot = scenes[i];
        setScene(shot);
        navigate.current(shot.page);
        await sleep(1400);
        const selector = shot.page === 'home' ? '.cards-grid' : shot.page === 'prerequisites' ? '.learning-page' : shot.page === 'playground' ? '.runtime-playground' : '.pc';
        const deadline = Date.now() + 20000;
        while (!visible(selector) && !stopped && Date.now() < deadline) await sleep(150);
        if (stopped) break;
        if (!visible(selector)) throw new Error(`Could not load ${shot.title}. Check sign-in, access, and playground readiness.`);
        if (recorder.state === 'inactive') recorder.start(1000);
        else if (recorder.state === 'paused') recorder.resume();
        const later = (ms, fn) => { const timer = setTimeout(() => { timers.delete(timer); if (!stopped) fn(); }, ms); timers.add(timer); };
        if (shot.action === 'catalog') visible('.cards-grid')?.scrollIntoView({ block: 'start', behavior: 'smooth' });
        if (shot.action === 'expand') later(1500, () => click('.learning-expand'));
        if (shot.action === 'guide') later(1000, () => click('.learning-node-guide'));
        if (shot.action === 'play') { click('.pc-buttons button:first-child'); later(700, () => click('.pc-btn-play')); }
        if (shot.action === 'workspace') {
          later(600, () => click('[aria-label="Zoom in"]'));
          later(1800, () => click('[aria-label="Zoom out"]'));
          later(2800, () => click('[aria-label="Collapse Code"]'));
          later(4500, () => click('.local-dock-restore [data-restore-panel="code"]'));
          later(5800, () => click('[title="Maximize panel"]'));
          later(7400, () => click('[title="Restore panel size (Esc)"]'));
        }
        if (shot.action === 'dock') {
          later(800, () => click('.floating-panel-pin'));
          later(4200, () => click('.floating-panel-pin'));
        }
        // These shots keep the real controls available for the presenter to use.
        // Never run or edit the user's saved playground source automatically.
        source = context.createBufferSource(); source.buffer = audio[i];
        source.connect(mix); source.connect(context.destination); source.start();
        await sleep(Math.max(audio[i].duration * 1000 + 1400, 9000));
        source = null;
        timers.forEach(clearTimeout); timers.clear();
        if (recorder.state === 'recording') recorder.pause();
      }
      stop();
    } catch (error) {
      failed = true; setStatus(error.message); stop();
    } finally { delete document.body.dataset.trailerRecording; }
  }
  return <>
    {scene && <div className="trailer-caption"><span>TEEM TREAT / VISUALIZER</span><strong>{scene.title}</strong></div>}
    <aside className={`trailer-studio ${running ? 'is-recording' : ''}`}>
      {!running && <><h2>Record the feature trailer</h2><p>Use a clean desktop tab at 1920 × 1080. Choose this tab when asked. The recording stays on your device.</p><p>Draft narration uses Microsoft Zira. Replace the scene audio with professional narration for release. During the playground and selection scenes, demonstrate the real controls yourself.</p><p role="status">{status}</p>{!canRecord && <p>Sign in with Pro to record the requested advanced visualizers and playground.</p>}</>}
      {running ? <button onClick={() => session.current?.stop()}>Stop recording</button> : <button disabled={!canRecord || preparing} onClick={record}>{preparing ? 'Preparing…' : 'Record real UI + narration'}</button>}
      {download && !running && <a href={download} download="teem-treat-feature-trailer.webm">Download recording</a>}
    </aside>
  </>;
}
