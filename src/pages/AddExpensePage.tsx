
import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { addExpense } from "../features/expenses/expensesSlice";
import { parseMoneyToPaise } from "../utils/money";
import type { Category, Split } from "../types/expense";

const categories: Category[] = [
  "Food",
  "Travel",
  "Stay",
  "Activities",
  "Other",
];

type SplitMode = "equal" | "exact" | "percent";

function getTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export default function AddExpensePage() {
  const members = useAppSelector((state) => state.expenses.members);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState(members[0]?.id ?? "");
  const [date, setDate] = useState(getTodayDate());
  const [category, setCategory] = useState<Category>("Food");

  const [splitMode, setSplitMode] = useState<SplitMode>("equal");

  const [selectedMembers, setSelectedMembers] = useState<string[]>(
    members.map((member) => member.id),
  );

  const [exactShares, setExactShares] = useState<Record<string, string>>({});
  const [percentShares, setPercentShares] = useState<Record<string, string>>(
    {},
  );

  const [error, setError] = useState("");

  function toggleMember(memberId: string) {
    setSelectedMembers((previous) =>
      previous.includes(memberId)
        ? previous.filter((id) => id !== memberId)
        : [...previous, memberId],
    );
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const trimmedDescription = description.trim();
    const amountInPaise = parseMoneyToPaise(amount);

    // Basic validation
    if (!trimmedDescription) {
      setError("Description is required.");
      return;
    }

    if (trimmedDescription.length > 60) {
      setError("Description must be 60 characters or less.");
      return;
    }

    if (!amount || amountInPaise <= 0) {
      setError("Amount must be greater than ₹0.");
      return;
    }

    if (amountInPaise > 100000000) {
      setError("Amount cannot exceed ₹10,00,000.");
      return;
    }

    if (!paidBy) {
      setError("Please select who paid.");
      return;
    }

    if (!date) {
      setError("Date is required.");
      return;
    }

    if (date > getTodayDate()) {
      setError("Expense date cannot be in the future.");
      return;
    }

    if (selectedMembers.length === 0) {
      setError("Select at least one person to split the expense.");
      return;
    }

    let split: Split;

    // Equal split
    if (splitMode === "equal") {
      split = {
        type: "equal",
        memberIds: selectedMembers,
      };
    }

    // Exact split
    else if (splitMode === "exact") {
      const shares: Record<string, number> = {};

      for (const memberId of selectedMembers) {
        const value = exactShares[memberId];

        if (value === undefined || value.trim() === "") {
          setError("Enter an amount for every selected member.");
          return;
        }

        const shareInPaise = parseMoneyToPaise(value);

        if (Number(value) < 0) {
          setError("Amounts cannot be negative.");
          return;
        }

        shares[memberId] = shareInPaise;
      }

      const totalShares = Object.values(shares).reduce(
        (total, share) => total + share,
        0,
      );

      if (totalShares !== amountInPaise) {
        setError(
          "Exact shares must add up to the total expense amount.",
        );
        return;
      }

      split = {
        type: "exact",
        shares,
      };
    }

    // Percentage split
    else {
      const shares: Record<string, number> = {};

      for (const memberId of selectedMembers) {
        const value = percentShares[memberId];

        if (value === undefined || value.trim() === "") {
          setError("Enter a percentage for every selected member.");
          return;
        }

        const percentage = Number(value);

        if (!Number.isFinite(percentage) || percentage < 0 || percentage > 100) {
          setError("Percentages must be between 0 and 100.");
          return;
        }

        if (!/^\d+(\.\d{1,2})?$/.test(value)) {
          setError("Percentages can have a maximum of 2 decimal places.");
          return;
        }

        shares[memberId] = percentage;
      }

      const totalPercentage = Object.values(shares).reduce(
        (total, percentage) => total + percentage,
        0,
      );

      if (Math.round(totalPercentage * 100) !== 10000) {
        setError("Percentages must add up to exactly 100%.");
        return;
      }

      split = {
        type: "percent",
        shares,
      };
    }

    // Create and save the expense
    const newExpense = {
      id: crypto.randomUUID(),
      description: trimmedDescription,
      amount: amountInPaise,
      paidBy,
      date,
      category,
      split,
    };

    dispatch(addExpense(newExpense));

    navigate("/");
  }

  return (
    <main className="page-container">
      <div className="page-heading">
        <h1>Add Expense</h1>
        <p>Add a shared expense for your trip.</p>
      </div>

      <form className="expense-form" onSubmit={handleSubmit}>
        {/* Description */}
        <div className="form-group">
          <label htmlFor="description">Description</label>

          <input
            id="description"
            type="text"
            placeholder="e.g. Dinner at restaurant"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            maxLength={60}
            required
          />

          <small>{description.length}/60 characters</small>
        </div>

        {/* Amount */}
        <div className="form-group">
          <label htmlFor="amount">Amount (₹)</label>

          <input
            id="amount"
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            min="0.01"
            max="1000000"
            step="0.01"
            required
          />
        </div>

        {/* Paid by */}
        <div className="form-group">
          <label htmlFor="paidBy">Paid by</label>

          <select
            id="paidBy"
            value={paidBy}
            onChange={(event) => setPaidBy(event.target.value)}
            required
          >
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </select>
        </div>

        {/* Date */}
        <div className="form-group">
          <label htmlFor="date">Date</label>

          <input
            id="date"
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            max={getTodayDate()}
            required
          />
        </div>

        {/* Category */}
        <div className="form-group">
          <label htmlFor="category">Category</label>

          <select
            id="category"
            value={category}
            onChange={(event) =>
              setCategory(event.target.value as Category)
            }
          >
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        {/* Split mode */}
        <div className="form-group">
          <label>Split type</label>

          <div className="split-options">
            <button
              type="button"
              className={
                splitMode === "equal"
                  ? "split-option active"
                  : "split-option"
              }
              onClick={() => setSplitMode("equal")}
            >
              Equally
            </button>

            <button
              type="button"
              className={
                splitMode === "exact"
                  ? "split-option active"
                  : "split-option"
              }
              onClick={() => setSplitMode("exact")}
            >
              Exact amounts
            </button>

            <button
              type="button"
              className={
                splitMode === "percent"
                  ? "split-option active"
                  : "split-option"
              }
              onClick={() => setSplitMode("percent")}
            >
              Percentages
            </button>
          </div>
        </div>

        {/* Members */}
        <div className="form-group">
          <label>Split between</label>

          <div className="member-selection">
            {members.map((member) => (
              <label key={member.id} className="member-checkbox">
                <input
                  type="checkbox"
                  checked={selectedMembers.includes(member.id)}
                  onChange={() => toggleMember(member.id)}
                />

                <span>{member.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Exact amounts */}
        {splitMode === "exact" && (
          <div className="form-group">
            <label>Amount each person owes (₹)</label>

            {selectedMembers.map((memberId) => {
              const member = members.find(
                (item) => item.id === memberId,
              );

              return (
                <div className="share-input" key={memberId}>
                  <label htmlFor={`exact-${memberId}`}>
                    {member?.name}
                  </label>

                  <input
                    id={`exact-${memberId}`}
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={exactShares[memberId] ?? ""}
                    onChange={(event) =>
                      setExactShares((previous) => ({
                        ...previous,
                        [memberId]: event.target.value,
                      }))
                    }
                  />
                </div>
              );
            })}
          </div>
        )}

        {/* Percentage amounts */}
        {splitMode === "percent" && (
          <div className="form-group">
            <label>Percentage share for each person (%)</label>

            {selectedMembers.map((memberId) => {
              const member = members.find(
                (item) => item.id === memberId,
              );

              return (
                <div className="share-input" key={memberId}>
                  <label htmlFor={`percent-${memberId}`}>
                    {member?.name}
                  </label>

                  <input
                    id={`percent-${memberId}`}
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    placeholder="0"
                    value={percentShares[memberId] ?? ""}
                    onChange={(event) =>
                      setPercentShares((previous) => ({
                        ...previous,
                        [memberId]: event.target.value,
                      }))
                    }
                  />
                </div>
              );
            })}
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="form-error" role="alert">
            {error}
          </div>
        )}

        {/* Buttons */}
        <div className="form-actions">
          <Link to="/" className="cancel-button">
            Cancel
          </Link>

          <button type="submit" className="submit-button">
            Add Expense
          </button>
        </div>
      </form>
    </main>
  );
}
