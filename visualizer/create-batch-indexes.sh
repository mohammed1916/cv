#!/bin/bash

cd "c:\Users\BBBS-AI-01\d\cv\visualizer/src/problems"

# For each Problem[350-419] directory, create index.jsx
problems_350_419=(
  "350:intersection-of-two-arrays"
  "351:intersection-of-two-arrays-ii"
  "352:data-stream-as-disjoint-intervals"
  "353:design-snake-game"
  "354:russian-doll-envelopes"
  "355:design-twitter"
  "356:line-reflection"
  "357:count-numbers-with-unique-digits"
  "358:rearrange-string-k-distance-apart"
  "359:logger-rate-limiter"
  "360:sort-transformed-array"
  "361:bomb-enemy"
  "362:design-hit-counter"
  "363:max-sum-of-rectangle-no-larger-than-k"
  "364:nested-list-weight-sum-ii"
  "365:water-and-jug-problem"
  "366:paint-house-ii"
  "367:valid-perfect-square"
  "368:largest-divisible-subset"
  "369:plus-one-linked-list"
  "370:range-addition"
  "371:sum-of-two-integers"
  "372:super-power"
  "373:find-k-pairs-with-smallest-sums"
  "374:guess-number-higher-or-lower"
  "375:guess-number-higher-or-lower-ii"
  "376:wiggle-subsequence"
  "377:combination-sum-iv"
  "378:kth-smallest-element-in-a-sorted-matrix"
  "379:design-phone-directory"
  "380:insert-delete-getrandom-o1"
  "381:insert-delete-getrandom-o1-duplicates-allowed"
  "382:linked-list-random-node"
  "383:ransom-note"
  "384:shuffle-an-array"
  "385:mini-parser"
  "386:lexicographical-numbers"
  "387:first-unique-character-in-a-string"
  "388:longest-absolute-file-path"
  "389:find-the-difference"
  "390:elimination-game"
  "391:perfect-rectangle"
  "392:is-subsequence"
  "393:utf-8-validation"
  "394:decode-string"
  "395:longest-substring-with-at-most-k-distinct-characters"
  "396:rotate-function"
  "397:integer-replacement"
  "398:random-pick-index"
  "399:evaluate-division"
  "400:nth-digit"
  "401:binary-watch"
  "402:remove-k-digits"
  "403:frog-jump"
  "404:sum-of-left-leaves"
  "405:convert-a-number-to-hexadecimal"
  "406:queue-reconstruction-by-height"
  "407:trapping-rain-water-ii"
  "408:valid-word-abbreviation"
  "409:longest-palindrome"
  "410:split-array-largest-sum"
  "411:minimum-unique-word-abbreviation"
  "412:fizz-buzz"
  "413:arithmetic-slices"
  "414:third-maximum-number"
  "415:add-strings"
  "416:partition-equal-subset-sum"
  "417:pacific-atlantic-water-flow"
  "418:sentence-screen-fitting"
  "419:battleships-in-a-board"
)

count=0
for item in "${problems_350_419[@]}"; do
  IFS=':' read -r num slug <<< "$item"
  dir="Problem$num"
  
  if [ -d "$dir" ]; then
    cat > "$dir/index.jsx" << INDEXEOF
export const meta = {
  number: '$num',
  slug: '$slug',
  difficulty: 'Medium',
  tags: ['Algorithm'],
}
export { default } from './Problem${num}Visualizer'
INDEXEOF
    ((count++))
  fi
done

echo "✓ Created $count index.jsx files (350-419)"

