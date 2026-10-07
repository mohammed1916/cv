// Independently authored walkthrough and boundary-case presets.
export default [
  {
    "label": "Several classes finish on opposite sides of the threshold",
    "input": "{\"courses\":[{\"student\":\"Learner1\",\"class\":\"Robotics\"},{\"student\":\"Learner2\",\"class\":\"Robotics\"},{\"student\":\"Learner3\",\"class\":\"Robotics\"},{\"student\":\"Learner4\",\"class\":\"Robotics\"},{\"student\":\"Learner5\",\"class\":\"Robotics\"},{\"student\":\"Learner6\",\"class\":\"Robotics\"},{\"student\":\"Learner7\",\"class\":\"Robotics\"},{\"student\":\"Learner1\",\"class\":\"Poetry\"},{\"student\":\"Learner2\",\"class\":\"Poetry\"},{\"student\":\"Learner3\",\"class\":\"Poetry\"},{\"student\":\"Learner4\",\"class\":\"Poetry\"},{\"student\":\"Learner1\",\"class\":\"Astronomy\"},{\"student\":\"Learner2\",\"class\":\"Astronomy\"},{\"student\":\"Learner3\",\"class\":\"Astronomy\"},{\"student\":\"Learner4\",\"class\":\"Astronomy\"},{\"student\":\"Learner5\",\"class\":\"Astronomy\"},{\"student\":\"Learner1\",\"class\":\"Ceramics\"},{\"student\":\"Learner2\",\"class\":\"Ceramics\"}]}"
  },
  {
    "label": "Exactly five distinct students qualify",
    "input": "{\"courses\":[{\"student\":\"Learner1\",\"class\":\"Ecology\"},{\"student\":\"Learner2\",\"class\":\"Ecology\"},{\"student\":\"Learner3\",\"class\":\"Ecology\"},{\"student\":\"Learner4\",\"class\":\"Ecology\"},{\"student\":\"Learner5\",\"class\":\"Ecology\"}]}"
  },
  {
    "label": "The same students can populate different class groups",
    "input": "{\"courses\":[{\"student\":\"Learner1\",\"class\":\"Music\"},{\"student\":\"Learner2\",\"class\":\"Music\"},{\"student\":\"Learner3\",\"class\":\"Music\"},{\"student\":\"Learner1\",\"class\":\"Drama\"},{\"student\":\"Learner2\",\"class\":\"Drama\"},{\"student\":\"Learner3\",\"class\":\"Drama\"}]}"
  },
  {
    "label": "No enrollment means no qualifying class",
    "input": "{\"courses\":[]}"
  }
];
