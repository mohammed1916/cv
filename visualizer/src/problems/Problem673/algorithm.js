export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 2000 || nums.some(v => !Number.isInteger(v) || Math.abs(v) > 1000000)) throw new Error('Enter a JSON array of 1–2,000 integers with |v| ≤ 1,000,000.')
  return nums
}

// length[i] and count[i]: the longest increasing subsequence ending at i and how many realize that length.
export function buildTrace(nums) {
  const n = nums.length
  const length = Array(n).fill(1), count = Array(n).fill(1)
  const frames = [{ phase: 'start', i: -1, j: -1, length: [...length], count: [...count], activeLine: 2, message: 'Every single element is an increasing subsequence of length 1.' }]
  for (let i = 0; i < n; i++) for (let j = 0; j < i; j++) {
    if (nums[j] >= nums[i]) continue
    if (length[j] + 1 > length[i]) { length[i] = length[j] + 1; count[i] = count[j] }
    else if (length[j] + 1 === length[i]) count[i] += count[j]
    frames.push({ phase: 'extend', i, j, length: [...length], count: [...count], activeLine: 7, message: `${nums[j]} < ${nums[i]}: from ${j}, length ${length[j] + 1}; ending at ${i}: length ${length[i]}, count ${count[i]}.` })
  }
  const best = Math.max(...length)
  const result = length.reduce((sum, len, i) => (len === best ? sum + count[i] : sum), 0)
  frames.push({ phase: 'done', i: -1, j: -1, length: [...length], count: [...count], result, activeLine: 10, message: `${result} longest increasing subsequences of length ${best}.` })
  return { input: nums, result, frames }
}

export const code = `set every length and count to 1
for each index i:
  for each earlier index j with nums[j] less than nums[i]:
    if length[j] + 1 is greater than length[i], take length[j] + 1 and count[j]
    otherwise, if equal, add count[j] to count[i]
return the sum of counts whose length equals the greatest length`.split('\n').map((text, index) => ({ line: index + 1, text }))

// Scan trace: activeLine 1 (setup), 4 (update per earlier index j), 5 (return).
export const LINE_MAP = { 1: 1, 4: 4, 5: 6 }

export const familyLine = frame => LINE_MAP[frame.activeLine] ?? frame.activeLine

export const python = `def find_number_of_lis(nums):
    n = len(nums)
    lengths = [1] * n
    counts = [1] * n
    for i in range(n):
        for j in range(i):
            if nums[j] < nums[i]:
                if lengths[j] + 1 > lengths[i]:
                    lengths[i] = lengths[j] + 1
                    counts[i] = counts[j]
                elif lengths[j] + 1 == lengths[i]:
                    counts[i] += counts[j]
    best = max(lengths)
    return sum(counts[i] for i in range(n) if lengths[i] == best)`
