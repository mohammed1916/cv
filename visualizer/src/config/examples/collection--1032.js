// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Overlapping matches appear throughout a longer stream",
    "input": "{\"words\":[\"fir\",\"ir\",\"river\",\"ver\",\"moss\",\"ss\",\"oak\"],\"queries\":\"xfirivermossyoakfir\"}"
  },
  {
    "label": "One-letter matches are immediate",
    "input": "{\"words\":[\"a\",\"z\"],\"queries\":\"abzzca\"}"
  },
  {
    "label": "No stream suffix matches",
    "input": "{\"words\":[\"oak\",\"elm\"],\"queries\":\"ppppqqqrr\"}"
  },
  {
    "label": "Repeated suffix matches overlap",
    "input": "{\"words\":[\"aa\",\"aaa\"],\"queries\":\"aaaaa\"}"
  }
];
