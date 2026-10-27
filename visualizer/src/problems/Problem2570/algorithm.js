function checkList(list, name) {
  if (!Array.isArray(list) || list.length < 1 || list.length > 8) throw new Error(`${name} needs 1 to 8 pairs.`)
  list.forEach((pair, k) => {
    if (!Array.isArray(pair) || pair.length !== 2 || !Number.isInteger(pair[0]) || !Number.isInteger(pair[1])) throw new Error(`${name} entries are [id, value] integers.`)
    if (pair[0] < 1 || pair[0] > 10 || pair[1] < 1 || pair[1] > 100) throw new Error('Ids are 1 to 10 and values are 1 to 100 in this visualization.')
    if (k > 0 && list[k - 1][0] >= pair[0]) throw new Error(`${name} must be sorted by id with no repeated ids.`)
  })
}

export function parseInput(text) {
  const obj = JSON.parse(text)
  if (!obj || typeof obj !== 'object') throw new Error('Use an object with nums1 and nums2.')
  checkList(obj.nums1, 'nums1')
  checkList(obj.nums2, 'nums2')
  return { nums1: obj.nums1, nums2: obj.nums2 }
}

export function buildTrace(input) {
  const { nums1, nums2 } = input
  let i = 0
  let j = 0
  const merged = []
  const frames = [{ phase: 'start', activeLine: L('set i and j to 0'), i, j, merged: [], message: 'Both lists are sorted by id, so walk them together.' }]
  while (i < nums1.length && j < nums2.length) {
    if (nums1[i][0] < nums2[j][0]) {
      merged.push([nums1[i][0], nums1[i][1]])
      frames.push({ phase: 'take1', activeLine: L('append nums1[i]'), i, j, merged: merged.map(p => [...p]), message: `Id ${nums1[i][0]} appears only in nums1; keep ${nums1[i][1]}.` })
      i++
    } else if (nums2[j][0] < nums1[i][0]) {
      merged.push([nums2[j][0], nums2[j][1]])
      frames.push({ phase: 'take2', activeLine: L('append nums2[j]'), i, j, merged: merged.map(p => [...p]), message: `Id ${nums2[j][0]} appears only in nums2; keep ${nums2[j][1]}.` })
      j++
    } else {
      const sum = nums1[i][1] + nums2[j][1]
      merged.push([nums1[i][0], sum])
      frames.push({ phase: 'sum', activeLine: L('append the shared id'), i, j, merged: merged.map(p => [...p]), message: `Id ${nums1[i][0]} is in both lists: ${nums1[i][1]} + ${nums2[j][1]} = ${sum}.` })
      i++
      j++
    }
  }
  while (i < nums1.length) { merged.push([nums1[i][0], nums1[i][1]]); i++ }
  while (j < nums2.length) { merged.push([nums2[j][0], nums2[j][1]]); j++ }
  frames.push({ phase: 'done', activeLine: L('return merged'), i, j, merged: merged.map(p => [...p]), message: 'Both lists are used up; the merged list is sorted by id.' })
  return { input, result: merged, frames }
}

export const code = `merge two 2D arrays by summing values
  set i and j to 0
  set merged to an empty list
  while i is less than the length of nums1 and j is less than the length of nums2 do
    if nums1[i] has a smaller id than nums2[j] then
      append nums1[i] to merged and move i forward
    else if nums2[j] has a smaller id than nums1[i] then
      append nums2[j] to merged and move j forward
    otherwise
      append the shared id with the sum of both values and move i and j forward
  append any remaining pairs of nums1 and nums2 to merged
  return merged`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def merge_arrays(nums1, nums2):
    i = 0
    j = 0
    merged = []
    while i < len(nums1) and j < len(nums2):
        if nums1[i][0] < nums2[j][0]:
            merged.append([nums1[i][0], nums1[i][1]])
            i += 1
        elif nums2[j][0] < nums1[i][0]:
            merged.append([nums2[j][0], nums2[j][1]])
            j += 1
        else:
            merged.append([nums1[i][0], nums1[i][1] + nums2[j][1]])
            i += 1
            j += 1
    while i < len(nums1):
        merged.append([nums1[i][0], nums1[i][1]])
        i += 1
    while j < len(nums2):
        merged.append([nums2[j][0], nums2[j][1]])
        j += 1
    return merged
`
