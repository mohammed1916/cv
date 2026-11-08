// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Punctuation and case",
    "s": "Was it a car or a cat I saw?",
    "input": "Was it a car or a cat I saw?"
  },
  {
    "label": "Mismatch inside",
    "s": "A quiet garden, not a palindrome.",
    "input": "A quiet garden, not a palindrome."
  },
  {
    "label": "Only punctuation",
    "s": "... ! ?",
    "input": "... ! ?"
  },
  {
    "label": "Mixed alphanumeric",
    "s": "7Rotor7",
    "input": "7Rotor7"
  },
  {
    "label": "Single letter",
    "s": "Q",
    "input": "Q"
  },
  {
    "label": "Equal characters",
    "s": "aaaa",
    "input": "{\"s\":\"aaaa\"}"
  },
  {
    "label": "Boundary length with punctuation",
    "s": "Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,",
    "input": "{\"s\":\"Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,Ab,\"}"
  },
  {
    "label": "Long run: 60 letters",
    "s": "zpsjfyrdahekfybmreelrgmavmqzizyxjzdrxosivghvyeoypfnfqjeyjfft",
    "input": "{\"s\":\"zpsjfyrdahekfybmreelrgmavmqzizyxjzdrxosivghvyeoypfnfqjeyjfft\"}"
  }
];
