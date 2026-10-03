// Independently designed walkthroughs. Small boundary inputs are intentional:
// a singleton, zero, or empty result cannot be made longer without losing the case.
export const AUTHORED_EXAMPLES = {};
function suite(slugs, fields, rows) {
  const keys = fields.split(' ');
  const examples = rows.map(([label, ...values]) => Object.fromEntries([
    ['label', label], ...keys.map((key, i) => [key, values[i]]),
  ]));
  for (const slug of slugs.split('|')) AUTHORED_EXAMPLES[slug] = examples;
}

suite('two-sum', 'nums target', [
 ['Late complement', [14,-6,23,8,31,5,-2,19,11],17],
 ['Same value, two indices',[8,8],16], ['Zero and negative',[-9,0,12,4],-9],
 ['Pair at both ends',[13,2,6,9,15,-4],9],
]);
suite('add-two-numbers|add-two-numbers-ii','l1 l2',[
 ['Unequal lengths and carry chain',[7,9,9,4,8,6,2],[8,6,5,9]],
 ['Carry creates a node',[9,9,9,9,9],[1]], ['Zero identity',[0],[4,8,3,2]],
 ['Both zero',[0],[0]], ['No carries',[1,2,3,1],[2,1,2,2]],
]);
suite('add-binary','a b',[
 ['Interleaved carries','11010110101','101111011'], ['Carry grows the answer','11111111','1'],
 ['Zero identity','0','1011010'], ['Both zero','0','0'], ['Unequal lengths','100000001','11'],
]);
suite('longest-substring-without-repeating','s',[
 ['Repeated window resets','pqrsptuvqwxypz'], ['All distinct','hijklmno'],
 ['One repeated symbol','zzzzzzz'], ['Empty string',''], ['Spaces count','a b c a d'],
]);
suite('palindrome-partitioning|palindrome-partitioning-ii|palindromic-substrings|longest-palindromic-subsequence|palindrome-subsequence','s',[
 ['Separate palindrome islands','noonxabbay'], ['Whole odd palindrome','rotator'],
 ['Nested even palindrome','deffed'], ['Every cut competes','zzzzz'],
 ['Only single letters','qwerty'], ['Single letter','v'],
]);
suite('longest-palindrome','s',[
 ['Pairs and odd leftovers','mmmnnnooopqqrrsst'], ['Only distinct','qwerty'],
 ['All one letter','zzzzzzz'], ['Case matters','aAbBcCa'], ['Single letter','v'],
]);
suite('valid-palindrome','s',[
 ['Punctuation and case','Was it a car or a cat I saw?'], ['Mismatch inside','A quiet garden, not a palindrome.'],
 ['Only punctuation','... ! ?'], ['Mixed alphanumeric','7Rotor7'], ['Single letter','Q'],
]);
suite('valid-parentheses','s',[
 ['Nested and adjacent groups','{[()()]([])}([]{})'], ['Wrong closing order','{[(])}'],
 ['Unclosed prefix','(([]{})'], ['Closer without opener',']()'], ['Empty stack throughout',''],
]);
suite('generate-parentheses','n', [['Four pairs, many branches',4],['One pair',1],['Two pairs',2],['Three pairs',3]]);
suite('letter-combinations','digits',[
 ['Mixed three- and four-letter keys','274'], ['Four-way key','9'], ['Two four-way keys','79'], ['No digits',''],
]);
suite('remove-duplicates','nums',[
 ['Runs at both ends',[-7,-7,-7,-2,0,0,4,4,4,9,12,12]], ['All equal',[8,8,8,8]],
 ['Already unique',[-9,-3,2,7,11]], ['Single value',[6]], ['Empty',[]],
]);
suite('remove-element','nums val',[
 ['Remove scattered matches',[7,3,7,4,5,7,9,7,2,7],7], ['Remove everything',[4,4,4],4],
 ['Absent target',[3,6,9,12],5], ['Single match',[8],8], ['Empty',[],2],
]);
suite('next-permutation','nums',[
 ['Long nonincreasing suffix',[2,6,8,7,5,4,4,1]], ['Wrap to first',[9,7,5,3]],
 ['Repeated suffix',[2,4,4,3,3]], ['Already first',[2,5,7,9]], ['Singleton',[6]],
]);
suite('search-insert-position|binary-search','nums target',[
 ['Interior search',[-18,-11,-5,0,4,9,16,23,31,42],16], ['Before first',[4,8,12],1],
 ['After last',[4,8,12],19], ['Between entries',[4,8,12],10], ['Single exact match',[7],7],
]);
suite('search-in-rotated-sorted-array','nums target',[
 ['Across the pivot',[17,23,31,42,-8,-3,2,6,11],-3], ['Missing target',[8,12,19,2,5],9],
 ['Unrotated',[-4,0,5,9,17],9], ['Single hit',[6],6], ['Single miss',[6],4],
]);
suite('search-in-rotated-sorted-array-ii','nums target',[
 ['Duplicates hide the pivot',[6,6,9,12,12,1,1,3,6],1], ['All equal hit',[4,4,4,4],4],
 ['All equal miss',[4,4,4,4],5], ['One exception',[7,7,7,2,7,7],2], ['Singleton',[9],9],
]);
suite('find-first-last-position','nums target',[
 ['Interior run',[-5,-2,0,4,4,4,4,8,11,15],4], ['Absent',[2,2,6,8],4],
 ['All match',[9,9,9,9],9], ['At left edge',[3,3,6,8],3], ['At right edge',[3,6,8,8],8],
]);
suite('find-min-rotated-sorted-array|find-minimum-in-rotated-sorted-array-ii','nums',[
 ['Pivot near the middle',[21,28,35,42,-8,-1,6,13]], ['Already sorted',[-9,-4,3,11,18]],
 ['Minimum last',[4,7,12,19,-3]], ['Minimum second',[19,-3,4,7,12]], ['Singleton',[13]],
]);
suite('three-sum','nums',[
 ['Several unique triples',[-9,-6,-3,-3,0,2,4,6,7,9]], ['All zero',[0,0,0,0,0]],
 ['No solution',[2,5,8,11]], ['Duplicate suppression',[-4,-4,2,2,2,8]], ['Minimum length',[-7,2,5]],
]);
suite('three-sum-closest','nums target',[
 ['Competing close totals',[-12,-5,-1,3,8,14,19],10], ['Exact total',[-8,2,7,12],6],
 ['Below every total',[4,6,8,10],-9], ['Above every total',[-9,-7,-3,1],20], ['Only triple',[-4,6,11],9],
]);
suite('four-sum','nums target',[
 ['Several quadruplets',[-8,-5,-3,-1,0,2,4,6,9],3], ['Repeated values',[3,3,3,3,3,3],12],
 ['Impossible target',[1,4,7,10,13],-8], ['Exactly four',[-6,-2,3,11],6],
]);
suite('container-with-most-water','height',[
 ['Width versus height',[5,12,3,9,4,14,2,8,11,6,10]], ['Two walls',[7,13]],
 ['Flat walls',[6,6,6,6,6]], ['Increasing',[1,3,5,7,9,11]], ['Zero interiors',[8,0,0,0,8]],
]);
suite('trapping-rain-water','height',[
 ['Several basins',[6,1,4,0,3,7,2,5,1,4,6]], ['No basin',[1,3,5,7,9]],
 ['Flat roof',[5,5,5,5]], ['Single deep basin',[9,0,0,0,9]], ['Too short',[4,2]],
]);
suite('largest-rectangle-in-histogram','heights',[
 ['Competing plateaus',[4,4,2,7,8,8,3,5,5,1]], ['Increasing bars',[2,4,6,8,10]],
 ['Decreasing bars',[10,8,6,4,2]], ['Equal bars',[7,7,7,7]], ['Zero separates',[4,4,0,6,6]], ['Single bar',[9]],
]);
suite('jump-game|jump-game-ii','nums',[
 ['Several frontier extensions',[3,1,2,1,4,1,0,2,1,0]], ['One jump',[7,0,0,0,0,0]],
 ['Every position needed',[1,1,1,1,1,1]], ['Already at destination',[0]],
]);
AUTHORED_EXAMPLES['jump-game'].push({label:'Blocked before the end',nums:[2,1,0,4,2,1]});
// These two problems share successful inputs, but only Jump Game accepts failure.
AUTHORED_EXAMPLES['jump-game-ii']=AUTHORED_EXAMPLES['jump-game-ii'].filter(e=>e.label!=='Blocked before the end');
suite('permutations','nums',[
 ['Four distinct choices',[2,5,8,11]], ['Negative values',[-3,4,9]], ['Two choices',[6,12]], ['Singleton',[7]],
]);
suite('permutations-ii','nums',[
 ['Two duplicate groups',[2,2,5,5,8]], ['All identical',[6,6,6,6]], ['All distinct',[3,7,11]], ['Singleton',[9]],
]);
suite('subsets','nums',[
 ['Five independent choices',[-4,1,6,11,16]], ['Single choice',[9]], ['Two choices',[-2,7]], ['Empty set',[]],
]);
suite('combinations','n k',[
 ['Several remaining-choice branches',7,3], ['Choose everything',5,5], ['Choose one',6,1], ['One available',1,1],
]);
suite('combination-sum','candidates target',[
 ['Reuse and competing decompositions',[3,5,8,11],19], ['No combination',[4,7],9],
 ['Exact candidate',[5,9,13],13], ['Repeated use',[4],20], ['Above target',[8,11],5],
]);
suite('combination-sum-ii','candidates target',[
 ['Duplicate groups, single use',[2,2,3,3,4,6,7,9],12], ['All equal',[4,4,4,4],8],
 ['No solution',[3,7,11],5], ['Use every element',[2,5,8],15],
]);
suite('coin-change','coins amount',[
 ['Greedy choice loses',[1,6,9],26], ['Unreachable residue',[4,10],17],
 ['Zero amount',[3,7],0], ['Exact coin',[5,11,17],17], ['Only one denomination',[7],35],
]);
suite('coin-change-2','amount coins',[
 ['Many unordered combinations',24,[2,3,7]], ['No combination',13,[4,6]],
 ['Empty combination',0,[3,8]], ['One denomination',21,[7]], ['Exact coin',11,[11,17]],
]);
suite('house-robber|house-robber-ii','nums',[
 ['Alternating tempting houses',[6,13,4,9,18,3,12,7,15]], ['One house',[17]],
 ['Two houses',[8,19]], ['All equal',[5,5,5,5,5]], ['Zero streets',[0,0,0,0]],
]);
suite('best-time-buy-sell-stock|best-time-to-buy-and-sell-stock|best-time-buy-sell-stock-iii','prices',[
 ['Several rallies and a late low',[12,7,15,4,11,18,3,9,16,8]], ['Strictly falling',[19,15,11,6,2]],
 ['Strictly rising',[2,6,10,14,18]], ['Flat market',[8,8,8,8]], ['One day',[13]],
]);
suite('best-time-to-buy-and-sell-stock-ii|best-time-to-buy-and-sell-stock-iii','input',[
 ['Competing rallies','[12,7,15,4,11,18,3,9,16,8]'], ['Falling prices','[19,15,11,6,2]'],
 ['One long rally','[2,6,10,14,18]'], ['Flat market','[8,8,8,8]'], ['One day','[13]'],
]);
suite('best-time-buy-sell-stock-iv','k prices',[
 ['Transaction budget binds',2,[12,7,15,4,11,18,3,9,16,8]], ['Unlimited regime',8,[9,3,7,2,11,4,13]],
 ['No transactions',0,[4,9,2,12]], ['No profit',3,[16,12,8,3]], ['One day',1,[7]],
]);
suite('candy','ratings',[
 ['Peaks valleys and plateaus',[4,7,7,3,1,5,8,6,6,2]], ['All tied',[4,4,4,4]],
 ['Long ascent',[1,3,5,7,9]], ['Long descent',[9,7,5,3,1]], ['One child',[8]],
]);
suite('gas-station','gas cost',[
 ['Failures before a feasible start',[2,7,1,6,3,9,2,5],[5,3,4,5,6,2,4,3]],
 ['Total fuel too small',[2,3,1,4],[3,4,2,5]], ['Exactly balanced',[4,1,7,2],[2,5,3,4]],
 ['One feasible station',[6],[4]], ['One impossible station',[2],[3]],
]);
suite('single-number','nums',[
 ['Pairs cancel across distance',[12,-7,5,12,0,9,-7,5,9]], ['Unique zero',[4,-3,4,-3,0]],
 ['Negative survivor',[-11,6,2,6,2]], ['One number',[23]],
]);
suite('single-number-ii','input',[
 ['Triples interleaved','[6,-4,9,6,9,-4,17,6,-4,9]'], ['Negative unique','[5,5,-13,5]'],
 ['Zero unique','[7,7,0,7]'], ['One number','[21]'],
]);
suite('longest-consecutive-sequence','nums',[
 ['Runs merge out of order',[14,3,8,5,12,4,13,7,6,8,15]], ['Negatives cross zero',[-3,2,-1,0,-2,1]],
 ['Only duplicates',[9,9,9,9]], ['Separated values',[2,6,10,14]], ['Empty',[]],
]);
suite('longest-increasing-subsequence|300','nums',[
 ['Replace tails before extending',[8,3,11,5,9,2,6,12,7,14]], ['Strict descent',[15,12,9,6,3]],
 ['Equal values',[4,4,4,4]], ['Already increasing',[-8,-3,2,7,12]], ['Singleton',[19]],
]);
suite('contains-duplicate','nums',[
 ['Late duplicate',[12,5,19,3,8,24,7,16,5]], ['All distinct',[-6,0,4,11,18]],
 ['All equal',[8,8,8,8]], ['One value',[14]], ['Empty',[]],
]);
suite('product-of-array-except-self','nums',[
 ['Mixed signs',[-2,3,1,-4,2,5]], ['Exactly one zero',[3,0,-2,4,5]],
 ['Two zeroes',[0,4,0,-3]], ['Two elements',[-7,9]], ['All ones',[1,1,1,1]],
]);
suite('move-zeroes','nums',[
 ['Zeroes at every position',[0,5,0,-2,7,0,0,9,3,0]], ['All zeroes',[0,0,0,0]],
 ['No zeroes',[4,-2,8,11]], ['Single zero',[0]], ['Already compact',[6,3,9,0,0]],
]);
suite('sort-colors','nums',[
 ['All three colors interleaved',[2,0,2,1,0,1,2,0,1,2,1,0]], ['Already sorted',[0,0,1,1,2,2]],
 ['Reverse order',[2,2,1,1,0,0]], ['One color',[1,1,1,1]], ['Singleton',[2]],
]);
suite('rotate-array','nums k',[
 ['Wrapped displacement',[3,8,13,18,23,28,33,38,43],4], ['More than length',[2,5,8,11],10],
 ['Full revolution',[4,7,10],3], ['No rotation',[5,9,13],0], ['Singleton',[17],20],
]);
suite('sliding-window-maximum|sliding-window-median','nums k',[
 ['Entering and expiring extremes',[8,-3,12,5,5,-7,14,2,9,-1,6],4], ['One-wide windows',[4,-2,9,3],1],
 ['Whole array',[7,1,8,2,6],5], ['Duplicate values',[6,6,6,6,6],3], ['Descending',[12,9,6,3,0],2],
]);
suite('subarray-sum-equals-k','nums k',[
 ['Repeated prefix sums',[4,-2,3,-5,2,4,-1,1,-2,3],4], ['Zero combinations',[0,0,0,0],0],
 ['Negative target',[-3,1,-2,4,-4],-4], ['No matching sum',[2,4,6],5], ['Single match',[9],9],
]);
suite('minimum-size-subarray-sum|min-size-subarray-sum','target nums',[
 ['Window repeatedly shrinks',23,[4,9,2,7,3,11,1,8,5]], ['Single element wins',10,[2,3,12,4]],
 ['Whole array required',20,[3,4,6,7]], ['Unreachable',30,[2,5,8]], ['First element wins',6,[9,2,3]],
]);
suite('daily-temperatures','temps',[
 ['Several unresolved days',[64,68,67,72,71,70,75,69,76,74]], ['Never warmer',[81,78,74,70]],
 ['Every next day warmer',[51,56,61,66]], ['Equal is not warmer',[70,70,70,73]], ['One day',[63]],
]);
suite('132-pattern','nums',[
 ['Candidate is replaced',[8,3,11,5,9,2,7,4]], ['No pattern, ascending',[-4,0,3,7,12]],
 ['No pattern, descending',[14,10,6,2]], ['Equal values are not strict',[5,5,5,5]], ['Negative pattern',[-9,-2,-6]],
]);
suite('first-missing-positive','nums',[
 ['Displacements and duplicates',[7,3,1,8,2,-4,0,3,5,11]], ['Complete prefix',[1,2,3,4,5]],
 ['No positive',[0,-3,-8]], ['One absent',[4,7,9]], ['Singleton one',[1]],
]);
suite('missing-number','nums',[
 ['Missing interior',[9,0,7,2,10,4,1,8,5,3]], ['Missing zero',[1,2,3,4]],
 ['Missing upper bound',[3,0,2,1]], ['Only zero',[0]], ['Only one',[1]],
]);
suite('find-duplicate','nums',[
 ['Long tail into a cycle',[5,8,2,6,9,3,7,4,1,6]], ['Repeated many times',[3,3,3,3]],
 ['Duplicate smallest',[1,4,2,3,1]], ['Minimum size',[1,1]],
]);
suite('find-all-duplicates-in-array|find-all-numbers-disappeared-in-an-array|find-all-numbers-disappeared-in-array','nums',[
 ['Several duplicated and missing slots',[8,3,5,8,2,6,3,9,1,5]], ['Nothing missing',[4,1,3,2]],
 ['One repeated pair',[2,2]], ['Single slot',[1]],
]);
suite('find-disappeared-numbers','input',AUTHORED_EXAMPLES['find-all-duplicates-in-array'].map(e=>[e.label,e.nums]));
suite('single-element-in-sorted-array','nums',[
 ['Singleton after several pairs',[-8,-8,-3,-3,2,2,5,9,9,14,14]], ['Singleton first',[1,4,4,7,7]],
 ['Singleton last',[2,2,5,5,11]], ['Only element',[17]],
]);
suite('majority-element','nums',[
 ['Candidate changes before majority',[4,9,4,7,4,9,4,4,2,4,4]], ['All equal',[6,6,6,6]],
 ['Negative majority',[-3,8,-3,-3,8,-3,-3]], ['Singleton',[12]],
]);
suite('contiguous-array','nums',[
 ['Balanced intervals overlap',[1,1,0,1,0,0,0,1,1,0,1,0]], ['All zero',[0,0,0,0]],
 ['All one',[1,1,1,1]], ['Minimum balanced',[1,0]], ['Odd length',[0,1,0,1,1]],
]);
suite('partition-equal-subset','nums',[
 ['Several routes to half',[3,7,2,8,6,4,5,9]], ['Odd total',[2,4,7]],
 ['Even but impossible',[2,2,2,8]], ['Two equal values',[11,11]], ['Single value',[9]],
]);
suite('target-sum','nums target',[
 ['Many sign decisions',[2,3,1,4,2,5,1,2],6], ['Zero doubles choices',[0,0,2,0,3],1],
 ['Unreachable magnitude',[2,3,4],15], ['Parity blocks target',[2,4,6],3], ['Single negative sign',[7],-7],
]);
suite('burst-balloons','nums',[
 ['Interior versus last burst',[2,7,4,9,3,6]], ['Zero balloons',[0,4,0,7,0]],
 ['All ones',[1,1,1,1]], ['One balloon',[8]], ['Two balloons',[3,9]],
]);
suite('reverse-pairs','nums',[
 ['Cross-half pairs',[19,4,12,2,25,7,1,16,3]], ['Ascending positives',[2,4,7,11,18]],
 ['Negative values',[-2,-8,-3,-12,-5]], ['Equal negatives',[-4,-4,-4,-4]], ['Singleton',[9]],
]);
suite('count-of-smaller-after-self|count-of-smaller-numbers-after-self','nums',[
 ['Repeated values across halves',[12,4,9,2,7,4,15,1,6]], ['Increasing',[1,4,7,10]],
 ['Decreasing',[13,9,5,1]], ['All equal',[6,6,6,6]], ['Mixed negatives',[-1,-8,3,-4,0]],
]);
suite('count-of-range-sum','nums lower upper',[
 ['Many overlapping ranges',[4,-6,3,8,-5,2,-1,7],-2,5], ['Exact zero range',[0,0,0],0,0],
 ['No qualifying range',[2,5,8],20,25], ['Negative range',[-3,-4,2,-6],-9,-4],
]);
suite('k-diff-pairs-in-array','nums k',[
 ['Duplicates do not duplicate pairs',[8,3,5,11,6,3,9,14,8],3], ['Zero distance',[4,4,7,7,7,9],0],
 ['No matching distance',[2,6,10],3], ['Negative values',[-8,-5,-2,1,4],3],
]);
suite('arithmetic-slices-ii|arithmetic-slices-ii-subsequence','nums',[
 ['Overlapping arithmetic subsequences',[2,5,8,11,14,17,20]], ['All equal',[6,6,6,6,6]],
 ['No three-term progression',[1,2,4,8]], ['Descending',[15,11,7,3,-1]], ['Too short',[4,9]],
]);
suite('increasing-subsequences','nums',[
 ['Duplicate choices at several levels',[3,5,3,7,5,8,8]], ['All equal',[4,4,4,4]],
 ['Strict descent',[9,7,5,3]], ['Strict ascent',[-2,1,4,7]], ['Singleton',[12]],
]);
suite('predict-the-winner','nums',[
 ['Look beyond the larger endpoint',[8,3,15,6,2,11,4]], ['One score',[13]],
 ['Equal choices',[6,6,6,6]], ['Large middle trap',[2,19,4]], ['Even length',[5,12,3,8,7,9]],
]);
suite('minimum-moves-to-equal-array-elements|minimum-moves-to-equal-array-elements-ii','nums',[
 ['Outlier and repeated center',[4,9,6,9,2,18,7,9]], ['Already equal',[8,8,8,8]],
 ['Negative values',[-9,-3,-6,0,5]], ['Singleton',[17]], ['Two distant values',[-12,23]],
]);
suite('rotate-function','nums',[
 ['Several competing rotations',[7,-3,11,4,-2,9]], ['All equal',[5,5,5,5]],
 ['All zero',[0,0,0]], ['Singleton',[13]], ['Negative values',[-4,-7,-1,-9]],
]);
suite('find-peak-element','nums',[
 ['Several peaks',[3,9,5,12,7,4,11,2]], ['Peak first',[19,13,8,2]],
 ['Peak last',[2,6,11,17]], ['Singleton',[9]], ['Two values',[4,7]],
]);
suite('kth-largest-element','nums k',[
 ['Repeated values around rank',[12,5,18,7,12,3,9,21,6],4], ['Largest rank',[4,9,2,7],1],
 ['Smallest rank',[4,9,2,7],4], ['All equal',[6,6,6,6],3], ['Singleton',[15],1],
]);
suite('top-kfrequent','nums k',[
 ['Three distinct frequencies',[8,3,8,5,3,8,9,5,8,3,5,3,3],2], ['One distinct',[7,7,7],1],
 ['Return every distinct',[2,2,2,4,4,9],3], ['Negative keys',[-3,-3,-3,0,0,6],2],
]);
suite('wiggle-sort-ii','nums',[
 ['Repeated median values',[2,2,3,3,4,5,6,7]], ['Two values',[8,3]],
 ['Two repeated groups',[2,2,2,7,7,7]], ['Already wiggling',[1,8,3,9,5,10]], ['Singleton',[6]],
]);
suite('continuous-subarray-sum','nums k',[
 ['Matching remainder far apart',[4,8,3,7,2,11,6],9], ['Consecutive zeroes',[0,0],7],
 ['Length one is insufficient',[14],7], ['No qualifying pair',[1,2,4],13], ['Zero modulus',[5,0,0,3],0],
]);
suite('patching-array','nums n',[
 ['Several gaps in reachable coverage',[1,4,13,25],90], ['Already covers bound',[1,2,4,8],15],
 ['Must patch one first',[3,7],24], ['One value',[1],17],
]);
suite('teemo-attacking','attackTime duration',[
 ['Overlapping and separated attacks',[2,4,5,11,14,15,22],4], ['Exact touching',[1,5,9],4],
 ['Single attack',[7],6], ['No duration',[3,8,12],0],
]);

