#!/bin/bash

COUNT=0
SUCCESS=0
SKIP=0
ERROR=0

echo "Filling in PATTERNS and LINE_PATTERN_MAP..."
echo ""

while IFS= read -r filepath; do
  ((COUNT++))
  
  # Extract problem number
  problem=$(echo "$filepath" | grep -oE 'Problem[0-9]+' | grep -oE '[0-9]+')
  
  # Extract phases from the file
  phases=$(grep -oE "phase:\s*['\"]([^'\"]+)['\"]" "$filepath" | cut -d"'" -f2 | cut -d'"' -f2 | sort -u)
  
  if [ -z "$phases" ]; then
    ((ERROR++))
    continue
  fi
  
  # Check if already filled
  if ! grep -q "const PATTERNS = \[\]" "$filepath"; then
    ((SKIP++))
    continue
  fi
  
  # Create patterns array
  patterns_arr=$(echo "$phases" | awk '{print "'\''" $0 "'\''"}'  | tr '\n' ',' | sed 's/,$//')
  
  # Extract line-to-phase mappings
  declare -A line_map
  while IFS= read -r line; do
    line_num=$(echo "$line" | grep -oE 'activeLine:\s*[0-9]+' | grep -oE '[0-9]+')
    # Find the phase for this line
    phase=$(echo "$line" | grep -oE "phase:\s*['\"]([^'\"]+)['\"]" | cut -d"'" -f2 | cut -d'"' -f2)
    if [ -n "$line_num" ] && [ -n "$phase" ] && [ -z "${line_map[$line_num]}" ]; then
      line_map["$line_num"]="$phase"
    fi
  done < <(grep -A5 "activeLine:" "$filepath" | grep -B5 "phase:")
  
  # Generate map string
  map_str=""
  for line_num in $(printf '%s\n' "${!line_map[@]}" | sort -n); do
    if [ -n "$map_str" ]; then
      map_str="$map_str,
  "
    fi
    map_str="$map_str${line_num}: '${line_map[$line_num]}'"
  done
  
  # Update file
  if [ -n "$map_str" ]; then
    sed -i "s|const LINE_PATTERN_MAP = {}|const LINE_PATTERN_MAP = {\n  $map_str\n}|" "$filepath"
  fi
  sed -i "s|const PATTERNS = \[\]|const PATTERNS = [$patterns_arr]|" "$filepath"
  
  ((SUCCESS++))
  
  if [ $((COUNT % 10)) -eq 0 ] || [ "$COUNT" -lt 5 ]; then
    echo "[$COUNT] ✓ Problem $problem: $(echo "$phases" | wc -w) phases"
  fi
done < <(find /c/Users/BBBS-AI-01/d/cv/visualizer/src/problems -name "*Visualizer.jsx" | grep -E "Problem(10[1-9]|1[1-9][0-9]|2[0-9]{2}|300)" | sort -V)

echo ""
echo "============================================================"
echo "Successfully filled: $SUCCESS"
echo "Already filled: $SKIP"
echo "Errors: $ERROR"
echo "Total processed: $COUNT"
echo "============================================================"
