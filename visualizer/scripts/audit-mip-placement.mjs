#!/usr/bin/env node
// Audits where <ManualInputPanel> actually landed.
//
// An earlier injector located the "root div" by regex and sometimes picked a
// div inside a .map() callback, so the panel rendered once per array element
// (or not at all). Parses each visualizer and classifies the placement.

import { readFileSync } from 'fs'
import { execSync } from 'child_process'
import { parse } from '@babel/parser'

const ITERATORS = new Set(['map', 'flatMap', 'forEach', 'filter', 'reduce'])

function classify(file) {
  const src = readFileSync(file, 'utf8')
  const hasImport = /import ManualInputPanel/.test(src)
  const hasUsage = /<ManualInputPanel/.test(src)
  const inputStates = [...src.matchAll(/const \[(\w+Input), set\w+\] = useState/g)].map((m) => m[1])

  if (!hasImport && !hasUsage) return { file, status: inputStates.length ? 'no-panel-has-inputs' : 'untouched', inputStates }
  if (hasImport && !hasUsage) return { file, status: 'import-only', inputStates }

  let ast
  try {
    ast = parse(src, { sourceType: 'module', plugins: ['jsx'], errorRecovery: false })
  } catch (e) {
    return { file, status: 'parse-error', msg: e.message }
  }

  const findings = []

  // Walk with an explicit ancestor stack so each hit knows its context.
  const stack = []
  const visit = (node) => {
    if (!node || typeof node.type !== 'string') return
    stack.push(node)

    if (
      node.type === 'JSXElement' &&
      node.openingElement?.name?.name === 'ManualInputPanel'
    ) {
      let insideIterator = null
      let insideNonDefaultFn = null
      for (let i = stack.length - 2; i >= 0; i--) {
        const a = stack[i]
        if (a.type === 'CallExpression' && a.callee?.type === 'MemberExpression' && ITERATORS.has(a.callee.property?.name)) {
          insideIterator = a.callee.property.name
          break
        }
        // A capitalised name is a component, a legitimate host for the panel —
        // plenty are named PerfectSquares rather than *Visualizer. Only a
        // lowercase-named helper is suspicious.
        if (a.type === 'FunctionDeclaration' && a.id?.name && !/^[A-Z]/.test(a.id.name)) {
          insideNonDefaultFn = a.id.name
        }
      }
      findings.push({
        line: node.loc.start.line,
        insideIterator,
        insideNonDefaultFn,
      })
    }

    for (const k of Object.keys(node)) {
      if (k === 'loc' || k === 'leadingComments' || k === 'trailingComments') continue
      const v = node[k]
      if (Array.isArray(v)) v.forEach(visit)
      else if (v && typeof v.type === 'string') visit(v)
    }
    stack.pop()
  }
  visit(ast.program)

  if (!findings.length) return { file, status: 'usage-regex-only', inputStates }

  const bad = findings.filter((f) => f.insideIterator || f.insideNonDefaultFn)
  return {
    file,
    status: bad.length ? 'MISPLACED' : findings.length > 1 ? 'duplicate' : 'ok',
    count: findings.length,
    findings,
    inputStates,
  }
}

const files = execSync('git ls-files "src/problems/**/*.jsx"', { encoding: 'utf8' }).trim().split('\n')
const results = files.map(classify)

const byStatus = {}
for (const r of results) (byStatus[r.status] ||= []).push(r)

console.log(`audited ${results.length} files\n`)
for (const [status, rows] of Object.entries(byStatus).sort((a, b) => b[1].length - a[1].length)) {
  console.log(`${String(rows.length).padStart(4)}  ${status}`)
}

const problems = ['MISPLACED', 'duplicate', 'parse-error']
for (const status of problems) {
  const rows = byStatus[status] || []
  if (!rows.length) continue
  console.log(`\n--- ${status} (${rows.length}) ---`)
  for (const r of rows) {
    const detail = (r.findings || []).map((f) => `L${f.line}${f.insideIterator ? ` in .${f.insideIterator}()` : ''}${f.insideNonDefaultFn ? ` in ${f.insideNonDefaultFn}()` : ''}`).join(', ')
    console.log(`  ${r.file}  ${detail || r.msg || ''}`)
  }
}

const needsPanel = [...(byStatus['import-only'] || []), ...(byStatus['no-panel-has-inputs'] || [])]
if (needsPanel.length) {
  console.log(`\n--- lost panel, inputs still wired (${needsPanel.length}) ---`)
  for (const r of needsPanel) console.log(`  ${r.file}  [${r.inputStates.join(', ')}]`)
}
