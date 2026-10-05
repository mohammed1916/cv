function makeTrie(mode = 'words') {
  const nodes = [{ id: 0, parent: null, char: '', prefix: '', children: new Map(), terminal: 0, pass: 0, total: 0 }];
  const child = (id, char, create = false) => {
    let next = nodes[id].children.get(char);
    if (next === undefined && create) {
      next = nodes.length;
      nodes[id].children.set(char, next);
      nodes.push({ id: next, parent: id, char, prefix: nodes[id].prefix + char, children: new Map(), terminal: 0, pass: 0, total: 0 });
    }
    return next;
  };
  const snapshot = () => nodes.map(({ children, pass, total, ...node }) => ({ ...node,
    ...(mode === 'counts' ? { pass } : {}), ...(mode === 'sums' ? { total } : {}),
  }));
  return { nodes, child, snapshot };
}

function reporter(trie, emit) {
  return (message, activeNode, codeStage, state = {}) => emit(message, {
    trieNodes: trie.snapshot(), activeNode, codeStage, ...state,
  }, ['insert', 'store', 'erase', 'accumulate', 'accept'].includes(codeStage) ? 'update' : 'inspect');
}

function insertWord(trie, word, report) {
  let node = 0;
  for (const char of word) {
    node = trie.child(node, char, true);
    report(`Follow or create '${char}'. Shared prefixes reuse the same nodes instead of storing another separate path.`, node, 'insert', { sequence: word });
  }
  trie.nodes[node].terminal++;
  report(`Mark '${word}' as a complete stored word. A prefix node alone is not a complete-word match.`, node, 'store', { sequence: word });
}

