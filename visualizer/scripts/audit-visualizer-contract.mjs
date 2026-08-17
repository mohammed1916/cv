import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'

const ROOT = new URL('../src/problems/', import.meta.url)

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = await Promise.all(entries.map(async entry => {
    const path = join(directory, entry.name)
    return entry.isDirectory() ? walk(path) : [path]
  }))
  return files.flat()
}

const files = (await walk(ROOT.pathname)).filter(path => /(?:^|\/)[^/]*Visualizer\.jsx$/.test(path) && !path.split('/').at(-1).startsWith('._'))
const missing = { input: [], examples: [], playback: [], floatingPlayback: [], lumino: [], canonicalLayout: [], unsafeStep: [], legacyConnectivity: [] }

for (const path of files) {
  const source = await readFile(path, 'utf8')
  const label = path.replace(ROOT.pathname, '')
  const hasInput = /<ManualInputPanel\b|<textarea\b|<input\b/.test(source)
  // Visualizers created before ManualInputPanel often keep their examples in a
  // local `examples` array and wire the click handler themselves. Count that
  // as coverage too; this audit should identify missing behavior, not enforce
  // a particular component spelling.
  const hasExamples = /examples=|applyExample|getExamples(?:Or)?|\bEXAMPLES\b|\b(?:const|let)\s+examples\s*=|INPUT_PRESETS|handleExample(?:Load|Click)?/.test(source)
  const hasPlayback = /<PlaybackControls\b|<VisualizerPlaybackSection\b/.test(source)
  const hasFloatingPlayback = /<FloatingPanel\s+title=["']Playback Controls["']|<VisualizerPlaybackSection\b[\s\S]{0,400}?\bfloatingPlayback\b/.test(source)
  const hasLumino = /<LuminoDockPanel\b/.test(source)
  const hasCanonicalLayout = /id:\s*["']input["']/.test(source) && /id:\s*["']code["']/.test(source)
  const canReadMissingStep = /const\s+step\s*=\s*steps\[currentStep\]\s*\|\|\s*steps\[0\]\s*;/.test(source)
  const hasLegacyConnectivityCall = /useCodeVisualConnectivity\(\s*[^\{\s][^,)]*,\s*[^)]*\)/.test(source)
  if (!hasInput) missing.input.push(label)
  if (!hasExamples) missing.examples.push(label)
  if (!hasPlayback) missing.playback.push(label)
  if (!hasFloatingPlayback) missing.floatingPlayback.push(label)
  if (!hasLumino) missing.lumino.push(label)
  if (!hasCanonicalLayout) missing.canonicalLayout.push(label)
  if (canReadMissingStep) missing.unsafeStep.push(label)
  if (hasLegacyConnectivityCall) missing.legacyConnectivity.push(label)
}

console.log(`Visualizers audited: ${files.length}`)
for (const [check, paths] of Object.entries(missing)) {
  console.log(`${check}: ${paths.length}`)
  for (const path of paths) console.log(`  ${path}`)
}

if (process.argv.includes('--strict') && Object.values(missing).some(paths => paths.length)) process.exitCode = 1
