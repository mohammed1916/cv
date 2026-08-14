#!/usr/bin/env node
// Regenerates every <ManualInputPanel> from identifiers that actually resolve
// in its own file.
//
// The earlier regex injector emitted a fixed prop template referencing `ex`,
// `applyEx`, `handleReset` and `inputError`. Many visualizers never declare
// those — they use `applyExample(idx)`, a `selected` index, etc. — so the
// panel threw a ReferenceError on render. `vite build` does not catch this
// (no scope analysis), only `eslint no-undef` and the browser do.
//
// Strategy: resolve each prop against the file's real declarations and rebuild
// the element, dropping whatever cannot be resolved.
//
// Usage: node scripts/fix-mip-references.mjs [--dry-run] [--only <substr>]

import { readFileSync, writeFileSync } from 'fs'
import { execSync } from 'child_process'
import { parse } from '@babel/parser'

const argv = process.argv.slice(2)
const DRY = argv.includes('--dry-run')
const onlyIdx = argv.indexOf('--only')
const ONLY = onlyIdx >= 0 ? argv[onlyIdx + 1] : null

const APPLIER_NAMES = ['applyEx', 'applyExample', 'applyExampleAt', 'handleExample', 'selectExample', 'chooseExample']
const INDEX_STATE_NAMES = ['sel', 'selected', 'exIdx', 'exampleIdx', 'currentExample', 'selectedExample', 'exKey']

const parseFile = (src) => parse(src, { sourceType: 'module', plugins: ['jsx'], ranges: true })

function walk(node, fn, stack = []) {
  if (!node || typeof node.type !== 'string') return
  stack.push(node)
  fn(node, stack)
  for (const k of Object.keys(node)) {
    if (k === 'loc' || k === 'range' || k === 'leadingComments' || k === 'trailingComments') continue
    const v = node[k]
    if (Array.isArray(v)) { for (const c of v) walk(c, fn, stack) }
    else if (v && typeof v.type === 'string') walk(v, fn, stack)
  }
  stack.pop()
}

function patternNames(pat, out) {
  if (!pat) return
  if (pat.type === 'Identifier') out.add(pat.name)
  else if (pat.type === 'ObjectPattern') for (const p of pat.properties) patternNames(p.value || p.argument, out)
  else if (pat.type === 'ArrayPattern') for (const e of pat.elements) patternNames(e, out)
  else if (pat.type === 'AssignmentPattern') patternNames(pat.left, out)
  else if (pat.type === 'RestElement') patternNames(pat.argument, out)
}

const FUNCTION_TYPES = new Set(['FunctionDeclaration', 'FunctionExpression', 'ArrowFunctionExpression'])

// Names declared directly in a statement list — not inside nested functions.
function declarationsInBody(body, out) {
  for (const stmt of body || []) {
    if (!stmt) continue
    if (stmt.type === 'VariableDeclaration') for (const d of stmt.declarations) patternNames(d.id, out)
    else if (stmt.type === 'FunctionDeclaration' && stmt.id) out.add(stmt.id.name)
    else if (stmt.type === 'ClassDeclaration' && stmt.id) out.add(stmt.id.name)
    else if (stmt.type === 'ImportDeclaration') for (const s of stmt.specifiers) out.add(s.local.name)
    else if (stmt.type === 'ExportNamedDeclaration' && stmt.declaration) declarationsInBody([stmt.declaration], out)
    else if (stmt.type === 'ExportDefaultDeclaration' && stmt.declaration?.type === 'FunctionDeclaration' && stmt.declaration.id) out.add(stmt.declaration.id.name)
  }
}

// Names actually visible at `stack` (the ancestor chain of a node): only the
// enclosing scopes contribute. A flat file-wide set would wrongly accept `ex`
// from a sibling `EXAMPLES.map((ex) => ...)` callback, which is exactly the
// reference that crashes at render.
function visibleNames(stack) {
  const out = new Set()
  for (const node of stack) {
    if (node.type === 'Program') declarationsInBody(node.body, out)
    else if (node.type === 'BlockStatement') declarationsInBody(node.body, out)
    else if (FUNCTION_TYPES.has(node.type)) {
      if (node.type === 'FunctionDeclaration' && node.id) out.add(node.id.name)
      for (const p of node.params) patternNames(p, out)
    }
  }
  return out
}

