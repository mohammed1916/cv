export function parseInput(text) {
  const paths = JSON.parse(text)
  if (!Array.isArray(paths) || paths.length < 1 || paths.length > 20000 || paths.some(p => typeof p !== 'string' || p.length > 3000)) throw new Error('Enter a JSON array of 1–20,000 path strings such as "root/a 1.txt(abc)".')
  const bad = paths.find(p => !/^[^ ]+( [^ ()]+\([^ ()]*\))+$/.test(p))
  if (bad !== undefined) throw new Error(`Malformed entry: ${bad}`)
  return paths
}

export function buildTrace(paths) {
  const byContent = new Map()
  const frames = [{ phase: 'start', line: -1, groups: [], activeLine: 2, message: 'Group every file path by its content.' }]
  paths.forEach((entry, line) => {
    const [dir, ...files] = entry.trim().split(' ')
    for (const file of files) {
      const open = file.indexOf('(')
      const name = file.slice(0, open), content = file.slice(open + 1, -1)
      const full = `${dir}/${name}`
      if (!byContent.has(content)) byContent.set(content, [])
      byContent.get(content).push(full)
      frames.push({ phase: 'add', line, groups: [...byContent.entries()].map(([c, p]) => [c, [...p]]), current: full, activeLine: 6, message: `${full} has content "${content}".` })
    }
  })
  const result = [...byContent.values()].filter(group => group.length > 1)
  frames.push({ phase: 'done', line: paths.length - 1, groups: [...byContent.entries()].map(([c, p]) => [c, [...p]]), result, activeLine: 9, message: `${result.length} duplicate group${result.length === 1 ? '' : 's'} found.` })
  return { input: paths, result, frames }
}

export const code = `const byContent = new Map()
for (const record of paths) {
  const [dir, ...files] = record.split(' ')
  for (const file of files) {
    const open = file.indexOf('(')
    const name = file.slice(0, open)
    const content = file.slice(open + 1, -1)
    if (!byContent.has(content)) byContent.set(content, [])
    byContent.get(content).push(\`\${dir}/\${name}\`)
  }
}
return [...byContent.values()].filter(group => group.length > 1)`.split('\n').map((text, index) => ({ line: index + 1, text }))

// The family visualizer reports its own step numbers (1 setup, 3 group, 5 return).
export const LINE_MAP = { 1: 1, 3: 9, 5: 12 }

export const python = `def find_duplicate(paths):
    groups = {}
    for record in paths:
        directory, *files = record.split(' ')
        for file in files:
            split = file.index('(')
            name = file[:split]
            content = file[split + 1:-1]
            groups.setdefault(content, []).append(directory + '/' + name)
    return [items for items in groups.values() if len(items) > 1]`
