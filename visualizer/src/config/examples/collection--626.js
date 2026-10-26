// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "An odd roster swaps full pairs and retains the final student",
    "input": "{\"seat\":[{\"id\":1,\"student\":\"Mira\"},{\"id\":2,\"student\":\"Dev\"},{\"id\":3,\"student\":\"Lina\"},{\"id\":4,\"student\":\"Omar\"},{\"id\":5,\"student\":\"Nia\"},{\"id\":6,\"student\":\"Pavel\"},{\"id\":7,\"student\":\"Rhea\"}]}"
  },
  {
    "label": "One student keeps the only seat",
    "input": "{\"seat\":[{\"id\":1,\"student\":\"Sora\"}]}"
  },
  {
    "label": "An even roster swaps every seat",
    "input": "{\"seat\":[{\"id\":1,\"student\":\"Tia\"},{\"id\":2,\"student\":\"Uma\"},{\"id\":3,\"student\":\"Vik\"},{\"id\":4,\"student\":\"Wen\"}]}"
  },
  {
    "label": "An empty roster stays empty",
    "input": "{\"seat\":[]}"
  }
];
