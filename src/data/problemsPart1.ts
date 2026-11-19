import type { Problem } from '../types.ts';

export const PROBLEMS_PART_1: Problem[] = [
  {
    id: 1,
    slug: 'collatz-steps',
    title: 'Collatz Steps',
    difficulty: 'Easy',
    pdfDifficultyLabel: 'Easy',
    topic: 'Control Flow',
    points: 100,
    hiddenTestCount: 6,
    acceptanceRate: 88,
    description: [
      'Start with a positive integer n. Repeat the following rule until n becomes 1: if n is even, replace it with n / 2; if n is odd, replace it with 3n + 1.',
      'Count how many times the rule was applied.'
    ],
    workedExample:
      'For n = 6 the numbers are 6 -> 3 -> 10 -> 5 -> 16 -> 8 -> 4 -> 2 -> 1. The rule was applied 8 times, so the answer is 8.',
    inputFormat: 'A single line containing the integer n.',
    outputFormat: 'Print the number of times the rule was applied. If n = 1, print 0.',
    constraints: '1 <= n <= 10^6. For every such n, the process reaches 1.',
    hints: [
      'Initialize a step counter to 0 and loop while n != 1.',
      'Use integer division n // 2 (not floating-point /) to keep n an exact integer.'
    ],
    starterCode: `n = int(input())

# Write your program here.
# Store your final answer in the variable answer.
answer = 0

print(answer)`,
    samples: [
      { id: '1-s1', label: 'Sample 1', input: '6', expectedOutput: '8' },
      { id: '1-s2', label: 'Sample 2', input: '1', expectedOutput: '0' },
      { id: '1-s3', label: 'Sample 3', input: '27', expectedOutput: '111' }
    ],
    solution: {
      intuition:
        'Simulate the Collatz recurrence directly using a while loop that stops as soon as n reaches 1, incrementing a step counter on every transition.',
      steps: [
        {
          title: 'Initialize step counter',
          detail: 'Set answer = 0. If n is already 1, the loop condition (n != 1) is immediately false and we print 0.'
        },
        {
          title: 'Apply parity transition inside the loop',
          detail: 'While n != 1, check if n % 2 == 0. If even, update n = n // 2; otherwise update n = 3 * n + 1.'
        },
        {
          title: 'Increment and finish',
          detail: 'Increment answer += 1 after each transformation. Because every n <= 10^6 reaches 1 within at most 524 steps, the loop terminates quickly.'
        }
      ],
      timeComplexity: 'O(S(n)), at most 524 iterations for n <= 10^6',
      spaceComplexity: 'O(1)',
      pitfalls: [
        'Using n / 2 instead of n // 2 creates floats that lose precision for large intermediate values.',
        'Forgetting the n = 1 edge case where 0 steps should be printed.'
      ],
      code: `n = int(input())

answer = 0
while n != 1:
    if n % 2 == 0:
        n //= 2
    else:
        n = 3 * n + 1
    answer += 1

print(answer)`
    }
  },
  {
    id: 2,
    slug: 'sum-of-valid-numbers',
    title: 'Sum of the Valid Numbers',
    difficulty: 'Easy',
    pdfDifficultyLabel: 'Easy',
    topic: 'Exceptions',
    points: 100,
    hiddenTestCount: 6,
    acceptanceRate: 84,
    description: [
      'A line contains several tokens separated by single spaces. A token is a valid integer if Python\'s int(token) accepts it, such as 12, -3 or +5. Any other token is invalid, such as abc, 3.5 or 4-2.',
      'Add up all the valid integers and count the invalid tokens. Use try and except to handle the invalid tokens.'
    ],
    workedExample:
      'For "10 abc 5 3.5 -2 x1", the valid integers are 10, 5 and -2, with sum 13. The tokens abc, 3.5 and x1 are invalid, so there are 3 invalid tokens. The answer is 13 3.',
    inputFormat: 'A single line containing the tokens, separated by single spaces.',
    outputFormat:
      'Print two integers on one line, separated by a space: the sum of the valid integers, and the number of invalid tokens.',
    constraints:
      'There are between 1 and 100 tokens. Each token has at most 10 characters, and uses only lowercase letters, digits, +, - and .',
    hints: [
      'Iterate over each token in tokens and wrap int(token) inside a try block.',
      'Catch ValueError in the except block and increment bad.'
    ],
    starterCode: `tokens = input().split()

# Write your program here.
# Store the sum in the variable total.
# Store the number of invalid tokens in the variable bad.
total = 0
bad = 0

print(total, bad)`,
    samples: [
      { id: '2-s1', label: 'Sample 1', input: '10 abc 5 3.5 -2 x1', expectedOutput: '13 3' },
      { id: '2-s2', label: 'Sample 2', input: '- -- 4-2 +5', expectedOutput: '5 3' },
      { id: '2-s3', label: 'Sample 3', input: 'hello world', expectedOutput: '0 2' }
    ],
    solution: {
      intuition:
        'Python\'s built-in int() already implements exact integer parsing rules (including leading + and - signs) and raises ValueError on anything invalid. Exception handling lets us delegate validation cleanly.',
      steps: [
        {
          title: 'Initialize accumulators',
          detail: 'Start with total = 0 for the running sum and bad = 0 for the count of invalid tokens.'
        },
        {
          title: 'Attempt integer conversion per token',
          detail: 'For each token in tokens, execute val = int(token) inside a try block and add val to total.'
        },
        {
          title: 'Handle ValueError',
          detail: 'If int(token) fails (for strings like "3.5", "--", "4-2", or "abc"), the except ValueError branch runs and increments bad by 1.'
        }
      ],
      timeComplexity: 'O(T * L) where T is number of tokens and L is max token length',
      spaceComplexity: 'O(T) for the split token list',
      pitfalls: [
        'Using token.isdigit() fails on negative numbers like "-2" and signed numbers like "+5".',
        'Forgetting to initialize total = 0 when all tokens are invalid.'
      ],
      code: `tokens = input().split()

total = 0
bad = 0

for token in tokens:
    try:
        total += int(token)
    except ValueError:
        bad += 1

print(total, bad)`
    }
  },
  {
    id: 3,
    slug: 'recursive-palindrome',
    title: 'Recursive Palindrome',
    difficulty: 'Easy',
    pdfDifficultyLabel: 'Easy',
    topic: 'Recursion',
    points: 100,
    hiddenTestCount: 6,
    acceptanceRate: 86,
    description: [
      'A string is a palindrome if it reads the same from left to right and from right to left.',
      'Complete the recursive function is_pal(s) so that it returns True if s is a palindrome and False otherwise. The function must call itself on a shorter string; it must not use a loop.'
    ],
    workedExample:
      'For "level", the first and last letters are both l. The letters in the middle, "eve", form a palindrome too, so the answer is True. For "abca", the first letter is a and the last letter is also a, but the middle part "bc" is not a palindrome, so the answer is False.',
    inputFormat: 'A single line containing the string s.',
    outputFormat: 'Print True if s is a palindrome. Otherwise, print False.',
    constraints: '1 <= |s| <= 500. The string contains only lowercase English letters.',
    hints: [
      'Base case: any string of length 0 or 1 is always a palindrome.',
      'Recursive step: compare s[0] and s[-1]; if they match, recurse on s[1:-1].'
    ],
    starterCode: `def is_pal(s):
    # Write your recursive code here.
    # To run the program while it is incomplete, add a return statement.
    return False

s = input()
answer = is_pal(s)

print(answer)`,
    samples: [
      { id: '3-s1', label: 'Sample 1', input: 'racecar', expectedOutput: 'True' },
      { id: '3-s2', label: 'Sample 2', input: 'ab', expectedOutput: 'False' },
      { id: '3-s3', label: 'Sample 3', input: 'a', expectedOutput: 'True' }
    ],
    solution: {
      intuition:
        'A string is a palindrome if and only if its outer characters match and the inner substring obtained by peeling off both ends is itself a palindrome.',
      steps: [
        {
          title: 'Define the base case',
          detail: 'If len(s) <= 1, return True immediately. Both empty strings (from even-length palindromes) and single characters are palindromes.'
        },
        {
          title: 'Check boundary mismatch',
          detail: 'If s[0] != s[-1], we know immediately that s cannot be a palindrome, so return False.'
        },
        {
          title: 'Recurse on the inner substring',
          detail: 'Otherwise return is_pal(s[1:-1]). Each call reduces length by 2, so depth is at most 250 for |s| <= 500 (well within Python\'s recursion limit of 1000).'
        }
      ],
      timeComplexity: 'O(n^2) due to string slicing s[1:-1] at each recursive call (fast for n <= 500)',
      spaceComplexity: 'O(n^2) total slice storage across O(n) call frames',
      pitfalls: [
        'Forgetting len(s) == 0 in the base case causes an IndexError on even-length palindromes like "abba".',
        'Forgetting the return keyword before the recursive call returns None instead of a boolean.'
      ],
      code: `def is_pal(s):
    if len(s) <= 1:
        return True
    if s[0] != s[-1]:
        return False
    return is_pal(s[1:-1])

s = input()
answer = is_pal(s)

print(answer)`
    }
  },
  {
    id: 4,
    slug: 'versions-of-a-list',
    title: 'Versions of a List',
    difficulty: 'Medium',
    pdfDifficultyLabel: 'Medium',
    topic: 'Lists & Memory',
    points: 200,
    hiddenTestCount: 5,
    acceptanceRate: 74,
    description: [
      'A list of n integers is changed m times. Each change has the form "i v": set the item at position i (counting from 0) to the value v. After every change, the list is a new version. Version 0 is the original list.',
      'Record every version, so that all m + 1 versions can be printed at the end.'
    ],
    workedExample:
      'Start with the list 1 2 3 and the changes "0 9" and "2 7". Version 0 is 1 2 3. After the first change, version 1 is 9 2 3. After the second change, version 2 is 9 2 7. So the three lines 1 2 3, 9 2 3 and 9 2 7 are printed.',
    inputFormat:
      'The first line contains n. The second line contains n integers. The third line contains m. Each of the next m lines contains two integers i and v.',
    outputFormat:
      'Print m + 1 lines. Line j (counting from 0) contains the items of version j, separated by spaces.',
    constraints: '1 <= n <= 20. 0 <= m <= 20. 0 <= i < n. All values are between -100 and 100.',
    hints: [
      'In Python, appending nums directly to answer only stores a reference (alias) to the same mutable list!',
      'Store a snapshot using nums.copy() or nums[:] before and after each modification.'
    ],
    starterCode: `n = int(input())
nums = list(map(int, input().split()))
m = int(input())
changes = []
for _ in range(m):
    i, v = map(int, input().split())
    changes.append((i, v))

# Write your program here.
# Store the m + 1 versions, in order, in the list answer.
# Each version is a list of integers.
answer = []

for version in answer:
    print(*version) # prints list entries without brackets`,
    samples: [
      {
        id: '4-s1',
        label: 'Sample 1',
        input: '3\n1 2 3\n2\n0 9\n2 7',
        expectedOutput: '1 2 3\n9 2 3\n9 2 7'
      },
      {
        id: '4-s2',
        label: 'Sample 2',
        input: '2\n5 5\n3\n1 6\n0 6\n1 5',
        expectedOutput: '5 5\n5 6\n6 6\n6 5'
      }
    ],
    solution: {
      intuition:
        'Lists in Python are mutable objects passed by reference. If we append nums itself to answer and later mutate nums[i] = v, every earlier entry in answer changes too. We must snapshot a shallow copy of nums for every version.',
      steps: [
        {
          title: 'Record Version 0 as an independent copy',
          detail: 'Initialize answer = [nums.copy()] so the original list state is frozen before any mutations occur.'
        },
        {
          title: 'Apply each update and snapshot',
          detail: 'Loop through (i, v) in changes, set nums[i] = v, and append nums.copy() to answer.'
        },
        {
          title: 'Handle m = 0 gracefully',
          detail: 'When m == 0, the loop runs zero times and answer contains just Version 0, satisfying m + 1 = 1 version.'
        }
      ],
      timeComplexity: 'O((m + 1) * n)',
      spaceComplexity: 'O((m + 1) * n)',
      pitfalls: [
        'Writing answer.append(nums) causes list aliasing: all m + 1 lines will print the final version!',
        'Forgetting to store Version 0 before processing changes.'
      ],
      code: `n = int(input())
nums = list(map(int, input().split()))
m = int(input())
changes = []
for _ in range(m):
    i, v = map(int, input().split())
    changes.append((i, v))

answer = [nums.copy()]
for i, v in changes:
    nums[i] = v
    answer.append(nums.copy())

for version in answer:
    print(*version)`
    }
  },
  {
    id: 5,
    slug: 'count-in-a-sorted-list',
    title: 'Count in a Sorted List',
    difficulty: 'Medium',
    pdfDifficultyLabel: 'Medium',
    topic: 'Binary Search',
    points: 200,
    hiddenTestCount: 6,
    acceptanceRate: 68,
    description: [
      'A list of n integers is sorted in non-decreasing order, and some values may repeat. For each of q queries x, find how many times x appears in the list.',
      'The list and the number of queries can both be large, so scanning the whole list for every query is too slow. Use binary search to find where the value x starts and where it ends.'
    ],
    workedExample:
      'In the list 1 2 2 2 5 9, the value 2 appears 3 times, the value 9 appears once, and the value 3 does not appear. So the queries 2 3 9 give the answers 3, 0 and 1.',
    inputFormat:
      'The first line contains n. The second line contains the n sorted integers. The third line contains q. The fourth line contains the q query values.',
    outputFormat: 'Print q lines. Line j contains the number of times the j-th query value appears in the list.',
    constraints: '1 <= n, q <= 10^5. All values are between -10^9 and 10^9.',
    hints: [
      'Write two binary searches: lower_bound(a, x) returning the first index with a[idx] >= x, and upper_bound(a, x) returning the first index with a[idx] > x.',
      'The frequency of x is simply upper_bound(a, x) - lower_bound(a, x).'
    ],
    starterCode: `n = int(input())
a = list(map(int, input().split()))
q = int(input())
queries = list(map(int, input().split()))

# Write your program here.
# Store the q counts, in order, in the list answer.
answer = []

for c in answer:
    print(c)`,
    samples: [
      {
        id: '5-s1',
        label: 'Sample 1',
        input: '6\n1 2 2 2 5 9\n6\n2 3 1 9 0 10',
        expectedOutput: '3\n0\n1\n1\n0\n0'
      },
      {
        id: '5-s2',
        label: 'Sample 2',
        input: '8\n-4 -4 0 3 3 3 8 8\n5\n3 -4 8 5 -5',
        expectedOutput: '3\n2\n2\n0\n0'
      }
    ],
    solution: {
      intuition:
        'Because the list is sorted, all occurrences of x form a single contiguous range [L, R). Using binary search for the first index >= x (lower bound) and the first index > x (upper bound) finds the exact count R - L in O(log n) per query.',
      steps: [
        {
          title: 'Implement lower_bound(a, x)',
          detail: 'Maintain half-open interval [lo, hi) starting at lo = 0, hi = len(a). While lo < hi, check mid = (lo + hi) // 2. If a[mid] < x, set lo = mid + 1; else set hi = mid. Returns the first index where a[idx] >= x.'
        },
        {
          title: 'Implement upper_bound(a, x)',
          detail: 'Same invariant, except move right when a[mid] <= x (lo = mid + 1), else hi = mid. Returns the first index strictly greater than x.'
        },
        {
          title: 'Compute counts for all queries',
          detail: 'For each query x, upper_bound(a, x) - lower_bound(a, x) automatically yields 0 if x is absent and the exact occurrence count if present.'
        }
      ],
      timeComplexity: 'O((n + q) log n) — handles 10^5 queries well under the time limit',
      spaceComplexity: 'O(n + q)',
      pitfalls: [
        'Using a.count(x) takes O(n) per query, resulting in O(n * q) = 10^10 operations and Time Limit Exceeded on hidden stress tests.',
        'Off-by-one errors when setting hi = len(a) - 1 instead of len(a) when x is larger than every element in a.'
      ],
      code: `n = int(input())
a = list(map(int, input().split()))
q = int(input())
queries = list(map(int, input().split()))

def lower_bound(arr, x):
    lo, hi = 0, len(arr)
    while lo < hi:
        mid = (lo + hi) // 2
        if arr[mid] < x:
            lo = mid + 1
        else:
            hi = mid
    return lo

def upper_bound(arr, x):
    lo, hi = 0, len(arr)
    while lo < hi:
        mid = (lo + hi) // 2
        if arr[mid] <= x:
            lo = mid + 1
        else:
            hi = mid
    return lo

answer = [upper_bound(a, x) - lower_bound(a, x) for x in queries]

for c in answer:
    print(c)`
    }
  },
  {
    id: 6,
    slug: 'stairs-with-broken-steps',
    title: 'Stairs with Broken Steps',
    difficulty: 'Medium',
    pdfDifficultyLabel: 'Medium',
    topic: 'Dynamic Programming',
    points: 200,
    hiddenTestCount: 6,
    acceptanceRate: 71,
    description: [
      'A staircase has n steps, numbered 1 to n. You start on the ground (step 0) and want to reach step n. In one move you climb 1 step or 2 steps. Some steps are broken, and you must never land on a broken step.',
      'Count the number of different ways to reach step n. Two ways are different if the sequences of steps you land on are different. A simple recursive solution repeats the same work many times, so it is too slow for large n; remember the answers you have already found.'
    ],
    workedExample:
      'Let n = 5, and step 3 is broken. You can reach step 2 in 2 ways, and step 4 in 2 ways (through step 2 only). Step 5 can be reached only from step 4, because step 3 is broken. So the answer is 2: 0 -> 1 -> 2 -> 4 -> 5 and 0 -> 2 -> 4 -> 5.',
    inputFormat:
      'The first line contains two integers n and k. The second line contains k distinct integers, the numbers of the broken steps. If k = 0, the second line is empty.',
    outputFormat: 'Print the number of ways to reach step n. If step n is broken, the answer is 0.',
    constraints: '1 <= n <= 50. 0 <= k <= n. Every broken step is between 1 and n.',
    hints: [
      'Let dp[i] be the number of valid ways to reach step i. Set dp[0] = 1.',
      'If step i is in the broken set, dp[i] = 0; otherwise dp[i] = dp[i - 1] + (dp[i - 2] if i >= 2 else 0).'
    ],
    starterCode: `n, k = map(int, input().split())
broken = list(map(int, input().split()))

# Write your program here.
# Store your final answer in the variable answer.
answer = 0

print(answer)`,
    samples: [
      { id: '6-s1', label: 'Sample 1', input: '5 1\n3', expectedOutput: '2' },
      { id: '6-s2', label: 'Sample 2', input: '10 3\n2 5 8', expectedOutput: '1' },
      { id: '6-s3', label: 'Sample 3', input: '4 2\n1 2', expectedOutput: '0' }
    ],
    solution: {
      intuition:
        'Every valid path to step i must arrive either from step i - 1 (a 1-step climb) or step i - 2 (a 2-step climb). Storing results in a DP table avoids exponential recomputation of overlapping subproblems.',
      steps: [
        {
          title: 'Convert broken list to a set',
          detail: 'Store broken_set = set(broken) so membership checks (i in broken_set) take O(1) time.'
        },
        {
          title: 'Initialize DP table',
          detail: 'Create dp = [0] * (n + 1) and set dp[0] = 1 because there is exactly 1 way to stand at the starting ground (step 0).'
        },
        {
          title: 'Fill dp from 1 to n',
          detail: 'For each i from 1 to n: if i is in broken_set, leave dp[i] = 0. Otherwise set dp[i] = dp[i - 1] + (dp[i - 2] if i >= 2 else 0).'
        },
        {
          title: 'Read final answer',
          detail: 'dp[n] holds the exact count (automatically 0 if step n itself is broken or if two consecutive steps are broken).'
        }
      ],
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(n)',
      pitfalls: [
        'Plain recursion without memoization takes O(2^n) and times out on hidden test cases with n = 45..50.',
        'Forgetting to check if step 1 is broken before initializing dp[1] = 1.'
      ],
      code: `n, k = map(int, input().split())
broken = list(map(int, input().split()))

broken_set = set(broken)
dp = [0] * (n + 1)
dp[0] = 1

for i in range(1, n + 1):
    if i in broken_set:
        dp[i] = 0
    else:
        dp[i] = dp[i - 1] + (dp[i - 2] if i >= 2 else 0)

answer = dp[n]

print(answer)`
    }
  },
  {
    id: 7,
    slug: 'best-block-sum',
    title: 'Best Block Sum',
    difficulty: 'Medium',
    pdfDifficultyLabel: 'Medium',
    topic: 'Arrays & Greedy',
    points: 200,
    hiddenTestCount: 6,
    acceptanceRate: 73,
    description: [
      'A block is one or more consecutive items of a list. Find the largest possible sum of a block. The list can contain negative numbers, and the block must have at least one item.',
      'A solution that tries every block is too slow for large lists. Instead, scan the list once, and keep track of the best sum of a block that ends at the current position.'
    ],
    workedExample:
      'In the list 2 -5 4 -1 3 -6 2, the block 4 -1 3 has sum 6. No other block has a larger sum, so the answer is 6.',
    inputFormat: 'The first line contains n. The second line contains n integers.',
    outputFormat: 'Print the largest sum of a block.',
    constraints: '1 <= n <= 10^5. Every value is between -1000 and 1000.',
    hints: [
      'At position i, the best block ending at i either extends the previous best block (curr + a[i]) or starts fresh at a[i].',
      'Initialize both curr and answer to a[0] (not 0!) so lists of all negative numbers work properly.'
    ],
    starterCode: `n = int(input())
a = list(map(int, input().split()))

# Write your program here.
# Store your final answer in the variable answer.
answer = 0

print(answer)`,
    samples: [
      { id: '7-s1', label: 'Sample 1', input: '7\n2 -5 4 -1 3 -6 2', expectedOutput: '6' },
      { id: '7-s2', label: 'Sample 2', input: '3\n-3 -1 -2', expectedOutput: '-1' },
      { id: '7-s3', label: 'Sample 3', input: '6\n1 2 3 -10 4 5', expectedOutput: '9' }
    ],
    solution: {
      intuition:
        'Kadane\'s Algorithm tracks the maximum sum of any contiguous block ending at the current index. If the running sum before index i is negative, discarding it and starting fresh at a[i] is always strictly better.',
      steps: [
        {
          title: 'Initialize with the first element',
          detail: 'Set current_best = a[0] and answer = a[0]. This guarantees a non-empty block even when all values are negative.'
        },
        {
          title: 'Scan from index 1 to n - 1',
          detail: 'For each x in a[1:], compute current_best = max(x, current_best + x).'
        },
        {
          title: 'Update global maximum',
          detail: 'If current_best > answer, update answer = current_best. After one pass, answer is the maximum block sum.'
        }
      ],
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(1) auxiliary space',
      pitfalls: [
        'Initializing answer = 0 returns 0 instead of -1 on [-3, -1, -2].',
        'Nested loops over all pairs (i, j) run in O(n^2) and time out on hidden n = 50,000 test cases.'
      ],
      code: `n = int(input())
a = list(map(int, input().split()))

current_best = a[0]
answer = a[0]

for x in a[1:]:
    current_best = max(x, current_best + x)
    if current_best > answer:
        answer = current_best

print(answer)`
    }
  },
  {
    id: 8,
    slug: 'subsets-with-given-sum',
    title: 'Subsets with a Given Sum',
    difficulty: 'Hard',
    pdfDifficultyLabel: 'Hard',
    topic: 'Backtracking',
    points: 350,
    hiddenTestCount: 6,
    acceptanceRate: 54,
    description: [
      'Given n distinct positive integers and a target T, find every subset of the numbers whose sum is exactly T.',
      'Write each subset with its numbers in increasing order. List the subsets in dictionary order: compare two subsets item by item from the left, and if one subset is the beginning of another, the shorter one comes first. Use backtracking: add a number, make the recursive call, then remove the number.'
    ],
    workedExample:
      'For the numbers 2 3 5 7 and T = 10, the subsets with sum 10 are 2 3 5 and 3 7. In dictionary order, 2 3 5 comes before 3 7. If no subset has the sum T, print -1.',
    inputFormat:
      'The first line contains n. The second line contains the n integers. The third line contains T.',
    outputFormat:
      'Print each subset on its own line, with the numbers separated by spaces. If there is no subset with sum T, print -1.',
    constraints:
      '1 <= n <= 15. Every number is between 1 and 100, and the numbers are distinct. 1 <= T <= 200.',
    hints: [
      'Sort nums in ascending order first! Notice Sample 2 gives unsorted numbers: 3 34 4 12 5 2.',
      'In backtracking(start, remaining, chosen), try choosing nums[idx] in order of idx from start to n - 1, then backtrack with chosen.pop().'
    ],
    starterCode: `n = int(input())
nums = list(map(int, input().split()))
target = int(input())

# Write your program here.
# Store the subsets in the list answer, in the required order.
# Each subset is a list of integers in increasing order.
answer = []

if len(answer) == 0:
    print(-1)
for subset in answer:
    print(*subset) # prints list entries without brackets`,
    samples: [
      { id: '8-s1', label: 'Sample 1', input: '4\n2 3 5 7\n10', expectedOutput: '2 3 5\n3 7' },
      { id: '8-s2', label: 'Sample 2', input: '6\n3 34 4 12 5 2\n9', expectedOutput: '2 3 4\n4 5' },
      { id: '8-s3', label: 'Sample 3', input: '3\n4 6 8\n5', expectedOutput: '-1' }
    ],
    solution: {
      intuition:
        'Sorting nums first guarantees two properties automatically: every chosen subset is in strictly increasing order, and exploring choices in increasing index order visits subsets in exact lexicographical (dictionary) order.',
      steps: [
        {
          title: 'Sort the input list',
          detail: 'Call nums.sort(). Because all numbers are positive, we can also prune early whenever nums[idx] > remaining.'
        },
        {
          title: 'Define recursive backtracking helper',
          detail: 'backtrack(start, remaining, chosen): if remaining == 0, append chosen.copy() to answer and return.'
        },
        {
          title: 'Explore candidates in order with pruning',
          detail: 'For idx in range(start, n): if nums[idx] > remaining, break (since subsequent numbers are even larger). Otherwise append nums[idx], call backtrack(idx + 1, remaining - nums[idx], chosen), and pop() to undo the choice.'
        }
      ],
      timeComplexity: 'O(2^n) worst-case (at most 32,768 states for n <= 15, much faster with pruning)',
      spaceComplexity: 'O(n) recursion depth plus output storage',
      pitfalls: [
        'Forgetting to sort nums causes subsets to be unordered or out of dictionary order.',
        'Appending chosen instead of chosen.copy() leaves empty lists in answer after backtracking pops everything.'
      ],
      code: `n = int(input())
nums = list(map(int, input().split()))
target = int(input())

nums.sort()
answer = []
chosen = []

def backtrack(start, remaining):
    if remaining == 0:
        answer.append(chosen.copy())
        return
    for idx in range(start, n):
        if nums[idx] > remaining:
            break
        chosen.append(nums[idx])
        backtrack(idx + 1, remaining - nums[idx])
        chosen.pop()

backtrack(0, target)

if len(answer) == 0:
    print(-1)
for subset in answer:
    print(*subset)`
    }
  },
  {
    id: 9,
    slug: 'queens-on-a-board',
    title: 'Queens on a Board',
    difficulty: 'Hard',
    pdfDifficultyLabel: 'Hard',
    topic: 'Backtracking',
    points: 350,
    hiddenTestCount: 6,
    acceptanceRate: 58,
    description: [
      'A queen attacks every square in its row, its column, and both of its diagonals. Place n queens on an n x n board so that no two queens attack each other. Count the number of different ways to do this.',
      'Place the queens one row at a time. If a queen cannot be placed safely in the current row, go back and move the queen in an earlier row.'
    ],
    workedExample:
      'For n = 4 there are exactly 2 ways. In one of them the queens are in columns 2, 4, 1, 3 of rows 1 to 4. The other way is its mirror image, with columns 3, 1, 4, 2.',
    inputFormat: 'A single line containing the integer n.',
    outputFormat: 'Print the number of ways to place the n queens.',
    constraints: '1 <= n <= 9.',
    hints: [
      'Place exactly one queen per row, so row conflicts are impossible.',
      'Track occupied columns (col), main diagonals (row - col), and anti-diagonals (row + col) in three sets for O(1) conflict checks.'
    ],
    starterCode: `n = int(input())

# Write your program here.
# Store your final answer in the variable answer.
answer = 0

print(answer)`,
    samples: [
      { id: '9-s1', label: 'Sample 1', input: '4', expectedOutput: '2' },
      { id: '9-s2', label: 'Sample 2', input: '6', expectedOutput: '4' },
      { id: '9-s3', label: 'Sample 3', input: '8', expectedOutput: '92' }
    ],
    solution: {
      intuition:
        'Each row must hold exactly one queen. By backtracking row by row and recording which columns, main diagonals (row - col), and anti-diagonals (row + col) are currently attacked, each safety check takes O(1) time.',
      steps: [
        {
          title: 'Maintain three attack-tracking sets',
          detail: 'Use cols, diag1 (row - col), and diag2 (row + col) to represent threatened lines.'
        },
        {
          title: 'Define place(row)',
          detail: 'Base case: if row == n, we successfully placed all n queens, so return 1.'
        },
        {
          title: 'Try every safe column in the current row',
          detail: 'For col in range(n), skip if col in cols or (row - col) in diag1 or (row + col) in diag2. Otherwise add to all three sets, recurse on place(row + 1), and remove from all three sets after returning.'
        }
      ],
      timeComplexity: 'O(n!) upper bound (pruned heavily; runs in < 5ms for n = 9)',
      spaceComplexity: 'O(n) for the sets and call stack',
      pitfalls: [
        'Forgetting to undo the set insertions after the recursive call breaks subsequent branches.',
        'Confusing main diagonal invariant (row - col) with anti-diagonal invariant (row + col).'
      ],
      code: `n = int(input())

cols = set()
diag1 = set()
diag2 = set()

def place(row):
    if row == n:
        return 1
    total = 0
    for col in range(n):
        if col in cols or (row - col) in diag1 or (row + col) in diag2:
            continue
        cols.add(col)
        diag1.add(row - col)
        diag2.add(row + col)
        total += place(row + 1)
        cols.remove(col)
        diag1.remove(row - col)
        diag2.remove(row + col)
    return total

answer = place(0)

print(answer)`
    }
  },
  {
    id: 10,
    slug: 'kth-move-tower-of-hanoi',
    title: 'The k-th Move of the Tower of Hanoi',
    difficulty: 'Hard',
    pdfDifficultyLabel: 'Hard',
    topic: 'Recursion',
    points: 350,
    hiddenTestCount: 6,
    acceptanceRate: 49,
    description: [
      'There are three pegs, A, B and C, and n disks numbered 1 to n, where disk 1 is the smallest. At the start all disks are on peg A, with the largest disk at the bottom. In one move you take the top disk of one peg and put it on another peg. A disk can never be placed on a smaller disk. The goal is to move all disks to peg C.',
      'Use this method to move m disks from peg X to peg Y with the help of peg Z: first move m - 1 disks from X to Z, then move disk m from X to Y, then move m - 1 disks from Z to Y. This takes 2^n - 1 moves in total.',
      'Print the k-th move of this method. For large n there are far too many moves to list them all, so find the k-th move without generating the others.'
    ],
    workedExample:
      'For n = 3 the seven moves are: disk 1 from A to C, disk 2 from A to B, disk 1 from C to B, disk 3 from A to C, disk 1 from B to A, disk 2 from B to C, disk 1 from A to C. So for k = 4 the answer is "3 A C".',
    inputFormat: 'A single line containing two integers n and k.',
    outputFormat:
      'Print the disk number, the peg it is taken from, and the peg it is moved to, separated by spaces.',
    constraints: '1 <= n <= 60. 1 <= k <= 2^n - 1.',
    hints: [
      'Moving m - 1 disks takes exactly half = 2^(m - 1) - 1 moves. Therefore the move of disk m itself is always move number mid = 2^(m - 1).',
      'Compare k with mid: if k == mid, return (m, src, dst); if k < mid, recurse into the first sub-problem (src -> aux); if k > mid, recurse into the second sub-problem (aux -> dst) with k - mid.'
    ],
    starterCode: `n, k = map(int, input().split())

# Write your program here.
# Store the disk number in the variable disk,
# the peg it moves from in src, and the peg it moves to in dst.
disk, src, dst = 1, 'A', 'C'

print(disk, src, dst)`,
    samples: [
      { id: '10-s1', label: 'Sample 1', input: '3 4', expectedOutput: '3 A C' },
      { id: '10-s2', label: 'Sample 2', input: '5 10', expectedOutput: '2 C A' },
      { id: '10-s3', label: 'Sample 3', input: '60 576460752303423488', expectedOutput: '60 A C' }
    ],
    solution: {
      intuition:
        'The 2^m - 1 moves of Tower of Hanoi split cleanly around the single midpoint move mid = 2^(m - 1) where disk m transfers directly from X to Y. This lets us binary-search directly into the exact half containing k in O(n) steps.',
      steps: [
        {
          title: 'Compute the midpoint move number',
          detail: 'For m disks moving from X to Y using Z, the first sub-problem takes 2^(m - 1) - 1 moves, so disk m moves on step mid = 1 << (m - 1) (exact integer power 2**(m - 1)).'
        },
        {
          title: 'Branch into three disjoint cases',
          detail: 'If k == mid, the answer is immediately (m, X, Y). If k < mid, the k-th move lies in the first recursive call moving m - 1 disks from X to Z (using Y). If k > mid, it lies in the second recursive call moving m - 1 disks from Z to Y (using X) at offset k - mid.'
        },
        {
          title: 'Zero overflow with Python big integers',
          detail: 'Python handles 2^60 natively with exact precision, and we take at most 60 recursive steps.'
        }
      ],
      timeComplexity: 'O(n) — at most 60 steps even when k ~ 10^18',
      spaceComplexity: 'O(n) recursion stack (or O(1) iteratively)',
      pitfalls: [
        'Attempting to simulate all moves takes 2^60 steps and will immediately Time Limit Exceed.',
        'Forgetting to subtract mid when branching into the right half (k > mid).'
      ],
      code: `n, k = map(int, input().split())

def kth_move(m, step, x, y, z):
    mid = 1 << (m - 1)
    if step == mid:
        return m, x, y
    elif step < mid:
        return kth_move(m - 1, step, x, z, y)
    else:
        return kth_move(m - 1, step - mid, z, y, x)

disk, src, dst = kth_move(n, k, 'A', 'C', 'B')

print(disk, src, dst)`
    }
  },
  {
    id: 11,
    slug: 'recursive-star-pattern',
    title: 'Recursive Star Pattern',
    difficulty: 'Medium',
    pdfDifficultyLabel: 'Medium',
    topic: 'Recursion',
    points: 200,
    hiddenTestCount: 5,
    acceptanceRate: 76,
    preserveLeadingSpaces: true,
    description: [
      'Complete the recursive function pattern(n, indent) so that it prints a symmetric pattern using stars and spaces.',
      'For n = 0, the function prints nothing. Fill in the four blanks in the starter code so that its output matches the sample output. You must not use loops or additional functions. String multiplication is allowed.'
    ],
    workedExample:
      'For n = 2, the function first prints one star preceded by two spaces ("  *"). It then prints three stars with no leading spaces ("***"). Finally, it prints one star preceded by two spaces again ("  *").',
    inputFormat: 'A single line containing the integer n.',
    outputFormat:
      'Print the required pattern, preserving the leading spaces. Do not print spaces between stars or any extra blank lines.',
    constraints: '1 <= n <= 8.',
    hints: [
      'Observe the right-alignment: for n = 3, the middle line has 2*3 - 1 = 5 stars with 0 indent; the sub-pattern for n = 2 has indent = 2; the sub-pattern for n = 1 has indent = 4.',
      'Every recursive call decreases n by 1 and increases indent by 2.'
    ],
    starterCode: `def pattern(n, indent=0):
    if n == 0:
        pass  # Blank 1: replace with base-case return
    # Blank 2: recursive call for top half
    print("")  # Blank 3: print spaces + stars
    # Blank 4: recursive call for bottom half

n = int(input())
pattern(n)`,
    samples: [
      {
        id: '11-s1',
        label: 'Sample 1 (n = 3)',
        input: '3',
        expectedOutput: '    *\n  ***\n    *\n*****\n    *\n  ***\n    *'
      },
      {
        id: '11-s2',
        label: 'Sample 2 (n = 2)',
        input: '2',
        expectedOutput: '  *\n***\n  *'
      },
      {
        id: '11-s3',
        label: 'Sample 3 (n = 1)',
        input: '1',
        expectedOutput: '*'
      }
    ],
    solution: {
      intuition:
        'The pattern is a classic in-order recursive fractal (like a ruler tick pattern): print the smaller pattern shifted right by 2 spaces, print the current center bar of 2n - 1 stars at the current indent, then repeat the smaller pattern.',
      steps: [
        {
          title: 'Blank 1 — Base case',
          detail: 'When n == 0, execute return immediately so nothing is printed.'
        },
        {
          title: 'Blank 2 — Upper symmetric half',
          detail: 'Call pattern(n - 1, indent + 2) so all lines above the center bar are indented 2 more spaces to stay right-aligned.'
        },
        {
          title: 'Blank 3 — Center row of stars',
          detail: 'Print " " * indent + "*" * (2 * n - 1). For n = 3, indent = 0 this outputs 5 stars; for n = 2, indent = 2 it outputs 2 spaces + 3 stars (total width 5).'
        },
        {
          title: 'Blank 4 — Lower symmetric half',
          detail: 'Call pattern(n - 1, indent + 2) again to mirror the top half.'
        }
      ],
      timeComplexity: 'O(2^n * n) total characters printed (n <= 8 prints at most 255 lines)',
      spaceComplexity: 'O(n) recursion depth',
      pitfalls: [
        'Increasing indent by 1 instead of 2 shifts the pattern into a centered triangle instead of right-aligned ticks.',
        'Adding trailing spaces after the stars causes an exact-output mismatch.'
      ],
      code: `def pattern(n, indent=0):
    if n == 0:
        return
    pattern(n - 1, indent + 2)
    print(" " * indent + "*" * (2 * n - 1))
    pattern(n - 1, indent + 2)

n = int(input())
pattern(n)`
    }
  }
];
