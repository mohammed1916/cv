import fs from 'fs'
import path from 'path'

const dir = 'src/problems'
const folders = fs.readdirSync(dir).filter(f => /^Problem\d+$/.test(f))
const remaining = []
for (const f of folders) {
  const files = fs.readdirSync(path.join(dir, f))
  const jf = files.find(x => x.endsWith('.jsx') && !x.endsWith('.css') && x !== 'index.jsx')
  if (!jf) continue
  const code = fs.readFileSync(path.join(dir, f, jf), 'utf8')
  if (code.includes('ManualInputPanel') || /<input[\s\S]*?value=\{/.test(code)) continue
  remaining.push({ f, code })
}

const cats = {}
for (const { f, code } of remaining) {
  // Patterns of example selection
  let c = 'other'
  if (/const \[\w+,\s*set\w+\]\s*=\s*useState\(0\)\s*[\s\S]{0,200}EXAMPLES\[\w+\]/.test(code)) c = 'sel-index-var'
  else if (/EXAMPLES\[(sel|index|i|selected|current|idx|currentExample|exKey)\]/i.test(code)) c = 'index-into-EXAMPLES'
  else if (/const \[(\w+),\s*set\1\]\s*=\s*useState\((\d)\)/.test(code)) c = 'num-state'
  else if (/EXAMPLES\[0\]/.test(code)) c = 'uses-EXAMPLES-0'
  else if (/const EXAMPLES\s*=\s*getExamples/.test(code)) c = 'has-EXAMPLES'
  ;(cats[c] ||= []).push(f)
}

for (const [k, v] of Object.entries(cats)) {
  console.log(k.padEnd(22), v.length)
  console.log('   ', v.slice(0, 30).join(', '))
}
console.log('TOTAL:', remaining.length)
