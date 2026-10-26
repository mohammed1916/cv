export const BINARY_SEARCH_CODE = [
  { line: 1, text: 'class Solution:' },
  { line: 2, text: '    def search(self, nums: list[int], target: int) -> int:' },
  { line: 3, text: '        left, right = 0, len(nums) - 1' },
  { line: 4, text: '        ' },
  { line: 5, text: '        while left <= right:' },
  { line: 6, text: '            mid = left + (right - left) // 2' },
  { line: 7, text: '            ' },
  { line: 8, text: '            if nums[mid] == target:' },
  { line: 9, text: '                return mid' },
  { line: 10, text: '            elif nums[mid] < target:' },
  { line: 11, text: '                left = mid + 1' },
  { line: 12, text: '            else:' },
  { line: 13, text: '                right = mid - 1' },
  { line: 14, text: '                ' },
  { line: 15, text: '        return -1' },
]

export function binarySearchSteps(nums, target) {
  const steps = []

  if (!nums || nums.length === 0) {
    steps.push({
      phase: 'done', left: 0, right: -1, mid: null, foundIndex: -1,
      activeLine: 15, message: 'Array is empty. Return -1.'
    })
    return steps
  }

  let left = 0
  let right = nums.length - 1

  steps.push({
    phase: 'init', left, right, mid: null,
    activeLine: 3, message: `Initialize left = 0, right = ${right} (${nums.length} - 1).`
  })

  while (left <= right) {
    steps.push({
      phase: 'while_check', left, right, mid: null,
      activeLine: 5, message: `Check if left (${left}) <= right (${right}). Yes, continue.`
    })

    const mid = Math.floor(left + (right - left) / 2)
    steps.push({
      phase: 'calc_mid', left, right, mid,
      activeLine: 6, message: `Calculate mid = ${left} + (${right} - ${left}) // 2 = ${mid}.`
    })

    steps.push({
      phase: 'check_target', left, right, mid,
      activeLine: 8, message: `Is nums[mid] (${nums[mid]}) == target (${target})?`
    })

    if (nums[mid] === target) {
      steps.push({
        phase: 'found', left, right, mid, foundIndex: mid,
        activeLine: 9, message: `Target found at index ${mid}! Return ${mid}.`
      })
      return steps
    }

    steps.push({
      phase: 'check_less', left, right, mid,
      activeLine: 10, message: `No. Is nums[mid] (${nums[mid]}) < target (${target})?`
    })

    if (nums[mid] < target) {
      left = mid + 1
      steps.push({
        phase: 'update_left', left, right, mid,
        activeLine: 11, message: `Yes, target must be in the right half. Update left = mid + 1 = ${left}.`
      })
    } else {
      steps.push({
        phase: 'check_greater', left, right, mid,
        activeLine: 12, message: `No, nums[mid] (${nums[mid]}) > target (${target}).`
      })

      right = mid - 1
      steps.push({
        phase: 'update_right', left, right, mid,
        activeLine: 13, message: `Target must be in the left half. Update right = mid - 1 = ${right}.`
      })
    }
  }

  steps.push({
    phase: 'done', left, right, mid: null, foundIndex: -1,
    activeLine: 15, message: `Loop ends (left > right). Target not found, return -1.`
  })

  return steps
}
