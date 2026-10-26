export const CODE = [
  "def detectCycle(head):",
  "    slow = fast = head",
  "    while fast and fast.next:",
  "        slow = slow.next",
  "        fast = fast.next.next",
  "        if slow == fast:",
  "            break",
  "    else:",
  "        return None",
  "    ptr1 = head",
  "    ptr2 = slow",
  "    while ptr1 != ptr2:",
  "        ptr1 = ptr1.next",
  "        ptr2 = ptr2.next",
  "    return ptr1",
];

/**
 * Strict parser and validator for Problem 142 (Linked List Cycle II).
 * Supports:
 * - parseCycle2Input(values, pos)
 * - parseCycle2Input({ values, pos }) or parseCycle2Input({ nodes, pos })
 * - parseCycle2Input(jsonStringOrDelimited)
 */
export function parseCycle2Input(values, pos) {
  let rawValues = values;
  let rawPos = pos;

  if (rawPos === undefined) {
    if (typeof rawValues === "object" && rawValues !== null && !Array.isArray(rawValues)) {
      rawPos = rawValues.pos;
      rawValues =
        rawValues.values !== undefined
          ? rawValues.values
          : rawValues.nodes !== undefined
          ? rawValues.nodes
          : rawValues.input;
    } else if (typeof rawValues === "string") {
      const trimmed = rawValues.trim();
      if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
        try {
          const parsed = JSON.parse(trimmed);
          rawPos = parsed.pos;
          rawValues =
            parsed.values !== undefined
              ? parsed.values
              : parsed.nodes !== undefined
              ? parsed.nodes
              : parsed.input;
        } catch {
          throw new Error("Invalid JSON format for input object");
        }
      } else if (/pos\s*[:=]/i.test(trimmed)) {
        const match = trimmed.match(/^(.*?)(?:,|;|\|)\s*pos\s*[:=]\s*(-?\d+)\s*$/i);
        if (match) {
          rawValues = match[1].trim();
          rawPos = Number(match[2]);
        }
      }
    }
  }

  if (rawValues == null) {
    throw new Error("Values array is required");
  }

  let parsedArray;
  if (Array.isArray(rawValues)) {
    parsedArray = rawValues;
  } else if (typeof rawValues === "string") {
    const trimmed = rawValues.trim();
    if (!trimmed) {
      throw new Error("Values array cannot be empty string");
    }
    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      try {
        parsedArray = JSON.parse(trimmed);
      } catch {
        throw new Error("Invalid JSON array format for values");
      }
    } else if (trimmed.startsWith("[") || trimmed.endsWith("]")) {
      throw new Error("Invalid JSON array format for values");
    } else {
      parsedArray = trimmed.split(",").map((part) => {
        const item = part.trim();
        if (item === "") {
          throw new Error("Empty item in comma-separated values");
        }
        const num = Number(item);
        if (!Number.isFinite(num)) {
          throw new Error(`Invalid number in values: "${item}"`);
        }
        return num;
      });
    }
  } else {
    throw new Error("Values must be an array or string representation");
  }

  if (!Array.isArray(parsedArray)) {
    throw new Error("Values must resolve to an array");
  }

  const validatedValues = parsedArray.map((val, idx) => {
    if (typeof val !== "number" || !Number.isInteger(val)) {
      throw new Error(
        `Value at index ${idx} must be an integer, received: ${JSON.stringify(val)}`
      );
    }
    return val;
  });

  if (rawPos === undefined || rawPos === null || (typeof rawPos === "string" && rawPos.trim() === "")) {
    throw new Error("Cycle pos is required");
  }

  const parsedPos = Number(rawPos);
  if (!Number.isInteger(parsedPos)) {
    throw new Error("pos must be an integer");
  }

  if (validatedValues.length === 0) {
    if (parsedPos !== -1) {
      throw new Error("pos must be -1 when values array is empty");
    }
  } else {
    if (parsedPos < -1 || parsedPos >= validatedValues.length) {
      throw new Error(
        `pos must be between -1 and ${validatedValues.length - 1}, received: ${parsedPos}`
      );
    }
  }

  return {
    values: Object.freeze([...validatedValues]),
    pos: parsedPos,
  };
}

