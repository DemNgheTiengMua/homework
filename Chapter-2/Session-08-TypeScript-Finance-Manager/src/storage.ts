// ============================================================================
// storage.ts — Đọc/ghi dữ liệu vào localStorage + tạo dữ liệu mẫu lần đầu.
//
// Đáp ứng: NFR-3 (tự động lưu sau mỗi thay đổi), NFR-7 (seed dữ liệu mẫu),
//          F04-3 (mỗi tháng lưu riêng trong transactionsByMonth).
// ============================================================================

import type { AppData, Category, Transaction } from "./types";

// Khóa lưu trong localStorage. Đổi tên khóa = coi như dữ liệu mới.
const STORAGE_KEY = "e-wallet-data-v1";

/**
 * Tạo id ngẫu nhiên đơn giản (đủ dùng cho app cá nhân, không cần thư viện).
 * crypto.randomUUID có sẵn trên trình duyệt hiện đại.
 */
export function createId(): string {
  return crypto.randomUUID();
}

/**
 * Chuyển một đối tượng Date thành khóa tháng "YYYY-MM".
 * Ví dụ: Date(2026, 7, 15) -> "2026-08" (tháng trong JS đếm từ 0).
 */
export function toMonthKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

/**
 * Dữ liệu mẫu khởi tạo khi người dùng mở app lần đầu (localStorage trống).
 * Có sẵn 2 tháng để bảng tổng hợp (F05-2) có thể so sánh ngay.
 */
function createSeedData(): AppData {
  const foodId = createId();
  const transportId = createId();
  const shoppingId = createId();
  const billId = createId();
  const salaryId = createId();

  const categories: Category[] = [
    { id: salaryId, name: "Lương", limit: 0 },
    { id: foodId, name: "Ăn uống", limit: 3_000_000 },
    { id: transportId, name: "Xăng xe", limit: 1_000_000 },
    { id: shoppingId, name: "Mua sắm", limit: 2_000_000 },
    { id: billId, name: "Hóa đơn", limit: 1_500_000 },
  ];

  // Lấy tháng hiện tại và tháng trước để có 2 mốc dữ liệu.
  const now = new Date();
  const thisMonth = toMonthKey(now);
  const prevMonth = toMonthKey(new Date(now.getFullYear(), now.getMonth() - 1, 1));

  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const pmDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const py = pmDate.getFullYear();
  const pm = String(pmDate.getMonth() + 1).padStart(2, "0");

  const transactionsByMonth: Record<string, Transaction[]> = {
    [prevMonth]: [
      { id: createId(), amount: 15_000_000, type: "income", categoryId: salaryId, note: "Lương tháng trước", date: `${py}-${pm}-05` },
      { id: createId(), amount: 2_500_000, type: "expense", categoryId: foodId, note: "Ăn uống cả tháng", date: `${py}-${pm}-20` },
      { id: createId(), amount: 900_000, type: "expense", categoryId: transportId, note: "Đổ xăng", date: `${py}-${pm}-18` },
    ],
    [thisMonth]: [
      { id: createId(), amount: 15_000_000, type: "income", categoryId: salaryId, note: "Lương tháng này", date: `${y}-${m}-05` },
      { id: createId(), amount: 3_200_000, type: "expense", categoryId: foodId, note: "Ăn ngoài nhiều", date: `${y}-${m}-12` },
      { id: createId(), amount: 500_000, type: "expense", categoryId: transportId, note: "Đổ xăng", date: `${y}-${m}-08` },
      { id: createId(), amount: 1_800_000, type: "expense", categoryId: shoppingId, note: "Mua áo quần", date: `${y}-${m}-15` },
    ],
  };

  return { categories, transactionsByMonth, totalBudget: 10_000_000 };
}

/**
 * Đọc toàn bộ dữ liệu từ localStorage.
 * Nếu chưa có (lần đầu) hoặc dữ liệu hỏng -> tạo seed và lưu lại luôn.
 */
export function loadData(): AppData {
  const raw = localStorage.getItem(STORAGE_KEY);

  if (raw === null) {
    const seed = createSeedData();
    saveData(seed);
    return seed;
  }

  try {
    // JSON.parse trả về `any`, nên ta ép kiểu về AppData một cách có kiểm soát.
    const parsed = JSON.parse(raw) as AppData;
    return parsed;
  } catch {
    // Dữ liệu hỏng -> quay về seed để app không bị crash (EXTRA-3).
    const seed = createSeedData();
    saveData(seed);
    return seed;
  }
}

/**
 * Ghi toàn bộ dữ liệu xuống localStorage.
 * Được gọi sau MỌI thao tác thêm/sửa/xóa => tự động lưu (NFR-3).
 */
export function saveData(data: AppData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
