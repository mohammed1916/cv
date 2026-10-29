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
  { line: 1, text: 'sort the folder paths lexicographically' },
  { line: 2, text: 'kept = empty list' },
  { line: 3, text: 'for each path in sorted order:' },
  { line: 4, text: "  if kept is empty or path does not start with last(kept) + '/':" },
  { line: 5, text: '    append path to kept' },
  { line: 6, text: 'return kept' },
]

export const python = `def removeSubfolders(folder):
    ordered = sorted(folder)
    kept = []
    for path in ordered:
        if not kept or not path.startswith(kept[-1] + "/"):
            kept.append(path)
    return kept`

export const pythonLineMap = { 1: 2, 2: 3, 3: 4, 4: 5, 5: 6, 6: 7 }

export function buildTrace(input) {
  const { folder } = parseInput(input)
  const ordered = [...folder].sort()
  const kept = []
  const frames = []
  const push = (phase, activeLine, index, message, extra = {}) =>
    frames.push({ phase, activeLine, message, ordered, index, kept: [...kept], ...extra })

  push('sort', 1, -1, `Sorted ${ordered.length} paths so each parent comes right before its sub-folders.`)
  ordered.forEach((path, index) => {
    push('scan', 3, index, `Visit ${path}.`)
    const parent = kept.length ? kept[kept.length - 1] : null
    const covered = parent !== null && path.startsWith(parent + '/')
    push('check', 4, index,
      covered ? `${path} starts with ${parent}/, so it is a sub-folder and is removed.`
        : parent === null ? `No folder is kept yet, so ${path} is kept.`
          : `${path} is not under ${parent}, so it is kept.`,
      { covered })
    if (!covered) {
      kept.push(path)
      push('keep', 5, index, `Keep ${path}.`, { covered: false })
    }
  })
  push('done', 6, -1, `Return the ${kept.length} top-level folders.`, { result: [...kept] })
  return { input: { folder }, result: [...kept], frames }
}