suite('find-first-occurrence','haystack needle',[
 ['Repeated prefixes before match','abacababacabadabacaba','abacabad'], ['Absent pattern','copperpaperproper','pepper'],
 ['Whole text','riverbank','riverbank'], ['Suffix match','silverriver','river'], ['Needle longer','oak','oakwood'],
]);
suite('longest-common-prefix','strs',[
 ['Prefix shrinks gradually',['transplant','transport','translate','transit','transfer']],
 ['No shared prefix',['maple','cedar','birch']], ['One word',['waterfall']], ['Empty member',['stone','','story']],
 ['One word is the prefix',['art','artist','article']],
]);
suite('group-anagrams','strs',[
 ['Several groups and repeats',['care','stone','race','tones','acre','notes','care','reed','deer']],
 ['Empty words',['','','a']], ['Single-letter groups',['q','r','q','s','r']], ['No anagrams',['birch','maple','cedar']],
]);
suite('valid-anagram','s t',[
 ['Several repeated letters','mississippi','imississipp'], ['One count differs','aabbccdde','aabbccddd'],
 ['Different lengths','cedar','cedars'], ['Identical','moonlight','moonlight'], ['Empty','', ''],
]);
suite('is-subsequence','s t',[
 ['Characters far apart','river','rainyislandvalleyendroad'], ['Order matters','abc','acb'],
 ['Empty candidate','','mountain'], ['Repeated requirement','aaa','abca'], ['Equal strings','cedar','cedar'],
]);
suite('edit-distance','w1 w2',[
 ['Insertion deletion replacement','stonework','stormward'], ['Only insertions','','meadow'],
 ['Only deletions','harbor',''], ['Already equal','lantern','lantern'], ['One replacement','lake','late'],
]);
suite('lcs','t1 t2',[
 ['Competing subsequences','cabdacefbg','abcafdbg'], ['Disjoint alphabets','mnop','abcd'],
 ['Repeated letters','aaaabbaa','baaaab'], ['Identical','river','river'], ['One empty','','cedar'],
]);
suite('distinct-subsequences','s t',[
 ['Several repeated matching choices','bananabandana','banana'], ['Every choice matches','mmmmmm','mmm'],
 ['Target absent','forest','stone'], ['Equal strings','cedar','cedar'], ['Target longer','oak','oaks'],
]);
suite('interleaving-string','s1 s2 s3',[
 ['Switch sources several times','maple','river','mraipvleer'], ['Wrong symbol','pine','oak','poiaknx'],
 ['Only first string','cedar','','cedar'], ['Only second string','','birch','birch'], ['Length mismatch','ab','cd','abc'],
]);
suite('scramble-string','s1 s2',[
 ['Nested splits','planet','netpla'], ['Same letters wrong splits','fghij','hfjgi'],
 ['Already equal','harbor','harbor'], ['Different counts','abbc','abcc'], ['Singleton','q','q'],
]);
suite('minimum-window-substring','s t',[
 ['Repeated requirements','QABRACQABBCARBA','AABC'], ['No complete window','cedarforest','zz'],
 ['Whole input required','qrrs','srqr'], ['One-character target','oakwood','w'], ['Target longer','ab','aba'],
]);
suite('find-all-anagrams|find-all-anagrams-in-a-string|find-all-anagrams-in-string','s p',[
 ['Overlapping anagrams','abacbabcaaabcbac','aabc'], ['Repeated letter windows','zzzzzz','zzz'],
 ['No window matches','riverbank','abc'], ['Pattern longer','ab','abcd'], ['Exact full window','bca','abc'],
]);
suite('permutation-in-string','s1 s2',[
 ['Repeated letters in a late window','aabc','zzabxacaabyy'], ['No permutation','aabc','abacccdd'],
 ['Whole text','cabb','bbac'], ['Pattern longer','abcd','abc'], ['Single letter','q','riverqbank'],
]);
suite('longest-repeating-char-replace','s k',[
 ['Best window moves between runs','AABACCCBACCCBBBA',2], ['No replacement','AABBBAAAC',0],
 ['All one letter','QQQQQQ',1], ['Budget covers whole input','ABCDE',5], ['Singleton','Z',0],
]);
suite('longest-substring-k-repeating|longest-substring-with-at-least-k-repeating-characters','s k',[
 ['Rare letters split valid runs','aaabbbxccccdddyeee',3], ['Whole input valid','aabbccaabb',2],
 ['No character repeats enough','abcdef',2], ['Threshold one','forest',1], ['Threshold too large','aaabb',6],
]);
suite('longest-substring-with-at-most-two-distinct-characters','s',[
 ['Several window resets','aabccbbdddeeeffef'], ['All distinct','abcdefg'], ['One letter','zzzzzz'],
 ['Exactly two letters','xyxyxyxy'], ['Empty',''],
]);
suite('longest-substring-k-distinct','s k',[
 ['Several evictions','aabacccddeeddffg',3], ['Zero budget','cedar',0], ['One distinct','xxxyyyzz',1],
 ['Budget above alphabet','maple',8], ['Empty','',2],
]);
suite('word-break','s dict',[
 ['Overlapping dictionary prefixes','rainbowraincloud',['rain','rainbow','bow','cloud','raincloud']],
 ['Unsegmentable suffix','pineconex',['pine','cone','pinecone']], ['Reuse a word','mossmossmoss',['moss','mo','ss']],
 ['Whole word','meadow',['meadow']], ['No initial match','river',['lake','stream']],
]);
suite('word-break-ii','values',[
 ['Several complete sentences',{s:'rainbowraincloud',wordDict:'["rain","rainbow","bow","cloud","raincloud"]'}],
 ['No full sentence',{s:'pineconex',wordDict:'["pine","cone","pinecone"]'}],
 ['Repeated choices',{s:'ababab',wordDict:'["a","b","ab","aba"]'}],
 ['One full word',{s:'meadow',wordDict:'["meadow"]'}],
]);
suite('concatenated-words','words',[
 ['Build words from earlier words',['rain','bow','cloud','rainbow','raincloud','bowrain','rainbowcloud','stone']],
 ['No composite',['oak','pine','birch']], ['Repeated component',['moss','mossmoss','mossmossmoss']],
 ['One word',['river']],
]);
suite('substring-concatenation','s words',[
 ['Several offsets and repeated words','redblueredredblue',['red','blu']],
 ['Adjacent valid windows','sunmoonsunmoon',['sun','moo']],
 ['Repeated token needed','catdogcatcatdog',['cat','cat','dog']], ['Missing token','redredred',['red','sun']],
]);
// Equal token lengths are part of this problem's contract.
AUTHORED_EXAMPLES['substring-concatenation'][0]={label:'Overlapping token windows',s:'redbluredredbluredblu',words:['red','blu','red']};
AUTHORED_EXAMPLES['substring-concatenation'][1]={label:'Adjacent valid windows',s:'sunmoosunmoo',words:['sun','moo']};
suite('decode-ways','s',[
 ['Several two-digit choices','1213122116'], ['Zero must pair','101201'], ['Leading zero','0712'],
 ['Impossible zero pair','1304'], ['One digit','7'], ['Only single choices','373737'],
]);
suite('decode-string','s',[
 ['Nested and adjacent groups','2[ab3[c]]x3[de]'], ['Multi-digit count','12[q]'],
 ['Plain letters','river'], ['Single repetition','1[maple]'], ['Nested empty-free groups','3[a2[b2[c]]]'],
]);
suite('basic-calculator','s',[
 ['Nested signs and subtraction','28-(6+(14-9))+(12-(7-3))'], ['Leading negative','-(8-13)+4'],
 ['Spaces and zero',' 0 - ( 9 - 9 ) '], ['Single number','347'], ['Nested subtraction','19-(8-(6-2))'],
]);
suite('basic-calculator-ii','expr',[
 ['Precedence and truncation','42-17/3+6*4-9/2'], ['Only addition','12+7+23+8'],
 ['Multiplication before subtraction','19-4*6'], ['Division truncates','29/6'], ['Single number','281'],
]);
suite('eval-rpn','tokens',[
 ['Nested arithmetic',['12','5','-','3','*','8','2','/','+']], ['Negative division',['-17','4','/']],
 ['Operand order',['7','19','-']], ['Single operand',['23']], ['Zero result',['9','9','-']],
]);
suite('expression-tree-from-tokens','tokens',AUTHORED_EXAMPLES['eval-rpn'].map(e=>[e.label,e.tokens]));
suite('longest-valid-parentheses','s',[
 ['Several valid islands',')(()())())((()))(()'], ['All open','((((('], ['All closed',')))))'],
 ['Whole string valid','(()(()))()'], ['Empty',''],
]);
suite('remove-invalid-parentheses','s',[
 ['Letters and competing removals','(a(b))c)()(d'], ['Already valid','(map)(le)'], ['Only invalid brackets',')((('],
 ['No brackets','cedar'], ['Two-sided excess',')ab(c)d('],
]);
suite('remove-duplicate-letters','s',[
 ['Small letters arrive late','dbacdbcabed'], ['Already unique','planet'], ['One repeated letter','qqqqqq'],
 ['Reverse alphabet repeats','edcbaedcba'], ['Single letter','z'],
]);
suite('remove-k-digits','num k',[
 ['Several cascading pops','5830274916',4], ['Leading zero after removal','4001203',2],
 ['Remove everything','7351',4], ['Already increasing','1234679',3], ['No removals','90817',0],
]);
suite('additive-number','num',[
 ['Many valid terms','2358132134'], ['Zero terms','000000'], ['Leading zero blocks split','02134'],
 ['Late mismatch','2358132135'], ['Multi-digit first terms','1212243660'],
]);
suite('multiply-strings','num1 num2',[
 ['Several carry columns','70839','4067'], ['Zero product','0','918273'], ['Identity','52741','1'],
 ['Carry chain','9999','999'], ['Unequal lengths','83017','6'],
]);
suite('compare-version-numbers','version1 version2',[
 ['Late differing revision','12.004.7.0.13','12.4.7.0.9'], ['Trailing zero equality','3.07.0.0','3.7'],
 ['Leading zero equality','0008.0002','8.2'], ['Shorter is smaller','4.9','4.9.1'], ['First revision decides','11.0','9.99'],
]);
suite('complex-number-multiplication','num1 num2',[
 ['Both parts contribute','7+-4i','-3+8i'], ['Pure imaginary','0+6i','0+-5i'],
 ['Zero','0+0i','9+2i'], ['Real identity','1+0i','-4+7i'], ['Conjugates','3+5i','3+-5i'],
]);
suite('fraction-to-recurring-decimal','numerator denominator',[
 ['Nonrepeating prefix then cycle',17,66], ['Long repeating cycle',5,17], ['Terminating',29,16],
 ['Negative result',-23,12], ['Exact integer',42,7], ['Zero numerator',0,19],
]);
suite('repeated-substring-pattern','s',[
 ['Long repeated unit','mossrivermossrivermossriver'], ['Almost repeated','pinepinepinx'],
 ['One symbol repeats','qqqqqq'], ['Single character','z'], ['No repeat','lantern'],
]);
suite('shortest-palindrome','s',[
 ['Long palindromic prefix','rotatorpine'], ['No prefix beyond one','garden'],
 ['Already palindrome','deffed'], ['Repeated letters','zzzzzz'], ['Empty',''],
]);
suite('reverse-words-in-a-string','s',[
 ['Uneven whitespace','  lanterns   beside the quiet   river  '], ['One word','  meadow  '],
 ['Two words','silver birch'], ['Already compact','clouds cross distant hills'],
]);
suite('length-of-last-word','s',[
 ['Trailing spaces','  lanterns glow beside the riverbank   '], ['One word','meadow'],
 ['One-letter final word','walk toward a'], ['Several separators','pine   oak     cedar  '],
]);
suite('reverse-vowels','input',[
 ['Mixed case vowels','An unusual OCEAN breeze'], ['No vowels','rhythms'], ['Only vowels','aEiOuUoIeA'], ['Singleton','q'],
]);
suite('reverse-string','s',[
 ['Long character array',Array.from('lantern river')], ['Palindrome',Array.from('rotator')],
 ['One character',['Q']], ['Empty',[]],
]);
suite('reverse-string-ii','s k',[
 ['Several full blocks and a tail','abcdefghijklmnopq',3], ['Shorter than k','cedar',8],
 ['Between k and twice k','lantern',5], ['Unit blocks','meadow',1],
]);
suite('string-compression','chars',[
 ['Long run and scattered repeats',Array.from('mmmmmmmmmmmmnnopppppqq')], ['No repeats',Array.from('planet')],
 ['One character',['z']], ['Two-digit count',Array(14).fill('q')],
]);
suite('number-of-segments-in-a-string','s',[
 ['Uneven gaps','  clouds   drift over  quiet hills  '], ['Empty',''], ['Spaces only','     '],
 ['One segment','river-bank'], ['Single spaces','oak pine birch cedar'],
]);
suite('license-key-formatting','s k',[
 ['Many groups and separators','ab-9cD--72-efG-5h',3], ['Short first group','q1w2e3r4',3],
 ['Only dashes','-----',4], ['One group','a-b-c',7], ['Unit groups','q-9-z',1],
]);
suite('detect-capital','word',[
 ['Capitalized longer word','Waterfall'], ['All capitals','MOUNTAIN'], ['All lowercase','riverbank'],
 ['Interior uppercase','riVerbank'], ['Single uppercase','Q'],
]);
suite('reconstruct-original-digits|reconstruct-original-digits-from-english','s',[
 ['Several shuffled number words','owteerhtxiseninorez'], ['Repeated digit','sevensevenseven'],
 ['Zero only','orez'], ['No unique-marker digits first','ninefiveone'],
]);
suite('unique-substrings-in-wraparound-string','s',[
 ['Several runs across z to a','wxyzabcdeabxyzabc'], ['One repeated letter','qqqqqq'],
 ['No consecutive transitions','acegik'], ['Whole short run','rstuvw'], ['Singleton','z'],
]);
suite('word-abbreviation','dict',[
 ['Shared lengths and prefix collisions',['internal','interval','internet','intense','intake','island','instead']],
 ['Short words stay whole',['oak','ox','at','a']], ['Unique lengths',['pine','cedar','forest','lantern']],
]);
suite('longest-word-dictionary','words',[
 ['Competing buildable chains',['p','pl','pla','plan','plane','plant','s','st','sto','ston','stone']],
 ['Missing middle prefix',['a','ab','abcd','abcde']], ['No starting letter',['river','road']], ['Tie by spelling',['a','at','an']],
]);
suite('text-justification','words maxWidth',[
 ['Uneven spaces and final line',['Soft','lanterns','illuminate','the','quiet','path','beside','our','river'],18],
 ['Single word line',['extraordinary','oak','pine'],13], ['Exact fit',['red','sun','sky'],11],
 ['Only one short word',['moss'],8],
]);
suite('simplify-path','path',[
 ['Several parent and current segments','/archive//photos/../drafts/./2026/../../notes/'],
 ['Cannot go above root','/../../..'], ['Dots inside names','/a/.../b/.hidden/../c'], ['Already canonical','/forest/river'], ['Root','/'],
]);
suite('restore-ip-addresses','s',[
 ['Several viable splits','172162541'], ['All zeroes','0000'], ['Leading-zero choices','001001'],
 ['Parts exceed 255','999999999999'], ['Too short','123'], ['Long valid boundary','255254253252'],
]);
suite('validate-ip-address','queryIP',[
 ['IPv6 mixed groups','2a01:0db8:0000:0042:0000:8a2e:0370:7abc'], ['IPv4','172.19.204.8'],
 ['IPv4 leading zero','172.019.204.8'], ['IPv4 overflow','172.19.256.8'],
 ['Too few IPv6 groups','2a01:db8:0:42:0:7abc'], ['Non-hex IPv6','2a01:db8:0:42:0:8a2e:370:7abg'],
]);
suite('regular-expression-matching','s p',[
 ['Skip and consume starred groups','mmmnnopqq','m*n*o.p*.*'], ['Zero repetitions','river','r.*z*'],
 ['Whole string must match','cedar','ced'], ['Dot consumes one','oak','o.k'], ['Empty through stars','','a*b*'],
]);
suite('wildcard-matching','s p',[
 ['Several stars and single-character slots','silverriverbank','s*?r*bank'], ['Star matches empty','cedar','ce*dar'],
 ['Whole string mismatch','riverbank','river'], ['Empty with stars','','***'], ['Question needs a character','','?'],
]);
suite('ternary-expression-parser','expression',[
 ['Nested true and false branches','F?T?4:7:T?F?8:3:9'], ['True branch','T?6:2'],
 ['False branch','F?8:5'], ['Nested false branch','F?1:F?2:T?7:4'],
]);
suite('bulls-and-cows','secret guess',[
 ['Exact matches and displaced repeats','50775026','75020576'], ['All exact','448822','448822'],
 ['All displaced','123456','654321'], ['No shared digits','112233','778899'], ['Repeated counts differ','1112','1222'],
]);
suite('encode-decode-strings','strs',[
 ['Empty strings and delimiters',['river#bank','','12:pine','a/b/c','two words','007']],
 ['Empty collection',[]], ['Only empties',['','','']], ['One string',['lantern']],
]);
suite('read-n-characters-given-read4','file n',[
 ['Several full reads plus a partial','lanterns_by_the_river',13], ['Beyond end','cedar',12],
 ['Exact block','pinewood',8], ['Zero requested','meadow',0], ['Empty file','',5],
]);
suite('read-n-characters-given-read4-ii','file calls',[
 ['Reuse leftovers across calls','lanterns_by_the_river',[3,2,6,1,9,4]], ['After end','cedar',[4,4,2]],
 ['Zero-length request','pinewood',[0,3,0,5]], ['Empty file','',[1,4]],
]);

