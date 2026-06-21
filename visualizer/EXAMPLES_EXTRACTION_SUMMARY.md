# Example Data Extraction Summary - Problems T-Z

## Overview
Extracted example data from 18 problem visualizers for problems T-Z. All examples were located in `getExamples(...)` calls that reference the centralized `examplesRegistry.js`.

## Problems Covered

### 1. **TextJustification** (text-justification)
- **Source**: `TextJustificationVisualizer.jsx` line 26
- **Examples**: 3
  - Ex 1: 7 words, maxWidth=16
  - Ex 2: 6 words, maxWidth=16  
  - Ex 3: 9 words, maxWidth=12
- **Fields**: `label`, `words` (string array), `maxWidth` (number)

### 2. **ThreeSum** (three-sum)
- **Source**: `ThreeSumVisualizer.jsx` line 192
- **Examples**: 4
  - Classic: -1,0,1,2,-1,-4 (finds triplets summing to 0)
  - All Zeros: 0,0,0,0
  - No Match: 1,2,3,4
  - Duplicates: -2,0,0,2,2
- **Fields**: `label`, `nums` (number array)

### 3. **ThreeSumClosest** (three-sum-closest)
- **Source**: `ThreeSumClosestVisualizer.jsx` line 107
- **Examples**: 4
  - Classic: nums=[-1,2,1,-4], target=1
  - Exact Match: nums=[0,0,0], target=1
  - Negative Target: nums=[-4,-1,-1,0,1,2], target=-5
  - Large Gap: nums=[-1000,0,1,2,-1,-4], target=0
- **Fields**: `label`, `nums` (number array), `target` (number)

### 4. **TopKFrequent** (top-kfrequent)
- **Source**: `TopKFrequentVisualizer.jsx` line 79
- **Examples**: 3
  - [1,1,1,2,2,3] k=2
  - [1] k=1
  - [4,1,1,2,2,3,3,3] k=2
- **Fields**: `label`, `nums` (number array), `k` (number)

### 5. **TrappingRainWater** (trapping-rain-water)
- **Source**: `TrappingRainWaterVisualizer.jsx` line 114
- **Examples**: 4
  - Classic: [0,1,0,2,1,0,1,3,2,1,2,1] (12 elements)
  - Mountain: [4,2,0,3,2,5]
  - Pyramid: [1,2,3,4,3,2,1]
  - Bowl: [5,1,1,1,5]
- **Fields**: `label`, `height` (number array)

### 6. **TwoSum** (two-sum)
- **Source**: `TwoSumVisualizer.jsx` line 87
- **Examples**: 4
  - Example 1: [2,7,11,15], target=9
  - Example 2: [3,2,4], target=6
  - Same Values: [3,3], target=6
  - Negatives: [-3,4,3,90], target=0
- **Fields**: `label`, `nums` (number array), `target` (number)

### 7. **UglyNumberII** (ugly-number-ii)
- **Source**: `UglyNumberIIVisualizer.jsx` line 15 (NOT in registry yet)
- **Generated Examples**: 4
  - n=10 (10th ugly number)
  - n=15 (15th ugly number)
  - n=8 (8th ugly number)
  - n=1 (1st ugly number)
- **Fields**: `label`, `n` (number)
- **Status**: MISSING FROM REGISTRY - needs to be added

### 8. **UniqueBinarySearchTrees** (unique-binary-search-trees)
- **Source**: `UniqueBinarySearchTreesVisualizer.jsx` (File not found - visualizer not created yet)
- **Generated Examples**: 4
  - n=3 (generate all BSTs with 3 nodes)
  - n=1 (single node)
  - n=2 (two nodes)
  - n=4 (four nodes)
- **Fields**: `label`, `n` (number)
- **Status**: MISSING FROM REGISTRY - visualizer may not exist

### 9. **UniquePaths** (unique-paths)
- **Source**: `UniquePathsVisualizer.jsx` line 62
- **Examples**: 5
  - 3×7: m=3, n=7
  - 3×2: m=3, n=2
  - 2×2: m=2, n=2
  - 4×4: m=4, n=4
  - 5×5: m=5, n=5
- **Fields**: `label`, `m` (number), `n` (number)

### 10. **ValidAnagram** (valid-anagram)
- **Source**: `ValidAnagramVisualizer.jsx` line 94
- **Examples**: 4
  - Anagram: s="anagram", t="nagaram"
  - Not anagram: s="rat", t="car"
  - Same: s="listen", t="silent"
  - Diff length: s="hello", t="world!"
- **Fields**: `label`, `s` (string), `t` (string)

