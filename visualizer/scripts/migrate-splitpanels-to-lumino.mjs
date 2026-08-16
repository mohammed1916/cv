#!/usr/bin/env node
// Migrates ResizableSplitPanels call sites to LuminoDockPanel.
//
//   ResizableSplitPanels  left={<JSX/>} right={<JSX/>}  — renders inline
//   LuminoDockPanel       panels=[{id, title, dockMode}] + onPanelReady(divs)
//
// Each side becomes a dock panel and its JSX is portaled into the div Lumino
// hands back. The replacement is wrapped in a fragment, which is valid
// anywhere the single original element was.
//
// Dropped, with no LuminoDockPanel equivalent: storageKey (so the remembered
// split position is lost), initialLeftPercent, minLeftPx, minRightPx.
//
// Usage: node scripts/migrate-splitpanels-to-lumino.mjs [--dry-run] [--only <substr>]

import { readFileSync, writeFileSync } from 'fs'
import { execSync } from 'child_process'
import { parseFile, walk, declarationsInBody } from './ast-scope-utils.mjs'

const argv = process.argv.slice(2)
const DRY = argv.includes('--dry-run')
const onlyIdx = argv.indexOf('--only')
const ONLY = onlyIdx >= 0 ? argv[onlyIdx + 1] : null

const src_ = (src, node) => src.slice(node.range[0], node.range[1])

function findElement(ast) {
  const out = []
  walk(ast.program, (n) => {
    if (n.type === 'JSXElement' && n.openingElement?.name?.name === 'ResizableSplitPanels') out.push(n)
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

// These panels carry their heading in a `*-panel-head` div, which is the best
// available tab label. Fall back to what the content obviously is.
function deriveTitle(contentSrc, side) {
  // Stop at `{` as well as `<`: a heading often continues into a JSX
  // expression such as `Input {inputError && ...}`, which is not part of the
  // label.
  const head = contentSrc.match(/panel-head[^>]*>\s*([^<{][^<{]*?)\s*[<{]/)
  if (head) {
    const text = head[1].replace(/\s+/g, ' ').trim()
    if (text) return JSON.stringify(text)
  }
  if (/<CodeTracePanel\b/.test(contentSrc)) return JSON.stringify('Code')
  if (/<VisualizationPanel\b/.test(contentSrc)) return JSON.stringify('Visualization')
  return JSON.stringify(side === 'left' ? 'Input & State' : 'Visualization')
}

function uniqueName(base, taken) {
  if (!taken.has(base)) return base
  let i = 2
  while (taken.has(`${base}${i}`)) i++
  return `${base}${i}`
}

function ensureReactImports(src, needed) {
  const m = src.match(/import\s*\{([^}]*)\}\s*from\s*['"]react['"]/)
  if (!m) return src
  const have = m[1].split(',').map((s) => s.trim()).filter(Boolean)
  const add = needed.filter((n) => !have.includes(n))
  if (!add.length) return src
  return src.replace(m[0], m[0].replace(m[1], ` ${[...have, ...add].join(', ')} `))
}

function ensureCreatePortal(src) {
  if (/import\s*\{[^}]*\bcreatePortal\b[^}]*\}\s*from\s*['"]react-dom['"]/.test(src)) return src
  const lines = src.split('\n')
  let last = 0
  for (let i = 0; i < lines.length; i++) if (/^import /.test(lines[i])) last = i
  lines.splice(last + 1, 0, "import { createPortal } from 'react-dom'")
  return lines.join('\n')
}

// Swap the import, preserving the original relative prefix — files sit at
// different depths under src/problems.
function swapImport(src) {
  return src.replace(
    /import ResizableSplitPanels from\s*(['"])([^'"]*?)shared\/ResizableSplitPanels\1;?/,
    (_m, q, prefix) => `import LuminoDockPanel from ${q}${prefix}LuminoDockPanel${q}`
  )
}

function migrate(file) {
  const src = readFileSync(file, 'utf8')
  if (!/<ResizableSplitPanels/.test(src)) return { file, skip: 'no call site' }

  let ast
  try { ast = parseFile(src) } catch (e) { return { file, skip: `parse error: ${e.message}` } }

  const els = findElement(ast)
  if (els.length !== 1) return { file, skip: `${els.length} call sites` }
  const el = els[0]
  const attrs = attrsOf(el)
  if (attrs['<spread>']) return { file, skip: 'spread props' }
  if (!attrs.left) return { file, skip: 'no left panel' }

  const sides = [['left', attrs.left], ['right', attrs.right]].filter(([, v]) => v)
  const entries = sides.map(([id, expr], i) => {
    const contentSrc = src_(src, expr)
    return { id, contentSrc, titleSrc: deriveTitle(contentSrc, id), mode: i === 0 ? null : 'split-right' }
  })

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
  if (!ret) return { file, skip: 'enclosing return not found' }

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
    `${elIndent}</>`,
  ].join('\n')

  // Element first, then declarations, so the earlier offset stays valid.
  let out = src.slice(0, el.range[0]) + replacement + src.slice(el.range[1])
  out = out.slice(0, retLineStart) + decl + out.slice(retLineStart)

  out = swapImport(out)
  out = ensureCreatePortal(out)
  out = ensureReactImports(out, ['useState', 'useMemo', 'useCallback'])

  try { parseFile(out) } catch (e) { return { file, skip: `would break: ${e.message}` } }
  if (!DRY) writeFileSync(file, out)
  return { file, ok: true, panels: entries.map((e) => `${e.id}:${JSON.parse(e.titleSrc)}`) }
}

let files = execSync(`git ls-files 'src/problems/*.jsx' 'src/problems/**/*.jsx'`, { encoding: 'utf8' })
  .trim().split('\n')
if (ONLY) files = files.filter((f) => f.includes(ONLY))

const done = []
const skipped = []
for (const f of files) {
  const r = migrate(f)
  if (r.ok) { done.push(r); console.log(`> ${r.file}  [${r.panels.join(' | ')}]`) }
  else if (r.skip !== 'no call site') skipped.push(r)
}
console.log(`\n${DRY ? 'would migrate' : 'migrated'}: ${done.length}`)
const reasons = {}
for (const s of skipped) (reasons[s.skip] ||= []).push(s.file)
for (const [why, list] of Object.entries(reasons).sort((a, b) => b[1].length - a[1].length)) {
  console.log(`  ${String(list.length).padStart(4)}  ${why}`)
  for (const f of list.slice(0, 8)) console.log(`          ${f}`)
}
