/**
 * Central registry for solution code across all problems
 * Each problem has its own solution code definition
 */

export const SOLUTION_CODE_REGISTRY = {
  'game-on-growing-tree': [
    { line: 1, text: "n = int(input())" },
    { line: 2, text: "parent = [0] + [x - 1 for x in map(int, input().split())]" },
    { line: 3, text: "if n == 1: print(1); exit()" },
    { line: 4, text: "" },
    { line: 5, text: "def solve(size):" },
    { line: 6, text: "    first = [0] * size" },
    { line: 7, text: "    second = [0] * size" },
    { line: 8, text: "    third = [0] * size" },
    { line: 9, text: "    for node in range(size - 1, 0, -1):" },
    { line: 10, text: "        p = parent[node]" },
    { line: 11, text: "        depth = second[node] + 1" },
    { line: 12, text: "        if depth > first[p]: first[p], second[p], third[p] = depth, first[p], second[p]" },
    { line: 13, text: "        elif depth > second[p]: second[p], third[p] = depth, second[p]" },
    { line: 14, text: "        elif depth > third[p]: third[p] = depth" },
    { line: 15, text: "    for node in range(1, size):" },
    { line: 16, text: "        p = parent[node]" },
    { line: 17, text: "        if second[p] <= second[node] + 1:" },
    { line: 18, text: "            depth = third[p] + 1" },
    { line: 19, text: "        else:" },
    { line: 20, text: "            depth = second[p] + 1" },
    { line: 21, text: "        if depth > first[node]: first[node], second[node], third[node] = depth, first[node], second[node]" },
    { line: 22, text: "        elif depth > second[node]: second[node], third[node] = depth, second[node]" },
    { line: 23, text: "        elif depth > third[node]: third[node] = depth" },
    { line: 24, text: "    return max(second) + 1" },
    { line: 25, text: "" },
    { line: 26, text: "ans = [0, 1, 1, 2] + [0] * n" },
    { line: 27, text: "ans[n + 2] = 17" },
    { line: 28, text: "stack = [(3, n + 2)]" },
    { line: 29, text: "while stack:" },
    { line: 30, text: "    left, right = stack.pop()" },
    { line: 31, text: "    mid = (left + right) >> 1" },
    { line: 32, text: "    value = solve(mid)" },
    { line: 33, text: "    ans[mid] = value" },
    { line: 34, text: "    if ans[left] == ans[mid]:" },
    { line: 35, text: "        for i in range(left + 1, mid): ans[i] = value" },
    { line: 36, text: "    elif left + 1 < mid:" },
    { line: 37, text: "        stack.append((left, mid))" },
    { line: 38, text: "    if ans[mid] == ans[right]:" },
    { line: 39, text: "        for i in range(mid + 1, right): ans[i] = value" },
    { line: 40, text: "    elif mid + 1 < right:" },
    { line: 41, text: "        stack.append((mid, right))" },
    { line: 42, text: "print(*ans[2:n + 2])" },
  ],

  'climbing-stairs': [
    { line: 1, text: 'class Solution:' },
    { line: 2, text: '    def climbStairs(self, n: int) -> int:' },
    { line: 3, text: '        one, two = 1, 1' },
    { line: 4, text: '        ' },
    { line: 5, text: '        for i in range(n - 1):' },
    { line: 6, text: '            temp = one' },
    { line: 7, text: '            one = one + two' },
    { line: 8, text: '            two = temp' },
    { line: 9, text: '            ' },
    { line: 10, text: '        return one' },
  ],

  'house-robber': [
    { line: 1, text: 'class Solution:' },
    { line: 2, text: '    def rob(self, nums: List[int]) -> int:' },
    { line: 3, text: '        if not nums: return 0' },
    { line: 4, text: '        ' },
    { line: 5, text: '        prev2 = 0' },
    { line: 6, text: '        prev1 = 0' },
    { line: 7, text: '        for money in nums:' },
    { line: 8, text: '            take = prev2 + money' },
    { line: 9, text: '            skip = prev1' },
    { line: 10, text: '            curr = max(take, skip)' },
    { line: 11, text: '            prev2, prev1 = prev1, curr' },
    { line: 12, text: '        return prev1' },
  ],

  'course-schedule': [
    { line: 1, text: 'class Solution:' },
    { line: 2, text: '    def canFinish(self, numCourses: int, prerequisites: List[List[int]]) -> bool:' },
    { line: 3, text: '        adj = {i: [] for i in range(numCourses)}' },
    { line: 4, text: '        indegree = [0] * numCourses' },
    { line: 5, text: '        ' },
    { line: 6, text: '        for crs, pre in prerequisites:' },
    { line: 7, text: '            adj[pre].append(crs)' },
    { line: 8, text: '            indegree[crs] += 1' },
    { line: 9, text: '            ' },
    { line: 10, text: '        queue = [i for i in range(numCourses) if indegree[i] == 0]' },
    { line: 11, text: '        visited = 0' },
    { line: 12, text: '        ' },
    { line: 13, text: '        while queue:' },
    { line: 14, text: '            node = queue.pop(0)' },
    { line: 15, text: '            visited += 1' },
    { line: 16, text: '            for neighbor in adj[node]:' },
    { line: 17, text: '                indegree[neighbor] -= 1' },
    { line: 18, text: '                if indegree[neighbor] == 0:' },
    { line: 19, text: '                    queue.append(neighbor)' },
    { line: 20, text: '                    ' },
    { line: 21, text: '        return visited == numCourses' },
  ],

  'max-depth-binary-tree': [
    { line: 1, text: 'class Solution:' },
    { line: 2, text: '    def maxDepth(self, root):' },
    { line: 3, text: '        if not root: return 0' },
    { line: 4, text: '        leftDepth  = self.maxDepth(root.left)' },
    { line: 5, text: '        rightDepth = self.maxDepth(root.right)' },
    { line: 6, text: '        return 1 + max(leftDepth, rightDepth)' },
  ],

  'minimum-window-substring': [
    { line: 1, text: 'class Solution:' },
    { line: 2, text: '    def minWindow(self, s: str, t: str) -> str:' },
    { line: 3, text: '        if not t or not s: return ""' },
    { line: 4, text: '        need = Counter(t)' },
    { line: 5, text: '        have = defaultdict(int)' },
    { line: 6, text: '        required = len(need)' },
    { line: 7, text: '        formed = 0' },
    { line: 8, text: '        left = 0' },
    { line: 9, text: '        best = (inf, 0, 0)' },
    { line: 10, text: '        for right, ch in enumerate(s):' },
    { line: 11, text: '            have[ch] += 1' },
    { line: 12, text: '            if ch in need and have[ch] == need[ch]:' },
    { line: 13, text: '                formed += 1' },
    { line: 14, text: '            while left <= right and formed == required:' },
    { line: 15, text: '                if right-left+1 < best[0]: best = (...)' },
    { line: 16, text: '                drop = s[left]' },
    { line: 17, text: '                have[drop] -= 1' },
    { line: 18, text: '                if drop in need and have[drop] < need[drop]: formed -= 1' },
    { line: 19, text: '                left += 1' },
    { line: 20, text: '        return s[l:r+1] if best found else ""' },
  ],

  // Add more problems here...
};

/**
 * Get solution code for a problem
 * @param {string} problemSlug - The problem slug
 * @returns {Array} Array of code line objects
 */
export function getSolutionCode(problemSlug) {
  return SOLUTION_CODE_REGISTRY[problemSlug] || [];
}

/**
 * Register solution code for a new problem
 * @param {string} problemSlug - The problem slug
 * @param {Array} codeLines - Array of code line objects
 */
export function registerSolutionCode(problemSlug, codeLines) {
  SOLUTION_CODE_REGISTRY[problemSlug] = codeLines;
}
