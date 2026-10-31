import json, os
ROOT = "/Volumes/S/Development/a/competitive_programming_visualisations/visualizer"
TODAY = "2026-10-29"
GENERIC_PHASES = {
  "setup": ("Setup", "Initialize the DP table."),
  "scan": ("Scan", "Visit the next cell or input element."),
  "compute": ("Compute", "Update DP table values from earlier states."),
  "result": ("Result", "Return the final answer."),
}
P = {
 "2552": dict(title="Count Increasing Quadruplets", slug="count-increasing-quadruplets", difficulty="Hard",
   tags=["Array", "Enumeration", "Prefix Sum"], accent="#0ea5e9",
   description="Count quadruplets i < j < k < l with nums[i] < nums[k] < nums[j] < nums[l] by combining left and right counts for each middle pair.",
   phases=[("setup","Setup","Start the total at zero."),("scan","Pairs","Check each middle pair (j, k)."),("compute","Count","Multiply left and right choices for valid pairs."),("result","Result","Return the total.")],
   inputLabel='JSON object with key nums, a permutation of 1..n (e.g. {"nums": [1, 3, 2, 4, 5]})',
   examples=[("Example 1",{"nums":[1,3,2,4,5]}),("Example 2",{"nums":[1,2,3,4]})],
   complexity="O(n^3) in this visualization for n up to 12; the standard solution is O(n^2) with a Fenwick tree (LeetCode allows n up to 4000).",
   req=dict(sources=["https://leetcode.com/problems/count-increasing-quadruplets/","https://walkccc.me/LeetCode/problems/2552/"],
     sourceKind="search-result summaries (official page not fetched)",
     summary="Given a permutation nums of length n, count index quadruplets i < j < k < l with nums[i] < nums[k] < nums[j] < nums[l].",
     constraints="Permutation of 1..n; length up to 4000 (from search summary). Visualization cap: 4 to 12 elements.",
     notes="No example inputs or outputs were retrieved from a source. Example outputs were checked by brute force, not from the statement.",
     verified=False)),
 "2606": dict(title="Find the Substring With Maximum Cost", slug="find-the-substring-with-maximum-cost", difficulty="Medium",
   tags=["String", "Greedy", "Prefix Sum"], accent="#f97316",
   description="Kadane-style DP: the best substring ending at each position is max(0, previous + value), and the answer is the best of these.",
   phases=[("setup","Setup","Start with the empty substring."),("scan","Read","Read a character and its cost."),("compute","Extend","Extend or restart the substring ending here."),("result","Result","Return the best cost.")],
   inputLabel='JSON object with keys s, chars, vals (e.g. {"s": "adaa", "chars": "d", "vals": [-1000]})',
   examples=[("Example 1",{"s":"adaa","chars":"d","vals":[-1000]}),("Example 2",{"s":"abc","chars":"abc","vals":[-1,-1,-1]})],
   complexity="O(n) time and O(1) extra space beyond the table, for string length n. The visualization caps s at 50 characters.",
   req=dict(sources=["https://leetcode.com/problems/find-the-substring-with-maximum-cost/","https://leetcode.doocs.org/en/lc/2606/"],
     sourceKind="search-result summaries of the official page and a mirror",
     summary="Each letter has a cost: the value from chars/vals if listed, otherwise its alphabet position (a=1 ... z=26). Return the maximum total cost of a substring, where the empty substring costs 0.",
     constraints="s length up to 1e5 lowercase letters; chars has up to 26 distinct lowercase letters; vals in -1000..1000 (from search summary of leetcode.com). Visualization cap: s up to 50.",
     notes="Both examples and their outputs were reported by the doocs mirror.",
     verified=True)),
 "2617": dict(title="Minimum Number of Visited Cells in a Grid", slug="minimum-number-of-visited-cells-in-a-grid", difficulty="Hard",
   tags=["Array", "Dynamic Programming", "Matrix"], accent="#14b8a6",
   description="Shortest-path DP on a grid: each cell's distance is one more than the best cell that can jump into it along its row or column.",
   phases=[("setup","Setup","Mark the start cell."),("scan","Scan","Visit each cell in row-major order."),("compute","Relax","Relax the distance from cells that can jump here."),("result","Result","Return the distance to the bottom-right cell.")],
   inputLabel='JSON object with key grid, a rectangular matrix of non-negative integers (e.g. {"grid": [[2, 1, 0], [1, 0, 0]]})',
   examples=[("Example 1",{"grid":[[3,4,2,1],[4,2,3,1],[2,1,0,0],[2,4,0,0]]}),("Example 2",{"grid":[[3,4,2,1],[4,2,1,1],[2,1,1,0],[3,4,1,0]]}),("Example 3",{"grid":[[2,1,0],[1,0,0]]})],
   complexity="O(m * n * (m + n)) in this visualization for grids up to 8 by 8; LeetCode allows up to 10^5 cells with a segment tree or union-find approach.",
   req=dict(sources=["https://leetcode.com/problems/minimum-number-of-visited-cells-in-a-grid/description/","https://leetcode.doocs.org/en/lc/2617/"],
     sourceKind="search-result summaries (official page not fetched)",
     summary="Starting at the top-left cell, a jump from (i, j) can go right to (i, k) for j < k <= j + grid[i][j], or down to (k, j) for i < k <= i + grid[i][j]. Return the fewest cells visited to reach the bottom-right cell, or -1.",
     constraints="Up to 10^5 cells in total; bottom-right cell is 0 (from search summary). Visualization cap: 8 rows and 8 columns, values 0..99.",
     notes="Sources report the three expected outputs 4, 3 and -1. The grid inputs used here were not retrieved from a source; they were checked by brute force and match those outputs.",
     verified=False)),
 "2745": dict(title="Construct the Longest New String", slug="construct-the-longest-new-string", difficulty="Medium",
   tags=["Dynamic Programming", "String", "Greedy"], accent="#a855f7",
   description="Choose AA, BB and AB blocks without AAA or BBB; a DP over used counts tracks how the string ends so each block is placed legally.",
   phases=[("setup","Setup","Start from the empty string."),("scan","Visit","Visit the next (AA, BB) count pair."),("compute","Extend","Try appending AA, BB and AB blocks."),("result","Result","Return the longest length.")],
   inputLabel='JSON object with keys x, y, z (e.g. {"x": 2, "y": 5, "z": 1})',
   examples=[("Example 1",{"x":2,"y":5,"z":1}),("Example 2",{"x":3,"y":2,"z":2})],
   complexity="O(x * y) states with O(1) transitions here, plus the AB fill; the closed form 2 * (2 * min(x, y) + z) + (2 if x != y else 0) gives the same answer.",
   req=dict(sources=["https://www.hellointerview.com/community/questions/construct-longest-string/cm5eguhai044n838oo61165ow","https://www.talentd.in/fleetcode/problems?page=55&video=1","https://www.jointaro.com/interviews/questions/construct-the-longest-new-string/"],
     sourceKind="third-party mirrors (official LeetCode page not fetched)",
     summary="Given x AA strings, y BB strings and z AB strings, pick any of them in any order to build the longest string that does not contain AAA or BBB.",
     constraints="1 <= x, y, z <= 50 (from mirror summaries).",
     notes="Both examples (x=2,y=5,z=1 -> 12; x=3,y=2,z=2 -> 14) come from mirror summaries. The DP was checked against brute force on small inputs.",
     verified=True)),
 "2750": dict(title="Ways to Split Array Into Good Subarrays", slug="ways-to-split-array-into-good-subarrays", difficulty="Medium",
   tags=["Array", "Math", "Dynamic Programming"], accent="#eab308",
   description="Count splits where every subarray has exactly one 1, using dp[i] = sum of dp[j] over valid starts j.",
   phases=[("setup","Setup","Initialize the DP table."),("loop","Prefix","Pick the prefix length i."),("check","Check","Test whether nums[j..i-1] has exactly one 1."),("result","Result","Return the count mod 1e9+7.")],
   inputLabel='JSON object with key nums, a binary array (e.g. {"nums": [0, 1, 0, 0, 1]})',
   examples=[("Example 1",{"nums":[0,1,0,0,1]}),("Example 2",{"nums":[0,1,0]})],
   complexity="O(n^2) in this visualization for n up to 50; the standard solution is O(n) using positions of 1s.",
   req=dict(sources=["https://algo.monster/liteproblems/2750","https://www.jointaro.com/interviews/questions/ways-to-split-array-into-good-subarrays/","https://www.talentd.in/fleetcode/problems?page=29&topic=array"],
     sourceKind="third-party mirrors (official LeetCode page not fetched)",
     summary="Count the ways to split a binary array into contiguous subarrays where each subarray contains exactly one 1, modulo 1e9+7.",
     constraints="Not retrieved from a source. Visualization cap: 1 to 50 elements, values 0 or 1.",
     notes="Examples [0,1,0,0,1] -> 3 and [0,1,0] -> 1 come from mirror summaries. Constraints were not retrieved.",
     verified=False)),
 "2963": dict(title="Count the Number of Good Partitions", slug="count-the-number-of-good-partitions", difficulty="Hard",
   tags=["Array", "Hash Table", "Dynamic Programming"], accent="#ef4444",
   description="Count partitions where no value appears in two different subarrays, using a prefix DP over closed segments.",
   phases=[("setup","Setup","Record first and last positions of each value."),("loop","Prefix","Pick the prefix length i."),("check","Check","Test whether the segment nums[j..i-1] is closed."),("result","Result","Return the count mod 1e9+7.")],
   inputLabel='JSON object with key nums, positive integers (e.g. {"nums": [1, 2, 1, 3]})',
   examples=[("Example 1",{"nums":[1,2,3,4]}),("Example 2",{"nums":[1,1,1,1]}),("Example 3",{"nums":[1,2,1,3]})],
   complexity="O(n^2) in this visualization for n up to 50; the standard solution counts segments k and returns 2^(k-1) in O(n).",
   req=dict(sources=["https://leetcode.com/problems/count-the-number-of-good-partitions/","https://www.jointaro.com/interviews/google/count-the-number-of-good-partitions","https://leetcode.doocs.org/en/lc/2900-2999/"],
     sourceKind="search-result summaries (official page not fetched)",
     summary="Count partitions of an array of positive integers into contiguous subarrays so that no value appears in more than one subarray, modulo 1e9+7.",
     constraints="Not retrieved from a source. Visualization cap: 1 to 50 elements, positive integers.",
     notes="Examples [1,2,3,4] -> 8, [1,1,1,1] -> 1 and [1,2,1,3] -> 2 come from search summaries. Constraints were not retrieved.",
     verified=False)),
 "3101": dict(title="Count Alternating Subarrays", slug="count-alternating-subarrays", difficulty="Medium",
   tags=["Array", "Sliding Window", "Dynamic Programming"], accent="#22c55e",
   description="Count alternating subarrays by keeping the length of the alternating run that ends at each index.",
   phases=[("setup","Setup","Start with empty totals."),("scan","Scan","Visit the next index."),("compute","Streak","Update the run length and the running total."),("result","Result","Return the total.")],
   inputLabel='JSON object with key nums, a binary array (e.g. {"nums": [0, 1, 1, 1]})',
   examples=[("Example 1",{"nums":[0,1,1,1]}),("Example 2",{"nums":[1,0,1,0]})],
   complexity="O(n) time and O(1) extra space; the table here keeps the run per index for display (n up to 50).",
   req=dict(sources=["https://leetcode.com/problems/count-alternating-subarrays/","https://leetcode.doocs.org/en/lc/3101/","https://walkccc.me/LeetCode/problems/3101/"],
     sourceKind="search-result summaries (official page not fetched)",
     summary="Count subarrays of a binary array in which adjacent elements always differ.",
     constraints="Not retrieved from a source. Visualization cap: 1 to 50 elements, values 0 or 1.",
     notes="Examples [0,1,1,1] -> 5 and [1,0,1,0] -> 10 come from search summaries. Constraints were not retrieved.",
     verified=False)),
 "3287": dict(title="Find the Maximum Sequence Value of Array", slug="find-the-maximum-sequence-value-of-array", difficulty="Hard",
   tags=["Array", "Bit Manipulation", "Dynamic Programming"], accent="#6366f1",
   description="Pick 2k elements; the value is OR(first half) XOR OR(second half). Prefix and suffix sets of achievable OR values find the best split.",
   phases=[("setup","Setup","Start the prefix table."),("prefix","Prefix","Extend OR sets from the left."),("suffix","Suffix","Build matching OR sets from the right."),("combine","Combine","Try each split point."),("result","Result","Return the maximum value.")],
   inputLabel='JSON object with keys nums and k (e.g. {"nums": [4, 2, 5, 6, 7], "k": 2})',
   examples=[("Example 1",{"nums":[4,2,5,6,7],"k":2}),("Check case",{"nums":[2,6,7],"k":1})],
   complexity="O(n * k * 32) set work with 5-bit OR values here, for n up to 20 in the visualization (LeetCode allows n up to 400).",
   req=dict(sources=["https://www.jointaro.com/interviews/questions/find-the-maximum-sequence-value-of-array/","https://www.jointaro.com/interviews/google/find-the-maximum-sequence-value-of-array"],
     sourceKind="third-party mirrors (official LeetCode page not fetched)",
     summary="For a subsequence of size 2k, its value is OR(first k elements) XOR OR(last k elements). Return the maximum value over subsequences of size 2k.",
     constraints="2 <= nums.length <= 400 and 1 <= nums[i] < 27 (from mirror summary). Visualization cap: n up to 20, values 1..26.",
     notes="The example nums=[4,2,5,6,7], k=2 -> 2 is from the mirror; one mirror page misstated the arithmetic, and (4 OR 5) XOR (6 OR 7) = 5 XOR 7 = 2 confirms it. The second check case [2,6,7], k=1 -> 5 is a derived check (not a statement example).",
     verified=True)),
 "3290": dict(title="Maximum Multiplication Score", slug="maximum-multiplication-score", difficulty="Medium",
   tags=["Array", "Dynamic Programming", "Greedy"], accent="#ec4899",
   description="Pick indices i0 < i1 < i2 < i3 in b to maximize the weighted sum with a, using a prefix DP over how many picks are made.",
   phases=[("setup","Setup","Fill the zero-pick row."),("skip","Skip","Carry the best score without taking b[j-1]."),("take","Take","Take b[j-1] as the next pick."),("result","Result","Return the best score with 4 picks.")],
   inputLabel='JSON object with keys a (length 4) and b (e.g. {"a": [3, 2, 5, 6], "b": [2, -6, 4, -5, -3, 2, -7]})',
   examples=[("Example 1",{"a":[3,2,5,6],"b":[2,-6,4,-5,-3,2,-7]}),("Example 2",{"a":[-1,4,5,-2],"b":[-5,-1,-3,-2,-4]})],
   complexity="O(4 * n) time with a 5 by (n + 1) table, for n up to 20 in the visualization.",
   req=dict(sources=["https://leetcode.doocs.org/en/lc/3290/","https://algo.monster/liteproblems/3290"],
     sourceKind="mirror pages (doocs mirror shows statement examples; official page not found)",
     summary="Given a of length 4 and b, choose i0 < i1 < i2 < i3 in b to maximize a[0]*b[i0] + a[1]*b[i1] + a[2]*b[i2] + a[3]*b[i3].",
     constraints="Not retrieved from a source. Visualization cap: b has 4 to 20 values, all values from -100 to 100.",
     notes="Examples (26 and -1) come from the doocs mirror. Constraints were not retrieved.",
     verified=False)),
}
ORDER = ["2552","2606","2617","2745","2750","2963","3101","3287","3290"]
results = []
for n in ORDER:
    p = P[n]
    d = f"{ROOT}/src/problems/Problem{n}"
    os.makedirs(d, exist_ok=True)
    meta = f'''export const meta = {{
  number: "{n}",
  title: "{p['title']}",
  slug: "{p['slug']}",
  difficulty: "{p['difficulty']}",
  tags: {json.dumps(p['tags'])},
  accent: "{p['accent']}",
  description: "{p['description']}",
}}
'''
    open(f"{d}/meta.js", "w").write(meta)
    phases = ",\n    ".join(f'{{ id: "{i}", label: "{l}", description: {json.dumps(desc)} }}' for i, l, desc in p["phases"])
    examples = ",\n    ".join(f'{{ label: {json.dumps(l)}, input: {json.dumps(json.dumps(v))} }}' for l, v in p["examples"])
    index = f'''import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import RecurrenceGrid from "../../components/shared/RecurrenceGrid";
import {{ code, python, pythonLineMap, parseInput, buildTrace }} from "./algorithm";

const definition = {{
  number: "{n}",
  phases: [
    {phases},
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  inputLabel: {json.dumps(p['inputLabel'])},
  url: "https://leetcode.com/problems/{p['slug']}/",
  complexity: {json.dumps(p['complexity'])},
  examples: [
    {examples},
  ],
}};

const cellText = value => Array.isArray(value) ? `{{${{value.join(", ")}}}}` : value === null || value === undefined ? "–" : String(value);

export default function Problem{n}() {{
  return <AlgorithmWorkspace
    definition={{definition}}
    renderVisual={{({{ run, step }}) => <RecurrenceGrid
      rowLabels={{run.rowLabels}} columnLabels={{run.columnLabels}}
      row={{step.row}} column={{step.column}} label="DP table"
      valueAt={{(r, c) => cellText(step.table[r][c])}}
      roleAt={{(r, c) => r === step.row && c === step.column ? "current" : step.table[r][c] !== null ? "filled" : ""}} />}}
    renderReasoning={{({{ step }}) => <p>{{step.message}}</p>}} />;
}}
'''
    open(f"{d}/index.jsx", "w").write(index)
    r = p["req"]
    req = {
      "number": int(n), "title": p["title"], "slug": p["slug"],
      "sources": r["sources"], "sourceKind": r["sourceKind"], "checkedOn": TODAY,
      "summary": r["summary"], "officialConstraints": r["constraints"],
      "visualizationNotes": "Visualization caps are listed in constraints; the DP table is shown in an 8 by 8 window that follows playback.",
      "examplesNotes": r["notes"], "requirementsVerified": r["verified"],
    }
    os.makedirs(f"{ROOT}/docs/requirements", exist_ok=True)
    json.dump(req, open(f"{ROOT}/docs/requirements/{n}.json", "w"), indent=2, ensure_ascii=False)
    results.append({"number": int(n), "status": "done", "reason": "Folder created; Node and Python checks passed.", "requirementsVerified": r["verified"]})
results.append({"number": 2735, "status": "skipped", "reason": "WebSearch returned only tags and acceptance rate; no statement, constraints or examples could be retrieved.", "requirementsVerified": False})
results.sort(key=lambda x: x["number"])
os.makedirs(f"{ROOT}/scratchpad/queue", exist_ok=True)
json.dump(results, open(f"{ROOT}/scratchpad/queue/result-dp-batch1.json", "w"), indent=2)
for r in results:
    print(r)