suite('integer-to-roman','num',[
 ['Several subtractive pairs',2949], ['Upper boundary',3999], ['Smallest value',1],
 ['Subtractive hundreds and tens',944], ['Only additive groups',2778],
]);
suite('roman-to-integer','s',[
 ['Several subtractive pairs','MMCMXLIX'], ['Upper boundary','MMMCMXCIX'], ['Smallest value','I'],
 ['Additive groups','MMDCCLXXVIII'], ['Subtractive hundreds and tens','CMXLIV'],
]);
suite('palindrome-number','value',[
 ['Long even palindrome','73133137'], ['Long odd palindrome','4829284'], ['Interior mismatch','73143137'],
 ['Negative sign','-4224'], ['Trailing zero','840'], ['Zero','0'],
]);
suite('reverse-integer','x',[
 ['Many digit extractions',708304126], ['Negative with trailing zero',-483700], ['Overflow',1563847412],
 ['Zero',0], ['Single digit',7],
]);
suite('string-to-integer-atoi','value',[
 ['Whitespace sign digits and suffix','   -00043821river'], ['Positive overflow','934567891234'],
 ['Negative overflow','-934567891234'], ['No leading digits','river438'], ['Conflicting signs','+-72'], ['Only whitespace','   '],
]);
suite('sqrtx','x',[
 ['Several binary-search refinements',73548], ['Exact square',1369], ['Just below square',1368],
 ['Just above square',1370], ['Zero',0], ['One',1],
]);
suite('powx-n','x n',[
 ['Mixed exponent bits',1.25,13], ['Negative exponent',2,-7], ['Zero exponent',7.5,0],
 ['Negative odd power',-3,5], ['Negative even power',-3,6], ['Zero base',0,9],
]);
suite('divide-two-integers','values',[
 ['Several quotient bits',{dividend:'937',divisor:'17'}], ['Negative truncates toward zero',{dividend:'-83',divisor:'9'}],
 ['Smaller magnitude',{dividend:'5',divisor:'19'}], ['Zero dividend',{dividend:'0',divisor:'7'}],
 ['Overflow clamp',{dividend:'-2147483648',divisor:'-1'}], ['Minimum signed value',{dividend:'-2147483648',divisor:'1'}],
]);
suite('plus-one','digits',[
 ['Carry across the trailing run',[4,8,2,9,9,9,9]], ['Extra leading digit',[9,9,9,9,9]],
 ['No carry',[3,0,5,7,2]], ['Zero',[0]], ['Interior nines unchanged',[9,9,4,2]],
]);
suite('plus-one-linked-list','values',AUTHORED_EXAMPLES['plus-one'].map(e=>[e.label,e.digits]));
suite('sum-of-two-integers','a b',[
 ['Long carry propagation',127,65], ['Opposite signs',-37,19], ['Cancel to zero',-83,83],
 ['Both negative',-24,-39], ['Zero identity',0,57],
]);
suite('hamming-distance','x y',[
 ['Separated differing bits',341,682], ['Equal values',173,173], ['Against zero',0,255], ['One bit differs',64,65],
]);
suite('total-hamming-distance','nums',[
 ['Several bit columns',[3,10,21,36,57,82,127]], ['All identical',[19,19,19,19]],
 ['Zero and all low bits',[0,31]], ['Singleton',[47]],
]);
suite('number-complement','num',[
 ['Alternating significant bits',341], ['All significant bits set',127], ['Power of two',256], ['Smallest positive',1],
]);
suite('reverse-bits','n',[
 ['Separated groups of set bits',152672921], ['All bits clear',0], ['All bits set',4294967295],
 ['Only high bit',2147483648], ['Only low bit',1],
]);
suite('number-of1-bits','n',[
 ['Sparse and dense groups',15371], ['No set bits',0], ['All 32 bits',4294967295], ['Only high bit',2147483648],
]);
suite('power-of-two','n',[
 ['Large exact power',4096], ['One below',4095], ['One above',4097], ['Zero',0], ['Negative',-16], ['Identity',1],
]);
suite('power-of-three','n',[
 ['Several divisions',6561], ['Adjacent nonpower',6562], ['Zero',0], ['Negative',-27], ['Identity',1],
]);
suite('power-of-four','n',[
 ['Several divisions',1024], ['Power of two but not four',128], ['Adjacent nonpower',1025], ['Zero',0], ['Identity',1],
]);
suite('climbing-stairs','n',[
 ['Longer recurrence',12], ['One step',1], ['Two steps',2], ['Several choices',7],
]);
suite('fibonacci-number','n',[
 ['Longer recurrence',14], ['Zero',0], ['One',1], ['First sum',2], ['Middle recurrence',9],
]);
suite('counting-bits','n',[
 ['Across two power boundaries',37], ['Zero only',0], ['At power boundary',16], ['Below power boundary',15], ['One',1],
]);
suite('pascals-triangle','numRows',[
 ['Several interior rows',8], ['One row',1], ['Two rows',2], ['Interior begins',3],
]);
suite('perfect-squares','n',[
 ['Several candidate decompositions',43], ['Perfect square',49], ['Needs four terms',31], ['Two squares',41], ['One',1],
]);
suite('ugly-number-ii|264','n',[
 ['Several merged-factor frontiers',24], ['First ugly number',1], ['Small frontier',7], ['Repeated generated products',15],
]);
suite('super-ugly-number','n primes',[
 ['Four prime frontiers',18,[2,3,11,17]], ['First number',1,[3,7]],
 ['One prime',7,[3]], ['Overlapping products',14,[2,3,5]],
]);
suite('happy-number','n',[
 ['Several digit-square transitions',989], ['Known convergent chain',82], ['Cycle without one',116], ['Already one',1],
]);
suite('arranging-coins','n',[
 ['Many full rows and a remainder',83], ['Exact triangle',78], ['Just below triangle',77], ['One coin',1], ['Zero',0],
]);
suite('nth-digit','n',[
 ['Inside three-digit numbers',734], ['Last one-digit position',9], ['First two-digit position',10],
 ['Last two-digit position',189], ['First three-digit position',190],
]);
suite('beautiful-arrangement','n',[
 ['Several compatible placements',6], ['One position',1], ['Two positions',2], ['Odd size',5],
]);
suite('nqueens|nqueensii','n',[
 ['Several symmetric solutions',5], ['One queen',1], ['No solution, two rows',2], ['No solution, three rows',3], ['Six rows',6],
]);
suite('gray-code','n',[
 ['Several reflection rounds',4], ['One bit',1], ['Two bits',2], ['Three bits',3],
]);
suite('permutation-sequence','n k',[
 ['Several factorial blocks',6,437], ['First ordering',5,1], ['Last ordering',5,120], ['Single element',1,1],
]);
suite('construct-the-rectangle','area',[
 ['Several factor tests',432], ['Perfect square',361], ['Prime area',97], ['Unit area',1], ['Narrow factor pair',34],
]);
suite('poor-pigs','buckets minutesToDie minutesToTest',[
 ['Several base digits',125,12,48], ['Only one bucket',1,10,30], ['Exactly one round',17,15,15], ['Exact state power',64,10,30],
]);
suite('can-i-win','maxChoosableInteger desiredTotal',[
 ['Several competing game states',8,22], ['Immediate win',7,6], ['Unreachable total',6,23], ['Nothing needed',5,0],
]);
suite('guess-number|guess-number-higher-or-lower','n pick',[
 ['Several narrowing steps',73,46], ['First candidate',41,1], ['Last candidate',41,41], ['Single candidate',1,1],
]);
suite('first-bad-version','n bad',[
 ['Several boundary refinements',83,57], ['First is bad',29,1], ['Only last is bad',29,29], ['Single bad version',1,1],
]);
suite('guess-number-higher-or-lower-ii','n',[
 ['Several minimax intervals',12], ['No paid guess',1], ['Two candidates',2], ['Uneven intervals',7],
]);
suite('smallest-good-base','n',[
 ['Many possible exponent lengths','4681'], ['Binary all-ones representation','8191'],
 ['Three-digit representation','73'], ['Smallest valid value','3'],
]);
suite('magical-string','n',[
 ['Several generated runs',37], ['Empty prefix',0], ['First symbol',1], ['Seed prefix',3], ['Cut inside a run',14],
]);
suite('binary-watch','n',[
 ['Many bit placements',3], ['All lights off',0], ['One light',1], ['Impossible valid time',9],
]);
suite('output-contest-matches','n',[
 ['Four pairing rounds',16], ['One final',2], ['Two rounds',4], ['Three rounds',8],
]);
suite('super-power','base exponents',[
 ['Several decimal exponent digits',47,[1,2,3,4]], ['Exponent zero',29,[0]],
 ['Base one',1,[9,8,7]], ['Modulus multiple',1337,[2,5]],
]);
suite('integer-break','n',[
 ['Several candidate splits',14], ['Smallest splittable',2], ['First beneficial split',4], ['Remainder one',10], ['Remainder two',11],
]);
suite('bulb-switcher','n',[
 ['Several perfect-square survivors',63], ['Exact square',64], ['Zero bulbs',0], ['One bulb',1],
]);
suite('count-and-say','n',[
 ['Several description rounds',7], ['Seed',1], ['First run',2], ['Mixed runs',5],
]);
suite('excel-sheet-column-title','n',[
 ['Several base-26 carries',1829], ['Last single letter',26], ['First double letter',27], ['Before triple letters',702], ['First triple letters',703],
]);
suite('factorial-trailing-zeroes','n',[
 ['Several powers of five',130], ['Below first factor five',4], ['Exactly power of five',125], ['Zero factorial',0],
]);
suite('number-of-digit-one','n',[
 ['Several decimal positions',3141], ['No positive numbers',0], ['Around a ten boundary',101], ['All ones',1111],
]);
suite('bitwise-and-of-numbers-range','left right',[
 ['Shared high-bit prefix',600,639], ['Cross a power of two',511,512], ['One value',73,73], ['Contains zero',0,127],
]);

const branchingTree=[18,7,29,3,12,24,35,null,5,10,15,21,null,32,41];
const sparseTree=[18,7,29,null,12,24,null,10,null,null,26];
const leftChain=[19,14,null,9,null,4];
const treeShapes=[['Several levels and branches',branchingTree],['Uneven missing children',sparseTree],
 ['Only left children',leftChain],['One node',[23]],['Empty tree',[]]];
suite('binary-tree-level-order|binary-tree-preorder-traversal|binary-tree-postorder-traversal|binary-tree-paths|right-side-view|invert-binary-tree|flatten-binary-tree-to-linked-list|max-depth-binary-tree|diameter-binary-tree|find-leaves-of-binary-tree|binary-tree-tilt','arr',treeShapes);
suite('binary-tree-level-order-ii|binary-tree-level-order-traversal-ii|binary-tree-zigzag-level-order-traversal|diameter-of-binary-tree','root',treeShapes);
suite('binary-tree-vertical-order|serialize-deserialize','tree',treeShapes);
suite('boundary-of-binary-tree','text',treeShapes.map(([l,v])=>[l,JSON.stringify(v)]));
suite('balanced-binary-tree','arr',[
 ['Balanced several levels',branchingTree], ['Deep imbalance away from root',[8,4,12,2,null,10,14,1,null,null,null,null,null,0]],
 ['One-sided chain',leftChain], ['Single node',[17]], ['Empty tree',[]],
]);
suite('minimum-depth-of-binary-tree','arr',[
 ['Short leaf competes with deep branch',[12,5,19,null,null,16,25,14,null,22,28]],
 ['Missing child is not a leaf',[8,null,13,null,21,null,34]], ['Equal leaf depths',branchingTree], ['One node',[17]], ['Empty',[]],
]);
suite('symmetric-tree','tree',[
 ['Three mirrored levels',[8,3,3,1,6,6,1,null,2,5,null,null,5,2]],
 ['Same values, asymmetric shape',[8,3,3,null,6,null,6]], ['Value mismatch',[8,3,3,1,6,7,1]],
 ['One node',[17]], ['Empty',[]],
]);
suite('same-tree','p q',[
 ['Identical sparse trees',sparseTree,sparseTree], ['Deep value mismatch',[8,3,14,1,6,10,19],[8,3,14,1,7,10,19]],
 ['Equal values, different shape',[8,3,null],[8,null,3]], ['Only one empty',[],[17]], ['Both empty',[],[]],
]);
suite('validate-bst','arr',[
 ['Several valid ancestor bounds',branchingTree], ['Locally valid, globally invalid',[20,10,30,5,25,24,35]],
 ['Duplicate violates strictness',[8,4,12,null,8]], ['Negative keys',[-5,-12,3,-18,-8,0,7]], ['One node',[17]],
]);
suite('convert-sorted-array-to-binary-search-tree','arr',[
 ['Odd-sized balanced construction',[-19,-12,-8,-3,0,4,9,15,21,28,36]], ['Even-sized choice',[-8,-2,5,11,18,24]],
 ['Singleton',[13]], ['Two entries',[-4,9]], ['Empty',[]],
]);
suite('convert-sorted-list-to-binary-search-tree','list',AUTHORED_EXAMPLES['convert-sorted-array-to-binary-search-tree'].map(e=>[e.label,e.arr]));
suite('construct-binary-tree','pre ino',[
 ['Several recursive subtrees',[18,7,3,12,29,24,35],[3,7,12,18,24,29,35]],
 ['Right-only chain',[4,9,15,22],[4,9,15,22]], ['Left-only chain',[22,15,9,4],[4,9,15,22]], ['Singleton',[17],[17]],
]);
suite('construct-binary-tree-from-inorder-and-postorder-traversal','inorder postorder',[
 ['Several recursive subtrees',[3,7,12,18,24,29,35],[3,12,7,24,35,29,18]],
 ['Right-only chain',[4,9,15,22],[22,15,9,4]], ['Left-only chain',[4,9,15,22],[4,9,15,22]], ['Singleton',[17],[17]],
]);
suite('path-sum|path-sum-ii','root targetSum',[
 ['Several root-to-leaf routes',[8,4,13,3,7,9,17,2,null,1,5],24],
 ['No matching leaf',branchingTree,999], ['Internal prefix is insufficient',[7,4,9,2,5],11],
 ['Negative cancellation',[4,-6,8,5,-2,-3,1],3], ['Single matching node',[17],17], ['Empty',[],0],
]);
suite('path-sum-iii','root targetSum',[
 ['Paths may start below root',[6,3,-2,1,5,4,7,2,null,-1,3],6], ['Many zero paths',[0,0,0,0,0,0,0],0],
 ['Negative sums',[-4,-2,3,-5,1,-6,2],-6], ['No match',branchingTree,999], ['Singleton',[17],17],
]);
suite('binary-tree-max-path|binary-tree-maximum-path-sum','input',[
 ['Best path excludes a negative ancestor','[-12,8,17,4,11,-9,23,null,6,-3,5]'],
 ['All negative','[-8,-3,-14,-9,-6]'], ['Chain','[4,null,-2,null,9,null,7]'], ['Singleton','[17]'],
]);
suite('sum-root-to-leaf-numbers','input',[
 ['Several digit paths','[4,2,7,0,5,1,8,null,3,6,9]'], ['Leading zero','[0,3,6,2,null,null,8]'],
 ['Zero node','[0]'], ['Single digit','[7]'], ['One-sided path','[2,null,4,null,6]'],
]);
suite('kth-smallest','arr k',[
 ['Interior inorder rank',branchingTree,8], ['Minimum',branchingTree,1], ['Maximum',branchingTree,13],
 ['Skewed tree',[2,null,5,null,9,null,14],3], ['Singleton',[17],1],
]);
suite('lcabinary-tree','arr p q',[
 ['Deep nodes in one subtree',branchingTree,10,15], ['Across root',branchingTree,5,32],
 ['One node is ancestor',branchingTree,7,10], ['Direct siblings',[18,7,29],7,29],
]);
suite('lcabst','arrInput p q',AUTHORED_EXAMPLES['lcabinary-tree'].map(e=>[e.label,JSON.stringify(e.arr),e.p,e.q]));
suite('inorder-successor-bst','tree p',[
 ['Successor in right subtree',branchingTree,18], ['Successor is ancestor',branchingTree,15],
 ['Maximum has no successor',branchingTree,41], ['Minimum key',branchingTree,3],
]);
suite('delete-node-in-a-bst','root key',[
 ['Delete node with two children',branchingTree,7], ['Delete root',branchingTree,18],
 ['Delete leaf',branchingTree,21], ['Absent key',branchingTree,99], ['Delete only node',[17],17],
]);
suite('bst-to-doubly-linked-list|convert-bst-to-greater-tree|minimum-absolute-difference-in-bst','root',[
 ['Several inorder transitions',branchingTree], ['Right-only chain',[3,null,8,null,15,null,24]],
 ['Two entries',[7,2]], ['Mixed signs',[0,-8,12,-13,-3,7,19]],
]);
suite('subtree-of-another-tree','root sub',[
 ['Exact interior subtree',branchingTree,[12,10,15]], ['Same root value, wrong shape',branchingTree,[12,10]],
 ['Whole tree matches',sparseTree,sparseTree], ['Leaf subtree',branchingTree,[21]], ['Absent value',branchingTree,[99]],
]);
suite('most-frequent-subtree-sum','tree',[
 ['Repeated sums in separate branches',[8,3,-3,2,1,4,-1]], ['Every sum different',[4,7,12]],
 ['All zero sums',[0,0,0,0,0]], ['Single value',[-17]],
]);
suite('count-complete-tree-nodes','n',[
 ['Partly filled last level',26], ['Perfect tree',31], ['First on next level',16], ['Singleton',1], ['Empty',0],
]);
suite('construct-binary-tree-from-string','s',[
 ['Nested signed values','18(7(3)(12(10)(15)))(29(24)(35))'], ['Only left children','9(6(3(1)))'],
 ['Negative root','-8(4)(-3(2))'], ['Singleton','27'],
]);
suite('binary-tree-longest-consecutive-sequence-ii','tree',[
 ['Increasing and decreasing branches','[5,4,6,3,8,7,2,2,null,null,null,null,8]'],
 ['No consecutive neighbors','[8,3,14,1,6,10,19]'], ['Duplicates break chain','[4,4,4]'], ['Singleton','[17]'],
]);
suite('binary-tree-upside-down','input',[
 ['Several left-spine pivots',[8,4,12,2,6, null,null,1,3]], ['No left child',[17]],
 ['One pivot',[9,5,13]], ['Left chain',[9,6,null,3]],
]);
const listRows=[['Long list with repeated values',[12,5,19,5,3,14,8,21,6]],['Two nodes',[7,13]],['Singleton',[17]],['Empty',[]]];
suite('reverse-linked-list|swap-nodes-in-pairs|odd-even-linked-list','values',listRows);
suite('reorder-list','arr', [...listRows,['Even length',[3,7,11,15,19,23,27,31]]]);
suite('sort-list','arr', [...listRows,['Already sorted',[-8,-2,4,9,15]],['Reverse order',[17,12,7,2,-3]]]);
suite('insertion-sort-list','head',AUTHORED_EXAMPLES['sort-list'].map(e=>[e.label,e.arr]));
suite('palindrome-linked-list','nums',[
 ['Long odd palindrome',[4,9,2,7,2,9,4]], ['Even palindrome',[3,8,5,5,8,3]],
 ['Mismatch near middle',[4,9,2,7,3,9,4]], ['Singleton',[17]], ['Two unequal',[3,8]],
]);
suite('reverse-kgroup','list k',[
 ['Several groups plus remainder',[3,7,11,15,19,23,27,31,35,39],3], ['One group',[2,6,10,14],4],
 ['Group size one',[5,9,13,17],1], ['No complete group',[4,8],3],
]);
suite('rotate-list','list k',[
 ['Several links cross the seam',[3,7,11,15,19,23,27,31],3], ['Larger than length',[2,6,10,14],11],
 ['Full rotation',[4,9,14],3], ['No rotation',[4,9,14],0], ['Singleton',[17],8],
]);
suite('merge-two-sorted-lists','list1 list2',[
 ['Alternating and tied heads',[-9,-2,4,11,18],[-7,4,6,15,23]], ['One empty',[],[3,8,13]],
 ['Both empty',[],[]], ['Disjoint ranges',[2,5,8],[11,14,17]], ['All equal',[6,6],[6,6,6]],
]);
suite('merge-ksorted-lists','lists',[
 ['Four interleaving streams',[[-9,2,14],[-7,4,19],[-3,8,12],[0,6,21]]],
 ['Empty streams mixed in',[[],[3,8],[],[-2,9]]], ['No streams',[]], ['One stream',[[2,6,11]]], ['All equal',[[4,4],[4],[4,4]]],
]);
suite('merge-sorted-array','nums1 m nums2 n',[
 ['Interleaving with ties',[-8,-2,4,11,18,0,0,0,0],5,[-5,4,9,23],4],
 ['First input empty',[0,0,0],0,[3,7,12],3], ['Second input empty',[2,5,9],3,[],0],
 ['All incoming values smaller',[8,12,16,0,0],3,[1,4],2],
]);
suite('median-of-two-sorted-arrays','nums1 nums2',[
 ['Uneven lengths and interleaving',[-12,-3,4,9,18,27,36],[-8,2,11,23]],
 ['Even total',[-7,5,17],[1,8,24]], ['One empty',[],[3,7,11,15]],
 ['Repeated medians',[6,6,6],[6,6]], ['Disjoint ranges',[-9,-7,-5],[12,18,24,30]],
]);
suite('intersection-of-two-arrays|intersection-of-two-arrays-ii','nums1 nums2',[
 ['Repeated intersections',[8,3,8,5,11,3,14,8],[3,8,8,2,14,14]], ['Disjoint',[2,6,10],[3,7,11]],
 ['Different multiplicities',[4,4,4,4],[4,4]], ['One empty',[],[5,9]],
]);
suite('intersection-two-linked-lists','listA listB shared intersectVal',[
 ['Different prefixes meet late',[3,7,11,15],[2,6],[19,23,27,31],19], ['No shared nodes',[4,8,12],[4,8,12],[],0],
 ['Shared from both heads',[],[],[5,9,13],5], ['One starts at intersection',[],[2,4,6],[17,21],17],
]);
suite('linked-list-cycle','nodeCount tail',[
 ['Long prefix enters interior cycle',9,4], ['Cycle enters at head',7,0], ['No cycle',8,-1], ['Self-loop',1,0], ['One acyclic node',1,-1],
]);
suite('linked-list-cycle-ii','values',[
 ['Long prefix before entry',{nodes:'[4,8,12,16,20,24,28,32,36]',pos:4}],
 ['Entry at head',{nodes:'[3,7,11,15,19]',pos:0}], ['No cycle',{nodes:'[5,9,13,17]',pos:-1}],
 ['Self-loop',{nodes:'[23]',pos:0}], ['Empty',{nodes:'[]',pos:-1}],
]);
suite('copy-list-random|copy-list-with-random-pointer','nodes',[
 ['Forward backward self and null pointers',[{val:4,random:3},{val:8,random:0},{val:12,random:2},{val:16,random:null},{val:20,random:1},{val:24,random:4}]],
 ['All random pointers absent',[{val:3,random:null},{val:7,random:null},{val:11,random:null}]],
 ['One self-pointer',[{val:17,random:0}]], ['Empty list',[]],
]);
suite('two-sum-ii','numbers target',[
 ['Several pointer moves',[-12,-7,-2,3,8,14,21,29],19], ['Both ends',[-8,-3,2,7,12],4],
 ['Duplicate pair',[2,5,5,9],10], ['Two elements',[-4,13],9],
]);

