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
  remaining.push({ f, jf, code })
}

// Categorize by how they'd need transformation
const cats = {}
for (const { f, code } of remaining) {
  const gen = code.match(/generateSteps\(([^)]*)\)/)
  let c
  if (!gen) c = 'no-generateSteps'
  else {
    const args = gen[1]
    if (/^\w+$/.test(args)) c = 'single-ident'
    else if (/^[\w.]+\s*,\s*[\w.]+$/.test(args)) c = 'two-ident'
    else if (/buildList|buildTree|buildGraph|parseInt|Number\(/.test(args)) c = 'with-helper-call'
    else if (/EXAMPLES/.test(args)) c = 'uses-EXAMPLES'
    else c = 'complex-args'
  }
  ;(cats[c] ||= []).push(f)
}

for (const [k, v] of Object.entries(cats)) {
  console.log(k.padEnd(20), v.length)
  console.log('   ', v.slice(0, 25).join(', '))
}
console.log('TOTAL remaining:', remaining.length)
