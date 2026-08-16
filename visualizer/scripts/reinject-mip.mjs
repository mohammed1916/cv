import fs from 'fs'
import path from 'path'
import { cap } from './transform-lib.mjs'
import { injectManualInputPanel } from './inject-panel.mjs'

/**
 * Re-inject ManualInputPanel into files that already have the state transform
 * (input states + parsing + applyEx) but lost their MIP during repair.
 * Derives fields from existing `const [XInput, setXInput] = useState(...)`.
 */
const dir = 'src/problems'
const folders = fs.readdirSync(dir).filter(f => /^Problem\d+$/.test(f))
const targets = process.argv.slice(2)

let count = 0
for (const f of folders) {
  if (targets.length && !targets.includes(f)) continue
  const files = fs.readdirSync(path.join(dir, f))
  const jf = files.find(x => x.endsWith('.jsx') && !x.endsWith('.css') && x !== 'index.jsx')
  if (!jf) continue
  const file = path.join(dir, f, jf)
  let code = fs.readFileSync(file, 'utf8')
  if (code.includes('ManualInputPanel')) continue

  // Derive fields from input-state declarations: const [XInput, setXInput] = useState(...)
  const fieldRe = /const \[(\w+)Input,\s*set\w+\]\s*=\s*useState\(/g
  const names = [...new Set([...code.matchAll(fieldRe)].map(m => m[1]))]
  if (!names.length) continue

  // Infer type from parse useMemo: const parsedX = JSON.parse / Number / direct
  const fields = names.map(name => {
    let type = 'string'
    if (new RegExp(`JSON\\.parse\\(${name}Input\\)`).test(code)) type = 'array'
    else if (new RegExp(`Number\\(${name}Input\\)`).test(code)) type = 'number'
    return { name, type }
  })

  const newCode = injectManualInputPanel(code, fields, 'ex', 'applyEx')
  if (newCode === code) { console.log('no injection:', f); continue }
  fs.writeFileSync(file, newCode)
  count++
  console.log('reinjected:', f)
}
console.log('Reinjected', count, 'files')
