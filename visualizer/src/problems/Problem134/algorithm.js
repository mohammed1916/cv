/**
 * Algorithm implementation and trace generation for Problem 134: Gas Station.
 */

export const CODE = [
  "def canCompleteCircuit(gas, cost):",
  "    if sum(gas) < sum(cost): return -1",
  "    total_tank, curr_tank, start_station = 0, 0, 0",
  "    for i in range(len(gas)):",
  "        total_tank += gas[i] - cost[i]",
  "        curr_tank += gas[i] - cost[i]",
  "        if curr_tank < 0:",
  "            start_station = i + 1",
  "            curr_tank = 0",
  "    return start_station if total_tank >= 0 else -1",
];

/**
 * Validates and parses gas and cost inputs into equal-length arrays of non-negative integers.
 * Accepts either:
 *  - (gasInput, costInput) as two separate arguments
 *  - single argument object { gas, cost }
 *  - single argument array [gasArray, costArray]
 *  - JSON strings for any of the above
 *
 * @param {any} gasInput
 * @param {any} [costInput]
 * @returns {{ gas: number[], cost: number[] }}
 */
export function parseGasCostInput(gasInput, costInput) {
  let rawGas = gasInput;
  let rawCost = costInput;

  if (costInput === undefined) {
    if (rawGas === null || rawGas === undefined) {
      throw new Error("Input cannot be null or undefined");
    }

    if (typeof rawGas === "string") {
      const trimmed = rawGas.trim();
      if (!trimmed) {
        throw new Error("Input string cannot be empty");
      }
      try {
        const parsed = JSON.parse(trimmed);
        return parseGasCostInput(parsed);
      } catch (err) {
        if (err.message && err.message.includes("Input")) {
          throw err;
        }
        throw new Error("Invalid JSON input: must provide both gas and cost arrays", { cause: err });
      }
    }

    if (typeof rawGas === "object") {
      if (Array.isArray(rawGas)) {
        if (rawGas.length === 2 && Array.isArray(rawGas[0]) && Array.isArray(rawGas[1])) {
          return parseGasCostInput(rawGas[0], rawGas[1]);
        }
        throw new Error("Input array must contain exactly two arrays: [gas, cost]");
      } else if ("gas" in rawGas && "cost" in rawGas) {
        return parseGasCostInput(rawGas.gas, rawGas.cost);
      } else {
        throw new Error("Input object must contain both 'gas' and 'cost' fields");
      }
    } else {
      throw new Error("Cost input is required");
    }
  }

  if (rawGas === null || rawGas === undefined || rawCost === null || rawCost === undefined) {
    throw new Error("gas and cost inputs cannot be null or undefined");
  }

  // Parse rawGas if string
  let parsedGas = rawGas;
  if (typeof rawGas === "string") {
    const trimmed = rawGas.trim();
    if (!trimmed) throw new Error("gas input string cannot be empty");
    try {
      parsedGas = JSON.parse(trimmed);
    } catch {
      throw new Error("Invalid JSON format for gas array");
    }
  }

  // Parse rawCost if string
  let parsedCost = rawCost;
  if (typeof rawCost === "string") {
    const trimmed = rawCost.trim();
    if (!trimmed) throw new Error("cost input string cannot be empty");
    try {
      parsedCost = JSON.parse(trimmed);
    } catch {
      throw new Error("Invalid JSON format for cost array");
    }
  }

  if (!Array.isArray(parsedGas)) {
    throw new Error("gas must be an array");
  }
  if (!Array.isArray(parsedCost)) {
    throw new Error("cost must be an array");
  }

  if (parsedGas.length === 0 || parsedCost.length === 0) {
    throw new Error("gas and cost arrays cannot be empty");
  }

  if (parsedGas.length !== parsedCost.length) {
    throw new Error(
      `gas and cost must have the same length (gas has ${parsedGas.length}, cost has ${parsedCost.length})`
    );
  }

  for (let i = 0; i < parsedGas.length; i++) {
    const g = parsedGas[i];
    if (typeof g !== "number" || !Number.isFinite(g) || !Number.isInteger(g) || g < 0) {
      throw new Error(
        `gas[${i}] must be a non-negative integer, got: ${JSON.stringify(g)}`
      );
    }
  }

  for (let i = 0; i < parsedCost.length; i++) {
    const c = parsedCost[i];
    if (typeof c !== "number" || !Number.isFinite(c) || !Number.isInteger(c) || c < 0) {
      throw new Error(
        `cost[${i}] must be a non-negative integer, got: ${JSON.stringify(c)}`
      );
    }
  }

  return {
    gas: [...parsedGas],
    cost: [...parsedCost],
  };
}

