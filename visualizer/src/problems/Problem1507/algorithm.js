const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const PYTHON_LINES = [
  "def reformat_date(date):",
  `    months = ${JSON.stringify(MONTHS)}`,
  "    day, month, year = date.split()",
  "    day = day[:-2].zfill(2)",
  "    month_number = months.index(month) + 1",
  '    return f"{year}-{month_number:02d}-{day}"',
];

const CODE = [
  "FUNCTION reformatDate(date)",
  "    months ← [Jan, Feb, …, Dec]",
  "    split date into day, month, year",
  "    day ← day without its suffix, padded to two digits",
  "    monthNumber ← position of month in months, plus 1",
  "    RETURN year, monthNumber padded to two digits, day",
];

function parseJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    throw new Error('Input must be valid JSON, e.g. {"date":"20th Oct 2052"}');
  }
}

export function parseInput(text) {
  const input = typeof text === "string" ? parseJson(text) : text;
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new Error('Input must be a JSON object with a date string, e.g. {"date":"20th Oct 2052"}');
  }
  const { date } = input;
  if (typeof date !== "string") throw new Error("date must be a string such as 20th Oct 2052");
  const match = /^(\d{1,2})(st|nd|rd|th) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) (\d{4})$/.exec(date);
  if (!match) throw new Error('date must look like "20th Oct 2052": ordinal day, three-letter month, four-digit year');
  const day = Number(match[1]);
  const year = Number(match[4]);
  if (day < 1 || day > 31) throw new Error(`day ${day} must be between 1 and 31`);
  if (year < 1900 || year > 2100) throw new Error(`year ${year} must be between 1900 and 2100`);
  return { date };
}

export function buildTrace(input) {
  const { date } = input;
  const tokens = date.split(" ");
  const frames = [];
  const frame = (activeLine, phase, message, extra = {}) => frames.push({
    activeLine, phase, message, tokens: [...tokens], active: -1, day: null, month: null, monthNumber: null, year: null, result: null, ...extra,
  });

  frame(2, "init", `Load the month names: ${MONTHS.join(", ")}.`);
  const [rawDay, month, year] = tokens;
  frame(3, "split", `Split "${date}" into day ${rawDay}, month ${month} and year ${year}.`, { active: 0 });
  const day = rawDay.slice(0, -2).padStart(2, "0");
  frame(4, "day", `Drop the suffix from ${rawDay} and pad: day becomes ${day}.`, { active: 0, day });
  const monthNumber = MONTHS.indexOf(month) + 1;
  frame(5, "month", `${month} is month ${monthNumber}, written as ${String(monthNumber).padStart(2, "0")}.`, { active: 1, day, month, monthNumber });
  const result = `${year}-${String(monthNumber).padStart(2, "0")}-${day}`;
  frame(6, "done", `Return ${result}.`, { active: 2, day, month, monthNumber, year, result });

  return { input: { date }, result, frames };
}

export const python = PYTHON_LINES.join("\n");
export const code = CODE.map((text, index) => ({ line: index + 1, text }));
export const pythonLineMap = { 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6 };
