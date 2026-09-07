# Playground AI setup

The Playground keeps its draggable Lumino panels. Open **AI visual provider → Show settings** to choose a provider. Python tracing itself does not require AI.

## Large code and inputs

AI input generation, visual suggestions, and repair proposals use a browser-side inspection loop. Full source, raw inputs, and user instructions remain available for exact paginated reads. The model initially receives an overview and can request source searches, code outlines, JSON paths, numeric-array statistics, or recorded frames. Statistics scan the entire requested numeric array; frames still have the existing runtime snapshot limits.

This uses a structured JSON request protocol over the existing chat providers, without requiring n8n, embeddings, or a vector database. A model must follow the protocol reliably. Generated code and inputs appear in the existing accept/reject review.

**Context budget** is a user-selected ceiling, not automatic model-capability detection. For Local Ollama it also sets `num_ctx`; choose a value supported by your model and available memory. For cloud providers it limits this app's conversation; it does not enlarge the provider's actual window. Accounting conservatively treats each UTF-8 byte as a token and reserves output space, so it may stop before the model's real token limit.

Inspection is limited to 16 requests. If the conversation exceeds its budget, the model fails to read the complete instruction, or the response is incomplete, the app reports an error instead of applying a partial proposal. No conversation is silently compacted or workspace text clipped. This does not guarantee that a model reasons correctly or reads every relevant source section.

## Hosted cloud providers

For Vercel, set the project root to `visualizer`, build with `npm run build`, and use `dist` as the output directory. The root `api/chat.js` provides the cloud API endpoint; deploying only static files will not provide cloud AI.

Set `OLLAMA_API_KEY` or `GEMINI_API_KEY` in the deployment environment, then redeploy. Alternatively, users can enter their own key in provider settings for that browser session. Do not put keys in `VITE_*` variables, which are exposed to the browser.

Local development continues to use the existing Vite `/api/chat` proxy for cloud providers.

## Local Ollama from either site

Install Ollama first. The in-app setup guide shows the current site's exact origin. On Windows, open PowerShell:

1. Download a model: `ollama pull gemma2:2b`.
2. For a hosted site, run `setx OLLAMA_ORIGINS "https://YOUR-SITE"`, then `$env:OLLAMA_ORIGINS="https://YOUR-SITE"` in the current terminal.
3. Fully quit Ollama, including its tray icon, then run `ollama serve` in that terminal.
4. Select **Ollama Local**, choose the downloaded model, and click **Check connection / refresh models**.

Keep Ollama running. Connection checks time out after 2.5 seconds and use the endpoint entered in settings. A hosted page connects to Ollama on the visitor's own computer. Ollama must allow that site's origin; browser code cannot grant this permission itself.
