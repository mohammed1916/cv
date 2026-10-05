export const trieSpecs = {
648:['dictionary sentence','Replace each sentence word by its shortest dictionary root.','A shared prefix trie makes the first terminal node the shortest matching root. Stop immediately there; missing edges leave the original word unchanged.','build a trie and mark complete roots|for each sentence word, start at the trie root|follow character edges until missing or terminal|append the shortest root, otherwise the original word|return the joined sentence','O(dictionary characters + sentence characters) time; O(dictionary characters) trie space.'],
677:['operations','Maintain key values and answer sums over every key sharing a prefix.','Each node stores the aggregate of complete keys beneath it. Replacing a key changes every ancestor by new value minus old value, preventing double counting.','initialize trie aggregates and original key values|for each insert or prefix-sum operation|follow the key or prefix path|insert applies the value delta; sum reads the prefix aggregate|return answers to sum operations','O(total operation characters) time; O(distinct key characters) trie and key-value space.'],
720:['words','Find the longest dictionary word buildable one character at a time from other dictionary words.','Every prefix along a candidate path must be terminal. Among valid candidates prefer length first and then the smaller lexicographic word.','insert dictionary words into a trie|for each candidate start at the root|require every traversed prefix node to be terminal|retain the longest candidate, breaking ties lexicographically|return best word or empty string','O(total word characters) time and trie space.'],
820:['words','Find the shortest suffix-based reference encoding length, including separators.','Reverse words so common suffixes share prefix paths. Only leaves require separate encoded words; internal terminal words already appear as suffixes of longer words.','insert reversed distinct words into a trie|inspect trie nodes|ignore internal terminals already covered by longer words|for each leaf add word length plus one separator|return total encoding length','O(total word characters) time and trie space.'],
1032:['words queries','After each streamed character, determine whether any dictionary word is a current suffix.','A reversed-word trie lets each query walk backward from the newest character. Stop at the first terminal or missing edge, retaining only the longest useful suffix.','insert reversed words and bound stream history by longest word|append each incoming character|walk reversed recent characters through the trie|record true at a terminal, otherwise false when no path remains|return one boolean per incoming character','O(dictionary characters + queries*longest word) time; trie space plus bounded stream history.'],
1268:['products searchWord','Show at most three lexicographically smallest products for every typed prefix.','Insert products in sorted order and cache the first three at each prefix node. Queries follow one edge per typed character and read the cached list.','sort products and build prefix suggestion lists|for each typed character|follow its prefix edge, keeping absent prefixes absent|append up to three cached suggestions|return suggestions for every prefix','O(n log n + total product characters + output size) time; O(total product characters) trie space.'],
1804:['operations','Support repeated word insertion, exact and prefix counts, and single-occurrence erasure.','Passing counts include every occurrence below a node; terminal counts include only words ending there. Erase decrements one occurrence without removing shared paths.','initialize trie passing and terminal counts|for each word operation|follow or create the word path|update occurrence counts or read exact/prefix count|return answers from count operations','O(total operation characters) time; O(total inserted characters) trie space.'],
};

export const triePseudocodeStages = {
648:{insert:1,store:1,lookup:3,missing:3,accept:4,append:4},
677:{accumulate:4,lookup:3,answer:4},
720:{insert:1,store:1,lookup:3,accept:4},
820:{insert:1,store:1,accumulate:4},
1032:{insert:1,store:1,lookup:3,missing:3,answer:4},
1268:{insert:1,answer:4},
1804:{insert:4,erase:4,store:4,lookup:3,answer:4},
};

export function validateTrie(id, input) {
  const check = (ok, message) => { if (!ok) throw new Error(message); };
  const word = value => typeof value === 'string' && /^[a-z]{1,12}$/.test(value);
  const words = value => Array.isArray(value) && value.length >= 1 && value.length <= 16 && value.every(word);
  if ([648,720,820,1032,1268].includes(id)) {
    const list = input[id===648?'dictionary':id===1268?'products':'words'];
    check(words(list), 'Use 1-16 lowercase words, each 1-12 letters, for readable trie playback.');
    if (id===1268) check(new Set(list).size===list.length, 'Product names must be distinct.');
  }
  if (id===648) check(typeof input.sentence==='string'&&input.sentence.length<=160&&/^[a-z]+(?: [a-z]+)*$/.test(input.sentence), 'Use lowercase words separated by single spaces, at most 160 characters.');
  if (id===1032) check(typeof input.queries==='string'&&/^[a-z]{1,80}$/.test(input.queries), 'queries is a string of 1-80 incoming lowercase characters.');
  if (id===1268) check(word(input.searchWord), 'Use a lowercase search word of 1-12 characters.');
  if ([677,1804].includes(id)) {
    check(Array.isArray(input.operations)&&input.operations.length>=1&&input.operations.length<=40, 'Use 1-40 operations.');
    const stored = new Map();
    for (const op of input.operations) {
      check(Array.isArray(op)&&word(op[1]), 'Each operation needs a lowercase key or word of 1-12 letters.');
      if (id===677) {
        check(op[0]==='sum'&&op.length===2||op[0]==='insert'&&op.length===3&&Number.isSafeInteger(op[2])&&op[2]>=1&&op[2]<=1000, 'Use [insert,key,positive value] or [sum,prefix].');
      } else {
        check(op.length===2&&['insert','erase','countWordsEqualTo','countWordsStartingWith'].includes(op[0]), 'Use insert, erase, countWordsEqualTo, or countWordsStartingWith with one word.');
        if (op[0]==='insert') stored.set(op[1],(stored.get(op[1])||0)+1);
        if (op[0]==='erase') { check((stored.get(op[1])||0)>0,'Erase requires a currently stored occurrence of that word.'); stored.set(op[1],stored.get(op[1])-1); }
      }
    }
  }
  return input;
}
