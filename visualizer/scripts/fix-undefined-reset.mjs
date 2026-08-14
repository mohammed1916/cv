#!/usr/bin/env node
// Repairs `handleReset` references that the transforms injected into files
// which never declare it.
//
// Two playback conventions exist in these visualizers:
//   usePlaybackState(steps.length)                       -> returns handleReset
//   usePlaybackState(steps, currentStep, setCurrentStep) -> no handleReset;
//                                                           reset is setCurrentStep(0)
// The injected applyEx assumed the first, so it throws a ReferenceError in
// every file using the second.
//
// Rewrites `handleReset()` to the file's real reset, and `handleReset` inside
// dependency arrays to the matching setter. Drops the call when there is none.
//
// Usage: node scripts/fix-undefined-reset.mjs [--dry-run] [--only <substr>]

import { readFileSync, writeFileSync } from 'fs'
import { execSync } from 'child_process'
import { parseFile, walk, visibleNames, isValueReference } from './ast-scope-utils.mjs'

const argv = process.argv.slice(2)
const DRY = argv.includes('--dry-run')
const onlyIdx = argv.indexOf('--only')
const ONLY = onlyIdx >= 0 ? argv[onlyIdx + 1] : null

const TARGET = 'handleReset'
// Reset setters in preference order, with the argument that rewinds playback.
const RESET_CANDIDATES = [
  ['setCurrentStep', '0'],
  ['setStepIndex', '0'],
  ['setStep', '0'],
  ['setIdx', '0'],
]

function findUndefinedRefs(ast) {
  const hits = []
  walk(ast.program, (n, stack) => {
    if (n.type !== 'Identifier' || n.name !== TARGET) return
    if (!isValueReference(stack)) return
    const scope = visibleNames(stack)
    if (scope.has(TARGET)) return
    const parent = stack[stack.length - 2]
    const isCall = parent?.type === 'CallExpression' && parent.callee === n
    hits.push({ node: n, scope, isCall, callNode: isCall ? parent : null })
  })
  return hits
}

function processFile(file) {
  const src = readFileSync(file, 'utf8')
  if (!src.includes(TARGET)) return { file, skip: 'no reference' }

  let ast
  try { ast = parseFile(src) } catch (e) { return { file, skip: `parse error: ${e.message}` } }

  const hits = findUndefinedRefs(ast)
  if (!hits.length) return { file, skip: 'all references resolve' }

  let out = src
  const notes = []
  // Back to front so earlier ranges stay valid.
  hits.sort((a, b) => b.node.range[0] - a.node.range[0])

  for (const h of hits) {
    const pick = RESET_CANDIDATES.find(([name]) => h.scope.has(name))

    if (h.isCall) {
      const [start, end] = h.callNode.range
      if (pick) {
        out = out.slice(0, start) + `${pick[0]}(${pick[1]})` + out.slice(end)
        notes.push(`call->${pick[0]}(${pick[1]})`)
      } else {
        // Drop the statement, including a leading separator if present.
        let s = start
        const before = out.slice(0, s).match(/;\s*$/)
        if (before) s -= before[0].length
        let e = end
        if (out[e] === ';') e++
        out = out.slice(0, s) + out.slice(e)
        notes.push('call->dropped')
      }
      continue
    }

    // Bare reference, e.g. inside a useCallback dependency array.
    const [start, end] = h.node.range
    if (pick) {
      out = out.slice(0, start) + pick[0] + out.slice(end)
      notes.push(`dep->${pick[0]}`)
    } else {
      let s = start
      let e = end
      const before = out.slice(0, s).match(/,\s*$/)
      if (out[e] === ',') e++
      else if (before) s -= before[0].length
      out = out.slice(0, s) + out.slice(e)
      notes.push('dep->dropped')
    }
  }

  try { parseFile(out) } catch (e) { return { file, skip: `would break: ${e.message}` } }
  if (out === src) return { file, skip: 'unchanged' }
  if (!DRY) writeFileSync(file, out)
  return { file, ok: true, notes }
}

let files = execSync('git ls-files "src/problems/**/*.jsx"', { encoding: 'utf8' }).trim().split('\n')
if (ONLY) files = files.filter((f) => f.includes(ONLY))

const done = []
const skipped = []
for (const f of files) {
  const r = processFile(f)
  if (r.ok) { done.push(r); console.log(`~ ${r.file}  ${r.notes.join(', ')}`) }
  else skipped.push(r)
}
console.log(`\n${DRY ? 'would fix' : 'fixed'}: ${done.length}`)
const reasons = {}
for (const s of skipped) (reasons[s.skip] ||= []).push(s.file)
for (const [why, list] of Object.entries(reasons).sort((a, b) => b[1].length - a[1].length)) {
  console.log(`  ${String(list.length).padStart(4)}  ${why}`)
  if (/would break/.test(why)) for (const f of list.slice(0, 10)) console.log(`          ${f}`)
}