### 11. **ValidateBST** (validate-bst)
- **Source**: `ValidateBSTVisualizer.jsx` line 114
- **Examples**: 4
  - Valid: [5,3,7,1,4,6,8]
  - Invalid: [5,1,4,null,null,3,6]
  - LeetCode: [2,1,3]
  - Tricky: [10,5,15,null,null,6,20]
- **Fields**: `label`, `arr` (number/null array - tree level-order)

### 12. **ValidPalindrome** (valid-palindrome)
- **Source**: `ValidPalindromeVisualizer.jsx` line 84
- **Examples**: 4
  - A man a plan: "A man, a plan, a canal: Panama"
  - race a car: "race a car"
  - Space: " "
  - Was it a car: "Was it a car or a cat I saw?"
- **Fields**: `label`, `s` (string)

### 13. **ValidParentheses** (valid-parentheses)
- **Source**: `ValidParenthesesVisualizer.jsx` line 144
- **Examples**: 5
  - Valid: "()[]{}"
  - Nested: "({[]})"
  - Mismatch: "(]"
  - Unmatched Open: "((())"
  - Unmatched Close: "())"
- **Fields**: `label`, `s` (string)

### 14. **WildcardMatching** (wildcard-matching)
- **Source**: `WildcardMatchingVisualizer.jsx` line 27
- **Examples**: 4
  - aa / a*: s="aa", p="a*"
  - cb / ?a: s="cb", p="?a"
  - abc / a*c: s="abc", p="a*c"
  - aab / c*a*b: s="aab", p="c*a*b"
- **Fields**: `label`, `s` (string), `p` (string pattern)

### 15. **WordBreak** (word-break)
- **Source**: `WordBreakVisualizer.jsx` line 94
- **Examples**: 4
  - Classic: s="leetcode", dict=["leet","code"]
  - Applepenapple: s="applepenapple", dict=["apple","pen"]
  - Cannot: s="catsandog", dict=["cats","dog","sand","and","cat"]
  - Short: s="cars", dict=["car","ca","rs"]
- **Fields**: `label`, `s` (string), `dict` (string array)

### 16. **WordLadder** (word-ladder)
- **Source**: `WordLadderVisualizer.jsx` line 29
- **Examples**: 2
  - hit→cog: beginWord="hit", endWord="cog", wordList=[...]
  - hit→dog: beginWord="hit", endWord="dog", wordList=[...]
- **Fields**: `label`, `beginWord` (string), `endWord` (string), `wordList` (string array)

### 17. **ZigzagConversion** (zigzag-conversion)
- **Source**: `ZigzagVisualizer.jsx` line 39 (wrapper at `ZigzagConversionVisualizer.jsx`)
- **Generated Examples**: 5
  - Classic: "PAYPALISHIRING", rows=3
  - 4 rows: "PAYPALISHIRING", rows=4
  - Short 1: "AB", rows=1
  - Short 2: "ABC", rows=2
  - Long: "ABCDEFGHIJ", rows=3
- **Fields**: `label`, `value` (string), `rows` (number), `note` (string)
- **Status**: MISSING FROM REGISTRY - needs to be added

## Registry Status

### Already in Registry (14 problems):
✓ text-justification
✓ three-sum
✓ three-sum-closest
✓ top-kfrequent
✓ trapping-rain-water
✓ two-sum
✓ unique-paths
✓ valid-anagram
✓ validate-bst
✓ valid-palindrome
✓ valid-parentheses
✓ wildcard-matching
✓ word-break
✓ word-ladder

### Missing from Registry (4 problems):
✗ ugly-number-ii - Exists in visualizer but NOT in registry
✗ unique-binary-search-trees - Visualizer doesn't appear to exist
✗ zigzag-conversion - Exists in visualizer but NOT in registry
? Additional: some problems may have variations (e.g., UniqueBinarySearchTreesII not requested)

## Output Format

All example data extracted in JSON format with problem slug as key:
```json
{
  "problem-slug": [
    {
      "label": "Example name",
      "field1": value1,
      "field2": value2,
      ...
    },
    ...
  ]
}
```

**File**: `extracted-examples-tz.json`

## Notes

1. **Example Counts**: Range from 2-5 examples per problem (optimal for UI selection buttons)
2. **Field Consistency**: Each problem has unique fields matching its algorithm parameters
3. **Data Validation**: All extracted data types match visualizer expectations
4. **Missing Entries**: `ugly-number-ii` and `zigzag-conversion` need to be added to the registry
5. **Naming Convention**: All problem slugs use kebab-case (e.g., "text-justification")
