import fs from 'fs'
import path from 'path'

const problemsDir = path.resolve('src/problems')
const folders = fs.readdirSync(problemsDir).filter(f => /^Problem\d+$/.test(f))

function readMeta(dir) {
  try {
    const meta = fs.readFileSync(path.join(dir, 'meta.js'), 'utf8')
    const numMatch = meta.match(/number:\s*["']([^"']+)["']/)
    const titleMatch = meta.match(/title:\s*["']([^"']+)["']/)
    const slugMatch = meta.match(/slug:\s*["']([^"']+)["']/)
    const diffMatch = meta.match(/difficulty:\s*["']([^"']+)["']/)
    return {
      number: numMatch ? numMatch[1] : path.basename(dir),
      title: titleMatch ? titleMatch[1] : path.basename(dir),
      slug: slugMatch ? slugMatch[1] : '',
      difficulty: diffMatch ? diffMatch[1] : '',
    }
  } catch {
    return { number: path.basename(dir), title: path.basename(dir), slug: '', difficulty: '' }
  }
}

const results = []
for (const folder of folders) {
  const dir = path.join(problemsDir, folder)
  const files = fs.readdirSync(dir)
  const jsxFile = files.find(f => f.endsWith('.jsx') && !f.endsWith('.css'))
  if (!jsxFile) continue
  const code = fs.readFileSync(path.join(dir, jsxFile), 'utf8')
  const meta = readMeta(dir)

  // Detect manual input: has an <input ... value= element (any state name) that lets the user type
  const hasInputElement = /<input[\s\S]*?value=\{/m.test(code)
  // Has some state variable bound to the input element that changes
  const hasInputState = /const \[(\w+),\s*set\w+\]\s*=\s*useState\(/.test(code)
  const hasManualInput = hasInputElement && hasInputState || code.includes('ManualInputPanel')

  // Detect the "ex-only" pattern (switches between examples only, no free input)
  const hasExState = /const \[\w*ex\w*,\s*set\w*ex\w*\]\s*=\s*useState\(/.test(code) || /setEx\s*\(/.test(code)

  results.push({
    folder,
    ...meta,
    hasInputElement,
    hasInputState,
    hasManualInput,
    hasExState,
    jsxFile,
  })
}

const withInput = results.filter(r => r.hasManualInput)
const without = results.filter(r => !r.hasManualInput)
console.log('Total problems:', results.length)
console.log('WITH manual input:', withInput.length)
console.log('WITHOUT manual input:', without.length)
console.log('WITHOUT but using ex-only pattern:', without.filter(r => r.hasExState).length)

fs.writeFileSync('scripts/manual-input-report.json', JSON.stringify({ withInput, without }, null, 2))
console.log('\nWrote scripts/manual-input-report.json')

// Also print the "without" list sorted by folder
console.log('\n=== WITHOUT (folder, #number, title, exOnly) ===')
without
  .slice()
  .sort((a, b) => parseInt(a.folder.replace('Problem', '')) - parseInt(b.folder.replace('Problem', '')))
  .forEach(r => console.log(`${r.folder}\t#${r.number}\t${r.title}\texOnly:${r.hasExState}`))
