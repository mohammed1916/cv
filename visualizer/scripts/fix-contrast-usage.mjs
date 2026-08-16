#!/usr/bin/env node
// Fixes the contrast failures that audit-contrast-usage.mjs reports.
//
// Only `color` values are rewritten — never a background — so layout, fills
// and the intended visual weight of every panel are preserved. The direction
// is decided by the background actually paired with the text: on a light
// ground the text darkens, on a dark ground it lightens.
//
// Hue and saturation are held constant and only lightness moves, by binary
// search, until the pair clears AA. That keeps the palette recognisable and
// colourful instead of flattening everything to near-black.
//
// White text on a saturated mid-tone fill (a button label) cannot be fixed by
// changing the text, so those are left alone and reported.
//
// Usage: node scripts/fix-contrast-usage.mjs [--dry-run]

import { readFileSync, writeFileSync } from 'fs'
import { execSync } from 'child_process'
import { parseFile, walk } from './ast-scope-utils.mjs'

const DRY = process.argv.includes('--dry-run')
const TARGET = 4.6 // small margin over the 4.5 AA threshold
const ASSUMED_SURFACE = '#ffffff'

const NAMED = { white: '#ffffff', black: '#000000' }

function hex(c) {
  if (typeof c !== 'string') return null
  let s = c.trim().toLowerCase()
  if (NAMED[s]) s = NAMED[s]
  let m = /^#([0-9a-f]{3})$/.exec(s)
  if (m) s = '#' + [...m[1]].map((ch) => ch + ch).join('')
  m = /^#([0-9a-f]{6})$/.exec(s)
  if (!m) return null
  const n = parseInt(m[1], 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

const toHex = ([r, g, b]) =>
  '#' + [r, g, b].map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('')

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

function rgbToHsl([r, g, b]) {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  const l = (max + min) / 2
  let h = 0, s = 0
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6
    else if (max === g) h = ((b - r) / d + 2) / 6
    else h = ((r - g) / d + 4) / 6
  }
  return [h, s, l]
}

function hslToRgb([h, s, l]) {
  if (s === 0) { const v = l * 255; return [v, v, v] }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s
  const p = 2 * l - q
  const f = (t) => {
    if (t < 0) t += 1
    if (t > 1) t -= 1
    if (t < 1 / 6) return p + (q - p) * 6 * t
    if (t < 1 / 2) return q
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
    return p
  }
  return [f(h + 1 / 3) * 255, f(h) * 255, f(h - 1 / 3) * 255]
}

// Move lightness toward `darker` until the pair clears TARGET, keeping hue.
function adjust(fg, bg, darker) {
  const [h, s] = rgbToHsl(fg)
  let lo = darker ? 0 : rgbToHsl(fg)[2]
  let hi = darker ? rgbToHsl(fg)[2] : 1
  let best = null
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2
    const cand = hslToRgb([h, s, mid])
    if (ratio(cand, bg) >= TARGET) {
      best = cand
      if (darker) lo = mid; else hi = mid
    } else {
      if (darker) hi = mid; else lo = mid
    }
  }
  // Prefer the least-changed passing candidate; fall back to the extreme.
  if (!best) {
    const ext = hslToRgb([h, s, darker ? 0.08 : 0.96])
    if (ratio(ext, bg) >= TARGET) best = ext
  }
  return best
}

const stats = { files: 0, fixed: 0, skippedWhite: 0, unfixable: 0 }
const skipped = []

// Returns the replacement hex for a failing pair, or null to leave it.
function replacementFor(fgRaw, bgRaw) {
  const fg = hex(fgRaw)
  const bg = hex(bgRaw)
  if (!fg || !bg) return null
  if (ratio(fg, bg) >= 4.5) return null

  const bgLight = luminance(bg) > 0.4
  // Near-white text on a saturated fill is a button label; the fix belongs on
  // the fill, which this tool deliberately does not touch.
  if (!bgLight && luminance(fg) > 0.7) { stats.skippedWhite++; skipped.push(`${fgRaw} on ${bgRaw}`); return null }

  const out = adjust(fg, bg, bgLight)
  if (!out) { stats.unfixable++; return null }
  return toHex(out)
}

// ── JSX: rewrite `color:` inside style objects ─────────────────────────────
function fixJsx(file, src) {
  let ast
  try { ast = parseFile(src) } catch { return src }

  const edits = []
  walk(ast.program, (n) => {
    if (n.type !== 'ObjectExpression') return
    let colorProp = null
    let background = null
    for (const p of n.properties) {
      if (p.type !== 'ObjectProperty' || p.computed) continue
      const key = p.key?.name ?? p.key?.value
      if (p.value?.type !== 'StringLiteral') continue
      if (key === 'color') colorProp = p
      else if (key === 'background' || key === 'backgroundColor') background = p.value.value
    }
    if (!colorProp) return
    const rep = replacementFor(colorProp.value.value, background ?? ASSUMED_SURFACE)
    if (rep) edits.push({ range: colorProp.value.range, value: rep })
  })

  if (!edits.length) return src
  edits.sort((a, b) => b.range[0] - a.range[0])
  let out = src
  for (const e of edits) {
    const quote = out[e.range[0]]
    out = out.slice(0, e.range[0]) + quote + e.value + quote + out.slice(e.range[1])
    stats.fixed++
  }
  return out
}

// ── CSS: rewrite `color:` within a rule ────────────────────────────────────
function fixCss(file, src) {
  const ruleRe = /([^{}]+)\{([^{}]*)\}/g
  let out = ''
  let last = 0
  let m
  while ((m = ruleRe.exec(src))) {
    const body = m[2]
    const bodyStart = m.index + m[0].indexOf('{') + 1
    const bgM = /(?:^|;)\s*background(?:-color)?\s*:\s*([^;]+)/i.exec(body)
    const bg = bgM ? bgM[1].trim() : ASSUMED_SURFACE

    let newBody = body
    const colorRe = /((?:^|;)\s*color\s*:\s*)([^;]+)/gi
    newBody = body.replace(colorRe, (full, head, val) => {
      const rep = replacementFor(val.trim(), bg)
      if (!rep) return full
      stats.fixed++
      return head + rep
    })
    if (newBody !== body) {
      out += src.slice(last, bodyStart) + newBody
      last = bodyStart + body.length
    }
  }
  out += src.slice(last)
  return out || src
}

const files = execSync(`git ls-files 'src/problems/*.jsx' 'src/problems/**/*.jsx' 'src/problems/**/*.css'`, { encoding: 'utf8' })
  .trim().split('\n').filter(Boolean)

for (const f of files) {
  let src
  try { src = readFileSync(f, 'utf8') } catch { continue }
  const before = src
  const out = f.endsWith('.jsx') ? fixJsx(f, src) : fixCss(f, src)
  if (out === before) continue
  if (f.endsWith('.jsx')) {
    // Never write a file the parser can no longer read.
    try { parseFile(out) } catch { console.log(`skip (would break): ${f}`); continue }
  }
  if (!DRY) writeFileSync(f, out)
  stats.files++
}

console.log(`${DRY ? 'would fix' : 'fixed'} ${stats.fixed} colour(s) across ${stats.files} file(s)`)
console.log(`left alone — white text on a saturated fill: ${stats.skippedWhite}`)
console.log(`left alone — no passing colour at this hue:  ${stats.unfixable}`)
const uniq = [...new Set(skipped)]
if (uniq.length) {
  console.log('\nmost common untouched pairs (fix belongs on the fill, not the text):')
  for (const p of uniq.slice(0, 10)) console.log(`  ${p}`)
}
