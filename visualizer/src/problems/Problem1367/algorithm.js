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

export const code = [
  { line: 1, text: "function contains(head, root)" },
  { line: 2, text: "stack = [root]" },
  { line: 3, text: "while stack is not empty: node = pop (skip null nodes)" },
  { line: 4, text: "if matches(node, 0): return true" },
  { line: 5, text: "push node.right, then node.left" },
  { line: 6, text: "return false" },
  { line: 7, text: "function matches(node, k)" },
  { line: 8, text: "if k == length of head: return true" },
  { line: 9, text: "if node is null or node.val != head[k]: return false" },
  { line: 10, text: "return matches(node.left, k+1) or matches(node.right, k+1)" },
];

export const pythonLineMap = { 1: 1, 2: 8, 3: 10, 4: 13, 5: 15, 6: 17, 7: 2, 8: 3, 9: 5, 10: 7 };

export const examples = [
  { label: "[4,2,8]", input: "{\"head\":[4,2,8],\"root\":{\"val\":1,\"left\":{\"val\":4,\"left\":null,\"right\":{\"val\":2,\"left\":{\"val\":1,\"left\":null,\"right\":null},\"right\":null}},\"right\":{\"val\":4,\"left\":{\"val\":2,\"left\":{\"val\":6,\"left\":null,\"right\":null},\"right\":{\"val\":8,\"left\":{\"val\":1,\"left\":null,\"right\":null},\"right\":{\"val\":3,\"left\":null,\"right\":null}}},\"right\":null}}}" },
  { label: "[1,4,2,6]", input: "{\"head\":[1,4,2,6],\"root\":{\"val\":1,\"left\":{\"val\":4,\"left\":null,\"right\":{\"val\":2,\"left\":{\"val\":1,\"left\":null,\"right\":null},\"right\":null}},\"right\":{\"val\":4,\"left\":{\"val\":2,\"left\":{\"val\":6,\"left\":null,\"right\":null},\"right\":{\"val\":8,\"left\":{\"val\":1,\"left\":null,\"right\":null},\"right\":{\"val\":3,\"left\":null,\"right\":null}}},\"right\":null}}}" },
  { label: "[1,4,2,6,8]", input: "{\"head\":[1,4,2,6,8],\"root\":{\"val\":1,\"left\":{\"val\":4,\"left\":null,\"right\":{\"val\":2,\"left\":{\"val\":1,\"left\":null,\"right\":null},\"right\":null}},\"right\":{\"val\":4,\"left\":{\"val\":2,\"left\":{\"val\":6,\"left\":null,\"right\":null},\"right\":{\"val\":8,\"left\":{\"val\":1,\"left\":null,\"right\":null},\"right\":{\"val\":3,\"left\":null,\"right\":null}}},\"right\":null}}}" },
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
      frame("match", 8, `The whole list is matched on this path.`, id === -1 ? null : id, k, true);
      return true;
    }
    if (id === -1 || nodes[id].val !== head[k]) {
      const why = id === -1 ? "Null node" : `Node ${id} (value ${nodes[id].val})`;
      frame("match", 9, `${why} does not match head[${k}] = ${head[k]}.`, id === -1 ? null : id, k, false);
      return false;
    }
    path.push(id);
    frame("match", 10, `Node ${id} matches head[${k}] = ${head[k]}; try its children.`, id, k);
    const hit = matches(nodes[id].left, k + 1) || matches(nodes[id].right, k + 1);
    if (!hit) path.pop();
    return hit;
  }

  frame("scan", 1, "Start the search over the tree.", null, null);
  stack.push(0);
  frame("scan", 2, "Put the root on the stack.", null, null);
  let found = false;
  while (stack.length && !found) {
    const id = stack.pop();
    frame("scan", 3, `Pop node ${id}.`, id, null);
    if (matches(id, 0)) {
      found = true;
      frame("scan", 4, `A downward path from node ${id} matches; the answer is true.`, id, 0, true);
      break;
    }
    frame("scan", 4, `No match starts at node ${id}.`, id, 0, false);
    const { left, right } = nodes[id];
    if (right !== -1) stack.push(right);
    if (left !== -1) stack.push(left);
    frame("scan", 5, `Push the children of node ${id}.`, id, null);
  }
  frame("done", 6, found ? "Some node starts a matching downward path." : "No node starts a matching downward path.", null, null, found);
  return { input, result: found, frames };
}
