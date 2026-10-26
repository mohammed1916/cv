// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "An inequality conflicts only after a longer equality chain closes",
    "input": "{\"equations\":[\"a!=e\",\"a==b\",\"b==c\",\"c==d\",\"d==e\",\"x==y\"]}"
  },
  {
    "label": "Different equality components can satisfy inequalities",
    "input": "{\"equations\":[\"a==b\",\"c==d\",\"b!=c\",\"x!=a\"]}"
  },
  {
    "label": "A variable cannot differ from itself",
    "input": "{\"equations\":[\"m!=m\"]}"
  },
  {
    "label": "Repeated and reflexive equalities are harmless",
    "input": "{\"equations\":[\"q==q\",\"q==r\",\"r==q\",\"q==r\"]}"
  }
];
