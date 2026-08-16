#!/usr/bin/env node
// Migrates visualizers from DockableWorkspace to LuminoDockPanel.
//
// The two components take different shapes:
//   DockableWorkspace  panels=[{id, title, content: <JSX/>}]  — renders inline
//   LuminoDockPanel    panels=[{id, title, dockMode}] + onPanelReady(divs)
//                      — the parent portals content into the divs it hands back
//
// So each panel's `content` is lifted out of the panels array into a
// `panelContents` map, and the element is replaced by the dock plus a portal
// per panel.
//
// The replacement is always wrapped in a fragment. A fragment is valid
// anywhere the single original element was, which removes any adjacent-JSX
// hazard regardless of whether the call site sits in a div, a ternary branch,
// or a fragment.
//
// Usage: node scripts/migrate-dockable-to-lumino.mjs [--dry-run] [--only <substr>]

import { readFileSync, writeFileSync } from 'fs'
import { execSync } from 'child_process'
import { parseFile, walk, declarationsInBody } from './ast-scope-utils.mjs'

const argv = process.argv.slice(2)
const DRY = argv.includes('--dry-run')
const onlyIdx = argv.indexOf('--only')
const ONLY = onlyIdx >= 0 ? argv[onlyIdx + 1] : null

const src_ = (src, node) => src.slice(node.range[0], node.range[1])

function findElements(ast) {
  const out = []
  walk(ast.program, (n) => {
    if (n.type === 'JSXElement' && n.openingElement?.name?.name === 'DockableWorkspace') out.push(n)
  })
  return out
}

function attrsOf(el) {
  const out = {}
  for (const a of el.openingElement.attributes) {
    if (a.type !== 'JSXAttribute') { out['<spread>'] = true; continue }
    out[a.name.name] = a.value?.type === 'JSXExpressionContainer' ? a.value.expression : a.value
  }
  return out
}

// Locates the declarator for the panels array and the array literal itself.
function resolvePanelsArray(ast, expr) {
  if (expr?.type === 'ArrayExpression') return { array: expr, declarator: null, deps: null }
  if (expr?.type !== 'Identifier') return null

  let found = null
  walk(ast.program, (n) => {
    if (found || n.type !== 'VariableDeclarator' || n.id?.name !== expr.name) return
    const init = n.init
    if (init?.type === 'CallExpression' && init.callee?.name === 'useMemo') {
      const body = init.arguments[0]?.body
      if (body?.type === 'ArrayExpression') found = { array: body, declarator: n, deps: init.arguments[1] ?? null }
    } else if (init?.type === 'ArrayExpression') {
      found = { array: init, declarator: n, deps: null }
    }
  })
  return found
}

// rows: [['input','storyboard'], ['tree','code']]
// LuminoDockPanel always docks relative to the FIRST panel, so a panel sharing
// row 0 splits right and anything on a later row splits bottom.
function dockModes(rows, ids) {
  const modes = {}
  if (!rows) {
    ids.forEach((id, i) => { if (i > 0) modes[id] = 'split-right' })
    return modes
  }
  const rowOf = {}
  rows.forEach((row, r) => row.forEach((id) => { rowOf[id] = r }))
  ids.forEach((id, i) => {
    if (i === 0) return
    modes[id] = (rowOf[id] ?? 0) === (rowOf[ids[0]] ?? 0) ? 'split-right' : 'split-bottom'
  })
  return modes
}

function readRows(layoutExpr) {
  if (layoutExpr?.type !== 'ObjectExpression') return null
  const rows = layoutExpr.properties.find((p) => p.key?.name === 'rows')
  if (rows?.value?.type !== 'ArrayExpression') return null
  const out = []
  for (const r of rows.value.elements) {
    if (r?.type !== 'ArrayExpression') return null
    const ids = r.elements.map((e) => (e?.type === 'StringLiteral' ? e.value : null))
    if (ids.some((x) => x == null)) return null
    out.push(ids)
  }
  return out
}

