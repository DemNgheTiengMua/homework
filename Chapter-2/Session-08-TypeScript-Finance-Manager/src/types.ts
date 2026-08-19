// ============================================================================
// types.ts — Định nghĩa các kiểu dữ liệu (interface / type) dùng chung.
//
// Đây là "trái tim" của phần TypeScript nghiêm ngặt (NFR-1):
// mọi dữ liệu trong app đều đi qua các interface này, không dùng `any`.
// ============================================================================

/**
 * Loại giao dịch: thu tiền (income) hoặc chi tiền (expense).
 * Dùng union type thay vì string tự do để tránh gõ sai ("incom", "Income"...).
 */
export type TransactionType = "income" | "expense";

/**
 * Một danh mục chi tiêu, ví dụ: Ăn uống, Xăng xe, Lương...
 * - limit = 0 nghĩa là danh mục này không đặt hạn mức.
 * - Danh mục dùng chung cho mọi tháng (chỉ giao dịch mới tách theo tháng).
 */
export interface Category {
  id: string; // mã định danh duy nhất
  name: string; // tên hiển thị
  limit: number; // hạn mức chi tiêu (VND). 0 = không giới hạn
}

/**
 * Một giao dịch thu/chi.
 * amount luôn là số DƯƠNG; loại thu/chi nằm ở trường `type`.
 * (Cách này dễ hiểu và kiểm tra hơn là dùng số âm/dương lẫn lộn.)
 */
export interface Transaction {
  id: string;
  amount: number; // số tiền, luôn > 0
  type: TransactionType; // "income" | "expense"
  categoryId: string; // trỏ tới Category.id
  note: string; // ghi chú (có thể rỗng)
  date: string; // ngày theo định dạng ISO "YYYY-MM-DD"
}

/**
 * Toàn bộ dữ liệu của app được lưu trong localStorage dưới dạng đối tượng này.
 * - categories: danh sách danh mục (dùng chung mọi tháng).
 * - transactionsByMonth: giao dịch tách riêng theo từng tháng.
 *     key là "YYYY-MM" (ví dụ "2026-08"), value là mảng giao dịch của tháng đó.
 *     => Đây chính là yêu cầu F04-3: "dữ liệu các tháng lưu riêng".
 * - totalBudget: ngân sách tổng mỗi tháng, dùng cho thanh tiến trình ở Dashboard.
 */
export interface AppData {
  categories: Category[];
  transactionsByMonth: Record<string, Transaction[]>;
  totalBudget: number;
}

/**
 * Kết quả tính "đã chi bao nhiêu" cho một danh mục trong tháng đang chọn.
 * Dùng để vẽ danh sách danh mục và cảnh báo vượt hạn mức (F05-1).
 */
export interface CategorySpending {
  category: Category;
  spent: number; // tổng đã chi cho danh mục này trong tháng
  isOverLimit: boolean; // true nếu spent > limit (và limit > 0)
}
