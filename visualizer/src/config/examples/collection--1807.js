// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Repeated and unknown keys inside a longer sentence",
    "input": "{\"s\":\"welcome(name)to(place)with(name)and(guest)\",\"knowledge\":[[\"name\",\"mira\"],[\"place\",\"grove\"]]}"
  },
  {
    "label": "All keys unknown",
    "input": "{\"s\":\"(oak)(pine)\",\"knowledge\":[]}"
  },
  {
    "label": "Plain text has no substitutions",
    "input": "{\"s\":\"forestpath\",\"knowledge\":[[\"forest\",\"wood\"]]}"
  },
  {
    "label": "Adjacent known keys",
    "input": "{\"s\":\"(a)(b)(a)\",\"knowledge\":[[\"a\",\"red\"],[\"b\",\"bird\"]]}"
  }
];
