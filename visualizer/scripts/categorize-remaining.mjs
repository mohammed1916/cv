import fs from 'fs'
import path from 'path'

const dir = 'src/problems'
const folders = fs.readdirSync(dir).filter(f => /^Problem\d+$/.test(f))
const without = []
for (const f of folders) {
  const files = fs.readdirSync(path.join(dir, f))
  const jf = files.find(x => x.endsWith('.jsx') && !x.endsWith('.css') && x !== 'index.jsx')
  if (!jf) continue
  const code = fs.readFileSync(path.join(dir, f, jf), 'utf8')
  if (code.includes('ManualInputPanel') || /<input[\s\S]*?value=\{/.test(code)) continue
  without.push(f)
}

const cats = {}
const samples = {}
for (const f of without) {
  const files = fs.readdirSync(path.join(dir, f))
  const jf = files.find(x => x.endsWith('.jsx') && !x.endsWith('.css') && x !== 'index.jsx')
  if (!jf) { (cats['no-jsx'] ||= []).push(f); continue }
  const code = fs.readFileSync(path.join(dir, f, jf), 'utf8')

  let c
  if (/const \[(\w+)\]\s*=\s*useState\(/.test(code)) c = 'A: hardcoded-no-setter'
  else if (/const \[(\w+),\s*set\1\]\s*=\s*useState\(/.test(code)) c = 'B: has-setter'
  else if (/const \[\w+,\s*set\w+\]\s*=\s*useState\(/.test(code)) c = 'C: mixed-setter'
  else c = 'D: other'
  ;(cats[c] ||= []).push(f)
  ;(samples[c] ||= []).push(f)
}

for (const [k, v] of Object.entries(cats)) {
  console.log(k, v.length)
  console.log('   ', v.slice(0, 30).join(', '))
}
console.log('TOTAL without:', without.length)
