
import { useState } from "react";
import { useAppSelector, useAppDispatch } from "../app/hooks";
import { deleteExpense } from "../features/expenses/expensesSlice";
import { calculateBalances } from "../utils/balances";
import { calculateShares } from "../utils/split";
import { formatMoney } from "../utils/money";
import type { Category } from "../types/expense";

const categories: Category[] = [
  "Food",
  "Travel",
  "Stay",
  "Activities",
  "Other",
];

const categoryIcons: Record<Category, string> = {
  Food: "🍕",
  Travel: "🚕",
  Stay: "🏨",
  Activities: "🎟️",
  Other: "💳",
};

export default function ExpensesPage() {
  const dispatch = useAppDispatch();

  const { members, expenses } = useAppSelector(
    (state) => state.expenses,
  );

  const [filter, setFilter] = useState("All");

  const filteredExpenses = expenses
    .filter((expense) => filter === "All" || expense.category === filter)
    .sort((a, b) => b.date.localeCompare(a.date));

  const total = filteredExpenses.reduce(
    (sum, expense) => sum + expense.amount,
    0,
  );

  const balances = calculateBalances(members, expenses);

  function handleDelete(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this expense?",
    );

    if (confirmed) {
      dispatch(deleteExpense(id));
    }
  }

  function getMemberName(id: string) {
    return members.find((member) => member.id === id)?.name ?? "Unknown";
  }

  function getInitials(name: string) {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }

  function getSplitLabel(expense: (typeof expenses)[number]) {
    const shares = calculateShares(expense);

    if (expense.split.type === "equal") {
      return `Equally, ${expense.split.memberIds.length} people`;
    }

    if (expense.split.type === "exact") {
      return `Exact, ${Object.keys(shares).length} people`;
    }

    return `Percentages, ${Object.keys(shares).length} people`;
  }

  return (
    <main className="page-container">
      <header className="dashboard-hero">
        <div className="hero-content">
          <div className="hero-eyebrow">
            <span className="hero-dot"></span>
            YOUR TRIP DASHBOARD
          </div>

          <h1>Every trip has a story.<br />Every expense has a place.</h1>

          <p>
            Keep your group expenses organized, track balances,
            and make settling up effortless.
          </p>
        </div>

        <div className="hero-decoration">
          <div className="hero-circle hero-circle-one"></div>
          <div className="hero-circle hero-circle-two"></div>
          <div className="hero-card">
            <span>✈️</span>
            <strong>Travel together</strong>
            <small>Split smarter. Stress less.</small>
          </div>
        </div>
      </header>

      <section className="balances-section">
        <div className="section-title">
          <div>
            <h2>Your group's balance</h2>
            <p>Who's owed and who's settling up</p>
          </div>
        </div>

        <div className="balance-grid">
          {balances.map((balance, index) => {
            const member = members.find(
              (item) => item.id === balance.memberId,
            );

            const name = member?.name ?? "Unknown";

            return (
              <article
                className={`balance-card balance-card-${index % 5}`}
                key={balance.memberId}
              >
                <div className="balance-card-top">
                  <div className={`member-avatar avatar-${index % 5}`}>
                    {getInitials(name)}
                  </div>

                  <h3>{name}</h3>
                </div>

                {balance.balance > 0 ? (
                  <div className="balance-status positive">
                    <span className="balance-status-label">Gets back</span>
                    <strong>{formatMoney(balance.balance)}</strong>
                  </div>
                ) : balance.balance < 0 ? (
                  <div className="balance-status negative">
                    <span className="balance-status-label">Owes</span>
                    <strong>{formatMoney(Math.abs(balance.balance))}</strong>
                  </div>
                ) : (
                  <div className="balance-status neutral">
                    <span className="balance-status-label">Status</span>
                    <strong>Settled up ✓</strong>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </section>

      <section className="expenses-section">
        <div className="section-heading">
          <div className="section-title">
            <div>
              <h2>Recent expenses</h2>
              <p>Your group's spending activity</p>
            </div>
          </div>

          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            aria-label="Filter by category"
          >
            <option value="All">All Categories</option>

            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {filteredExpenses.length === 0 ? (
          <div className="empty-state">
            <h3>No expenses found</h3>
            <p>There are no expenses in this category.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Paid by</th>
                  <th>Amount</th>
                  <th>Split</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredExpenses.map((expense) => (
                  <tr key={expense.id}>
                    <td>{expense.date}</td>

                    <td className="expense-description">
                      <strong>{expense.description}</strong>
                    </td>

                    <td>
                      <span
                        className={`category-badge category-${expense.category.toLowerCase()}`}
                      >
                        <span>{categoryIcons[expense.category]}</span>
                        {expense.category}
                      </span>
                    </td>

                    <td>{getMemberName(expense.paidBy)}</td>

                    <td className="expense-amount">
                      {formatMoney(expense.amount)}
                    </td>

                    <td>
                      <span className="split-label">
                        {getSplitLabel(expense)}
                      </span>
                    </td>

                    <td>
                      <button
                        className="delete-button"
                        onClick={() => handleDelete(expense.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="total-section">
          <div>
            <span className="total-label">Total expenses shown</span>
            <small>
              {filteredExpenses.length}{" "}
              {filteredExpenses.length === 1 ? "expense" : "expenses"}
            </small>
          </div>

          <strong>{formatMoney(total)}</strong>
        </div>
      </section>
    </main>
  );
}
