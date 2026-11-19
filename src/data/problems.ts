import type { Problem } from '../types.ts';
import { PROBLEMS_PART_1 } from './problemsPart1.ts';
import { PROBLEMS_PART_2 } from './problemsPart2.ts';

export const PROBLEMS: Problem[] = [...PROBLEMS_PART_1, ...PROBLEMS_PART_2];

export function getProblemById(id: number): Problem | undefined {
  return PROBLEMS.find((p) => p.id === id);
}
