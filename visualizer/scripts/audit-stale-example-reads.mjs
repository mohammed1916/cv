#!/usr/bin/env node
// Finds visualizers where typing into the input panel cannot change anything.
//
// The transforms added `const { field } = useMemo(... parse fieldInput ...)`,
// but some call sites still read `ex.field` — the canned example — so the view
// silently ignores whatever the user types. No lint or build catches this: the
// code is valid, just wired to the wrong source.
//
// Reports `ex.<field>` reads where a parsed `<field>` is in scope.

import { readFileSync } from 'fs'
import { execSync } from 'child_process'
import { parseFile, walk, visibleNames, isValueReference, patternNames, declarationsInBody, FUNCTION_TYPES } from './ast-scope-utils.mjs'

// Names holding the selected example object.
const EXAMPLE_VARS = new Set(['ex', 'example', 'currentEx', 'activeExample'])

// Stack index of the innermost enclosing scope that binds `name`, or -1.
function declaringIndex(stack, name) {
  for (let i = stack.length - 1; i >= 0; i--) {
    const node = stack[i]
    const names = new Set()
    if (FUNCTION_TYPES.has(node.type)) {
      for (const p of node.params) patternNames(p, names)
      if (node.body?.type === 'BlockStatement') declarationsInBody(node.body.body, names)
    } else if (node.type === 'Program' || node.type === 'BlockStatement') {
      declarationsInBody(node.body, names)
    }
    if (names.has(name)) return i
  }
  return -1
}

// `ex.field` is correct wherever `ex` is bound deeper than the parsed field —
// `applyExample = useCallback((ex) => setNumsInput(ex.nums))`, or a local
// `const ex = EXAMPLES[idx]`. It is a stale read only when both are bound in
// the same scope, i.e. `ex` is the component's selected-example state.
function isShadowedLocally(stack, exName, field) {
  const exAt = declaringIndex(stack, exName)
  const fieldAt = declaringIndex(stack, field)
  return exAt > fieldAt
}

function auditFile(file) {
  const src = readFileSync(file, 'utf8')
  if (!/Input, set/.test(src)) return null

  let ast
  try { ast = parseFile(src) } catch { return null }

  // Fields that have a parsed counterpart, derived from the input state names.
  const parsedFields = new Set(
    [...src.matchAll(/const \[(\w+)Input, set\w+\] = useState/g)].map((m) => m[1])
  )
  if (!parsedFields.size) return null

  const hits = []
  walk(ast.program, (n, stack) => {
    if (n.type !== 'MemberExpression' || n.computed) return
    if (n.object?.type !== 'Identifier' || !EXAMPLE_VARS.has(n.object.name)) return
    const field = n.property?.name
    if (!field || !parsedFields.has(field)) return
    if (isShadowedLocally(stack, n.object.name, field)) return
    // Only flag where the parsed value is actually reachable instead.
    const scope = visibleNames(stack)
    if (!scope.has(field)) return
    if (!isValueReference([...stack.slice(0, -1), n.object])) return
    hits.push({ line: n.loc.start.line, expr: `${n.object.name}.${field}`, parsed: field })
  })

  return hits.length ? { file, hits } : null
}

const files = execSync(`git ls-files 'src/problems/*.jsx' 'src/problems/**/*.jsx'`, { encoding: 'utf8' }).trim().split('\n')
const results = files.map(auditFile).filter(Boolean)

let total = 0
for (const r of results) {
  console.log(r.file)
  for (const h of r.hits) {
    console.log(`   L${h.line}  ${h.expr}  → should read parsed \`${h.parsed}\``)
    total++
  }
}
console.log(`\nfiles: ${results.length}   stale reads: ${total}`)
