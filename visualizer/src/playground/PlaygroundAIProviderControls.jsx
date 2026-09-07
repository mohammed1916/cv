import { useEffect, useState } from "react";
import {
  canUseLocalOllama,
  DEFAULT_LOCAL_OLLAMA_URL,
  getChatProvider,
  setChatProvider,
  subscribeChatProvider,
} from "../services/chatProviders";

const PROVIDERS = [
  { value: "ollama-local", label: "Ollama Local", model: "gemma2:2b" },
  { value: "ollama-cloud", label: "Ollama Cloud", model: "gpt-oss:120b" },
  { value: "gemini", label: "Gemini", model: "gemini-2.5-flash" },
];

function readSessionValue(key) {
  try {
    return window.sessionStorage.getItem(key) || "";
  } catch {
    return "";
  }
}

function storeSessionValue(key, value) {
  try {
    if (value) window.sessionStorage.setItem(key, value);
    else window.sessionStorage.removeItem(key);
  } catch {
    // Provider configuration remains usable when session storage is disabled.
  }
}

function isHostedPage() {
  return !canUseLocalOllama();
}

export default function PlaygroundAIProviderControls() {
  const [config, setConfig] = useState(getChatProvider);
  const [isExpanded, setIsExpanded] = useState(false);
  const [ollamaApiKey, setOllamaApiKey] = useState(() => (
    readSessionValue("chat.ollama-api-key")
  ));
  const [geminiApiKey, setGeminiApiKey] = useState(() => (
    readSessionValue("chat.gemini-api-key")
  ));
  const [localModels, setLocalModels] = useState([]);
  const [checkVersion, setCheckVersion] = useState(0);
  const [localStatus, setLocalStatus] = useState(() => (
    canUseLocalOllama() ? "checking" : "manual"
  ));

  useEffect(() => subscribeChatProvider(setConfig), []);

  useEffect(() => {
    if (config.provider !== "ollama-local") return undefined;
    const controller = new AbortController();
    let active = true;
    const timeout = window.setTimeout(() => controller.abort(), 2500);
    const baseUrl = String(config.localBaseUrl || DEFAULT_LOCAL_OLLAMA_URL).trim().replace(/\/+$/, "");
    fetch(`${baseUrl}/api/tags`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`Ollama returned ${response.status}`);
        return response.json();
      })
      .then((result) => {
        if (!active) return;
        const names = (Array.isArray(result?.models) ? result.models : [])
          .map((model) => String(model?.name || "").trim())
          .filter(Boolean);
        setLocalModels([...new Set(names)]);
        setLocalStatus("ready");
      })
      .catch((error) => {
        if (!active || (error?.name === "AbortError" && controller.signal.reason === "unmount")) return;
        setLocalModels([]);
        setLocalStatus("unavailable");
      }).finally(() => window.clearTimeout(timeout));
    return () => {
      active = false;
      window.clearTimeout(timeout);
      controller.abort("unmount");
    };
  }, [config.provider, config.localBaseUrl, checkVersion]);

  const updateConfig = (nextConfig) => {
    setConfig(nextConfig);
    setChatProvider(nextConfig);
  };
  const selected = PROVIDERS.find((provider) => provider.value === config.provider)
    ?? PROVIDERS[0];
  const isHosted = isHostedPage();
  const appOrigin = typeof window === "undefined" ? "" : window.location.origin;
  const effectiveLocalStatus = localStatus;

  return (
    <section className="runtime-playground__ai-provider" aria-label="AI visual provider">
      <button
        type="button"
        className="runtime-playground__ai-provider-heading"
        aria-expanded={isExpanded}
        aria-controls="runtime-playground-ai-provider-settings"
        onClick={() => setIsExpanded((expanded) => !expanded)}
      >
        <span>
          <strong>AI visual provider</strong>
          <small>Used by Suggest visuals; deterministic tracing does not require AI.</small>
        </span>
        <code>{selected.label}</code>
        <span className="runtime-playground__ai-provider-toggle">
          {isExpanded ? "Hide settings" : "Show settings"}
          <span className="runtime-playground__ai-provider-chevron" aria-hidden="true">⌄</span>
        </span>
      </button>

      <div
        id="runtime-playground-ai-provider-settings"
        className={`runtime-playground__ai-provider-content${isExpanded ? " is-expanded" : ""}`}
        aria-hidden={!isExpanded}
      >
      <div className="runtime-playground__ai-provider-content-inner">
      <div className="runtime-playground__ai-provider-fields">
        <label htmlFor="runtime-playground-ai-provider">
          Provider
          <select
            id="runtime-playground-ai-provider"
            value={config.provider || "ollama-local"}
            onChange={(event) => {
              const provider = PROVIDERS.find((item) => item.value === event.target.value)
                ?? PROVIDERS[0];
              if (provider.value === "ollama-local") {
                setLocalStatus("checking");
              }
              updateConfig({
                ...config,
                provider: provider.value,
                model: provider.model,
              });
            }}
          >
            {PROVIDERS.map((provider) => (
              <option key={provider.value} value={provider.value}>{provider.label}</option>
            ))}
          </select>
        </label>

        <label htmlFor="runtime-playground-ai-model">
          Model
          <input
            id="runtime-playground-ai-model"
            type="text"
            list={config.provider === "ollama-local" ? "runtime-playground-ollama-models" : undefined}
            value={config.model || selected.model}
            onChange={(event) => updateConfig({
              ...config,
              model: event.target.value,
            })}
            placeholder={selected.model}
            autoComplete="off"
            spellCheck={false}
          />
          {config.provider === "ollama-local" && (
            <datalist id="runtime-playground-ollama-models">
              {localModels.map((model) => <option value={model} key={model} />)}
            </datalist>
          )}
        </label>

        {config.provider === "ollama-local" && (
          <label htmlFor="runtime-playground-ollama-local-url">
            Local endpoint
            <input
              id="runtime-playground-ollama-local-url"
              type="url"
              value={config.localBaseUrl || DEFAULT_LOCAL_OLLAMA_URL}
              onChange={(event) => updateConfig({
                ...config,
                localBaseUrl: event.target.value,
              })}
              placeholder={DEFAULT_LOCAL_OLLAMA_URL}
              autoComplete="off"
              spellCheck={false}
            />
          </label>
        )}

        {config.provider === "ollama-cloud" && (
          <label htmlFor="runtime-playground-ollama-key">
            API key
            <input
              id="runtime-playground-ollama-key"
              type="password"
              value={ollamaApiKey}
              onChange={(event) => {
                setOllamaApiKey(event.target.value);
                storeSessionValue("chat.ollama-api-key", event.target.value);
              }}
              autoComplete="off"
            />
          </label>
        )}

        {config.provider === "gemini" && (
          <label htmlFor="runtime-playground-gemini-key">
            API key
            <input
              id="runtime-playground-gemini-key"
              type="password"
              value={geminiApiKey}
              onChange={(event) => {
                setGeminiApiKey(event.target.value);
                storeSessionValue("chat.gemini-api-key", event.target.value);
              }}
              autoComplete="off"
            />
          </label>
        )}
      </div>

      <p>
        {config.provider === "ollama-local"
          ? effectiveLocalStatus === "ready"
            ? <><strong className="runtime-playground__ollama-ready">Ollama detected.</strong><span> {localModels.length} installed model{localModels.length === 1 ? "" : "s"}; </span><code>{config.model || selected.model}</code><span>{localModels.includes(config.model || selected.model) ? " is available." : " is not installed yet."}</span></>
            : effectiveLocalStatus === "manual"
              ? "To use Local Ollama from this hosted page, run the setup commands below, restart Ollama, then try again."
            : effectiveLocalStatus === "unavailable"
              ? <><strong className="runtime-playground__ollama-unavailable">Could not connect to Ollama.</strong><span> Follow the setup below, then check again.</span></>
              : "Checking for Ollama on this computer..."
          : "Enter your API key for this session, or use the provider configured by the site owner."}
      </p>

      {config.provider === "ollama-local" && (
        <button type="button" className="runtime-playground__ai-provider-toggle" onClick={() => {
          setLocalStatus("checking");
          setCheckVersion((version) => version + 1);
        }}>Check connection / refresh models</button>
      )}
      {config.provider === "ollama-local" && (
        <details className="runtime-playground__ollama-guide">
          <summary>
            <span aria-hidden="true">ⓘ</span>
            Local Ollama setup
          </summary>
          <div>
            <p>
              To use Local Ollama from this {isHosted ? "hosted page" : "computer"}, install Ollama, pull a model, and keep Ollama running.
            </p>
            <ol>
              <li>
                Install Ollama, then open PowerShell and pull your selected model:
                <code>ollama pull {config.model || selected.model}</code>
              </li>
              {isHosted && (
                <li>
                  Allow this hosted site in Ollama:
                  <code>setx OLLAMA_ORIGINS "{appOrigin}"</code>
                  <code>$env:OLLAMA_ORIGINS="{appOrigin}"</code>
                </li>
              )}
              <li>
                Fully quit Ollama (including its tray icon), then start it in this terminal:
                <code>ollama serve</code>
              </li>
            </ol>
            {isHosted && (
              <p>
                Keep this terminal open, then click Check connection / refresh models above.
              </p>
            )}
          </div>
        </details>
      )}
      </div>
      </div>
    </section>
  );
}
