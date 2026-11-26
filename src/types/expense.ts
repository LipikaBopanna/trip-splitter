export interface Member {
  id: string;
  name: string;
}

export type Category =
  | "Food"
  | "Travel"
  | "Stay"
  | "Activities"
  | "Other";

export type EqualSplit = {
  type: "equal";
  memberIds: string[];
};

export type ExactSplit = {
  type: "exact";
  shares: Record<string, number>;
};

export type PercentSplit = {
  type: "percent";
  shares: Record<string, number>;
};

export type Split = EqualSplit | ExactSplit | PercentSplit;

export interface Expense {
  id: string;
  description: string;
  amount: number; // Stored in paise
  paidBy: string;
  date: string;
  category: Category;
  split: Split;
}

export interface ExpenseState {
  members: Member[];
  expenses: Expense[];
}