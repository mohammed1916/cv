#!/bin/bash

cd "c:\Users\BBBS-AI-01\d\cv\visualizer\src\problems"

# Create index files for Batch 5
cat > "PlusOne/index.jsx" << 'EOF'
export const meta = { number: '66', title: 'Plus One', slug: 'plus-one', difficulty: 'Easy', tags: ['Array', 'Math'] }
export { default } from './PlusOneVisualizer'
EOF

cat > "AddBinary/index.jsx" << 'EOF'
export const meta = { number: '67', title: 'Add Binary', slug: 'add-binary', difficulty: 'Easy', tags: ['String', 'Math'] }
export { default } from './AddBinaryVisualizer'
EOF

cat > "Sqrtx/index.jsx" << 'EOF'
export const meta = { number: '69', title: 'Sqrt(x)', slug: 'sqrtx', difficulty: 'Easy', tags: ['Math', 'Binary Search'] }
export { default } from './SqrtxVisualizer'
EOF

cat > "ClimbingStairs/index.jsx" << 'EOF'
export const meta = { number: '70', title: 'Climbing Stairs', slug: 'climbing-stairs', difficulty: 'Easy', tags: ['DP', 'Math'] }
export { default } from './ClimbingStairsVisualizer'
EOF

cat > "SimplifyPath/index.jsx" << 'EOF'
export const meta = { number: '71', title: 'Simplify Path', slug: 'simplify-path', difficulty: 'Medium', tags: ['String', 'Stack'] }
export { default } from './SimplifyPathVisualizer'
EOF

cat > "EditDistance/index.jsx" << 'EOF'
export const meta = { number: '72', title: 'Edit Distance', slug: 'edit-distance', difficulty: 'Hard', tags: ['DP', 'String'] }
export { default } from './EditDistanceVisualizer'
EOF

cat > "SetMatrixZeroes/index.jsx" << 'EOF'
export const meta = { number: '73', title: 'Set Matrix Zeroes', slug: 'set-matrix-zeroes', difficulty: 'Medium', tags: ['Array', 'Matrix'] }
export { default } from './SetMatrixZeroesVisualizer'
EOF

cat > "SearchA2DMatrix/index.jsx" << 'EOF'
export const meta = { number: '74', title: 'Search a 2D Matrix', slug: 'search-a-2d-matrix', difficulty: 'Medium', tags: ['Array', 'Binary Search'] }
export { default } from './SearchA2DMatrixVisualizer'
EOF

cat > "SortColors/index.jsx" << 'EOF'
export const meta = { number: '75', title: 'Sort Colors', slug: 'sort-colors', difficulty: 'Medium', tags: ['Array', 'Two Pointers'] }
export { default } from './SortColorsVisualizer'
EOF

cat > "MinimumWindowSubstring/index.jsx" << 'EOF'
export const meta = { number: '76', title: 'Minimum Window Substring', slug: 'minimum-window-substring', difficulty: 'Hard', tags: ['String', 'Sliding Window'] }
export { default } from './MinimumWindowSubstringVisualizer'
EOF

cat > "Combinations/index.jsx" << 'EOF'
export const meta = { number: '77', title: 'Combinations', slug: 'combinations', difficulty: 'Medium', tags: ['Backtracking'] }
export { default } from './CombinationsVisualizer'
EOF

cat > "Subsets/index.jsx" << 'EOF'
export const meta = { number: '78', title: 'Subsets', slug: 'subsets', difficulty: 'Medium', tags: ['Backtracking', 'Bit Manipulation'] }
export { default } from './SubsetsVisualizer'
EOF

cat > "WordSearch/index.jsx" << 'EOF'
export const meta = { number: '79', title: 'Word Search', slug: 'word-search', difficulty: 'Medium', tags: ['Backtracking', 'DFS'] }
export { default } from './WordSearchVisualizer'
EOF

cat > "RemoveDuplicatesII/index.jsx" << 'EOF'
export const meta = { number: '80', title: 'Remove Duplicates II', slug: 'remove-duplicates-from-sorted-array-ii', difficulty: 'Medium', tags: ['Array', 'Two Pointers'] }
export { default } from './RemoveDuplicatesIIVisualizer'
EOF

cat > "SearchRotatedArrayII/index.jsx" << 'EOF'
export const meta = { number: '81', title: 'Search Rotated Array II', slug: 'search-in-rotated-sorted-array-ii', difficulty: 'Medium', tags: ['Array', 'Binary Search'] }
export { default } from './SearchRotatedArrayIIVisualizer'
EOF

cat > "RemoveDuplicatesFromListII/index.jsx" << 'EOF'
export const meta = { number: '82', title: 'Remove Duplicates From List II', slug: 'remove-duplicates-from-sorted-list-ii', difficulty: 'Medium', tags: ['LinkedList'] }
export { default } from './RemoveDuplicatesFromListIIVisualizer'
EOF

cat > "RemoveDuplicatesFromList/index.jsx" << 'EOF'
export const meta = { number: '83', title: 'Remove Duplicates From List', slug: 'remove-duplicates-from-sorted-list', difficulty: 'Easy', tags: ['LinkedList'] }
export { default } from './RemoveDuplicatesFromListVisualizer'
EOF

cat > "LargestRectangleInHistogram/index.jsx" << 'EOF'
export const meta = { number: '84', title: 'Largest Rectangle in Histogram', slug: 'largest-rectangle-in-histogram', difficulty: 'Hard', tags: ['Array', 'Stack'] }
export { default } from './LargestRectangleInHistogramVisualizer'
EOF

cat > "MaximalRectangle/index.jsx" << 'EOF'
export const meta = { number: '85', title: 'Maximal Rectangle', slug: 'maximal-rectangle', difficulty: 'Hard', tags: ['Array', 'DP'] }
export { default } from './MaximalRectangleVisualizer'
EOF

cat > "PartitionList/index.jsx" << 'EOF'
export const meta = { number: '86', title: 'Partition List', slug: 'partition-list', difficulty: 'Medium', tags: ['LinkedList'] }
export { default } from './PartitionListVisualizer'
EOF

cat > "ScrambleString/index.jsx" << 'EOF'
export const meta = { number: '87', title: 'Scramble String', slug: 'scramble-string', difficulty: 'Hard', tags: ['String', 'DP'] }
export { default } from './ScrambleStringVisualizer'
EOF

cat > "MergeSortedArray/index.jsx" << 'EOF'
export const meta = { number: '88', title: 'Merge Sorted Array', slug: 'merge-sorted-array', difficulty: 'Easy', tags: ['Array', 'Two Pointers'] }
export { default } from './MergeSortedArrayVisualizer'
EOF

cat > "GrayCode/index.jsx" << 'EOF'
export const meta = { number: '89', title: 'Gray Code', slug: 'gray-code', difficulty: 'Medium', tags: ['Bit Manipulation', 'Math'] }
export { default } from './GrayCodeVisualizer'
EOF

cat > "SubsetsII/index.jsx" << 'EOF'
export const meta = { number: '90', title: 'Subsets II', slug: 'subsets-ii', difficulty: 'Medium', tags: ['Backtracking'] }
export { default } from './SubsetsIIVisualizer'
EOF

cat > "DecodeWays/index.jsx" << 'EOF'
export const meta = { number: '91', title: 'Decode Ways', slug: 'decode-ways', difficulty: 'Medium', tags: ['DP', 'String'] }
export { default } from './DecodeWaysVisualizer'
EOF

echo "✓ Created 25 Batch 5 index files"
