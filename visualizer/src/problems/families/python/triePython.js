export const triePython = {
648: `def solve(dictionary, sentence):
    root = {}
    for word in dictionary:
        node = root
        for char in word:
            node = node.setdefault(char, {})  # step: insert
        node['end'] = True  # step: store
    answer = []
    for word in sentence.split():
        node = root
        replacement = word
        for index, char in enumerate(word):
            if char not in node:  # step: missing
                break
            node = node[char]  # step: lookup
            if node.get('end'):
                replacement = word[:index + 1]  # step: accept
                break
        answer.append(replacement)  # step: append
    return ' '.join(answer)  # step: return`,
677: `def solve(operations):
    def make_node():
        return {'children': {}, 'total': 0}

    root = make_node()
    values = {}
    answer = []
    for operation in operations:
        action, key = operation[:2]
        node = root
        if action == 'insert':
            value = operation[2]
            delta = value - values.get(key, 0)
            values[key] = value
            root['total'] += delta
            for char in key:
                node = node['children'].setdefault(char, make_node())
                node['total'] += delta  # step: accumulate
        else:
            for char in key:
                node = node['children'].get(char)  # step: lookup
                if node is None:
                    break
            answer.append(0 if node is None else node['total'])  # step: answer
    return answer  # step: return`,
720: `def solve(words):
    root = {}
    for word in words:
        node = root
        for char in word:
            node = node.setdefault(char, {})  # step: insert
        node['end'] = True  # step: store
    best = ''
    for word in words:
        node = root
        for char in word:
            node = node[char]  # step: lookup
            if not node.get('end'):
                break
        else:
            if len(word) > len(best) or len(word) == len(best) and word < best:
                best = word  # step: accept
    return best  # step: return`,
820: `def solve(words):
    root = {}
    for word in set(words):
        node = root
        for char in reversed(word):
            node = node.setdefault(char, {})  # step: insert
        node['end'] = True  # step: store

    length = 0
    stack = [(root, 0)]
    while stack:
        node, depth = stack.pop()
        children = [(char, child) for char, child in node.items() if char != 'end']
        if not children and depth:
            length += depth + 1  # step: accumulate
        for _, child in children:
            stack.append((child, depth + 1))
    return length  # step: return`,
1032: `def solve(words, queries):
    from collections import deque

    root = {}
    for word in words:
        node = root
        for char in reversed(word):
            node = node.setdefault(char, {})  # step: insert
        node['end'] = True  # step: store
    stream = deque(maxlen=max(map(len, words)))
    answer = []
    for char in queries:
        stream.append(char)
        node = root
        found = False
        for previous in reversed(stream):
            if previous not in node:  # step: missing
                break
            node = node[previous]  # step: lookup
            if node.get('end'):
                found = True
                break
        answer.append(found)  # step: answer
    return answer  # step: return`,
1268: `def solve(products, searchWord):
    def make_node():
        return {'children': {}, 'suggestions': []}

    root = make_node()
    for product in sorted(products):
        node = root
        for char in product:
            node = node['children'].setdefault(char, make_node())  # step: insert
            if len(node['suggestions']) < 3:
                node['suggestions'].append(product)
    answer = []
    node = root
    for char in searchWord:
        node = node['children'].get(char) if node is not None else None
        answer.append(node['suggestions'][:] if node is not None else [])  # step: answer
    return answer  # step: return`,
1804: `def solve(operations):
    def make_node():
        return {'children': {}, 'pass': 0, 'end': 0}

    root = make_node()
    answer = []
    for action, word in operations:
        node = root
        if action in ('insert', 'erase'):
            delta = 1 if action == 'insert' else -1
            root['pass'] += delta
            for char in word:
                if action == 'insert':
                    node = node['children'].setdefault(char, make_node())
                    node['pass'] += delta  # step: insert
                else:
                    node = node['children'][char]
                    node['pass'] += delta  # step: erase
            node['end'] += delta  # step: store
        else:
            for char in word:
                node = node['children'].get(char)  # step: lookup
                if node is None:
                    break
            field = 'end' if action == 'countWordsEqualTo' else 'pass'
            answer.append(node[field] if node is not None else 0)  # step: answer
    return answer  # step: return`,
};

// Explicit semantic anchors: never reuse five-line pseudocode positions in Python.
export const triePythonStages = Object.fromEntries(Object.entries(triePython).map(([id, source]) => [id,
  Object.fromEntries(source.split('\n').flatMap((line, index) => {
    const match = line.match(/# step: (\w+)/);
    return match ? [[match[1], index + 1]] : [];
  })),
]));
