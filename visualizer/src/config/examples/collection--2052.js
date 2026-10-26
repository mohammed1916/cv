// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Row choices balance several word lengths",
    "input": "{\"sentence\":\"quiet river bends beyond the old stone bridge at dawn\",\"k\":16}"
  },
  {
    "label": "The entire sentence fits in the free final row",
    "input": "{\"sentence\":\"blue sky\",\"k\":12}"
  },
  {
    "label": "Each long word fills one row exactly",
    "input": "{\"sentence\":\"amber birch cedar\",\"k\":5}"
  },
  {
    "label": "One short final word is not penalized",
    "input": "{\"sentence\":\"lantern garden oak\",\"k\":14}"
  }
];