const rectangular=[[3,8,13,18,23],[28,33,38,43,48],[53,58,63,68,73],[78,83,88,93,98]];
suite('spiral-matrix|diagonal-traverse|matrix-iteration-basics','matrix',[
 ['Four by five traversal',rectangular], ['Single row',[[4,9,14,19,24]]], ['Single column',[[4],[9],[14],[19]]],
 ['One cell',[[17]]], ['Two by three',[[2,7,12],[17,22,27]]],
]);
suite('rotate-image','matrix',[
 ['Four layers of positions',[[3,8,13,18],[23,28,33,38],[43,48,53,58],[63,68,73,78]]],
 ['Odd center remains',[[2,7,12],[17,22,27],[32,37,42]]], ['One cell',[[17]]], ['Two by two',[[3,9],[15,21]]],
]);
suite('spiral-matrix-ii','n',[['Several rings',5],['Single cell',1],['Small even square',2],['Larger even square',6]]);
suite('set-matrix-zeroes','matrix',[
 ['Zero markers collide',[[4,7,0,9,2],[3,5,8,6,1],[0,2,4,7,3],[8,6,5,0,4]]],
 ['No zeroes',[[2,4,6],[8,10,12]]], ['All zeroes',[[0,0],[0,0]]],
 ['First row and column',[[0,4,7],[3,5,8],[6,9,2]]], ['One row',[[3,0,7,9]]],
]);
suite('01-matrix','mat',[
 ['Several zero-source frontiers',[[1,1,1,0,1],[1,0,1,1,1],[1,1,1,1,1],[0,1,1,1,0]]],
 ['One corner zero',[[0,1,1,1],[1,1,1,1],[1,1,1,1]]], ['All zeroes',[[0,0,0],[0,0,0]]],
 ['One row',[[1,1,0,1,1,1]]], ['Single zero',[[0]]],
]);
suite('minimum-path-sum','grid',[
 ['Locally cheap moves compete',[[4,1,8,2,3],[7,2,1,9,4],[3,8,2,1,7],[6,1,4,2,3]]],
 ['One row',[[3,7,2,9,4]]], ['One column',[[4],[8],[1],[6]]], ['Zero-cost route',[[0,7,4],[0,0,5],[8,0,0]]], ['Single cell',[[17]]],
]);
suite('dungeon-game','dungeon',[
 ['Healing competes with future damage',[[-4,7,-8,2],[-6,-3,9,-5],[4,-12,-2,6],[-3,5,-7,-4]]],
 ['All healing',[[3,5],[7,2]]], ['All damage',[[-2,-3],[-4,-5]]], ['One damaging room',[[-17]]], ['Neutral room',[[0]]],
]);
suite('longest-increasing-path','matrix',[
 ['Winding increasing route',[[4,5,6,7],[3,12,11,8],[2,13,10,9],[1,14,15,16]]],
 ['Plateau blocks strict increase',[[6,6,6],[6,6,6]]], ['One row',[[2,5,3,7,9]]], ['One cell',[[17]]],
]);
suite('search-a-2d-matrix|search2-dmatrix','matrix target',[
 ['Interior target',rectangular,63], ['Missing between neighbors',rectangular,64],
 ['Below minimum',rectangular,-1], ['Above maximum',rectangular,100], ['Single cell',[[17]],17],
]);
suite('search-a-2d-matrix-ii','matrix target',[
 ['Rows and columns both sorted',[[2,7,12,18],[5,9,15,23],[8,14,21,28],[11,19,26,35]],21],
 ['Absent interior value',[[2,7,12],[5,9,15],[8,14,21]],13], ['Smallest',[[3,8],[6,12]],3],
 ['Largest',[[3,8],[6,12]],12], ['Single cell',[[17]],19],
]);
suite('reshape-matrix','mat r c',[
 ['Rectangular reshape',[[2,5,8,11],[14,17,20,23],[26,29,32,35]],2,6],
 ['Incompatible cell count',[[3,7,11],[15,19,23]],4,2], ['Unchanged shape',[[4,8],[12,16]],2,2],
 ['Flatten to row',[[2,6],[10,14],[18,22]],1,6],
]);
suite('sparse-matrix-multiplication','mat1 mat2',[
 ['Several zero-skipping opportunities',[[0,3,0,2],[4,0,-1,0],[0,0,5,0]],[[2,0,1],[0,6,0],[3,0,0],[0,1,4]]],
 ['All zero product',[[0,0],[0,0]],[[2,4],[6,8]]], ['Identity',[[3,7],[11,15]],[[1,0],[0,1]]],
 ['Row by column',[[2,0,-3,4]],[[5],[7],[2],[1]]],
]);
suite('unique-paths','m n',[
 ['Many overlapping subproblems',5,7], ['One row',1,9], ['One column',8,1], ['One cell',1,1], ['Square grid',6,6],
]);
suite('triangle','input',[
 ['Five levels with competing choices','[[4],[7,2],[3,8,5],[9,1,6,4],[2,7,3,8,1]]'],
 ['Negative route','[[-3],[4,-2],[-5,7,-6],[2,-1,3,4]]'], ['Single value','[[17]]'], ['All zero','[[0],[0,0],[0,0,0]]'],
]);
const islands=[[1,1,0,0,1,0],[1,0,0,1,1,0],[0,0,1,0,0,1],[1,1,1,0,1,1],[0,1,0,0,0,0]];
suite('max-area-of-island','grid',[
 ['Several competing island sizes',islands], ['All water',[[0,0,0],[0,0,0]]], ['One solid island',[[1,1,1],[1,1,1]]],
 ['Diagonals stay separate',[[1,0,1],[0,1,0],[1,0,1]]], ['Single land cell',[[1]]],
]);
suite('number-of-islands','gridStr',AUTHORED_EXAMPLES['max-area-of-island'].map(e=>[e.label,e.grid.map(r=>r.join('')).join('\n')]));
suite('island-perimeter','grid',[
 ['Jagged connected shoreline',[[0,1,1,0,0],[1,1,0,0,0],[0,1,1,1,0],[0,0,1,0,0]]],
 ['Solid rectangle',[[1,1,1,1],[1,1,1,1]]], ['Single land cell',[[1]]], ['One-cell-wide strip',[[1,1,1,1,1,1]]],
]);
suite('rotting-oranges','grid',[
 ['Several infection frontiers',[[2,1,1,0,1],[1,1,0,1,1],[0,1,1,1,2],[1,1,0,1,1]]],
 ['Isolated fresh orange',[[2,1,0],[0,0,0],[1,0,1]]], ['No fresh fruit',[[2,0,2],[0,2,0]]],
 ['No rotten source',[[1,1],[1,1]]], ['Single rotten',[[2]]],
]);
suite('surrounded-regions','input',[
 ['Border channel and enclosed pocket','["XXXXXXX","XOOXXOX","XXOXXOX","OOOXXOX","XXXXXOX","XXXXXXX"]'],
 ['All regions reach border','["OOOO","OOOO","OOOO"]'], ['No open cells','["XXXX","XXXX"]'],
 ['One enclosed cell','["XXX","XOX","XXX"]'], ['One row cannot be captured','["XOOXOOX"]'],
]);
suite('longest-line','matrix',[
 ['Competing directions',[[1,0,1,1,0],[0,1,1,0,1],[1,1,1,1,0],[0,0,1,1,1]]],
 ['All zero',[[0,0],[0,0]]], ['All one',[[1,1,1],[1,1,1]]], ['One row',[[1,1,0,1,1,1]]],
]);
suite('lonely-pixel-i','picture',[
 ['Isolated pixels and shared rows',['BWWWW','WWBWW','WBWBW','WWWWB'].map(r=>r.split(''))],
 ['All white',['WWW','WWW'].map(r=>r.split(''))], ['All black',['BB','BB'].map(r=>r.split(''))], ['Single black',[['B']]],
]);
suite('lonely-pixel-ii','picture N',[
 ['Matching rows with qualified columns',['BWBWW','BWBWW','WBWBW','WWWWB'].map(r=>r.split('')),2],
 ['No black pixels',[['W','W'],['W','W']],1], ['Identical dense rows',[['B','B'],['B','B']],2], ['Single black',[['B']],1],
]);
suite('minesweeper','board click',[
 ['Blank expansion meets numbered frontier',['EEEEEE','EEMEEE','EEEEEM','MEEEEE','EEEEEE'].map(r=>r.split('')),[0,0]],
 ['Click a mine',[['E','M'],['E','E']],[0,1]], ['Adjacent count',[['M','E','M'],['E','E','E']],[1,1]],
 ['No mines',[['E','E','E'],['E','E','E']],[0,1]],
]);
suite('trapping-rain-water-ii','heightMap',[
 ['Two basins and a lower outlet',[[7,7,7,7,7],[7,1,5,2,7],[7,2,6,1,4],[7,7,7,7,7]]],
 ['Flat surface',[[4,4,4],[4,4,4],[4,4,4]]], ['No interior',[[3,1,5,2]]],
 ['Single basin',[[6,6,6],[6,1,6],[6,6,6]]],
]);
const rollingMaze=[[0,0,0,1,0],[0,1,0,0,0],[0,0,0,1,0],[1,0,1,0,0],[0,0,0,0,0]];
suite('the-maze','maze start destination',[
 ['Turns and stopping points',rollingMaze,[0,0],[4,4]], ['Pass-through is not a stop',[[0,0,0,0,0]],[0,0],[0,2]],
 ['Disconnected rooms',[[0,1,0],[0,1,0],[0,1,0]],[0,0],[2,2]], ['Already at destination',[[0,0],[0,0]],[0,0],[0,0]],
]);
suite('the-maze-iii','maze ball hole',[
 ['Several rolling routes',rollingMaze,[0,0],[4,4]], ['Hole stops mid-roll',[[0,0,0,0,0]],[0,0],[0,2]],
 ['Unreachable hole',[[0,1,0],[0,1,0],[0,1,0]],[0,0],[2,2]], ['Short roll',[[0,0],[0,0]],[1,1],[0,1]],
]);
suite('shortest-distance-buildings|shortest-distance-from-all-buildings','grid',[
 ['Three buildings and obstacles',[[1,0,0,2,0],[0,0,0,0,1],[0,2,0,0,0],[0,0,1,0,0]]],
 ['No common reachable land',[[1,2,0],[2,2,2],[0,2,1]]], ['One building',[[1,0,0],[0,0,0]]],
 ['No empty land',[[1,1],[1,1]]],
]);
suite('robot-room-cleaner','room',[
 ['Narrow passages and branches',[[1,1,1,0,1],[1,0,1,1,1],[1,1,0,1,0],[0,1,1,1,1]]],
 ['Open room',[[1,1,1],[1,1,1],[1,1,1]]], ['Single cell',[[1]]], ['Narrow corridor',[[1,1,1,1,1,1]]],
]);
suite('course-schedule','numCourses prerequisites',[
 ['Branches merge before the final course',8,[[1,0],[2,0],[3,1],[4,1],[4,2],[5,3],[6,4],[7,5],[7,6]]],
 ['Cycle blocks completion',5,[[1,0],[2,1],[3,2],[1,3],[4,0]]], ['Independent courses',5,[]],
 ['Disconnected chains',6,[[1,0],[2,1],[4,3],[5,4]]], ['Single course',1,[]],
]);
suite('course-schedule-ii','n p',AUTHORED_EXAMPLES['course-schedule'].map(e=>[e.label,e.numCourses,e.prerequisites]));
suite('connected-components-undirected','n edges',[
 ['Several components and a cycle',9,[[0,1],[1,2],[2,0],[3,4],[4,5],[6,7]]],
 ['All isolated',5,[]], ['One connected chain',6,[[0,1],[1,2],[2,3],[3,4],[4,5]]], ['One vertex',1,[]],
]);
suite('clone-graph','input',[
 ['Cycles and shared neighbors','[[2,3],[1,3,4],[1,2,5],[2,5,6],[3,4,6],[4,5]]'],
 ['One isolated vertex','[[]]'], ['One edge','[[2],[1]]'], ['Empty graph','[]'],
]);
suite('minimum-height-trees','n edges',[
 ['Uneven branches, iterative leaf trimming',9,[[0,1],[1,2],[2,3],[3,4],[2,5],[5,6],[5,7],[7,8]]],
 ['Two centers',6,[[0,1],[1,2],[2,3],[3,4],[4,5]]], ['Star center',6,[[0,1],[0,2],[0,3],[0,4],[0,5]]],
 ['Single node',1,[]], ['Two nodes',2,[[0,1]]],
]);
suite('redundant-connection','edges',[
 ['Late edge closes a long cycle',[[1,2],[2,3],[3,4],[4,5],[2,6],[6,7],[5,7]]],
 ['Small cycle',[[1,2],[2,3],[1,3]]], ['Cycle with a tail',[[1,2],[2,3],[3,4],[4,2],[4,5]]],
]);
suite('number-of-islands-ii','m n positions',[
 ['Several components merge',4,5,[[0,0],[0,2],[2,2],[3,4],[0,1],[1,2],[2,3],[2,4],[3,3]]],
 ['Duplicate additions',2,3,[[0,0],[0,0],[1,2],[1,2]]], ['Single cell',1,1,[[0,0]]],
 ['Diagonal separation',3,3,[[0,0],[1,1],[2,2]]],
]);
suite('evaluate-division','equations values queries',[
 ['Chain ratios and disconnected component',[['oak','pine'],['pine','birch'],['birch','cedar'],['lake','sea']],[2,3,4,5],[['oak','cedar'],['cedar','oak'],['oak','oak'],['oak','lake'],['mist','mist']]],
 ['Reciprocal and identity',[['x','y']],[7],[['y','x'],['x','x'],['y','z']]],
 ['Fractional ratios',[['a','b'],['b','c']],[0.5,0.25],[['a','c'],['c','a']]],
]);
suite('word-ladder|word-ladder-ii','beginWord endWord wordList',[
 ['Several competing transformation routes','cold','warm',['cord','card','ward','warm','wold','word','worm','sold']],
 ['End word absent','cold','warm',['cord','card','ward']], ['End present but unreachable','cold','warm',['cord','card','warm']],
 ['One transformation','pine','wine',['wine','line','fine']],
]);
suite('minimum-genetic-mutation','start end bank',[
 ['Several successive mutations','ACGTACGT','TCGAACGA',['TCGTACGT','TCGAACGT','TCGAACGA','ACGAACGT']],
 ['Target missing','GATTACAA','GATTACAG',['GATTACAT']], ['One mutation','CCGGAATT','CCGGAATC',['CCGGAATC']],
 ['Target isolated','AAAACCCC','GGGGTTTT',['GGGGTTTT','AAAACCCA']],
]);
suite('kill-process','pid ppid kill',[
 ['Several descendant levels',[10,14,18,22,26,30,34,38],[0,10,10,14,14,22,18,30],14],
 ['Kill root',[11,17,23,29],[0,11,11,17],11], ['Kill leaf',[11,17,23,29],[0,11,11,17],29],
 ['Single process',[41],[0],41],
]);
suite('sequence-reconstruction','org seqs',[
 ['Constraints establish one long ordering',[1,2,3,4,5,6],[[1,2,3],[2,4],[3,4],[4,5],[5,6]]],
 ['Ambiguous middle',[1,2,3,4],[[1,2],[1,3],[2,4],[3,4]]],
 ['Cycle in constraints',[1,2,3],[[1,2],[2,3],[3,1]]], ['Missing vertex',[1,2,3,4],[[1,2],[2,3]]],
]);

