import { createWorkspaceContext, runWorkspaceAgent } from "./workspaceContext.js";
import {
  getChatProvider,
  streamProviderChat,
} from "../../services/chatProviders.js";
import { normalizePythonInputForEntry } from "../runtime/inferPythonInput.js";

const ALLOWED_KINDS = new Set([
  "auto",
  "sequence",
  "grid",
  "associative",
  "graph",
  "tree",
  "heap",
  "scalar",
]);
const ALLOWED_VIEWS = new Set(["cells", "bars", "line"]);
const ALLOWED_ROLES = new Set(["value", "pointer"]);
const ALLOWED_POINTER_MODES = new Set(["index", "value"]);

function isPlainObject(value) {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function selectedProviderConfig() {
  const config = getChatProvider();
  try {
    return {
      ...config,
      ollamaApiKey: window.sessionStorage.getItem("chat.ollama-api-key") || "",
      geminiApiKey: window.sessionStorage.getItem("chat.gemini-api-key") || "",
    };
  } catch {
    return config;
  }
}

function providerLabel(config) {
  if (config.provider === "gemini") return "Gemini";
  if (config.provider === "ollama-cloud") return "Ollama Cloud";
  return "Ollama Local";
}

export function createVisualSuggestionMessages({
  source,
  inputSource,
  entry,
  traceResult,
  bindings,
}) {
  const context = createWorkspaceContext({ source, inputSource, entry, traceResult, bindings });
  return [
    {
      role: "system",
      text: `You select visuals for a deterministic competitive-programming trace. Return only one JSON object and no markdown. Never invent variables or values.

The response schema is:
{"bindings":{"variableName":{"enabled":true,"kind":"auto|sequence|grid|associative|graph|tree|heap|scalar","view":"cells|bars|line","role":"value|pointer","target":"sequenceVariable","pointerMode":"index|value"}},"summary":"short explanation"}

Rules:
- Include every supplied variable and set enabled false for noisy implementation details.
- Prefer 2 to 7 enabled value visuals plus useful loop/index highlighters.
- Numeric arrays usually use bars; identifiers and strings usually use cells; trends may use line.
- A pointer role is valid only for a scalar. Its target must be an enabled sequence variable.
- Use pointerMode index for an integer position and value for a loop value that matches an array item.
- Keep return values visible when useful.
- Do not modify or explain the algorithm. Do not emit fields outside the schema.`,
    },
    {
      role: "user",
      text: context.overview,
    },
  ];
}

function balancedObjects(text) {
  const candidates = [];
  for (let start = 0; start < text.length; start += 1) {
    if (text[start] !== "{") continue;
    let depth = 0;
    let inString = false;
    let escaped = false;
    for (let index = start; index < text.length; index += 1) {
      const character = text[index];
      if (inString) {
        if (escaped) escaped = false;
        else if (character === "\\") escaped = true;
        else if (character === '"') inString = false;
        continue;
      }
      if (character === '"') inString = true;
      else if (character === "{") depth += 1;
      else if (character === "}") {
        depth -= 1;
        if (depth === 0) {
          candidates.push(text.slice(start, index + 1));
          break;
        }
      }
    }
  }
  return candidates;
}

function parseSuggestionJson(text) {
  const trimmed = String(text || "").trim();
  const fenced = [...trimmed.matchAll(/```(?:json)?\s*([\s\S]*?)```/gi)]
    .map((match) => match[1].trim());
  const candidates = [trimmed, ...fenced, ...balancedObjects(trimmed)];
  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate);
      if (isPlainObject(parsed)) return parsed;
    } catch {
      // Try the next complete JSON candidate.
    }
  }
  throw new Error("The AI provider did not return a valid visual configuration.");
}

export function parseVisualSuggestion(text, variables = []) {
  const parsed = parseSuggestionJson(text);
  const rawBindings = isPlainObject(parsed.bindings) ? parsed.bindings : null;
  if (!rawBindings) {
    throw new Error("The AI response is missing its bindings object.");
  }

  const knownNames = new Set(
    variables
      .filter((variable) => variable?.name != null)
      .map((variable) => String(variable.name)),
  );
  const bindings = {};

  Object.entries(rawBindings).forEach(([name, rawConfig]) => {
    if (!knownNames.has(name) || !isPlainObject(rawConfig)) return;
    const config = {};
    if (typeof rawConfig.enabled === "boolean") config.enabled = rawConfig.enabled;
    if (ALLOWED_KINDS.has(rawConfig.kind)) {
      config.kind = rawConfig.kind === "auto" ? null : rawConfig.kind;
    }
    if (ALLOWED_VIEWS.has(rawConfig.view)) config.view = rawConfig.view;
    if (ALLOWED_ROLES.has(rawConfig.role)) config.role = rawConfig.role;
    if (knownNames.has(rawConfig.target)) config.target = rawConfig.target;
    if (ALLOWED_POINTER_MODES.has(rawConfig.pointerMode)) {
      config.pointerMode = rawConfig.pointerMode;
    }
    bindings[name] = config;
  });

  if (Object.keys(bindings).length === 0) {
    throw new Error("The AI response did not contain any known traced variables.");
  }

  return {
    bindings,
    summary: typeof parsed.summary === "string"
      ? parsed.summary.trim().slice(0, 240)
      : "AI visual suggestions applied.",
  };
}

export async function suggestPythonBindings(options, dependencies = {}) {
  const config = dependencies.config ?? selectedProviderConfig();
  const stream = dependencies.stream ?? streamProviderChat;
  const messages = createVisualSuggestionMessages(options);
  const responseText = await runWorkspaceAgent(messages, options, { ...dependencies, stream, config });

  const suggestion = parseVisualSuggestion(
    responseText,
    options.traceResult?.variables,
  );
  return { ...suggestion, provider: providerLabel(config) };
}

export function createInputSuggestionMessages({ source, entry, inputSource, instruction }) {
  return [
    {
      role: "system",
      text: `Generate one small, valid example input for a Python competitive-programming function. Return only one JSON object and no markdown.

The response schema is:
{"inputs":<JSON value passed to the entry function>,"summary":"short explanation"}

Rules:
- Inspect the function signature and algorithm to choose meaningful values.
- For multiple named parameters, inputs must be an object keyed by parameter name.
- Exercise the main algorithm path while keeping collections small enough to visualize.
- Use only JSON values. Do not emit Python literals, code, comments, or extra fields.`,
    },
    {
      role: "user",
      text: createWorkspaceContext({ source, entry, inputSource, instruction }).overview,
    },
  ];
}

export async function suggestPythonInputs(options, dependencies = {}) {
  const config = dependencies.config ?? selectedProviderConfig();
  const stream = dependencies.stream ?? streamProviderChat;
  const responseText = await runWorkspaceAgent(createInputSuggestionMessages(options), options, { ...dependencies, stream, config });

  const parsed = parseSuggestionJson(responseText);
  if (!Object.hasOwn(parsed, "inputs")) {
    throw new Error("The AI response is missing its inputs value.");
  }
  const normalized = normalizePythonInputForEntry(
    options.source,
    parsed.inputs,
    options.entry,
  );
  const inputSource = JSON.stringify(normalized.value, null, 2);
  if (inputSource === undefined) {
    throw new Error("The AI returned inputs that cannot be represented as JSON.");
  }
  return {
    inputSource,
    summary: typeof parsed.summary === "string"
      ? parsed.summary.trim().slice(0, 240)
      : "Generated example inputs. Python will run automatically.",
    provider: providerLabel(config),
    removedInputs: normalized.removed,
    addedInputs: normalized.added,
  };
}
