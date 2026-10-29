const PYTHON_LINES = [
  "def convertTemperature(celsius):",
  "    kelvin = celsius + 273.15",
  "    fahrenheit = celsius * 1.80 + 32.00",
  "    return [kelvin, fahrenheit]",
];

const CODE_LINES = [
  "FUNCTION convertTemperature(celsius)",
  "  kelvin <- celsius + 273.15",
  "  fahrenheit <- celsius * 1.8 + 32",
  "  RETURN the pair [kelvin, fahrenheit]",
];

export const python = PYTHON_LINES.join("\n");
export const code = CODE_LINES.map((text, index) => ({ line: index + 1, text }));

const py = key => {
  const index = PYTHON_LINES.findIndex(line => line.includes(key));
  if (index < 0) throw new Error(`Python line for "${key}" is missing`);
  return index + 1;
};

export function parseInput(text) {
  let obj;
  try {
    obj = typeof text === "string" ? JSON.parse(text) : text;
  } catch {
    throw new Error('Input must be a JSON object such as {"celsius": 36.50}');
  }
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) throw new Error("Input must be a JSON object with a celsius key");
  const { celsius } = obj;
  if (typeof celsius !== "number" || !Number.isFinite(celsius) || celsius < 0 || celsius > 1000) {
    throw new Error("celsius must be a number from 0 to 1000");
  }
  const decimals = String(celsius).split(".")[1] ?? "";
  if (decimals.length > 2) throw new Error("celsius must have at most two decimal places");
  return { celsius };
}

export function buildTrace(input) {
  const { celsius } = input.celsius !== undefined ? input : parseInput(input);
  const frames = [];
  const snap = (phase, activeLine, pyKey, message, extra = {}) => frames.push({
    phase, activeLine, pythonLine: py(pyKey), message, values: [], ...extra,
  });

  snap("setup", 2, "def convertTemperature", `Start with ${celsius} degrees Celsius.`);
  const kelvin = celsius + 273.15;
  snap("kelvin", 2, "kelvin = celsius", `Kelvin is ${celsius} + 273.15 = ${kelvin}.`, { values: [kelvin] });
  const fahrenheit = celsius * 1.8 + 32;
  snap("fahrenheit", 3, "fahrenheit = celsius", `Fahrenheit is ${celsius} * 1.8 + 32 = ${fahrenheit}.`, { values: [kelvin, fahrenheit] });
  const result = [kelvin, fahrenheit];
  snap("done", 4, "return [kelvin, fahrenheit]", `Return [${kelvin}, ${fahrenheit}].`, { values: result, result });
  return { input: { celsius }, result, frames };
}