suite('maximum-subarray','nums',[
 ['Several restarts before the winning run',[4,-9,7,-2,6,-11,8,3,-2,5,-7]], ['All negative',[-8,-3,-11,-5]],
 ['All positive',[3,7,2,9,4]], ['Zero competes',[0,-4,0,-2,0]], ['Singleton',[-17]],
]);
suite('max-product-subarray','nums',[
 ['Sign flips and zero reset',[-2,3,-4,0,-3,-2,5,-1,2]], ['Odd negatives',[-2,-3,-4]],
 ['Even negatives',[-2,-3,-4,-5]], ['Zero wins',[-7,0,-2]], ['Singleton',[-13]],
]);
suite('max-size-subarray-sum-k','nums k',[
 ['Repeated prefix sums favor earliest index',[3,-2,5,-3,1,4,-4,2,6,-2],6],
 ['Whole array sums to zero',[4,-4,7,-7],0], ['No match',[2,4,6],7], ['Single match',[13],13],
]);
suite('maximum-gap','nums',[
 ['Several occupied and empty buckets',[19,3,47,8,22,61,24,9]], ['All equal',[7,7,7,7]],
 ['Uniform spacing',[4,9,14,19,24]], ['Two values',[2,31]], ['Singleton',[17]],
]);
suite('max-consecutive-ones','nums',[
 ['Several competing runs',[1,1,0,1,1,1,0,1,1,1,1,0,1]], ['All ones',[1,1,1,1,1]],
 ['All zeroes',[0,0,0,0]], ['Alternating',[1,0,1,0,1,0]],
]);
suite('max-consecutive-ones-iii','nums k',[
 ['Several zeroes enter and leave',[1,0,1,1,0,0,1,1,1,0,1,0,1],2], ['No flips',[1,0,1,1,0,1],0],
 ['Flip every zero',[0,1,0,1,0],3], ['All zeroes',[0,0,0,0,0],2],
]);
suite('next-greater-element-i','nums1 nums2',[
 ['Greater values at different distances',[5,12,3,15],[5,2,12,3,9,15,7,18]],
 ['No greater values',[9,5,1],[9,7,5,3,1]], ['All next values greater',[2,6,10],[2,6,10,14]], ['Singleton',[17],[17]],
]);
suite('next-greater-element-ii','text',[
 ['Several values need wraparound','[8,3,11,5,2,9,4,7]'], ['Descending','[15,12,9,6,3]'],
 ['All equal','[6,6,6,6]'], ['Singleton','[17]'],
]);
suite('circular-array-loop','nums',[
 ['Forward cycle inside a longer array',[2,3,1,2,2,1,3]], ['Mixed directions invalidate loop',[1,-1,2,-2]],
 ['Self-loop excluded',[4,4,4,4]], ['Backward cycle',[-2,-2,-2,-2,-2]],
]);
suite('assign-cookies','greed cookies',[
 ['Several skipped cookies',[2,5,8,3,7,11],[1,3,4,6,8,10,12]], ['None fit',[5,8,11],[1,2,3]],
 ['More cookies than children',[3,6],[2,3,5,6,9]], ['No cookies',[2,7],[]],
]);
suite('ipo','k w profits capital',[
 ['Unlocked projects compete',4,1,[3,7,2,9,5,11],[0,3,1,8,4,13]], ['Nothing affordable',3,0,[5,8],[2,4]],
 ['Zero selections',0,7,[3,9],[0,5]], ['One project',1,2,[6],[2]],
]);
suite('create-maximum-number','nums1 nums2 k',[
 ['Choose and merge competing suffixes',[5,2,9,1,7],[6,8,3,9,4],7], ['Use every digit',[7,2],[6,9],4],
 ['Repeated leading ties',[8,8,2],[8,8,6],4], ['One empty array',[],[3,7,2,9],3],
]);
suite('find-k-pairs-with-smallest-sums','nums1 nums2 k',[
 ['Several heap frontiers',[-6,-1,4,9,15],[-3,2,8,13],8], ['Duplicate sums',[2,2,5],[1,1,4],6],
 ['k exceeds pair count',[3,8],[7],5], ['One pair',[4],[9],1],
]);
suite('4sum-ii','nums target',[
 ['Several complementary pair sums',[[2,-3,5,0],[-2,4,1,-5],[3,-1,2,-4],[-3,0,4,1]],0],
 ['All zeroes',[[0,0],[0,0],[0,0],[0,0]],0], ['No cancellation',[[2,3],[4,5],[6,7],[8,9]],0],
 ['One tuple',[[4],[-7],[2],[1]],0],
]);
suite('merge-intervals','intervals',[
 ['Overlaps touching ends and gaps',[[12,17],[2,6],[5,9],[20,24],[9,13],[27,31],[23,26]]],
 ['Nested intervals',[[2,20],[4,7],[8,12],[3,18]]], ['Already disjoint',[[1,3],[6,8],[11,15]]], ['Single interval',[[4,9]]],
]);
suite('insert-interval','intervals newInterval',[
 ['Bridge several existing intervals',[[1,3],[6,8],[11,14],[17,20],[24,28]],[7,25]],
 ['Before all',[[5,8],[12,16]],[1,3]], ['After all',[[2,5],[8,11]],[15,19]],
 ['Contained interval',[[2,12],[16,20]],[5,8]], ['Empty list',[],[4,9]],
]);
suite('non-overlapping-intervals','val',[
 ['Several competing endings','[[1,5],[2,3],[3,7],[6,9],[8,11],[11,14]]'],
 ['Touching is allowed','[[1,3],[3,6],[6,10]]'], ['All overlap','[[2,9],[3,8],[4,7]]'], ['One interval','[[4,9]]'],
]);
suite('minimum-number-of-arrows-to-burst-balloons','points',[
 ['Several overlap groups',[[2,8],[5,11],[10,15],[17,22],[20,26],[29,34]]],
 ['Shared endpoint',[[1,5],[5,9],[9,13]]], ['All share one point',[[2,12],[4,10],[6,8]]], ['One balloon',[[4,9]]],
]);
suite('employee-free-time','schedules',[
 ['Three calendars with shared gaps',[[[1,4],[9,12]],[[2,5],[13,16]],[[3,6],[10,14]]]],
 ['No bounded shared gap',[[[1,8]],[[3,12]]]], ['Several gaps',[[[1,3],[7,9],[13,15]],[[2,4],[8,10],[14,16]]]],
]);
suite('missing-ranges','nums lower upper',[
 ['Missing values and longer gaps',[-8,-3,-2,4,11,18],-12,23], ['Entire range missing',[],3,14],
 ['No missing values',[4,5,6,7],4,7], ['Single missing value',[2,3,5,6],2,6],
]);
suite('russian-doll-envelopes','envelopes',[
 ['Equal widths must not chain',[[3,5],[6,8],[4,7],[6,9],[8,12],[9,11],[11,14],[4,4]]],
 ['All equal',[[5,7],[5,7],[5,7]]], ['No nesting',[[2,9],[4,7],[6,5],[8,3]]], ['One envelope',[[4,9]]],
]);
suite('skyline-problem','buildings',[
 ['Nested roofs gaps and shared endpoints',[[1,6,5],[3,9,9],[5,7,12],[9,13,6],[11,16,8],[19,23,4]]],
 ['Adjacent equal roofs',[[2,5,7],[5,9,7],[9,12,7]]], ['One building',[[4,11,8]]], ['Same starting coordinate',[[2,8,5],[2,6,11],[2,10,7]]],
]);
suite('max-points-on-aline|number-of-boomerangs','points',[
 ['Several lines share a pivot',[[0,0],[2,2],[4,4],[6,6],[2,0],[2,4],[0,4],[4,0]]],
 ['Vertical line',[[3,-4],[3,0],[3,5],[3,9]]], ['Horizontal line',[[-5,2],[0,2],[4,2],[9,2]]], ['One point',[[7,11]]],
]);
suite('convex-polygon','points',[
 ['Six-sided convex boundary',[[0,2],[2,0],[5,0],[7,3],[5,6],[1,5]]],
 ['Concave indentation',[[0,0],[6,0],[6,6],[3,2],[0,6]]], ['Collinear edge points',[[0,0],[2,0],[4,0],[4,4],[0,4]]], ['Triangle',[[1,1],[7,2],[3,8]]],
]);
suite('perfect-rectangle|perfect-rectangles','rectangles',[
 ['Several tiles make one rectangle',[[0,0,2,3],[2,0,5,1],[2,1,4,3],[4,1,5,3],[0,3,5,5]]],
 ['Gap between tiles',[[0,0,2,3],[3,0,5,3]]], ['Overlapping tiles',[[0,0,3,3],[2,0,5,3]]], ['One rectangle',[[2,4,7,9]]],
]);
suite('rectangle-area','vals',[
 ['Partial overlap',{ax1:-4,ay1:-2,ax2:5,ay2:6,bx1:1,by1:3,bx2:9,by2:8}],
 ['One contains the other',{ax1:0,ay1:0,ax2:9,ay2:9,bx1:2,by1:3,bx2:6,by2:7}],
 ['Touching edge',{ax1:0,ay1:0,ax2:4,ay2:5,bx1:4,by1:0,bx2:8,by2:5}],
 ['Disjoint',{ax1:-5,ay1:-5,ax2:-2,ay2:-1,bx1:2,by1:3,bx2:7,by2:8}],
]);
suite('sort-transformed-array','nums a b c',[
 ['Convex function crosses its vertex',[-9,-6,-2,1,4,8,13],2,-5,3],
 ['Concave parabola',[-7,-3,0,4,9],-2,3,5], ['Linear decreasing',[-5,-1,2,6],0,-3,7], ['Constant output',[-4,0,5,9],0,0,11],
]);
suite('minimum-time-difference','timePoints',[
 ['Several times and midnight wrap',['05:47','18:23','00:08','11:36','23:52']],
 ['Duplicate time',['07:19','16:42','07:19']], ['Across midnight',['23:58','00:03']], ['Opposite times',['04:17','16:17']],
]);
suite('one-edit-distance','s1 s2',[
 ['One insertion inside a longer word','riverbank','riverbanks'], ['One replacement','lantern','lantorn'],
 ['Equal is zero edits','meadow','meadow'], ['Two mismatches','cedar','cider'], ['Empty to one','','q'],
]);
suite('ones-and-zeroes','strs m n',[
 ['Competing resource costs',['01','001','110','0001','11','0','1010','1'],6,5],
 ['Zero zero-budget',['1','11','0','01'],0,3], ['Zero one-budget',['0','00','1','10'],3,0],
 ['Nothing fits',['000','111'],1,1],
]);
suite('task-scheduler','tasks n',[
 ['Competing frequencies need idle slots',Array.from('AAAAABBBBCCCDD'),3], ['No cooldown',Array.from('AAAABBBCC'),0],
 ['One task kind',Array.from('QQQQQ'),2], ['Enough distinct fillers',Array.from('AABBCCDDEEFF'),2],
]);
suite('rearrange-string-k-distance-apart','s k',[
 ['Several equally frequent choices','aaaabbbbccccdd',3], ['Impossible spacing','aaaaabbc',3],
 ['No spacing restriction','aabbccc',0], ['Already unique','planet',4],
]);
suite('super-washing-machines','machines',[
 ['Imbalances propagate both directions',[0,6,2,8,1,7]], ['Impossible average',[1,3,4]],
 ['Already balanced',[5,5,5,5]], ['One-sided surplus',[0,0,0,16]], ['Single machine',[9]],
]);
suite('sort-characters-by-frequency','s',[
 ['Several frequencies and case','mmmnnnnopppppQQrr'], ['All equal frequency','qwerty'],
 ['One character','z'], ['One repeated symbol','vvvvvv'],
]);
suite('max-product-word-lengths|maximum-product-of-word-lengths','words',[
 ['Long words compete for disjoint letters',['brick','stone','flame','quest','pond','rhythm','jazz']],
 ['Every pair overlaps',['aaa','ab','ac','ad']], ['One word',['river']], ['Repeated letters do not change mask',['aaaa','bbbbb','cc']],
]);
suite('min-cost-climbing-stairs','input',[
 ['Skipping expensive steps',[4,17,6,3,21,5,9,2,18,7]], ['Two steps',[13,8]],
 ['Zero-cost route',[0,7,0,9,0,12,0]], ['Equal costs',[6,6,6,6,6]],
]);
suite('student-attendance-record-ii','n',[
 ['Several recurrence transitions',9], ['One day',1], ['Two days',2], ['First forbidden triple',3], ['Longer bounded trace',14],
]);
suite('split-array-with-equal-sum','nums',[
 ['Four equal blocks with ignored separators','[2,3,9,1,4,8,5,7,2,3]'],
 ['Minimum valid split','[4,9,4,8,4,7,4]'], ['Impossible totals','[1,2,3,4,5,6,7]'], ['All zeroes','[0,0,0,0,0,0,0,0,0]'],
]);
suite('split-strings','strs',[
 ['Compare cyclic concatenation choices',['river','oak','cedar','birch']], ['Single string',['lantern']],
 ['Repeated strings',['ab','ab','ab']], ['One-letter words',['q','z','m','a']],
]);
suite('freedom-trail','ring key',[
 ['Repeated targets on both sides','abacdbecad','decab'], ['Same key repeated','pqprsp','pppp'],
 ['Single ring letter','q','qqq'], ['Opposite rotations compete','abcdefghi','iaei'],
]);
suite('count-the-repetitions','s1 n1 s2 n2',[
 ['Several cycle repetitions','abac',8,'aac',2], ['Missing required letter','pine',5,'oak',1],
 ['Exact repeated blocks','moss',6,'moss',2], ['Too few complete blocks','ab',2,'aabb',2],
]);
suite('brace-expansion-ii','expression',[
 ['Three products with nested alternatives','{m,n{o,p}}{q,{r,s}}{t,u}'],
 ['Duplicates merge across unions','{{ma,mb},{mb,mc},m{a,c}}'], ['Nested unions','{p,{q,{r,{s,t}}}}'],
 ['Literal prefix and suffix','pre{a,b{c,d}}post'], ['Single literal','maple'], ['Single alternative','{oak}'],
]);
suite('utf-8-validation','data',[
 ['Mixed valid byte lengths',[65,194,162,226,130,172,240,159,146,169]], ['Missing continuation',[226,130]],
 ['Unexpected continuation',[128]], ['Bad continuation prefix',[194,65]], ['ASCII only',[72,101,108,112]],
]);
suite('word-search','board word',[
 ['Turn several times without reusing cells',['RIVER','AXXXB','NXXXA','STONE'].map(r=>r.split('')),'RIVERBAENOTS'],
 ['Would require reusing a cell',[['A','B'],['C','D']],'ABAC'],
 ['Word absent',[['M','O','S'],['P','I','N']],'OAK'], ['Single cell match',[['Q']],'Q'],
]);
suite('word-search-ii','board words',[
 ['Shared prefixes and intersecting paths',['pine','axar','thiv','moss'].map(r=>r.split('')),['pine','pin','path','moss','river','oak']],
 ['No dictionary word',[['q','r'],['s','t']],['oak','pine']],
 ['Same word has several paths',[['a','a'],['a','a']],['a','aa','aaa','aaaa']], ['Single cell',[['z']],['z','zz']],
]);
suite('word-squares','words',[
 ['Several possible starting words',['maps','aret','peno','stow','amap']],
 ['One-letter squares',['q','r','s']], ['No complete square',['pine','moss','bark']], ['Symmetric two-word square',['ab','ba']],
]);
suite('zuma-game','board hand',[
 ['Bridge groups before collapse','RRYBBYYRR','YBR'], ['Already paired colors','RRBBYY','RBY'],
 ['Missing needed color','RRBB','YYY'], ['One ball','G','GG'],
]);
suite('remove-boxes','text',[
 ['Merge distant equal groups','[2,2,5,3,3,3,5,2,2]'], ['All equal','[7,7,7,7,7]'],
 ['All distinct','[2,4,6,8]'], ['Singleton','[9]'],
]);

suite('remove-nth-node','input',[
 ['Remove an interior node','[4,8,12,16,20,24,28,32]; 4'], ['Remove head','[3,7,11,15]; 4'],
 ['Remove tail','[5,9,13,17]; 1'], ['Remove only node','[23]; 1'],
]);
suite('find-median-data-stream','nums',[
 ['Alternating extremes rebalance heaps',[18,3,27,-4,12,35,7,21,0,16]], ['Increasing stream',[2,5,8,11,14,17]],
 ['Decreasing stream',[19,15,11,7,3]], ['Repeated medians',[6,6,6,6,6]], ['One value',[17]],
]);
suite('moving-average-data-stream','size stream',[
 ['Several evictions change the average',4,[12,3,18,-2,7,21,5,9,16]], ['Window one',1,[4,9,-3,12]],
 ['Stream shorter than window',7,[3,8,13]], ['Zeros and negatives',3,[-6,0,3,-9,0,12]],
]);
suite('min-stack','ops',[
 ['Repeated minima survive one pop',[{type:'push',val:8},{type:'push',val:3},{type:'push',val:3},{type:'getMin'},{type:'pop'},{type:'getMin'},{type:'push',val:-4},{type:'top'},{type:'getMin'},{type:'pop'},{type:'getMin'}]],
 ['Increasing stack',[{type:'push',val:2},{type:'push',val:7},{type:'push',val:12},{type:'getMin'},{type:'pop'},{type:'top'}]],
 ['Drain and reuse',[{type:'push',val:9},{type:'pop'},{type:'push',val:-6},{type:'getMin'}]],
]);
suite('lrucache','commands argsList',[
 ['Reads and updates change eviction order',['LRUCache','put','put','put','get','put','get','put','get','get','get'],[[3],[11,41],[22,52],[33,63],[11],[44,74],[22],[33,99],[44],[11],[33]]],
 ['Capacity one',['LRUCache','put','get','put','get','get'],[[1],[7,17],[7],[8,18],[7],[8]]],
 ['Overwrite existing key',['LRUCache','put','put','get','get'],[[2],[5,15],[5,35],[5],[9]]],
]);
suite('lfucache','capacity ops',[
 ['Frequency then recency breaks ties',3,[{type:'put',key:11,val:41},{type:'put',key:22,val:52},{type:'put',key:33,val:63},{type:'get',key:11},{type:'get',key:22},{type:'put',key:44,val:74},{type:'get',key:33},{type:'put',key:55,val:85},{type:'get',key:44},{type:'get',key:11}]],
 ['Zero capacity',0,[{type:'put',key:7,val:17},{type:'get',key:7}]],
 ['Update existing value',1,[{type:'put',key:5,val:15},{type:'put',key:5,val:35},{type:'get',key:5},{type:'put',key:8,val:18},{type:'get',key:5}]],
]);
suite('implement-trie','ops',[
 ['Shared prefixes and exact-word distinction',[['insert','rain'],['insert','rainbow'],['insert','river'],['search','rai'],['startsWith','rai'],['search','rain'],['insert','rai'],['search','rai'],['search','road']]],
 ['Duplicate insertion',[['insert','moss'],['insert','moss'],['search','moss'],['startsWith','mo']]],
 ['Missing prefix',[['insert','cedar'],['startsWith','oak'],['search','cedar']]],
]);
suite('all-o1-data-structure','operations',[
 ['Counts cross and keys disappear',[['inc','oak'],['inc','pine'],['inc','oak'],['inc','birch'],['inc','pine'],['inc','pine'],['getMaxKey'],['dec','oak'],['getMinKey'],['dec','oak'],['getMinKey'],['getMaxKey']]],
 ['Drain one key',[['inc','moss'],['dec','moss'],['getMaxKey'],['getMinKey']]],
 ['Repeated count changes',[['inc','river'],['inc','river'],['inc','river'],['dec','river'],['getMaxKey']]],
]);
suite('randomized-collection','ops',[
 ['Duplicate slots and removal swaps',[{type:'insert',val:7},{type:'insert',val:12},{type:'insert',val:7},{type:'insert',val:19},{type:'remove',val:12},{type:'insert',val:19},{type:'remove',val:7},{type:'getRandom'},{type:'remove',val:99},{type:'getRandom'}]],
 ['One value with duplicates',[{type:'insert',val:5},{type:'insert',val:5},{type:'remove',val:5},{type:'getRandom'}]],
 ['Drain then reinsert',[{type:'insert',val:8},{type:'remove',val:8},{type:'insert',val:14},{type:'getRandom'}]],
]);
suite('logger-rate-limiter|problem359','requests threshold',[
 ['Independent messages and exact expiry',[{timestamp:2,message:'rain'},{timestamp:4,message:'wind'},{timestamp:7,message:'rain'},{timestamp:11,message:'rain'},{timestamp:12,message:'rain'},{timestamp:14,message:'wind'},{timestamp:22,message:'rain'}],10],
 ['Same timestamp',[{timestamp:5,message:'oak'},{timestamp:5,message:'oak'},{timestamp:5,message:'pine'}],10],
 ['Every request expires',[{timestamp:3,message:'moss'},{timestamp:8,message:'moss'},{timestamp:13,message:'moss'}],5],
]);
suite('design-tic-tac-toe','n moves',[
 ['Row column and diagonal counts compete',4,[[0,0,1],[1,0,2],[1,1,1],[0,3,2],[2,2,1],[2,0,2],[3,3,1]]],
 ['Player two completes a column',3,[[0,0,1],[0,2,2],[1,0,1],[1,2,2],[2,1,1],[2,2,2]]],
 ['Single cell win',1,[[0,0,1]]],
]);
suite('design-snake-game','width height food commands',[
 ['Grow turn and follow the tail',5,4,[[0,1],[0,2],[1,2],[2,2],[2,1]],['R','R','D','D','L','U','L','D','D','R']],
 ['Wall collision',3,2,[],['R','R','R']], ['Food not on the route',4,3,[[2,3]],['R','D','L','U']],
]);
suite('random-pick-index','nums',[
 ['Repeated targets at distant indices',[8,3,8,12,5,8,3,17,8,5]], ['Every value unique',[2,6,10,14,18]],
 ['Every index eligible',[7,7,7,7,7]], ['Singleton',[19]],
]);
suite('random-pick-with-weight','w',[
 ['Uneven cumulative intervals',[2,7,1,9,4,6]], ['Equal weights',[3,3,3,3]], ['One dominant weight',[1,1,17,1]], ['Single index',[13]],
]);
suite('random-flip-matrix','m n',[
 ['Several rows and columns',4,5], ['One row',1,7], ['One column',6,1], ['Single available cell',1,1],
]);
suite('generate-random-point-in-a-circle','radius',[
 ['Larger sampling disk',7], ['Unit disk',1], ['Fractional radius',0.5], ['Small nonzero disk',0.1],
]);
suite('random-point-in-non-overlapping-rectangles','rects',[
 ['Different lattice-point weights',[[-6,-3,-3,1],[1,2,5,4],[8,-2,9,3]]], ['One lattice point',[[4,7,4,7]]],
 ['Thin rectangles',[[0,0,0,4],[3,1,7,1]]], ['Negative coordinates only',[[-9,-8,-6,-4]]],
]);
suite('range-sum-query-immutable','nums left right',[
 ['Interior query with negatives',[4,-7,12,3,-2,9,5,-6,8],2,7], ['Whole array',[-3,8,2,-5,11],0,4],
 ['Single position',[4,9,-2,7],2,2], ['Prefix includes index zero',[6,-3,8,2],0,2],
]);
suite('range-sum-query-mutable','nums operations',[
 ['Updates change overlapping queries',[4,-7,12,3,-2,9,5,-6],[{type:'sumRange',left:1,right:6},{type:'update',index:3,value:17},{type:'sumRange',left:2,right:5},{type:'update',index:0,value:-8},{type:'sumRange',left:0,right:7}]],
 ['Single cell update',[13],[{type:'sumRange',left:0,right:0},{type:'update',index:0,value:-4},{type:'sumRange',left:0,right:0}]],
 ['Repeated update',[2,6,10],[{type:'update',index:1,value:8},{type:'update',index:1,value:3},{type:'sumRange',left:0,right:2}]],
]);
suite('range-sum-query-2d-immutable','matrix row1 col1 row2 col2',[
 ['Interior rectangle',[[3,-2,7,4,9],[8,1,-5,6,2],[4,9,3,-1,7],[2,5,8,4,-3]],1,1,3,3],
 ['Whole matrix',[[2,5,8],[11,14,17]],0,0,1,2], ['Single cell',[[4,7],[9,12]],1,0,1,0],
 ['First row',[[3,8,13],[18,23,28]],0,0,0,2],
]);
suite('range-sum-query-2d-mutable','matrix operations',[
 ['Updates affect several rectangles',[[3,8,1,7],[4,-2,9,5],[6,0,2,11]],[{type:'sumRegion',row1:0,col1:1,row2:2,col2:3},{type:'update',row:1,col:2,value:-4},{type:'sumRegion',row1:1,col1:0,row2:2,col2:2},{type:'update',row:0,col:0,value:13},{type:'sumRegion',row1:0,col1:0,row2:2,col2:3}]],
 ['Single cell',[[7]],[{type:'update',row:0,col:0,value:-2},{type:'sumRegion',row1:0,col1:0,row2:0,col2:0}]],
 ['Unchanged update and full rectangle',[[2,5],[8,11]],[{type:'update',row:0,col:1,value:5},{type:'sumRegion',row1:0,col1:0,row2:1,col2:1}]],
]);
suite('n-ary-tree-level-order-traversal|nary-tree-level-order','root',[
 ['Several children with unequal depths',[10,null,20,30,40,null,50,60,null,70,null,80,90,null,100]],
 ['Single root',[17]], ['Wide root',[3,null,5,7,9,11,13]], ['Empty',[]],
]);
suite('serialize-deserialize-nary-tree','tree',[
 ['Uneven nested child groups',{val:10,children:[{val:20,children:[{val:50},{val:60,children:[{val:90}]}]},{val:30},{val:40,children:[{val:70},{val:80}]}]}],
 ['Single node',{val:17}], ['Wide root',{val:3,children:[{val:5},{val:7},{val:9},{val:11}]}],
]);
suite('serialize-and-deserialize-bst','tree',[
 ['Several recursive ranges',{val:18,left:{val:7,left:{val:3},right:{val:12}},right:{val:29,left:{val:24},right:{val:35}}}],
 ['Right chain',{val:3,right:{val:8,right:{val:15,right:{val:24}}}}], ['Single node',{val:17}],
]);
suite('flatten-a-multilevel-doubly-linked-list|flatten-multilevel-dll','structure',[
 ['Child chain interrupts a longer level','4->8->12->16->20->null with child [24->28->32->null] at 12'],
 ['No child chain','3->7->11->15->null'], ['Child at head','9->13->null with child [17->21->null] at 9'],
]);
suite('encode-nary-to-binary-tree','naryStructure',[
 ['Several sibling and child links','10->20,30,40->50,60,70->80,90'], ['Single root','17'],
 ['Wide sibling group','3->5,7,9,11,13'],
]);
suite('game-on-growing-tree','q parents',[
 ['Alternating branches and deeper descendants','12','1 1 2 2 3 4 4 6 3 8 8 10 11'],
 ['Long chain','7','1 2 3 4 5 6 7 8'], ['Wide star','7','1 1 1 1 1 1 1 1'],
]);
suite('encode-and-decode-tinyurl','url',[
 ['Path query and fragment','https://example.org/field-notes/river-walk?season=autumn&day=12#map'],
 ['Root URL','https://example.org/'], ['Encoded path','https://example.org/notes/quiet%20garden'],
]);
suite('smallest-rectangle-black-pixels','image x y',[
 ['Jagged connected region',['000000','001100','011110','000100','000000'],2,2],
 ['Single black pixel',['000','010','000'],1,1], ['Full image',['1111','1111','1111'],1,2],
 ['One column',['0','1','1','1','0'],2,0],
]);
suite('optimal-account-balancing','text',[
 ['Several debts cancel indirectly','[[0,1,12],[2,0,7],[1,3,5],[3,2,9],[4,1,6]]'],
 ['Already balanced','[[0,1,8],[1,0,8]]'], ['One debt','[[2,5,17]]'], ['Shared creditor','[[0,3,4],[1,3,7],[2,3,9]]'],
]);
suite('largest-palindrome-product','n',[['Two-digit factors',2],['One-digit factors',1],['Three-digit factors',3]]);
suite('verbal-arithmetic-puzzle','equation',[
 ['Repeated letters and column carries','BASE + BALL = GAMES'], ['Small carry','I + BB = ILL'],
 ['Repeated addends','A + A = B'], ['No valid distinct-digit solution','A + B = AA'],
]);

