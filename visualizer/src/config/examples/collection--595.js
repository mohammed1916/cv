// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Fictional countries qualify by area population both or neither",
    "input": "{\"world\":[{\"name\":\"Aster\",\"continent\":\"Fictional\",\"area\":3400000,\"population\":12000000,\"gdp\":1000000000},{\"name\":\"Beryl\",\"continent\":\"Fictional\",\"area\":400000,\"population\":28000000,\"gdp\":1000000000},{\"name\":\"Cedar\",\"continent\":\"Fictional\",\"area\":5200000,\"population\":51000000,\"gdp\":1000000000},{\"name\":\"Dune\",\"continent\":\"Fictional\",\"area\":2500000,\"population\":18000000,\"gdp\":1000000000},{\"name\":\"Ember\",\"continent\":\"Fictional\",\"area\":3000000,\"population\":24000000,\"gdp\":1000000000},{\"name\":\"Fjord\",\"continent\":\"Fictional\",\"area\":2900000,\"population\":25000000,\"gdp\":1000000000}]}"
  },
  {
    "label": "Exact thresholds are inclusive",
    "input": "{\"world\":[{\"name\":\"Grove\",\"continent\":\"Fictional\",\"area\":3000000,\"population\":1,\"gdp\":1000000000},{\"name\":\"Harbor\",\"continent\":\"Fictional\",\"area\":1,\"population\":25000000,\"gdp\":1000000000}]}"
  },
  {
    "label": "Just below both thresholds fails",
    "input": "{\"world\":[{\"name\":\"Iris\",\"continent\":\"Fictional\",\"area\":2999999,\"population\":24999999,\"gdp\":1000000000}]}"
  },
  {
    "label": "An empty world table returns no rows",
    "input": "{\"world\":[]}"
  }
];
