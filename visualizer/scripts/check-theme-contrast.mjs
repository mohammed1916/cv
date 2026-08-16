#!/usr/bin/env node
// Checks the theme tokens in src/index.css for WCAG contrast.
//
// Worth automating because the accent tokens are used almost entirely as TEXT
// colours (--success appears as `color:` 112 times out of 114 uses), so a
// vivid-but-light accent that looks fine on its own would fail to be readable
// on the panel surfaces.
//
// Every foreground token is checked against every surface token it can land
// on. AA body text needs 4.5:1; AA large/bold text needs 3:1.
//
// Usage: node scripts/check-theme-contrast.mjs [--theme light|dark]

import { readFileSync } from 'fs'

const themeArg = process.argv.includes('--theme')
  ? process.argv[process.argv.indexOf('--theme') + 1]
  : 'light'

const css = readFileSync(new URL('../src/index.css', import.meta.url), 'utf8')

// Pull the token block for the requested theme.
const block = themeArg === 'dark'
  ? css.match(/:root\[data-theme="dark"\]\s*\{([\s\S]*?)\}/)
  : css.match(/^:root\s*\{([\s\S]*?)\}/m)

if (!block) {
  console.error(`could not find the ${themeArg} token block in src/index.css`)
  process.exit(1)
}

const tokens = {}
for (const m of block[1].matchAll(/--([a-z0-9-]+):\s*([^;]+);/g)) {
  tokens[m[1]] = m[2].trim()
}

const hex = (c) => {
  const m = /^#([0-9a-f]{6})$/i.exec(c.trim())
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

const SURFACES = ['surface', 'surface2', 'surface3', 'bg']
const FOREGROUNDS = ['text', 'text-muted', 'text-dim', 'primary', 'success', 'error', 'warning', 'info']

let failures = 0
console.log(`theme: ${themeArg}\n`)
console.log('fg \\ bg'.padEnd(14) + SURFACES.map((s) => s.padStart(10)).join(''))

for (const fg of FOREGROUNDS) {
  const fgc = hex(tokens[fg] || '')
  if (!fgc) { console.log(`${fg.padEnd(14)}(not a hex token)`); continue }
  let row = fg.padEnd(14)
  for (const bgName of SURFACES) {
    const bgc = hex(tokens[bgName] || '')
    if (!bgc) { row += '        n/a'; continue }
    const r = ratio(fgc, bgc)
    const ok = r >= 4.5
    if (!ok) failures++
    row += `${(r.toFixed(2) + (ok ? ' ' : '!')).padStart(10)}`
  }
  console.log(row)
}

console.log('\n! = below 4.5:1 (WCAG AA body text)')
console.log(failures === 0 ? 'PASS — every token pair meets AA' : `FAIL — ${failures} pair(s) below AA`)
process.exit(failures === 0 ? 0 : 1)
