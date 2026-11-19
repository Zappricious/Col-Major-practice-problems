import type { Problem } from '../types.ts';

export const PROBLEMS_PART_2: Problem[] = [
  {
    id: 12,
    slug: 'in-place-partitioning',
    title: 'In-Place Partitioning',
    difficulty: 'Medium',
    pdfDifficultyLabel: 'Medium',
    topic: 'Two Pointers',
    points: 200,
    hiddenTestCount: 6,
    acceptanceRate: 70,
    description: [
      'Complete the function partition(L, x) so that it rearranges the elements of L in place: all integers less than or equal to x must appear before all integers greater than x.',
      'The integers in L are distinct. The integer x need not occur in the list. The relative order of elements within either group does not matter.',
      'In-Place Requirement: You must modify the original list L using only a constant number of additional variables. Do not create another list/collection, slice/copy the list, use recursion, or call sort()/sorted(). Swapping via L[i], L[j] = L[j], L[i] is allowed. Return the number of elements <= x.'
    ],
    workedExample:
      'Suppose L = [8, 3, 7, 1, 6, 2] and x = 3. One valid rearrangement is [3, 1, 2, 8, 6, 7]. The first three elements are at most 3, and all remaining elements are greater than 3. The function returns 3.',
    inputFormat:
      'The first line contains distinct integers separated by spaces, representing L. The second line contains the integer x.',
    outputFormat:
      'The supplied driver code prints two lines: the count k of elements <= x, and True if the modified list is a valid partition containing the exact original elements (False otherwise).',
    constraints: '1 <= n <= 10^5. Every element of L, and x, lies between -10^9 and 10^9.',
    note: 'The in-place and running-time restrictions apply to partition() only. Do not modify the driver code.',
    hints: [
      'Use Lomuto partition: maintain write index k = 0 representing the boundary of elements <= x.',
      'Scan j from 0 to len(L) - 1; whenever L[j] <= x, swap L[k] and L[j], then increment k.'
    ],
    starterCode: `def partition(L, x):
    # Write your code here.
    # Modify L in place and return the partition index.
    pass

L = list(map(int, input().split()))
x = int(input())

# The copy below is used only to check your answer.
# You must not create a copy inside partition().
original = L.copy()

k = partition(L, x)
print(k)

valid = (
    type(k) is int
    and 0 <= k <= len(L)
    and sorted(L) == sorted(original)
    and all(L[i] <= x for i in range(k))
    and all(L[i] > x for i in range(k, len(L)))
)
print(valid)`,
    samples: [
      { id: '12-s1', label: 'Sample 1', input: '8 3 7 1 6 2\n3', expectedOutput: '3\nTrue' },
      { id: '12-s2', label: 'Sample 2', input: '4 9 6\n2', expectedOutput: '0\nTrue' },
      { id: '12-s3', label: 'Sample 3', input: '-3 5 0 2\n5', expectedOutput: '4\nTrue' }
    ],
    solution: {
      intuition:
        'Maintain a single boundary pointer k such that every element strictly to the left of k is <= x, and every element between k and the scan pointer j is > x. Swapping qualifying elements into slot k partitions the list in one linear pass with O(1) extra memory.',
      steps: [
        {
          title: 'Initialize write pointer k = 0',
          detail: 'Initially the prefix of elements <= x is empty, so k = 0.'
        },
        {
          title: 'Scan every index j from 0 to len(L) - 1',
          detail: 'Whenever L[j] <= x, swap L[k] and L[j] in place using L[k], L[j] = L[j], L[k], and advance k += 1.'
        },
        {
          title: 'Return k',
          detail: 'After the loop, L[0:k] holds all elements <= x and L[k:] holds all elements > x, so k is both the partition index and the exact count.'
        }
      ],
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(1)',
      pitfalls: [
        'Using L = [...] inside partition() rebinds the local variable instead of mutating the caller\'s list in place.',
        'Using strict inequality (< x) instead of (<= x) puts elements equal to x on the wrong side.'
      ],
      code: `def partition(L, x):
    k = 0
    for j in range(len(L)):
        if L[j] <= x:
            L[k], L[j] = L[j], L[k]
            k += 1
    return k

L = list(map(int, input().split()))
x = int(input())

original = L.copy()

k = partition(L, x)
print(k)

valid = (
    type(k) is int
    and 0 <= k <= len(L)
    and sorted(L) == sorted(original)
    and all(L[i] <= x for i in range(k))
    and all(L[i] > x for i in range(k, len(L)))
)
print(valid)`
    }
  },
  {
    id: 13,
    slug: 'merging-two-sorted-lists',
    title: 'Merging Two Sorted Lists',
    difficulty: 'Medium',
    pdfDifficultyLabel: 'Medium',
    topic: 'Two Pointers',
    points: 200,
    hiddenTestCount: 6,
    acceptanceRate: 81,
    description: [
      'Complete the function merge(A, B) that takes two lists of integers, each sorted in non-decreasing order, and returns a new sorted list containing all elements from both lists.',
      'Repeated elements must be preserved. Do not modify the original lists A and B. Do not use sort() or sorted(). You may create a new list to store the result.'
    ],
    workedExample:
      'For A = [1, 4, 7] and B = [2, 4, 8], the function returns [1, 2, 4, 4, 7, 8]. Both occurrences of 4 are included. At each step, compare the next unused element from each list and append the smaller one to the result.',
    inputFormat:
      'The first line contains the elements of A, separated by spaces. The second line contains the elements of B, separated by spaces. An empty line represents an empty list.',
    outputFormat:
      'Print the merged list as a Python list, as shown in the samples. The supplied driver code handles printing.',
    constraints:
      '0 <= n, m <= 10^5. Every element lies between -10^9 and 10^9. Both input lists are sorted in non-decreasing order.',
    hints: [
      'Keep two indices i = 0 (for A) and j = 0 (for B).',
      'While both i < len(A) and j < len(B), append the smaller element and advance its index. Then extend with whichever tail remains.'
    ],
    starterCode: `def merge(A, B):
    # Write your code here.
    # Return a new sorted list.
    pass

A = list(map(int, input().split()))
B = list(map(int, input().split()))

answer = merge(A, B)
print(answer)`,
    samples: [
      { id: '13-s1', label: 'Sample 1', input: '1 4 7\n2 4 8', expectedOutput: '[1, 2, 4, 4, 7, 8]' },
      { id: '13-s2', label: 'Sample 2', input: '-5 -1 3\n-4 0 2 9', expectedOutput: '[-5, -4, -1, 0, 2, 3, 9]' },
      { id: '13-s3', label: 'Sample 3', input: '1 1 5\n1 2 2', expectedOutput: '[1, 1, 1, 2, 2, 5]' }
    ],
    solution: {
      intuition:
        'This is the core merge routine of Merge Sort. Since both lists are already sorted, the globally smallest remaining element must be either A[i] or B[j]. Comparing only those two front elements builds the merged list in linear time.',
      steps: [
        {
          title: 'Initialize pointers and output list',
          detail: 'Set i = 0, j = 0, and res = []. Neither A nor B is mutated.'
        },
        {
          title: 'Compare front elements while both lists have items',
          detail: 'While i < len(A) and j < len(B): if A[i] <= B[j], append A[i] and do i += 1; else append B[j] and do j += 1.'
        },
        {
          title: 'Flush remaining elements',
          detail: 'After one list is exhausted, append the leftover slice from the other list via res.extend(A[i:]) and res.extend(B[j:]).'
        }
      ],
      timeComplexity: 'O(n + m)',
      spaceComplexity: 'O(n + m) for the returned list',
      pitfalls: [
        'Using A.pop(0) mutates the original input list AND makes the algorithm O((n + m)^2) because pop(0) shifts the entire list.',
        'Forgetting to handle when one or both input lists are empty.'
      ],
      code: `def merge(A, B):
    res = []
    i = 0
    j = 0
    while i < len(A) and j < len(B):
        if A[i] <= B[j]:
            res.append(A[i])
            i += 1
        else:
            res.append(B[j])
            j += 1
    res.extend(A[i:])
    res.extend(B[j:])
    return res

A = list(map(int, input().split()))
B = list(map(int, input().split()))

answer = merge(A, B)
print(answer)`
    }
  },
  {
    id: 14,
    slug: 'strongest-stock-price-rally',
    title: 'Strongest Stock Price Rally',
    difficulty: 'Medium',
    pdfDifficultyLabel: 'Medium',
    topic: 'Arrays & Greedy',
    points: 200,
    hiddenTestCount: 6,
    acceptanceRate: 78,
    description: [
      'A list prices contains the price of a stock on a sequence of days. The element prices[i] is the price on day i, with days numbered starting from 0. The strength of a rally from day i to day j is prices[j] - prices[i] for i < j.',
      'Prices may rise or fall between these two days; only the starting and ending prices determine the strength. Complete strongest_rally(prices) to return the largest positive rally strength, or 0 if no positive rally exists.',
      'Your function must use only a constant number of additional variables. Do not modify the input list, create another collection, or use sorting.'
    ],
    workedExample:
      'For prices = [120, 100, 115, 90, 130, 125], the strongest rally starts on day 3 (price 90) and ends on day 4 (price 130), giving 130 - 90 = 40. For [150, 100, 120], the answer is 20, not 50, because 150 occurs before 100.',
    inputFormat: 'A single line containing the daily prices as space-separated integers.',
    outputFormat:
      'Print one integer: the strength of the strongest rally, or 0 if there is no positive rally. The supplied driver code handles printing.',
    constraints: '1 <= n <= 10^5. Each price is an integer between 1 and 10^9. Prices may repeat.',
    hints: [
      'If you end a rally on day j, the best starting day i < j is always the day with the minimum price seen so far.',
      'Maintain two scalar variables: min_price = prices[0] and best = 0.'
    ],
    starterCode: `def strongest_rally(prices):
    # Write your code here.
    # Return the largest positive price increase.
    pass

prices = list(map(int, input().split()))

answer = strongest_rally(prices)
print(answer)`,
    samples: [
      { id: '14-s1', label: 'Sample 1', input: '120 100 115 90 130 125', expectedOutput: '40' },
      { id: '14-s2', label: 'Sample 2', input: '150 100 120', expectedOutput: '20' },
      { id: '14-s3', label: 'Sample 3', input: '100 90 80 70', expectedOutput: '0' },
      { id: '14-s4', label: 'Sample 4', input: '75', expectedOutput: '0' }
    ],
    solution: {
      intuition:
        'To maximize prices[j] - prices[i] with i < j, for every candidate selling day j we only need to remember the single lowest price observed on all earlier days [0..j-1].',
      steps: [
        {
          title: 'Track running minimum and best rally',
          detail: 'Initialize min_price = prices[0] and best = 0.'
        },
        {
          title: 'Single left-to-right pass',
          detail: 'For each price p in prices: if p < min_price, update min_price = p. Otherwise check if p - min_price > best and update best.'
        },
        {
          title: 'Return best',
          detail: 'Because best starts at 0, strictly decreasing or single-day inputs automatically return 0.'
        }
      ],
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(1)',
      pitfalls: [
        'Returning max(prices) - min(prices) ignores time ordering (fails when the peak precedes the valley).',
        'Checking every pair (i, j) runs in O(n^2) and times out for n = 10^5.'
      ],
      code: `def strongest_rally(prices):
    min_price = prices[0]
    best = 0
    for p in prices:
        if p < min_price:
            min_price = p
        elif p - min_price > best:
            best = p - min_price
    return best

prices = list(map(int, input().split()))

answer = strongest_rally(prices)
print(answer)`
    }
  },
  {
    id: 15,
    slug: 'distinct-permutations',
    title: 'Distinct Permutations',
    difficulty: 'Hard',
    pdfDifficultyLabel: 'Hard',
    topic: 'Backtracking',
    points: 350,
    hiddenTestCount: 5,
    acceptanceRate: 52,
    compareMode: 'unordered-lines',
    description: [
      'Complete the recursive function permutations(L, i) that prints all distinct permutations of a list of integers. The list may contain repeated integers, but each distinct permutation must be printed exactly once.',
      'The parameter i marks the position currently being filled. Elements before position i have already been chosen. The initial call is permutations(L, 0). Use backtracking: choose an element for position i, recursively fill the remaining positions, and then undo your choice. When all positions have been filled, print the list using print(L).',
      'You may use loops and a local set in each recursive call to keep track of values already tried at the current position. Do not use itertools.permutations or store all generated permutations in a collection to deduplicate afterwards. The list must be restored to its original order when finished.'
    ],
    workedExample:
      'For L = [1, 1, 2], there are three distinct permutations: [1, 1, 2], [1, 2, 1], and [2, 1, 1]. At any position, choosing different occurrences of the same value would generate duplicates, so each distinct available value should be tried only once at that position.',
    inputFormat: 'A single line containing the elements of L, separated by spaces.',
    outputFormat:
      'Print each distinct permutation as a Python list on a separate line. The permutations may be printed in any order. Do not print any permutation more than once.',
    constraints: '1 <= |L| <= 8. Each element is an integer between -9 and 9. Elements may repeat.',
    hints: [
      'Base case: when i == len(L), print(L) and return.',
      'Inside the recursive call, create seen = set(). For j in range(i, len(L)), if L[j] in seen, skip it; otherwise add L[j] to seen, swap L[i] and L[j], call permutations(L, i + 1), and swap back!'
    ],
    starterCode: `def permutations(L, i):
    # Write your recursive code here.
    # Print each distinct permutation exactly once.
    pass

L = list(map(int, input().split()))
permutations(L, 0)`,
    samples: [
      { id: '15-s1', label: 'Sample 1', input: '1 1 2', expectedOutput: '[1, 1, 2]\n[1, 2, 1]\n[2, 1, 1]' },
      { id: '15-s2', label: 'Sample 2', input: '4 4 4', expectedOutput: '[4, 4, 4]' },
      { id: '15-s3', label: 'Sample 3', input: '-1 2', expectedOutput: '[-1, 2]\n[2, -1]' }
    ],
    solution: {
      intuition:
        'At recursion depth i, L[0:i] is fixed and L[i:] contains the remaining candidates. If two indices j1 and j2 in L[i:] hold the same value, placing either one at position i creates the exact same multiset of remaining elements and therefore identical subtrees. A local set per frame prunes duplicate branches immediately.',
      steps: [
        {
          title: 'Base case when all slots are filled',
          detail: 'If i == len(L), print(L) and return.'
        },
        {
          title: 'Track values already placed at position i',
          detail: 'Create a local seen = set() inside permutations(L, i) so it applies only to the current level i.'
        },
        {
          title: 'Swap, recurse, and restore',
          detail: 'For j from i to len(L) - 1: if L[j] is already in seen, continue. Otherwise add L[j] to seen, swap L[i] with L[j], recurse on permutations(L, i + 1), and swap L[i] and L[j] back to restore the list.'
        }
      ],
      timeComplexity: 'O(n * U) where U is the number of unique permutations (at most 8! = 40,320)',
      spaceComplexity: 'O(n^2) for local sets across depth n',
      pitfalls: [
        'Using a global seen set instead of a local set per recursion frame prevents valid placements at deeper indices.',
        'Forgetting the second swap leaves L scrambled for subsequent iterations.'
      ],
      code: `def permutations(L, i):
    if i == len(L):
        print(L)
        return
    seen = set()
    for j in range(i, len(L)):
        if L[j] in seen:
            continue
        seen.add(L[j])
        L[i], L[j] = L[j], L[i]
        permutations(L, i + 1)
        L[i], L[j] = L[j], L[i]

L = list(map(int, input().split()))
permutations(L, 0)`
    }
  },
  {
    id: 16,
    slug: 'integer-logarithm',
    title: 'Integer Logarithm',
    difficulty: 'Easy',
    pdfDifficultyLabel: 'Easy to Medium',
    topic: 'Recursion',
    points: 100,
    hiddenTestCount: 6,
    acceptanceRate: 85,
    description: [
      'Complete the recursive function integer_log(n) that returns floor(log2(n)) for a positive integer n — equivalently, the largest nonnegative integer k such that 2^k <= n.',
      'Your function must use recursion and integer arithmetic. Do not use loops, logarithm functions, floating-point arithmetic, bit_length(), or conversion to binary. You may use integer division (//).'
    ],
    workedExample:
      'For n = 20, we have 2^4 = 16 <= 20 < 32 = 2^5. Therefore, the function returns 4. For n = 1, it returns 0, since 2^0 = 1.',
    inputFormat: 'A single line containing a positive integer n.',
    outputFormat: 'Print one integer: floor(log2(n)). The supplied driver code handles printing.',
    constraints: '1 <= n <= 10^18.',
    hints: [
      'What happens to floor(log2(n)) when you replace n with n // 2?',
      'Base case: when n < 2 (i.e. n == 1), return 0. Recursive case: return 1 + integer_log(n // 2).'
    ],
    starterCode: `def integer_log(n):
    # Write your recursive code here.
    # Return floor(log base 2 of n).
    pass

n = int(input())

answer = integer_log(n)
print(answer)`,
    samples: [
      { id: '16-s1', label: 'Sample 1', input: '20', expectedOutput: '4' },
      { id: '16-s2', label: 'Sample 2', input: '32', expectedOutput: '5' },
      { id: '16-s3', label: 'Sample 3', input: '1', expectedOutput: '0' }
    ],
    solution: {
      intuition:
        'Dividing an integer n >= 2 by 2 with floor division shifts its binary representation right by one bit, reducing floor(log2(n)) by exactly 1.',
      steps: [
        {
          title: 'Identify the base case',
          detail: 'When n < 2 (specifically n == 1), 2^0 = 1 <= n < 2, so return 0.'
        },
        {
          title: 'Apply the recurrence relation',
          detail: 'For n >= 2, return 1 + integer_log(n // 2). Because n halves every call, even n = 10^18 takes only ~60 recursive calls.'
        }
      ],
      timeComplexity: 'O(log n)',
      spaceComplexity: 'O(log n) call stack',
      pitfalls: [
        'Using math.log2(n) suffers floating-point rounding errors near 2^53 and violates the problem constraints.',
        'Using n / 2 instead of n // 2 leads to floats and infinite recursion.'
      ],
      code: `def integer_log(n):
    if n < 2:
        return 0
    return 1 + integer_log(n // 2)

n = int(input())

answer = integer_log(n)
print(answer)`
    }
  },
  {
    id: 17,
    slug: 'counting-ones-in-binary',
    title: 'Counting Ones in Binary',
    difficulty: 'Easy',
    pdfDifficultyLabel: 'Easy to Medium',
    topic: 'Recursion',
    points: 100,
    hiddenTestCount: 6,
    acceptanceRate: 83,
    description: [
      'Complete the recursive function count_ones(n) that returns the number of 1s in the binary representation of a nonnegative integer n.',
      'Your function must use recursion and integer arithmetic. Do not use loops, bin(), bit_count(), bitwise operators, or conversion to a string. You may use integer division (//) and remainder (%).'
    ],
    workedExample:
      'The binary representation of 13 is 1101, which contains three 1s. Therefore, the function returns 3. The binary representation of 8 is 1000, so the function returns 1.',
    inputFormat: 'A single line containing a nonnegative integer n.',
    outputFormat:
      'Print one integer: the number of 1s in the binary representation of n. The supplied driver code handles printing.',
    constraints: '0 <= n <= 10^18.',
    hints: [
      'The least significant binary digit of n is n % 2 (either 0 or 1).',
      'The remaining higher bits form the integer n // 2.'
    ],
    starterCode: `def count_ones(n):
    # Write your recursive code here.
    # Return the number of ones in binary.
    pass

n = int(input())

answer = count_ones(n)
print(answer)`,
    samples: [
      { id: '17-s1', label: 'Sample 1', input: '13', expectedOutput: '3' },
      { id: '17-s2', label: 'Sample 2', input: '8', expectedOutput: '1' },
      { id: '17-s3', label: 'Sample 3', input: '0', expectedOutput: '0' }
    ],
    solution: {
      intuition:
        'Just as dividing a decimal number by 10 strips its last base-10 digit, dividing n by 2 extracts its last binary digit (n % 2) and leaves the remaining prefix (n // 2).',
      steps: [
        {
          title: 'Handle base case n == 0',
          detail: 'Zero has no 1-bits in binary, so return 0.'
        },
        {
          title: 'Peel off the last bit recursively',
          detail: 'Return (n % 2) + count_ones(n // 2). For n = 13: 1 + count_ones(6) -> 1 + 0 + count_ones(3) -> 1 + 0 + 1 + count_ones(1) -> 1 + 0 + 1 + 1 + 0 = 3.'
        }
      ],
      timeComplexity: 'O(log n)',
      spaceComplexity: 'O(log n) call stack',
      pitfalls: [
        'Forgetting the n == 0 base case causes infinite recursion.',
        'Using bin(n).count("1") violates the recursion-only arithmetic rule.'
      ],
      code: `def count_ones(n):
    if n == 0:
        return 0
    return (n % 2) + count_ones(n // 2)

n = int(input())

answer = count_ones(n)
print(answer)`
    }
  },
  {
    id: 18,
    slug: 'lab-slots-for-students',
    title: 'Lab Slots for Students',
    difficulty: 'Hard',
    pdfDifficultyLabel: 'Medium to Hard',
    topic: 'Dynamic Programming',
    points: 350,
    hiddenTestCount: 6,
    acceptanceRate: 59,
    description: [
      'We want to divide n COL1000 students into k lab slots so that every slot has at least one student. Count the number of ways (Stirling numbers of the second kind, S(n, k)).',
      'Think recursively about the n-th student: either the first n - 1 students already occupy all k slots (so student n can join any of the k slots), or the first n - 1 students occupy k - 1 slots (so student n must start the k-th slot alone).'
    ],
    workedExample:
      'For n = 3 students [1, 2, 3] and k = 2 slots, the valid divisions are ([1], [2, 3]), ([1, 2], [3]), and ([1, 3], [2]), so ways(3, 2) = 3.',
    inputFormat: 'The first line contains n. The second line contains k.',
    outputFormat: 'Print a single integer: the number of valid divisions ways(n, k).',
    constraints: '1 <= n <= 20, 1 <= k <= 20.',
    hints: [
      'Base cases: if k == 0 or k > n, return 0. If k == 1 or k == n, return 1.',
      'Recurrence: ways(n, k) = k * ways(n - 1, k) + ways(n - 1, k - 1). Add memoization so n = 20 runs instantaneously!'
    ],
    starterCode: `def ways(n, k):
    # Write your recursive code here
    pass

n = int(input())
k = int(input())

print(ways(n, k))`,
    samples: [
      { id: '18-s1', label: 'Sample 1', input: '3\n2', expectedOutput: '3' },
      { id: '18-s2', label: 'Sample 2', input: '4\n2', expectedOutput: '7' },
      { id: '18-s3', label: 'Sample 3', input: '3\n3', expectedOutput: '1' }
    ],
    solution: {
      intuition:
        'Partitioning n distinct students into k identical non-empty groups yields the Stirling numbers of the second kind. Focusing on student n produces two disjoint cases that partition all valid configurations.',
      steps: [
        {
          title: 'Establish base cases',
          detail: 'If k <= 0 or k > n, it is impossible to form k non-empty slots, so return 0. If k == 1 (all students in one slot) or k == n (each student in their own slot), there is exactly 1 way.'
        },
        {
          title: 'Apply the recurrence relation',
          detail: 'Case 1: The first n - 1 students already fill k slots -> student n has k choices -> k * ways(n - 1, k). Case 2: The first n - 1 students fill k - 1 slots -> student n forms the new slot -> ways(n - 1, k - 1).'
        },
        {
          title: 'Memoize subproblems',
          detail: 'Cache computed (n, k) pairs in a dictionary so larger inputs like n = 18, k = 9 execute in microseconds instead of exponential time.'
        }
      ],
      timeComplexity: 'O(n * k) with memoization',
      spaceComplexity: 'O(n * k)',
      pitfalls: [
        'Forgetting k > n returns 0 leads to infinite recursion or incorrect counts.',
        'Omitting memoization causes exponential slowdown for n >= 16.'
      ],
      code: `memo = {}

def ways(n, k):
    if k <= 0 or k > n:
        return 0
    if k == 1 or k == n:
        return 1
    if (n, k) in memo:
        return memo[(n, k)]
    res = k * ways(n - 1, k) + ways(n - 1, k - 1)
    memo[(n, k)] = res
    return res

n = int(input())
k = int(input())

print(ways(n, k))`
    }
  },
  {
    id: 19,
    slug: 'seating-arrangement-for-students',
    title: 'Seating Arrangement for Students',
    difficulty: 'Hard',
    pdfDifficultyLabel: 'Medium to Hard',
    topic: 'Dynamic Programming',
    points: 350,
    hiddenTestCount: 6,
    acceptanceRate: 62,
    description: [
      'During the exam, we ensure that no two COL1000 students are seated next to each other. We have n people sitting in a straight line, numbered 1, 2, ..., n. We want to choose exactly k people so that no two chosen people are adjacent.',
      'Count the number of ways. Look at the n-th person: either person n is not chosen (choose k from the first n - 1 people), or person n is chosen (person n - 1 cannot be chosen, so choose k - 1 from the first n - 2 people).'
    ],
    workedExample:
      'For n = 4 people in a line and k = 2, the valid choices are [1, 3], [1, 4], and [2, 4], so ways(4, 2) = 3.',
    inputFormat: 'The first line contains n. The second line contains k (n, k >= 1).',
    outputFormat: 'Print a single integer: the number of valid selections ways(n, k).',
    constraints: '1 <= n <= 40, 1 <= k <= 40.',
    hints: [
      'Base cases: if k == 0, return 1 (choosing nobody is 1 valid way). If n <= 0 or k > (n + 1) // 2, return 0.',
      'Recurrence: ways(n, k) = ways(n - 1, k) + ways(n - 2, k - 1), cached with memoization.'
    ],
    starterCode: `# assume n, k >= 1
def ways(n, k):
    # Write your recursive code here
    pass

n = int(input())
k = int(input())

print(ways(n, k))`,
    samples: [
      { id: '19-s1', label: 'Sample 1', input: '4\n2', expectedOutput: '3' },
      { id: '19-s2', label: 'Sample 2', input: '5\n2', expectedOutput: '6' },
      { id: '19-s3', label: 'Sample 3', input: '3\n2', expectedOutput: '1' }
    ],
    solution: {
      intuition:
        'Deciding whether to include or exclude the last person splits all valid subsets cleanly into two disjoint subproblems. Memoizing (n, k) guarantees polynomial runtime even for n = 40.',
      steps: [
        {
          title: 'Define clean base cases',
          detail: 'If k == 0, return 1 (the empty selection). If n <= 0 or k > (n + 1) // 2, it is impossible to seat k non-adjacent students in n chairs, so return 0.'
        },
        {
          title: 'Combine the two disjoint choices',
          detail: 'Skip person n -> ways(n - 1, k). Pick person n -> person n - 1 is blocked -> ways(n - 2, k - 1). Return their sum.'
        },
        {
          title: 'Memoize overlapping states',
          detail: 'Store each computed (n, k) in memo. (Fun math check: the closed form is C(n - k + 1, k)!)'
        }
      ],
      timeComplexity: 'O(n * k) with memoization',
      spaceComplexity: 'O(n * k)',
      pitfalls: [
        'Handling n == 1, k == 1 improperly: when person 1 is chosen, the call becomes ways(-1, 0), so k == 0 MUST be checked before n <= 0!',
        'Unmemoized recursion times out for n >= 30.'
      ],
      code: `memo = {}

def ways(n, k):
    if k == 0:
        return 1
    if n <= 0 or k > (n + 1) // 2:
        return 0
    if (n, k) in memo:
        return memo[(n, k)]
    res = ways(n - 1, k) + ways(n - 2, k - 1)
    memo[(n, k)] = res
    return res

n = int(input())
k = int(input())

print(ways(n, k))`
    }
  },
  {
    id: 20,
    slug: 'power-of-a-matrix',
    title: 'Power of a Matrix',
    difficulty: 'Hard',
    pdfDifficultyLabel: 'Medium to Hard',
    topic: 'Matrices',
    points: 350,
    hiddenTestCount: 5,
    acceptanceRate: 57,
    description: [
      'Neo has just discovered he lives in a simulation. To reach the exit, he must learn to compute the power of a square matrix M of dimension n x n.',
      'Implement three functions: (1) row_col_prod(A, B, i, j) returning the dot product of row i of A with column j of B; (2) mat_mul(A, B) returning C = A x B as a new matrix by calling row_col_prod without modifying A or B; (3) recursive mat_pow(M, k) returning M^k for k >= 0, where M^0 is the n x n identity matrix and k = 1 returns a fresh copy of M (no aliasing).'
    ],
    workedExample:
      'For A = [[1, 2], [3, 4]] and B = [[5, 6], [7, 8]], row_col_prod(A, B, 0, 0) = 1*5 + 2*7 = 19, and mat_mul(A, B) = [[19, 22], [43, 50]]. For Fibonacci matrix F = [[1, 1], [1, 0]], mat_pow(F, 5) = [[8, 5], [5, 3]], and mat_pow(A, 0) = [[1, 0], [0, 1]].',
    inputFormat:
      'First line contains n and k. Next n lines each contain n integers representing square matrix M. The driver tests row_col_prod, mat_mul, mat_pow(M, k), and checks non-aliasing.',
    outputFormat:
      'The supplied driver prints the resulting n x n matrix M^k (one row per line, space-separated) followed by True if M was not mutated and mat_pow(M, 1) returned a distinct object (no aliasing).',
    constraints: '1 <= n <= 10, 0 <= k <= 30.',
    note: 'Implement only row_col_prod, mat_mul, and mat_pow. Do not modify the driver code below.',
    hints: [
      'For k == 0, build the identity matrix: [[1 if i == j else 0 for j in range(n)] for i in range(n)].',
      'For k == 1, return [row.copy() for row in M] so neither the outer list nor any inner row is aliased to M.',
      'For faster recursion (exponentiation by squaring), compute half = mat_pow(M, k // 2); square it, and multiply by M if k is odd!'
    ],
    starterCode: `def row_col_prod(A, B, i, j):
    # Return the dot product of row i of A and column j of B.
    pass

def mat_mul(A, B):
    # Return A x B as a new matrix (use row_col_prod).
    pass

def mat_pow(M, k):
    # Return M^k for a square M, k >= 0 and integer.
    # Recursive, no aliasing!
    pass

# --- Driver Code (do not modify) ---
n, k = map(int, input().split())
M = [list(map(int, input().split())) for _ in range(n)]
snapshot = [row.copy() for row in M]

res = mat_pow(M, k)
q1 = mat_pow(M, 1)
no_alias = (
    M == snapshot
    and q1 == snapshot
    and id(q1) != id(M)
    and all(id(q1[r]) != id(M[r]) for r in range(n))
)
for row in res:
    print(*row)
print(no_alias)`,
    samples: [
      {
        id: '20-s1',
        label: 'Sample 1 (Fibonacci F^5)',
        input: '2 5\n1 1\n1 0',
        expectedOutput: '8 5\n5 3\nTrue'
      },
      {
        id: '20-s2',
        label: 'Sample 2 (Identity M^0)',
        input: '2 0\n1 2\n3 4',
        expectedOutput: '1 0\n0 1\nTrue'
      },
      {
        id: '20-s3',
        label: 'Sample 3 (Fresh Copy M^1)',
        input: '2 1\n1 2\n3 4',
        expectedOutput: '1 2\n3 4\nTrue'
      }
    ],
    solution: {
      intuition:
        'Build matrix exponentiation bottom-up from the three clean abstractions: dot product -> matrix multiplication -> recursive exponentiation by squaring, while always creating fresh 2D lists to prevent subtle row-aliasing bugs.',
      steps: [
        {
          title: '1. Dot product row_col_prod(A, B, i, j)',
          detail: 'Sum A[i][t] * B[t][j] for t in range(len(A[0])).'
        },
        {
          title: '2. Matrix multiplication mat_mul(A, B)',
          detail: 'For an n x m matrix A and m x r matrix B, create a new n x r matrix where C[i][j] = row_col_prod(A, B, i, j).'
        },
        {
          title: '3. Recursive mat_pow(M, k) with zero aliasing',
          detail: 'If k == 0, construct and return the fresh n x n identity matrix. If k == 1, return [row.copy() for row in M]. Otherwise compute half = mat_pow(M, k // 2), sq = mat_mul(half, half), and return sq if k % 2 == 0 else mat_mul(sq, M).'
        }
      ],
      timeComplexity: 'O(n^3 log k) with binary exponentiation',
      spaceComplexity: 'O(n^2 log k)',
      pitfalls: [
        'Returning M directly when k == 1 fails the no-aliasing requirement (id(Q) != id(M)).',
        'Writing M.copy() only copies the outer list — inner rows would still share references with M! Always copy each row: [row.copy() for row in M].'
      ],
      code: `def row_col_prod(A, B, i, j):
    total = 0
    for t in range(len(A[0])):
        total += A[i][t] * B[t][j]
    return total

def mat_mul(A, B):
    rows = len(A)
    cols = len(B[0])
    return [[row_col_prod(A, B, i, j) for j in range(cols)] for i in range(rows)]

def mat_pow(M, k):
    n = len(M)
    if k == 0:
        return [[1 if i == j else 0 for j in range(n)] for i in range(n)]
    if k == 1:
        return [row.copy() for row in M]
    half = mat_pow(M, k // 2)
    sq = mat_mul(half, half)
    if k % 2 == 0:
        return sq
    return mat_mul(sq, M)

# --- Driver Code (do not modify) ---
n, k = map(int, input().split())
M = [list(map(int, input().split())) for _ in range(n)]
snapshot = [row.copy() for row in M]

res = mat_pow(M, k)
q1 = mat_pow(M, 1)
no_alias = (
    M == snapshot
    and q1 == snapshot
    and id(q1) != id(M)
    and all(id(q1[r]) != id(M[r]) for r in range(n))
)
for row in res:
    print(*row)
print(no_alias)`
    }
  },
  {
    id: 21,
    slug: 'grid-paths-with-obstacles',
    title: 'Grid Paths with Obstacles',
    difficulty: 'Medium',
    pdfDifficultyLabel: 'Medium',
    topic: 'Dynamic Programming',
    points: 200,
    hiddenTestCount: 6,
    acceptanceRate: 75,
    description: [
      'You are given an m x n grid. You start at the top-left cell (0, 0) and want to reach the bottom-right cell (m - 1, n - 1). You may only move right or down.',
      'Cells containing 1 are obstacles and cannot be entered; cells containing 0 are free. Count the number of valid paths.'
    ],
    workedExample:
      'For the 3 x 3 grid with a single obstacle in the center cell (1, 1), there are exactly 2 valid paths from top-left to bottom-right: around the top-right edge or around the bottom-left edge.',
    inputFormat:
      'The first line contains two integers m and n. The next m lines each contain n integers, either 0 or 1.',
    outputFormat: 'Print the number of valid paths.',
    constraints: '1 <= m, n <= 10.',
    hints: [
      'Check out-of-bounds (i >= m or j >= n) and obstacle (grid[i][j] == 1) FIRST, returning 0.',
      'If at the destination (i == m - 1 and j == n - 1), return 1. Otherwise return count_paths(grid, i + 1, j) + count_paths(grid, i, j + 1) (with memoization for speed).'
    ],
    starterCode: `m, n = map(int, input().split())
grid = [list(map(int, input().split())) for _ in range(m)]

def count_paths(grid, i, j):
    # write your code here
    return 0

answer = count_paths(grid, 0, 0)
print(answer)`,
    samples: [
      { id: '21-s1', label: 'Sample 1', input: '3 3\n0 0 0\n0 1 0\n0 0 0', expectedOutput: '2' },
      { id: '21-s2', label: 'Sample 2', input: '2 2\n0 0\n0 0', expectedOutput: '2' },
      { id: '21-s3', label: 'Sample 3', input: '2 3\n0 0 0\n0 1 0', expectedOutput: '1' }
    ],
    solution: {
      intuition:
        'From any valid free cell (i, j), every path to the bottom-right begins by stepping either down to (i + 1, j) or right to (i, j + 1). Memoizing (i, j) avoids recomputing shared grid suffixes.',
      steps: [
        {
          title: 'Reject invalid or blocked cells first',
          detail: 'If i >= m or j >= n or grid[i][j] == 1, return 0. Checking grid[i][j] == 1 BEFORE the destination check automatically handles grids where the start or finish cell itself is an obstacle.'
        },
        {
          title: 'Destination base case',
          detail: 'If i == m - 1 and j == n - 1, we reached the goal safely, so return 1.'
        },
        {
          title: 'Sum downward and rightward subproblems with memoization',
          detail: 'Cache memo[(i, j)] = count_paths(grid, i + 1, j) + count_paths(grid, i, j + 1) and return it.'
        }
      ],
      timeComplexity: 'O(m * n)',
      spaceComplexity: 'O(m * n)',
      pitfalls: [
        'Checking the destination before checking grid[i][j] == 1 returns 1 when the bottom-right cell is blocked!',
        'Without memoization, a 10 x 10 obstacle-free grid evaluates C(18, 9) = 48,620 paths redundantly.'
      ],
      code: `m, n = map(int, input().split())
grid = [list(map(int, input().split())) for _ in range(m)]

memo = {}

def count_paths(grid, i, j):
    if i >= m or j >= n or grid[i][j] == 1:
        return 0
    if i == m - 1 and j == n - 1:
        return 1
    if (i, j) in memo:
        return memo[(i, j)]
    res = count_paths(grid, i + 1, j) + count_paths(grid, i, j + 1)
    memo[(i, j)] = res
    return res

answer = count_paths(grid, 0, 0)
print(answer)`
    }
  },
  {
    id: 22,
    slug: 'combination-sum',
    title: 'Combination Sum',
    difficulty: 'Medium',
    pdfDifficultyLabel: 'Medium',
    topic: 'Backtracking',
    points: 200,
    hiddenTestCount: 6,
    acceptanceRate: 66,
    description: [
      'Given n distinct positive integers (candidates) and a target T, find all unique combinations in which the chosen candidates sum to T. Each candidate may be used an unlimited number of times.',
      'Print each combination on its own line in sorted order, with integers separated by spaces. If no combination exists, print NONE.'
    ],
    workedExample:
      'For candidates {2, 3, 6, 7} and T = 7, the valid combinations are [2, 2, 3] and [7]. Printed space-separated: "2 2 3" and "7".',
    inputFormat:
      'The first line contains two integers n and T. The second line contains n distinct positive integers.',
    outputFormat:
      'Print each combination on its own line, integers separated by spaces. If no combination exists, print NONE.',
    constraints: '1 <= n <= 20, 1 <= T <= 30.',
    hints: [
      'Because each candidate can be reused, pass the SAME index idx (not idx + 1) into the recursive call backtrack(idx, remaining - cands[idx], path).',
      'Passing start = idx prevents duplicate permutations like [2, 3, 2] and [3, 2, 2].'
    ],
    starterCode: `n, T = map(int, input().split())
cands = sorted(map(int, input().split()))

res = [] # collect your answers in res

def backtrack(start, remaining, path):
    # write your code here
    pass

backtrack(0, T, [])
answer = res

if not answer:
    print("NONE")
else:
    for combo in answer:
        print(*combo)`,
    samples: [
      { id: '22-s1', label: 'Sample 1', input: '4 7\n2 3 6 7', expectedOutput: '2 2 3\n7' },
      { id: '22-s2', label: 'Sample 2', input: '3 5\n2 3 5', expectedOutput: '2 3\n5' },
      { id: '22-s3', label: 'Sample 3', input: '2 1\n2 3', expectedOutput: 'NONE' }
    ],
    solution: {
      intuition:
        'Since candidates are sorted and can be reused indefinitely, forcing choices to stay at index >= start guarantees every unique combination is discovered in non-decreasing order exactly once.',
      steps: [
        {
          title: 'Base case when remaining hits 0',
          detail: 'Append path.copy() to res and return.'
        },
        {
          title: 'Iterate from start onward with early pruning',
          detail: 'For idx in range(start, len(cands)): if cands[idx] > remaining, break immediately because cands is sorted.'
        },
        {
          title: 'Reuse the same index in recursion',
          detail: 'Append cands[idx] to path, call backtrack(idx, remaining - cands[idx], path) (note idx, not idx + 1!), then call path.pop() to backtrack.'
        }
      ],
      timeComplexity: 'O(N^(T / min_cand)) bounded by number of valid combinations',
      spaceComplexity: 'O(T / min_cand) recursion depth',
      pitfalls: [
        'Starting the loop from 0 instead of start produces duplicate reorderings such as "2 2 3", "2 3 2", and "3 2 2".',
        'Passing idx + 1 forbids reusing the same candidate multiple times.'
      ],
      code: `n, T = map(int, input().split())
cands = sorted(map(int, input().split()))

res = []

def backtrack(start, remaining, path):
    if remaining == 0:
        res.append(path.copy())
        return
    for idx in range(start, len(cands)):
        if cands[idx] > remaining:
            break
        path.append(cands[idx])
        backtrack(idx, remaining - cands[idx], path)
        path.pop()

backtrack(0, T, [])
answer = res

if not answer:
    print("NONE")
else:
    for combo in answer:
        print(*combo)`
    }
  }
];
