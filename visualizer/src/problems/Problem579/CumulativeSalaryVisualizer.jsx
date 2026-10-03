import { useState, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

import CodeTracePanel from "../../components/CodeTracePanel";
import PlaybackControls from "../../components/PlaybackControls";
import CodePatternAnnotations from "../../components/CodePatternAnnotations";
import PatternLegend from "../../components/PatternLegend";
import LuminoDockPanel from "../../components/LuminoDockPanel";
import ManualInputPanel from "../../components/shared/ManualInputPanel";
import FloatingPanel from "../../components/shared/FloatingPanel";

import { usePlaybackState } from "../../hooks/usePlaybackState";
import { useCodeVisualConnectivity } from "../../hooks/useCodeVisualConnectivity";
import { usePatternOverlay } from "../../hooks/usePatternOverlay";

import {
  getExamples as getInitialExamples,
  getExamplesOr,
} from "../../config/examplesRegistry";

import "./CumulativeSalaryVisualizer.css";

const AUTHORED_INITIAL = getInitialExamples("cumulative-salary")[0];

const CUMULATIVE_PATTERNS = ["select", "filter", "window", "cumsum", "sort"];

const LINE_PATTERN_MAP = {
  1: "select",
  2: "cumsum",
  3: "select",
  4: "filter",
  5: "window",
  6: "filter",
  7: "cumsum",
  8: "sort",
};

const SOLUTION_CODE = [
  { line: 1, text: "SELECT e.id, e.month, e.salary," },
  { line: 2, text: "       SUM(e2.salary) as Salary" },
  { line: 3, text: "FROM employee e" },
  { line: 4, text: "JOIN employee e2 ON e.id = e2.id" },
  { line: 5, text: "     AND e2.month <= e.month" },
  { line: 6, text: "     AND YEAR(e2.date) = YEAR(e.date)" },
  { line: 7, text: "GROUP BY e.id, e.month" },
  { line: 8, text: "ORDER BY e.month DESC" },
];

const DEFAULT_EMPLOYEES = [
  { id: 1, month: 1, salary: 5000 },
  { id: 1, month: 2, salary: 5000 },
  { id: 1, month: 3, salary: 5000 },
  { id: 2, month: 1, salary: 3500 },
  { id: 2, month: 2, salary: 3500 },
];

const EXAMPLES = getExamplesOr("cumulative-salary", []);

function calculateCumulativeSalary(employees, current) {
  return employees
    .filter(
      (employee) =>
        employee.id === current.id && employee.month <= current.month,
    )
    .reduce((sum, employee) => sum + employee.salary, 0);
}

function buildResults(employees) {
  return employees.map((employee) => ({
    id: employee.id,
    month: employee.month,
    monthlySalary: employee.salary,
    cumulativeSalary: calculateCumulativeSalary(employees, employee),
  }));
}

function generateSteps(employees) {
  const steps = [];

  if (!employees || employees.length === 0) {
    steps.push({
      phase: "done",
      activeLine: 8,
      relatedLines: [8],
      message: "No employee data provided.",
      results: [],
    });

    return steps;
  }

  const sortedEmployees = [...employees].sort(
    (a, b) => a.id - b.id || a.month - b.month,
  );

  const accumulatedResults = [];

  steps.push({
    phase: "start",
    activeLine: 1,
    relatedLines: [1, 2, 3],
    message:
      "Start with the employee salary rows. We will calculate a running salary total for each employee.",
    results: [],
  });

  for (let i = 0; i < sortedEmployees.length; i += 1) {
    const current = sortedEmployees[i];

    const matchingRows = sortedEmployees.filter(
      (employee) =>
        employee.id === current.id && employee.month <= current.month,
    );

    const cumulativeSum = matchingRows.reduce(
      (sum, employee) => sum + employee.salary,
      0,
    );

    steps.push({
      phase: "filter",
      activeLine: 4,
      relatedLines: [4],
      message: `Match Employee ${current.id} with salary rows belonging to the same employee.`,
      currentRecord: current,
      currentIndex: i,
      matchingRows,
      results: [...accumulatedResults],
    });

    steps.push({
      phase: "window",
      activeLine: 5,
      relatedLines: [5],
      message: `For Employee ${current.id}, keep rows from Month 1 through Month ${current.month}.`,
      currentRecord: current,
      currentIndex: i,
      matchingRows,
      results: [...accumulatedResults],
    });

    steps.push({
      phase: "cumsum",
      activeLine: 2,
      relatedLines: [2, 7],
      message: `Add ${matchingRows
        .map((row) => `$${row.salary}`)
        .join(" + ")} = $${cumulativeSum}.`,
      currentRecord: current,
      currentIndex: i,
      matchingRows,
      cumulativeValue: cumulativeSum,
      results: [...accumulatedResults],
    });

    const result = {
      id: current.id,
      month: current.month,
      monthlySalary: current.salary,
      cumulativeSalary: cumulativeSum,
    };

    accumulatedResults.push(result);

    steps.push({
      phase: "add_result",
      activeLine: 7,
      relatedLines: [1, 2, 7],
      message: `Store Employee ${current.id}, Month ${current.month} with cumulative salary $${cumulativeSum}.`,
      currentRecord: current,
      currentIndex: i,
      matchingRows,
      cumulativeValue: cumulativeSum,
      result,
      results: [...accumulatedResults],
    });
  }

  const finalResults = buildResults(sortedEmployees).sort(
    (a, b) => b.month - a.month || a.id - b.id,
  );

  steps.push({
    phase: "sort",
    activeLine: 8,
    relatedLines: [8],
    message:
      "All cumulative salaries are available. Sort the output by month descending.",
    results: finalResults,
  });

  steps.push({
    phase: "done",
    activeLine: 8,
    relatedLines: [8],
    message:
      "Calculation complete. Every displayed row contains the salary for that month and the running salary through that month.",
    results: finalResults,
  });

  return steps;
}

function EmployeeDataPanel({ employees, applyExample }) {
  const employeeCount = useMemo(
    () => new Set(employees.map((employee) => employee.id)).size,
    [employees],
  );

  const totalSalary = useMemo(
    () => employees.reduce((sum, employee) => sum + employee.salary, 0),
    [employees],
  );

  return (
    <div className="cumulative-salary-panel">
      <div className="cumulative-salary-panel-body">
        <div className="cumulative-salary-example-row">
          {EXAMPLES.map((example, index) => (
            <button
              key={example.label ?? `example-${index}`}
              type="button"
              onClick={() => applyExample(example)}
              className="cumulative-salary-example-btn"
            >
              {example.label ?? `Example ${index + 1}`}
            </button>
          ))}
        </div>

        <div className="cumulative-salary-summary">
          <div className="cumulative-salary-summary-item">
            <div className="cumulative-salary-summary-label">Employees</div>

            <div className="cumulative-salary-summary-value">
              {employeeCount}
            </div>
          </div>

          <div className="cumulative-salary-summary-item">
            <div className="cumulative-salary-summary-label">Records</div>

            <div className="cumulative-salary-summary-value">
              {employees.length}
            </div>
          </div>

          <div className="cumulative-salary-summary-item">
            <div className="cumulative-salary-summary-label">Total Salary</div>

            <div className="cumulative-salary-summary-value">
              ${totalSalary}
            </div>
          </div>
        </div>

        <div className="cumulative-salary-table-container">
          <div className="cumulative-salary-source-header">
            <div>Emp ID</div>
            <div>Month</div>
            <div>Salary</div>
          </div>

          <div className="cumulative-salary-table-body">
            {employees.map((employee, index) => (
              <motion.div
                key={`${employee.id}-${employee.month}-${index}`}
                className="cumulative-salary-source-row"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div>{employee.id}</div>
                <div>{employee.month}</div>
                <div>${employee.salary}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ResultsPanel({ step, resultsData, maxCumulativeSalary }) {
  const matchingRows = step?.matchingRows ?? [];

  return (
    <div className="cumulative-salary-panel">
      <div className="cumulative-salary-panel-body">
        <div
          className={`cumulative-salary-status ${
            step?.phase === "done"
              ? "complete"
              : step?.phase === "start"
                ? "processing"
                : ""
          }`}
        >
          {step?.message ?? "Press Play or Step to begin."}
        </div>

        {step?.currentRecord && (
          <div className="cumulative-salary-current">
            <div className="cumulative-salary-current-title">Current row</div>

            <div className="cumulative-salary-current-grid">
              <div>
                <span>Employee</span>
                <strong>{step.currentRecord.id}</strong>
              </div>

              <div>
                <span>Month</span>
                <strong>{step.currentRecord.month}</strong>
              </div>

              <div>
                <span>Salary</span>
                <strong>${step.currentRecord.salary}</strong>
              </div>

              {step.cumulativeValue != null && (
                <div>
                  <span>Running total</span>
                  <strong>${step.cumulativeValue}</strong>
                </div>
              )}
            </div>
          </div>
        )}

        {matchingRows.length > 0 && (
          <div className="cumulative-salary-window">
            <div className="cumulative-salary-window-title">
              Rows included in current sum
            </div>

            <div className="cumulative-salary-window-items">
              {matchingRows.map((row, index) => (
                <div
                  key={`${row.id}-${row.month}-${index}`}
                  className="cumulative-salary-window-item"
                >
                  <span>M{row.month}</span>
                  <strong>${row.salary}</strong>
                </div>
              ))}

              {step.cumulativeValue != null && (
                <>
                  <span className="cumulative-salary-window-equals">=</span>

                  <strong className="cumulative-salary-window-total">
                    ${step.cumulativeValue}
                  </strong>
                </>
              )}
            </div>
          </div>
        )}

        <div className="cumulative-salary-table-container">
          <div className="cumulative-salary-table-header">
            <div className="cumulative-salary-header-cell">Emp ID</div>

            <div className="cumulative-salary-header-cell">Month</div>

            <div className="cumulative-salary-header-cell">Monthly</div>

            <div className="cumulative-salary-header-cell">Cumulative</div>

            <div className="cumulative-salary-header-cell">Pct Max</div>
          </div>

          <div className="cumulative-salary-table-body">
            <AnimatePresence initial={false}>
              {resultsData.length > 0 ? (
                resultsData.map((record) => {
                  const pctOfMax =
                    maxCumulativeSalary > 0
                      ? (
                          (record.cumulativeSalary / maxCumulativeSalary) *
                          100
                        ).toFixed(1)
                      : "0.0";

                  const isCurrent =
                    step?.currentRecord?.id === record.id &&
                    step?.currentRecord?.month === record.month;

                  return (
                    <motion.div
                      key={`${record.id}-${record.month}`}
                      layout
                      initial={{
                        opacity: 0,
                        y: -8,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      exit={{
                        opacity: 0,
                        y: 8,
                      }}
                      className={`cumulative-salary-row ${
                        isCurrent ? "active" : ""
                      }`}
                    >
                      <div className="cumulative-salary-cell employee-id">
                        {record.id}
                      </div>

                      <div className="cumulative-salary-cell">
                        {record.month}
                      </div>

                      <div className="cumulative-salary-cell">
                        ${record.monthlySalary}
                      </div>

                      <div className="cumulative-salary-cell cumulative">
                        ${record.cumulativeSalary}
                      </div>

                      <div className="cumulative-salary-cell">{pctOfMax}%</div>
                    </motion.div>
                  );
                })
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="cumulative-salary-empty"
                >
                  No results yet. Press Play to begin.
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {resultsData.length > 0 && (
          <div className="cumulative-salary-summary">
            <div className="cumulative-salary-summary-item">
              <div className="cumulative-salary-summary-label">Result rows</div>

              <div className="cumulative-salary-summary-value">
                {resultsData.length}
              </div>
            </div>

            <div className="cumulative-salary-summary-item">
              <div className="cumulative-salary-summary-label">
                Max cumulative
              </div>

              <div className="cumulative-salary-summary-value">
                ${maxCumulativeSalary}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CumulativeSalaryVisualizer() {
  const initialEmployees = AUTHORED_INITIAL?.employees ?? DEFAULT_EMPLOYEES;

  const [employeesInput, setEmployeesInput] = useState(
    JSON.stringify(initialEmployees),
  );

  const parsedInput = useMemo(() => {
    try {
      const data = JSON.parse(employeesInput);

      if (!Array.isArray(data)) {
        throw new Error("Must be an array of employees");
      }

      if (data.length === 0) {
        throw new Error("Array cannot be empty");
      }

      for (const employee of data) {
        if (
          typeof employee.id !== "number" ||
          typeof employee.month !== "number" ||
          typeof employee.salary !== "number"
        ) {
          throw new Error(
            "Each employee must have id, month, and salary as numbers",
          );
        }

        if (
          !Number.isFinite(employee.id) ||
          !Number.isFinite(employee.month) ||
          !Number.isFinite(employee.salary)
        ) {
          throw new Error(
            "Employee id, month, and salary must be finite numbers",
          );
        }

        if (
          !Number.isInteger(employee.month) ||
          employee.month < 1 ||
          employee.month > 12
        ) {
          throw new Error("Employee month must be an integer from 1 to 12");
        }
      }

      return {
        employees: data,
        inputError: "",
      };
    } catch (error) {
      return {
        employees: DEFAULT_EMPLOYEES,
        inputError:
          error instanceof Error ? error.message : "Invalid input format",
      };
    }
  }, [employeesInput]);

  const { employees, inputError } = parsedInput;

  const steps = useMemo(() => generateSteps(employees), [employees]);

  const {
    stepIndex,
    setStepIndex,
    stepForward,
    stepBack,
    togglePlay,
    handleReset,
    isPlaying,
    speed,
    setSpeed,
    isDone,
  } = usePlaybackState(steps.length);

  const step = stepIndex >= 0 ? steps[stepIndex] : null;

  const applyExample = useCallback(
    (example) => {
      if (!example?.employees) return;

      setEmployeesInput(JSON.stringify(example.employees));

      handleReset();
    },
    [handleReset],
  );

  const connectivity = useCodeVisualConnectivity({
    steps,
    stepIndex,
    onStepJump: setStepIndex,
  });

  const { showPatternOverlay, setShowPatternOverlay, setActiveLineDom } =
    usePatternOverlay();

  const resultsData = useMemo(() => step?.results ?? [], [step]);

  const maxCumulativeSalary = useMemo(() => {
    if (resultsData.length === 0) {
      return 0;
    }

    return Math.max(...resultsData.map((record) => record.cumulativeSalary));
  }, [resultsData]);

  const panelConfigs = useMemo(
    () => [
      {
        id: "employees",
        title: "Employee Salary Data",
      },
      {
        id: "results",
        title: "Cumulative Salary Results",
        dockMode: "split-bottom",
        ratio: 0.5,
      },
      {
        id: "code",
        title: "SQL Code Trace",
        ratio: 0.5,
      },
    ],
    [],
  );

  const [panelDivs, setPanelDivs] = useState(null);

  const handlePanelReady = useCallback((divs) => {
    setPanelDivs(divs);
  }, []);

  const employeePanel = (
    <EmployeeDataPanel employees={employees} applyExample={applyExample} />
  );

  const resultsPanel = (
    <ResultsPanel
      step={step}
      resultsData={resultsData}
      maxCumulativeSalary={maxCumulativeSalary}
    />
  );

  const codePanel = (
    <div className="cumulative-salary-code-panel">
      <CodeTracePanel
        step={step}
        codeLines={SOLUTION_CODE}
        highlightedLines={connectivity.highlightedLines}
        onLineSelect={connectivity.handleLineSelect}
        onActiveLineDomChange={setActiveLineDom}
      >
        {showPatternOverlay && (
          <CodePatternAnnotations
            codeLines={SOLUTION_CODE}
            patterns={CUMULATIVE_PATTERNS}
            linePatternMap={LINE_PATTERN_MAP}
            onLineRef={setActiveLineDom}
          />
        )}
      </CodeTracePanel>
    </div>
  );

  return (
    <div className="cumulative-salary-shell">
      <ManualInputPanel
        fields={[
          {
            key: "employees",
            label: "employees",
            type: "array",
          },
        ]}
        values={{
          employees: employeesInput,
        }}
        onChange={(key, value) => {
          if (key === "employees") {
            setEmployeesInput(value);
          }

          handleReset();
        }}
        examples={EXAMPLES}
        applyExample={applyExample}
        inputError={inputError}
      />

      <div className="cumulative-salary-workspace">
        <LuminoDockPanel
          panels={panelConfigs}
          onPanelReady={handlePanelReady}
        />

        {panelDivs && (
          <>
            {panelDivs.employees &&
              createPortal(employeePanel, panelDivs.employees)}

            {panelDivs.results && createPortal(resultsPanel, panelDivs.results)}

            {panelDivs.code && createPortal(codePanel, panelDivs.code)}
          </>
        )}
      </div>

      {createPortal(
        <FloatingPanel title="Playback Controls">
          <PlaybackControls
            isPlaying={isPlaying}
            isDone={isDone}
            speed={speed}
            onPlayToggle={togglePlay}
            onPrev={stepBack}
            onNext={stepForward}
            onReset={handleReset}
            prevDisabled={stepIndex < 0}
            nextDisabled={isDone}
            resetDisabled={stepIndex < 0}
            onSpeedChange={(event) => setSpeed(Number(event.target.value))}
            showPatternOverlay={showPatternOverlay}
            onShowPatternOverlayChange={setShowPatternOverlay}
            patternOverlayLabel="Show pattern overlay"
            showPatternOverlayToggle
          />

          {showPatternOverlay && (
            <PatternLegend
              currentPhase={step?.phase}
              usedPatterns={CUMULATIVE_PATTERNS}
            />
          )}
        </FloatingPanel>,
        document.body,
      )}
    </div>
  );
}
