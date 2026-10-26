// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "A longer clock difference uses several allowed increments",
    "input": "{\"current\":\"08:17\",\"correct\":\"13:59\"}"
  },
  {
    "label": "Equal times need no operation",
    "input": "{\"current\":\"16:42\",\"correct\":\"16:42\"}"
  },
  {
    "label": "A difference below five uses one-minute steps",
    "input": "{\"current\":\"09:10\",\"correct\":\"09:14\"}"
  },
  {
    "label": "A nearly full day still uses the same four denominations",
    "input": "{\"current\":\"00:03\",\"correct\":\"23:58\"}"
  }
];
