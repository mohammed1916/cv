import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import ServerLedgerView from "./ServerLedgerView";
import { code, python, parseInput, buildTrace } from "./algorithm.js";

const phases = [
  { id: "start", label: "Read", description: "Read every data center." },
  { id: "center", label: "Center", description: "Start a center with the most upgrades." },
  { id: "check", label: "Check", description: "Test one upgrade count against the funds." },
  { id: "found", label: "Affordable", description: "This upgrade count is affordable." },
  { id: "store", label: "Store", description: "Save the answer for this center." },
  { id: "done", label: "Result", description: "Report every center." },
];

const definition = {
  number: "3155",
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: "List of [servers, money, sell, cost] per center",
  url: "https://leetcode.com/problems/maximum-number-of-upgradable-servers/",
  complexity: "O(n) checks per center with n servers, so O(total servers) time and O(1) extra space per center. The visualization accepts up to 6 centers, 20 servers and values up to 200; the bounds shown are this visualization's own limits. A closed-form formula exists but is not traced.",
  examples: [
    { label: "Sell to fund", input: "[[6,4,3,4]]" },
    { label: "Empty purse", input: "[[4,0,2,3]]" },
    { label: "Mixed centers", input: "[[5,10,0,5],[3,0,0,0],[2,1,5,100]]" },
  ],
};

export default function MaximumUpgradableServersVisualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <ServerLedgerView run={run} step={step} />}
      renderReasoning={({ run }) => (
        <p>
          Trying the most upgrades first means the first affordable count is the best one for that center. The results for this input are [{run.result.join(", ")}].
        </p>
      )}
    />
  );
}
