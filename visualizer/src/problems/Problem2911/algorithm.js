
const PYTHON_SOURCE = `def minimumChanges(s: str, k: int) -> int:
    n = len(s)
    width = n + 1

    # 255 means that the substring cost has not been computed yet.
    cost = bytearray([255]) * (width * width)

    # ---------------------------------------------------------
    # PHASE 1: PRECOMPUTE SEMI-PALINDROME COSTS
    # ---------------------------------------------------------

    for d in range(1, n // 2 + 1):
        two_back = bytearray(width)
        one_back = bytearray(width)
        current = bytearray(width)

        for blocks in range(2, n // d + 1):
            length = blocks * d
            limit = n - length + 1

            for left in range(limit):
                right = left + length

                # The inner substring has blocks - 2 blocks.
                changes = two_back[left + d] if blocks >= 4 else 0

                # Compare corresponding characters in the outer blocks.
                for offset in range(d):
                    i = left + offset
                    j = right - d + offset

                    while i < j:
                        changes += s[i] != s[j]
                        i += d
                        j -= d

                # Store this divisor's cost for the substring.
                current[left] = changes

                index = left * width + right

                if changes < cost[index]:
                    cost[index] = changes

            # Rotate references. No array copying.
            two_back, one_back, current = one_back, current, two_back

    # ---------------------------------------------------------
    # PHASE 2: PARTITION DP
    # ---------------------------------------------------------

    INF = n + 1

    previous = [INF] * width
    previous[0] = 0

    for pieces in range(1, k + 1):
        current = [INF] * width

        # Every previous piece needs at least 2 characters.
        min_start = 2 * (pieces - 1)

        # Every completed piece needs at least 2 characters.
        for end in range(2 * pieces, width):
            best = INF

            for start in range(min_start, end - 1):
                candidate = (
                    previous[start]
                    + cost[start * width + end]
                )

                if candidate < best:
                    best = candidate

            current[end] = best

        previous = current

    return previous[n]
`;

export const python = PYTHON_SOURCE;

export const code = PYTHON_SOURCE
  .split("\n")
  .filter((line, index, lines) => {
    return index < lines.length - 1;
  })
  .map((text, index) => ({
    line: index + 1,
    text
  }));

// -------------------------------------------------------------
// INPUT VALIDATION
// -------------------------------------------------------------

export function parseInput(text) {
  let data;

  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(
      'Input must be JSON, e.g. {"s":"abcac","k":2}'
    );
  }

  if (
    !data ||
    typeof data !== "object" ||
    Array.isArray(data)
  ) {
    throw new Error("Input must be a JSON object.");
  }

  const { s, k } = data;

  if (typeof s !== "string" || s.length < 2 || s.length > 12) {
    throw new Error(
      "s must contain between 2 and 12 characters for this visualization."
    );
  }

  if (!/^[a-z]+$/.test(s)) {
    throw new Error(
      "s must contain only lowercase English letters."
    );
  }

  if (
    !Number.isInteger(k) ||
    k < 1 ||
    k > Math.floor(s.length / 2)
  ) {
    throw new Error(
      `k must be between 1 and ${Math.floor(s.length / 2)}.`
    );
  }

  return { s, k };
}

// -------------------------------------------------------------
// TRACE GENERATOR
// -------------------------------------------------------------

