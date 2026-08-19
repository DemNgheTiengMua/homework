// ============================================================================
// category.ts — Nghiệp vụ quản lý danh mục (F02).
//
// Các hàm ở đây CHỈ xử lý dữ liệu (thêm/sửa/xóa/tính toán), không đụng tới DOM.
// Việc lưu localStorage và vẽ giao diện do app.ts / ui.ts đảm nhận.
// Tách như vậy giúp code dễ đọc và dễ giải thích (NFR-4).
// ============================================================================

import type { AppData, CategorySpending, Transaction } from "./types";
import { createId } from "./storage";

/**
 * Thêm danh mục mới (F02-1).
 * Ném lỗi (throw) nếu tên rỗng hoặc hạn mức âm — để app.ts bắt và báo cho user
 * (EXTRA-1: xử lý lỗi nhập liệu).
 */
export function addCategory(data: AppData, name: string, limit: number): void {
  const trimmed = name.trim();
  if (trimmed === "") {
    throw new Error("Tên danh mục không được để trống.");
  }
  if (limit < 0 || Number.isNaN(limit)) {
    throw new Error("Hạn mức phải là số không âm.");
  }

  data.categories.push({ id: createId(), name: trimmed, limit });
}

/**
 * Sửa danh mục (F02-2 và F02-4: đổi tên + đổi hạn mức).
 */
export function updateCategory(
  data: AppData,
  id: string,
  name: string,
  limit: number
): void {
  const trimmed = name.trim();
  if (trimmed === "") {
    throw new Error("Tên danh mục không được để trống.");
  }
  if (limit < 0 || Number.isNaN(limit)) {
    throw new Error("Hạn mức phải là số không âm.");
  }

  const category = data.categories.find((c) => c.id === id);
  if (category === undefined) {
    throw new Error("Không tìm thấy danh mục cần sửa.");
  }

  category.name = trimmed;
  category.limit = limit;
}

/**
 * Xóa danh mục (F02-3) CÓ kiểm tra ràng buộc:
 * không cho xóa nếu vẫn còn giao dịch (ở bất kỳ tháng nào) dùng danh mục này.
 */
export function deleteCategory(data: AppData, id: string): void {
  const stillUsed = Object.values(data.transactionsByMonth).some(
    (list) => list.some((t) => t.categoryId === id)
  );

  if (stillUsed) {
    throw new Error(
      "Không thể xóa: danh mục này vẫn còn giao dịch. Hãy xóa giao dịch trước."
    );
  }

  data.categories = data.categories.filter((c) => c.id !== id);
}

/**
 * Tìm tên danh mục theo id (tiện cho việc hiển thị).
 * Trả về "Không rõ" nếu không tìm thấy để giao diện không bị trống.
 */
export function getCategoryName(data: AppData, id: string): string {
  return data.categories.find((c) => c.id === id)?.name ?? "Không rõ";
}

/**
 * Tính "đã chi bao nhiêu" cho từng danh mục trong danh sách giao dịch của 1 tháng.
 * Kết quả dùng để hiển thị danh sách danh mục kèm hạn mức + đã chi (F02-5)
 * và để tô đỏ cảnh báo khi vượt hạn mức (F05-1).
 */
export function calcCategorySpending(
  data: AppData,
  monthTransactions: Transaction[]
): CategorySpending[] {
  return data.categories.map((category) => {
    // Cộng dồn các khoản CHI thuộc danh mục này.
    const spent = monthTransactions
      .filter((t) => t.type === "expense" && t.categoryId === category.id)
      .reduce((sum, t) => sum + t.amount, 0);

    const isOverLimit = category.limit > 0 && spent > category.limit;

    return { category, spent, isOverLimit };
  });
}
