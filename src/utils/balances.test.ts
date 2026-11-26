import { describe, expect, it } from "vitest";
import { calculateBalances } from "./balances";
import type { Expense, Member } from "../types/expense";

const members: Member[] = [
  { id: "m1", name: "Aarav" },
  { id: "m2", name: "Diya" },
  { id: "m3", name: "Kabir" },
];

describe("calculateBalances", () => {
  it("calculates balances correctly for an equal split", () => {
    const expenses: Expense[] = [
      {
        id: "e1",
        description: "Dinner",
        amount: 10000,
        paidBy: "m1",
        date: "2026-11-26",
        category: "Food",
        split: {
          type: "equal",
          memberIds: ["m1", "m2", "m3"],
        },
      },
    ];

    const balances = calculateBalances(members, expenses);

    expect(balances).toEqual([
      {
        memberId: "m1",
        paid: 10000,
        share: 3334,
        balance: 6666,
      },
      {
        memberId: "m2",
        paid: 0,
        share: 3333,
        balance: -3333,
      },
      {
        memberId: "m3",
        paid: 0,
        share: 3333,
        balance: -3333,
      },
    ]);
  });

  it("ensures total balances always equal zero", () => {
    const expenses: Expense[] = [
      {
        id: "e1",
        description: "Dinner",
        amount: 10000,
        paidBy: "m1",
        date: "2026-11-26",
        category: "Food",
        split: {
          type: "equal",
          memberIds: ["m1", "m2", "m3"],
        },
      },
      {
        id: "e2",
        description: "Taxi",
        amount: 5000,
        paidBy: "m2",
        date: "2026-11-26",
        category: "Travel",
        split: {
          type: "equal",
          memberIds: ["m1", "m2"],
        },
      },
    ];

    const balances = calculateBalances(members, expenses);

    const totalBalance = balances.reduce(
      (total, member) => total + member.balance,
      0,
    );

    expect(totalBalance).toBe(0);
  });
});