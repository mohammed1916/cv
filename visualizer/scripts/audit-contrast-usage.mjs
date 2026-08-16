#!/usr/bin/env node
// Finds real contrast failures in the problem visualizers.
//
// The theme tokens are verified separately by check-theme-contrast.mjs. This
// looks at the ~21k hardcoded colours instead, pairing each foreground with
// the background actually set alongside it:
//   - inline JSX  : one style={{ ... }} object holding color + backgroundColor
//   - CSS         : one rule holding color + background/background-color
// A `color` with no paired background is measured against the light panel
// surface it now sits on, which is where the light theme exposed the problem.
//
// Usage: node scripts/audit-contrast-usage.mjs [--limit N] [--fix-list]

import { readFileSync, writeFileSync } from 'fs'
import { execSync } from 'child_process'
import { parseFile, walk } from './ast-scope-utils.mjs'

const argv = process.argv.slice(2)
const LIMIT = argv.includes('--limit') ? Number(argv[argv.indexOf('--limit') + 1]) : 25
const FIX_LIST = argv.includes('--fix-list')

// The surface a panel's text lands on when no background is set on the same
// element. Problem panels are predominantly white/near-white.
const ASSUMED_SURFACE = '#ffffff'

const hex = (c) => {
  if (typeof c !== 'string') return null
  let s = c.trim()
  const named = { white: '#ffffff', black: '#000000' }
  if (named[s.toLowerCase()]) s = named[s.toLowerCase()]
  let m = /^#([0-9a-f]{3})$/i.exec(s)
  if (m) s = '#' + [...m[1]].map((ch) => ch + ch).join('')
  m = /^#([0-9a-f]{6})$/i.exec(s)
  if (!m) return null
  const n = parseInt(m[1], 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

const luminance = ([r, g, b]) => {
  const f = (v) => {
    const s = v / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
}

const ratio = (a, b) => {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (l1 + 0.05) / (l2 + 0.05)
}

const findings = []

function record(file, line, fg, bg, assumed) {
  const f = hex(fg)
  const b = hex(bg)
  if (!f || !b) return
  const r = ratio(f, b)
  if (r >= 4.5) return
  findings.push({ file, line, fg: fg.toLowerCase(), bg: bg.toLowerCase(), ratio: r, assumed })
}

// ── inline JSX: style={{ color: '#x', backgroundColor: '#y' }} ──────────────
function auditJsx(file, src) {
  let ast
  try { ast = parseFile(src) } catch { return }

  walk(ast.program, (n) => {
    if (n.type !== 'ObjectExpression') return
    let color = null
    let background = null
    for (const p of n.properties) {
      if (p.type !== 'ObjectProperty' || p.computed) continue
      const key = p.key?.name ?? p.key?.value
      const val = p.value?.type === 'StringLiteral' ? p.value.value : null
      if (!val) continue
      if (key === 'color') color = val
      else if (key === 'background' || key === 'backgroundColor') background = val
    }
    if (!color) return
    record(file, n.loc.start.line, color, background ?? ASSUMED_SURFACE, !background)
  })
}

// ── CSS: one rule holding both declarations ────────────────────────────────
function auditCss(file, src) {
  // Strip comments, then walk `selector { decls }` blocks.
  const clean = src.replace(/\/\*[\s\S]*?\*\//g, '')
  const ruleRe = /([^{}]+)\{([^{}]*)\}/g
  let m
  while ((m = ruleRe.exec(clean))) {
    const body = m[2]
    const line = clean.slice(0, m.index).split('\n').length
    const colorM = /(?:^|;)\s*color\s*:\s*([^;]+)/i.exec(body)
    const bgM = /(?:^|;)\s*background(?:-color)?\s*:\s*([^;]+)/i.exec(body)
    if (!colorM) continue
    const fg = colorM[1].trim()
    const bg = bgM ? bgM[1].trim() : ASSUMED_SURFACE
    record(file, line, fg, bg, !bgM)
  }
}

const files = execSync(`git ls-files 'src/problems/*.jsx' 'src/problems/**/*.jsx' 'src/problems/**/*.css'`, { encoding: 'utf8' })
  .trim().split('\n').filter(Boolean)

for (const f of files) {
  let src
  try { src = readFileSync(f, 'utf8') } catch { continue }
  if (f.endsWith('.jsx')) auditJsx(f, src)
  else auditCss(f, src)
}

findings.sort((a, b) => a.ratio - b.ratio)

const paired = findings.filter((f) => !f.assumed)
const assumed = findings.filter((f) => f.assumed)

console.log(`contrast failures below 4.5:1 — ${findings.length}`)
console.log(`  explicit fg+bg on the same element: ${paired.length}`)
console.log(`  fg only, measured against ${ASSUMED_SURFACE}: ${assumed.length}`)

// Which foreground colours account for the most failures — the fix list.
const byFg = {}
for (const f of findings) byFg[f.fg] = (byFg[f.fg] || 0) + 1
console.log(`\ntop offending foreground colours:`)
for (const [c, n] of Object.entries(byFg).sort((a, b) => b[1] - a[1]).slice(0, LIMIT)) {
  console.log(`  ${String(n).padStart(5)}  ${c}`)
}

const byPair = {}
for (const f of paired) {
  const k = `${f.fg} on ${f.bg}`
  byPair[k] = (byPair[k] || 0) + 1
}
console.log(`\ntop offending explicit pairs:`)
for (const [k, n] of Object.entries(byPair).sort((a, b) => b[1] - a[1]).slice(0, LIMIT)) {
  console.log(`  ${String(n).padStart(5)}  ${k}`)
}

if (FIX_LIST) {
  writeFileSync('/tmp/contrast-findings.json', JSON.stringify(findings, null, 1))
  console.log('\nfull findings written to /tmp/contrast-findings.json')
}
