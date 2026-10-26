// Complete Python solutions, using the same named fields as the JSON examples.
export const laterPython = {
1401: `def solve(radius, xCenter, yCenter, x1, y1, x2, y2):
    nearest_x = min(max(xCenter, x1), x2)
    nearest_y = min(max(yCenter, y1), y2)
    return (xCenter - nearest_x) ** 2 + (yCenter - nearest_y) ** 2 <= radius ** 2`,
1402: `def solve(satisfaction):
    suffix_sum = answer = 0
    for value in sorted(satisfaction, reverse=True):
        if suffix_sum + value <= 0:
            break
        suffix_sum += value
        answer += suffix_sum
    return answer`,
1403: `def solve(nums):
    remaining = sum(nums)
    selected_sum = 0
    selected = []
    for value in sorted(nums, reverse=True):
        selected.append(value)
        selected_sum += value
        remaining -= value
        if selected_sum > remaining:
            break
    return selected`,
1404: `def solve(s):
    steps = carry = 0
    for index in range(len(s) - 1, 0, -1):
        bit = int(s[index]) + carry
        if bit == 1:
            steps += 2
            carry = 1
        else:
            steps += 1
    return steps + carry`,
1405: `def solve(a, b, c):
    import heapq

    heap = [(-count, letter) for count, letter in [(a, 'a'), (b, 'b'), (c, 'c')] if count]
    heapq.heapify(heap)
    answer = []
    while heap:
        count, letter = heapq.heappop(heap)
        if len(answer) >= 2 and answer[-1] == answer[-2] == letter:
            if not heap:
                break
            other_count, other_letter = heapq.heappop(heap)
            answer.append(other_letter)
            if other_count + 1 < 0:
                heapq.heappush(heap, (other_count + 1, other_letter))
            heapq.heappush(heap, (count, letter))
        else:
            answer.append(letter)
            if count + 1 < 0:
                heapq.heappush(heap, (count + 1, letter))
    return ''.join(answer)`,
1406: `def solve(stoneValue):
    n = len(stoneValue)
    dp = [0] * (n + 1)
    for index in range(n - 1, -1, -1):
        taken = 0
        dp[index] = float('-inf')
        for end in range(index, min(index + 3, n)):
            taken += stoneValue[end]
            dp[index] = max(dp[index], taken - dp[end + 1])
    return 'Alice' if dp[0] > 0 else 'Bob' if dp[0] < 0 else 'Tie'`,
1408: `def solve(words):
    return [word for index, word in enumerate(words)
            if any(index != other_index and word in other
                   for other_index, other in enumerate(words))]`,
1409: `def solve(queries, m):
    permutation = list(range(1, m + 1))
    answer = []
    for value in queries:
        index = permutation.index(value)
        answer.append(index)
        permutation.pop(index)
        permutation.insert(0, value)
    return answer`,
1410: `def solve(text):
    entities = {'&quot;': chr(34), '&apos;': chr(39), '&amp;': '&',
                '&gt;': '>', '&lt;': '<', '&frasl;': '/'}
    answer = []
    index = 0
    while index < len(text):
        match = next((key for key in entities if text.startswith(key, index)), None)
        if match is None:
            answer.append(text[index])
            index += 1
        else:
            answer.append(entities[match])
            index += len(match)
    return ''.join(answer)`,
1411: `def solve(n):
    modulo = 1_000_000_007
    two_colors = three_colors = 6
    for _ in range(1, n):
        two_colors, three_colors = ((3 * two_colors + 2 * three_colors) % modulo,
                                    (2 * two_colors + 2 * three_colors) % modulo)
    return (two_colors + three_colors) % modulo`,
1413: `def solve(nums):
    prefix = minimum = 0
    for value in nums:
        prefix += value
        minimum = min(minimum, prefix)
    return 1 - minimum`,
1414: `def solve(k):
    fibonacci = [1, 2]
    while fibonacci[-1] < k:
        fibonacci.append(fibonacci[-1] + fibonacci[-2])
    count = 0
    for value in reversed(fibonacci):
        if value <= k:
            k -= value
            count += 1
    return count`,
1415: `def solve(n, k):
    def generate(prefix):
        if len(prefix) == n:
            yield prefix
            return
        for letter in 'abc':
            if not prefix or letter != prefix[-1]:
                yield from generate(prefix + letter)

    for rank, word in enumerate(generate(''), 1):
        if rank == k:
            return word
    return ''`,
1417: `def solve(s):
    letters = [char for char in s if char.isalpha()]
    digits = [char for char in s if char.isdigit()]
    if abs(len(letters) - len(digits)) > 1:
        return ''
    if len(digits) > len(letters):
        letters, digits = digits, letters
    answer = []
    for index, char in enumerate(letters):
        answer.append(char)
        if index < len(digits):
            answer.append(digits[index])
    return ''.join(answer)`,
1418: `def solve(orders):
    from collections import Counter, defaultdict

    foods = sorted({food for _, _, food in orders})
    tables = defaultdict(Counter)
    for _, table, food in orders:
        tables[table][food] += 1
    return [['Table'] + foods] + [
        [table] + [str(tables[table][food]) for food in foods]
        for table in sorted(tables, key=int)
    ]`,
1419: `def solve(croakOfFrogs):
    waiting = [0] * 4
    active = maximum = 0
    for char in croakOfFrogs:
        stage = 'croak'.find(char)
        if stage == -1:
            return -1
        if stage == 0:
            waiting[0] += 1
            active += 1
            maximum = max(maximum, active)
        else:
            if waiting[stage - 1] == 0:
                return -1
            waiting[stage - 1] -= 1
            if stage == 4:
                active -= 1
            else:
                waiting[stage] += 1
    return maximum if active == 0 else -1`,
1422: `def solve(s):
    left_zeros = 0
    right_ones = s.count('1')
    best = 0
    for char in s[:-1]:
        left_zeros += char == '0'
        right_ones -= char == '1'
        best = max(best, left_zeros + right_ones)
    return best`,
1423: `def solve(cardPoints, k):
    current = sum(cardPoints[:k])
    best = current
    for count in range(1, k + 1):
        current += cardPoints[-count] - cardPoints[k - count]
        best = max(best, current)
    return best`,
1424: `def solve(nums):
    entries = [(row + column, -row, value)
               for row, values in enumerate(nums)
               for column, value in enumerate(values)]
    return [value for _, _, value in sorted(entries)]`,
1426: `def solve(arr):
    present = set(arr)
    return sum(value + 1 in present for value in arr)`,
1427: `def solve(s, shift):
    offset = sum(amount if direction == 1 else -amount for direction, amount in shift) % len(s)
    return s[-offset:] + s[:-offset] if offset else s`,
1433: `def solve(s1, s2):
    pairs = list(zip(sorted(s1), sorted(s2)))
    return all(a >= b for a, b in pairs) or all(a <= b for a, b in pairs)`,
1436: `def solve(paths):
    departures = {origin for origin, _ in paths}
    return next(destination for _, destination in paths if destination not in departures)`,
1437: `def solve(nums, k):
    previous = -k - 1
    for index, value in enumerate(nums):
        if value == 1:
            if index - previous - 1 < k:
                return False
            previous = index
    return True`,
1438: `def solve(nums, limit):
    from collections import deque

    minimum = deque()
    maximum = deque()
    left = best = 0
    for right, value in enumerate(nums):
        while minimum and nums[minimum[-1]] > value:
            minimum.pop()
        while maximum and nums[maximum[-1]] < value:
            maximum.pop()
        minimum.append(right)
        maximum.append(right)
        while nums[maximum[0]] - nums[minimum[0]] > limit:
            if minimum[0] == left:
                minimum.popleft()
            if maximum[0] == left:
                maximum.popleft()
            left += 1
        best = max(best, right - left + 1)
    return best`,
1441: `def solve(target, n):
    answer = []
    wanted = 0
    for value in range(1, n + 1):
        if wanted == len(target):
            break
        answer.append('Push')
        if value == target[wanted]:
            wanted += 1
        else:
            answer.append('Pop')
    return answer`,
1442: `def solve(arr):
    answer = 0
    for left in range(len(arr)):
        xor = 0
        for right in range(left, len(arr)):
            xor ^= arr[right]
            if xor == 0:
                answer += right - left
    return answer`,
1446: `def solve(s):
    run = best = 0
    previous = None
    for char in s:
        run = run + 1 if char == previous else 1
        previous = char
        best = max(best, run)
    return best`,
1447: `def solve(n):
    from math import gcd

    return [str(numerator) + '/' + str(denominator)
            for denominator in range(2, n + 1)
            for numerator in range(1, denominator)
            if gcd(numerator, denominator) == 1]`,
1450: `def solve(startTime, endTime, queryTime):
    return sum(start <= queryTime <= end for start, end in zip(startTime, endTime))`,
1451: `def solve(text):
    words = sorted(text.lower().split(), key=len)
    answer = ' '.join(words)
    return answer[0].upper() + answer[1:]`,
1455: `def solve(sentence, searchWord):
    for index, word in enumerate(sentence.split(), 1):
        if word.startswith(searchWord):
            return index
    return -1`,
1456: `def solve(s, k):
    vowels = set('aeiou')
    count = best = 0
    for index, char in enumerate(s):
        count += char in vowels
        if index >= k:
            count -= s[index - k] in vowels
        if index >= k - 1:
            best = max(best, count)
    return best`,
1460: `def solve(target, arr):
    from collections import Counter

    return Counter(target) == Counter(arr)`,
1461: `def solve(s, k):
    if len(s) - k + 1 < 2 ** k:
        return False
    seen = {s[index:index + k] for index in range(len(s) - k + 1)}
    return len(seen) == 2 ** k`,
1464: `def solve(nums):
    first, second = sorted(nums, reverse=True)[:2]
    return (first - 1) * (second - 1)`,
1465: `def solve(h, w, horizontalCuts, verticalCuts):
    horizontal = [0] + sorted(horizontalCuts) + [h]
    vertical = [0] + sorted(verticalCuts) + [w]
    height = max(b - a for a, b in zip(horizontal, horizontal[1:]))
    width = max(b - a for a, b in zip(vertical, vertical[1:]))
    return height * width % 1_000_000_007`,
1470: `def solve(nums, n):
    return [value for pair in zip(nums[:n], nums[n:]) for value in pair]`,
1471: `def solve(arr, k):
    median = sorted(arr)[(len(arr) - 1) // 2]
    return sorted(arr, key=lambda value: (abs(value - median), value), reverse=True)[:k]`,
1475: `def solve(prices):
    answer = prices[:]
    stack = []
    for index, price in enumerate(prices):
        while stack and prices[stack[-1]] >= price:
            answer[stack.pop()] -= price
        stack.append(index)
    return answer`,
};
