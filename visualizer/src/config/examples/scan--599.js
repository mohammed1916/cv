// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Common choices at different ranks",
    "input": "{\"list1\":[\"Juniper\",\"Marigold\",\"Cedar\",\"Iris\",\"Willow\",\"Maple\"],\"list2\":[\"Fern\",\"Cedar\",\"Juniper\",\"Maple\",\"Iris\",\"Birch\"]}"
  },
  {
    "label": "Tie in combined rank",
    "input": "{\"list1\":[\"Orchid\",\"Dahlia\"],\"list2\":[\"Dahlia\",\"Orchid\"]}"
  },
  {
    "label": "Only last choice matches",
    "input": "{\"list1\":[\"Aspen\",\"Elm\",\"Pine\"],\"list2\":[\"Fir\",\"Palm\",\"Pine\"]}"
  },
  {
    "label": "Identical first choices",
    "input": "{\"list1\":[\"Sage\",\"Mint\"],\"list2\":[\"Sage\",\"Thyme\"]}"
  },
  {
    "label": "Single shared restaurant",
    "input": "{\"list1\":[\"Anchor\"],\"list2\":[\"Anchor\"]}"
  },
  {
    "label": "Equal index sums keep every match",
    "input": "{\"list1\":[\"Oak\",\"Pine\",\"Yew\"],\"list2\":[\"Yew\",\"Pine\",\"Oak\"]}"
  },
  {
    "label": "Names that differ only in case do not match",
    "input": "{\"list1\":[\"cafe\",\"Cafe\"],\"list2\":[\"Cafe\"]}"
  },
  {
    "label": "Long run: 60 names per list",
    "input": "{\"list1\":[\"cor0\",\"cor1\",\"elm2\",\"dun3\",\"dun4\",\"fen5\",\"dun6\",\"bay7\",\"cor8\",\"ash9\",\"glo10\",\"hal11\",\"ash12\",\"elm13\",\"glo14\",\"elm15\",\"fen16\",\"bay17\",\"bay18\",\"elm19\",\"ash20\",\"hal21\",\"fen22\",\"cor23\",\"cor24\",\"glo25\",\"glo26\",\"fen27\",\"dun28\",\"elm29\",\"fen30\",\"glo31\",\"fen32\",\"fen33\",\"hal34\",\"hal35\",\"cor36\",\"elm37\",\"hal38\",\"hal39\",\"dun40\",\"fen41\",\"cor42\",\"fen43\",\"glo44\",\"bay45\",\"fen46\",\"glo47\",\"cor48\",\"ash49\",\"bay50\",\"bay51\",\"elm52\",\"glo53\",\"cor54\",\"glo55\",\"fen56\",\"glo57\",\"ash58\",\"glo59\"],\"list2\":[\"ash59\",\"dun58\",\"elm57\",\"bay56\",\"elm55\",\"glo54\",\"bay53\",\"dun52\",\"hal51\",\"dun50\",\"hal49\",\"ash48\",\"dun47\",\"cor46\",\"cor45\",\"ash44\",\"glo43\",\"cor42\",\"hal41\",\"hal40\",\"cor39\",\"elm38\",\"cor37\",\"elm36\",\"fen35\",\"dun34\",\"elm33\",\"bay32\",\"elm31\",\"hal30\",\"bay29\",\"bay28\",\"fen27\",\"ash26\",\"bay25\",\"hal24\",\"dun23\",\"fen22\",\"glo21\",\"hal20\",\"glo19\",\"hal18\",\"ash17\",\"fen16\",\"fen15\",\"ash14\",\"fen13\",\"cor12\",\"bay11\",\"hal10\",\"bay9\",\"cor8\",\"dun7\",\"dun6\",\"dun5\",\"fen4\",\"fen3\",\"fen2\",\"cor1\",\"ash0\"]}"
  }
];
