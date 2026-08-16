// Shared AST helpers for the visualizer maintenance scripts.
//
// These scripts repair code that regex transforms damaged, so they need to
// answer one question accurately: is this identifier actually in scope where
// it is referenced? A flat file-wide name set is not good enough — it accepts
// `ex` from a sibling `EXAMPLES.map((ex) => ...)` callback and hides the very
// ReferenceError being hunted.

import { parse } from '@babel/parser'

export const FUNCTION_TYPES = new Set(['FunctionDeclaration', 'FunctionExpression', 'ArrowFunctionExpression'])

export const parseFile = (src) => parse(src, { sourceType: 'module', plugins: ['jsx'], ranges: true })

export function walk(node, fn, stack = []) {
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

export function patternNames(pat, out) {
  if (!pat) return
  if (pat.type === 'Identifier') out.add(pat.name)
  else if (pat.type === 'ObjectPattern') for (const p of pat.properties) patternNames(p.value || p.argument, out)
  else if (pat.type === 'ArrayPattern') for (const e of pat.elements) patternNames(e, out)
  else if (pat.type === 'AssignmentPattern') patternNames(pat.left, out)
  else if (pat.type === 'RestElement') patternNames(pat.argument, out)
}

// Names declared directly in a statement list, ignoring nested functions.
export function declarationsInBody(body, out) {
  for (const stmt of body || []) {
    if (!stmt) continue
    if (stmt.type === 'VariableDeclaration') for (const d of stmt.declarations) patternNames(d.id, out)
    else if (stmt.type === 'FunctionDeclaration' && stmt.id) out.add(stmt.id.name)
    else if (stmt.type === 'ClassDeclaration' && stmt.id) out.add(stmt.id.name)
    else if (stmt.type === 'ImportDeclaration') for (const s of stmt.specifiers) out.add(s.local.name)
    else if (stmt.type === 'ExportNamedDeclaration' && stmt.declaration) declarationsInBody([stmt.declaration], out)
    else if (stmt.type === 'ExportDefaultDeclaration' && stmt.declaration) declarationsInBody([stmt.declaration], out)
  }
}

// Names visible at a node, given its ancestor chain.
export function visibleNames(stack) {
  const out = new Set()
  for (const node of stack) {
    if (node.type === 'Program' || node.type === 'BlockStatement') declarationsInBody(node.body, out)
    else if (FUNCTION_TYPES.has(node.type)) {
      if (node.type === 'FunctionDeclaration' && node.id) out.add(node.id.name)
      for (const p of node.params) patternNames(p, out)
    }
  }
  return out
}

// True when this Identifier node is a real value reference, rather than a
// property key, member property, or part of a declaration pattern.
export function isValueReference(stack) {
  const node = stack[stack.length - 1]
  const parent = stack[stack.length - 2]
  if (!parent) return true
  if (parent.type === 'MemberExpression' && parent.property === node && !parent.computed) return false
  if (parent.type === 'ObjectProperty' && parent.key === node && !parent.computed) return false
  if (parent.type === 'JSXAttribute' && parent.name === node) return false
  if (parent.type.startsWith('JSX') && parent.type !== 'JSXExpressionContainer') return false
  if (FUNCTION_TYPES.has(parent.type) && parent.params?.includes(node)) return false
  if (parent.type === 'VariableDeclarator' && parent.id === node) return false
  return true
}
