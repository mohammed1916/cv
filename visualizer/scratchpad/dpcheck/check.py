import json, itertools, random
from collections import deque
DATA = "/Volumes/S/Development/a/competitive_programming_visualisations/visualizer/scratchpad/dpcheck/extract.json"
data = json.load(open(DATA))
MOD = 10**9 + 7
ns = {}
for spec in data.values():
    exec(spec["python"], ns)
all_ok = True

for name, spec in data.items():
    fn = ns[spec["fn"]]
    for case in spec["cases"]:
        got = fn(**case["input"])
        same = got == case["expected"]
        all_ok &= same
        print(name, json.dumps(case["input"]), "python", got, "node", case["expected"], "OK" if same else "MISMATCH")

def brute_2745(x, y, z):
    best = 0
    for i in range(x + 1):
        for j in range(y + 1):
            for k in range(z + 1):
                for perm in set(itertools.permutations(["AA"] * i + ["BB"] * j + ["AB"] * k)):
                    s = "".join(perm)
                    if "AAA" not in s and "BBB" not in s:
                        best = max(best, len(s))
    return best

def brute_2617(grid):
    m, n = len(grid), len(grid[0])
    INF = float("inf")
    d = [[INF] * n for _ in range(m)]
    d[0][0] = 1
    q = deque([(0, 0)])
    while q:
        r, c = q.popleft()
        for k in range(c + 1, min(n - 1, c + grid[r][c]) + 1):
            if d[r][k] > d[r][c] + 1:
                d[r][k] = d[r][c] + 1; q.append((r, k))
        for k in range(r + 1, min(m - 1, r + grid[r][c]) + 1):
            if d[k][c] > d[r][c] + 1:
                d[k][c] = d[r][c] + 1; q.append((k, c))
    return -1 if d[m - 1][n - 1] == INF else d[m - 1][n - 1]

def brute_3287(nums, k):
    best = 0
    for idx in itertools.combinations(range(len(nums)), 2 * k):
        seq = [nums[i] for i in idx]
        a = b = 0
        for v in seq[:k]: a |= v
        for v in seq[k:]: b |= v
        best = max(best, a ^ b)
    return best

def brute_2552(nums):
    return sum(1 for i, j, k, l in itertools.combinations(range(len(nums)), 4) if nums[i] < nums[k] < nums[j] < nums[l])

def brute_partitions(nums, closed_only_distinct):
    n = len(nums); cnt = 0
    for mask in range(1 << (n - 1)):
        cuts = [0] + [i + 1 for i in range(n - 1) if mask >> i & 1] + [n]
        segs = [nums[cuts[t]:cuts[t + 1]] for t in range(len(cuts) - 1)]
        if closed_only_distinct(segs):
            cnt += 1
    return cnt % MOD

def brute_2963(nums):
    return brute_partitions(nums, lambda segs: all(not (set(a) & set(b)) for a, b in itertools.combinations(segs, 2)))

def brute_2750(nums):
    return brute_partitions(nums, lambda segs: all(sum(s) == 1 for s in segs))

def brute_3101(nums):
    return sum(1 for i in range(len(nums)) for j in range(i, len(nums)) if all(nums[t] != nums[t + 1] for t in range(i, j)))

def brute_3290(a, b):
    return max(sum(a[t] * b[idx[t]] for t in range(4)) for idx in itertools.combinations(range(len(b)), 4))

def brute_2606(s, chars, vals):
    custom = dict(zip(chars, vals))
    return max(0, max(sum(custom.get(c, ord(c) - 96) for c in s[i:j]) for i in range(len(s)) for j in range(i, len(s) + 1)))

def check(label, fast, slow, gen, trials=60):
    global all_ok
    for _ in range(trials):
        args = gen()
        a, b = fast(*args), slow(*args)
        if a != b:
            all_ok = False
            print("MISMATCH", label, args, "python", a, "brute", b)
            return
    print("random", label, trials, "cases ok")

rnd = random.Random(7)
check("2745", ns["longestNewString"], brute_2745,
      lambda: (rnd.randint(1, 3), rnd.randint(1, 3), rnd.randint(1, 3)), trials=40)
check("2617", ns["minVisitedCells"], brute_2617,
      lambda: ([[rnd.randint(0, 4) for _ in range(rnd.randint(1, 4))] for _ in range(1)] and None) or None) if False else None
def gen_grid():
    m, n = rnd.randint(1, 4), rnd.randint(1, 4)
    return ([[rnd.randint(0, 4) for _ in range(n)] for _ in range(m)],)
check("2617", ns["minVisitedCells"], brute_2617, gen_grid)
check("3287", ns["maxSequenceValue"], brute_3287,
      lambda: (lambda n: ([rnd.randint(1, 26) for _ in range(n)], rnd.randint(1, n // 2)))(rnd.randint(2, 9)))
check("2552", ns["countIncreasingQuadruplets"], brute_2552,
      lambda: (rnd.sample(range(1, 9), rnd.randint(4, 8)),))
check("2963", ns["countGoodPartitions"], brute_2963,
      lambda: ([rnd.randint(1, 4) for _ in range(rnd.randint(1, 8))],))
check("2750", ns["goodSplits"], brute_2750,
      lambda: ([rnd.randint(0, 1) for _ in range(rnd.randint(1, 8))],))
check("3101", ns["countAlternatingSubarrays"], brute_3101,
      lambda: ([rnd.randint(0, 1) for _ in range(rnd.randint(1, 8))],))
check("3290", ns["maxMultiplicationScore"], brute_3290,
      lambda: ([rnd.randint(-5, 5) for _ in range(4)], [rnd.randint(-5, 5) for _ in range(rnd.randint(4, 8))]))
check("2606", ns["maximumCostSubstring"], brute_2606,
      lambda: ("".join(rnd.choice("abcd") for _ in range(rnd.randint(1, 8))), "bd", [rnd.randint(-5, 5), rnd.randint(-5, 5)]))
print("ALL OK" if all_ok else "FAILURES")
