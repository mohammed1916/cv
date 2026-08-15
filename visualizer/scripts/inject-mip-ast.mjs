#!/usr/bin/env node
// Re-injects <ManualInputPanel> into visualizers whose input state is wired
// but whose panel was stripped by the over-broad fragment repair.
//
// Unlike the earlier regex injector, this parses the file and inserts the
// panel as the FIRST CHILD of an existing JSX element. That needs no
// enclosing fragment, so it cannot produce adjacent-siblings errors, and the
// ancestor chain is checked so the panel never lands in a .map() callback.
//
// Usage: node scripts/inject-mip-ast.mjs [--dry-run] [--only <substr>]

import { readFileSync, writeFileSync } from 'fs'
import { execSync } from 'child_process'
import { parse } from '@babel/parser'

const ITERATORS = new Set(['map', 'flatMap', 'forEach', 'filter', 'reduce'])
const FIELD_TYPES = JSON.parse(readFileSync(new URL('./field-types.json', import.meta.url), 'utf8'))

const argv = process.argv.slice(2)
const DRY = argv.includes('--dry-run')
const onlyIdx = argv.indexOf('--only')
const ONLY = onlyIdx >= 0 ? argv[onlyIdx + 1] : null

function parseFile(src) {
  return parse(src, { sourceType: 'module', plugins: ['jsx'], ranges: true })
}

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

function insideIterator(stack) {
  for (let i = stack.length - 2; i >= 0; i--) {
    const a = stack[i]
    if (a.type === 'CallExpression' && a.callee?.type === 'MemberExpression' && ITERATORS.has(a.callee.property?.name)) return true
  }
  return false
}

// Locates the component: the function that owns the input-state hooks.
function findComponent(ast) {
  let best = null
  walk(ast.program, (n, stack) => {
    if (n.type !== 'CallExpression') return
    if (n.callee?.name !== 'useState') return
    for (let i = stack.length - 1; i >= 0; i--) {
      const a = stack[i]
      if (a.type === 'FunctionDeclaration' || a.type === 'ArrowFunctionExpression' || a.type === 'FunctionExpression') {
        if (!best) best = a
        return
      }
    }
  })
  return best
}

// Picks where the panel goes, preferring the primary/visualization panel.
function findTarget(ast, component) {
  const candidates = []

  walk(component, (n, stack) => {
    if (n.type !== 'VariableDeclarator' || !n.id?.name) return
    const name = n.id.name
    if (!/Panel$/.test(name)) return
    let jsx = n.init
    while (jsx && jsx.type === 'TSAsExpression') jsx = jsx.expression
    if (!jsx || (jsx.type !== 'JSXElement' && jsx.type !== 'JSXFragment')) return
    if (insideIterator(stack)) return
    let rank = 5
    if (/^(primary|viz|main|visual)/i.test(name)) rank = 0
    else if (/^(code|status|playback|controls|examples|legend)/i.test(name)) rank = 9
    candidates.push({ rank, name, jsx })
  })

  candidates.sort((a, b) => a.rank - b.rank)
  if (candidates.length && candidates[0].rank < 9) return candidates[0]

  // Fall back to the component's returned root element.
  let ret = null
  walk(component, (n, stack) => {
    if (ret || n.type !== 'ReturnStatement' || !n.argument) return
    for (let i = stack.length - 2; i >= 0; i--) {
      const a = stack[i]
      if (a.type === 'FunctionDeclaration' || a.type === 'ArrowFunctionExpression' || a.type === 'FunctionExpression') {
        if (a !== component) return
        break
      }
    }
    const arg = n.argument
    if (arg.type === 'JSXElement' || arg.type === 'JSXFragment') ret = { rank: 8, name: '<return>', jsx: arg }
  })
  if (ret) return ret
  return candidates[0] || null
}

// Offset just past the target's opening tag, i.e. before its first child.
function firstChildOffset(jsx) {
  if (jsx.type === 'JSXFragment') return jsx.openingFragment.range[1]
  if (jsx.openingElement.selfClosing) return null
  return jsx.openingElement.range[1]
}

function fieldsFor(folder, inputStates) {
  const entry = FIELD_TYPES[folder] || {}
  const types = entry.types || {}
  const example = entry.example || {}
  return inputStates.map((state) => {
    const key = state.replace(/Input$/, '')
    // Fall back to the shape of the recorded example when the registry has no
    // type for this field, so 2-D inputs don't silently become 'string'.
    let type = types[key]
    if (!type) {
      const v = example[key]
      type = Array.isArray(v) ? 'array' : typeof v === 'number' ? 'number' : 'string'
    }
    return { key, label: key, type, state }
  })
}

function detectHelpers(src, component, srcAll) {
  const has = (re) => re.test(srcAll)
  return {
    examples: has(/\bconst EXAMPLES\b/) ? 'EXAMPLES' : has(/\bconst examples\b/) ? 'examples' : null,
    applyEx: has(/\bconst applyEx\b/) ? 'applyEx' : has(/\bconst applyExample\b/) ? 'applyExample' : null,
    activeLabel: has(/\bconst \[ex, setEx\]/) ? 'ex?.label' : null,
    inputError: has(/\binputError\b/) ? 'inputError' : null,
    handleReset: has(/\bhandleReset\b/) ? 'handleReset' : null,
  }
}

