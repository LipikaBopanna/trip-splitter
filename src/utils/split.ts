import type { Expense } from "../types/expense";

export function calculateShares(expense: Expense): Record<string, number> {
  const { amount, split } = expense;

  if (split.type === "exact") {
    return split.shares;
  }

  if (split.type === "equal") {
    const members = split.memberIds;

    if (members.length === 0) {
      return {};
    }

    const baseShare = Math.floor(amount / members.length);
    const remainder = amount % members.length;

    return Object.fromEntries(
      members.map((memberId, index) => [
        memberId,
        baseShare + (index < remainder ? 1 : 0),
      ]),
    );
  }

  // Percentage split: calculate each share in paise.
  const entries = Object.entries(split.shares).map(
    ([memberId, percentage]) => {
      const exactShare = (amount * percentage) / 100;

      return {
        memberId,
        floorShare: Math.floor(exactShare),
        remainder: exactShare - Math.floor(exactShare),
      };
    },
  );

  const allocated = entries.reduce(
    (total, entry) => total + entry.floorShare,
    0,
  );

  const remainingPaise = amount - allocated;

  // Give leftover paise to members with the largest fractional remainder.
  const sorted = [...entries].sort(
    (a, b) => b.remainder - a.remainder,
  );

  const extraPaise = new Map<string, number>();

  sorted.forEach((entry, index) => {
    extraPaise.set(
      entry.memberId,
      index < remainingPaise ? 1 : 0,
    );
  });

  return Object.fromEntries(
    entries.map((entry) => [
      entry.memberId,
      entry.floorShare + (extraPaise.get(entry.memberId) ?? 0),
    ]),
  );
}