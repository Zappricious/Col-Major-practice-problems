export interface HiddenTestCase {
  label: string;
  input: string;
  expectedOutput: string;
}

// Helper to build deterministic large test inputs without bloating source files
function makeProblem5Stress(): HiddenTestCase {
  // 20,000 sorted elements: 0 repeated 5000 times, 100 repeated 5000 times, 500 repeated 5000 times, 1000000000 repeated 5000 times
  const arr: number[] = [];
  for (let i = 0; i < 5000; i++) arr.push(-1000000000);
  for (let i = 0; i < 5000; i++) arr.push(0);
  for (let i = 0; i < 5000; i++) arr.push(42);
  for (let i = 0; i < 5000; i++) arr.push(1000000000);
  const queries = [-1000000000, -1, 0, 42, 43, 1000000000];
  return {
    label: 'Hidden 6 (Performance Stress 20k)',
    input: `${arr.length}\n${arr.join(' ')}\n${queries.length}\n${queries.join(' ')}`,
    expectedOutput: '5000\n0\n5000\n5000\n0\n5000'
  };
}

function makeProblem7Stress(): HiddenTestCase {
  // 30,000 elements: alternating -5, 4 with a strong burst of 1000s in the middle
  const arr: number[] = [];
  for (let i = 0; i < 15000; i++) arr.push(i % 2 === 0 ? -5 : 4);
  for (let i = 0; i < 50; i++) arr.push(1000);
  for (let i = 0; i < 14950; i++) arr.push(i % 2 === 0 ? -5 : 4);
  return {
    label: 'Hidden 6 (Performance Stress 30k)',
    input: `${arr.length}\n${arr.join(' ')}`,
    expectedOutput: '50004'
  };
}

function makeProblem12Stress(): HiddenTestCase {
  const n = 10000;
  const arr: number[] = [];
  for (let i = n; i >= 1; i--) arr.push(i);
  return {
    label: 'Hidden 6 (Reverse Sorted 10k)',
    input: `${arr.join(' ')}\n5000`,
    expectedOutput: '5000\nTrue'
  };
}

function makeProblem13Stress(): HiddenTestCase {
  const a: number[] = [];
  const b: number[] = [];
  const expected: number[] = [];
  for (let i = 0; i < 2000; i++) {
    a.push(i * 2);
    b.push(i * 2 + 1);
    expected.push(i * 2, i * 2 + 1);
  }
  return {
    label: 'Hidden 6 (Interleaved 4k)',
    input: `${a.join(' ')}\n${b.join(' ')}`,
    expectedOutput: `[${expected.join(', ')}]`
  };
}

function makeProblem14Stress(): HiddenTestCase {
  const arr: number[] = [];
  for (let i = 20000; i >= 1; i--) arr.push(i * 10);
  arr.push(1);
  arr.push(1000000000);
  return {
    label: 'Hidden 6 (Large Rally at End)',
    input: arr.join(' '),
    expectedOutput: '999999999'
  };
}

