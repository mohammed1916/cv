import test from "node:test";
import assert from "node:assert/strict";

import { buildGeminiRequest, canUseLocalOllama, streamProviderChat } from "./chatProviders.js";

function streamFromText(text) {
  const encoder = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(text));
      controller.close();
    },
  });
}

test("local Ollama provider streams directly from the browser endpoint", async () => {
  let request;
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url, init) => {
    request = { url, init };
    return new Response(streamFromText(
      '{"message":{"content":"{\\"inputs\\":"}}\n{"message":{"content":"{\\"nums\\":[1,2]}}"}}\n',
    ));
  };

  try {
    let response = "";
    for await (const delta of streamProviderChat(
      [{ role: "user", text: "make inputs" }],
      { provider: "ollama-local", model: "test-model" },
    )) {
      response += delta;
    }

    assert.equal(request.url, "http://127.0.0.1:11434/api/chat");
    assert.equal(JSON.parse(request.init.body).model, "test-model");
    assert.equal(response, '{"inputs":{"nums":[1,2]}}');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("huge AI requests fail before hitting fetch", async () => {
  const originalFetch = globalThis.fetch;
  let called = false;
  globalThis.fetch = async () => {
    called = true;
    throw new Error("fetch should not run");
  };

  try {
    await assert.rejects(
      async () => {
        for await (const _delta of streamProviderChat(
          [{ role: "user", text: "x".repeat(100_000) }],
          { provider: "ollama-local", model: "test-model" },
        )) {
          // Exhaust the stream.
        }
      },
      /too large/i,
    );
    assert.equal(called, false);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("streaming keeps the last event even without a trailing newline", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response(streamFromText('{"message":{"content":"complete"}}'));
  try {
    for (const provider of ['ollama-local', 'ollama-cloud']) {
      let result = '';
      for await (const delta of streamProviderChat([{ role: 'user', text: 'hello' }], { provider, ollamaApiKey: 'k' })) result += delta;
      assert.equal(result, 'complete');
    }
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("Gemini streams directly with the user key in x-goog-api-key", async () => {
  let request;
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url, init) => {
    request = { url, init };
    return new Response(streamFromText(
      'data: {"candidates":[{"content":{"parts":[{"text":"o"}],"role":"model"}}]}\n\n'
      + 'data: {"candidates":[{"content":{"parts":[{"text":"k"}],"role":"model"}}]}\n\n',
      ), { headers: { "content-type": "text/event-stream" } });
  };
  try {
    let response = "";
    for await (const delta of streamProviderChat(
      [{ role: "system", text: "be brief" }, { role: "user", text: "make inputs" }, { role: "assistant", text: "ok" }],
      { provider: "gemini", model: "gemini-2.5-flash", geminiApiKey: "test-key" },
    )) response += delta;
    assert.equal(request.url, "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?alt=sse");
    assert.equal(request.init.headers["x-goog-api-key"], "test-key");
    const body = JSON.parse(request.init.body);
    assert.deepEqual(body.contents.map((c) => c.role), ["user", "model"]);
    assert.equal(body.systemInstruction.parts[0].text, "be brief");
    assert.equal(response, "ok");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("Ollama Cloud uses bearer auth and an NDJSON stream", async () => {
  let request;
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url, init) => {
    request = { url, init };
    return new Response(streamFromText('{"message":{"content":"hi"}}\n{"message":{"content":"!"}}\n'));
  };
  try {
    let response = "";
    for await (const delta of streamProviderChat(
      [{ role: "user", text: "hello" }],
      { provider: "ollama-cloud", model: "gpt-oss:120b", ollamaApiKey: "oll-key" },
    )) response += delta;
    assert.equal(request.url, "https://ollama.com/api/chat");
    assert.equal(request.init.headers.Authorization, "Bearer oll-key");
    const body = JSON.parse(request.init.body);
    assert.equal(body.stream, true);
    assert.equal(body.model, "gpt-oss:120b");
    assert.deepEqual(body.messages, [{ role: "user", content: "hello" }]);
    assert.equal(response, "hi!");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("cloud providers require the user's key before any request", async () => {
  const originalFetch = globalThis.fetch;
  let called = false;
  globalThis.fetch = async () => { called = true; return new Response(""); };
  try {
    await assert.rejects(async () => {
      for await (const _d of streamProviderChat([{ role: "user", text: "x" }], { provider: "ollama-cloud" })) { /* drain */ }
    }, /API key/);
    await assert.rejects(async () => {
      for await (const _d of streamProviderChat([{ role: "user", text: "x" }], { provider: "gemini" })) { /* drain */ }
    }, /API key/);
    assert.equal(called, false);
    assert.equal(buildGeminiRequest([{ role: "user", text: "x" }], { geminiApiKey: "k", model: "m" }).init.headers["x-goog-api-key"], "k");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("an HTML page from the hosted endpoint is reported as an error, never rendered", async () => {
  const originalFetch = globalThis.fetch;
  for (const body of ['<!doctype html><html><body>site</body></html>', '<html><head></head></html>']) {
    globalThis.fetch = async () => new Response(streamFromText(body), { headers: { "content-type": "text/plain" } });
    let rendered = "";
    await assert.rejects(async () => {
      for await (const delta of streamProviderChat([{ role: "user", text: "x" }], { provider: "gemini", geminiApiKey: "k" })) rendered += delta;
    }, /not configured/);
    assert.equal(rendered, "");
  }
  globalThis.fetch = async () => new Response("<!doctype html>", { headers: { "content-type": "text/html; charset=utf-8" } });
  try {
    await assert.rejects(async () => {
      for await (const _d of streamProviderChat([{ role: "user", text: "x" }], { provider: "ollama-cloud", ollamaApiKey: "k" })) { /* drain */ }
    }, /not configured/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("a blocked browser request gives a clear message instead of hanging", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => { throw new TypeError("Failed to fetch"); };
  try {
    await assert.rejects(async () => {
      for await (const _d of streamProviderChat([{ role: "user", text: "x" }], { provider: "ollama-cloud", ollamaApiKey: "k" })) { /* drain */ }
    }, /Could not reach Ollama Cloud[\s\S]*Ollama Local/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("hosted pages may still attempt local Ollama when explicitly selected", async () => {
  const previousWindow = globalThis.window;
  const originalFetch = globalThis.fetch;
  let request;
  globalThis.window = { location: { hostname: "codeplaygroundwebmcp.vercel.app" } };
  globalThis.fetch = async (url, init) => {
    request = { url, init };
    return new Response(streamFromText('{"message":{"content":"ok"}}\n'));
  };

  try {
    assert.equal(canUseLocalOllama(), false);
    let response = "";
    for await (const delta of streamProviderChat(
      [{ role: "user", text: "make inputs" }],
      { provider: "ollama-local", model: "test-model" },
    )) {
      response += delta;
    }

    assert.equal(request.url, "http://127.0.0.1:11434/api/chat");
    assert.equal(response, "ok");
  } finally {
    if (previousWindow === undefined) delete globalThis.window;
    else globalThis.window = previousWindow;
    globalThis.fetch = originalFetch;
  }
});
