// Complete Python functions. Parameter names match the JSON input editor.
export const collectionPython={
860:`def solve(bills):
    five = ten = 0
    for bill in bills:
        if bill == 5:
            five += 1
        elif bill == 10:
            five -= 1
            ten += 1
        elif ten:
            ten -= 1
            five -= 1
        else:
            five -= 3
        if five < 0:
            return False
    return True`,
861:`def solve(grid):
    a = [row[:] for row in grid]
    for row in a:
        if row[0] == 0:
            row[:] = [1 - bit for bit in row]
    for col in range(1, len(a[0])):
        if sum(row[col] for row in a) * 2 < len(a):
            for row in a:
                row[col] ^= 1
    return sum(int(''.join(map(str, row)), 2) for row in a)`,
868:`def solve(n):
    previous = None
    best = 0
    for index, bit in enumerate(bin(n)[2:]):
        if bit == '1':
            if previous is not None:
                best = max(best, index - previous)
            previous = index
    return best`,
869:`def solve(n):
    target = sorted(str(n))
    return any(sorted(str(1 << power)) == target
               for power in range(31))`,
881:`def solve(people, limit):
    people = sorted(people)
    left, right = 0, len(people) - 1
    boats = 0
    while left <= right:
        if left < right and people[left] + people[right] <= limit:
            left += 1
        right -= 1
        boats += 1
    return boats`,
883:`def solve(grid):
    top = sum(value > 0 for row in grid for value in row)
    front = sum(max(row) for row in grid)
    side = sum(max(column) for column in zip(*grid))
    return top + front + side`,
884:`from collections import Counter

def solve(s1, s2):
    counts = Counter((s1 + ' ' + s2).split())
    return [word for word, count in counts.items() if count == 1]`,
888:`def solve(aliceSizes, bobSizes):
    difference = (sum(aliceSizes) - sum(bobSizes)) // 2
    available = set(bobSizes)
    for alice in aliceSizes:
        bob = alice - difference
        if bob in available:
            return [alice, bob]
    raise ValueError('No balancing exchange exists')`,
890:`def solve(words, pattern):
    def matches(word):
        forward, reverse = {}, {}
        for a, b in zip(pattern, word):
            if a in forward and forward[a] != b:
                return False
            if b in reverse and reverse[b] != a:
                return False
            forward[a], reverse[b] = b, a
        return len(word) == len(pattern)
    return [word for word in words if matches(word)]`,
892:`def solve(grid):
    area = 0
    for r, row in enumerate(grid):
        for c, height in enumerate(row):
            if height:
                area += 2 + 4 * height
                if r:
                    area -= 2 * min(height, grid[r - 1][c])
                if c:
                    area -= 2 * min(height, grid[r][c - 1])
    return area`,
893:`def solve(words):
    groups = set()
    for word in words:
        groups.add((''.join(sorted(word[::2])),
                    ''.join(sorted(word[1::2]))))
    return len(groups)`,
898:`def solve(arr):
    ending, all_values = set(), set()
    for value in arr:
        ending = {value} | {previous | value for previous in ending}
        all_values.update(ending)
    return len(all_values)`,
899:`def solve(s, k):
    if k > 1:
        return ''.join(sorted(s))
    return min(s[index:] + s[:index] for index in range(len(s)))`,
901:`def solve(prices):
    stack, spans = [], []
    for price in prices:
        span = 1
        while stack and stack[-1][0] <= price:
            span += stack.pop()[1]
        stack.append((price, span))
        spans.append(span)
    return spans`,
904:`def solve(fruits):
    counts = {}
    left = best = 0
    for right, value in enumerate(fruits):
        counts[value] = counts.get(value, 0) + 1
        while len(counts) > 2:
            old = fruits[left]
            counts[old] -= 1
            if counts[old] == 0:
                del counts[old]
            left += 1
        best = max(best, right - left + 1)
    return best`,
908:`def solve(nums, k):
    return max(0, max(nums) - min(nums) - 2 * k)`,
914:`from collections import Counter
from math import gcd

def solve(deck):
    divisor = 0
    for frequency in Counter(deck).values():
        divisor = gcd(divisor, frequency)
    return divisor >= 2`,
915:`def solve(nums):
    boundary = 0
    left_max = seen_max = nums[0]
    for index in range(1, len(nums)):
        seen_max = max(seen_max, nums[index])
        if nums[index] < left_max:
            boundary = index
            left_max = seen_max
    return boundary + 1`,
917:`def solve(s):
    letters = list(s)
    left, right = 0, len(letters) - 1
    while left < right:
        if not letters[left].isalpha():
            left += 1
        elif not letters[right].isalpha():
            right -= 1
        else:
            letters[left], letters[right] = letters[right], letters[left]
            left += 1
            right -= 1
    return ''.join(letters)`,
918:`def solve(nums):
    total = max_end = min_end = 0
    best, worst = float('-inf'), float('inf')
    for value in nums:
        max_end = max(value, max_end + value)
        min_end = min(value, min_end + value)
        best, worst = max(best, max_end), min(worst, min_end)
        total += value
    return best if best < 0 else max(best, total - worst)`,
921:`def solve(s):
    opened = inserted = 0
    for char in s:
        if char == '(':
            opened += 1
        elif opened:
            opened -= 1
        else:
            inserted += 1
    return inserted + opened`,
925:`def solve(name, typed):
    matched = 0
    for index, char in enumerate(typed):
        if matched < len(name) and char == name[matched]:
            matched += 1
        elif index == 0 or char != typed[index - 1]:
            return False
    return matched == len(name)`,
926:`def solve(s):
    ones = flips = 0
    for bit in s:
        if bit == '1':
            ones += 1
        else:
            flips = min(flips + 1, ones)
    return flips`,
929:`def solve(emails):
    normalized = set()
    for email in emails:
        local, domain = email.split('@')
        local = local.split('+')[0].replace('.', '')
        normalized.add(local + '@' + domain)
    return len(normalized)`,
930:`def solve(nums, goal):
    counts = {0: 1}
    prefix = total = 0
    for value in nums:
        prefix += value
        total += counts.get(prefix - goal, 0)
        counts[prefix] = counts.get(prefix, 0) + 1
    return total`,
931:`def solve(matrix):
    dp = [row[:] for row in matrix]
    for row in range(1, len(dp)):
        for col in range(len(dp[0])):
            dp[row][col] += min(dp[row - 1][max(0, col - 1):col + 2])
    return min(dp[-1])`,
933:`def solve(times):
    head = 0
    counts = []
    for index, time in enumerate(times):
        while times[head] < time - 3000:
            head += 1
        counts.append(index - head + 1)
    return counts`,
941:`def solve(arr):
    index = 0
    while index + 1 < len(arr) and arr[index] < arr[index + 1]:
        index += 1
    if index == 0 or index == len(arr) - 1:
        return False
    while index + 1 < len(arr) and arr[index] > arr[index + 1]:
        index += 1
    return index == len(arr) - 1`,
942:`def solve(s):
    low, high = 0, len(s)
    output = []
    for instruction in s:
        if instruction == 'I':
            output.append(low)
            low += 1
        else:
            output.append(high)
            high -= 1
    return output + [low]`,
944:`def solve(strs):
    return sum(any(column[i] > column[i + 1]
                   for i in range(len(column) - 1))
               for column in zip(*strs))`,
945:`def solve(nums):
    values = sorted(nums)
    moves = 0
    for index in range(1, len(values)):
        required = max(values[index], values[index - 1] + 1)
        moves += required - values[index]
        values[index] = required
    return moves`,
946:`def solve(pushed, popped):
    stack = []
    index = 0
    for value in pushed:
        stack.append(value)
        while stack and index < len(popped) and stack[-1] == popped[index]:
            stack.pop()
            index += 1
    return index == len(popped)`,
948:`def solve(tokens, power):
    tokens = sorted(tokens)
    left, right = 0, len(tokens) - 1
    score = best = 0
    while left <= right:
        if power >= tokens[left]:
            power -= tokens[left]
            left += 1
            score += 1
            best = max(best, score)
        elif score and left < right:
            power += tokens[right]
            right -= 1
            score -= 1
        else:
            break
    return best`,
950:`def solve(deck):
    positions = list(range(len(deck)))
    output = [0] * len(deck)
    for card in sorted(deck):
        output[positions.pop(0)] = card
        if positions:
            positions.append(positions.pop(0))
    return output`,
953:`def solve(words, order):
    rank = {char: index for index, char in enumerate(order)}
    translated = [tuple(rank[char] for char in word) for word in words]
    return all(a <= b for a, b in zip(translated, translated[1:]))`,
961:`def solve(nums):
    seen = set()
    for value in nums:
        if value in seen:
            return value
        seen.add(value)
    raise ValueError('Input must contain the promised repeated value')`,
962:`def solve(nums):
    candidates = []
    for index, value in enumerate(nums):
        if not candidates or value < nums[candidates[-1]]:
            candidates.append(index)
    best = 0
    for right in range(len(nums) - 1, -1, -1):
        while candidates and nums[candidates[-1]] <= nums[right]:
            best = max(best, right - candidates.pop())
    return best`,
970:`def solve(x, y, bound):
    values = set()
    a = 1
    while a <= bound:
        b = 1
        while a + b <= bound:
            values.add(a + b)
            if y == 1:
                break
            b *= y
        if x == 1:
            break
        a *= x
    return sorted(values)`,
973:`def solve(points, k):
    return sorted(points, key=lambda p: p[0] ** 2 + p[1] ** 2)[:k]`,
974:`def solve(nums, k):
    counts = {0: 1}
    remainder = total = 0
    for value in nums:
        remainder = (remainder + value) % k
        total += counts.get(remainder, 0)
        counts[remainder] = counts.get(remainder, 0) + 1
    return total`,
976:`def solve(nums):
    sides = sorted(nums, reverse=True)
    for index in range(len(sides) - 2):
        a, b, c = sides[index:index + 3]
        if b + c > a:
            return a + b + c
    return 0`,
978:`def solve(arr):
    previous = 0
    length = best = 1
    for index in range(1, len(arr)):
        sign = (arr[index] > arr[index - 1]) - (arr[index] < arr[index - 1])
        length = 1 if sign == 0 else length + 1 if sign == -previous else 2
        best = max(best, length)
        previous = sign
    return best`,
983:`def solve(days, costs):
    dp = [0] * (len(days) + 1)
    for index in range(len(days) - 1, -1, -1):
        choices = []
        for duration, price in zip((1, 7, 30), costs):
            next_index = index
            while next_index < len(days) and days[next_index] < days[index] + duration:
                next_index += 1
            choices.append(price + dp[next_index])
        dp[index] = min(choices)
    return dp[0]`,
985:`def solve(nums, queries):
    nums = nums[:]
    even = sum(value for value in nums if value % 2 == 0)
    output = []
    for delta, index in queries:
        if nums[index] % 2 == 0:
            even -= nums[index]
        nums[index] += delta
        if nums[index] % 2 == 0:
            even += nums[index]
        output.append(even)
    return output`,
989:`def solve(num, k):
    output = []
    index = len(num) - 1
    carry = k
    while index >= 0 or carry:
        if index >= 0:
            carry += num[index]
        output.append(carry % 10)
        carry //= 10
        index -= 1
    return output[::-1]`,
991:`def solve(startValue, target):
    steps = 0
    while target > startValue:
        target = target + 1 if target % 2 else target // 2
        steps += 1
    return steps + startValue - target`,
997:`def solve(n, trust):
    incoming, outgoing = [0] * (n + 1), [0] * (n + 1)
    for a, b in trust:
        outgoing[a] += 1
        incoming[b] += 1
    return next((person for person in range(1, n + 1)
                 if incoming[person] == n - 1 and outgoing[person] == 0), -1)`,
999:`def solve(board):
    row, col = next((r, c) for r in range(8) for c in range(8)
                    if board[r][c] == 'R')
    captures = 0
    for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        r, c = row + dr, col + dc
        while 0 <= r < 8 and 0 <= c < 8:
            if board[r][c] != '.':
                captures += board[r][c] == 'p'
                break
            r, c = r + dr, c + dc
    return captures`,
1002:`from collections import Counter

def solve(words):
    common = Counter(words[0])
    for word in words[1:]:
        common &= Counter(word)
    return list(common.elements())`,
1005:`def solve(nums, k):
    values = sorted(nums)
    for index in range(len(values)):
        if values[index] >= 0 or k == 0:
            break
        values[index] = -values[index]
        k -= 1
    return sum(values) - (2 * min(values) if k % 2 else 0)`,
};
