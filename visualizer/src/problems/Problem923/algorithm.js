const MOD = 1000000007
export function parseInput(text) {
  const v = JSON.parse(text)
  if (!v || typeof v !== 'object' || !Array.isArray(v.arr) || !Number.isInteger(v.target)) throw new Error('Enter {"arr": [1,1,2,2,3,3,4,4,5,5], "target": 8}.')
  const { arr, target } = v
  if (arr.length < 3 || arr.length > 40 || arr.some(x => !Number.isInteger(x) || x < 0 || x > 100)) throw new Error('arr must hold 3-40 integers between 0 and 100 (capped at 40 for visualization).')
  if (target < 0 || target > 300) throw new Error('target must be between 0 and 300.')
  return { arr: [...arr], target }
}
const at = s => code.findIndex(c => c.text.includes(s)) + 1
export function buildTrace({ arr: input, target }) {
  const arr = [...input].sort((a, b) => a - b)
  const n = arr.length
  let ans = 0
  const frames = [{ phase: 'start', activeLine: at('arr.sort()'), i: -1, j: -1, k: -1, ans, message: `Sorted: [${arr.join(', ')}]. For each first index i, two pointers j and k scan the rest; sorted order tells which pointer to move.` }]
  for (let i = 0; i < n; i++) {
    let j = i + 1, k = n - 1
    frames.push({ phase: 'fix', activeLine: at('j, k = i + 1'), i, j, k, ans, message: `Fix arr[${i}] = ${arr[i]}; search the suffix with j = ${j}, k = ${k}.` })
    while (j < k) {
      const s = arr[i] + arr[j] + arr[k]
      if (s < target) {
        frames.push({ phase: 'move', activeLine: at('j += 1'), i, j, k, sum: s, ans, message: `${arr[i]} + ${arr[j]} + ${arr[k]} = ${s} is below ${target}: advance j for a larger sum.` })
        j++
      } else if (s > target) {
        frames.push({ phase: 'move', activeLine: at('k -= 1'), i, j, k, sum: s, ans, message: `${arr[i]} + ${arr[j]} + ${arr[k]} = ${s} is above ${target}: retreat k for a smaller sum.` })
        k--
      } else if (arr[j] !== arr[k]) {
        let left = 1, right = 1
        const j0 = j, k0 = k
        while (arr[j] === arr[j + 1]) { left++; j++ }
        while (arr[k] === arr[k - 1]) { right++; k-- }
        ans += left * right
        frames.push({ phase: 'count', activeLine: at('ans += left * right'), i, j: j0, k: k0, j2: j, k2: k, sum: s, ans, message: `Sum is ${target}. The value ${arr[j0]} repeats ${left} time(s) on the left and ${arr[k0]} repeats ${right} time(s) on the right: ${left} * ${right} = ${left * right} combinations. Total ${ans}.` })
        j++; k--
      } else {
        const add = (k - j + 1) * (k - j) / 2
        ans += add
        frames.push({ phase: 'pairs', activeLine: at('ans += (k - j + 1)'), i, j, k, sum: s, ans, message: `Sum is ${target} and arr[j] = arr[k] = ${arr[j]}: every pair among the ${k - j + 1} equal values works, C(${k - j + 1}, 2) = ${add}. Total ${ans}; this i is finished.` })
        break
      }
    }
  }
  const result = ans % MOD
  frames.push({ phase: 'done', activeLine: at('return ans'), i: -1, j: -1, k: -1, ans: result, message: `${result} triples sum to ${target} (modulo 10^9 + 7).` })
  return { input: { arr: input, target }, sorted: arr, result, frames }
}
export const code = `def threeSumMulti(arr, target):
    MOD = 10**9 + 7
    arr.sort()
    n = len(arr)
    ans = 0
    for i in range(n):
        j, k = i + 1, n - 1
        while j < k:
            s = arr[i] + arr[j] + arr[k]
            if s < target:
                j += 1
            elif s > target:
                k -= 1
            elif arr[j] != arr[k]:
                left = right = 1
                while arr[j] == arr[j + 1]:
                    left += 1
                    j += 1
                while arr[k] == arr[k - 1]:
                    right += 1
                    k -= 1
                ans += left * right
                j += 1
                k -= 1
            else:
                ans += (k - j + 1) * (k - j) // 2
                break
    return ans % MOD`.split('\n').map((text, index) => ({ line: index + 1, text }))