suite('251','input',[
 ['Uneven rows and empty gaps',[[3,7,11],[],[15],[19,23,27,31],[],[35,39]]], ['Only empty rows',[[],[],[]]],
 ['One row',[[4,8,12,16]]], ['One item',[[17]]],
]);
suite('252|253','input',[
 ['Nested meetings and touching ends',[[2,9],[4,6],[6,11],[10,14],[15,18],[16,20]]],
 ['All disjoint',[[1,3],[5,7],[9,11]]], ['All overlap',[[1,12],[2,10],[3,8],[4,6]]], ['One meeting',[[4,9]]], ['No meetings',[]],
]);
suite('254','input', [['Several factorization depths',[72]],['Prime has no split',[43]],['Perfect square',[49]],['One has no factors',[1]]]);
suite('255','input',[
 ['Several ancestor pops',[18,7,3,12,10,15,29,24,35]], ['Violates an ancestor bound',[18,7,3,12,29,10]],
 ['Right chain',[3,7,11,15]], ['Left chain',[15,11,7,3]],
]);
suite('256|265','input',[
 ['Competing colors across six houses',[[4,9,7],[8,3,6],[5,11,2],[9,4,7],[3,8,6],[7,5,12]]],
 ['Equal costs',[[5,5,5],[5,5,5],[5,5,5]]], ['One house',[[8,3,11]]], ['No houses',[]],
]);
suite('258','input',[['Several digit-sum rounds',[98765]],['Single digit',[7]],['Zero',[0]],['Multiple of nine',[9999]]]);
suite('259','input',[
 ['Many qualifying triples',[[-7,-3,1,4,8,12],9]], ['No triple',[[4,7,10],3]],
 ['Every triple qualifies',[[1,2,3,4],20]], ['Too few values',[[3,8],12]],
]);
suite('260','input',[
 ['Pairs cancel leaving two signs',[7,-3,12,7,5,12,9,5]], ['One unique is zero',[4,4,0,-8]],
 ['Two values',[13,27]], ['Different low bits',[-6,2,-6,9]],
]);
suite('261','input',[
 ['Several branches form one tree',[7,[[0,1],[0,2],[1,3],[1,4],[2,5],[5,6]]]],
 ['Cycle',[4,[[0,1],[1,2],[2,0],[2,3]]]], ['Disconnected',[5,[[0,1],[1,2],[3,4]]]], ['One vertex',[1,[]]],
]);
suite('263','input',[['Several allowed factors',[540]],['Other prime remains',[154]],['One',[1]],['Zero is excluded',[0]],['Negative is excluded',[-30]]]);
AUTHORED_EXAMPLES['264']=AUTHORED_EXAMPLES['ugly-number-ii'].map(e=>({label:e.label,input:[e.n]}));
suite('266','input',[
 ['Several pairs and one odd count',['mmnnooppq']], ['Two odd counts',['aabbcd']], ['Even counts',['xxyyzz']], ['Empty',['']],
]);
suite('267','input',[
 ['Several half-string permutations',['aabbccd']], ['All identical',['zzzzzz']], ['Two odd counts impossible',['aabbcd']], ['Singleton',['q']],
]);
suite('269','input',[
 ['Several ordering constraints',['za','zb','ca','cb','da','db']], ['Invalid prefix order',['pine','pin']],
 ['Cycle',['ax','bx','ay']], ['Only one word',['cedar']],
]);
suite('270','input',[
 ['Target between deep BST keys',[branchingTree,13.4]], ['Target below minimum',[branchingTree,-10]],
 ['Exact key',[branchingTree,24]], ['Single node',[[17],20]],
]);
suite('272','input',[
 ['Several values around target',[branchingTree,13.4,5]], ['One closest',[branchingTree,28.2,1]],
 ['Target outside range',[[8,3,14,1,6,10,19],30,3]], ['All nodes',[[8,3,14],9,3]],
]);
suite('273','input',[['Several nonzero scale groups',[704019208]],['Zero',[0]],['Internal zero groups',[5000007]],['Teen and tens',[1918]]]);
suite('274','input',[
 ['Several candidate h boundaries',[8,1,12,4,0,7,3,9]], ['No citations',[0,0,0,0]], ['Every paper qualifies',[7,8,9,10]], ['One paper',[12]],
]);
suite('275','input',AUTHORED_EXAMPLES['274'].map(e=>[e.label,[...e.input].sort((a,b)=>a-b)]));
suite('276','input',[['Several recurrence transitions',[8,3]],['One color becomes impossible',[4,1]],['One post',[1,5]],['Zero posts',[0,3]]]);
suite('277','input',[
 ['Celebrity after candidate replacements',[[[0,1,1,0],[0,0,1,1],[0,0,0,0],[1,0,1,0]]]],
 ['No celebrity',[[[0,1,0],[0,0,1],[1,0,0]]]], ['Single person',[[[0]]]],
]);
suite('280','input',[
 ['Several local swaps',[9,2,7,4,11,3,8,5,12]], ['Already wiggling',[2,8,3,9,4,10]], ['All equal',[6,6,6,6]], ['Singleton',[17]],
]);
suite('281','input',[
 ['Uneven vector exhaustion',[[3,7,11,15,19],[2,6,10]]], ['First empty',[[],[4,8,12]]], ['Both empty',[[],[]]], ['One each',[[5],[9]]],
]);
suite('282','input',[
 ['Several expression branches',['2345',17]], ['Zero restricts concatenation',['204',8]], ['No expression',['123',97]], ['Single digit',['7',7]],
]);
suite('284','input',[
 ['Repeated peeks do not advance',[[3,7,11,15],['peek','peek','next','peek','next','hasNext','next','next','hasNext']]],
 ['One value',[[17],['hasNext','peek','next','hasNext']]], ['Empty iterator',[[],['hasNext']]],
]);
suite('285','input',AUTHORED_EXAMPLES['inorder-successor-bst'].map(e=>[e.label,[e.tree,e.p]]));
const INF=2147483647;
suite('286','input',[
 ['Multiple gates separated by walls',[[[INF,-1,0,INF,INF],[INF,INF,INF,-1,INF],[INF,-1,INF,-1,INF],[0,INF,INF,INF,INF]]]],
 ['No gate',[[[INF,INF],[-1,INF]]]], ['Only gates',[[[0,0],[0,0]]]], ['One room beside gate',[[[0,INF]]]],
]);
suite('288','input',[
 ['Colliding abbreviations and exact matches',[['stone','stove','river','rider','oak'],['stone','style','river','oak','pine']]],
 ['Repeated dictionary word', [['moss','moss'],['moss','mess']]], ['Short words',[['a','an','at'],['a','as','at']]],
]);
suite('289','input',[
 ['Birth survival and overcrowding',[[0,1,0,0,0],[0,0,1,1,0],[1,1,1,0,0],[0,0,0,1,1],[0,0,0,1,1]]],
 ['Stable block',[[0,0,0,0],[0,1,1,0],[0,1,1,0],[0,0,0,0]]], ['Oscillator',[[0,1,0],[0,1,0],[0,1,0]]], ['Single cell dies',[[1]]],
]);
suite('290','input',[
 ['Repeated mappings in a longer pattern',['abacabad','oak pine oak moss oak pine oak reed']],
 ['Two symbols cannot share a word',['ab','oak oak']], ['Length mismatch',['aba','oak pine']], ['Consistent bijection',['abba','moss reed reed moss']],
]);
suite('291','input',[
 ['Several substring assignments',['abca','pineoakmosspine']], ['Repeated symbol',['aaaa','mossmossmossmoss']],
 ['Distinct symbols cannot share',['ab','qq']], ['No matching assignment',['aba','xyz']],
]);
suite('292','input',[['Several groups of four',[29]],['Losing multiple of four',[28]],['One stone',[1]],['Three stones',[3]]]);
suite('293|294','input',[
 ['Several separated playable runs',['++++-++-+++']], ['No legal move',['+-+-+-']], ['Only one move',['++']], ['All minus',['------']],
]);
suite('296','input',[
 ['Homes spread across the grid',[[[1,0,0,0,1],[0,0,1,0,0],[1,0,0,1,0],[0,1,0,0,1]]]],
 ['One home',[[[0,0,0],[0,1,0]]]], ['One row',[[[1,0,1,0,0,1]]]],
]);
suite('298','input',[
 ['Different branches restart counts',[[7,8,4,9,3,5,2,10,null,null,null,6]]],
 ['No consecutive edge',[[9,3,17,1,6]]], ['One chain',[[3,null,4,null,null,null,5]]], ['Singleton',[[17]]],
]);
AUTHORED_EXAMPLES['300']=AUTHORED_EXAMPLES['longest-increasing-subsequence'].map(e=>({label:e.label,input:e.nums}));
suite('reconstruct-itinerary','tickets',[
 ['Lexical choices with a necessary return',[['JFK','OSL'],['OSL','JFK'],['JFK','AMS'],['AMS','BER'],['BER','JFK'],['OSL','ROM'],['ROM','OSL']]],
 ['Repeated tickets',[['JFK','OSL'],['OSL','JFK'],['JFK','OSL']]], ['Single flight',[['JFK','LIS']]],
]);
suite('largest-bst-subtree','inputs',[
 ['One broken ancestor leaves a large BST',[18,7,29,3,12,10,35,1,5,9,15]], ['Whole tree is BST',branchingTree],
 ['Every duplicate breaks strictness',[6,6,6,6,6]], ['Singleton',[17]],
]);
suite('self-crossing','distances',[
 ['Spiral eventually closes inward',[3,5,7,9,8,6,4,2]], ['Expanding spiral',[2,4,6,8,10,12]],
 ['Touches starting edge',[3,3,3,3]], ['Too few segments',[4,7,9]],
]);
suite('house-robber-iii','inputs',[
 ['Grandchildren compete with parents',[8,13,6,4,7,12,3,9,null,2,11]], ['One node',[17]],
 ['All zero',[0,0,0,0,0]], ['Alternating chain',[4,9,null,3,null,12]],
]);
suite('nested-list-weight-sum|flatten-nested-list-iterator','inputs',[
 ['Several depths and empty groups',[3,[7,[],[2,-4]],[],5,[1,[6]]]], ['Flat list',[4,8,12]], ['Empty nesting',[[],[[]],[]]], ['Negative values',[-3,[-5,[-7]]]],
]);
suite('verify-preorder-serialization-tree','preorder',[
 ['Several completed subtrees','18,7,3,#,#,12,#,#,29,24,#,#,35,#,#'],
 ['Slots remain','8,3,#,#'], ['Extra node after complete tree','8,#,#,12'], ['Null tree','#'], ['Single node','17,#,#'],
]);
suite('increasing-triplet-subsequence','nums',[
 ['Both candidates replaced',[12,7,9,3,8,2,6,11]], ['Descending',[19,15,11,7,3]], ['Equal values',[6,6,6,6]], ['Triplet at end',[9,8,7,1,2,3]],
]);
suite('palindrome-pairs','words',[
 ['Reverse words palindromes and empty word',['moss','ssom','level','','ab','ba','aba']],
 ['No pair',['pine','oak','cedar']], ['Empty combines with palindrome',['','rotator','noon','abc']],
]);
suite('generalized-abbreviation','word',[
 ['Five independent abbreviation choices','plant'], ['One letter','q'], ['Two letters','ox'], ['Four letters','moss'],
]);
suite('find-right-interval','intervals',[
 ['Several successor searches',[[12,17],[2,6],[8,11],[18,23],[6,8]]], ['Touching endpoints',[[1,4],[4,9],[9,13]]],
 ['No successor',[[1,12],[3,10],[5,8]]], ['Single interval',[[4,9]]],
]);
suite('kth-smallest-lexicographical-order','n k',[
 ['Skip and descend prefix subtrees',734,219], ['First lexicographic value',91,1], ['Last rank',91,91], ['Singleton',1,1],
]);
suite('encode-string-with-shortest-length','s',[
 ['Repeated block within repeated block','ababcababcababc'], ['Encoding is not shorter','abcd'], ['Long single run','qqqqqqqqqqqq'], ['No repetitions','lantern'],
]);
suite('matchsticks-to-square','matchsticks',[
 ['Several assignments to four sides',[2,2,3,3,4,4,5,5]], ['Not divisible by four',[2,3,4,5,7]],
 ['Long stick cannot fit',[13,1,1,1]], ['Four equal sticks',[6,6,6,6]],
]);
suite('heaters','houses heaters',[
 ['Several nearest-heater regions',[1,3,7,10,14,18,23,29],[4,15,26]], ['One heater',[2,6,10,14],[8]],
 ['Heater at every house',[3,7,11],[3,7,11]], ['All houses on one side',[2,5,8],[17]],
]);
suite('find-permutation','s',[
 ['Several descending runs','IDDDIIDDI'], ['All increasing','IIIII'], ['All decreasing','DDDDD'], ['One relation','D'],
]);

suite('two-sum-iii','input',[
 ['Repeated additions and several queries',[['add',4],['add',9],['add',4],['find',8],['add',15],['find',24],['find',30]]],
 ['Cannot reuse one occurrence',[['add',7],['find',14]]], ['Negative pair',[['add',-4],['add',11],['find',7]]],
]);
suite('largest-number','input',[
 ['Prefix ordering differs from numeric order',[82,8,821,90,909,34,343,0]], ['All zeroes',[0,0,0]],
 ['Common prefix',[12,121,1212]], ['One value',[731]],
]);
suite('reverse-words-in-string-ii','input',[
 ['Several unequal words',Array.from('lanterns light the quiet river')], ['One word',Array.from('meadow')],
 ['Two short words',Array.from('oak pine')],
]);
suite('repeated-dna-sequences','input',[
 ['Overlapping repeated motifs',['ACGTACGTACGTACGTACGTACGT']], ['Disjoint repetition',['GATTACAGTAGGGGATTACAGTA']],
 ['Shorter than a window',['ACGTAC']], ['One window',['ACGTACGTAA']],
]);
suite('implement-stack-using-queues|implement-queue-using-stacks','input',[
 ['Interleaved writes and removals',[['push',4],['push',8],['peek'],['pop'],['push',12],['push',16],['pop'],['peek'],['empty']]],
 ['Drain and reuse',[['push',7],['pop'],['empty'],['push',19],['peek']]], ['Initially empty',[['empty']]],
]);
suite('summary-ranges','input',[
 ['Several runs and singletons',[-8,-7,-6,-2,1,2,3,7,11,12]], ['One whole run',[3,4,5,6,7]],
 ['All isolated',[2,5,8,11]], ['Empty',[]],
]);
suite('majority-element-ii','input',[
 ['Two candidates survive',[4,9,4,7,9,4,9,4,9]], ['No majority',[1,2,3,4,5,6]],
 ['One majority',[8,8,8,2,3]], ['Singleton',[17]],
]);
suite('delete-node-in-a-linked-list','input',[
 ['Delete an interior node',[[3,7,11,15,19,23],11]], ['Delete the head',[[4,8,12,16],4]],
 ['Delete the penultimate node',[[5,9,13,17],13]],
]);
suite('different-ways-to-add-parentheses','input',[
 ['Several split points',['3*5-2*4+7']], ['One operator',['8-3']], ['One number',['17']], ['Repeated values',['4+4*4']],
]);
suite('shortest-word-distance|shortest-word-distance-ii|shortest-word-distance-iii','input',[
 ['Several candidate position pairs',[['oak','pine','moss','oak','reed','pine','oak','moss','pine'],'oak','pine']],
 ['Only distant occurrences',[['oak','moss','reed','pine'],'oak','pine']],
 ['Adjacent words',[['cedar','pine','oak'],'pine','oak']],
]);
suite('strobogrammatic-number','input',[
 ['Several mirrored pairs',['619080619']], ['Invalid mirrored order',['619018619']], ['Invalid digit',['12321']], ['Zero',['0']],
]);
suite('strobogrammatic-number-ii','input',[['Several mirrored positions',[4]],['Odd center',[3]],['Single digit',[1]],['One pair',[2]]]);
suite('strobogrammatic-number-iii','input',[
 ['Several digit lengths',['80','2000']], ['Single valid point',['818','818']], ['No valid values',['12','15']], ['Includes zero',['0','11']],
]);
suite('group-shifted-strings','input',[
 ['Wraparound and repeated shift signatures',['bdf','ceg','xyz','yza','ace','a','q','ba','az']],
 ['Single-letter group',['m','n','z']], ['Distinct lengths',['a','ab','abc','abcd']],
]);
suite('count-univalue-subtrees','input',[
 ['Equal child roots hide a mismatch',[6,6,6,6,3,6,6,6,6]], ['Whole tree equal',[4,4,4,4,4,4,4]],
 ['Only leaves qualify',[8,3,14,1,6,10,19]], ['Single node',[17]],
]);
suite('zigzag-conversion','s numRows',[
 ['Several down-and-up cycles','LANTERNSBESIDETHERIVER',5], ['One row','SILVERBIRCH',1],
 ['More rows than characters','MOSS',7], ['Two rows','QUIETGARDEN',2],
]);
suite('implement-rand10','calls',[['Several rejection opportunities',16],['One sample',1],['Short sample',7]]);
suite('keyboard-row','words',[
 ['Mixed case and row membership',['Typewriter','Flask','Salsa','Zxcv','Moss','Qwerty','Hash']],
 ['No word fits',['pine','oak','cedar']], ['Single letters',['q','A','z']], ['Empty list',[]],
]);
suite('find-mode-bst','tree',[
 ['Two repeated modes',[8,4,12,4,6,12,15,4,null,null,null,12]], ['Every value tied',branchingTree],
 ['All equal',[7,7,7,7,7]], ['One node',[17]],
]);
suite('base-7','num',[['Several digits',2358],['Negative input',-782],['Zero',0],['Power of seven',2401]]);
suite('distribute-candies-to-people','n k',[
 ['Several rounds and final partial gift',83,5], ['One recipient',37,1], ['Fewer candies than people',3,7], ['Exact round total',36,4],
]);
suite('find-bottom-left-tree-value|find-largest-value-each-row','arr',treeShapes.filter(([,v])=>v.length));
suite('longest-uncommon-subsequence-i','a b',[
 ['Different longer strings','riverbank','silveroak'], ['Identical','lantern','lantern'],
 ['One empty','','meadow'], ['Equal lengths different values','pine','moss'],
]);
suite('longest-uncommon-subsequence-ii','strs',[
 ['Duplicates suppress long candidates',['river','river','rivr','pine','pin','oak']], ['All identical',['moss','moss','moss']],
 ['Longest is unique',['forest','rest','for','oak']], ['Same length distinct',['pine','reed','moss']],
]);
suite('student-attendance','s',[
 ['Late streaks reset before limit','PLLPPLAPLLPPL'], ['Two absences','PPALPPAP'], ['Three consecutive late','PPLLLPP'],
 ['One absence at the end','PPLLPPPA'], ['No late or absent','PPPPPP'],
]);
suite('optimal-division','array',[
 ['Several denominator factors','[840,7,3,5,2]'], ['Two values','[81,9]'], ['Single value','[17]'], ['Equal factors','[8,8,8,8]'],
]);
suite('brick-wall','wall',[
 ['Several competing internal seams',[[2,3,1,2],[4,2,2],[1,4,3],[2,2,4],[5,1,2]]],
 ['No internal seam',[[8],[8],[8]]], ['Perfectly aligned',[[2,3,3],[2,3,3],[2,3,3]]], ['One row',[[3,2,4]]],
]);
suite('next-greater-iii','n',[
 ['Long descending suffix',2476531], ['No larger permutation',97531], ['Repeated digits',1334221], ['Overflow on rearrangement',1999999999],
]);
suite('reverse-words-iii','s',[
 ['Unequal word lengths','Quiet lanterns illuminate river banks'], ['One word','meadow'], ['Single-letter words','a b c d'],
]);
suite('quad-tree','grid',[
 ['Uniform and mixed quadrants',[[1,1,0,1],[1,1,1,0],[0,0,1,1],[0,0,1,1]]], ['Uniform whole grid',[[1,1],[1,1]]],
 ['Checkerboard',[[0,1,0,1],[1,0,1,0],[0,1,0,1],[1,0,1,0]]], ['One cell',[[0]]],
]);
suite('max-depth-nary-tree','tree',AUTHORED_EXAMPLES['nary-tree-level-order'].map(e=>[e.label,e.root]));
suite('array-partition','array',[
 ['Pairing after several reorderings',[12,3,19,5,8,14,2,17,6,11]], ['Negative values',[-9,-3,-7,-1]],
 ['All equal',[6,6,6,6]], ['One pair',[4,13]],
]);
suite('find-the-celebrity-564','matrix',AUTHORED_EXAMPLES['277'].map(e=>[e.label,e.input[0]]));
suite('array-nesting','array',[
 ['Cycles of different lengths',[2,0,4,6,1,7,3,5]], ['One long cycle',[1,2,3,4,5,0]],
 ['Only self-cycles',[0,1,2,3,4]], ['Singleton',[0]],
]);
suite('max-distance','array',[
 ['Global extrema in different sorted arrays',[[-12,-4,3],[2,8,17],[-7,5,21],[0,6,11]]],
 ['Extrema in the same array',[[-9,19],[2,7],[4,11]]], ['Single-entry arrays',[[3],[17],[-5]]],
]);
suite('shortest-distance-ii','words word1 word2',[
 ['Several closer occurrences',['oak','pine','moss','oak','reed','pine','oak','moss'],'oak','pine'],
 ['Endpoints only',['oak','reed','moss','pine'],'oak','pine'], ['Adjacent',['pine','oak'],'pine','oak'],
]);
suite('distribute-candies','candies',[
 ['Several repeated types',[2,5,2,7,9,5,11,7,13,2]], ['Only one type',[8,8,8,8]],
 ['Every type unique',[2,4,6,8,10,12]], ['Two candies',[3,9]],
]);
suite('out-of-boundary','m n maxMove startRow startCol',[
 ['Several interior and boundary states',4,5,5,1,2], ['No moves',3,4,0,0,0],
 ['Single cell',1,1,3,0,0], ['One row',1,6,4,0,2],
]);
suite('shortest-unsorted','array',[
 ['Disorder expands past local inversions',[1,3,8,6,7,4,9,12,11,15]], ['Already sorted',[-3,0,4,9]],
 ['Descending',[17,12,7,2]], ['Equal values',[6,6,6,6]], ['Singleton',[19]],
]);
suite('delete-operation','s1 s2',[
 ['Several subsequence choices','riverbank','silverbranch'], ['Identical','lantern','lantern'],
 ['No shared characters','xyz','abc'], ['One empty','','cedar'],
]);
suite('erect-fence','points',[
 ['Boundary collinearity and interior points',[[0,0],[2,0],[5,0],[6,3],[5,6],[2,6],[0,4],[2,2],[4,3],[3,4]]],
 ['All collinear',[[1,2],[3,4],[5,6],[7,8]]], ['Triangle',[[0,0],[5,1],[2,6]]], ['Single point',[[4,7]]],
]);
suite('maximal-rectangle','matrix',[
 ['Competing wide and tall rectangles',['101110','111110','111011','011111','011110'].map(r=>r.split(''))],
 ['All ones',['1111','1111','1111'].map(r=>r.split(''))], ['All zeroes',[['0','0'],['0','0']]], ['One row',[['1','1','0','1','1','1']]],
]);

