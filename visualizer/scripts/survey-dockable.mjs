#!/usr/bin/env node
// Surveys how the remaining DockableWorkspace call sites are shaped, so the
// migration to LuminoDockPanel can be planned against real variants rather
// than an assumed one.

import { readFileSync } from 'fs'
import { execSync } from 'child_process'
import { parseFile, walk } from './ast-scope-utils.mjs'

function survey(file) {
  const src = readFileSync(file, 'utf8')
  if (!/import DockableWorkspace/.test(src)) return null

  let ast
  try { ast = parseFile(src) } catch (e) { return { file, shape: 'parse-error' } }

  let el = null
  let elParentType = null
  walk(ast.program, (n, stack) => {
    if (n.type === 'JSXElement' && n.openingElement?.name?.name === 'DockableWorkspace') {
      el = n
      const parent = stack[stack.length - 2]
      elParentType = parent?.type === 'JSXElement' ? parent.openingElement?.name?.name || 'element' : parent?.type
    }
  })
  if (!el) return { file, shape: 'import-only' }

  const attrs = {}
  for (const a of el.openingElement.attributes) {
    if (a.type !== 'JSXAttribute') { attrs['<spread>'] = true; continue }
    attrs[a.name.name] = a.value?.type === 'JSXExpressionContainer' ? a.value.expression : a.value
  }

  const panelsExpr = attrs.panels
  let panelsShape = 'none'
  let panelCount = null
  let declName = null

  if (panelsExpr?.type === 'Identifier') {
    declName = panelsExpr.name
    // Find its declaration and whether it is a useMemo over an array literal.
    walk(ast.program, (n) => {
      if (n.type !== 'VariableDeclarator' || n.id?.name !== declName) return
      let init = n.init
      if (init?.type === 'CallExpression' && init.callee?.name === 'useMemo') {
        const body = init.arguments[0]?.body
        if (body?.type === 'ArrayExpression') { panelsShape = 'useMemo-array'; panelCount = body.elements.length }
        else panelsShape = 'useMemo-other'
      } else if (init?.type === 'ArrayExpression') {
        panelsShape = 'const-array'; panelCount = init.elements.length
      } else {
        panelsShape = `ident-${init?.type ?? 'unknown'}`
      }
    })
  } else if (panelsExpr?.type === 'ArrayExpression') {
    panelsShape = 'inline-array'; panelCount = panelsExpr.elements.length
  } else if (panelsExpr) {
    panelsShape = `expr-${panelsExpr.type}`
  }

  // How is initialLayout specified?
  let layout = 'none'
  const li = attrs.initialLayout
  if (li?.type === 'ObjectExpression') {
    const rows = li.properties.find((p) => p.key?.name === 'rows')
    if (rows?.value?.type === 'ArrayExpression') {
      layout = rows.value.elements
        .map((r) => (r.type === 'ArrayExpression' ? r.elements.length : 1))
        .join('x')
    } else layout = 'rows-dynamic'
  } else if (li) layout = `expr-${li.type}`

  return { file, shape: panelsShape, panelCount, layout, parent: elParentType, attrs: Object.keys(attrs) }
}

const files = execSync(`git ls-files 'src/problems/*.jsx' 'src/problems/**/*.jsx'`, { encoding: 'utf8' }).trim().split('\n')
const rows = files.map(survey).filter(Boolean)

const tally = (key) => {
  const t = {}
  for (const r of rows) t[r[key]] = (t[r[key]] || 0) + 1
  return Object.entries(t).sort((a, b) => b[1] - a[1])
}

console.log(`DockableWorkspace files: ${rows.length}\n`)
for (const k of ['shape', 'layout', 'parent']) {
  console.log(`--- ${k} ---`)
  for (const [v, n] of tally(k)) console.log(`  ${String(n).padStart(4)}  ${v}`)
  console.log()
}
console.log('--- extra props beyond panels/initialLayout ---')
const extra = {}
for (const r of rows) for (const a of r.attrs || []) if (!['panels', 'initialLayout'].includes(a)) extra[a] = (extra[a] || 0) + 1
for (const [a, n] of Object.entries(extra).sort((a, b) => b[1] - a[1])) console.log(`  ${String(n).padStart(4)}  ${a}`)

console.log('\n--- panel counts ---')
const counts = {}
for (const r of rows) counts[r.panelCount] = (counts[r.panelCount] || 0) + 1
for (const [c, n] of Object.entries(counts).sort((a, b) => b[1] - a[1])) console.log(`  ${String(n).padStart(4)}  ${c} panels`)
