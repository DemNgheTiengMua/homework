// ============================================================================
// transaction.ts — Nghiệp vụ quản lý giao dịch (F03) + tính toán tổng (F01).
//
// Cũng chỉ xử lý dữ liệu thuần, không đụng DOM.
// ============================================================================

import type { AppData, Transaction, TransactionType } from "./types";
import { createId } from "./storage";

/**
 * Lấy mảng giao dịch của một tháng.
 * Nếu tháng đó chưa có dữ liệu -> trả mảng rỗng (không tự tạo key thừa).
 */
export function getMonthTransactions(
  data: AppData,
  monthKey: string
): Transaction[] {
  return data.transactionsByMonth[monthKey] ?? [];
}

/**
 * Thêm giao dịch mới vào đúng tháng dựa theo ngày của giao dịch (F03-1, F03-2).
 * Có kiểm tra dữ liệu nhập (EXTRA-1):
 *   - số tiền phải > 0
 *   - phải chọn danh mục
 *   - phải có ngày hợp lệ
 */
export function addTransaction(
  data: AppData,
  input: {
    amount: number;
    type: TransactionType;
    categoryId: string;
    note: string;
    date: string;
  }
): void {
  if (Number.isNaN(input.amount) || input.amount <= 0) {
    throw new Error("Số tiền phải là số lớn hơn 0.");
  }
  if (input.categoryId === "") {
    throw new Error("Vui lòng chọn danh mục.");
  }
  if (input.date === "") {
    throw new Error("Vui lòng chọn ngày giao dịch.");
  }

  const transaction: Transaction = {
    id: createId(),
    amount: input.amount,
    type: input.type,
    categoryId: input.categoryId,
    note: input.note.trim(),
    date: input.date,
  };

  // Tháng của giao dịch lấy từ chính ngày nhập (dạng "YYYY-MM").
  const monthKey = input.date.slice(0, 7);

  // Nếu tháng này chưa có mảng thì tạo mới rồi thêm vào.
  const list = data.transactionsByMonth[monthKey] ?? [];
  list.push(transaction);
  data.transactionsByMonth[monthKey] = list;
}

/**
 * Xóa một giao dịch theo id, trong tháng chỉ định (F03-4).
 */
export function deleteTransaction(
  data: AppData,
  monthKey: string,
  id: string
): void {
  const list = data.transactionsByMonth[monthKey];
  if (list === undefined) return;

  data.transactionsByMonth[monthKey] = list.filter((t) => t.id !== id);
}

/**
 * Sắp xếp giao dịch theo thời gian GIẢM DẦN — mới nhất lên đầu (F03-3).
 * Tạo mảng mới (slice) để không làm thay đổi thứ tự mảng gốc.
 */
export function sortByDateDesc(transactions: Transaction[]): Transaction[] {
  return transactions
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date));
}

/** Tổng thu của một tháng (F01-2). */
export function totalIncome(transactions: Transaction[]): number {
  return transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
}

/** Tổng chi của một tháng (F01-2). */
export function totalExpense(transactions: Transaction[]): number {
  return transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
}

/** Số dư = tổng thu - tổng chi (F01-1). */
export function balance(transactions: Transaction[]): number {
  return totalIncome(transactions) - totalExpense(transactions);
}
