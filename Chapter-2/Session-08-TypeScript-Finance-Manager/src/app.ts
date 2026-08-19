// ============================================================================
// app.ts — Bộ điều khiển (controller). Ghép mọi thứ lại:
//   1. Đọc dữ liệu (storage) →
//   2. Tính toán (transaction / category) →
//   3. Vẽ giao diện (ui) →
//   4. Lắng nghe sự kiện người dùng → cập nhật dữ liệu → lưu → vẽ lại.
//
// Đây là file duy nhất "biết" cả dữ liệu lẫn DOM; các file kia chỉ làm 1 việc.
// ============================================================================

import type { AppData, TransactionType } from "./types";
import { loadData, saveData, toMonthKey } from "./storage";
import {
  addTransaction,
  deleteTransaction,
  getMonthTransactions,
  sortByDateDesc,
  totalIncome,
  totalExpense,
  balance,
} from "./transaction";
import {
  addCategory,
  updateCategory,
  deleteCategory,
  calcCategorySpending,
} from "./category";
import { renderApp, type ViewModel } from "./ui";

// ----- Trạng thái của ứng dụng (chỉ 3 biến) -----
let data: AppData = loadData(); // toàn bộ dữ liệu, đọc 1 lần khi mở app
let selectedMonth: string = toMonthKey(new Date()); // tháng đang xem
let draftType: TransactionType = "expense"; // Thu/Chi đang chọn ở form

const root = document.getElementById("app");
if (root === null) {
  throw new Error("Không tìm thấy phần tử #app trong index.html");
}

/**
 * Gom dữ liệu đã tính thành ViewModel rồi gọi ui.renderApp để vẽ lại toàn bộ.
 * Cách "vẽ lại tất cả" này đơn giản, dễ hiểu và luôn đồng bộ với dữ liệu.
 */
function render(): void {
  const monthTx = getMonthTransactions(data, selectedMonth);

  // Bảng tổng hợp: mỗi tháng có dữ liệu là một dòng, sắp xếp mới → cũ.
  const summaryRows = Object.keys(data.transactionsByMonth)
    .sort((a, b) => b.localeCompare(a))
    .map((monthKey) => {
      const list = data.transactionsByMonth[monthKey] ?? [];
      return {
        monthKey,
        income: totalIncome(list),
        expense: totalExpense(list),
      };
    });

  const vm: ViewModel = {
    data,
    selectedMonth,
    monthTransactions: sortByDateDesc(monthTx),
    income: totalIncome(monthTx),
    expense: totalExpense(monthTx),
    balance: balance(monthTx),
    totalBudget: data.totalBudget,
    categorySpending: calcCategorySpending(data, monthTx),
    draftType,
    summaryRows,
  };

  renderApp(root as HTMLElement, vm);

  // Sau mỗi lần vẽ, đặt sẵn ngày = hôm nay cho ô nhập ngày (tiện thao tác).
  const dateInput = document.getElementById("tx-date");
  if (dateInput instanceof HTMLInputElement) {
    dateInput.value = new Date().toISOString().slice(0, 10);
  }
}

/** Lưu xuống localStorage rồi vẽ lại — gọi sau mỗi thay đổi (NFR-3). */
function saveAndRender(): void {
  saveData(data);
  render();
}

/** Lấy giá trị 1 ô input theo id, ép kiểu an toàn (không dùng any). */
function getInput(id: string): HTMLInputElement {
  const el = document.getElementById(id);
  if (!(el instanceof HTMLInputElement)) {
    throw new Error(`Không tìm thấy input #${id}`);
  }
  return el;
}

// ============================================================================
// Lắng nghe sự kiện bằng "event delegation": gắn 1 listener lên #app.
// Vì mỗi lần render lại tạo DOM mới, cách này gọn hơn là gắn cho từng nút.
// ============================================================================

// --- Sự kiện CLICK (nút Thu/Chi, xóa giao dịch, sửa/xóa danh mục) ---
root.addEventListener("click", (event) => {
  const target = event.target as HTMLElement;
  const button = target.closest("button");
  if (button === null) return;

  // Bật/tắt loại Thu / Chi ở form giao dịch.
  const type = button.dataset.type;
  if (type === "income" || type === "expense") {
    draftType = type;
    render();
    return;
  }

  const action = button.dataset.action;
  const id = button.dataset.id;
  if (action === undefined || id === undefined) return;

  // Xóa giao dịch (F03-4): xóa xong dashboard & danh mục tự cập nhật vì render lại.
  if (action === "delete-tx") {
    deleteTransaction(data, selectedMonth, id);
    saveAndRender();
    return;
  }

  // Xóa danh mục (F02-3): có kiểm tra ràng buộc trong deleteCategory.
  if (action === "delete-cat") {
    try {
      deleteCategory(data, id);
      saveAndRender();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Không thể xóa danh mục.");
    }
    return;
  }

  // Sửa danh mục (F02-2, F02-4): dùng prompt đơn giản để nhập tên & hạn mức mới.
  if (action === "edit-cat") {
    const category = data.categories.find((c) => c.id === id);
    if (category === undefined) return;

    const newName = prompt("Tên danh mục:", category.name);
    if (newName === null) return; // người dùng bấm Hủy

    const newLimitRaw = prompt("Hạn mức (₫), nhập 0 nếu không giới hạn:", String(category.limit));
    if (newLimitRaw === null) return;

    try {
      updateCategory(data, id, newName, Number(newLimitRaw));
      saveAndRender();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Không thể sửa danh mục.");
    }
  }
});

// --- Sự kiện CHANGE: đổi tháng ở Month Picker (F04-1, F04-2) ---
root.addEventListener("change", (event) => {
  const target = event.target as HTMLElement;
  if (target.id === "month-select" && target instanceof HTMLSelectElement) {
    selectedMonth = target.value;
    render(); // chỉ đổi góc nhìn, dữ liệu không đổi nên không cần lưu
  }
});

// --- Sự kiện SUBMIT: thêm giao dịch / thêm danh mục ---
root.addEventListener("submit", (event) => {
  event.preventDefault(); // chặn form tải lại trang
  const form = event.target as HTMLElement;

  // Thêm giao dịch (F03-1).
  if (form.id === "tx-form") {
    const errorEl = document.getElementById("tx-error");
    try {
      addTransaction(data, {
        amount: Number(getInput("tx-amount").value),
        type: draftType,
        categoryId: (document.getElementById("tx-category") as HTMLSelectElement).value,
        note: getInput("tx-note").value,
        date: getInput("tx-date").value,
      });
      saveAndRender();
    } catch (error) {
      // Hiển thị lỗi ngay dưới form thay vì làm crash app (EXTRA-1, EXTRA-3).
      if (errorEl !== null) {
        errorEl.textContent = error instanceof Error ? error.message : "Có lỗi xảy ra.";
      }
    }
    return;
  }

  // Thêm danh mục (F02-1, F02-4).
  if (form.id === "cat-form") {
    const errorEl = document.getElementById("cat-error");
    try {
      addCategory(data, getInput("cat-name").value, Number(getInput("cat-limit").value));
      saveAndRender();
    } catch (error) {
      if (errorEl !== null) {
        errorEl.textContent = error instanceof Error ? error.message : "Có lỗi xảy ra.";
      }
    }
  }
});

// ----- Khởi động: vẽ lần đầu -----
render();