const employees=[
 {id:11,name:'Mira',salary:7200,managerId:null,departmentId:1},
 {id:12,name:'Oren',salary:8600,managerId:11,departmentId:1},
 {id:13,name:'Tara',salary:7200,managerId:11,departmentId:1},
 {id:14,name:'Ivo',salary:6400,managerId:11,departmentId:1},
 {id:15,name:'Nila',salary:8100,managerId:11,departmentId:2},
 {id:16,name:'Soren',salary:9300,managerId:11,departmentId:2},
 {id:17,name:'Eli',salary:8100,managerId:15,departmentId:2},
 {id:18,name:'Uma',salary:5900,managerId:15,departmentId:2},
];
const departments=[{id:1,name:'Design'},{id:2,name:'Research'},{id:3,name:'Operations'}];
suite('second-highest-salary|nth-highest-salary','employees n',[
 ['Repeated salaries and several ranks',employees,3], ['Every salary tied',employees.slice(0,3).map(e=>({...e,salary:7200})),2],
 ['Rank missing',employees.slice(0,2),5], ['One employee',employees.slice(0,1),1],
]);
suite('employees-earning-more|department-highest-salary|department-top-three-salaries','employees departments',[
 ['Ties managers and several departments',employees,departments], ['One department',employees.filter(e=>e.departmentId===1),departments.slice(0,1)],
 ['No employees',[],departments], ['Only one employee',employees.slice(0,1),departments],
]);
suite('managers-with-at-least-5-direct-reports','employees',[
 ['Exactly five direct reports',employees], ['Below the threshold',employees.filter(e=>e.id!==16)],
 ['No manager relationships',employees.map(e=>({...e,managerId:null}))],
]);
suite('median-employee-salary','employees',[
 ['Odd and even company groups',employees.map((e,i)=>({...e,company:i<5?'North':'South'}))],
 ['Tied salaries',employees.slice(0,4).map(e=>({...e,company:'West',salary:7000}))],
 ['Singleton company',[{id:21,name:'Arin',company:'East',salary:8300}]],
]);
suite('rank-scores','scores',[
 ['Several dense-rank ties',[{id:11,score:7.5},{id:12,score:9.2},{id:13,score:7.5},{id:14,score:8.1},{id:15,score:9.2},{id:16,score:6.8}]],
 ['All tied',[{id:21,score:8},{id:22,score:8},{id:23,score:8}]], ['One score',[{id:31,score:7.3}]],
]);
suite('consecutive-numbers','logs',[
 ['Several repeated runs',[7,7,7,3,3,9,9,9,9,7,2,2].map((num,i)=>({id:i+1,num}))],
 ['Repeated but not consecutive',[4,8,4,8,4,8].map((num,i)=>({id:i+1,num}))],
 ['Only two repeats',[{id:1,num:6},{id:2,num:6}]],
]);
const people=[{id:11,email:'mira@example.org'},{id:12,email:'oren@example.org'},{id:13,email:'mira@example.org'},{id:14,email:'tara@example.org'},{id:15,email:'oren@example.org'},{id:16,email:'mira@example.org'}];
suite('duplicate-emails|delete-duplicate-emails','person',[
 ['Several duplicate groups',people], ['All distinct',people.slice(0,2)], ['One record',people.slice(0,1)], ['Empty table',[]],
]);
suite('combine-two-tables','person address',[
 ['Matched missing and multiple addresses',[{personId:11,firstName:'Mira',lastName:'Vale'},{personId:12,firstName:'Oren',lastName:'Pine'},{personId:13,firstName:'Tara',lastName:'Reed'},{personId:14,firstName:'Ivo',lastName:'Lake'}],[{addressId:21,personId:11,city:'York',state:'North'},{addressId:22,personId:11,city:'Bath',state:'West'},{addressId:23,personId:13,city:'Leeds',state:'North'}]],
 ['No addresses',[{personId:31,firstName:'Nila',lastName:'Stone'}],[]], ['No people',[],[]],
]);
suite('customers-never-order','customers orders',[
 ['Some customers order repeatedly',[{id:11,name:'Mira'},{id:12,name:'Oren'},{id:13,name:'Tara'},{id:14,name:'Ivo'}],[{id:21,customerId:11},{id:22,customerId:11},{id:23,customerId:13}]],
 ['Nobody orders',[{id:31,name:'Nila'},{id:32,name:'Soren'}],[]],
 ['Everyone orders',[{id:41,name:'Eli'}],[{id:51,customerId:41}]],
]);
suite('rising-temperature','weather',[
 ['Rises falls and missing dates',[{id:11,recordDate:'2025-04-02',temperature:14},{id:12,recordDate:'2025-04-03',temperature:19},{id:13,recordDate:'2025-04-04',temperature:16},{id:14,recordDate:'2025-04-06',temperature:23},{id:15,recordDate:'2025-04-07',temperature:23},{id:16,recordDate:'2025-04-08',temperature:26}]],
 ['One day',[{id:21,recordDate:'2025-05-12',temperature:18}]], ['Empty table',[]],
]);
suite('word-frequency','input',[
 ['Several counts and whitespace',['moss pine moss\nriver pine moss\ncedar river pine moss']], ['All distinct',['oak birch reed']], ['One word repeated',['mist mist mist mist']],
]);
suite('valid-phone-numbers','input',[
 ['Valid formats and near misses',['415-738-2096\n(628) 471-8302\n628 471 8302\n(415)738-2096\n415-73-2096']],
 ['One valid number',['(312) 640-9758']], ['No valid line',['12345\nphone unavailable']],
]);
suite('transpose-file','input',[
 ['Several rows and columns',['name season score\nMira autumn 17\nOren spring 23\nTara winter 19']],
 ['One row',['oak pine birch cedar']], ['One column',['moss\nreed\nfern']],
]);
suite('tenth-line','input',[
 ['Before and after the tenth line',[Array.from({length:14},(_,i)=>`field note ${i+1}`).join('\n')]],
 ['Fewer than ten lines',['oak\npine\ncedar']], ['Exactly ten lines',[Array.from({length:10},(_,i)=>`entry ${i+1}`).join('\n')]],
]);
const activity=[{player_id:11,device_id:21,event_date:'2025-03-12',games_played:4},{player_id:12,device_id:22,event_date:'2025-03-11',games_played:0},{player_id:11,device_id:23,event_date:'2025-03-13',games_played:7},{player_id:13,device_id:24,event_date:'2025-03-10',games_played:3},{player_id:12,device_id:22,event_date:'2025-03-15',games_played:6},{player_id:13,device_id:25,event_date:'2025-03-11',games_played:8}];
suite('game-play-analysis-i|game-play-analysis-ii|game-play-analysis','activity',[
 ['Unsorted dates and device changes',activity], ['One login per player',activity.filter((_,i)=>[0,1,3].includes(i))],
 ['One player several days',activity.filter(a=>a.player_id===11)], ['Empty activity',[]],
]);
suite('design-log-storage-system','operations values',[
 ['Several timestamps and granularities',['LogSystem','put','put','put','put','retrieve','retrieve'],[[],[11,'2025:03:14:09:20:31'],[12,'2025:03:14:18:47:02'],[13,'2025:03:15:00:00:00'],[14,'2025:04:01:08:13:19'],['2025:03:14:12:00:00','2025:03:15:12:00:00','Day'],['2025:03:14:10:00:00','2025:03:14:19:00:00','Hour']]],
 ['Empty retrieval',['LogSystem','retrieve'],[[],['2025:01:01:00:00:00','2025:12:31:23:59:59','Year']]],
 ['Exact second',['LogSystem','put','retrieve'],[[],[21,'2025:06:12:13:14:15'],['2025:06:12:13:14:15','2025:06:12:13:14:15','Second']]],
]);
suite('find-customer-referee','customers refereeId',[
 ['Null allowed and excluded referee',[{id:11,name:'Mira',referee_id:null},{id:12,name:'Oren',referee_id:7},{id:13,name:'Tara',referee_id:3},{id:14,name:'Ivo',referee_id:7},{id:15,name:'Nila',referee_id:11}],7],
 ['All null referees',[{id:21,name:'Eli',referee_id:null},{id:22,name:'Uma',referee_id:null}],7], ['Empty table',[],7],
]);
suite('investments-2016','data',[
 ['Shared prior values and duplicate locations',[{pid:11,tiv_2015:120,tiv_2016:180,lat:1,lon:3},{pid:12,tiv_2015:120,tiv_2016:240,lat:2,lon:4},{pid:13,tiv_2015:170,tiv_2016:260,lat:1,lon:3},{pid:14,tiv_2015:170,tiv_2016:310,lat:5,lon:7},{pid:15,tiv_2015:220,tiv_2016:340,lat:8,lon:9}]],
 ['No shared prior value',[{pid:21,tiv_2015:130,tiv_2016:200,lat:0,lon:1},{pid:22,tiv_2015:180,tiv_2016:300,lat:2,lon:3}]], ['Empty table',[]],
]);
suite('cumulative-salary','employees',[
 ['Several months and a missing month',[{id:11,month:1,salary:4100},{id:11,month:2,salary:4300},{id:11,month:4,salary:4700},{id:11,month:5,salary:4900},{id:12,month:1,salary:3800},{id:12,month:2,salary:4200},{id:12,month:3,salary:4600}]],
 ['Only latest month',[{id:21,month:7,salary:5300}]], ['Empty table',[]],
]);
suite('count-students','students',[
 ['Unequal department populations',[{student_id:11,student_name:'Mira',department_id:1},{student_id:12,student_name:'Oren',department_id:1},{student_id:13,student_name:'Tara',department_id:2},{student_id:14,student_name:'Ivo',department_id:1},{student_id:15,student_name:'Nila',department_id:3},{student_id:16,student_name:'Eli',department_id:2}]],
 ['One department',[{student_id:21,student_name:'Uma',department_id:4}]], ['No students',[]],
]);
suite('largest-orders','orders customers',[
 ['Different order counts and totals',[{orderId:11,customerId:1,amount:70},{orderId:12,customerId:2,amount:180},{orderId:13,customerId:1,amount:90},{orderId:14,customerId:3,amount:240},{orderId:15,customerId:2,amount:130},{orderId:16,customerId:1,amount:110}],{1:'Mira',2:'Oren',3:'Tara'}],
 ['One order',[{orderId:21,customerId:4,amount:170}],{4:'Nila'}], ['No orders',[],{5:'Eli'}],
]);
suite('highest-answer-rate','questions answers',[
 ['Several questions with different responses',[{question_id:11},{question_id:12},{question_id:13}],[{question_id:11,answer_id:21},{question_id:11,answer_id:22},{question_id:12,answer_id:23}]],
 ['No answers',[{question_id:31},{question_id:32}],[]], ['One answered question',[{question_id:41}],[{question_id:41,answer_id:51}]],
]);
suite('262','input',[
 ['Banned users and cancellation categories',[[{id:11,client_id:1,driver_id:4,status:'completed',request_at:'2013-10-01'},{id:12,client_id:2,driver_id:4,status:'cancelled_by_client',request_at:'2013-10-01'},{id:13,client_id:3,driver_id:5,status:'cancelled_by_driver',request_at:'2013-10-02'},{id:14,client_id:1,driver_id:5,status:'completed',request_at:'2013-10-02'}],[{users_id:1,banned:'No'},{users_id:2,banned:'Yes'},{users_id:3,banned:'No'},{users_id:4,banned:'No'},{users_id:5,banned:'No'}]]],
 ['No trips',[[],[{users_id:7,banned:'No'}]]], ['All users banned',[[{id:21,client_id:1,driver_id:2,status:'completed',request_at:'2013-10-03'}],[{users_id:1,banned:'Yes'},{users_id:2,banned:'Yes'}]]],
]);
// A completed Latin-pattern Sudoku is independently constructed, then selected
// cells are removed. Each preset therefore has at least one valid completion.
const solvedSudoku=Array.from({length:9},(_,r)=>Array.from({length:9},(_,c)=>String((r*3+Math.floor(r/3)+c+4)%9+1)));
suite('sudoku-solver','board',[
 ['Several boxes rows and columns',solvedSudoku.map((row,r)=>row.map((v,c)=>(r*7+c*5)%4===0?'.':v))],
 ['Only one missing cell',solvedSudoku.map((row,r)=>row.map((v,c)=>r===7&&c===4?'.':v))],
 ['Already solved',solvedSudoku], ['One missing diagonal',solvedSudoku.map((row,r)=>row.map((v,c)=>r===c?'.':v))],
]);

function local(number, slug, map = e => e) {
  AUTHORED_EXAMPLES[`local:${number}`]=AUTHORED_EXAMPLES[slug].map(e=>({label:e.label,...map(e)}));
}
for(const [n,k] of Object.entries({12:'integer-to-roman',24:'swap-nodes-in-pairs',29:'divide-two-integers',43:'multiply-strings',68:'text-justification',111:'minimum-depth-of-binary-tree',142:'linked-list-cycle-ii',202:'happy-number',207:'course-schedule',212:'word-search-ii',267:'267',320:'generalized-abbreviation',331:'verify-preorder-serialization-tree',332:'reconstruct-itinerary',333:'largest-bst-subtree',335:'self-crossing',337:'house-robber-iii',339:'nested-list-weight-sum',341:'flatten-nested-list-iterator',342:'power-of-four',343:'integer-break',409:'longest-palindrome',505:'distribute-candies-to-people'}))local(n,k);
for(const [n,k,field] of [[121,'best-time-buy-sell-stock','prices'],[128,'longest-consecutive-sequence','nums'],[135,'candy','ratings'],[136,'single-number','nums']])local(n,k,e=>({input:JSON.stringify(e[field])}));
local(131,'palindrome-partitioning',e=>({input:e.s}));
local(134,'gas-station',e=>({values:{gas:JSON.stringify(e.gas),cost:JSON.stringify(e.cost)}}));
local(138,'copy-list-random',e=>({input:JSON.stringify(e.nodes.map(n=>[n.val,n.random]))}));
local(173,'validate-bst',e=>({input:e.arr}));
AUTHORED_EXAMPLES['local:173']=AUTHORED_EXAMPLES['local:173'].filter(e=>!e.label.includes('invalid')&&!e.label.includes('Duplicate'));
local(218,'skyline-problem',e=>({input:e.buildings}));
local(220,'contains-duplicate',e=>({input:e.nums}));
local(345,'reverse-vowels',e=>({s:e.input}));
local(364,'nested-list-weight-sum',e=>({list:e.inputs}));
local(374,'guess-number',e=>({input:{n:e.n,pick:e.pick}}));
local(382,'reverse-linked-list');
local(384,'contains-duplicate');
AUTHORED_EXAMPLES['local:384']=AUTHORED_EXAMPLES['local:384'].map(e=>({...e,nums:[...new Set(e.nums)]}));
local(404,'serialize-and-deserialize-bst');
local(414,'kth-largest-element',e=>({nums:e.nums}));
local(415,'multiply-strings');
local(421,'total-hamming-distance');
local(82,'remove-duplicates',e=>({input:e.nums}));
local(83,'remove-duplicates',e=>({input:e.nums}));
local(85,'maximal-rectangle',e=>({input:e.matrix}));
local(94,'serialize-deserialize');
local(90,'permutations-ii');
suite('local:5','value note',[
 ['Several palindrome islands','abnoonxcdedcypq','The longest candidate is internal; compare odd and even centers.'],
 ['Whole even palindrome','deffed','Expansion reaches both ends.'], ['Equal-length winners','abacdc','Compare how ties are retained.'],
 ['No repeated letter','qwerty','Every best candidate has length one.'],
]);
suite('local:171','s',[['Several base-26 positions','BQXZ'],['Last single letter','Z'],['First double letter','AA'],['Triple boundary','AAA']]);
suite('local:203','head val',[
 ['Matching head interior and tail',[7,7,3,11,7,15,19,7],7], ['Remove all',[4,4,4,4],4], ['No match',[2,6,10,14],8], ['Empty',[],5],
]);
suite('local:204','n',[['Several sieve passes',73],['Below first prime',2],['One above a prime',30],['Zero',0]]);
suite('local:205','s t',[
 ['Repeated patterns remain bijective','abacabad','xyxzxyxw'], ['Two sources share one target','abca','xxxx'], ['One mapping changes','moss','peep'], ['Equal strings','river','river'],
]);
suite('local:208','word operation',[
 ['Insert longer shared prefix','apricot','insert'], ['Exact stored word','apple','search'], ['Prefix without word ending','appl','search'], ['Missing branch','cedar','search'],
]);
suite('local:211','word isAdd',[
 ['Wildcard across stored words','b..','false'], ['Exact missing word','reed','false'], ['Insert longer word','river','true'], ['Several wildcard positions','.a.','false'],
]);
suite('local:216','k n',[
 ['Several distinct combinations',4,24], ['Smallest possible sum',3,6], ['Too small',4,7], ['All digits',9,45],
]);
suite('local:217','nums k',[
 ['Duplicate exactly at window boundary',[8,3,12,5,8,7,3,9],4], ['Outside the window',[4,7,10,13,4],3], ['Zero window',[6,6],0], ['Adjacent duplicates',[9,2,2,7],1],
]);
suite('local:219','nums k t',[
 ['Nearby values in sliding buckets',[4,12,7,19,9,24,15],3,2], ['Equal at exact distance',[8,3,12,8],3,0], ['Value difference too large',[2,9,16,23],2,3], ['No allowed distance',[5,5],0,0],
]);
suite('local:221','input',[
 ['Several growing square candidates',['101111','111111','011110','111110','011011'].map(r=>r.split(''))],
 ['All zeroes',[['0','0'],['0','0']]], ['All ones',[['1','1','1'],['1','1','1'],['1','1','1']]], ['One row',[['1','1','1','1']]],
]);
suite('local:309','prices',[
 ['Cooldown changes which rallies can combine',[8,3,9,2,7,1,12,4,10]], ['Strict decline',[17,12,8,3]], ['Flat market',[6,6,6,6]], ['One day',[13]],
]);
suite('local:351','nums',[
 ['Late bridges merge existing ranges',[8,2,12,4,10,3,9,11,7,6,5]], ['Repeated insertion',[4,4,7,7,5,6]], ['Descending contiguous',[9,8,7,6,5]], ['Singleton',[17]],
]);
suite('local:353','events',[
 ['Interleaved trips on several routes',[{type:'checkIn',id:11,stationName:'Pine',t:2},{type:'checkIn',id:12,stationName:'Pine',t:4},{type:'checkOut',id:11,stationName:'River',t:14},{type:'checkOut',id:12,stationName:'River',t:20},{type:'checkIn',id:11,stationName:'River',t:24},{type:'checkOut',id:11,stationName:'Hill',t:33}]],
 ['One completed journey',[{type:'checkIn',id:21,stationName:'Lake',t:7},{type:'checkOut',id:21,stationName:'Garden',t:26}]],
 ['Journey still active',[{type:'checkIn',id:31,stationName:'Harbor',t:5}]],
]);
suite('local:355','operations params',[
 ['Several authors and follow changes',['postTweet','postTweet','follow','postTweet','getNewsFeed','unfollow','getNewsFeed'],{postTweet:[[11,101],[12,202],[12,203]],follow:[[11,12]],unfollow:[[11,12]],getNewsFeed:[11,11]}],
 ['Only own posts',['postTweet','postTweet','getNewsFeed'],{postTweet:[[21,301],[21,302]],getNewsFeed:[21]}], ['Empty feed',['getNewsFeed'],{getNewsFeed:[31]}],
]);
suite('local:356','points',[
 ['Pairs reflect around a nonzero axis',[[1,2],[9,2],[3,5],[7,5],[5,8],[2,-1],[8,-1]]], ['One missing partner',[[1,2],[9,2],[3,5]]], ['Points on axis',[[4,1],[4,5],[4,9]]], ['Duplicate positions',[[2,3],[8,3],[2,3]]],
]);
suite('local:357','n',[['Several place-value choices',5],['Zero-digit bound',0],['One digit',1],['Two digits',2]]);
suite('local:361','grid',[
 ['Walls split enemy sight lines',['0E00W0','E0E0E0','00W0E0','E0000E'].map(r=>r.split(''))],
 ['No enemy',[['0','0'],['0','0']]], ['No placement cell',[['E','W'],['W','E']]], ['One row',[['E','0','E','W','E','0']]],
]);
suite('local:362','hits timestamp windowSize',[
 ['Hits on both sides of exact expiry',[2,50,101,199,200,201,350,499,500],500,300], ['Repeated timestamp',[7,7,7,7],7,300], ['All expired',[2,8,14],400,300], ['No hits',[],30,300],
]);
suite('local:363','matrix K',[
 ['Several row-pair compressions',[[3,-5,7,2],[-4,6,-2,1],[8,-3,4,-6]],9], ['Exact bound',[[2,5],[-3,4]],8], ['Negative bound',[[-7,-2],[-4,-5]],-3], ['One cell',[[6]],7],
]);
suite('local:365','a b z',[
 ['Several gcd reductions',9,14,11], ['Not divisible by gcd',8,12,7], ['Beyond total capacity',4,7,12], ['Zero target',6,10,0], ['One empty jug',0,9,9],
]);
suite('local:367','value',[['Larger perfect square',1369],['Just below',1368],['Just above',1370],['One',1]]);
suite('local:368','input',[
 ['Competing divisibility chains',[2,3,4,6,8,12,24,48]], ['Pairwise coprime',[5,7,11,13]], ['One long chain',[3,9,27,81]], ['Singleton',[17]],
]);
suite('local:370','length updates',[
 ['Overlapping positive and negative updates',10,[[1,6,4],[3,8,-2],[0,2,7],[7,9,5]]], ['Whole array',6,[[0,5,3]]], ['Single index',5,[[2,2,9]]], ['No updates',7,[]],
]);
suite('local:376','nums',[
 ['Several direction changes and plateaus',[8,3,11,11,5,14,2,9,6,13]], ['Increasing only',[2,5,8,11]], ['All equal',[6,6,6,6]], ['Singleton',[17]],
]);
suite('local:377','nums target',[
 ['Ordering creates several answers',[2,3,5],12], ['No exact total',[4,6],9], ['Zero target',[3,7],0], ['One denomination',[3],12],
]);
suite('local:378','matrix k',[
 ['Rank spans several sorted rows',[[2,6,11,18],[4,9,15,22],[8,13,19,27],[12,17,24,35]],10],
 ['Duplicate boundary',[[3,3],[3,8]],3], ['First rank',[[4,7],[6,11]],1], ['Last rank',[[4,7],[6,11]],4],
]);
suite('local:379','maxNumbers operations',[
 ['Exhaust release and reuse',3,[{type:'get'},{type:'get'},{type:'get'},{type:'get'},{type:'release',number:1},{type:'check',number:1},{type:'get'},{type:'check',number:1}]],
 ['Duplicate release',2,[{type:'get'},{type:'release',number:0},{type:'release',number:0},{type:'get'},{type:'get'}]],
 ['One number',1,[{type:'get'},{type:'check',number:0},{type:'get'}]],
]);
suite('local:380','operations',[
 ['Duplicates absent removals and slot swaps',[{type:'insert',val:7},{type:'insert',val:12},{type:'insert',val:7},{type:'insert',val:19},{type:'delete',val:12},{type:'delete',val:99},{type:'getRandom'}]],
 ['Drain then reuse',[{type:'insert',val:8},{type:'delete',val:8},{type:'insert',val:17},{type:'getRandom'}]],
 ['One member',[{type:'insert',val:23},{type:'getRandom'}]],
]);
suite('local:381','n blacklist',[
 ['Low blocked indices remap to high slots',15,[1,3,5,9,12]], ['No blocked index',7,[]], ['Only one allowed',5,[0,1,3,4]], ['Only high indices blocked',9,[6,7,8]],
]);
suite('local:383','ransomNote magazine',[
 ['Repeated requirements use separate letters','moonstone','stonemoonriver'], ['One count short','mossmoss','mossmos'], ['No letters available','oak',''], ['Extra letters allowed','pine','pineforest'],
]);
suite('local:385','input',[
 ['Several nesting depths and empty lists','[27,[-4,[],[8,13]],0,[6,[-9]]]'], ['Single signed number','-482'], ['Empty list','[]'], ['Nested empty list','[[],[[]]]'],
]);
suite('local:386','n',[['Several decimal prefix branches',137],['Cross first decimal boundary',12],['Single number',1],['Exact hundred',100]]);
suite('local:387','s',[
 ['Unique letter appears late','mmnnooppqrrsstt'], ['No unique letter','aabbccddeeff'], ['First character unique','zaabbcc'], ['Singleton','v'],
]);
suite('local:388','input',[
 ['Several branches and nested files','archive\n\tphotos\n\t\tautumn.png\n\tnotes\n\t\tfield\n\t\t\triver.txt\nreadme.md'],
 ['Only directories','forest\n\tpine\n\t\tcedar'], ['One root file','lantern.txt'], ['Sibling files','notes\n\ta.md\n\tlong-report.txt'],
]);
suite('local:389','s t',[
 ['Repeated letters and shuffled insertion','mississippi','imississippr'], ['Empty original','','q'], ['Repeated extra letter','moss','sosms'], ['Extra at front','river','ariver'],
]);
suite('local:390','n',[['Several direction reversals',73],['Power-of-two length',64],['One survivor initially',1],['Odd length',19]]);
suite('local:397','n',[['Several odd-even decisions',123],['Power of two',128],['Small odd exception',3],['Already one',1],['Signed upper bound',2147483647]]);
suite('local:403','stones expected',[
 ['Increasing jumps with alternatives',[0,1,2,4,7,11,16,22],true], ['Large gap blocks progress',[0,1,3,6,10,20],false], ['First jump unavailable',[0,2],false], ['Two stones',[0,1],true],
]);
suite('local:405','num', [['Several hex digits',731045],['Negative two-complement',-482],['Zero',0],['Signed minimum',-2147483648]]);
const queueHeights=[9,5,7,5,11,8,6,10];
const queuePeople=queueHeights.map((h,i)=>[h,queueHeights.slice(0,i).filter(x=>x>=h).length]);
suite('local:406','people',[
 ['Repeated heights and several insertion positions',[...queuePeople].reverse()], ['All equal',[[6,2],[6,0],[6,3],[6,1]]], ['One person',[[17,0]]], ['Strict heights',[[4,0],[8,0],[12,0]]],
]);
suite('local:408','word abbr expected',[
 ['Several skip groups','characterization','c4c3i5n',true], ['Leading zero is invalid','riverbank','r07k',false],
 ['Skip whole word','lantern','7',true], ['Skip beyond end','meadow','m9w',false], ['No abbreviation','pine','pine',true],
]);
suite('local:410','nums m',[
 ['Several competing cut positions',[9,3,14,2,8,11,5,7],3], ['One partition',[4,8,12,16],1], ['Each element separate',[3,9,2,7],4], ['Equal values',[6,6,6,6,6,6],3],
]);
suite('local:411','word dictionary',[
 ['Several conflicting positions','planet',['planer','placer','plated','plates','plants']], ['No equal-length competitor','moss',['river','oak']], ['One mismatch','pine',['wine']],
]);
suite('local:412','n',[['Several shared multiples',32],['Only ordinary values',2],['First shared multiple',15],['One value',1]]);
suite('local:413','nums',[
 ['Several contiguous arithmetic runs',[2,5,8,11,7,3,-1,4,9,14]], ['All equal',[6,6,6,6,6]], ['No arithmetic triple',[1,2,4,8]], ['Too short',[4,9]],
]);
suite('local:417','input',[
 ['Plateaus and ridges',[[4,4,5,7,9],[3,6,6,8,7],[2,5,9,6,5],[1,4,7,4,3]]], ['Flat terrain',[[6,6,6],[6,6,6]]], ['One row',[[3,8,2,9,4]]], ['Single cell',[[17]]],
]);
suite('local:418','sentence rows cols',[
 ['Several wraps and partial final sentence',['moss','by','river'],7,13], ['Word wider than row',['lantern'],4,5], ['Exact word boundary',['oak','pine'],3,8], ['One short word',['reed'],5,10],
]);
suite('local:419','board',[
 ['Several separated horizontal and vertical ships',['XX...X','. ...X'.replace(' ','.'),'...X..','...X..','X.....'].map(r=>r.split(''))],
 ['No ships',[['.','.'],['.','.']]], ['One long ship',[['X','X','X','X','X']]], ['Single ship cell',[['X']]],
]);
suite('local:420','password',[
 ['Too long with several repeating runs','aaaaBBBB1111ccccDDDD2222'], ['Already meets conditions','River7!bank'], ['Too short','q2'], ['Missing digit','QuietGarden'], ['Only one repeated kind','mmmmmmm'],
]);
suite('local:422','words',[
 ['Synthetic symmetric character square',['maps','aret','peno','stow']], ['One off-diagonal mismatch',['maps','aret','pano','stow']], ['Ragged invalid shape',['moss','oak','reed']], ['Single letter',['q']],
]);