export const trieSolvers = {
  648({ dictionary, sentence }, emit) {
    const trie = makeTrie(), report = reporter(trie, emit);
    for (const word of dictionary) insertWord(trie, word, report);
    const output = [];
    for (const word of sentence.split(' ')) {
      let node = 0, replacement = word;
      for (let i = 0; i < word.length; i++) {
        const next = trie.child(node, word[i]);
        if (next === undefined) { report('The next edge is absent. No stored root matches this word, so preserve it.', node, 'missing', { sequence: word, index: i }); break; }
        node = next;
        report('Read the next prefix character. Stop at the first terminal node to choose the shortest dictionary root.', node, 'lookup', { sequence: word, index: i });
        if (trie.nodes[node].terminal) { replacement = word.slice(0, i + 1); report(`The first complete root is '${replacement}'; longer roots must not replace it.`, node, 'accept', { sequence: word }); break; }
      }
      output.push(replacement);
      report('Append this replacement and continue with the next sentence word.', node, 'append', { sequence: word, output });
    }
    return output.join(' ');
  },
  677({ operations }, emit) {
    const trie = makeTrie('sums'), report = reporter(trie, emit), values = new Map(), output = [];
    for (const [action, key, value] of operations) {
      let node = 0;
      if (action === 'insert') {
        const delta = value - (values.get(key) || 0);
        values.set(key, value);
        trie.nodes[0].total += delta;
        for (const char of key) {
          node = trie.child(node, char, true);
          trie.nodes[node].total += delta;
          report('Store only the value difference along this prefix path. Overwriting a key must replace its old contribution rather than add it twice.', node, 'accumulate', { sequence: key, metrics: { key, value, delta }, output });
        }
        trie.nodes[node].terminal = 1;
      } else {
        for (const char of key) {
          const next = trie.child(node, char);
          report('Follow the query prefix. Its stored aggregate already includes every complete key below it.', node, 'lookup', { sequence: key, metrics: { nextCharacter: char }, output });
          if (next === undefined) { node = undefined; break; }
          node = next;
        }
        const answer = node === undefined ? 0 : trie.nodes[node].total;
        output.push(answer);
        report('Return the prefix aggregate, or zero when the prefix path does not exist.', node ?? 0, 'answer', { sequence: key, output, metrics: { answer } });
      }
    }
    return output;
  },
  720({ words }, emit) {
    const trie = makeTrie(), report = reporter(trie, emit);
    for (const word of words) insertWord(trie, word, report);
    let best = '';
    for (const word of words) {
      let node = 0, valid = true;
      for (const char of word) {
        node = trie.child(node, char);
        report('Every node on this word path must be terminal: each successive prefix must itself occur in the dictionary.', node, 'lookup', { sequence: word, metrics: { completePrefix: Boolean(trie.nodes[node].terminal), best } });
        if (!trie.nodes[node].terminal) { valid = false; break; }
      }
      if (valid && (word.length > best.length || word.length === best.length && word < best)) {
        best = word;
        report('This buildable word improves the answer by length or by lexicographic tie-break.', node, 'accept', { sequence: word, metrics: { best } });
      }
    }
    return best;
  },
  820({ words }, emit) {
    const trie = makeTrie(), report = reporter(trie, emit);
    for (const word of new Set(words)) insertWord(trie, [...word].reverse().join(''), report);
    let length = 0;
    for (const node of trie.nodes) if (node.id !== 0 && node.children.size === 0) {
      length += node.prefix.length + 1;
      report('Only leaves require a separate word and separator. An internal terminal is a suffix already encoded by a longer word on the same reversed path.', node.id, 'accumulate', { sequence: [...node.prefix].reverse().join(''), metrics: { contribution: node.prefix.length + 1, length } });
    }
    return length;
  },
  1032({ words, queries }, emit) {
    const trie = makeTrie(), report = reporter(trie, emit), output = [], stream = [];
    const maxLength = Math.max(...words.map(word => word.length));
    for (const word of words) insertWord(trie, [...word].reverse().join(''), report);
    for (const char of queries) {
      stream.push(char);
      if (stream.length > maxLength) stream.shift();
      let node = 0, found = false;
      for (let i = stream.length - 1; i >= 0; i--) {
        const next = trie.child(node, stream[i]);
        if (next === undefined) { report('The reversed suffix path ends here; no longer suffix can match through this missing edge.', node, 'missing', { sequence: stream, index: i }); break; }
        node = next;
        report('Walk backward from the newest character. A terminal node means a dictionary word ends at the current stream position.', node, 'lookup', { sequence: stream, index: i });
        if (trie.nodes[node].terminal) { found = true; break; }
      }
      output.push(found);
      report('Record whether any stored word is a suffix of the stream after this new character.', node, 'answer', { sequence: stream, output, metrics: { latest: char, found } });
    }
    return output;
  },
  1268({ products, searchWord }, emit) {
    const trie = makeTrie(), report = reporter(trie, emit), suggestions = new Map();
    for (const product of [...products].sort()) {
      let node = 0;
      for (const char of product) {
        node = trie.child(node, char, true);
        if (!suggestions.has(node)) suggestions.set(node, []);
        if (suggestions.get(node).length < 3) suggestions.get(node).push(product);
        report('Insert products in lexicographic order. Each prefix keeps only the first three products that pass through it.', node, 'insert', { sequence: product, output: suggestions.get(node) });
      }
      trie.nodes[node].terminal = 1;
    }
    const output = [];
    let node = 0;
    for (let i = 0; i < searchWord.length; i++) {
      node = node === undefined ? undefined : trie.child(node, searchWord[i]);
      const matches = node === undefined ? [] : [...(suggestions.get(node) || [])];
      output.push(matches);
      report('The current prefix node supplies at most three suggestions. Once a prefix is absent, all longer typed prefixes also remain absent.', node ?? 0, 'answer', { sequence: searchWord, index: i, output: matches, table: output.map((row, j) => [searchWord.slice(0, j + 1), row.join(', ') || 'none']), tableHeaders: ['Typed prefix', 'Suggestions'] });
    }
    return output;
  },
  1804({ operations }, emit) {
    const trie = makeTrie('counts'), report = reporter(trie, emit), output = [];
    for (const [action, word] of operations) {
      let node = 0;
      if (action === 'insert' || action === 'erase') {
        const delta = action === 'insert' ? 1 : -1;
        trie.nodes[0].pass += delta;
        for (const char of word) {
          node = trie.child(node, char, action === 'insert');
          trie.nodes[node].pass += delta;
          report('Update the number of stored word occurrences passing through this node. Erasing one occurrence preserves counts for duplicates and longer words.', node, action === 'insert' ? 'insert' : 'erase', { sequence: word, output, metrics: { action, delta } });
        }
        trie.nodes[node].terminal += delta;
        report('Update the exact-word count only at the final node. Prefix counts and exact counts answer different questions.', node, 'store', { sequence: word, output, metrics: { action, exactCount: trie.nodes[node].terminal } });
      } else {
        for (const char of word) {
          const next = trie.child(node, char);
          if (next === undefined) { node = undefined; break; }
          node = next;
          report('Follow the requested path without modifying the trie.', node, 'lookup', { sequence: word, output });
        }
        const answer = node === undefined ? 0 : action === 'countWordsEqualTo' ? trie.nodes[node].terminal : trie.nodes[node].pass;
        output.push(answer);
        report('Read the terminal count for exact words or the passing count for prefixes. Missing paths contribute zero.', node ?? 0, 'answer', { sequence: word, output, metrics: { action, answer } });
      }
    }
    return output;
  },
};
