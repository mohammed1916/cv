#!/usr/bin/env node
// Removes `const applyX = useCallback(...)` declarations that an earlier
// transformer injected into module-level helpers such as generateSteps()
// instead of into the component.
//
// They are dead code (nothing calls them there) AND a live hazard: a
// useCallback outside a component throws "Invalid hook call" if the helper
// ever runs, and their bodies reference setters that do not exist in that
// scope. eslint no-undef flags them; vite build does not.
//
// Usage: node scripts/remove-misplaced-appliers.mjs [--dry-run] [--only <substr>]

import { readFileSync, writeFileSync } from 'fs'
import { execSync } from 'child_process'
import { parse } from '@babel/parser'

const argv = process.argv.slice(2)
const DRY = argv.includes('--dry-run')
const onlyIdx = argv.indexOf('--only')
const ONLY = onlyIdx >= 0 ? argv[onlyIdx + 1] : null

const HOOKS = new Set(['useCallback', 'useMemo', 'useEffect', 'useState', 'useRef'])
const FUNCTION_TYPES = new Set(['FunctionDeclaration', 'FunctionExpression', 'ArrowFunctionExpression'])

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

// A component here means a function whose name is capitalised — the only place
// a hook call is legal.
function isComponentName(name) {
  return Boolean(name) && /^[A-Z]/.test(name)
}

function enclosingFunctionName(stack, upto) {
  for (let i = upto; i >= 0; i--) {
    const n = stack[i]
    if (!FUNCTION_TYPES.has(n.type)) continue
    if (n.type === 'FunctionDeclaration') return n.id?.name ?? '<anonymous>'
    // const Foo = () => ... : look one level up for the declarator name.
    for (let j = i - 1; j >= 0 && j >= i - 2; j--) {
      if (stack[j].type === 'VariableDeclarator') return stack[j].id?.name ?? '<anonymous>'
    }
    return '<anonymous>'
  }
  return null
}

function findMisplaced(ast) {
  const hits = []
  walk(ast.program, (n, stack) => {
    if (n.type !== 'VariableDeclaration') return
    const d = n.declarations?.[0]
    if (!d || d.init?.type !== 'CallExpression') return
    if (!HOOKS.has(d.init.callee?.name)) return

    const owner = enclosingFunctionName(stack, stack.length - 2)
    if (owner === null) return          // module top level: not our injection
    if (isComponentName(owner)) return  // legal hook call inside a component

    hits.push({ node: n, name: d.id?.name, owner })
  })
  return hits
}

function processFile(file) {
  const src = readFileSync(file, 'utf8')
  if (!/useCallback|useMemo/.test(src)) return { file, skip: 'no hooks' }

  let ast
  try { ast = parseFile(src) } catch (e) { return { file, skip: `parse error: ${e.message}` } }

  const hits = findMisplaced(ast)
  if (!hits.length) return { file, skip: 'nothing misplaced' }

  // Remove whole lines, back to front.
  hits.sort((a, b) => b.node.range[0] - a.node.range[0])
  let out = src
  for (const h of hits) {
    const lineStart = out.lastIndexOf('\n', h.node.range[0]) + 1
    let end = h.node.range[1]
    if (out[end] === ';') end++
    if (out[end] === '\n') end++
    out = out.slice(0, lineStart) + out.slice(end)
  }

  try { parseFile(out) } catch (e) { return { file, skip: `would break: ${e.message}` } }
  if (!DRY) writeFileSync(file, out)
  return { file, ok: true, removed: hits.map((h) => `${h.name} in ${h.owner}()`) }
}

let files = execSync(`git ls-files 'src/problems/*.jsx' 'src/problems/**/*.jsx'`, { encoding: 'utf8' }).trim().split('\n')
if (ONLY) files = files.filter((f) => f.includes(ONLY))

const done = []
for (const f of files) {
  const r = processFile(f)
  if (r.ok) { done.push(r); console.log(`- ${r.file}  ${r.removed.join('; ')}`) }
}
console.log(`\n${DRY ? 'would clean' : 'cleaned'}: ${done.length} files`)
