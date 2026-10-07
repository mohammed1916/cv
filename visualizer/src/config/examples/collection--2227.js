// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Colliding character codes create multiple dictionary decryptions",
    "input": "{\"keys\":[\"a\",\"b\",\"c\",\"d\"],\"values\":[\"pq\",\"rs\",\"pq\",\"tu\"],\"dictionary\":[\"ab\",\"cb\",\"ad\",\"cd\",\"da\",\"dc\",\"abc\",\"cba\"],\"operations\":[[\"encrypt\",\"abcd\"],[\"decrypt\",\"pqrs\"],[\"decrypt\",\"tupq\"],[\"encrypt\",\"cba\"],[\"decrypt\",\"pqrspq\"],[\"decrypt\",\"zzzz\"]]}"
  },
  {
    "label": "An unmapped character cannot be encrypted",
    "input": "{\"keys\":[\"m\",\"n\"],\"values\":[\"ab\",\"cd\"],\"dictionary\":[\"mn\",\"nm\",\"mx\"],\"operations\":[[\"encrypt\",\"mx\"],[\"decrypt\",\"abcd\"],[\"encrypt\",\"nm\"]]}"
  },
  {
    "label": "Unique codes distinguish reversed words",
    "input": "{\"keys\":[\"x\",\"y\"],\"values\":[\"lm\",\"no\"],\"dictionary\":[\"xy\",\"yx\",\"xx\"],\"operations\":[[\"decrypt\",\"lmno\"],[\"decrypt\",\"nolm\"],[\"decrypt\",\"lmlm\"]]}"
  },
  {
    "label": "A ciphertext absent from the dictionary has zero candidates",
    "input": "{\"keys\":[\"a\"],\"values\":[\"zz\"],\"dictionary\":[\"a\",\"aa\"],\"operations\":[[\"decrypt\",\"zzzzzz\"],[\"encrypt\",\"aa\"],[\"decrypt\",\"zzzz\"]]}"
  }
];
