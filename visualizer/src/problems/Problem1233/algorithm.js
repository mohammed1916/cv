const PATH_PATTERN = /^(\/[a-z]+)+$/

export function parseInput(text) {
  let obj
  try { obj = typeof text === 'string' ? JSON.parse(text) : text } catch { throw new Error('Use a JSON object like {"folder":["/a","/a/b"]}.') }
  if (!obj || typeof obj !== 'object' || Array.isArray(obj) || !Array.isArray(obj.folder)) throw new Error('Use an object with a folder array of path strings.')
  if (obj.folder.length < 1 || obj.folder.length > 64) throw new Error('This visualization accepts 1 to 64 folder paths.')
  for (const path of obj.folder) {
    if (typeof path !== 'string' || path.length < 2 || path.length > 100 || !PATH_PATTERN.test(path)) {
      throw new Error(`Each path must be "/" followed by lowercase letters, such as "/a/b" (got ${JSON.stringify(path)}).`)
    }
  }
  if (new Set(obj.folder).size !== obj.folder.length) throw new Error('Folder paths must be unique.')
  return { folder: obj.folder }
}

export const code = [
  { line: 1, text: "function removeSubfolders(folder) {" },
  { line: 2, text: "  const ordered = [...folder].sort()" },
  { line: 3, text: "  const kept = []" },
  { line: 4, text: "  for (const path of ordered) {" },
  { line: 5, text: "    const parent = kept[kept.length - 1]" },
  { line: 6, text: "    if (parent === undefined || !path.startsWith(parent + '/')) kept.push(path)" },
  { line: 7, text: "  }" },
  { line: 8, text: "  return kept" },
  { line: 9, text: "}" },
]

export const python = `def removeSubfolders(folder):
    ordered = sorted(folder)
    kept = []
    for path in ordered:
        if not kept or not path.startswith(kept[-1] + "/"):
            kept.append(path)
    return kept`

export const pythonLineMap = { 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 5, 7: 6, 8: 7, 9: 7 }

export function buildTrace(input) {
  const { folder } = parseInput(input)
  const ordered = [...folder].sort()
  const kept = []
  const frames = []
  const push = (phase, activeLine, index, message, extra = {}) =>
    frames.push({ phase, activeLine, message, ordered, index, kept: [...kept], ...extra })

  push('sort', 2, -1, `Sorted ${ordered.length} paths so each parent comes right before its sub-folders.`)
  ordered.forEach((path, index) => {
    push('scan', 4, index, `Visit ${path}.`)
    const parent = kept.length ? kept[kept.length - 1] : null
    const covered = parent !== null && path.startsWith(parent + '/')
    push('check', 6, index,
      covered ? `${path} starts with ${parent}/, so it is a sub-folder and is removed.`
        : parent === null ? `No folder is kept yet, so ${path} is kept.`
          : `${path} is not under ${parent}, so it is kept.`,
      { covered })
    if (!covered) {
      kept.push(path)
      push('keep', 6, index, `Keep ${path}.`, { covered: false })
    }
  })
  push('done', 8, -1, `Return the ${kept.length} top-level folders.`, { result: [...kept] })
  return { input: { folder }, result: [...kept], frames }
}
