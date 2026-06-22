$problems = @(
    "AddBinary",
    "CoinChange2",
    "ContinuousSubarraySum",
    "DetectCapital",
    "DistributeCandiesPeople",
    "FibonacciNumber",
    "FindAllAnagrams",
    "FindBottomLeftTreeValue",
    "FindLargestValueEachRow",
    "FreedomTrail",
    "GamePlayAnalysisI",
    "GamePlayAnalysisII",
    "InorderSuccessorBST",
    "KthLargestElement",
    "LongestPalindromicSubsequence",
    "LongestUncommonSubsequenceI",
    "LongestUncommonSubsequenceII",
    "LongestWordDictionary",
    "MinimumPathSum",
    "MostFrequentSubtreeSum",
    "PerfectNumber",
    "AddStrings",
    "PartitionEqualSubset",
    "PacificAtlantic",
    "StrongPasswordChecker",
    "ValidWordSquare",
    "VerbalArithmeticPuzzle",
    "WordSquares",
    "ExpressionTreeFromTokens",
    "SerializeDeserializeNaryTree",
    "FlattenBinaryTreeToLinkedList",
    "MinimumGeneticMutation"
)

$basePath = "C:\Users\BBBS-AI-01\d\cv\visualizer\src\problems"
$results = @{}

foreach ($problem in $problems) {
    $problemPath = Join-Path $basePath $problem
    
    if (Test-Path $problemPath) {
        $visualizerFile = Join-Path $problemPath "Visualizer.tsx"
        $solutionsFile = Join-Path $problemPath "solutions.ts"
        
        if (Test-Path $visualizerFile) {
            $content = Get-Content $visualizerFile -Raw
            $results[$problem] = @{
                file = "Visualizer.tsx"
                path = $visualizerFile
                exists = $true
            }
        } elseif (Test-Path $solutionsFile) {
            $content = Get-Content $solutionsFile -Raw
            $results[$problem] = @{
                file = "solutions.ts"
                path = $solutionsFile
                exists = $true
            }
        } else {
            $results[$problem] = @{
                file = "NOT_FOUND"
                exists = $false
            }
        }
    } else {
        $results[$problem] = @{
            folder = "NOT_FOUND"
            exists = $false
        }
    }
}

$results | ConvertTo-Json -Depth 2