export const HIDDEN_TESTS: Record<number, HiddenTestCase[]> = {
  1: [
    { label: 'Hidden 1', input: '2', expectedOutput: '1' },
    { label: 'Hidden 2', input: '7', expectedOutput: '16' },
    { label: 'Hidden 3', input: '9', expectedOutput: '19' },
    { label: 'Hidden 4', input: '97', expectedOutput: '118' },
    { label: 'Hidden 5 (Longest under 10^6)', input: '837799', expectedOutput: '524' },
    { label: 'Hidden 6 (Max Bound)', input: '1000000', expectedOutput: '152' }
  ],
  2: [
    { label: 'Hidden 1 (Zero Variants)', input: '0 -0 +0', expectedOutput: '0 0' },
    { label: 'Hidden 2 (All Valid Signed)', input: '+100 -50 25 -75 +10', expectedOutput: '10 0' },
    { label: 'Hidden 3 (All Invalid Floats & Signs)', input: '1.0 2.0 -3.5 + - .', expectedOutput: '0 6' },
    { label: 'Hidden 4 (Large Cancelling)', input: '999999999 -999999999 a b c', expectedOutput: '0 3' },
    { label: 'Hidden 5 (All Negative)', input: '-1 -2 -3 -4', expectedOutput: '-10 0' },
    { label: 'Hidden 6 (Mixed Tricky Tokens)', input: '++5 +-3 007 -008 4. 5a', expectedOutput: '-1 4' }
  ],
  3: [
    { label: 'Hidden 1', input: 'level', expectedOutput: 'True' },
    { label: 'Hidden 2', input: 'abca', expectedOutput: 'False' },
    { label: 'Hidden 3 (Even Length)', input: 'abba', expectedOutput: 'True' },
    { label: 'Hidden 4 (Even Mismatch)', input: 'abca', expectedOutput: 'False' },
    { label: 'Hidden 5 (Long Palindrome)', input: 'a'.repeat(200) + 'b' + 'a'.repeat(200), expectedOutput: 'True' },
    { label: 'Hidden 6 (Long Near-Palindrome)', input: 'a'.repeat(199) + 'x' + 'y' + 'a'.repeat(199), expectedOutput: 'False' }
  ],
  4: [
    { label: 'Hidden 1 (Zero Changes)', input: '4\n10 20 30 40\n0', expectedOutput: '10 20 30 40' },
    { label: 'Hidden 2 (Single Element)', input: '1\n-5\n3\n0 10\n0 -100\n0 100', expectedOutput: '-5\n10\n-100\n100' },
    { label: 'Hidden 3 (No-Op Update)', input: '3\n7 8 9\n2\n1 8\n2 0', expectedOutput: '7 8 9\n7 8 9\n7 8 0' },
    { label: 'Hidden 4 (Negatives & Repeated Index)', input: '4\n-1 -2 -3 -4\n4\n0 1\n0 2\n3 4\n1 0', expectedOutput: '-1 -2 -3 -4\n1 -2 -3 -4\n2 -2 -3 -4\n2 -2 -3 4\n2 0 -3 4' },
    { label: 'Hidden 5 (Boundary Values)', input: '5\n100 -100 0 50 -50\n3\n4 100\n0 -100\n2 99', expectedOutput: '100 -100 0 50 -50\n100 -100 0 50 100\n-100 -100 0 50 100\n-100 -100 99 50 100' }
  ],
  5: [
    { label: 'Hidden 1 (Single Element)', input: '1\n7\n3\n6 7 8', expectedOutput: '0\n1\n0' },
    { label: 'Hidden 2 (All Identical)', input: '5\n4 4 4 4 4\n3\n3 4 5', expectedOutput: '0\n5\n0' },
    { label: 'Hidden 3 (Extremes -10^9 to 10^9)', input: '4\n-1000000000 -1000000000 1000000000 1000000000\n3\n-1000000000 0 1000000000', expectedOutput: '2\n0\n2' },
    { label: 'Hidden 4 (All Distinct)', input: '5\n1 3 5 7 9\n5\n1 2 5 9 10', expectedOutput: '1\n0\n1\n1\n0' },
    { label: 'Hidden 5 (Negative Duplicates)', input: '7\n-10 -10 -10 -1 -1 0 0\n4\n-10 -1 0 -5', expectedOutput: '3\n2\n2\n0' },
    makeProblem5Stress()
  ],
  6: [
    { label: 'Hidden 1 (No Broken Steps k=0)', input: '5 0\n', expectedOutput: '8' },
    { label: 'Hidden 2 (Destination Broken)', input: '5 1\n5', expectedOutput: '0' },
    { label: 'Hidden 3 (n=1 Free)', input: '1 0\n', expectedOutput: '1' },
    { label: 'Hidden 4 (n=1 Broken)', input: '1 1\n1', expectedOutput: '0' },
    { label: 'Hidden 5 (Large n=40 with Breaks)', input: '40 2\n15 30', expectedOutput: '12648350' },
    { label: 'Hidden 6 (Max n=50, k=0)', input: '50 0\n', expectedOutput: '20365011074' }
  ],
  7: [
    { label: 'Hidden 1 (Single Negative)', input: '1\n-500', expectedOutput: '-500' },
    { label: 'Hidden 2 (Single Positive)', input: '1\n42', expectedOutput: '42' },
    { label: 'Hidden 3 (All Zeros)', input: '5\n0 0 0 0 0', expectedOutput: '0' },
    { label: 'Hidden 4 (All Positive)', input: '5\n10 20 30 40 50', expectedOutput: '150' },
    { label: 'Hidden 5 (Two Peaks Separated)', input: '8\n5 4 -1 7 8 -100 10 12', expectedOutput: '23' },
    makeProblem7Stress()
  ],
  8: [
    { label: 'Hidden 1 (Single Match)', input: '1\n10\n10', expectedOutput: '10' },
    { label: 'Hidden 2 (Multiple Lexicographic)', input: '5\n5 1 4 2 3\n6', expectedOutput: '1 2 3\n1 5\n2 4' },
    { label: 'Hidden 3 (Target Too Large)', input: '4\n1 2 3 4\n15', expectedOutput: '-1' },
    { label: 'Hidden 4 (Full Set Sum)', input: '4\n10 20 30 40\n100', expectedOutput: '10 20 30 40' },
    { label: 'Hidden 5 (Prefix Ordering)', input: '5\n1 2 3 6 7\n9', expectedOutput: '1 2 6\n2 7\n3 6' },
    { label: 'Hidden 6 (Larger Unsorted)', input: '8\n12 1 8 3 5 2 7 4\n10', expectedOutput: '1 2 3 4\n1 2 7\n1 4 5\n2 3 5\n2 8\n3 7' }
  ],
  9: [
    { label: 'Hidden 1 (n=1)', input: '1', expectedOutput: '1' },
    { label: 'Hidden 2 (n=2)', input: '2', expectedOutput: '0' },
    { label: 'Hidden 3 (n=3)', input: '3', expectedOutput: '0' },
    { label: 'Hidden 4 (n=5)', input: '5', expectedOutput: '10' },
    { label: 'Hidden 5 (n=7)', input: '7', expectedOutput: '40' },
    { label: 'Hidden 6 (Max n=9)', input: '9', expectedOutput: '352' }
  ],
  10: [
    { label: 'Hidden 1 (n=1, k=1)', input: '1 1', expectedOutput: '1 A C' },
    { label: 'Hidden 2 (n=3, k=1)', input: '3 1', expectedOutput: '1 A C' },
    { label: 'Hidden 3 (n=3, k=3)', input: '3 3', expectedOutput: '1 C B' },
    { label: 'Hidden 4 (n=3, k=7)', input: '3 7', expectedOutput: '1 A C' },
    { label: 'Hidden 5 (n=60, k=1)', input: '60 1', expectedOutput: '1 A B' },
    { label: 'Hidden 6 (n=60, Last Move 2^60-1)', input: '60 1152921504606846975', expectedOutput: '1 B C' }
  ],
  11: [
    {
      label: 'Hidden 1 (n=4)',
      input: '4',
      expectedOutput:
        '      *\n    ***\n      *\n  *****\n      *\n    ***\n      *\n*******\n      *\n    ***\n      *\n  *****\n      *\n    ***\n      *'
    },
    {
      label: 'Hidden 2 (n=5)',
      input: '5',
      expectedOutput:
        '        *\n      ***\n        *\n    *****\n        *\n      ***\n        *\n  *******\n        *\n      ***\n        *\n    *****\n        *\n      ***\n        *\n*********\n        *\n      ***\n        *\n    *****\n        *\n      ***\n        *\n  *******\n        *\n      ***\n        *\n    *****\n        *\n      ***\n        *'
    },
    { label: 'Hidden 3 (n=1 Check)', input: '1', expectedOutput: '*' },
    { label: 'Hidden 4 (n=2 Check)', input: '2', expectedOutput: '  *\n***\n  *' },
    { label: 'Hidden 5 (n=3 Check)', input: '3', expectedOutput: '    *\n  ***\n    *\n*****\n    *\n  ***\n    *' }
  ],
  12: [
    { label: 'Hidden 1 (Single <= x)', input: '5\n5', expectedOutput: '1\nTrue' },
    { label: 'Hidden 2 (Single > x)', input: '5\n4', expectedOutput: '0\nTrue' },
    { label: 'Hidden 3 (Already Partitioned)', input: '-10 -5 0 5 10\n0', expectedOutput: '3\nTrue' },
    { label: 'Hidden 4 (Reverse Partitioned)', input: '10 8 6 4 2 0\n4', expectedOutput: '3\nTrue' },
    { label: 'Hidden 5 (Extreme Bounds)', input: '-1000000000 1000000000 0 -1 1\n-1', expectedOutput: '2\nTrue' },
    makeProblem12Stress()
  ],
  13: [
    { label: 'Hidden 1 (Empty A)', input: '\n1 2 3', expectedOutput: '[1, 2, 3]' },
    { label: 'Hidden 2 (Empty B)', input: '-3 0 5\n', expectedOutput: '[-3, 0, 5]' },
    { label: 'Hidden 3 (Both Empty)', input: '\n', expectedOutput: '[]' },
    { label: 'Hidden 4 (All Duplicates)', input: '2 2 2\n2 2', expectedOutput: '[2, 2, 2, 2, 2]' },
    { label: 'Hidden 5 (Disjoint Ranges)', input: '-10 -5 -1\n10 20 30', expectedOutput: '[-10, -5, -1, 10, 20, 30]' },
    makeProblem13Stress()
  ],
  14: [
    { label: 'Hidden 1 (Strictly Increasing)', input: '10 20 30 40 50', expectedOutput: '40' },
    { label: 'Hidden 2 (All Equal)', input: '50 50 50 50', expectedOutput: '0' },
    { label: 'Hidden 3 (Rally at Start)', input: '1 100 50 40 30', expectedOutput: '99' },
    { label: 'Hidden 4 (Multiple Peaks)', input: '50 20 60 10 45 5 50', expectedOutput: '45' },
    { label: 'Hidden 5 (Max Price Range)', input: '1000000000 1 1000000000', expectedOutput: '999999999' },
    makeProblem14Stress()
  ],
  15: [
    { label: 'Hidden 1 (Single Element)', input: '7', expectedOutput: '[7]' },
    {
      label: 'Hidden 2 (All Distinct 3)',
      input: '1 2 3',
      expectedOutput: '[1, 2, 3]\n[1, 3, 2]\n[2, 1, 3]\n[2, 3, 1]\n[3, 1, 2]\n[3, 2, 1]'
    },
    {
      label: 'Hidden 3 (Two Pairs)',
      input: '0 0 1 1',
      expectedOutput: '[0, 0, 1, 1]\n[0, 1, 0, 1]\n[0, 1, 1, 0]\n[1, 0, 0, 1]\n[1, 0, 1, 0]\n[1, 1, 0, 0]'
    },
    {
      label: 'Hidden 4 (Negatives with Repeats)',
      input: '-2 0 -2',
      expectedOutput: '[-2, -2, 0]\n[-2, 0, -2]\n[0, -2, -2]'
    },
    {
      label: 'Hidden 5 (Four Same + One Different)',
      input: '5 5 9 5 5',
      expectedOutput: '[5, 5, 5, 5, 9]\n[5, 5, 5, 9, 5]\n[5, 5, 9, 5, 5]\n[5, 9, 5, 5, 5]\n[9, 5, 5, 5, 5]'
    }
  ],
  16: [
    { label: 'Hidden 1 (n=2)', input: '2', expectedOutput: '1' },
    { label: 'Hidden 2 (n=3)', input: '3', expectedOutput: '1' },
    { label: 'Hidden 3 (n=31)', input: '31', expectedOutput: '4' },
    { label: 'Hidden 4 (n=1024)', input: '1024', expectedOutput: '10' },
    { label: 'Hidden 5 (2^53 - 1 Precision Trap)', input: '9007199254740991', expectedOutput: '52' },
    { label: 'Hidden 6 (Max 10^18)', input: '1000000000000000000', expectedOutput: '59' }
  ],
  17: [
    { label: 'Hidden 1 (n=1)', input: '1', expectedOutput: '1' },
    { label: 'Hidden 2 (All Ones 1023)', input: '1023', expectedOutput: '10' },
    { label: 'Hidden 3 (Power of Two 1024)', input: '1024', expectedOutput: '1' },
    { label: 'Hidden 4 (Alternating Bits 682)', input: '682', expectedOutput: '5' },
    { label: 'Hidden 5 (2^50 - 1)', input: '1125899906842623', expectedOutput: '50' },
    { label: 'Hidden 6 (Large 10^18)', input: '1000000000000000000', expectedOutput: '24' }
  ],
  18: [
    { label: 'Hidden 1 (n=1, k=1)', input: '1\n1', expectedOutput: '1' },
    { label: 'Hidden 2 (k=1)', input: '5\n1', expectedOutput: '1' },
    { label: 'Hidden 3 (k > n)', input: '3\n5', expectedOutput: '0' },
    { label: 'Hidden 4 (n=5, k=3)', input: '5\n3', expectedOutput: '25' },
    { label: 'Hidden 5 (n=7, k=4)', input: '7\n4', expectedOutput: '350' },
    { label: 'Hidden 6 (n=12, k=5)', input: '12\n5', expectedOutput: '1379400' }
  ],
  19: [
    { label: 'Hidden 1 (n=1, k=1)', input: '1\n1', expectedOutput: '1' },
    { label: 'Hidden 2 (Max Packing n=5, k=3)', input: '5\n3', expectedOutput: '1' },
    { label: 'Hidden 3 (Impossible n=5, k=4)', input: '5\n4', expectedOutput: '0' },
    { label: 'Hidden 4 (n=6, k=3)', input: '6\n3', expectedOutput: '4' },
    { label: 'Hidden 5 (n=10, k=4)', input: '10\n4', expectedOutput: '35' },
    { label: 'Hidden 6 (n=25, k=8)', input: '25\n8', expectedOutput: '43758' }
  ],
  20: [
    {
      label: 'Hidden 1 (1x1 Matrix)',
      input: '1 6\n2',
      expectedOutput: '64\nTrue'
    },
    {
      label: 'Hidden 2 (3x3 Identity k=0)',
      input: '3 0\n2 3 4\n5 6 7\n8 9 1',
      expectedOutput: '1 0 0\n0 1 0\n0 0 1\nTrue'
    },
    {
      label: 'Hidden 3 (2x2 Square M^2)',
      input: '2 2\n1 2\n3 4',
      expectedOutput: '7 10\n15 22\nTrue'
    },
    {
      label: 'Hidden 4 (Fibonacci F^10)',
      input: '2 10\n1 1\n1 0',
      expectedOutput: '89 55\n55 34\nTrue'
    },
    {
      label: 'Hidden 5 (3x3 Upper Triangular M^4)',
      input: '3 4\n1 1 0\n0 1 1\n0 0 1',
      expectedOutput: '1 4 6\n0 1 4\n0 0 1\nTrue'
    }
  ],
  21: [
    { label: 'Hidden 1 (Start Blocked)', input: '2 2\n1 0\n0 0', expectedOutput: '0' },
    { label: 'Hidden 2 (End Blocked)', input: '2 2\n0 0\n0 1', expectedOutput: '0' },
    { label: 'Hidden 3 (1x1 Free)', input: '1 1\n0', expectedOutput: '1' },
    { label: 'Hidden 4 (Blocked Wall)', input: '3 3\n0 1 0\n0 1 0\n0 1 0', expectedOutput: '0' },
    { label: 'Hidden 5 (5x5 Open Grid)', input: '5 5\n0 0 0 0 0\n0 0 0 0 0\n0 0 0 0 0\n0 0 0 0 0\n0 0 0 0 0', expectedOutput: '70' },
    {
      label: 'Hidden 6 (6x6 Scattered Obstacles)',
      input: '6 6\n0 0 0 0 1 0\n0 1 0 0 0 0\n0 0 0 1 0 0\n1 0 0 0 0 0\n0 0 1 0 0 0\n0 0 0 0 0 0',
      expectedOutput: '29'
    }
  ],
  22: [
    { label: 'Hidden 1 (T=8)', input: '3 8\n2 3 5', expectedOutput: '2 2 2 2\n2 3 3\n3 5' },
    { label: 'Hidden 2 (Unsorted Input)', input: '4 6\n6 3 2 5', expectedOutput: '2 2 2\n3 3\n6' },
    { label: 'Hidden 3 (Single Divisible)', input: '1 9\n3', expectedOutput: '3 3 3' },
    { label: 'Hidden 4 (Single Non-Divisible)', input: '1 10\n3', expectedOutput: 'NONE' },
    { label: 'Hidden 5 (Target Equals Min Candidate)', input: '3 4\n4 7 9', expectedOutput: '4' },
    { label: 'Hidden 6 (Even Candidates T=10)', input: '4 10\n2 4 6 8', expectedOutput: '2 2 2 2 2\n2 2 2 4\n2 2 6\n2 4 4\n2 8\n4 6' }
  ]
};