/**
 * Creates an immutable snapshot of station states for a frame.
 */
function createStationSnapshots(gas, cost, currentIndex, candidateStart, currTank) {
  const n = gas.length;
  return gas.map((g, idx) => ({
    index: idx,
    gas: g,
    cost: cost[idx],
    net: g - cost[idx],
    isCurrent: idx === currentIndex,
    isCandidate: candidateStart >= 0 && idx === (candidateStart % n),
    isVisited: currentIndex >= 0 && idx <= currentIndex,
    isDeficit: idx === currentIndex && currTank < 0,
  }));
}

/**
 * Builds the visual story for Problem 134: Gas Station.
 * Traces circular track: net gain gas[i] - cost[i], curr_tank balance,
 * resetting start candidate on deficit, and final circuit verification.
 *
 * @param {any} gasInput
 * @param {any} [costInput]
 * @param {object} [options]
 * @param {boolean} [options.skipEarlyCheck=false] Set true to simulate full greedy loop even on deficit
 * @returns {{
 *   gas: number[],
 *   cost: number[],
 *   net: number[],
 *   startStation: number,
 *   canComplete: boolean,
 *   totalGas: number,
 *   totalCost: number,
 *   frames: Array<object>
 * }}
 */
export function buildGasStationStory(gasInput, costInput, options = {}) {
  // Support options passed as second arg if cost is in gasInput object
  let resolvedOptions = options;
  let effectiveCost = costInput;
  if (costInput !== undefined && typeof costInput === "object" && !Array.isArray(costInput) && !("length" in costInput)) {
    // If second arg is options object and gasInput is { gas, cost }
    if (typeof gasInput === "object" && gasInput !== null && "cost" in gasInput) {
      resolvedOptions = costInput;
      effectiveCost = undefined;
    }
  }

  const { gas, cost } = parseGasCostInput(gasInput, effectiveCost);
  const n = gas.length;
  const net = gas.map((g, i) => g - cost[i]);

  const totalGas = gas.reduce((acc, v) => acc + v, 0);
  const totalCost = cost.reduce((acc, v) => acc + v, 0);
  const totalDeficit = totalGas < totalCost;

  const frames = [];

  // Helper to record a frame
  const addFrame = ({
    activeLine,
    phase,
    currentIndex = -1,
    candidateStart = 0,
    totalTank = 0,
    currTank = 0,
    gasGain = null,
    costToNext = null,
    netGain = null,
    event = "step",
    explanation,
    message,
  }) => {
    frames.push({
      activeLine,
      phase,
      currentIndex,
      candidateStart,
      totalTank,
      currTank,
      tankLevel: Math.max(0, currTank),
      gasGain,
      costToNext,
      netGain,
      event,
      stationStates: createStationSnapshots(gas, cost, currentIndex, candidateStart, currTank),
      explanation,
      message,
    });
  };

  // Line 1: Function entry
  addFrame({
    activeLine: 1,
    phase: "init",
    currentIndex: -1,
    candidateStart: 0,
    totalTank: 0,
    currTank: 0,
    event: "init",
    explanation: `Begin canCompleteCircuit with ${n} gas stations. Total fuel available = ${totalGas}, total traversal cost = ${totalCost}.`,
    message: `Init: Checking circuit with ${n} stations (total gas: ${totalGas}, cost: ${totalCost})`,
  });

  // Line 2: if sum(gas) < sum(cost): return -1
  if (totalDeficit && !resolvedOptions.skipEarlyCheck) {
    addFrame({
      activeLine: 2,
      phase: "deficit",
      currentIndex: -1,
      candidateStart: -1,
      totalTank: totalGas - totalCost,
      currTank: 0,
      event: "impossible",
      explanation: `sum(gas) = ${totalGas} < sum(cost) = ${totalCost}. Total fuel is strictly less than total required fuel (${totalGas} < ${totalCost}). Impossible to complete the circuit from any station. Return -1.`,
      message: `Deficit: sum(gas) (${totalGas}) < sum(cost) (${totalCost}) -> return -1`,
    });

    return {
      gas,
      cost,
      net,
      startStation: -1,
      canComplete: false,
      totalGas,
      totalCost,
      frames,
    };
  }

  // If sum(gas) >= sum(cost), explain that condition is false and proceed
  addFrame({
    activeLine: 2,
    phase: "check",
    currentIndex: -1,
    candidateStart: 0,
    totalTank: 0,
    currTank: 0,
    event: "feasible-check",
    explanation: totalDeficit
      ? `sum(gas) = ${totalGas} < sum(cost) = ${totalCost}. [Full simulation mode]: Continuing greedy walk to demonstrate station-by-station deficits.`
      : `sum(gas) = ${totalGas} >= sum(cost) = ${totalCost}. Total gas meets or exceeds total cost. By mathematical invariant, at least one valid starting station is guaranteed to exist.`,
    message: totalDeficit
      ? `Simulation: Continuing greedy scan to show circuit deficits`
      : `Feasible: Total fuel (${totalGas}) >= Total cost (${totalCost}). Circuit is possible!`,
  });

  // Line 3: total_tank, curr_tank, start_station = 0, 0, 0
  let total_tank = 0;
  let curr_tank = 0;
  let start_station = 0;

  addFrame({
    activeLine: 3,
    phase: "init",
    currentIndex: -1,
    candidateStart: start_station,
    totalTank: total_tank,
    currTank: curr_tank,
    event: "init-state",
    explanation: `Initialize accumulators: total_tank = 0, curr_tank = 0, start_station candidate = 0.`,
    message: `Initialized total_tank=0, curr_tank=0, start_station=0`,
  });

  // Line 4: for i in range(len(gas)):
  for (let i = 0; i < n; i++) {
    const diff = gas[i] - cost[i];

    // Frame: arriving at station i
    addFrame({
      activeLine: 4,
      phase: "travel",
      currentIndex: i,
      candidateStart: start_station,
      totalTank: total_tank,
      currTank: curr_tank,
      gasGain: gas[i],
      costToNext: cost[i],
      netGain: diff,
      event: "arrive-station",
      explanation: `Car visits Station ${i}. Fuel gain at station = +${gas[i]}, cost to reach station ${(i + 1) % n} = -${cost[i]}. Net change = ${diff >= 0 ? "+" : ""}${diff}. Candidate start remains Station ${start_station}.`,
      message: `Station ${i}: +${gas[i]} gas, -${cost[i]} cost (net: ${diff >= 0 ? "+" : ""}${diff})`,
    });

    // Line 5: total_tank += gas[i] - cost[i]
    total_tank += diff;
    addFrame({
      activeLine: 5,
      phase: "travel",
      currentIndex: i,
      candidateStart: start_station,
      totalTank: total_tank,
      currTank: curr_tank,
      gasGain: gas[i],
      costToNext: cost[i],
      netGain: diff,
      event: "update-total",
      explanation: `Update global circuit balance: total_tank += gas[${i}] - cost[${i}] (${diff >= 0 ? "+" : ""}${diff}) -> total_tank = ${total_tank}.`,
      message: `Updated total_tank = ${total_tank}`,
    });

    // Line 6: curr_tank += gas[i] - cost[i]
    curr_tank += diff;
    addFrame({
      activeLine: 6,
      phase: "travel",
      currentIndex: i,
      candidateStart: start_station,
      totalTank: total_tank,
      currTank: curr_tank,
      gasGain: gas[i],
      costToNext: cost[i],
      netGain: diff,
      event: "update-tank",
      explanation: `Update current leg fuel tank: curr_tank += gas[${i}] - cost[${i}] (${diff >= 0 ? "+" : ""}${diff}) -> curr_tank = ${curr_tank}.`,
      message: `Updated curr_tank = ${curr_tank}`,
    });

    // Line 7: if curr_tank < 0:
    const isDeficit = curr_tank < 0;
    addFrame({
      activeLine: 7,
      phase: isDeficit ? "deficit" : "travel",
      currentIndex: i,
      candidateStart: start_station,
      totalTank: total_tank,
      currTank: curr_tank,
      gasGain: gas[i],
      costToNext: cost[i],
      netGain: diff,
      event: isDeficit ? "deficit-check" : "tank-ok",
      explanation: isDeficit
        ? `Fuel deficit encountered! curr_tank = ${curr_tank} (< 0). The car cannot make the journey from Station ${i} to Station ${(i + 1) % n}.`
        : `curr_tank = ${curr_tank} (>= 0). Sufficient fuel exists to reach Station ${(i + 1) % n}.`,
      message: isDeficit
        ? `Deficit at station ${i}! curr_tank (${curr_tank}) < 0`
        : `Tank positive (${curr_tank} remaining), continue circuit`,
    });

    if (isDeficit) {
      const prevCandidate = start_station;
      start_station = i + 1;

      // Line 8: start_station = i + 1
      addFrame({
        activeLine: 8,
        phase: "deficit",
        currentIndex: i,
        candidateStart: start_station,
        totalTank: total_tank,
        currTank: curr_tank,
        gasGain: gas[i],
        costToNext: cost[i],
        netGain: diff,
        event: "reset-candidate",
        explanation: `Since stations ${prevCandidate} through ${i} all produced a deficit by station ${i}, none of them can be the valid starting station. Reset candidate start_station to ${start_station} (i + 1).`,
        message: `Reset start_station = ${start_station} (advancing past deficit)`,
      });

      // Line 9: curr_tank = 0
      curr_tank = 0;
      addFrame({
        activeLine: 9,
        phase: "deficit",
        currentIndex: i,
        candidateStart: start_station,
        totalTank: total_tank,
        currTank: curr_tank,
        gasGain: gas[i],
        costToNext: cost[i],
        netGain: diff,
        event: "reset-tank",
        explanation: `Reset curr_tank = 0 for the fresh journey candidate starting at Station ${start_station}.`,
        message: `curr_tank reset to 0`,
      });
    }
  }

  // Line 10: return start_station if total_tank >= 0 else -1
  const canComplete = total_tank >= 0;
  const startStation = canComplete ? start_station : -1;

  addFrame({
    activeLine: 10,
    phase: "done",
    currentIndex: canComplete ? (startStation % n) : -1,
    candidateStart: startStation,
    totalTank: total_tank,
    currTank: curr_tank,
    event: canComplete ? "success" : "failure",
    explanation: canComplete
      ? `One-pass scan complete. Overall balance total_tank = ${total_tank} (>= 0). Return start_station = ${startStation}. Starting at Station ${startStation} allows completing the full circular circuit!`
      : `One-pass scan complete. Overall balance total_tank = ${total_tank} (< 0). Return -1. Total fuel is insufficient to complete the circuit from any station.`,
    message: canComplete
      ? `Feasible circuit found! Start at station ${startStation}`
      : `Circuit impossible: total_tank (${total_tank}) < 0 -> return -1`,
  });

  return {
    gas,
    cost,
    net,
    startStation,
    canComplete,
    totalGas,
    totalCost,
    frames,
  };
}
