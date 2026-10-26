// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Both income thresholds belong to the middle category",
    "input": "{\"rows\":[{\"account_id\":3,\"income\":19999},{\"account_id\":7,\"income\":20000},{\"account_id\":11,\"income\":50000},{\"account_id\":14,\"income\":50001},{\"account_id\":18,\"income\":0},{\"account_id\":23,\"income\":37000},{\"account_id\":28,\"income\":84000}]}"
  },
  {
    "label": "Only high salaries still produces three rows",
    "input": "{\"rows\":[{\"account_id\":1,\"income\":72000},{\"account_id\":2,\"income\":96000}]}"
  },
  {
    "label": "Only average salaries",
    "input": "{\"rows\":[{\"account_id\":6,\"income\":20000},{\"account_id\":9,\"income\":50000}]}"
  },
  {
    "label": "Empty Accounts retains three zero counts",
    "input": "{\"rows\":[]}"
  }
];
