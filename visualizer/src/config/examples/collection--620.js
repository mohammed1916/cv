// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Filtering and rating order make independent decisions",
    "input": "{\"cinema\":[{\"id\":11,\"movie\":\"Paper Skies\",\"description\":\"thoughtful\",\"rating\":7.6},{\"id\":12,\"movie\":\"Iron Harbor\",\"description\":\"exciting\",\"rating\":9.8},{\"id\":13,\"movie\":\"Quiet Clock\",\"description\":\"boring\",\"rating\":8.8},{\"id\":15,\"movie\":\"Amber Trail\",\"description\":\"adventure\",\"rating\":9.2},{\"id\":17,\"movie\":\"Blue Orchard\",\"description\":\"gentle\",\"rating\":8.4}]}"
  },
  {
    "label": "A high rating cannot rescue an even ID",
    "input": "{\"cinema\":[{\"id\":22,\"movie\":\"Bright Tide\",\"description\":\"thrilling\",\"rating\":10}]}"
  },
  {
    "label": "Every odd boring movie is excluded",
    "input": "{\"cinema\":[{\"id\":1,\"movie\":\"Still Room\",\"description\":\"boring\",\"rating\":6},{\"id\":3,\"movie\":\"Long Pause\",\"description\":\"boring\",\"rating\":7}]}"
  },
  {
    "label": "No movies yields no output",
    "input": "{\"cinema\":[]}"
  }
];