function buildPanel(indent, fields, helpers) {
  const i = indent
  const fieldsJson = JSON.stringify(fields.map((f) => ({ key: f.key, label: f.label, type: f.type })))
  const values = fields.map((f) => `${f.key}: ${f.state}`).join(', ')
  const setters = fields
    .map((f) => `if (k === '${f.key}') set${f.state[0].toUpperCase()}${f.state.slice(1)}(v)`)
    .join('; ')
  const reset = helpers.handleReset ? '; handleReset()' : ''

  const lines = [
    `${i}<ManualInputPanel`,
    `${i}  fields={${fieldsJson}}`,
    `${i}  values={{ ${values} }}`,
    `${i}  onChange={(k, v) => { ${setters}${reset} }}`,
  ]
  if (helpers.examples) lines.push(`${i}  examples={${helpers.examples}}`)
  if (helpers.activeLabel) lines.push(`${i}  activeLabel={${helpers.activeLabel}}`)
  if (helpers.applyEx) lines.push(`${i}  applyExample={${helpers.applyEx}}`)
  if (helpers.inputError) lines.push(`${i}  inputError={${helpers.inputError}}`)
  if (!helpers.examples || !helpers.applyEx) lines.push(`${i}  showExamples={false}`)
  lines.push(`${i}/>`)
  return lines.join('\n')
}

function ensureImport(src) {
  if (/import ManualInputPanel/.test(src)) return src
  const lines = src.split('\n')
  let last = 0
  for (let i = 0; i < lines.length; i++) if (/^import /.test(lines[i])) last = i
  lines.splice(last + 1, 0, "import ManualInputPanel from '../../components/shared/ManualInputPanel'")
  return lines.join('\n')
}

function injectInto(file) {
  let src = readFileSync(file, 'utf8')
  if (/<ManualInputPanel/.test(src)) return { file, skip: 'already has panel' }

  const inputStates = [...src.matchAll(/const \[(\w+Input), set\w+\] = useState/g)].map((m) => m[1])
  if (!inputStates.length) return { file, skip: 'no input state' }

  const folder = (file.match(/src\/problems\/(Problem\d+)\//) || [])[1]
  const fields = fieldsFor(folder, inputStates)

  let ast
  try { ast = parseFile(src) } catch (e) { return { file, skip: `parse error: ${e.message}` } }

  const component = findComponent(ast)
  if (!component) return { file, skip: 'component not found' }

  const target = findTarget(ast, component)
  if (!target) return { file, skip: 'no JSX target' }

  const off = firstChildOffset(target.jsx)
  const anchor = off ?? target.jsx.range[0]
  const lineStart = src.lastIndexOf('\n', anchor) + 1
  const baseIndent = /^[ \t]*/.exec(src.slice(lineStart))[0] + '  '

  const helpers = detectHelpers(src, component, src)
  const panel = buildPanel(baseIndent, fields, helpers)

  let out
  if (off != null) {
    out = src.slice(0, off) + '\n' + panel + src.slice(off)
  } else {
    // A self-closing target takes no children, so wrap it and the panel in a
    // fragment. Safe here because the element's exact range is known.
    const [start, end] = target.jsx.range
    const indent = /^[ \t]*/.exec(src.slice(lineStart))[0]
    const original = src.slice(start, end)
    out = src.slice(0, start) + `<>\n${panel}\n${indent}  ${original}\n${indent}</>` + src.slice(end)
  }
  out = ensureImport(out)

  // Reject anything that no longer parses rather than writing it out.
  try { parseFile(out) } catch (e) { return { file, skip: `would break: ${e.message}` } }

  if (!DRY) writeFileSync(file, out)
  return { file, ok: true, target: target.name, fields: fields.map((f) => `${f.key}:${f.type}`) }
}

let files = execSync('git ls-files "src/problems/**/*.jsx"', { encoding: 'utf8' }).trim().split('\n')
if (ONLY) files = files.filter((f) => f.includes(ONLY))

const done = []
const skipped = []
for (const f of files) {
  const r = injectInto(f)
  if (r.ok) done.push(r)
  else skipped.push(r)
}

for (const r of done) console.log(`+ ${r.file}  → ${r.target}  [${r.fields.join(', ')}]`)
console.log(`\n${DRY ? 'would inject' : 'injected'}: ${done.length}`)

const reasons = {}
for (const s of skipped) (reasons[s.skip] ||= []).push(s.file)
console.log('skipped:')
for (const [why, list] of Object.entries(reasons).sort((a, b) => b[1].length - a[1].length)) {
  console.log(`  ${String(list.length).padStart(4)}  ${why}`)
  if (!/already has panel|no input state/.test(why)) for (const f of list.slice(0, 10)) console.log(`          ${f}`)
}
