export const CODE = [
  "def hasCycle(head):",
  "    slow = fast = head",
  "    while fast and fast.next:",
  "        slow = slow.next",
  "        fast = fast.next.next",
  "        if slow == fast:",
  "            return True",
  "    return False",
];

/**
 * Parses and validates input for Linked List Cycle.
 * Accepts either:
 *  - parseLinkedListCycleInput(values, pos)
 *  - parseLinkedListCycleInput(inputString) e.g. "[3, 2, 0, -4] | pos = 1" or JSON string
 *  - parseLinkedListCycleInput({ values, pos })
 *
 * @param {Array<number>|string|object} values - Array of node values or formatted string/object
 * @param {number|string} [pos] - Index of node tail connects to (-1 for no cycle)
 * @returns {{ values: number[], pos: number }}
 */
export function parseLinkedListCycleInput(values, pos) {
  if (values === null || values === undefined) {
    throw new Error("Input values cannot be null or undefined");
  }

  let rawValues = values;
  let rawPos = pos;

  // Single argument parsing
  if (arguments.length === 1 || rawPos === undefined) {
    if (typeof values === "object" && values !== null) {
      if (Array.isArray(values)) {
        rawValues = values;
        rawPos = -1;
      } else {
        rawValues = values.values;
        rawPos = values.pos !== undefined ? values.pos : -1;
      }
    } else if (typeof values === "string") {
      const trimmed = values.trim();
      if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
        try {
          const parsed = JSON.parse(trimmed);
          rawValues = parsed.values;
          rawPos = parsed.pos !== undefined ? parsed.pos : -1;
        } catch {
          throw new Error("Invalid JSON object format. Expected { values: [...], pos: number }");
        }
      } else if (trimmed.includes("|")) {
        const parts = trimmed.split("|");
        rawValues = parts[0].trim();
        const posStr = parts[1].trim();
        const match = posStr.match(/^(?:pos\s*[:=]\s*)?(-?\d+)/i);
        if (!match) {
          throw new Error(`Invalid cycle pos specification: "${posStr}". Expected pos=<integer> or an integer.`);
        }
        rawPos = parseInt(match[1], 10);
      } else {
        const posMatch = trimmed.match(/,\s*pos\s*[:=]\s*(-?\d+)\s*$/i);
        if (posMatch) {
          rawValues = trimmed.slice(0, posMatch.index).trim();
          rawPos = parseInt(posMatch[1], 10);
        } else {
          const commaNumMatch = trimmed.match(/\]\s*,\s*(-?\d+)\s*$/);
          if (commaNumMatch) {
            rawValues = trimmed.slice(0, trimmed.lastIndexOf("]") + 1).trim();
            rawPos = parseInt(commaNumMatch[1], 10);
          } else {
            rawValues = trimmed;
            rawPos = -1;
          }
        }
      }
    } else {
      throw new Error("Input must be an array, object, or formatted string");
    }
  }

  // Parse rawValues if it's a string
  let parsedValues;
  if (typeof rawValues === "string") {
    const trimmed = rawValues.trim();
    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      try {
        parsedValues = JSON.parse(trimmed);
      } catch {
        throw new Error("Invalid array JSON syntax");
      }
    } else if (trimmed === "") {
      parsedValues = [];
    } else {
      const tokens = trimmed.split(",").map((s) => s.trim()).filter(Boolean);
      parsedValues = tokens.map((t) => {
        const num = Number(t);
        if (Number.isNaN(num)) {
          throw new Error(`Invalid number token: "${t}"`);
        }
        return num;
      });
    }
  } else {
    parsedValues = rawValues;
  }

  if (!Array.isArray(parsedValues)) {
    throw new Error("Values must be an array");
  }

  if (parsedValues.length > 500) {
    throw new Error("Linked list exceeds maximum length of 500 nodes");
  }

  // Validate array elements
  const cleanValues = [];
  for (let i = 0; i < parsedValues.length; i++) {
    const item = parsedValues[i];
    if (typeof item !== "number" || !Number.isFinite(item)) {
      throw new Error(`Array element at index ${i} is not a valid finite number: ${item}`);
    }
    cleanValues.push(item);
  }

  // Parse rawPos
  let parsedPos;
  if (typeof rawPos === "string") {
    const trimmedPos = rawPos.trim();
    const match = trimmedPos.match(/^(?:pos\s*[:=]\s*)?(-?\d+)$/i);
    if (!match) {
      throw new Error(`Invalid pos: "${rawPos}". Must be an integer.`);
    }
    parsedPos = parseInt(match[1], 10);
  } else if (typeof rawPos === "number") {
    if (!Number.isInteger(rawPos)) {
      throw new Error(`pos must be an integer, received: ${rawPos}`);
    }
    parsedPos = rawPos;
  } else {
    throw new Error(`Invalid pos type: ${typeof rawPos}`);
  }

  // Check pos bounds
  if (cleanValues.length === 0) {
    if (parsedPos !== -1) {
      throw new Error("pos must be -1 for an empty list");
    }
  } else {
    if (parsedPos < -1 || parsedPos >= cleanValues.length) {
      throw new Error(`pos out of range: must be between -1 and ${cleanValues.length - 1} (received ${parsedPos})`);
    }
  }

  return { values: cleanValues, pos: parsedPos };
}

