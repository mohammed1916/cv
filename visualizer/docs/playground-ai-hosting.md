# Playground AI setup

The Playground keeps its draggable Lumino panels. Open **AI visual provider → Show settings** to choose a provider. Python tracing itself does not require AI.

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
