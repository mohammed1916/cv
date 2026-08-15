#!/usr/bin/env node
// Answers two questions per problem directory, over the whole set:
//   1. Does it use LuminoDockPanel (and is any DockableWorkspace left)?
//   2. Can its input actually be edited by hand — via ManualInputPanel, or via
//      a native <input>/<textarea> bound to state?
//
// The unit is the problem directory, since one problem may span several files.

import { readFileSync } from 'fs'
import { execSync } from 'child_process'

const files = execSync(`git ls-files 'src/problems/*.jsx' 'src/problems/**/*.jsx'`, { encoding: 'utf8' })
  .trim().split('\n')

// Group by problem directory: src/problems/<Name>/... ; a bare
// src/problems/<File>.jsx is its own unit.
const byProblem = new Map()
for (const f of files) {
  const m = f.match(/^src\/problems\/([^/]+)/)
  if (!m) continue
  const key = m[1].endsWith('.jsx') ? m[1] : m[1]
  if (!byProblem.has(key)) byProblem.set(key, [])
  byProblem.get(key).push(f)
}

// A controlled field: value={...} plus onChange on an input/textarea/select.
const NATIVE_INPUT = /<(input|textarea|select)\b[^>]*\bvalue=\{/s
const NATIVE_INPUT_ALT = /<(input|textarea|select)\b[\s\S]{0,400}?\bonChange=\{/

const rows = []
for (const [problem, list] of byProblem) {
  let lumino = false, dockable = false, mip = false, native = false, anyJsx = false
  for (const f of list) {
    let src
    try { src = readFileSync(f, 'utf8') } catch { continue }
    anyJsx = true
    if (/import LuminoDockPanel/.test(src)) lumino = true
    if (/<DockableWorkspace/.test(src)) dockable = true
    if (/<ManualInputPanel/.test(src)) mip = true
    if (NATIVE_INPUT.test(src) || NATIVE_INPUT_ALT.test(src)) native = true
  }
  if (anyJsx) rows.push({ problem, lumino, dockable, mip, native })
}

const n = rows.length
const count = (fn) => rows.filter(fn).length

console.log(`problem units: ${n}\n`)
console.log('--- dock ---')
console.log(`  uses LuminoDockPanel:      ${count((r) => r.lumino)}`)
console.log(`  still uses DockableWorkspace: ${count((r) => r.dockable)}`)
console.log(`  uses neither:              ${count((r) => !r.lumino && !r.dockable)}`)
console.log('\n--- editable input ---')
console.log(`  ManualInputPanel:          ${count((r) => r.mip)}`)
console.log(`  native field only:         ${count((r) => !r.mip && r.native)}`)
console.log(`  editable by some means:    ${count((r) => r.mip || r.native)}`)
console.log(`  NO editable input:         ${count((r) => !r.mip && !r.native)}`)

const noDock = rows.filter((r) => !r.lumino && !r.dockable).map((r) => r.problem)
const noInput = rows.filter((r) => !r.mip && !r.native).map((r) => r.problem)

if (process.argv.includes('--list')) {
  console.log(`\n--- no dock component (${noDock.length}) ---`)
  for (const p of noDock) console.log(`  ${p}`)
  console.log(`\n--- no editable input (${noInput.length}) ---`)
  for (const p of noInput) console.log(`  ${p}`)
} else {
  console.log(`\nsample without a dock component: ${noDock.slice(0, 10).join(', ')}`)
  console.log(`sample without editable input:   ${noInput.slice(0, 10).join(', ')}`)
}
