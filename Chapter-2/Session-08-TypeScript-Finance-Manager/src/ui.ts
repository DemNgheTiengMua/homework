// ============================================================================
// ui.ts — Mọi việc liên quan tới hiển thị (DOM).
//
// Nguyên tắc: file này KHÔNG chứa nghiệp vụ tính toán. Nó chỉ nhận dữ liệu
// đã tính sẵn rồi vẽ ra HTML. Nhờ vậy logic (category.ts/transaction.ts)
// và giao diện (ui.ts) tách bạch, dễ đọc và dễ bảo trì (NFR-4).
// ============================================================================

import type {
  AppData,
  CategorySpending,
  Transaction,
  TransactionType,
} from "./types";
import { getCategoryName } from "./category";

/**
 * Định dạng số tiền theo kiểu Việt Nam, ví dụ 1500000 -> "1.500.000 ₫".
 * Dùng Intl.NumberFormat có sẵn của trình duyệt.
 */
export function formatMoney(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Đổi khóa tháng "2026-08" thành nhãn dễ đọc "Tháng 8, 2026".
 */
export function formatMonthLabel(monthKey: string): string {
  const [year, month] = monthKey.split("-");
  return `Tháng ${Number(month)}, ${year}`;
}

// --- Vài icon SVG vẽ tay (không dùng emoji, theo yêu cầu chất lượng) -------
const icon = {
  wallet: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0 0 4h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5"/><path d="M16 12h.01"/></svg>`,
  up: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5"/><path d="m5 12 7-7 7 7"/></svg>`,
  down: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>`,
  trash: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`,
  edit: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>`,
  warn: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>`,
};

/**
 * Escape HTML để tránh lỗi hiển thị khi ghi chú chứa ký tự < > & (an toàn).
 */
function esc(text: string): string {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

/**
 * ViewModel: gói tất cả dữ liệu ĐÃ TÍNH mà giao diện cần để vẽ.
 * app.ts tính toán rồi truyền object này vào renderApp().
 */
export interface ViewModel {
  data: AppData;
  selectedMonth: string; // "YYYY-MM"
  monthTransactions: Transaction[]; // đã sắp xếp mới nhất trước
  income: number;
  expense: number;
  balance: number;
  totalBudget: number;
  categorySpending: CategorySpending[];
  draftType: TransactionType; // Thu/Chi đang chọn ở form
  summaryRows: { monthKey: string; income: number; expense: number }[];
}

// ----- Các hàm vẽ từng mảnh nhỏ, ghép lại thành trang -----

/** 3 thẻ thống kê Dashboard (F01-1, F01-2). */
function renderStats(vm: ViewModel): string {
  const balanceClass = vm.balance >= 0 ? "value-income" : "value-expense";
  return `
    <section aria-label="Tổng quan">
      <div class="stats">
        <div class="stat-card">
          <div class="stat-card__label">${icon.wallet} Số dư tháng này</div>
          <div class="stat-card__value stat-card__value--balance num ${balanceClass}">
            ${formatMoney(vm.balance)}
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-card__label">Tổng thu</div>
          <div class="stat-card__value num value-income">${formatMoney(vm.income)}</div>
        </div>
        <div class="stat-card">
          <div class="stat-card__label">Tổng chi</div>
          <div class="stat-card__value num value-expense">${formatMoney(vm.expense)}</div>
        </div>
      </div>
    </section>`;
}

/** Thanh tiến trình chi tiêu so với ngân sách tổng (F01-3). */
function renderBudget(vm: ViewModel): string {
  const budget = vm.totalBudget;
  // Tránh chia cho 0 khi chưa đặt ngân sách.
  const percent = budget > 0 ? Math.round((vm.expense / budget) * 100) : 0;
  const capped = Math.min(percent, 100); // thanh không tràn quá 100%
  const over = budget > 0 && vm.expense > budget;

  const badge = over
    ? `<span class="badge badge--over">${icon.warn} Vượt ngân sách</span>`
    : `<span class="badge badge--ok">Đạt</span>`;

  return `
    <section aria-label="Ngân sách">
      <div class="budget">
        <div class="budget__head">
          <h2>Chi tiêu so với ngân sách tổng</h2>
          ${budget > 0 ? badge : ""}
        </div>
        <div class="budget__track">
          <div class="budget__fill ${over ? "budget__fill--over" : ""}" style="width:${capped}%"></div>
        </div>
        <div class="section-hint num">
          Đã chi ${formatMoney(vm.expense)} / Ngân sách ${formatMoney(budget)}
          ${budget > 0 ? `(${percent}%)` : "(chưa đặt ngân sách)"}
        </div>
      </div>
    </section>`;
}

/** Panel giao dịch: form thêm (F03-1) + lịch sử (F03-3). */
function renderTransactionPanel(vm: ViewModel): string {
  // Ô chọn danh mục trong form.
  const options = vm.data.categories
    .map((c) => `<option value="${c.id}">${esc(c.name)}</option>`)
    .join("");

  // Danh sách giao dịch (đã sắp xếp mới nhất trước ở app.ts).
  const items =
    vm.monthTransactions.length === 0
      ? `<li class="empty">Chưa có giao dịch nào trong tháng này.</li>`
      : vm.monthTransactions
          .map((t) => {
            const isIncome = t.type === "income";
            const sign = isIncome ? "+" : "−";
            const cls = isIncome ? "income" : "expense";
            return `
            <li class="tx-item" data-tx-id="${t.id}">
              <span class="tx-icon tx-icon--${cls}">${isIncome ? icon.up : icon.down}</span>
              <span class="tx-main">
                <span class="tx-note">${esc(t.note || getCategoryName(vm.data, t.categoryId))}</span>
                <span class="tx-meta">${esc(getCategoryName(vm.data, t.categoryId))} · ${t.date}</span>
              </span>
              <span class="tx-amount num value-${cls}">${sign} ${formatMoney(t.amount)}</span>
              <button class="icon-btn" data-action="delete-tx" data-id="${t.id}" aria-label="Xóa giao dịch">${icon.trash}</button>
            </li>`;
          })
          .join("");

  return `
    <section class="panel" aria-label="Giao dịch">
      <div class="panel__head"><h2>Thêm giao dịch</h2></div>
      <div class="panel__body">
        <form id="tx-form" novalidate>
          <div class="type-toggle" role="group" aria-label="Loại giao dịch">
            <button type="button" data-type="income" aria-pressed="${vm.draftType === "income"}">Thu</button>
            <button type="button" data-type="expense" aria-pressed="${vm.draftType === "expense"}">Chi</button>
          </div>
          <input type="hidden" id="tx-type" value="${vm.draftType}" />

          <div class="field-row">
            <div class="field">
              <label for="tx-amount">Số tiền (₫)</label>
              <input type="number" id="tx-amount" min="1" step="1000" placeholder="0" />
            </div>
            <div class="field">
              <label for="tx-date">Ngày</label>
              <input type="date" id="tx-date" />
            </div>
          </div>

          <div class="field">
            <label for="tx-category">Danh mục</label>
            <select id="tx-category">${options}</select>
          </div>

          <div class="field">
            <label for="tx-note">Ghi chú</label>
            <input type="text" id="tx-note" placeholder="Ví dụ: Ăn trưa" />
          </div>

          <p class="form-error" id="tx-error" role="alert"></p>
          <button type="submit" class="btn btn--primary">Thêm giao dịch</button>
        </form>

        <div>
          <h2 style="margin-bottom:8px">Lịch sử giao dịch</h2>
          <ul class="tx-list">${items}</ul>
        </div>
      </div>
    </section>`;
}

/** Panel danh mục: form thêm + danh sách kèm hạn mức & đã chi (F02). */
function renderCategoryPanel(vm: ViewModel): string {
  const items = vm.categorySpending
    .map(({ category, spent, isOverLimit }) => {
      const hasLimit = category.limit > 0;
      const percent = hasLimit ? Math.min(Math.round((spent / category.limit) * 100), 100) : 0;
      const spentLine = hasLimit
        ? `<span class="${isOverLimit ? "over" : ""}">${formatMoney(spent)} / ${formatMoney(category.limit)}${isOverLimit ? " · Vượt hạn mức!" : ""}</span>`
        : `<span>Đã chi ${formatMoney(spent)} · (không đặt hạn mức)</span>`;

      return `
        <div class="cat-item" data-cat-id="${category.id}">
          <div class="cat-item__top">
            <span class="cat-name">
              ${isOverLimit ? `<span style="color:var(--expense);display:inline-flex">${icon.warn}</span>` : ""}
              ${esc(category.name)}
            </span>
            <span class="cat-actions">
              <button class="icon-btn" data-action="edit-cat" data-id="${category.id}" aria-label="Sửa danh mục">${icon.edit}</button>
              <button class="icon-btn" data-action="delete-cat" data-id="${category.id}" aria-label="Xóa danh mục">${icon.trash}</button>
            </span>
          </div>
          ${
            hasLimit
              ? `<div class="cat-progress">
                   <div class="cat-track"><div class="cat-fill ${isOverLimit ? "cat-fill--over" : ""}" style="width:${percent}%"></div></div>
                 </div>`
              : ""
          }
          <div class="cat-spent num">${spentLine}</div>
        </div>`;
    })
    .join("");

  return `
    <section class="panel" aria-label="Danh mục">
      <div class="panel__head"><h2>Danh mục</h2></div>
      <div class="panel__body">
        <form id="cat-form" novalidate>
          <div class="field">
            <label for="cat-name">Tên danh mục</label>
            <input type="text" id="cat-name" placeholder="Ví dụ: Giải trí" />
          </div>
          <div class="field">
            <label for="cat-limit">Hạn mức (₫) — để 0 nếu không giới hạn</label>
            <input type="number" id="cat-limit" min="0" step="1000" placeholder="0" />
          </div>
          <p class="form-error" id="cat-error" role="alert"></p>
          <button type="submit" class="btn btn--ghost">+ Thêm danh mục</button>
        </form>
        <div>${items}</div>
      </div>
    </section>`;
}

/** Bảng tổng hợp chi tiêu các tháng (F05-2). */
function renderSummary(vm: ViewModel): string {
  if (vm.summaryRows.length === 0) {
    return "";
  }

  const rows = vm.summaryRows
    .map(
      (r) => `
      <tr>
        <td>${formatMonthLabel(r.monthKey)}</td>
        <td class="num value-income">${formatMoney(r.income)}</td>
        <td class="num value-expense">${formatMoney(r.expense)}</td>
        <td class="num">${formatMoney(r.income - r.expense)}</td>
      </tr>`
    )
    .join("");

  const totalIncome = vm.summaryRows.reduce((s, r) => s + r.income, 0);
  const totalExpense = vm.summaryRows.reduce((s, r) => s + r.expense, 0);

  return `
    <section aria-label="Tổng hợp các tháng">
      <h2>Bảng tổng hợp chi tiêu các tháng</h2>
      <div class="panel">
        <div class="table-wrap">
          <table>
            <thead>
              <tr><th>Tháng</th><th>Tổng thu</th><th>Tổng chi</th><th>Số dư</th></tr>
            </thead>
            <tbody>${rows}</tbody>
            <tfoot>
              <tr>
                <td>Tổng cộng</td>
                <td class="num value-income">${formatMoney(totalIncome)}</td>
                <td class="num value-expense">${formatMoney(totalExpense)}</td>
                <td class="num">${formatMoney(totalIncome - totalExpense)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </section>`;
}

/**
 * Hàm chính: vẽ toàn bộ giao diện vào phần tử #app.
 * Trả về HTML dưới dạng chuỗi rồi gán vào innerHTML — cách đơn giản, dễ hiểu.
 */
export function renderApp(root: HTMLElement, vm: ViewModel): void {
  // Ô chọn tháng: tạo danh sách các tháng có dữ liệu + tháng đang chọn.
  const monthKeys = new Set<string>(Object.keys(vm.data.transactionsByMonth));
  monthKeys.add(vm.selectedMonth);
  const monthOptions = Array.from(monthKeys)
    .sort((a, b) => b.localeCompare(a))
    .map(
      (key) =>
        `<option value="${key}" ${key === vm.selectedMonth ? "selected" : ""}>${formatMonthLabel(key)}</option>`
    )
    .join("");

  root.innerHTML = `
    <header class="app-header">
      <div class="app-header__inner">
        <span class="brand">${icon.wallet} Ví Của Tôi</span>
        <div class="month-picker">
          <label for="month-select">Tháng:</label>
          <select id="month-select">${monthOptions}</select>
        </div>
      </div>
    </header>
    <main>
      ${renderStats(vm)}
      ${renderBudget(vm)}
      <div class="columns">
        ${renderTransactionPanel(vm)}
        ${renderCategoryPanel(vm)}
      </div>
      ${renderSummary(vm)}
    </main>`;
}