// Every `const [value, setter] = useState(...)` pair in the file.
function collectStatePairs(ast) {
  const pairs = []
  walk(ast.program, (n) => {
    if (n.type !== 'VariableDeclarator') return
    if (n.init?.type !== 'CallExpression' || n.init.callee?.name !== 'useState') return
    if (n.id?.type !== 'ArrayPattern') return
    const value = n.id.elements[0]?.type === 'Identifier' ? n.id.elements[0].name : null
    const setter = n.id.elements[1]?.type === 'Identifier' ? n.id.elements[1].name : null
    if (value) pairs.push({ value, setter })
  })
  return pairs
}

function findMipElements(ast) {
  const found = []
  walk(ast.program, (n, stack) => {
    if (n.type === 'JSXElement' && n.openingElement?.name?.name === 'ManualInputPanel') {
      found.push({ node: n, scope: visibleNames(stack) })
    }
  })
  return found
}

function getFieldsFromElement(src, el) {
  const attr = el.openingElement.attributes.find((a) => a.name?.name === 'fields')
  if (!attr || attr.value?.type !== 'JSXExpressionContainer') return null
  const raw = src.slice(attr.value.expression.range[0], attr.value.expression.range[1])
  try {
    // The injected value is a JSON array literal, so JSON.parse after
    // normalising unquoted keys and single quotes.
    const normalised = raw.replace(/([{,]\s*)(\w+)\s*:/g, '$1"$2":').replace(/'/g, '"')
    return JSON.parse(normalised)
  } catch { return null }
}

// Does the applier take an index (used as EXAMPLES[p]) or the example object?
function applierStyle(src, ast, name) {
  let node = null
  walk(ast.program, (n) => {
    if (node) return
    if (n.type === 'VariableDeclarator' && n.id?.name === name) node = n.init
    else if (n.type === 'FunctionDeclaration' && n.id?.name === name) node = n
  })
  if (!node) return null
  // Unwrap useCallback(fn, deps) / useMemo
  if (node.type === 'CallExpression' && /^use[A-Z]/.test(node.callee?.name || '')) node = node.arguments[0]
  if (!node || (node.type !== 'ArrowFunctionExpression' && node.type !== 'FunctionExpression' && node.type !== 'FunctionDeclaration')) return null
  const p = node.params?.[0]
  const param = p?.type === 'Identifier' ? p.name : null
  if (!param) return { style: 'object', param: null }
  const body = src.slice(node.range[0], node.range[1])
  const asIndex = new RegExp(`\\[\\s*${param}\\s*\\]`).test(body)
  const asObject = new RegExp(`\\b${param}\\s*[.?]`).test(body)
  if (asIndex && !asObject) return { style: 'index', param }
  return { style: 'object', param }
}

function cap(s) { return s[0].toUpperCase() + s.slice(1) }

function buildPanel(indent, resolved) {
  const { fields, examples, applier, activeLabel, inputError, reset, showExamples } = resolved
  const i = indent
  const fieldsJson = JSON.stringify(fields.map((f) => ({ key: f.key, label: f.label, type: f.type })))
  const values = fields.map((f) => `${f.key}: ${f.state}`).join(', ')
  const setters = fields.filter((f) => f.setter).map((f) => `if (k === '${f.key}') ${f.setter}(v)`).join('; ')
  const lines = [
    `${i}<ManualInputPanel`,
    `${i}  fields={${fieldsJson}}`,
    `${i}  values={{ ${values} }}`,
    `${i}  onChange={(k, v) => { ${setters}${reset ? `; ${reset}()` : ''} }}`,
  ]
  if (examples) lines.push(`${i}  examples={${examples}}`)
  if (activeLabel) lines.push(`${i}  activeLabel={${activeLabel}}`)
  if (applier) lines.push(`${i}  applyExample={${applier}}`)
  if (!showExamples) lines.push(`${i}  showExamples={false}`)
  if (inputError) lines.push(`${i}  inputError={${inputError}}`)
  lines.push(`${i}/>`)
  return lines.join('\n')
}

function resolveFor(src, ast, declaredFields, scope) {
  const pairs = collectStatePairs(ast).filter((p) => scope.has(p.value))
  const has = (n) => Boolean(n) && scope.has(n)

  // Map each field to the state var that actually holds its text.
  const fields = []
  for (const f of declaredFields) {
    const k = f.key
    const cands = [`${k}Input`, k, `${k}Text`, `${k}Str`]
    let pair = pairs.find((p) => cands.includes(p.value))
    if (!pair) pair = pairs.find((p) => p.value.toLowerCase() === `${k}input`.toLowerCase())
    if (!pair && declaredFields.length === 1) pair = pairs.find((p) => /Input$/.test(p.value))
    if (!pair) continue
    let setter = pair.setter
    if (!has(setter)) setter = has(`set${cap(pair.value)}`) ? `set${cap(pair.value)}` : null
    fields.push({ key: k, label: f.label ?? k, type: f.type ?? 'string', state: pair.value, setter })
  }

  const examples = has('EXAMPLES') ? 'EXAMPLES' : has('examples') ? 'examples' : null

  let applier = null
  const applierName = APPLIER_NAMES.find((n) => has(n))
  if (applierName && examples) {
    const info = applierStyle(src, ast, applierName)
    if (info?.style === 'index') applier = `(e) => ${applierName}(${examples}.indexOf(e))`
    else applier = applierName
  } else if (applierName) {
    const info = applierStyle(src, ast, applierName)
    if (info?.style !== 'index') applier = applierName
  }

  let activeLabel = null
  if (has('ex')) activeLabel = 'ex?.label'
  else if (examples) {
    const idx = INDEX_STATE_NAMES.find((n) => has(n))
    if (idx) activeLabel = `${examples}[${idx}]?.label`
  }

  const inputError = has('inputError') ? 'inputError' : null
  const reset = has('handleReset') ? 'handleReset' : has('reset') ? 'reset' : null
  const showExamples = Boolean(examples && applier)

  return { fields, examples: showExamples ? examples : null, applier: showExamples ? applier : null, activeLabel: showExamples ? activeLabel : null, inputError, reset, showExamples }
}

function removeUnusedImport(src) {
  if (/<ManualInputPanel/.test(src)) return src
  return src.replace(/^import ManualInputPanel from '[^']*'\n/m, '')
}

function fixFile(file) {
  let src = readFileSync(file, 'utf8')
  if (!/<ManualInputPanel/.test(src)) return { file, skip: 'no panel' }

  let ast
  try { ast = parseFile(src) } catch (e) { return { file, skip: `parse error: ${e.message}` } }

  const els = findMipElements(ast)
  if (!els.length) return { file, skip: 'no panel element' }

  // Rewrite back-to-front so earlier ranges stay valid.
  els.sort((a, b) => b.node.range[0] - a.node.range[0])
  let out = src
  let removed = 0
  let rewritten = 0

  for (const { node: el, scope } of els) {
    const declaredFields = getFieldsFromElement(src, el)
    if (!declaredFields) return { file, skip: 'could not read fields prop' }

    const resolved = resolveFor(src, ast, declaredFields, scope)
    const lineStart = out.lastIndexOf('\n', el.range[0]) + 1
    const indent = /^[ \t]*/.exec(out.slice(lineStart))[0]

    if (!resolved.fields.length) {
      // Nothing resolvable to edit — drop the panel rather than crash.
      out = out.slice(0, lineStart) + out.slice(el.range[1] + (out[el.range[1]] === '\n' ? 1 : 0))
      removed++
      continue
    }
    const replacement = buildPanel(indent, resolved)
    out = out.slice(0, lineStart) + replacement + out.slice(el.range[1])
    rewritten++
  }

  out = removeUnusedImport(out)
  if (out === src) return { file, skip: 'unchanged' }

  try { parseFile(out) } catch (e) { return { file, skip: `would break: ${e.message}` } }
  if (!DRY) writeFileSync(file, out)
  return { file, ok: true, rewritten, removed }
}

let files = execSync('git ls-files "src/problems/**/*.jsx"', { encoding: 'utf8' }).trim().split('\n')
if (ONLY) files = files.filter((f) => f.includes(ONLY))

const done = []
const skipped = []
for (const f of files) {
  const r = fixFile(f)
  if (r.ok) done.push(r)
  else skipped.push(r)
}

for (const r of done) console.log(`~ ${r.file}  rewritten=${r.rewritten} removed=${r.removed}`)
console.log(`\n${DRY ? 'would fix' : 'fixed'}: ${done.length}`)
const reasons = {}
for (const s of skipped) (reasons[s.skip] ||= []).push(s.file)
for (const [why, list] of Object.entries(reasons).sort((a, b) => b[1].length - a[1].length)) {
  console.log(`  ${String(list.length).padStart(4)}  ${why}`)
  if (!/no panel|unchanged/.test(why)) for (const f of list.slice(0, 10)) console.log(`          ${f}`)
}
