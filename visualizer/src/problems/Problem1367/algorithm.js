const PYTHON_LINES = [
  "def isSubPath(head, root):",
  "    def matches(node, k):",
  "        if k == len(head):",
  "            return True",
  "        if node is None or node[\"val\"] != head[k]:",
  "            return False",
  "        return matches(node[\"left\"], k + 1) or matches(node[\"right\"], k + 1)",
  "    stack = [root]",
  "    while stack:",
  "        node = stack.pop()",
  "        if node is None:",
  "            continue",
  "        if matches(node, 0):",
  "            return True",
  "        stack.append(node[\"right\"])",
  "        stack.append(node[\"left\"])",
  "    return False",
];

export const python = PYTHON_LINES.join("\n");

export const code = `function isSubPath(head, root) {
  const matches = (node, k) => {
    if (k === head.length) return true
    if (node === null || node.val !== head[k]) return false
    return matches(node.left, k + 1) || matches(node.right, k + 1)
  }
  const stack = [root]
  while (stack.length > 0) {
    const node = stack.pop()
    if (node === null) continue
    if (matches(node, 0)) return true
    stack.push(node.right, node.left)
  }
  return false
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const pythonLineMap = { 1: 1, 2: 8, 3: 10, 4: 13, 5: 15, 6: 17, 7: 2, 8: 3, 9: 5, 10: 7 };

export const examples = [
  { label: "[4,2,8]", input: "{\"head\":[4,2,8],\"root\":{\"val\":1,\"left\":{\"val\":4,\"left\":null,\"right\":{\"val\":2,\"left\":{\"val\":1,\"left\":null,\"right\":null},\"right\":null}},\"right\":{\"val\":4,\"left\":{\"val\":2,\"left\":{\"val\":6,\"left\":null,\"right\":null},\"right\":{\"val\":8,\"left\":{\"val\":1,\"left\":null,\"right\":null},\"right\":{\"val\":3,\"left\":null,\"right\":null}}},\"right\":null}}}" },
  { label: "[1,4,2,6]", input: "{\"head\":[1,4,2,6],\"root\":{\"val\":1,\"left\":{\"val\":4,\"left\":null,\"right\":{\"val\":2,\"left\":{\"val\":1,\"left\":null,\"right\":null},\"right\":null}},\"right\":{\"val\":4,\"left\":{\"val\":2,\"left\":{\"val\":6,\"left\":null,\"right\":null},\"right\":{\"val\":8,\"left\":{\"val\":1,\"left\":null,\"right\":null},\"right\":{\"val\":3,\"left\":null,\"right\":null}}},\"right\":null}}}" },
  { label: "[1,4,2,6,8]", input: "{\"head\":[1,4,2,6,8],\"root\":{\"val\":1,\"left\":{\"val\":4,\"left\":null,\"right\":{\"val\":2,\"left\":{\"val\":1,\"left\":null,\"right\":null},\"right\":null}},\"right\":{\"val\":4,\"left\":{\"val\":2,\"left\":{\"val\":6,\"left\":null,\"right\":null},\"right\":{\"val\":8,\"left\":{\"val\":1,\"left\":null,\"right\":null},\"right\":{\"val\":3,\"left\":null,\"right\":null}}},\"right\":null}}}" },
  { label: "Single node matches one value", input: "{\"head\":[1],\"root\":{\"val\":1,\"left\":null,\"right\":null}}" },
  { label: "Equal values, path goes down the right side", input: "{\"head\":[2,2],\"root\":{\"val\":2,\"left\":null,\"right\":{\"val\":2,\"left\":null,\"right\":null}}}" },
  { label: "Twenty values down a right-going chain", input: "{\"head\":[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20],\"root\":{\"val\":1,\"left\":null,\"right\":{\"val\":2,\"left\":null,\"right\":{\"val\":3,\"left\":null,\"right\":{\"val\":4,\"left\":null,\"right\":{\"val\":5,\"left\":null,\"right\":{\"val\":6,\"left\":null,\"right\":{\"val\":7,\"left\":null,\"right\":{\"val\":8,\"left\":null,\"right\":{\"val\":9,\"left\":null,\"right\":{\"val\":10,\"left\":null,\"right\":{\"val\":11,\"left\":null,\"right\":{\"val\":12,\"left\":null,\"right\":{\"val\":13,\"left\":null,\"right\":{\"val\":14,\"left\":null,\"right\":{\"val\":15,\"left\":null,\"right\":{\"val\":16,\"left\":null,\"right\":{\"val\":17,\"left\":null,\"right\":{\"val\":18,\"left\":null,\"right\":{\"val\":19,\"left\":null,\"right\":{\"val\":20,\"left\":null,\"right\":null}}}}}}}}}}}}}}}}}}}}}" },
  { label: "Long run: generated head and tree", input: "{\"head\":[77,28,82,27,45,75,58,3],\"root\":{\"val\":12,\"left\":null,\"right\":{\"val\":99,\"left\":null,\"right\":null}}}" },
];

// Preorder flattening: node ids follow preorder, children are -1 when missing.
export function flattenTree(root) {
  const nodes = [];
  function walk(t) {
    if (!t) return -1;
    const id = nodes.length;
    nodes.push({ id, val: t.val, left: -1, right: -1 });
    nodes[id].left = walk(t.left);
    nodes[id].right = walk(t.right);
    return id;
  }
  walk(root);
  return nodes;
}

function validateTree(t, count, path) {
  if (t === null) return count;
  if (typeof t !== "object" || Array.isArray(t) || !Number.isInteger(t.val) || t.val < 1 || t.val > 100) {
    throw new Error(`${path} must be {"val":1..100,"left":...,"right":...} or null`);
  }
  if (count + 1 > 50) throw new Error("the tree has more than 50 nodes; the visualization caps it at 50");
  const afterLeft = validateTree(t.left ?? null, count + 1, `${path}.left`);
  return validateTree(t.right ?? null, afterLeft, `${path}.right`);
}

export function parseInput(text) {
  let data;
  try {
    data = typeof text === "string" ? JSON.parse(text) : text;
  } catch {
    throw new Error('Input must be a JSON object with head and root, e.g. {"head":[4,2,8],"root":{"val":4,"left":null,"right":null}}');
  }
  if (data === null || typeof data !== "object" || Array.isArray(data)) throw new Error("Input must be a JSON object");
  const { head, root } = data;
  if (!Array.isArray(head) || head.length < 1) throw new Error("head must be a non-empty array");
  if (head.length > 20) throw new Error(`head has ${head.length} values; the visualization caps it at 20`);
  head.forEach((v, i) => {
    if (!Number.isInteger(v) || v < 1 || v > 100) throw new Error(`head[${i}] must be an integer from 1 to 100`);
  });
  if (root === null || root === undefined) throw new Error("root must be a tree object");
  validateTree(root, 0, "root");
  return { head: [...head], root };
}

export function buildTrace(input) {
  const { head } = input;
  const nodes = flattenTree(input.root);
  const frames = [];
  const stack = [];
  const path = [];
  const frame = (phase, activeLine, message, node, k, ok = null) =>
    frames.push({ phase, activeLine, message, node, k, stack: [...stack], path: [...path], ok });

  function matches(id, k) {
    if (k === head.length) {
      frame("match", 3, `The whole list is matched on this path.`, id === -1 ? null : id, k, true);
      return true;
    }
    if (id === -1 || nodes[id].val !== head[k]) {
      const why = id === -1 ? "Null node" : `Node ${id} (value ${nodes[id].val})`;
      frame("match", 4, `${why} does not match head[${k}] = ${head[k]}.`, id === -1 ? null : id, k, false);
      return false;
    }
    path.push(id);
    frame("match", 5, `Node ${id} matches head[${k}] = ${head[k]}; try its children.`, id, k);
    const hit = matches(nodes[id].left, k + 1) || matches(nodes[id].right, k + 1);
    if (!hit) path.pop();
    return hit;
  }

  frame("scan", 1, "Start the search over the tree.", null, null);
  stack.push(0);
  frame("scan", 7, "Put the root on the stack.", null, null);
  let found = false;
  while (stack.length && !found) {
    const id = stack.pop();
    frame("scan", 9, `Pop node ${id}.`, id, null);
    if (matches(id, 0)) {
      found = true;
      frame("scan", 11, `A downward path from node ${id} matches; the answer is true.`, id, 0, true);
      break;
    }
    frame("scan", 11, `No match starts at node ${id}.`, id, 0, false);
    const { left, right } = nodes[id];
    if (right !== -1) stack.push(right);
    if (left !== -1) stack.push(left);
    frame("scan", 12, `Push the children of node ${id}.`, id, null);
  }
  frame("done", 14, found ? "Some node starts a matching downward path." : "No node starts a matching downward path.", null, null, found);
  return { input, result: found, frames };
}
