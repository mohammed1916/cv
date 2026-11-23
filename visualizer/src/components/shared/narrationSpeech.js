// Browser speech for a scene. The whole scene is one utterance, so the voice runs on without a gap between sentences.
// A single utterance has one pitch, so the sentence-level pitch shaping is gone.
export function speakScene(text, { onEnd, onError }) {
  const utterance = new SpeechSynthesisUtterance(text.trim())
  utterance.pitch = 1.0
  utterance.rate = 0.95
  let cancelled = false
  utterance.onend = () => { if (!cancelled) onEnd() }
  utterance.onerror = () => { if (!cancelled) onError() }
  window.speechSynthesis.speak(utterance)
  // Cancelling silences the scene and suppresses its callbacks.
  return () => {
    cancelled = true
    window.speechSynthesis.cancel()
  }
}