/**
 * Builds the visual story frames for Floyd's Tortoise and Hare algorithm.
 *
 * @param {Array<number>|string|object} values - Linked list node values
 * @param {number|string} [pos] - Position where tail connects (-1 for no cycle)
 * @returns {{
 *   nodes: Array<{ index: number, val: number, next: number|null }>,
 *   pos: number,
 *   hasCycle: boolean,
 *   cycleLength: number|null,
 *   frames: Array<object>
 * }}
 */
export function buildCycleStory(values, pos) {
  const parsed = parseLinkedListCycleInput(values, pos);
  const cleanValues = parsed.values;
  const cyclePos = parsed.pos;
  const n = cleanValues.length;
  const hasCycle = cyclePos >= 0 && n > 0;
  const cycleLength = hasCycle ? n - cyclePos : null;

  const nodes = cleanValues.map((val, i) => {
    let next = null;
    if (i < n - 1) {
      next = i + 1;
    } else if (hasCycle) {
      next = cyclePos;
    }
    return {
      index: i,
      val,
      next,
    };
  });

  const nextOf = (idx) => {
    if (idx === null || idx === undefined || idx < 0 || idx >= n) return null;
    return nodes[idx].next;
  };

  /**
   * Computes the cyclic chase distance or forward steps from fast to slow.
   * In a cycle of length C, fast gains 1 step on slow in every iteration.
   */
  const computeGap = (s, f) => {
    if (s === null || f === null) return null;
    if (s === f) return 0;
    if (hasCycle && s >= cyclePos && f >= cyclePos) {
      const chase = ((s - cyclePos) - (f - cyclePos) + cycleLength) % cycleLength;
      return chase === 0 ? cycleLength : chase;
    }
    // Calculate forward distance along next pointers from fast towards slow
    let curr = f;
    let hops = 0;
    while (curr !== null && hops <= n + 2) {
      curr = nextOf(curr);
      hops++;
      if (curr === s) return hops;
    }
    return null;
  };

  const frames = [];

  // Edge case: Empty list
  if (n === 0) {
    frames.push({
      activeLine: 2,
      phase: "init",
      slow: null,
      fast: null,
      slowVal: null,
      fastVal: null,
      slowPrev: null,
      fastPrev: null,
      fastNext: null,
      stepCount: 0,
      gap: null,
      result: null,
      meetingNode: null,
      message: "Initialize slow = fast = head (head is null).",
      explanation: "The linked list is empty. Both slow and fast pointers are set to null.",
    });

    frames.push({
      activeLine: 3,
      phase: "check",
      slow: null,
      fast: null,
      slowVal: null,
      fastVal: null,
      slowPrev: null,
      fastPrev: null,
      fastNext: null,
      stepCount: 0,
      gap: null,
      result: null,
      meetingNode: null,
      message: "Condition check 'while fast and fast.next': fast is null.",
      explanation: "Because fast is null, the loop condition evaluates to False immediately. Loop terminates.",
    });

    frames.push({
      activeLine: 8,
      phase: "done",
      slow: null,
      fast: null,
      slowVal: null,
      fastVal: null,
      slowPrev: null,
      fastPrev: null,
      fastNext: null,
      stepCount: 0,
      gap: null,
      result: false,
      meetingNode: null,
      message: "Return False — linked list is empty, no cycle.",
      explanation: "Acyclic linked list. Floyd's algorithm returns False.",
    });

    return {
      nodes,
      pos: cyclePos,
      hasCycle,
      cycleLength,
      frames,
    };
  }

  // Frame 1: Init slow = fast = head (Line 2)
  let slow = 0;
  let fast = 0;
  let stepCount = 0;

  frames.push({
    activeLine: 2,
    phase: "init",
    slow,
    fast,
    slowVal: nodes[0].val,
    fastVal: nodes[0].val,
    slowPrev: null,
    fastPrev: null,
    fastNext: null,
    stepCount,
    gap: computeGap(slow, fast),
    result: null,
    meetingNode: null,
    message: `Initialize slow = fast = head (Node 0, val: ${nodes[0].val}).`,
    explanation: `Both slow (Tortoise 🐢) and fast (Hare 🐇) start at the head node (Node 0). Tortoise moves 1 step per iteration; Hare moves 2 steps.`,
  });

  const maxSteps = (n + 10) * 3;
  let terminated = false;

  while (stepCount < maxSteps) {
    stepCount++;
    const fastNext = nextOf(fast);
    const canContinue = fast !== null && fastNext !== null;

    // Line 3: while fast and fast.next:
    frames.push({
      activeLine: 3,
      phase: "check",
      slow,
      fast,
      slowVal: slow !== null ? nodes[slow].val : null,
      fastVal: fast !== null ? nodes[fast].val : null,
      slowPrev: null,
      fastPrev: null,
      fastNext,
      stepCount,
      gap: computeGap(slow, fast),
      result: null,
      meetingNode: null,
      message: canContinue
        ? `Condition True: fast (Node ${fast}) and fast.next (Node ${fastNext}) exist. Continue.`
        : `Condition False: ${fast === null ? "fast is null" : `fast.next is null at tail Node ${fast}`}. Loop breaks.`,
      explanation: canContinue
        ? `fast is at Node ${fast} (val: ${nodes[fast].val}) and fast.next is Node ${fastNext} (val: ${nodes[fastNext].val}). Since both pointers exist, fast can safely take 2 steps.`
        : `fast reached a boundary: ${fast === null ? "fast is null" : `fast.next is null`}. Because there is no forward edge, the list has an end and cannot contain a cycle.`,
    });

    if (!canContinue) {
      break;
    }

    // Line 4: slow = slow.next
    const slowPrev = slow;
    const newSlow = nextOf(slow);
    slow = newSlow;

    frames.push({
      activeLine: 4,
      phase: "move_slow",
      slow,
      fast,
      slowVal: slow !== null ? nodes[slow].val : null,
      fastVal: fast !== null ? nodes[fast].val : null,
      slowPrev,
      fastPrev: null,
      fastNext,
      stepCount,
      gap: computeGap(slow, fast),
      result: null,
      meetingNode: null,
      message: `slow advances 1 step: Node ${slowPrev} → Node ${slow} (val: ${nodes[slow].val}).`,
      explanation: `Tortoise advances 1 step from Node ${slowPrev} to Node ${slow}. Slow moves at speed 1 node per iteration.`,
    });

    // Line 5: fast = fast.next.next
    const fastPrev = fast;
    const newFast = nextOf(fastNext);
    fast = newFast;

    frames.push({
      activeLine: 5,
      phase: "move_fast",
      slow,
      fast,
      slowVal: slow !== null ? nodes[slow].val : null,
      fastVal: fast !== null ? nodes[fast].val : null,
      slowPrev: null,
      fastPrev,
      fastNext,
      stepCount,
      gap: computeGap(slow, fast),
      result: null,
      meetingNode: null,
      message: fast !== null
        ? `fast advances 2 steps: Node ${fastPrev} → Node ${fastNext} → Node ${fast} (val: ${nodes[fast].val}).`
        : `fast advances 2 steps: Node ${fastPrev} → Node ${fastNext} → null.`,
      explanation: fast !== null
        ? `Hare advances 2 steps from Node ${fastPrev} via Node ${fastNext} to Node ${fast}. Hare moves twice as fast as Tortoise, closing any cyclic gap by 1 step per round.`
        : `Hare advances 2 steps past the tail and reaches null.`,
    });

    // Line 6: if slow == fast:
    const isMeet = slow !== null && fast !== null && slow === fast;

    frames.push({
      activeLine: 6,
      phase: "compare",
      slow,
      fast,
      slowVal: slow !== null ? nodes[slow].val : null,
      fastVal: fast !== null ? nodes[fast].val : null,
      slowPrev: null,
      fastPrev: null,
      fastNext,
      stepCount,
      gap: computeGap(slow, fast),
      result: null,
      meetingNode: isMeet ? slow : null,
      message: isMeet
        ? `slow == fast (both at Node ${slow}, val: ${nodes[slow].val}). Meeting detected!`
        : `slow (Node ${slow}) ≠ fast (${fast !== null ? `Node ${fast}` : "null"}). No collision yet.`,
      explanation: isMeet
        ? `Tortoise and Hare have collided at Node ${slow} (val: ${nodes[slow].val})! Because Hare moves 1 extra step relative to Tortoise each iteration, a collision is guaranteed if and only if there is a cycle.`
        : `Tortoise is at Node ${slow} and Hare is at ${fast !== null ? `Node ${fast}` : "null"}. They have not met yet. The algorithm continues to the next iteration.`,
    });

    if (isMeet) {
      // Line 7: return True
      frames.push({
        activeLine: 7,
        phase: "done",
        slow,
        fast,
        slowVal: nodes[slow].val,
        fastVal: nodes[fast].val,
        slowPrev: null,
        fastPrev: null,
        fastNext,
        stepCount,
        gap: 0,
        result: true,
        meetingNode: slow,
        message: `Return True — Cycle detected! Pointers collided at Node ${slow} (val: ${nodes[slow].val}).`,
        explanation: `Cycle confirmed! Floyd's Cycle Detection concludes in O(N) time and O(1) space. Meeting occurred at Node ${slow} after ${stepCount} iterations.`,
      });
      terminated = true;
      break;
    }
  }

  if (!terminated) {
    // Line 8: return False
    frames.push({
      activeLine: 8,
      phase: "done",
      slow,
      fast,
      slowVal: slow !== null ? nodes[slow].val : null,
      fastVal: fast !== null ? nodes[fast].val : null,
      slowPrev: null,
      fastPrev: null,
      fastNext: null,
      stepCount,
      gap: null,
      result: false,
      meetingNode: null,
      message: "Return False — fast reached null, linked list has no cycle.",
      explanation: "Hare reached the end of the linked list (null). Since the list has an end, it is finite and strictly acyclic. Return False.",
    });
  }

  return {
    nodes,
    pos: cyclePos,
    hasCycle,
    cycleLength,
    frames,
  };
}
