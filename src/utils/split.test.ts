import { describe, expect, it } from "vitest";
import { calculateShares } from "./split";
import type { Expense } from "../types/expense";

describe("calculateShares", () => {
  it("splits equally between members", () => {
    const expense: Expense = {
      id: "1",
      description: "Dinner",
      amount: 9000,
      paidBy: "m1",
      date: "2026-11-26",
      category: "Food",
      split: {
        type: "equal",
        memberIds: ["m1", "m2", "m3"],
      },
    };

    expect(calculateShares(expense)).toEqual({
      m1: 3000,
      m2: 3000,
      m3: 3000,
    });
  });

  it("distributes leftover paise deterministically", () => {
    const expense: Expense = {
      id: "2",
      description: "Test",
      amount: 10000,
      paidBy: "m1",
      date: "2026-11-26",
      category: "Food",
      split: {
        type: "equal",
        memberIds: ["m1", "m2", "m3"],
      },
    };

    expect(calculateShares(expense)).toEqual({
      m1: 3334,
      m2: 3333,
      m3: 3333,
    });
  });

  it("returns exact shares", () => {
    const expense: Expense = {
      id: "3",
      description: "Exact",
      amount: 10000,
      paidBy: "m1",
      date: "2026-11-26",
      category: "Food",
      split: {
        type: "exact",
        shares: {
          m1: 5000,
          m2: 3000,
          m3: 2000,
        },
      },
    };

    expect(calculateShares(expense)).toEqual({
      m1: 5000,
      m2: 3000,
      m3: 2000,
    });
  });

  it("calculates percentage shares", () => {
    const expense: Expense = {
      id: "4",
      description: "Percentage",
      amount: 10000,
      paidBy: "m1",
      date: "2026-11-26",
      category: "Food",
      split: {
        type: "percent",
        shares: {
          m1: 50,
          m2: 30,
          m3: 20,
        },
      },
    };

    expect(calculateShares(expense)).toEqual({
      m1: 5000,
      m2: 3000,
      m3: 2000,
    });
  });
});