/**
 * Builds the visual story frames for Problem 142 (Linked List Cycle II).
 * Traces Phase 1: fast/slow meet at meeting point in cycle.
 * Traces Phase 2: ptr1 from head, ptr2 from meeting point, moving 1 step each
 * until meeting exactly at the cycle entrance:
 * 2(F + a) = F + a + nC => F = nC - a = (n - 1)C + (C - a)
 */
export function buildCycle2Story(values, pos) {
  const parsed = parseCycle2Input(values, pos);
  const rawValues = parsed.values;
  const cyclePos = parsed.pos;
  const n = rawValues.length;

  const nodes = Object.freeze(
    rawValues.map((val, idx) =>
      Object.freeze({
        id: idx,
        val,
        next: idx < n - 1 ? idx + 1 : cyclePos >= 0 ? cyclePos : null,
        isInCycle: cyclePos >= 0 && idx >= cyclePos,
      })
    )
  );

  const cycleNode = cyclePos >= 0 && cyclePos < n ? nodes[cyclePos] : null;
  const frames = [];

  // Frame: Function entry (Line 1)
  frames.push(
    Object.freeze({
      activeLine: 1,
      phase: "init",
      currentPhase: 1,
      slow: null,
      fast: null,
      ptr1: null,
      ptr2: null,
      meetingPoint: null,
      cycleEntrance: null,
      result: null,
      slowSteps: 0,
      fastSteps: 0,
      mathInvariant: null,
      message:
        n === 0
          ? "def detectCycle(head): List is empty."
          : `def detectCycle(head): Linked list has ${n} nodes${
              cyclePos >= 0 ? `, cycle begins at index ${cyclePos} (val=${nodes[cyclePos].val})` : " (no cycle)"
            }.`,
      explanation:
        "Floyd's Cycle-Finding Algorithm (Tortoise and Hare) consists of two phases: first detect if a cycle exists and find a collision point, then trace the cycle entrance.",
    })
  );

  if (n === 0) {
    // Empty list
    frames.push(
      Object.freeze({
        activeLine: 2,
        phase: "init",
        currentPhase: 1,
        slow: null,
        fast: null,
        ptr1: null,
        ptr2: null,
        meetingPoint: null,
        cycleEntrance: null,
        result: null,
        slowSteps: 0,
        fastSteps: 0,
        mathInvariant: null,
        message: "slow = fast = head: List is empty, head is None.",
        explanation: "Both slow and fast are None since the list contains no nodes.",
      })
    );

    frames.push(
      Object.freeze({
        activeLine: 3,
        phase: "phase1",
        currentPhase: 1,
        slow: null,
        fast: null,
        ptr1: null,
        ptr2: null,
        meetingPoint: null,
        cycleEntrance: null,
        result: null,
        slowSteps: 0,
        fastSteps: 0,
        mathInvariant: null,
        message: "while fast and fast.next: fast is None. Loop condition is False.",
        explanation: "The loop terminates immediately because fast is None.",
      })
    );

    frames.push(
      Object.freeze({
        activeLine: 8,
        phase: "phase1",
        currentPhase: 1,
        slow: null,
        fast: null,
        ptr1: null,
        ptr2: null,
        meetingPoint: null,
        cycleEntrance: null,
        result: null,
        slowSteps: 0,
        fastSteps: 0,
        mathInvariant: null,
        message: "else: Loop finished without break.",
        explanation: "Python while-else executes the else block when the loop terminates without break.",
      })
    );

    frames.push(
      Object.freeze({
        activeLine: 9,
        phase: "done",
        currentPhase: 1,
        slow: null,
        fast: null,
        ptr1: null,
        ptr2: null,
        meetingPoint: null,
        cycleEntrance: null,
        result: null,
        slowSteps: 0,
        fastSteps: 0,
        mathInvariant: null,
        message: "return None: No cycle in an empty list.",
        explanation: "Result is None. There is no cycle.",
      })
    );

    return {
      nodes,
      pos: cyclePos,
      cycleNode,
      frames: Object.freeze(frames),
    };
  }

  // Initialize slow = fast = head
  let slowPos = 0;
  let fastPos = 0;
  let slowSteps = 0;
  let fastSteps = 0;

  frames.push(
    Object.freeze({
      activeLine: 2,
      phase: "init",
      currentPhase: 1,
      slow: slowPos,
      fast: fastPos,
      ptr1: null,
      ptr2: null,
      meetingPoint: null,
      cycleEntrance: null,
      result: null,
      slowSteps: 0,
      fastSteps: 0,
      mathInvariant: null,
      message: `slow = fast = head: Initialize both pointers at Node 0 (val=${nodes[0].val}).`,
      explanation:
        "Phase 1 begins: slow pointer advances 1 step at a time, while fast pointer advances 2 steps at a time. If a cycle exists, fast will catch slow.",
    })
  );

  let met = false;
  let meetPos = null;
  const maxSafetySteps = (n + 2) * 5;
  let iter = 0;

  while (iter++ < maxSafetySteps) {
    const fastCanAdvance =
      fastPos !== null &&
      nodes[fastPos] &&
      nodes[fastPos].next !== null;

    frames.push(
      Object.freeze({
        activeLine: 3,
        phase: "phase1",
        currentPhase: 1,
        slow: slowPos,
        fast: fastPos,
        ptr1: null,
        ptr2: null,
        meetingPoint: null,
        cycleEntrance: null,
        result: null,
        slowSteps,
        fastSteps,
        mathInvariant: null,
        message: fastCanAdvance
          ? `while fast and fast.next: fast is at Node ${fastPos} (val=${nodes[fastPos].val}), fast.next is Node ${nodes[fastPos].next}. Loop continues.`
          : fastPos === null
          ? "while fast and fast.next: fast is None. End of list reached."
          : `while fast and fast.next: fast is at Node ${fastPos}, fast.next is None. End of list reached.`,
        explanation: fastCanAdvance
          ? "Both fast and fast.next are non-null nodes, so fast can safely advance two hops."
          : "The list ends with a null pointer, indicating there is no cycle.",
      })
    );

    if (!fastCanAdvance) {
      break;
    }

    // Move slow by 1 step
    const prevSlow = slowPos;
    slowPos = nodes[slowPos].next;
    slowSteps += 1;

    frames.push(
      Object.freeze({
        activeLine: 4,
        phase: "phase1",
        currentPhase: 1,
        slow: slowPos,
        fast: fastPos,
        ptr1: null,
        ptr2: null,
        meetingPoint: null,
        cycleEntrance: null,
        result: null,
        slowSteps,
        fastSteps,
        mathInvariant: null,
        message: `slow = slow.next: slow advances 1 step from Node ${prevSlow} -> Node ${slowPos} (val=${nodes[slowPos].val}).`,
        explanation: `The slow pointer advances 1 node (step count: ${slowSteps}).`,
      })
    );

    // Move fast by 2 steps
    const prevFast = fastPos;
    const midFast = nodes[fastPos].next;
    fastPos = midFast !== null && nodes[midFast] ? nodes[midFast].next : null;
    fastSteps += 2;

    frames.push(
      Object.freeze({
        activeLine: 5,
        phase: "phase1",
        currentPhase: 1,
        slow: slowPos,
        fast: fastPos,
        ptr1: null,
        ptr2: null,
        meetingPoint: null,
        cycleEntrance: null,
        result: null,
        slowSteps,
        fastSteps,
        mathInvariant: null,
        message:
          fastPos !== null
            ? `fast = fast.next.next: fast advances 2 steps from Node ${prevFast} -> ${midFast} -> Node ${fastPos} (val=${nodes[fastPos].val}).`
            : `fast = fast.next.next: fast advances into None (end of list).`,
        explanation: `The fast pointer advances 2 nodes (step count: ${fastSteps}).`,
      })
    );

    // Check slow == fast
    const isMeeting = slowPos !== null && slowPos === fastPos;

    frames.push(
      Object.freeze({
        activeLine: 6,
        phase: "phase1",
        currentPhase: 1,
        slow: slowPos,
        fast: fastPos,
        ptr1: null,
        ptr2: null,
        meetingPoint: isMeeting ? slowPos : null,
        cycleEntrance: null,
        result: null,
        slowSteps,
        fastSteps,
        isMeeting,
        mathInvariant: null,
        message: isMeeting
          ? `if slow == fast: True! Both pointers meet at Node ${slowPos} (val=${nodes[slowPos].val})!`
          : `if slow == fast: False (slow at Node ${slowPos}, fast at Node ${fastPos !== null ? fastPos : "None"}).`,
        explanation: isMeeting
          ? `Collision confirmed! Pointers met inside the cycle at Node ${slowPos}. Phase 1 complete.`
          : "Pointers have not collided yet; continue cycling.",
      })
    );

    if (isMeeting) {
      met = true;
      meetPos = slowPos;

      frames.push(
        Object.freeze({
          activeLine: 7,
          phase: "phase1",
          currentPhase: 1,
          slow: slowPos,
          fast: fastPos,
          ptr1: null,
          ptr2: null,
          meetingPoint: meetPos,
          cycleEntrance: null,
          result: null,
          slowSteps,
          fastSteps,
          isMeeting: true,
          mathInvariant: null,
          message: `break: Exit Phase 1 loop with meeting point at Node ${meetPos}.`,
          explanation: `A cycle is guaranteed. Meeting point is established at Node ${meetPos}. Now we move to Phase 2 to identify the exact cycle entrance.`,
        })
      );
      break;
    }
  }

  if (!met) {
    // No cycle detected
    frames.push(
      Object.freeze({
        activeLine: 8,
        phase: "phase1",
        currentPhase: 1,
        slow: slowPos,
        fast: fastPos,
        ptr1: null,
        ptr2: null,
        meetingPoint: null,
        cycleEntrance: null,
        result: null,
        slowSteps,
        fastSteps,
        mathInvariant: null,
        message: "else: while loop terminated naturally without break.",
        explanation: "Since no collision occurred and fast reached the end, there is no cycle.",
      })
    );

    frames.push(
      Object.freeze({
        activeLine: 9,
        phase: "done",
        currentPhase: 1,
        slow: slowPos,
        fast: fastPos,
        ptr1: null,
        ptr2: null,
        meetingPoint: null,
        cycleEntrance: null,
        result: null,
        slowSteps,
        fastSteps,
        mathInvariant: null,
        message: "return None: No cycle detected in the linked list.",
        explanation: "Floyd's algorithm confirms that the list is linear with no loop. Return None.",
      })
    );

    return {
      nodes,
      pos: cyclePos,
      cycleNode,
      frames: Object.freeze(frames),
    };
  }

  // Phase 2: Find the cycle entrance
  const F = cyclePos; // Distance from head to cycle entrance
  const C = n - cyclePos; // Length of the cycle
  const a = (meetPos - cyclePos + C) % C; // Distance from entrance to meeting point
  const laps = Math.max(1, Math.round((slowSteps - F - a) / C) + 1);

  const mathInvariant = Object.freeze({
    F,
    C,
    a,
    laps,
    formula: "2(F + a) = F + a + nC  =>  F = nC - a",
    detailed: `F = ${F} (straight path), C = ${C} (cycle length), a = ${a} (entrance to collision). Invariant holds: F = ${laps}×${C} - ${a} = ${laps * C - a}.`,
    distanceToEntrance: (C - a) % C,
  });

  let p1 = 0;
  let p2 = meetPos;
  let phase2Steps = 0;

  // Line 10: ptr1 = head
  frames.push(
    Object.freeze({
      activeLine: 10,
      phase: "phase2",
      currentPhase: 2,
      slow: meetPos,
      fast: meetPos,
      ptr1: p1,
      ptr2: null,
      meetingPoint: meetPos,
      cycleEntrance: null,
      result: null,
      phase2Steps,
      mathInvariant,
      message: `ptr1 = head: Reset ptr1 to head of linked list (Node 0, val=${nodes[0].val}).`,
      explanation: `Phase 2 begins! ptr1 starts at head (index 0). It will travel distance F = ${F} to reach the cycle entrance.`,
    })
  );

  // Line 11: ptr2 = slow
  frames.push(
    Object.freeze({
      activeLine: 11,
      phase: "phase2",
      currentPhase: 2,
      slow: meetPos,
      fast: meetPos,
      ptr1: p1,
      ptr2: p2,
      meetingPoint: meetPos,
      cycleEntrance: null,
      result: null,
      phase2Steps,
      mathInvariant,
      message: `ptr2 = slow: Keep ptr2 at meeting point Node ${p2} (val=${nodes[p2].val}).`,
      explanation: `ptr2 starts at the collision point Node ${p2}. Moving F steps from Node ${p2} inside a cycle of length ${C} lands exactly at the cycle entrance because F = nC - a!`,
    })
  );

  while (p1 !== p2) {
    // Line 12 check
    frames.push(
      Object.freeze({
        activeLine: 12,
        phase: "phase2",
        currentPhase: 2,
        slow: meetPos,
        fast: meetPos,
        ptr1: p1,
        ptr2: p2,
        meetingPoint: meetPos,
        cycleEntrance: null,
        result: null,
        phase2Steps,
        mathInvariant,
        isEntrance: false,
        message: `while ptr1 != ptr2: ptr1 at Node ${p1} (val=${nodes[p1].val}) != ptr2 at Node ${p2} (val=${nodes[p2].val}).`,
        explanation: `ptr1 and ptr2 have not yet met. Both will advance exactly 1 step.`,
      })
    );

    // Line 13: ptr1 = ptr1.next
    const prevP1 = p1;
    p1 = nodes[p1].next;

    frames.push(
      Object.freeze({
        activeLine: 13,
        phase: "phase2",
        currentPhase: 2,
        slow: meetPos,
        fast: meetPos,
        ptr1: p1,
        ptr2: p2,
        meetingPoint: meetPos,
        cycleEntrance: null,
        result: null,
        phase2Steps,
        mathInvariant,
        message: `ptr1 = ptr1.next: ptr1 advances 1 step from Node ${prevP1} -> Node ${p1} (val=${nodes[p1].val}).`,
        explanation: `ptr1 advances along the straight path towards the cycle entrance.`,
      })
    );

    // Line 14: ptr2 = ptr2.next
    const prevP2 = p2;
    p2 = nodes[p2].next;
    phase2Steps += 1;

    frames.push(
      Object.freeze({
        activeLine: 14,
        phase: "phase2",
        currentPhase: 2,
        slow: meetPos,
        fast: meetPos,
        ptr1: p1,
        ptr2: p2,
        meetingPoint: meetPos,
        cycleEntrance: null,
        result: null,
        phase2Steps,
        mathInvariant,
        message: `ptr2 = ptr2.next: ptr2 advances 1 step from Node ${prevP2} -> Node ${p2} (val=${nodes[p2].val}).`,
        explanation: `ptr2 advances around the cycle towards the cycle entrance (step ${phase2Steps} of ${F}).`,
      })
    );
  }

  // Final check at Line 12 (now p1 == p2)
  frames.push(
    Object.freeze({
      activeLine: 12,
      phase: "phase2",
      currentPhase: 2,
      slow: meetPos,
      fast: meetPos,
      ptr1: p1,
      ptr2: p2,
      meetingPoint: meetPos,
      cycleEntrance: p1,
      result: p1,
      phase2Steps,
      mathInvariant,
      isEntrance: true,
      message: `while ptr1 != ptr2: ptr1 == ptr2 at Node ${p1} (val=${nodes[p1].val})! Loop terminates.`,
      explanation: `Both pointers have met! By mathematical proof (F = nC - a), this exact intersection is the cycle entrance.`,
    })
  );

  // Line 15: return ptr1
  frames.push(
    Object.freeze({
      activeLine: 15,
      phase: "done",
      currentPhase: 2,
      slow: meetPos,
      fast: meetPos,
      ptr1: p1,
      ptr2: p2,
      meetingPoint: meetPos,
      cycleEntrance: p1,
      result: p1,
      phase2Steps,
      mathInvariant,
      isEntrance: true,
      message: `return ptr1: Cycle begins at Node ${p1} (val=${nodes[p1].val}, index=${p1}).`,
      explanation: `Cycle detection complete! Entrance node ${p1} (val=${nodes[p1].val}) returned. Total Phase 2 steps taken: ${phase2Steps} = F.`,
    })
  );

  return {
    nodes,
    pos: cyclePos,
    cycleNode,
    frames: Object.freeze(frames),
  };
}
