#!/usr/bin/env node
// Verifies the problem visualizers beyond what `vite build` checks.
//
// The build bundles without scope analysis, so a panel referencing an
// identifier that does not exist still builds green and then throws a
// ReferenceError the moment it renders. eslint's no-undef is what actually
// catches that, so it is the gate here.
//
// Baseline at 596cae2 (pre-transform): 0 parse errors, 1 no-undef
// (ResizableSplitPanels in Problem178, pre-existing). Anything above that is a
// regression.
//
// Usage: node scripts/verify-visualizers.mjs [--list]

import { execFileSync } from 'child_process'
import { readFileSync, unlinkSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'

const LIST = process.argv.includes('--list')
const out = join(tmpdir(), `visualizer-eslint-${process.pid}.json`)

try {
  execFileSync('npx', ['eslint', 'src/problems', '--format', 'json', '-o', out], { stdio: 'pipe' })
} catch {
  // eslint exits non-zero when it reports problems; the JSON is still written.
}

const results = JSON.parse(readFileSync(out, 'utf8'))
unlinkSync(out)

const parseErrors = []
const undef = []
for (const r of results) {
  const file = r.filePath.replace(/.*\/src\//, 'src/')
  const fatal = r.messages.filter((m) => m.fatal || /Parsing error/.test(m.message || ''))
  if (fatal.length) parseErrors.push({ file, line: fatal[0].line, msg: fatal[0].message })
  const ids = r.messages.filter((m) => m.ruleId === 'no-undef')
  if (ids.length) undef.push({ file, ids: [...new Set(ids.map((m) => /'([^']+)'/.exec(m.message)?.[1]).filter(Boolean))] })
}

console.log(`linted:       ${results.length} files`)
console.log(`parse errors: ${parseErrors.length} files`)
console.log(`no-undef:     ${undef.length} files (${undef.reduce((n, u) => n + u.ids.length, 0)} identifiers)`)

if (parseErrors.length) {
  console.log('\n--- parse errors ---')
  for (const p of parseErrors.slice(0, LIST ? Infinity : 20)) console.log(`  ${p.file}:${p.line}  ${p.msg}`)
}
if (undef.length) {
  console.log('\n--- no-undef ---')
  for (const u of undef.slice(0, LIST ? Infinity : 20)) console.log(`  ${u.file} => ${u.ids.join(', ')}`)
}

const BASELINE_UNDEF = 1
const regressed = parseErrors.length > 0 || undef.length > BASELINE_UNDEF
console.log(`\n${regressed ? 'REGRESSION vs baseline' : 'OK — at baseline'} (baseline: 0 parse errors, ${BASELINE_UNDEF} no-undef)`)
process.exit(regressed ? 1 : 0)
