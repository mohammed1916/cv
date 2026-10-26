export const rangePython={
1835:`def solve(arr1, arr2):
    first = second = 0
    for value in arr1:
        first ^= value  # step: first
    for value in arr2:
        second ^= value  # step: second
    return first & second  # step: return`,
1837:`def solve(n, k):
    answer = 0
    while n:
        answer += n % k  # step: update
        n //= k
    return answer  # step: return`,
1838:`def solve(nums, k):
    values = sorted(nums)
    left = total = best = 0
    for right, value in enumerate(values):
        total += value
        while value * (right - left + 1) - total > k:
            total -= values[left]
            left += 1
        best = max(best, right - left + 1)  # step: update
    return best  # step: return`,
1839:`def solve(word):
    start = groups = best = 0
    for index, char in enumerate(word):
        if index == 0 or char < word[index - 1]:
            start, groups = index, 1
        elif char > word[index - 1]:
            groups += 1
        if groups == 5:
            best = max(best, index - start + 1)
        # step: update
    return best  # step: return`,
1844:`def solve(s):
    answer = list(s)
    for index in range(1, len(s), 2):
        answer[index] = chr(ord(answer[index - 1]) + int(s[index]))  # step: update
    return ''.join(answer)  # step: return`,
1845:`def solve(n, operations):
    free = set(range(1, n + 1))
    answer = []
    for operation in operations:
        if operation[0] == 'reserve':
            seat = min(free)
            free.remove(seat)
            answer.append(seat)  # step: reserve
        else:
            free.add(operation[1])  # step: unreserve
    return answer  # step: return`,
1846:`def solve(arr):
    previous = 0
    for value in sorted(arr):
        previous = min(value, previous + 1)  # step: update
    return previous  # step: return`,
1848:`def solve(nums, target, start):
    best = len(nums)
    for index, value in enumerate(nums):
        if value == target:
            best = min(best, abs(index - start))
        # step: update
    return best  # step: return`,
1849:`def solve(s):
    def search(position, previous, parts):
        if position == len(s):
            return parts >= 2
        value = 0
        for end in range(position, len(s)):
            value = value * 10 + int(s[end])
            wanted = None if previous is None else previous - 1
            if wanted is not None and value > wanted:
                break
            if wanted is None or value == wanted:  # step: search
                if search(end + 1, value, parts + 1):
                    return True
        return False
    return search(0, None, 0)  # step: return`,
1851:`def solve(intervals, queries):
    ordered = sorted(intervals)
    active = []
    answer = [-1] * len(queries)
    next_interval = 0
    for query, index in sorted((value, index) for index, value in enumerate(queries)):
        while next_interval < len(ordered) and ordered[next_interval][0] <= query:
            active.append(ordered[next_interval])
            next_interval += 1
        active = [interval for interval in active if interval[1] >= query]
        active.sort(key=lambda interval: interval[1] - interval[0])
        answer[index] = active[0][1] - active[0][0] + 1 if active else -1  # step: update
    return answer  # step: return`,
1852:`def solve(nums, k):
    counts = {}
    answer = []
    for index, value in enumerate(nums):
        counts[value] = counts.get(value, 0) + 1
        if index >= k:
            old = nums[index - k]
            counts[old] -= 1
            if counts[old] == 0:
                del counts[old]
        if index >= k - 1:
            answer.append(len(counts))
        # step: update
    return answer  # step: return`,
1854:`def solve(logs):
    changes = {}
    for birth, death in logs:
        changes[birth] = changes.get(birth, 0) + 1
        changes[death] = changes.get(death, 0) - 1
    population = 0
    best = -1
    answer = 0
    for year in sorted(changes):
        population += changes[year]
        if population > best:
            best, answer = population, year
        # step: update
    return answer  # step: return`,
1855:`def solve(nums1, nums2):
    i = j = best = 0
    while i < len(nums1) and j < len(nums2):
        j = max(j, i)
        if j >= len(nums2):
            break
        if nums1[i] <= nums2[j]:
            best = max(best, j - i)  # step: extend
            j += 1
        else:
            i += 1  # step: shrink
    return best  # step: return`,
1856:`def solve(nums):
    prefix = [0]
    for value in nums:
        prefix.append(prefix[-1] + value)
    stack = []
    best = 0
    for right in range(len(nums) + 1):
        current = nums[right] if right < len(nums) else -1
        while stack and nums[stack[-1]] > current:
            index = stack.pop()
            left = stack[-1] + 1 if stack else 0
            product = (prefix[right] - prefix[left]) * nums[index]
            best = max(best, product)  # step: update
        if right < len(nums):
            stack.append(right)
    return best % 1_000_000_007  # step: return`,
1857:`def solve(colors, edges):
    from collections import deque

    n = len(colors)
    graph = [[] for _ in range(n)]
    indegree = [0] * n
    dp = [[0] * 26 for _ in range(n)]
    for source, target in edges:
        graph[source].append(target)
        indegree[target] += 1
    for index, color in enumerate(colors):
        dp[index][ord(color) - ord('a')] = 1
    ready = deque(index for index in range(n) if indegree[index] == 0)
    processed = best = 0
    while ready:
        source = ready.popleft()
        processed += 1
        best = max(best, max(dp[source]))
        for target in graph[source]:
            for color in range(26):
                increment = color == ord(colors[target]) - ord('a')
                dp[target][color] = max(dp[target][color], dp[source][color] + increment)
            indegree[target] -= 1
            if indegree[target] == 0:
                ready.append(target)
        # step: update
    if processed < n:  # step: cycle
        return -1  # step: failed
    return best  # step: return`,
1858:`def solve(words):
    available = set(words)
    best = ''
    for word in words:
        valid = all(word[:length] in available for length in range(1, len(word)))
        if valid and (len(word) > len(best) or len(word) == len(best) and word < best):
            best = word
        # step: update
    return best  # step: return`,
1859:`def solve(s):
    tokens = s.split()
    answer = [''] * len(tokens)
    for token in tokens:
        answer[int(token[-1]) - 1] = token[:-1]  # step: update
    return ' '.join(answer)  # step: return`,
1860:`def solve(memory1, memory2):
    second = 1
    while max(memory1, memory2) >= second:
        if memory1 >= memory2:
            memory1 -= second
        else:
            memory2 -= second
        second += 1  # step: update
    return [second, memory1, memory2]  # step: return`,
1861:`def solve(box):
    settled = [row[:] for row in box]
    rows, columns = len(box), len(box[0])
    for row in range(rows):
        empty = columns - 1
        for column in range(columns - 1, -1, -1):
            if settled[row][column] == '*':
                empty = column - 1
            elif settled[row][column] == '#':
                settled[row][column] = '.'
                settled[row][empty] = '#'
                empty -= 1
            # step: settle
    rotated = [['.'] * rows for _ in range(columns)]
    for row in range(rows):
        for column in range(columns):
            rotated[column][rows - 1 - row] = settled[row][column]  # step: rotate
    return rotated  # step: return`,
1863:`def solve(nums):
    bits = 0
    for value in nums:
        bits |= value  # step: update
    return bits * 2 ** (len(nums) - 1)  # step: return`,
1864:`def solve(s):
    ones = s.count('1')
    zeros = len(s) - ones
    if abs(ones - zeros) > 1:  # step: impossible
        return -1  # step: failed

    def swaps(start):
        mismatch = sum(int(char) != (start + index) % 2 for index, char in enumerate(s))
        return mismatch // 2  # step: compare

    if ones == zeros:
        answer = min(swaps(0), swaps(1))
    else:
        answer = swaps(1 if ones > zeros else 0)
    return answer  # step: return`,
1865:`def solve(nums1, nums2, operations):
    from collections import Counter

    values = nums2[:]
    counts = Counter(values)
    answer = []
    for operation in operations:
        if operation[0] == 'add':
            _, index, increment = operation
            counts[values[index]] -= 1
            values[index] += increment
            counts[values[index]] += 1  # step: add
        else:
            target = operation[1]
            answer.append(sum(counts[target - value] for value in nums1))  # step: count
    return answer  # step: return`,
1866:`def solve(n, k):
    modulo = 1_000_000_007
    dp = [0] * (k + 1)
    dp[0] = 1
    for size in range(1, n + 1):
        following = [0] * (k + 1)
        for visible in range(1, min(size, k) + 1):
            following[visible] = (dp[visible - 1] + (size - 1) * dp[visible]) % modulo
        dp = following  # step: update
    return dp[k]  # step: return`,
1868:`def solve(encoded1, encoded2):
    answer = []
    i = j = 0
    left, right = encoded1[0][1], encoded2[0][1]
    while i < len(encoded1) and j < len(encoded2):
        length = min(left, right)
        product = encoded1[i][0] * encoded2[j][0]
        if answer and answer[-1][0] == product:
            answer[-1][1] += length
        else:
            answer.append([product, length])
        # step: update
        left -= length
        right -= length
        if left == 0:
            i += 1
            if i < len(encoded1):
                left = encoded1[i][1]
        if right == 0:
            j += 1
            if j < len(encoded2):
                right = encoded2[j][1]
    return answer  # step: return`,
1869:`def solve(s):
    run = longest_zero = longest_one = 0
    for index, char in enumerate(s):
        run = run + 1 if index and s[index - 1] == char else 1
        if char == '0':
            longest_zero = max(longest_zero, run)
        else:
            longest_one = max(longest_one, run)
        # step: update
    return longest_one > longest_zero  # step: return`,
};

export const rangePythonStages=Object.fromEntries(Object.entries(rangePython).map(([id,source])=>[id,
 Object.fromEntries(source.split('\n').flatMap((line,index)=>{const match=line.match(/# step: (\w+)/);return match?[[match[1],index+1]]:[];})),
]));
