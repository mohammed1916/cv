// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Words conflict with different previously chosen letters",
    "input": "{\"arr\":[\"ced\",\"ar\",\"moss\",\"fin\",\"oak\",\"up\",\"by\"]}"
  },
  {
    "label": "Internal duplicate invalidates one word",
    "input": "{\"arr\":[\"letter\",\"ab\",\"cd\"]}"
  },
  {
    "label": "All words are mutually disjoint",
    "input": "{\"arr\":[\"ab\",\"cd\",\"ef\",\"gh\"]}"
  },
  {
    "label": "Every choice shares one character",
    "input": "{\"arr\":[\"ax\",\"ay\",\"az\"]}"
  }
];