export function buildTrace({ s, k }) {
  const n = s.length;
  const width = n + 1;
  const INF = n + 1;

  const cost = Array.from(
    { length: width },
    () => Array(width).fill(255)
  );

  const frames = [];

  // -----------------------------------------------------------
  // DP STORAGE
  // -----------------------------------------------------------

  const dp = Array.from(
    { length: k + 1 },
    () => Array(width).fill(INF)
  );

  const parent = Array.from(
    { length: k + 1 },
    () => Array(width).fill(-1)
  );

  dp[0][0] = 0;

  // -----------------------------------------------------------
  // SNAPSHOTS
  // -----------------------------------------------------------

  const costSnapshot = () =>
    cost.map(row =>
      row.map(value => value === 255 ? null : value)
    );

  const dpSnapshot = () =>
    dp.map(row =>
      row.map(value => value >= INF ? null : value)
    );

  const bufferSnapshot = buffer =>
    Array.from(buffer);

  const makeBuffers = (
    twoBack,
    oneBack,
    current,
    layers
  ) => ({
    buffers: {
      twoBack: bufferSnapshot(twoBack),
      oneBack: bufferSnapshot(oneBack),
      current: bufferSnapshot(current)
    },

    bufferLayers: {
      twoBack: layers.twoBack,
      oneBack: layers.oneBack,
      current: layers.current
    }
  });

  const emit = (phase, message, extra = {}) => {
    frames.push({
      phase,
      message,
      ...extra
    });
  };

  // -----------------------------------------------------------
  // PHASE 0: SETUP
  // -----------------------------------------------------------

  emit(
    "setup",
    "Initialize the substring cost matrix. Every entry starts at infinity because no semi-palindrome cost has been computed yet.",
    {
      row: 0,
      column: 0,
      table: dpSnapshot(),
      costTable: costSnapshot()
    }
  );

  emit(
    "setup",
    "We will fix a divisor d, calculate costs for substrings with d-sized blocks, and reuse results from two blocks smaller.",
    {
      row: 0,
      column: 0,
      table: dpSnapshot(),
      costTable: costSnapshot()
    }
  );

  // ===========================================================
  // PHASE 1: SEMI-PALINDROME COST PRECOMPUTATION
  // ===========================================================

  for (let d = 1; d <= Math.floor(n / 2); d++) {
    // Three rolling buffers.
    let twoBack = new Uint8Array(width);
    let oneBack = new Uint8Array(width);
    let current = new Uint8Array(width);

    // Which block-count layer each buffer currently represents.
    const layers = {
      twoBack: null,
      oneBack: null,
      current: null
    };

    emit(
      "divisor",
      `Choose divisor d = ${d}. Each substring is divided into blocks of ${d} characters. We will process 2, 3, 4, ... blocks.`,
      {
        d,
        blocks: null,
        buffers: {
          twoBack: bufferSnapshot(twoBack),
          oneBack: bufferSnapshot(oneBack),
          current: bufferSnapshot(current)
        },
        bufferLayers: { ...layers },
        costTable: costSnapshot()
      }
    );

    for (let blocks = 2; blocks <= Math.floor(n / d); blocks++) {
      const length = blocks * d;
      const limit = n - length + 1;

      emit(
        "blocks",
        `Process substrings containing ${blocks} blocks of size ${d}. Their total length is ${length}. There are ${limit} possible starting positions.`,
        {
          d,
          blocks,
          length,
          limit,
          buffers: {
            twoBack: bufferSnapshot(twoBack),
            oneBack: bufferSnapshot(oneBack),
            current: bufferSnapshot(current)
          },
          bufferLayers: { ...layers },
          costTable: costSnapshot()
        }
      );

      // -------------------------------------------------------
      // PROCESS EVERY SUBSTRING WITH THIS LENGTH
      // -------------------------------------------------------

      for (let left = 0; left < limit; left++) {
        const right = left + length;

        // For B >= 4, the inner substring has B - 2 blocks.
        const innerIndex = left + d;

        const innerCost =
          blocks >= 4
            ? twoBack[innerIndex]
            : 0;

        let changes = innerCost;

        emit(
          "recurrence",
          blocks >= 4
            ? `Start substring s[${left}:${right}]. Read the inner result from two_back[${innerIndex}] = ${innerCost}. Now compare the outer blocks.`
            : `Start substring s[${left}:${right}]. This is a base case with ${blocks} blocks, so the inner contribution is zero. Now compare the outer blocks.`,
          {
            d,
            blocks,
            left,
            right,
            innerIndex,
            innerCost,
            changes,
            offset: -1,
            buffers: {
              twoBack: bufferSnapshot(twoBack),
              oneBack: bufferSnapshot(oneBack),
              current: bufferSnapshot(current)
            },
            bufferLayers: { ...layers },
            costTable: costSnapshot()
          }
        );

        // -----------------------------------------------------
        // OFFSET LOOP
        // -----------------------------------------------------

        for (let offset = 0; offset < d; offset++) {
          let i = left + offset;
          let j = right - d + offset;

          let pairIndex = 0;

          emit(
            "offset",
            `Offset ${offset}: compare the characters at positions left + offset = ${i} and right - d + offset = ${j}. Move inward by d after every comparison.`,
            {
              d,
              blocks,
              left,
              right,
              offset,
              pairIndex,
              leftIndex: i,
              rightIndex: j,
              leftChar: s[i],
              rightChar: s[j],
              mismatch: null,
              changes,
              innerCost,
              buffers: {
                twoBack: bufferSnapshot(twoBack),
                oneBack: bufferSnapshot(oneBack),
                current: bufferSnapshot(current)
              },
              bufferLayers: { ...layers },
              costTable: costSnapshot()
            }
          );

          while (i < j) {
            const leftChar = s[i];
            const rightChar = s[j];

            const mismatch = leftChar !== rightChar;

            if (mismatch) {
              changes++;
            }

            emit(
              "offset",
              mismatch
                ? `Pair ${pairIndex + 1}, offset ${offset}: s[${i}] = "${leftChar}" differs from s[${j}] = "${rightChar}". Add one change. Running total = ${changes}.`
                : `Pair ${pairIndex + 1}, offset ${offset}: s[${i}] = "${leftChar}" matches s[${j}] = "${rightChar}". No change needed. Running total = ${changes}.`,
              {
                d,
                blocks,
                left,
                right,
                offset,
                pairIndex,
                leftIndex: i,
                rightIndex: j,
                leftChar,
                rightChar,
                mismatch,
                changes,
                innerCost,
                buffers: {
                  twoBack: bufferSnapshot(twoBack),
                  oneBack: bufferSnapshot(oneBack),
                  current: bufferSnapshot(current)
                },
                bufferLayers: { ...layers },
                costTable: costSnapshot()
              }
            );

            i += d;
            j -= d;
            pairIndex++;
          }

          emit(
            "offset",
            `Finished offset ${offset}. The next offset compares a different residue class modulo d.`,
            {
              d,
              blocks,
              left,
              right,
              offset,
              pairIndex,
              leftIndex: null,
              rightIndex: null,
              changes,
              innerCost,
              mismatch: null,
              buffers: {
                twoBack: bufferSnapshot(twoBack),
                oneBack: bufferSnapshot(oneBack),
                current: bufferSnapshot(current)
              },
              bufferLayers: { ...layers },
              costTable: costSnapshot()
            }
          );
        }

        // -----------------------------------------------------
        // STORE CURRENT DIVISOR COST
        // -----------------------------------------------------

        current[left] = changes;

        const oldCost = cost[left][right];

        if (changes < oldCost) {
          cost[left][right] = changes;
        }

        emit(
          "store",
          `Write ${changes} into current[${left}]. The cost matrix entry cost[${left}][${right}] becomes ${cost[left][right]}${changes < oldCost ? " because this divisor improves the previous best." : " because this is not better than the previous divisor."}`,
          {
            d,
            blocks,
            left,
            right,
            bestCost: cost[left][right],
            divisorCost: changes,
            oldCost: oldCost === 255 ? null : oldCost,
            improved: changes < oldCost,
            buffers: {
              twoBack: bufferSnapshot(twoBack),
              oneBack: bufferSnapshot(oneBack),
              current: bufferSnapshot(current)
            },
            bufferLayers: {
              ...layers,
              current: blocks
            },
            costTable: costSnapshot()
          }
        );
      }

      // -------------------------------------------------------
      // ROTATE BUFFER REFERENCES
      // -------------------------------------------------------

      emit(
        "rotate",
        `Finished block count ${blocks}. Rotate the three buffer references: old one_back becomes two_back, old current becomes one_back, and old two_back becomes current. No array elements are copied.`,
        {
          d,
          blocks,
          buffers: {
            twoBack: bufferSnapshot(twoBack),
            oneBack: bufferSnapshot(oneBack),
            current: bufferSnapshot(current)
          },
          bufferLayers: {
            ...layers,
            current: blocks
          },
          costTable: costSnapshot()
        }
      );

      // Rotate arrays.
      const oldTwoBack = twoBack;
      twoBack = oneBack;
      oneBack = current;
      current = oldTwoBack;

      // Rotate layer identities in exactly the same way.
      const oldTwoBackLayer = layers.twoBack;

      layers.twoBack = layers.oneBack;
      layers.oneBack = layers.current;
      layers.current = oldTwoBackLayer;

      emit(
        "rotate",
        `Rotation complete. two_back now holds layer ${layers.twoBack ?? "empty"}, one_back holds layer ${layers.oneBack ?? "empty"}, and current is ready to be reused.`,
        {
          d,
          blocks,
          buffers: {
            twoBack: bufferSnapshot(twoBack),
            oneBack: bufferSnapshot(oneBack),
            current: bufferSnapshot(current)
          },
          bufferLayers: { ...layers },
          costTable: costSnapshot()
        }
      );
    }
  }

  // ===========================================================
  // PHASE 2: PARTITION DP
  // ===========================================================

  emit(
    "dpSetup",
    "Semi-palindrome costs are ready. Now build the partition DP. dp[p][end] means the minimum changes needed to divide the first end characters into exactly p valid pieces.",
    {
      pieces: 0,
      end: 0,
      table: dpSnapshot(),
      dpTable: dpSnapshot(),
      costTable: costSnapshot()
    }
  );

  for (let pieces = 1; pieces <= k; pieces++) {
    const minStart = 2 * (pieces - 1);
    const minEnd = 2 * pieces;

    emit(
      "dpPieces",
      `Start DP row ${pieces}. min_start = 2 × (${pieces} − 1) = ${minStart}, because the previous ${pieces - 1} pieces each need at least two characters. min_end = 2 × ${pieces} = ${minEnd}, because all ${pieces} pieces need at least two characters.`,
      {
        pieces,
        minStart,
        minEnd,
        previous: [...dp[pieces - 1]],
        current: [...dp[pieces]],
        table: dpSnapshot(),
        dpTable: dpSnapshot(),
        costTable: costSnapshot()
      }
    );

    for (let end = minEnd; end <= n; end++) {
      let best = INF;
      let bestStart = -1;

      emit(
        "dpEnd",
        `Calculate dp[${pieces}][${end}]. The final piece must start at least at index ${minStart}, and it must contain at least two characters.`,
        {
          pieces,
          end,
          minStart,
          minEnd,
          start: null,
          best: null,
          bestStart: null,
          previous: [...dp[pieces - 1]],
          current: [...dp[pieces]],
          table: dpSnapshot(),
          dpTable: dpSnapshot(),
          costTable: costSnapshot()
        }
      );

      // A valid last piece has length >= 2.
      for (let start = minStart; start < end - 1; start++) {
        const previousValue = dp[pieces - 1][start];

        if (previousValue >= INF) {
          emit(
            "dpSkip",
            `Skip start = ${start}. dp[${pieces - 1}][${start}] is infinity, so this prefix cannot form the required number of previous pieces.`,
            {
              pieces,
              end,
              start,
              minStart,
              minEnd,
              previousValue: null,
              best: best >= INF ? null : best,
              bestStart: bestStart < 0 ? null : bestStart,
              previous: [...dp[pieces - 1]],
              current: [...dp[pieces]],
              table: dpSnapshot(),
              dpTable: dpSnapshot(),
              costTable: costSnapshot()
            }
          );

          continue;
        }

        const segmentCost = cost[start][end];

        const candidate = previousValue + segmentCost;

        const improved = candidate < best;

        if (improved) {
          best = candidate;
          bestStart = start;
        }

        emit(
          "dpCandidate",
          `Try the last piece s[${start}:${end}] = "${s.slice(start, end)}". Previous cost ${previousValue} + segment cost ${segmentCost} = ${candidate}.${improved ? ` This is the new minimum, so best_start = ${start}.` : ` The current best ${best} is retained.`}`,
          {
            pieces,
            end,
            start,
            minStart,
            minEnd,
            previousValue,
            segmentCost,
            candidate,
            improved,
            best: best >= INF ? null : best,
            bestStart: bestStart < 0 ? null : bestStart,
            previous: [...dp[pieces - 1]],
            current: [...dp[pieces]],
            table: dpSnapshot(),
            dpTable: dpSnapshot(),
            costTable: costSnapshot()
          }
        );
      }

      // Store the best candidate for this DP cell.
      dp[pieces][end] = best;
      parent[pieces][end] = bestStart;

      emit(
        "dpStore",
        `Store the best result: dp[${pieces}][${end}] = ${best >= INF ? "infinity" : best}. The best final piece starts at ${bestStart}.`,
        {
          pieces,
          end,
          start: bestStart,
          minStart,
          minEnd,
          best: best >= INF ? null : best,
          bestStart: bestStart < 0 ? null : bestStart,
          previous: [...dp[pieces - 1]],
          current: [...dp[pieces]],
          table: dpSnapshot(),
          dpTable: dpSnapshot(),
          costTable: costSnapshot()
        }
      );
    }
  }

  // ===========================================================
  // PHASE 3: RECONSTRUCT OPTIMAL PARTITION
  // ===========================================================

  const result = dp[k][n];

  const partitions = [];

  let end = n;

  for (let pieces = k; pieces >= 1; pieces--) {
    const start = parent[pieces][end];

    if (start < 0) {
      break;
    }

    partitions.push({
      start,
      end,
      text: s.slice(start, end),
      cost: cost[start][end]
    });

    end = start;
  }

  partitions.reverse();

  emit(
    "result",
    `The optimal answer is ${result}. Reconstruct the partition by following parent pointers backward from dp[${k}][${n}].`,
    {
      s,
      k,
      result,
      partitions,
      table: dpSnapshot(),
      dpTable: dpSnapshot(),
      costTable: costSnapshot(),
      row: k,
      column: n
    }
  );

  return {
    input: { s, k },
    result,
    frames,
    rowLabels: Array.from(
      { length: k + 1 },
      (_, i) => `${i} parts`
    ),
    columnLabels: Array.from(
      { length: n + 1 },
      (_, i) => String(i)
    )
  };
}
