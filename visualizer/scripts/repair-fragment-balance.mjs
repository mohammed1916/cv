#!/usr/bin/env node
// Repairs JSX unbalanced by an earlier over-broad regex in
// repair-broken-fragments.mjs, which stripped `<>` fragment opens while
// leaving the matching `</>` closes.
//
// For each unmatched `</>`, inserts a `<>` immediately after the `(` that
// opens the enclosing JSX expression.
//
// Only rewrites files listed on stdin (the currently-unparseable set), so
// files that already parse are never touched.

import { readFileSync, writeFileSync } from 'fs'

// Walks source tracking paren depth and fragment nesting, skipping strings
// and comments. Returns the paren offsets that need a `<>` inserted after,
// plus any `<>` opens left without a close.
//
// Quotes and `//` are only honoured in expression position. In JSX text an
// apostrophe is prose ("that's") and `//` is part of a URL ("https://") —
// treating those as a string or comment would swallow the very `</>` markers
// this scan is looking for.
function scanFragments(src) {
  const parenStack = []
  const fragStack = []
  const inserts = []
  let orphanNoParen = 0
  let prev = ''
  let i = 0

  const isWord = (ch) => /[A-Za-z0-9_$]/.test(ch)

  while (i < src.length) {
    const c = src[i]

    if (c === '/' && src[i + 1] === '/' && !isWord(prev) && prev !== ':') {
      while (i < src.length && src[i] !== '\n') i++
      continue
    }
    if (c === '/' && src[i + 1] === '*') {
      i += 2
      while (i < src.length && !(src[i] === '*' && src[i + 1] === '/')) i++
      i += 2
      prev = '/'
      continue
    }
    if ((c === '"' || c === '`' || (c === "'" && !isWord(prev))) && true) {
      const quote = c
      i++
      while (i < src.length) {
        if (src[i] === '\\') { i += 2; continue }
        if (src[i] === quote) { i++; break }
        i++
      }
      prev = quote
      continue
    }

    if (c === '(') { parenStack.push(i); prev = c; i++; continue }
    if (c === ')') { parenStack.pop(); prev = c; i++; continue }

    if (c === '<' && src[i + 1] === '/' && src[i + 2] === '>') {
      if (fragStack.length) fragStack.pop()
      else if (parenStack.length) inserts.push(parenStack[parenStack.length - 1])
      else orphanNoParen++
      i += 3
      prev = '>'
      continue
    }
    if (c === '<' && src[i + 1] === '>') { fragStack.push(i); i += 2; prev = '>'; continue }

    if (!/\s/.test(c)) prev = c
    i++
  }

  return { inserts, unmatchedOpens: fragStack.slice(), orphanNoParen }
}

function indentOfLineAt(src, pos) {
  const lineStart = src.lastIndexOf('\n', pos) + 1
  return /^[ \t]*/.exec(src.slice(lineStart, pos))[0]
}

function repair(src) {
  const { inserts, unmatchedOpens, orphanNoParen } = scanFragments(src)
  if (!inserts.length) {
    return { src, inserted: 0, unmatchedOpens: unmatchedOpens.length, orphanNoParen }
  }

  // Dedupe, then apply back-to-front so earlier offsets stay valid.
  const targets = [...new Set(inserts)].sort((a, b) => b - a)
  let out = src
  for (const p of targets) {
    const indent = indentOfLineAt(out, p)
    out = out.slice(0, p + 1) + '\n' + indent + '  <>' + out.slice(p + 1)
  }
  return { src: out, inserted: targets.length, unmatchedOpens: unmatchedOpens.length, orphanNoParen }
}

const files = readFileSync(0, 'utf8').trim().split('\n').filter(Boolean)
const apply = !process.argv.includes('--dry-run')
let changed = 0
const skipped = []

for (const f of files) {
  const src = readFileSync(f, 'utf8')
  const r = repair(src)
  if (r.inserted === 0) {
    skipped.push({ f, reason: 'no unmatched </>', unmatchedOpens: r.unmatchedOpens, orphanNoParen: r.orphanNoParen })
    continue
  }
  if (apply) writeFileSync(f, r.src)
  changed++
  console.log(`${r.inserted}  ${f}`)
}

console.log(`\n${apply ? 'repaired' : 'would repair'}: ${changed}/${files.length}`)
if (skipped.length) {
  console.log(`no fragment fix applicable: ${skipped.length}`)
  for (const s of skipped) console.log(`   ${s.f}  (unmatchedOpens=${s.unmatchedOpens}, orphanNoParen=${s.orphanNoParen})`)
}
