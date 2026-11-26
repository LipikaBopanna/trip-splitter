import type { Expense, Member } from "../types/expense";
import { calculateShares } from "./split";

export interface MemberBalance {
  memberId: string;
  paid: number;
  share: number;
  balance: number;
}

export function calculateBalances(
  members: Member[],
  expenses: Expense[],
): MemberBalance[] {
  const balances = new Map<string, MemberBalance>();

  members.forEach((member) => {
    balances.set(member.id, {
      memberId: member.id,
      paid: 0,
      share: 0,
      balance: 0,
    });
  });

  expenses.forEach((expense) => {
    const payer = balances.get(expense.paidBy);

    if (payer) {
      payer.paid += expense.amount;
    }

    const shares = calculateShares(expense);

    Object.entries(shares).forEach(([memberId, share]) => {
      const memberBalance = balances.get(memberId);

      if (memberBalance) {
        memberBalance.share += share;
      }
    });
  });

  return members.map((member) => {
    const balance = balances.get(member.id);

    if (!balance) {
      return {
        memberId: member.id,
        paid: 0,
        share: 0,
        balance: 0,
      };
    }

    balance.balance = balance.paid - balance.share;

    return balance;
  });
}