export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Array.isArray(input.packages) || !Array.isArray(input.boxes)) throw new Error('Use {"packages": [...], "boxes": [[...], ...]}.')
  const { packages, boxes } = input
  if (packages.length < 1 || packages.length > 6) throw new Error('Use 1 to 6 packages.')
  if (boxes.length < 1 || boxes.length > 3 || boxes.some(b => !Array.isArray(b) || b.length < 1 || b.length > 4)) throw new Error('Use 1 to 3 suppliers, each with 1 to 4 boxes.')
  if ([...packages, ...boxes.flat()].some(v => !Number.isInteger(v) || v < 1 || v > 20)) throw new Error('Sizes are integers from 1 to 20.')
  return { packages, boxes }
}

export function buildTrace({ packages, boxes }) {
  const sorted = [...packages].sort((a, b) => a - b)
  const n = sorted.length
  const prefix = [0]
  for (const value of sorted) prefix.push(prefix[prefix.length - 1] + value)
  // Number of packages no bigger than size.
  const countUpTo = size => {
    let lo = 0
    let hi = n
    while (lo < hi) {
      const mid = (lo + hi) >> 1
      if (sorted[mid] <= size) lo = mid + 1
      else hi = mid
    }
    return lo
  }
  let best = null
  const frames = [{ phase: 'start', activeLine: L('set best to nothing'), supplier: null, box: null, total: null, best, message: 'No supplier has been checked yet.' }]
  boxes.forEach((supplierBoxes, s) => {
    const sizes = [...supplierBoxes].sort((a, b) => a - b)
    if (sizes[sizes.length - 1] < sorted[n - 1]) {
      frames.push({ phase: 'skip', activeLine: L('skip the supplier'), supplier: s, box: null, total: null, best, message: `Supplier ${s + 1} has no box big enough for the largest package.` })
      return
    }
    let total = 0
    let start = 0
    for (const size of sizes) {
      const end = countUpTo(size)
      if (end > start) {
        total += (end - start) * size - (prefix[end] - prefix[start])
        start = end
        frames.push({ phase: 'box', activeLine: L('use this box for the packages'), supplier: s, box: size, total, best, message: `Box ${size} takes the packages up to ${size}; waste so far ${total}.` })
      }
      if (start === n) break
    }
    if (best === null || total < best) {
      best = total
      frames.push({ phase: 'improve', activeLine: L('keep the smallest total'), supplier: s, box: null, total, best, message: `Supplier ${s + 1} gives a new smallest total of ${total}.` })
    }
  })
  const result = best === null ? -1 : best % 1000000007
  frames.push({ phase: 'done', activeLine: L('return best modulo'), supplier: null, box: null, total: null, best, message: `Answer: ${result}.` })
  return { input: { packages, boxes }, result, frames }
}

export const code = `minimum wasted space for the packages
  sort the packages from smallest to largest
  build prefix sums of the package sizes
  set best to nothing
  for each supplier
    sort its boxes from smallest to largest
    skip the supplier if its largest box is too small
    for each box in order
      use this box for the packages not yet covered that are no bigger than it
      add box size times that count, minus those package sizes, to the total
    keep the smallest total as best
  return best modulo 1000000007, or minus one if no supplier works`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def min_wasted_space(packages, boxes):
    import bisect
    sorted_packages = sorted(packages)
    n = len(sorted_packages)
    prefix = [0]
    for value in sorted_packages:
        prefix.append(prefix[-1] + value)
    best = None
    for supplier in boxes:
        sizes = sorted(supplier)
        if sizes[-1] < sorted_packages[-1]:
            continue
        total = 0
        start = 0
        for size in sizes:
            end = bisect.bisect_right(sorted_packages, size)
            if end > start:
                total += (end - start) * size - (prefix[end] - prefix[start])
                start = end
            if start == n:
                break
        if best is None or total < best:
            best = total
    return -1 if best is None else best % 1000000007
`