function uniqueName(base, taken) {
  if (!taken.has(base)) return base
  let i = 2
  while (taken.has(`${base}${i}`)) i++
  return `${base}${i}`
}

function ensureReactImports(src, needed) {
  // Unanchored: several files start with a UTF-8 BOM, which defeats `^`.
  const m = src.match(/import\s*\{([^}]*)\}\s*from\s*['"]react['"]/)
  if (!m) return src
  const have = m[1].split(',').map((s) => s.trim()).filter(Boolean)
  const add = needed.filter((n) => !have.includes(n))
  if (!add.length) return src
  const merged = [...have, ...add].join(', ')
  return src.replace(m[0], m[0].replace(m[1], ` ${merged} `))
}

function ensureCreatePortal(src) {
  if (/\bcreatePortal\b/.test(src) && /from\s+['"]react-dom['"]/.test(src)) return src
  const lines = src.split('\n')
  let last = 0
  for (let i = 0; i < lines.length; i++) if (/^import /.test(lines[i])) last = i
  lines.splice(last + 1, 0, "import { createPortal } from 'react-dom'")
  return lines.join('\n')
}

function swapDockImport(src) {
  // `from` is not always followed by a space, and the file may start with a
  // BOM, so this stays unanchored and tolerant of the spacing. The prefix is
  // taken from the original path — files sit at different depths, so a
  // hardcoded '../../' would be wrong for some.
  return src.replace(
    /import DockableWorkspace from\s*(['"])([^'"]*?)shared\/DockableWorkspace\1;?/,
    (_m, q, prefix) => `import LuminoDockPanel from ${q}${prefix}LuminoDockPanel${q}`
  )
}

function migrate(file) {
  let src = readFileSync(file, 'utf8')
  if (!/import DockableWorkspace/.test(src)) return { file, skip: 'no import' }

  let ast
  try { ast = parseFile(src) } catch (e) { return { file, skip: `parse error: ${e.message}` } }

  const els = findElements(ast)
  if (!els.length) return { file, skip: 'import only' }
  if (els.length > 1) return { file, skip: 'multiple DockableWorkspace elements' }

  const el = els[0]
  const attrs = attrsOf(el)
  if (attrs['<spread>']) return { file, skip: 'spread props' }
  if (!attrs.panels) {
    const slots = ['leftPanelContent', 'rightPanelContent', 'bottomPanelContent', 'topPanelContent']
    if (slots.some((s) => attrs[s])) return migratePanelContentProps(file, src, ast, el, attrs, slots)
    return migrateChildrenBased(file, src, ast, el)
  }

  const resolved = resolvePanelsArray(ast, attrs.panels)
  if (!resolved) return { file, skip: 'panels array not resolvable' }

  // Each entry must expose id/title/content for the split to be meaningful.
  const entries = []
  for (const e of resolved.array.elements) {
    if (e?.type !== 'ObjectExpression') return { file, skip: 'panel entry is not an object literal' }
    const get = (k) => e.properties.find((p) => p.key?.name === k || p.key?.value === k)
    const id = get('id')
    const title = get('title')
    // A few files spell the slot `component` rather than `content`.
    const content = get('content') || get('component')
    if (!id || id.value?.type !== 'StringLiteral') return { file, skip: 'panel id is not a string literal' }
    if (!content) return { file, skip: 'panel entry has no content' }
    entries.push({
      id: id.value.value,
      titleSrc: title ? src_(src, title.value) : `'${id.value.value}'`,
      contentSrc: src_(src, content.value.type === 'JSXExpressionContainer' ? content.value.expression : content.value),
    })
  }
  if (!entries.length) return { file, skip: 'no panel entries' }

  const modes = dockModes(readRows(attrs.initialLayout), entries.map((e) => e.id))

  // Reserve names that do not collide with anything already declared.
  const taken = new Set()
  walk(ast.program, (n) => {
    if (n.type === 'Program' || n.type === 'BlockStatement') declarationsInBody(n.body, taken)
  })
  const NCONF = uniqueName('panelConfigs', taken)
  const NCONT = uniqueName('panelContents', taken)
  const NDIVS = uniqueName('panelDivs', taken)
  const NREADY = uniqueName('handlePanelReady', taken)
  const NSET = uniqueName('setPanelDivs', taken)

  const depsSrc = resolved.deps ? src_(src, resolved.deps) : '[]'

  if (!resolved.declarator) return { file, skip: 'inline panels array (no declaration to replace)' }
  const stmt = findEnclosingStatement(ast, resolved.declarator)
  if (!stmt) return { file, skip: 'declaration statement not found' }

  // Match the indentation of the statement being replaced.
  const stmtLineStart = src.lastIndexOf('\n', stmt.range[0]) + 1
  const ind = /^[ \t]*/.exec(src.slice(stmtLineStart))[0]

  const configLines = entries.map((e) => {
    const mode = modes[e.id] ? `, dockMode: '${modes[e.id]}'` : ''
    return `${ind}  { id: '${e.id}', title: ${e.titleSrc}${mode} },`
  }).join('\n')

  const contentLines = entries.map((e) => `${ind}  ${e.id.replace(/\W/g, '') === e.id ? e.id : JSON.stringify(e.id)}: (${e.contentSrc}),`).join('\n')

  const decl = [
    `${ind}const ${NCONF} = useMemo(() => [`,
    configLines,
    `${ind}], [])`,
    `${ind}const ${NCONT} = useMemo(() => ({`,
    contentLines,
    `${ind}}), ${depsSrc})`,
    `${ind}const [${NDIVS}, ${NSET}] = useState(null)`,
    `${ind}const ${NREADY} = useCallback((divs) => ${NSET}(divs), [])`,
  ].join('\n')

  let out = src.slice(0, stmt.range[0]) + decl.trimStart() + src.slice(stmt.range[1])

  // Re-parse to locate the element again at its shifted offset.
  let ast2
  try { ast2 = parseFile(out) } catch (e) { return { file, skip: `intermediate parse failed: ${e.message}` } }
  const el2 = findElements(ast2)[0]
  if (!el2) return { file, skip: 'element vanished after declaration rewrite' }

  const lineStart = out.lastIndexOf('\n', el2.range[0]) + 1
  const indent = /^[ \t]*/.exec(out.slice(lineStart))[0]
  const portals = entries
    .map((e) => {
      const acc = /^[A-Za-z_$][\w$]*$/.test(e.id) ? `.${e.id}` : `[${JSON.stringify(e.id)}]`
      return `${indent}      {${NDIVS}${acc} && createPortal(${NCONT}${acc}, ${NDIVS}${acc})}`
    })
    .join('\n')

  const replacement = [
    `<>`,
    `${indent}  <LuminoDockPanel panels={${NCONF}} onPanelReady={${NREADY}} />`,
    `${indent}  {${NDIVS} && (`,
    `${indent}    <>`,
    portals,
    `${indent}    </>`,
    `${indent}  )}`,
    `${indent}</>`,
  ].join('\n')

  out = out.slice(0, el2.range[0]) + replacement + out.slice(el2.range[1])

  out = swapDockImport(out)
  out = ensureCreatePortal(out)
  out = ensureReactImports(out, ['useState', 'useMemo', 'useCallback'])

  try { parseFile(out) } catch (e) { return { file, skip: `would break: ${e.message}` } }
  if (!DRY) writeFileSync(file, out)
  return { file, ok: true, panels: entries.map((e) => e.id) }
}

// Returns the inner source of a <FloatingPanel> wrapper, plus its title, so
// the wrapper can be dropped and its children become the dock panel's content.
function unwrapFloatingPanel(src, expr) {
  if (expr?.type !== 'JSXElement' || expr.openingElement?.name?.name !== 'FloatingPanel') {
    return { title: null, contentSrc: src_(src, expr) }
  }
  const a = attrsOf(expr)
  const title = a.title
    ? (a.title.type === 'StringLiteral' ? JSON.stringify(a.title.value) : src_(src, a.title))
    : null
  const inner = expr.children
  const first = inner.find((c) => c.type !== 'JSXText' || c.value.trim())
  const lastIdx = [...inner].reverse().findIndex((c) => c.type !== 'JSXText' || c.value.trim())
  const last = lastIdx === -1 ? null : inner[inner.length - 1 - lastIdx]
  return { title, contentSrc: first && last ? src.slice(first.range[0], last.range[1]) : 'null' }
}

// Handles the `leftPanelContent` / `rightPanelContent` / `bottomPanelContent`
// prop style, where each slot holds one panel and the element's children are
// the playback controls.
function migratePanelContentProps(file, src, ast, el, attrs, slots) {
  const MODE = { leftPanelContent: null, rightPanelContent: 'split-right', bottomPanelContent: 'split-bottom', topPanelContent: 'split-top' }
  const ID = { leftPanelContent: 'left', rightPanelContent: 'right', bottomPanelContent: 'bottom', topPanelContent: 'top' }

  const present = slots.filter((s) => attrs[s])
  const entries = present.map((s, i) => {
    const { title, contentSrc } = unwrapFloatingPanel(src, attrs[s])
    return { id: ID[s], titleSrc: title ?? JSON.stringify(ID[s]), contentSrc, mode: i === 0 ? null : MODE[s] ?? 'split-right' }
  })

  const kids = el.children.filter((c) => c.type === 'JSXElement')
  const extras = kids.map((k) => src_(src, k)).join('\n')

  const taken = new Set()
  walk(ast.program, (n) => {
    if (n.type === 'Program' || n.type === 'BlockStatement') declarationsInBody(n.body, taken)
  })
  const NCONF = uniqueName('panelConfigs', taken)
  const NCONT = uniqueName('panelContents', taken)
  const NDIVS = uniqueName('panelDivs', taken)
  const NREADY = uniqueName('handlePanelReady', taken)
  const NSET = uniqueName('setPanelDivs', taken)

  let ret = null
  walk(ast.program, (n) => {
    if (n.type !== 'ReturnStatement' || !n.argument) return
    if (el.range[0] >= n.range[0] && el.range[1] <= n.range[1]) ret = n
  })
  if (!ret) return { file, skip: 'panel-content props: enclosing return not found' }

  const retLineStart = src.lastIndexOf('\n', ret.range[0]) + 1
  const ind = /^[ \t]*/.exec(src.slice(retLineStart))[0]

  const decl = [
    `${ind}const ${NCONF} = useMemo(() => [`,
    ...entries.map((e) => `${ind}  { id: '${e.id}', title: ${e.titleSrc}${e.mode ? `, dockMode: '${e.mode}'` : ''} },`),
    `${ind}], [])`,
    `${ind}const ${NCONT} = {`,
    ...entries.map((e) => `${ind}  ${e.id}: (${e.contentSrc}),`),
    `${ind}}`,
    `${ind}const [${NDIVS}, ${NSET}] = useState(null)`,
    `${ind}const ${NREADY} = useCallback((divs) => ${NSET}(divs), [])`,
    '',
  ].join('\n')

  const elIndent = /^[ \t]*/.exec(src.slice(src.lastIndexOf('\n', el.range[0]) + 1))[0]
  const portals = entries
    .map((e) => `${elIndent}      {${NDIVS}.${e.id} && createPortal(${NCONT}.${e.id}, ${NDIVS}.${e.id})}`)
    .join('\n')

  const replacement = [
    `<>`,
    `${elIndent}  <LuminoDockPanel panels={${NCONF}} onPanelReady={${NREADY}} />`,
    `${elIndent}  {${NDIVS} && (`,
    `${elIndent}    <>`,
    portals,
    `${elIndent}    </>`,
    `${elIndent}  )}`,
    ...(extras ? [`${elIndent}  <FloatingPanel title="Playback Controls">`, extras, `${elIndent}  </FloatingPanel>`] : []),
    `${elIndent}</>`,
  ].join('\n')

  let out = src.slice(0, el.range[0]) + replacement + src.slice(el.range[1])
  out = out.slice(0, retLineStart) + decl + out.slice(retLineStart)

  out = swapDockImport(out)
  out = ensureCreatePortal(out)
  out = ensureReactImports(out, ['useState', 'useMemo', 'useCallback'])

  try { parseFile(out) } catch (e) { return { file, skip: `panel-content props would break: ${e.message}` } }
  if (!DRY) writeFileSync(file, out)
  return { file, ok: true, panels: entries.map((e) => e.id) }
}

// Handles `<DockableWorkspace title=...><FloatingPanel position="main">...`.
//
// These never worked: DockableWorkspace renders only `panels` and calls
// panels.map() on undefined, so every one of them throws on render. Each
// <FloatingPanel title position> child becomes a dock panel, and any loose
// child (an injected ManualInputPanel) is folded into the first panel.
function migrateChildrenBased(file, src, ast, el) {
  const POSITION_MODE = { main: null, bottom: 'split-bottom', right: 'split-right', left: 'split-left', top: 'split-top' }

  const kids = el.children.filter((c) => c.type === 'JSXElement')
  if (!kids.length) return { file, skip: 'children-based: no element children' }

  const panelsK = []
  const looseK = []
  for (const k of kids) {
    if (k.openingElement?.name?.name === 'FloatingPanel') panelsK.push(k)
    else looseK.push(k)
  }
  if (!panelsK.length) return { file, skip: 'children-based: no FloatingPanel children' }

  const entries = panelsK.map((k, i) => {
    const a = attrsOf(k)
    const pos = a.position?.type === 'StringLiteral' ? a.position.value : a.position?.value
    const id = typeof pos === 'string' && pos ? pos : `panel${i + 1}`
    const titleSrc = a.title
      ? (a.title.type === 'StringLiteral' ? JSON.stringify(a.title.value) : src_(src, a.title))
      : JSON.stringify(id)
    const inner = k.children
    const first = inner.find((c) => c.type !== 'JSXText' || c.value.trim())
    const lastIdx = [...inner].reverse().findIndex((c) => c.type !== 'JSXText' || c.value.trim())
    const last = lastIdx === -1 ? null : inner[inner.length - 1 - lastIdx]
    const contentSrc = first && last ? src.slice(first.range[0], last.range[1]) : 'null'
    return { id, titleSrc, contentSrc, mode: POSITION_MODE[id] ?? (i === 0 ? null : 'split-right') }
  })

  // Fold loose children (e.g. the input panel) into the first dock panel.
  if (looseK.length) {
    const loose = looseK.map((k) => src_(src, k)).join('\n')
    entries[0].contentSrc = `<>\n${loose}\n${entries[0].contentSrc}\n</>`
  }

  const taken = new Set()
  walk(ast.program, (n) => {
    if (n.type === 'Program' || n.type === 'BlockStatement') declarationsInBody(n.body, taken)
  })
  const NCONF = uniqueName('panelConfigs', taken)
  const NCONT = uniqueName('panelContents', taken)
  const NDIVS = uniqueName('panelDivs', taken)
  const NREADY = uniqueName('handlePanelReady', taken)
  const NSET = uniqueName('setPanelDivs', taken)

  // Insert the declarations just before the return that holds the element.
  let ret = null
  walk(ast.program, (n) => {
    if (n.type !== 'ReturnStatement' || !n.argument) return
    if (el.range[0] >= n.range[0] && el.range[1] <= n.range[1]) ret = n
  })
  if (!ret) return { file, skip: 'children-based: enclosing return not found' }

  const retLineStart = src.lastIndexOf('\n', ret.range[0]) + 1
  const ind = /^[ \t]*/.exec(src.slice(retLineStart))[0]

  const decl = [
    `${ind}const ${NCONF} = useMemo(() => [`,
    ...entries.map((e) => `${ind}  { id: '${e.id}', title: ${e.titleSrc}${e.mode ? `, dockMode: '${e.mode}'` : ''} },`),
    `${ind}], [])`,
    `${ind}const ${NCONT} = {`,
    ...entries.map((e) => `${ind}  ${/^[A-Za-z_$][\w$]*$/.test(e.id) ? e.id : JSON.stringify(e.id)}: (${e.contentSrc}),`),
    `${ind}}`,
    `${ind}const [${NDIVS}, ${NSET}] = useState(null)`,
    `${ind}const ${NREADY} = useCallback((divs) => ${NSET}(divs), [])`,
    '',
  ].join('\n')

  const elIndent = /^[ \t]*/.exec(src.slice(src.lastIndexOf('\n', el.range[0]) + 1))[0]
  const portals = entries
    .map((e) => {
      const acc = /^[A-Za-z_$][\w$]*$/.test(e.id) ? `.${e.id}` : `[${JSON.stringify(e.id)}]`
      return `${elIndent}      {${NDIVS}${acc} && createPortal(${NCONT}${acc}, ${NDIVS}${acc})}`
    })
    .join('\n')

  const replacement = [
    `<>`,
    `${elIndent}  <LuminoDockPanel panels={${NCONF}} onPanelReady={${NREADY}} />`,
    `${elIndent}  {${NDIVS} && (`,
    `${elIndent}    <>`,
    portals,
    `${elIndent}    </>`,
    `${elIndent}  )}`,
    `${elIndent}</>`,
  ].join('\n')

  // Element first, then the declarations, so the earlier offset stays valid.
  let out = src.slice(0, el.range[0]) + replacement + src.slice(el.range[1])
  out = out.slice(0, retLineStart) + decl + out.slice(retLineStart)

  out = swapDockImport(out)
  out = ensureCreatePortal(out)
  out = ensureReactImports(out, ['useState', 'useMemo', 'useCallback'])

  try { parseFile(out) } catch (e) { return { file, skip: `children-based would break: ${e.message}` } }
  if (!DRY) writeFileSync(file, out)
  return { file, ok: true, panels: entries.map((e) => e.id) }
}

// Smallest VariableDeclaration statement containing this declarator.
function findEnclosingStatement(ast, declarator) {
  let hit = null
  walk(ast.program, (n) => {
    if (n.type !== 'VariableDeclaration') return
    if (n.declarations.includes(declarator)) hit = n
  })
  return hit
}

let files = execSync(`git ls-files 'src/problems/*.jsx' 'src/problems/**/*.jsx'`, { encoding: 'utf8' }).trim().split('\n')
if (ONLY) files = files.filter((f) => f.includes(ONLY))

const done = []
const skipped = []
for (const f of files) {
  const r = migrate(f)
  if (r.ok) { done.push(r); console.log(`> ${r.file}  [${r.panels.join(', ')}]`) }
  else if (r.skip !== 'no import') skipped.push(r)
}
console.log(`\n${DRY ? 'would migrate' : 'migrated'}: ${done.length}`)
const reasons = {}
for (const s of skipped) (reasons[s.skip] ||= []).push(s.file)
for (const [why, list] of Object.entries(reasons).sort((a, b) => b[1].length - a[1].length)) {
  console.log(`  ${String(list.length).padStart(4)}  ${why}`)
  for (const f of list.slice(0, 5)) console.log(`          ${f}`)
}
