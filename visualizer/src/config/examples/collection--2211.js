// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Escaping edge groups surround several trapped moving cars",
    "input": "{\"directions\":\"LLRRSRLLSRRLLRR\"}"
  },
  {
    "label": "All cars moving outward escape",
    "input": "{\"directions\":\"LLLLRRRR\"}"
  },
  {
    "label": "Stationary cars contribute no moving-car collisions",
    "input": "{\"directions\":\"SSSSS\"}"
  },
  {
    "label": "Cars on both sides eventually meet a stationary barrier",
    "input": "{\"directions\":\"RRRSLLL\"}"
  }
];