suite('squirrel-distribution','trees squirrel chairs',[
 ['Several candidate assignments',[2,7,12,18,23],9,[1,6,11,17,24]], ['One destination',[14],3,[8]],
 ['Already aligned',[4,9,15],9,[4,9,15]],
]);
suite('local:506','nums',[
 ['Ranks differ from original positions',[42,17,89,63,28,75,51,96]], ['Already descending',[90,70,50,30]], ['Two athletes',[35,81]], ['One athlete',[67]],
]);
suite('local:507','n',[['Several divisor pairs',496],['Larger perfect number',8128],['Abundant number',36],['Deficient number',29],['One',1]]);
suite('local:547','isConnected',[
 ['Three components of different sizes',[[1,1,0,0,0,0],[1,1,1,0,0,0],[0,1,1,0,0,0],[0,0,0,1,1,0],[0,0,0,1,1,0],[0,0,0,0,0,1]]],
 ['All isolated',[[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,0,1]]], ['One chain',[[1,1,0,0],[1,1,1,0],[0,1,1,1],[0,0,1,1]]], ['One city',[[1]]],
]);
suite('local:63','m n obstacleGrid',[
 ['Several detours',4,6,[[0,0,0,0,0,0],[0,1,0,1,0,0],[0,0,0,0,1,0],[0,1,0,0,0,0]]],
 ['Blocked start',2,3,[[1,0,0],[0,0,0]]], ['Blocked end',2,3,[[0,0,0],[0,0,1]]],
 ['Single blocked corridor',1,5,[[0,0,1,0,0]]], ['Open single cell',1,1,[[0]]],
]);
suite('local:65','s',[
 ['Signed decimal exponent','-734.062e+12'], ['Leading decimal point','+.729'], ['Trailing decimal point','83.'],
 ['Missing exponent digits','7.3e+'], ['Double sign','--42'], ['Embedded letter','93q2'], ['Decimal exponent invalid','7e2.5'],
]);
local(695,'max-area-of-island');
suite('local:721','accounts',[
 ['Transitive merges and same-name separation',[['Mira','m1@example.org','m2@example.org'],['Mira','m3@example.org','m4@example.org'],['Mira','m2@example.org','m3@example.org'],['Mira','m9@example.org'],['Oren','o1@example.org','o2@example.org']]],
 ['Repeated email in one account',[['Tara','t1@example.org','t1@example.org']]], ['Disjoint accounts',[['Ivo','i1@example.org'],['Nila','n1@example.org']]],
]);
suite('local:743','n k times',[
 ['Later relaxation improves an earlier route',6,1,[[1,2,8],[1,3,2],[3,2,3],[2,4,2],[3,5,7],[4,5,1],[5,6,4],[1,6,20]]],
 ['Unreachable node',4,1,[[1,2,3],[2,3,4]]], ['Cycle',3,2,[[2,1,4],[1,3,2],[3,2,1]]], ['One node',1,1,[]],
]);
suite('local:778','input',[
 ['Several competing elevation routes',[[0,7,12,15],[1,6,11,14],[2,5,10,13],[3,4,8,9]]],
 ['High start',[[3,0],[2,1]]], ['High destination',[[0,2],[1,3]]], ['Single cell',[[0]]],
]);
suite('local:80','nums',[
 ['Several runs exceed two copies',[-4,-4,-4,-1,2,2,2,2,7,7,11,11,11]], ['All equal',[6,6,6,6,6]],
 ['No excess copies',[2,2,5,5,8,8]], ['One value',[17]],
]);
suite('local:86','list x',[
 ['Both partitions interleaved',[9,3,12,5,7,2,11,6,4],7], ['All below',[2,4,6],9],
 ['All at least pivot',[8,11,14],5], ['Several equal to pivot',[5,2,5,7,5,1],5],
]);
suite('local:875','piles h',[
 ['Several binary-search refinements',[17,8,29,13,24,6,31],18], ['One hour per pile',[9,15,23,7],4],
 ['Enough time for speed one',[4,7,9],20], ['One large pile',[173],19],
]);
suite('local:92','list left right',[
 ['Reverse an interior segment',[3,7,11,15,19,23,27,31],3,7], ['Whole list',[4,8,12,16],1,4],
 ['One-position segment',[5,9,13,17],2,2], ['Suffix',[2,6,10,14,18],3,5],
]);
suite('local:95','n',[['Several subtree combinations',4],['Single tree',1],['Two root choices',2],['Three-key combinations',3]]);
suite('local:96','n',[['Several Catalan recurrence rows',8],['Single key',1],['Two keys',2],['Larger count',12]]);
suite('local:99','tree',[
 ['Nonadjacent inorder values swapped',[18,29,7,3,12,24,35]], ['Adjacent inorder swap',[12,7,29,3,18,24,35]],
 ['Root and leaf swapped',[3,7,29,18,12,24,35]], ['Two-node reversal',[4,9]],
]);
function jsonSuite(number,rows){suite(`local:${number}`,'input',rows.map(([label,value])=>[label,JSON.stringify(value)]));}
jsonSuite(3894,[['Inside red interval',74],['Green boundary',0],['Before orange',29],['Orange boundary',30],['First red',31],['Last red',90],['After red',91],['Upper input bound',1000]]);
jsonSuite(3895,[['Repeated matches in several positions',{nums:[70707,1727,700,987,77,2702,471],digit:7}],['Digit absent',{nums:[123,456,891],digit:7}],['Internal zeroes',{nums:[10001,20200,300],digit:0}],['Single digit',{nums:[8],digit:8}]]);
jsonSuite(3896,[['Mixed prime and nonprime runs',[4,9,2,5,8,11,13,6,15,17]],['Already alternating',[2,4,5,6,7,8]],['Impossible imbalance',[2,3,5,7,4]],['No prime',[4,6,8,9]],['Singleton',[13]]]);
jsonSuite(3899,[['Larger scalene triangle',[17,25,31]],['Right triangle',[8,15,17]],['Degenerate sum',[7,12,19]],['Cannot form triangle',[4,9,20]],['All equal',[11,11,11]]]);
jsonSuite(3905,[['Several competing source regions',{n:5,m:6,sources:[[0,0,2],[4,5,7],[1,4,4],[3,1,9]]}],['One source',{n:3,m:5,sources:[[1,2,6]]}],['Equal-distance tie',{n:1,m:5,sources:[[0,0,3],[0,4,8]]}],['Single cell',{n:1,m:1,sources:[[0,0,5]]}]]);
jsonSuite(3908,[['Several repeated digits',{n:7071707,x:7}],['Zero inside',{n:3020405,x:0}],['Digit absent',{n:8642,x:3}],['Single digit',{n:8,x:8}]]);
jsonSuite(3909,[['Several competing runs',[7,3,5,8,2,6,9,4,1,10]],['Increasing',[2,5,8,11,14]],['Decreasing',[19,15,11,7,3]],['All equal',[6,6,6,6]],['Singleton',[17]]]);
jsonSuite(3910,[['Branched tree with competing paths',{nums:[1,0,1,1,0,0,1,1,0],edges:[[0,1],[0,2],[1,3],[1,4],[2,5],[2,6],[5,7],[5,8]]}],['All zero',{nums:[0,0,0,0],edges:[[0,1],[1,2],[2,3]]}],['All one',{nums:[1,1,1,1],edges:[[0,1],[0,2],[0,3]]}],['Singleton',{nums:[1],edges:[]}]]);
jsonSuite(3912,[['Repeated records and several changes',[4,7,7,2,9,4,11,3,11,8]],['All equal',[6,6,6,6]],['Increasing',[2,5,8,11]],['Singleton',[17]]]);
jsonSuite(3913,[['Several vowel groups','quietautumnrivermeadow'],['No vowels','rhythms'],['Only vowels','uoieaaiou'],['Single vowel','e']]);
jsonSuite(3914,[['Several descending boundaries',[8,8,6,7,4,5,2,3,1]],['Already increasing',[2,5,8,11]],['All equal',[6,6,6,6]],['Single descent',[3,7,2,5]],['Singleton',[17]]]);
jsonSuite(3915,[['Spacing competes with alternating gains',{nums:[8,3,14,6,11,2,17,5,13,7],k:2}],['Spacing permits only singleton',{nums:[4,9,2,7],k:4}],['Equal values cannot alternate',{nums:[6,6,6,6,6],k:1}],['Adjacent alternation',{nums:[3,12,4,15,5,18],k:1}],['Singleton',{nums:[17],k:1}]]);
jsonSuite('stableIndex',[['Several prefix and suffix updates',{nums:[9,2,5,1,7,4,11,8,13],k:5}],['No stable index',{nums:[9,7,5,3],k:1}],['Equality at threshold',{nums:[7,3,5],k:4}],['Singleton zero',{nums:[0],k:0}]]);

suite('next-pointers-perfect','input',[
 ['Cross-parent links on four levels','[18,7,29,3,12,24,35,1,5,10,15,21,26,32,41]'],
 ['Repeated values still have separate links','[6,6,6,6,6,6,6]'], ['Single root','[17]'], ['Empty tree','[]'],
]);
suite('next-pointers-sparse','input',[
 ['Cross several missing children',JSON.stringify(sparseTree)], ['Single-child chain',JSON.stringify(leftChain)],
 ['Repeated values','[6,6,6,null,6,6]'], ['Single root','[17]'], ['Empty tree','[]'],
]);
suite('pascal-triangle','input',[['Several interior recurrences','9'],['First row','1'],['First interior coefficient','3'],['Even row count','6']]);
suite('pascal-row','input',[['Several in-place updates','11'],['Zero index','0'],['One index','1'],['Even middle index','8']]);
suite('valid-sudoku','board',[
 ['Valid partially filled board',AUTHORED_EXAMPLES['sudoku-solver'][0].board],
 ['Duplicate in a row',solvedSudoku.map((row,r)=>row.map((v,c)=>r===0&&c===1?row[0]:v))],
 ['Duplicate in a column',solvedSudoku.map((row,r)=>row.map((v,c)=>r===1&&c===0?solvedSudoku[0][0]:v))],
 ['Only a box collision',Array.from({length:9},(_,r)=>Array.from({length:9},(_,c)=>(r===0&&c===0)||(r===1&&c===1)?'7':'.'))],
 ['Empty valid board',Array.from({length:9},()=>Array(9).fill('.'))],
]);
// Rank parameters are intentionally absent for Third Maximum Number.
AUTHORED_EXAMPLES['local:414']=AUTHORED_EXAMPLES['local:414'].filter((e,i,a)=>a.findIndex(other=>JSON.stringify(other.nums)===JSON.stringify(e.nums))===i);
AUTHORED_EXAMPLES['surrounded-regions']=AUTHORED_EXAMPLES['surrounded-regions'].map(e=>({...e,input:JSON.stringify(JSON.parse(e.input).map(row=>row.split('')))}));
for(const key of ['valid-palindrome','palindrome-partitioning-ii'])AUTHORED_EXAMPLES[key]=AUTHORED_EXAMPLES[key].map(e=>({...e,input:e.s}));
AUTHORED_EXAMPLES['word-break']=AUTHORED_EXAMPLES['word-break'].map(e=>({...e,input:`${e.s} | ${e.dict.join(', ')}`}));
AUTHORED_EXAMPLES['linked-list-cycle']=AUTHORED_EXAMPLES['linked-list-cycle'].map(e=>({...e,input:`${JSON.stringify(Array.from({length:e.nodeCount},(_,i)=>4+i*3))} | pos=${e.tail}`}));
AUTHORED_EXAMPLES['linked-list-cycle-ii']=AUTHORED_EXAMPLES['linked-list-cycle-ii'].map(e=>({label:e.label,nodes:JSON.parse(e.values.nodes),pos:e.values.pos}));
jsonSuite(3908,[['Repeated digit inside',{n:27077,x:7}],['Zero inside',{n:30204,x:0}],['Digit absent',{n:8642,x:3}],['Single digit',{n:8,x:8}],['Zero itself',{n:0,x:0}]]);
jsonSuite(3909,[['Long unequal sides',[2,5,9,14,21,18,13,8,4]],['Increasing only',[2,5,8,11,14]],['Decreasing only',[19,15,11,7,3]],['Equal side sums',[3,8,15,8,3]],['Minimum length',[4,9,2]]]);

// Adapter aliases reflect actual input contracts of legacy and newer consumers.
// Keep one authored input while both renderers are still present in the repo.
function adapt(key,fn){AUTHORED_EXAMPLES[key]=AUTHORED_EXAMPLES[key].map(e=>({...e,...fn(e)}));}
adapt('binary-tree-level-order-ii',e=>({arr:e.root}));
adapt('binary-tree-level-order-traversal-ii',e=>({arr:e.root}));
adapt('valid-parentheses',e=>({input:e.s}));
adapt('bitwise-and-of-numbers-range',e=>({input:[e.left,e.right]}));
adapt('invert-binary-tree',e=>({input:e.arr}));
adapt('number-of-digit-one',e=>({input:[e.n]}));
adapt('search-a-2d-matrix-ii',e=>({input:[e.matrix,e.target]}));
adapt('local:309',e=>({input:e.prices}));
adapt('increasing-triplet-subsequence',e=>({inputs:e.nums}));
adapt('palindrome-pairs',e=>({inputs:e.words}));
adapt('design-snake-game',e=>({moves:e.commands}));
adapt('non-overlapping-intervals',e=>({intervals:JSON.parse(e.val)}));
adapt('path-sum-iii',e=>({tree:e.root,target:e.targetSum}));
adapt('add-two-numbers-ii',e=>({list1:e.l1,list2:e.l2}));
adapt('delete-node-in-a-bst',e=>({tree:e.root}));
adapt('4sum-ii',e=>({nums1:e.nums[0],nums2:e.nums[1],nums3:e.nums[2],nums4:e.nums[3]}));
adapt('assign-cookies',e=>({size:e.cookies}));
adapt('can-i-win',e=>({maxChoosable:e.maxChoosableInteger}));
adapt('validate-ip-address',e=>({ip:e.queryIP}));
adapt('matchsticks-to-square',e=>({nums:e.matchsticks}));
adapt('generate-random-point-in-a-circle',()=>({x_center:3,y_center:-2}));
adapt('teemo-attacking',e=>({timeSeries:e.attackTime}));
adapt('diagonal-traverse',e=>({mat:e.matrix}));
adapt('most-frequent-subtree-sum',e=>({arr:e.tree}));
adapt('inorder-successor-bst',e=>({values:e.tree,target:e.p}));
adapt('random-flip-matrix',e=>({flips:Array.from({length:Math.min(e.m*e.n,8)},(_,i)=>[Math.floor(i/e.n),i%e.n])}));
adapt('longest-word-dictionary',e=>({s:'plantstonetransport',dictionary:e.words}));
adapt('optimal-division',e=>({nums:JSON.parse(e.array)}));
adapt('reverse-words-iii',e=>({input:e.s}));
adapt('array-partition',e=>({nums:e.array}));
adapt('find-the-celebrity-564',e=>({n:e.matrix.length}));
adapt('max-distance',e=>({arrays:e.array}));
adapt('shortest-unsorted',e=>({nums:e.array}));
adapt('zigzag-conversion',e=>({value:e.s,rows:e.numRows}));
adapt('max-area-of-island',e=>({gridStr:JSON.stringify(e.grid)}));
adapt('string-to-integer-atoi',e=>({s:e.value}));
adapt('local:875',e=>({input:{piles:e.piles,h:e.h}}));
adapt('count-and-say',e=>({input:[e.n]}));
adapt('median-employee-salary',e=>({table:e.employees.map(r=>`${r.id},${r.company},${r.salary}`).join('\n')}));
adapt('managers-with-at-least-5-direct-reports',e=>({table:e.employees.map(r=>`${r.id},${r.name},${r.managerId??'null'}`).join('\n')}));
for(const key of ['nth-digit','student-attendance-record-ii'])adapt(key,e=>({n:String(e.n)}));
adapt('highest-answer-rate',e=>({questions:e.questions.map((q,i)=>({id:q.question_id,submissions:3+i*2})),answers:e.answers.map((a,i)=>({...a,id:i+1,is_accepted:1}))}));
