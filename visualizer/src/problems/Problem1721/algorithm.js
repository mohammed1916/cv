export const CODE = [
  "FUNCTION swapNodes(head, k)",
  "    first ← head, moved forward k − 1 steps",
  "    tail ← first; second ← head",
  "    WHILE tail.next is not null",
  "        tail ← tail.next; second ← second.next",
  "    swap the values of first and second",
  "    RETURN head",
];
export const code = CODE.map((text, index) => ({ line: index + 1, text }));

export const python = `def swapNodes(head, k):
    head_node = build_list(head)
    first = head_node
    for _ in range(k - 1):
        first = first.next
    tail, second = first, head_node
    while tail.next is not None:
        tail = tail.next
        second = second.next
    first.val, second.val = second.val, first.val
    return to_list(head_node)

class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def build_list(values):
    dummy = ListNode()
    tail = dummy
    for v in values:
        tail.next = ListNode(v)
        tail = tail.next
    return dummy.next

def to_list(node):
    out = []
    while node:
        out.append(node.val)
        node = node.next
    return out`;

// Pseudocode activeLine -> Python line doing the same action.
export const pythonLineMap = { 1: 1, 2: 4, 3: 6, 4: 7, 5: 8, 6: 10, 7: 11 };

const MAX_LENGTH = 30;

export function parseInput(text) {
  let data = text;
  if (typeof text === "string") {
    try { data = JSON.parse(text); } catch (error) { throw new Error(`Input must be valid JSON: ${error.message}`); }
  }
  if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error('Input must be a JSON object with "head" and "k".');
  const { head, k } = data;
  if (!Array.isArray(head) || head.length < 1) throw new Error("head must be a non-empty array of node values.");
  if (head.length > MAX_LENGTH) throw new Error(`head has ${head.length} nodes; this visualization supports up to ${MAX_LENGTH} (LeetCode allows 10^5).`);
  if (head.some(v => !Number.isInteger(v) || v < 0 || v > 100)) throw new Error("Every node value must be an integer from 0 to 100.");
  if (!Number.isInteger(k) || k < 1 || k > head.length) throw new Error(`k must be an integer from 1 to ${head.length}.`);
  return { head, k };
}

export function buildTrace({ head, k }) {
  const n = head.length;
  const values = head.slice();
  const frames = [];
  const first = k - 1;
  const base = extra => ({ values: values.slice(), first, tail: first, second: 0, swapped: false, ...extra });
  frames.push({ phase: "locate", activeLine: 2, message: `First pointer moves to position ${k} (index ${first}).`, ...base({ tail: first, second: null }) });
  frames.push({ phase: "locate", activeLine: 3, message: "tail starts at first; second starts at head.", ...base({ second: 0 }) });
  let tail = first, second = 0;
  while (tail < n - 1) {
    frames.push({ phase: "scan", activeLine: 4, message: `tail.next exists at index ${tail + 1}, so keep scanning.`, ...base({ tail, second }) });
    tail++;
    second++;
    frames.push({ phase: "scan", activeLine: 5, message: `Advance tail to index ${tail} and second to index ${second}.`, ...base({ tail, second }) });
  }
  frames.push({ phase: "scan", activeLine: 4, message: `tail is the last node; second is the ${k}-th node from the end (index ${second}).`, ...base({ tail, second }) });
  frames.push({ phase: "swap", activeLine: 6, message: `Swap values ${values[first]} and ${values[second]}.`, ...base({ tail, second }) });
  const result = values.slice();
  [result[first], result[second]] = [result[second], result[first]];
  frames.push({ phase: "done", activeLine: 7, message: "Return the list with the two values swapped.", values: result, first, tail, second, swapped: true });
  return { input: { head, k }, result, frames };
}
