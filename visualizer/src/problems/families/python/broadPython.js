export const broadPython={
1870:`def solve(dist, hour):
    if hour <= len(dist) - 1:  # step: impossible
        return -1  # step: failed
    units = round(hour * 100)
    low, high = 1, 10_000_000
    while low < high:
        speed = (low + high) // 2
        whole = sum((distance + speed - 1) // speed for distance in dist[:-1])
        feasible = 100 * (whole * speed + dist[-1]) <= units * speed  # step: search
        if feasible:
            high = speed
        else:
            low = speed + 1
    return low  # step: return`,
1871:`def solve(s, minJump, maxJump):
    reachable = [False] * len(s)
    reachable[0] = True
    predecessors = 0
    for index in range(1, len(s)):
        if index >= minJump:
            predecessors += reachable[index - minJump]
        if index > maxJump:
            predecessors -= reachable[index - maxJump - 1]
        reachable[index] = s[index] == '0' and predecessors > 0  # step: update
    return reachable[-1]  # step: return`,
1872:`def solve(stones):
    from itertools import accumulate

    prefix = list(accumulate(stones))
    best = prefix[-1]
    for index in range(len(stones) - 2, 0, -1):
        best = max(best, prefix[index] - best)  # step: update
    return best  # step: return`,
1874:`def solve(nums1, nums2):
    answer = 0
    for first, second in zip(sorted(nums1), sorted(nums2, reverse=True)):
        answer += first * second  # step: update
    return answer  # step: return`,
1876:`def solve(s):
    answer = 0
    for end in range(2, len(s)):
        answer += len(set(s[end - 2:end + 1])) == 3  # step: update
    return answer  # step: return`,
1877:`def solve(nums):
    values = sorted(nums)
    maximum = 0
    for index in range(len(values) // 2):
        maximum = max(maximum, values[index] + values[-1 - index])  # step: update
    return maximum  # step: return`,
1879:`def solve(nums1, nums2):
    n = len(nums1)
    dp = [float('inf')] * (1 << n)
    dp[0] = 0
    for mask in range((1 << n) - 1):
        used = mask.bit_count()
        for index in range(n):
            if not mask & (1 << index):
                following = mask | (1 << index)
                dp[following] = min(dp[following], dp[mask] + (nums1[used] ^ nums2[index]))  # step: update
    return dp[-1]  # step: return`,
1880:`def solve(firstWord, secondWord, targetWord):
    def convert(word):
        value = 0
        for char in word:
            value = value * 10 + ord(char) - ord('a')  # step: convert
        return value
    return convert(firstWord) + convert(secondWord) == convert(targetWord)  # step: return`,
1881:`def solve(n, x):
    negative = n.startswith('-')
    index = 1 if negative else 0
    while index < len(n):
        digit = int(n[index])
        insert = digit > x if negative else digit < x  # step: search
        if insert:
            break
        index += 1
    return n[:index] + str(x) + n[index:]  # step: return`,
1882:`def solve(servers, tasks):
    free_at = [0] * len(servers)
    answer = []
    time = 0
    for index, duration in enumerate(tasks):
        time = max(time, index)
        available = [server for server in range(len(servers)) if free_at[server] <= time]
        if not available:
            time = min(free_at)
            available = [server for server in range(len(servers)) if free_at[server] <= time]
        server = min(available, key=lambda server: (servers[server], server))
        free_at[server] = time + duration
        answer.append(server)  # step: update
    return answer  # step: return`,
1884:`def solve(n):
    moves = covered = 0
    while covered < n:
        moves += 1
        covered += moves  # step: update
    return moves  # step: return`,
1885:`def solve(nums1, nums2):
    differences = sorted(a - b for a, b in zip(nums1, nums2))
    left, right = 0, len(differences) - 1
    answer = 0
    while left < right:
        if differences[left] + differences[right] > 0:
            answer += right - left  # step: accept
            right -= 1
        else:
            left += 1  # step: discard
    return answer  # step: return`,
1886:`def solve(mat, target):
    current = [row[:] for row in mat]
    for _ in range(4):
        if current == target:  # step: compare
            return True  # step: accepted
        current = [list(column) for column in zip(*current[::-1])]
    return False  # step: return`,
1887:`def solve(nums):
    values = sorted(nums)
    levels = answer = 0
    for index in range(1, len(values)):
        levels += values[index] != values[index - 1]
        answer += levels  # step: update
    return answer  # step: return`,
1888:`def solve(s):
    doubled = s + s
    n = len(s)
    mismatch = 0
    best = n
    for index, char in enumerate(doubled):
        mismatch += int(char) != index % 2
        if index >= n:
            mismatch -= int(doubled[index - n]) != (index - n) % 2
        if index >= n - 1:
            best = min(best, mismatch, n - mismatch)  # step: update
    return best  # step: return`,
1891:`def solve(ribbons, k):
    low, high = 0, max(ribbons)
    while low < high:
        length = (low + high + 1) // 2
        pieces = sum(ribbon // length for ribbon in ribbons)  # step: search
        if pieces >= k:
            low = length
        else:
            high = length - 1
    return low  # step: return`,
1893:`def solve(ranges, left, right):
    following = left
    for start, end in sorted(ranges):
        if end < following:
            continue
        if start > following:  # step: gap
            return False  # step: gapReturn
        following = max(following, end + 1)  # step: update
        if following > right:
            return True  # step: accepted
    return False  # step: return`,
1894:`def solve(chalk, k):
    k %= sum(chalk)  # step: reduce
    for index, needed in enumerate(chalk):
        if k < needed:  # step: compare
            return index  # step: return
        k -= needed`,
1897:`def solve(words):
    from collections import Counter

    counts = Counter(''.join(words))
    for count in counts.values():
        if count % len(words) != 0:  # step: compare
            return False  # step: rejected
    return True  # step: return`,
1898:`def solve(s, p, removable):
    when = [float('inf')] * len(s)
    for order, index in enumerate(removable):
        when[index] = order
    low, high = 0, len(removable)
    while low < high:
        removed = (low + high + 1) // 2
        matched = 0
        for index, char in enumerate(s):
            if matched < len(p) and when[index] >= removed and char == p[matched]:
                matched += 1
        feasible = matched == len(p)  # step: search
        if feasible:
            low = removed
        else:
            high = removed - 1
    return low  # step: return`,
1899:`def solve(triplets, target):
    best = [0, 0, 0]
    for triplet in triplets:
        usable = all(value <= limit for value, limit in zip(triplet, target))
        if usable:
            best = [max(current, value) for current, value in zip(best, triplet)]
        # step: update
    return best == target  # step: return`,
1905:`def solve(grid1, grid2):
    from collections import deque

    rows, columns = len(grid2), len(grid2[0])
    seen = set()
    answer = 0
    for row in range(rows):
        for column in range(columns):
            if not grid2[row][column] or (row, column) in seen:
                continue
            queue = deque([(row, column)])
            seen.add((row, column))
            contained = True
            while queue:
                y, x = queue.popleft()
                contained = contained and bool(grid1[y][x])  # step: visit
                for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    ny, nx = y + dy, x + dx
                    if 0 <= ny < rows and 0 <= nx < columns and grid2[ny][nx] and (ny, nx) not in seen:
                        seen.add((ny, nx))
                        queue.append((ny, nx))
            answer += contained  # step: update
    return answer  # step: return`,
1915:`def solve(word):
    previous = {0: 1}
    parity = answer = 0
    for char in word:
        parity ^= 1 << (ord(char) - ord('a'))
        added = previous.get(parity, 0)
        for bit in range(10):
            added += previous.get(parity ^ (1 << bit), 0)
        answer += added
        previous[parity] = previous.get(parity, 0) + 1  # step: update
    return answer  # step: return`,
};
export const broadPythonStages=Object.fromEntries(Object.entries(broadPython).map(([id,source])=>[id,
 Object.fromEntries(source.split('\n').flatMap((line,index)=>{const match=line.match(/# step: (\w+)/);return match?[[match[1],index+1]]:[];})),
]));
