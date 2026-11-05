// LeetCode 1948: a folder's signature is its sorted child names with their signatures. Folders with the same non-empty signature are duplicates; mark them and everything beneath.
const SOURCE = [
  "function deleteDuplicateFolder(paths) {",
  "  const root = { children: new Map() }",
  "  for (const path of paths) {",
  "    let node = root",
  "    for (const name of path) {",
  "      if (!node.children.has(name)) node.children.set(name, { children: new Map() })",
  "      node = node.children.get(name)",
  "    }",
  "  }",
  "  const count = new Map()",
  "  const signature = node => {",
  "    if (node.children.size === 0) return ''",
  "    const parts = [...node.children.keys()].sort().map(name => name + '(' + signature(node.children.get(name)) + ')')",
  "    const sig = parts.join('')",
  "    node.signature = sig",
  "    count.set(sig, (count.get(sig) || 0) + 1)",
  "    return sig",
  "  }",
  "  for (const child of root.children.values()) signature(child)",
  "  const mark = node => {",
  "    for (const child of node.children.values()) {",
  "      if (child.signature && count.get(child.signature) > 1) child.deleted = true",
  "      else mark(child)",
  "    }",
  "  }",
  "  mark(root)",
  "  const out = []",
  "  const walk = (node, path) => {",
  "    for (const name of [...node.children.keys()].sort()) {",
  "      const child = node.children.get(name)",
  "      if (child.deleted) continue",
  "      out.push([...path, name])",
  "      walk(child, [...path, name])",
  "    }",
  "  }",
  "  walk(root, [])",
  "  return out",
  "}",
]

export const code = SOURCE.map((text, index) => ({ line: index + 1, text }))

export const python = `def delete_duplicate_folder(paths):
    root = {"children": {}}
    for path in paths:
        node = root
        for name in path:
            node = node["children"].setdefault(name, {"children": {}})
    count = {}
    def signature(folder):
        if not folder["children"]:
            return ""
        parts = [name + "(" + signature(folder["children"][name]) + ")" for name in sorted(folder["children"])]
        sig = "".join(parts)
        count[sig] = count.get(sig, 0) + 1
        folder["signature"] = sig
        return sig
    for name in root["children"]:
        signature(root["children"][name])
    def mark(folder):
        for child in folder["children"].values():
            if count.get(child.get("signature", ""), 0) > 1 and child.get("signature"):
                child["deleted"] = True
            else:
                mark(child)
    mark(root)
    out = []
    def walk(folder, path):
        for name in sorted(folder["children"]):
            child = folder["children"][name]
            if child.get("deleted"):
                continue
            nxt = path + [name]
            out.append(nxt)
            walk(child, nxt)
    walk(root, [])
    return out
`

const L = text => { const i = SOURCE.findIndex(line => line.includes(text)); if (i < 0) throw new Error(`no code line: ${text}`); return i + 1 }
const P = text => { const i = python.split('\n').findIndex(line => line.includes(text)); if (i < 0) throw new Error(`no python line: ${text}`); return i + 1 }

export const phases = [
  { id: 'build', label: 'Build tree', description: 'Nest every path into a folder tree.' },
  { id: 'signature', label: 'Signatures', description: 'Describe each folder by its subtree and count repeats.' },
  { id: 'mark', label: 'Mark', description: 'Mark duplicate folders with their subfolders.' },
  { id: 'done', label: 'Result', description: 'Remaining folders after the single deletion.' },
]

export function parseInput(text) {
  let paths
  try { paths = JSON.parse(text) } catch { throw new Error('Enter a JSON array of paths, for example [["a"],["a","x"]].') }
  if (!Array.isArray(paths) || paths.length < 1 || paths.length > 12) throw new Error('Use 1 to 12 folder paths for the visualization.')
  if (!paths.every(p => Array.isArray(p) && p.length >= 1 && p.length <= 4 && p.every(n => typeof n === 'string' && /^[a-z]{1,4}$/.test(n)))) throw new Error('Each path is 1 to 4 lowercase names.')
  return { paths }
}

export function buildTrace({ paths }) {
  const root = { name: '/', children: new Map() }
  for (const path of paths) {
    let node = root
    for (const name of path) {
      if (!node.children.has(name)) node.children.set(name, { name, children: new Map(), path: null })
      node = node.children.get(name)
    }
  }
  const frames = []
  const folderPath = (node, acc) => node
  // Assign readable paths for display.
  const label = (node, prefix) => { for (const [name, child] of node.children) { child.path = [...prefix, name]; label(child, child.path) } }
  label(root, [])
  frames.push({ phase: 'build', activeLine: L('const root ='), pythonLine: P('root = {'), message: `Built ${paths.length} path(s) into a folder tree.`, rows: [], count: {}, marked: [] })
  const count = new Map()
  const rows = []
  const signature = node => {
    if (node.children.size === 0) return ''
    const parts = [...node.children.keys()].sort().map(name => name + '(' + signature(node.children.get(name)) + ')')
    const sig = parts.join('')
    node.signature = sig
    count.set(sig, (count.get(sig) || 0) + 1)
    rows.push({ path: node.path, sig, repeats: count.get(sig) })
    frames.push({ phase: 'signature', activeLine: L('const sig ='), pythonLine: P('sig = "".join'), message: `/${node.path.join('/')} has signature ${sig} (seen ${count.get(sig)} time(s)).`, rows: rows.map(r => ({ ...r })), count: Object.fromEntries(count), marked: [] })
    return sig
  }
  for (const child of root.children.values()) signature(child)
  const marked = []
  const mark = node => {
    for (const child of node.children.values()) {
      if (child.signature && count.get(child.signature) > 1) {
        child.deleted = true
        marked.push(child.path)
        frames.push({ phase: 'mark', activeLine: L('child.deleted'), pythonLine: P('child["deleted"]'), message: `/${child.path.join('/')} is a duplicate: mark it and its subfolders.`, rows: rows.map(r => ({ ...r })), count: Object.fromEntries(count), marked: marked.map(p => [...p]) })
      } else mark(child)
    }
  }
  mark(root)
  const out = []
  const walk = (node, path) => {
    for (const name of [...node.children.keys()].sort()) {
      const child = node.children.get(name)
      if (child.deleted) continue
      const next = [...path, name]
      out.push(next)
      walk(child, next)
    }
  }
  walk(root, [])
  frames.push({ phase: 'done', activeLine: L('return out'), pythonLine: P('return out'), message: `${out.length} folder(s) remain.`, rows: rows.map(r => ({ ...r })), count: Object.fromEntries(count), marked: marked.map(p => [...p]), out: out.map(p => [...p]) })
  return { input: { paths }, result: out, frames, folderPath }
}
