// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Three products with nested alternatives",
    "expression": "{m,n{o,p}}{q,{r,s}}{t,u}"
  },
  {
    "label": "Duplicates merge across unions",
    "expression": "{{ma,mb},{mb,mc},m{a,c}}"
  },
  {
    "label": "Nested unions",
    "expression": "{p,{q,{r,{s,t}}}}"
  },
  {
    "label": "Literal prefix and suffix",
    "expression": "pre{a,b{c,d}}post"
  },
  {
    "label": "Single literal",
    "expression": "maple"
  },
  {
    "label": "Single alternative",
    "expression": "{oak}"
  }
];
