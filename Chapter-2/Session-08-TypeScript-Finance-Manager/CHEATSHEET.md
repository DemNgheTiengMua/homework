# CHEATSHEET KỸ THUẬT — "Ví Của Tôi" (Vite + TypeScript)

Tài liệu giải thích **cơ chế hoạt động** của từng phần code: hệ thống kiểu của
TypeScript, cấu trúc dữ liệu, thuật toán, mô hình sự kiện DOM, cách localStorage
tuần tự hóa dữ liệu, và pipeline build của Vite. Không phải kịch bản trả lời —
mà là kiến thức để bạn thật sự hiểu code.

---

## Mục lục

1. [Hệ thống kiểu TypeScript trong dự án](#1-hệ-thống-kiểu-typescript)
2. [Mô hình dữ liệu & cấu trúc lưu trữ](#2-mô-hình-dữ-liệu)
3. [Tuần tự hóa & localStorage](#3-tuần-tự-hóa--localstorage)
4. [Kiến trúc module & luồng dữ liệu](#4-kiến-trúc-module--luồng-dữ-liệu)
5. [Thuật toán tính toán (filter/reduce/sort)](#5-thuật-toán-tính-toán)
6. [Mô hình render (state → view)](#6-mô-hình-render)
7. [Mô hình sự kiện DOM & event delegation](#7-mô-hình-sự-kiện-dom)
8. [Xử lý lỗi & try/catch](#8-xử-lý-lỗi)
9. [Bảo mật: XSS & cách escape](#9-bảo-mật-xss)
10. [Định dạng số với Intl](#10-định-dạng-số-intl)
11. [Pipeline build Vite + tsc](#11-pipeline-build)
12. [tsconfig: từng cờ strict làm gì](#12-tsconfig-strict)
13. [Các quyết định thiết kế & đánh đổi](#13-quyết-định-thiết-kế)

---

## 1. Hệ thống kiểu TypeScript

### Union type (kiểu hợp)

```ts
export type TransactionType = "income" | "expense";
```

`TransactionType` là **string literal union**: giá trị chỉ có thể là đúng chuỗi
`"income"` hoặc `"expense"`. Đây không phải string tự do.

- Lúc **compile**: nếu viết `type: "incom"` → `tsc` báo lỗi ngay.
- Lúc **runtime**: TypeScript biến mất hoàn toàn (bị "erase"), chỉ còn chuỗi JS
  bình thường. Nghĩa là kiểu **không tồn tại khi chạy** — không có cách nào hỏi
  "biến này kiểu gì?" lúc runtime. Đây là điểm mấu chốt nhiều người hiểu sai.

### interface = mô tả hình dạng object (structural typing)

```ts
export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  note: string;
  date: string;   // ISO "YYYY-MM-DD"
}
```

TypeScript dùng **structural typing** ("duck typing"): một object hợp lệ nếu nó
CÓ ĐỦ các trường đúng kiểu — không cần khai báo "implements Transaction". Nếu nó
đi như vịt và kêu như vịt thì nó là vịt.

`interface` cũng bị erase khi build → **0 byte** trong bundle JS. Đây là lý do
trả lời được câu "dùng nhiều interface có nặng app không?": Không, vì chúng chỉ
tồn tại lúc viết code.

### Record<K, V> — object dùng như map

```ts
transactionsByMonth: Record<string, Transaction[]>;
```

`Record<string, Transaction[]>` = object mà **key là string bất kỳ**, value là
mảng `Transaction`. Tương đương `{ [key: string]: Transaction[] }`. Dùng nó làm
"bảng tra cứu theo tháng": key `"2026-08"` → mảng giao dịch tháng 8.

### Ép kiểu có kiểm soát (type assertion) vs `any`

```ts
const parsed = JSON.parse(raw) as AppData;
```

`JSON.parse` trả về kiểu `any` (vì runtime không biết trước hình dạng). Thay vì
để `any` lan ra, mình dùng `as AppData` để **thu hẹp** về đúng 1 chỗ. `as` là
lời hứa với compiler "tôi biết chắc nó là AppData" — không kiểm tra lúc runtime,
nên chỉ dùng khi thật sự chắc (ở đây dữ liệu do chính app ghi ra).

> Khác biệt cốt lõi: `any` = **tắt** kiểm tra kiểu ở mọi hướng. `as T` = giữ
> nguyên kiểm tra, chỉ khẳng định kiểu tại 1 điểm. Dự án này 0 chỗ `any`.

### Optional chaining `?.` và nullish coalescing `??`

```ts
data.categories.find((c) => c.id === id)?.name ?? "Không rõ";
```

- `find()` có thể trả `Category | undefined`.
- `?.name`: nếu kết quả `undefined` thì cả biểu thức thành `undefined` (không nổ
  lỗi "cannot read property of undefined").
- `?? "Không rõ"`: nếu vế trái là `null`/`undefined` thì lấy giá trị mặc định.
  Khác `||` ở chỗ `??` KHÔNG coi `0` hay `""` là "rỗng" — chỉ null/undefined.

Vì bật `strictNullChecks`, TypeScript **bắt buộc** mình xử lý nhánh undefined này
— không xử lý là báo lỗi compile. Đó là cách strict mode ngăn lỗi null runtime.

### Type guard với `instanceof`

```ts
function getInput(id: string): HTMLInputElement {
  const el = document.getElementById(id);
  if (!(el instanceof HTMLInputElement)) {
    throw new Error(`Không tìm thấy input #${id}`);
  }
  return el; // ở đây TS đã BIẾT el là HTMLInputElement
}
```

`getElementById` trả `HTMLElement | null`. Sau `if (el instanceof HTMLInputElement)`,
TypeScript **thu hẹp kiểu** (narrowing): trong nhánh còn lại nó chắc chắn là
`HTMLInputElement`, nên `.value` mới hợp lệ. Đây là cách truy cập DOM an toàn kiểu
mà không dùng `as`.

---

## 2. Mô hình dữ liệu

Toàn bộ trạng thái app gói trong **một** object `AppData`:

```ts
interface AppData {
  categories: Category[];                        // dùng chung mọi tháng
  transactionsByMonth: Record<string, Transaction[]>;  // tách theo tháng
  totalBudget: number;
}
```

### Quyết định 1: danh mục toàn cục, giao dịch theo tháng

- `categories` là **1 mảng phẳng** dùng chung — không nhân bản danh mục mỗi
  tháng. Giao dịch tham chiếu danh mục qua `categoryId` (khóa ngoại dạng chuỗi).
  Đây là mô hình **normalized** (chuẩn hóa): dữ liệu danh mục nằm 1 chỗ, sửa tên
  danh mục thì mọi giao dịch tự phản ánh vì chúng chỉ giữ `id`.
- `transactionsByMonth` là **map theo tháng**. Truy cập tháng 8 = O(1):
  `transactionsByMonth["2026-08"]`. Không phải quét toàn bộ rồi lọc theo tháng.

### Quyết định 2: số tiền luôn dương, loại nằm ở `type`

`amount: number` luôn `> 0`; thu/chi phân biệt bằng `type: "income" | "expense"`.

- Ưu điểm: không nhầm dấu khi cộng; hiển thị dấu +/− do tầng view tự thêm; validate
  đơn giản (`amount <= 0` là sai, không cần xét dấu theo loại).
- Đánh đổi: khi tính tổng phải `filter` theo `type` trước khi cộng (xem mục 5).

### Khóa tháng "YYYY-MM"

```ts
export function toMonthKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}
```

- `getMonth()` trả **0–11** (tháng 1 là 0) → phải `+ 1`.
- `padStart(2, "0")`: "8" → "08". Giữ định dạng 2 chữ số để **so sánh chuỗi =
  so sánh thời gian**. Vì "2026-08" > "2026-07" đúng cả theo alphabet lẫn theo
  thời gian, mình sort tháng chỉ bằng `localeCompare` mà không cần parse Date.

### Suy ra tháng từ ngày giao dịch

```ts
const monthKey = input.date.slice(0, 7);  // "2026-08-15" → "2026-08"
```

Vì `date` lưu dạng ISO "YYYY-MM-DD", 7 ký tự đầu chính là khóa tháng. Nhờ vậy khi
thêm giao dịch, nó **tự** vào đúng ngăn tháng theo ngày người dùng chọn — kể cả
khi họ nhập ngày của tháng khác.

---

## 3. Tuần tự hóa & localStorage

### localStorage chỉ lưu string

Web Storage API chỉ chứa **cặp string → string**. Object phải chuyển qua lại JSON:

```ts
// GHI: object → chuỗi JSON
localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

// ĐỌC: chuỗi JSON → object (kiểu any, nên ép về AppData)
const parsed = JSON.parse(raw) as AppData;
```

### Điều gì SỐNG SÓT qua JSON, điều gì KHÔNG

`JSON.stringify` chỉ giữ dữ liệu "thuần": object, array, string, number, boolean,
null. **Mất**: hàm, `undefined`, `Date` (thành string), `Map`/`Set`, class methods,
kiểu TypeScript. Đây là lý do:

- `date` lưu dạng **string** ISO chứ không phải object `Date` — để tuần tự hóa an
  toàn, đọc lại không cần "hồi sinh" Date.
- `AppData` chỉ chứa dữ liệu thuần, không có method → parse xong dùng ngay được.

### Vòng đời dữ liệu

```text
Mở app ──► loadData()
             │  có key trong localStorage?
             ├─ CHƯA → createSeedData() → saveData() → trả seed   (NFR-7)
             ├─ CÓ, parse OK → trả object
             └─ CÓ, parse LỖI (hỏng) → seed lại (không crash)     (EXTRA-3)

Mỗi thao tác (thêm/sửa/xóa) ──► saveAndRender()
                                   ├─ saveData()  (ghi ngay → NFR-3)
                                   └─ render()    (vẽ lại)
```

`STORAGE_KEY = "e-wallet-data-v1"` — hậu tố `v1` để nếu sau này đổi cấu trúc dữ
liệu, chỉ cần đổi thành `v2` là coi như dữ liệu cũ không tương thích, tránh crash
do đọc nhầm định dạng cũ.

---

## 4. Kiến trúc module & luồng dữ liệu

6 file, mỗi file một trách nhiệm (separation of concerns → NFR-4):

```text
types.ts        chỉ khai báo kiểu — 0 logic, 0 DOM
storage.ts      I/O localStorage + seed          (phụ thuộc: types)
transaction.ts  nghiệp vụ giao dịch + tính tổng  (phụ thuộc: types, storage)
category.ts     nghiệp vụ danh mục               (phụ thuộc: types, storage)
ui.ts           render DOM (nhận ViewModel)       (phụ thuộc: types, category)
app.ts          controller: nối tất cả + sự kiện (phụ thuộc: TẤT CẢ)
```

**Nguyên tắc phụ thuộc 1 chiều**: mũi tên phụ thuộc luôn trỏ về phía `types`.
`transaction.ts`/`category.ts` **không** import `ui.ts` → logic không biết gì về
giao diện. Muốn viết test cho `balance()` chẳng cần trình duyệt. Chỉ `app.ts` là
nơi duy nhất "biết" cả dữ liệu lẫn DOM.

### ES Modules

Mỗi file dùng `export`/`import` (ESM chuẩn). `import type { … }` là cú pháp
"chỉ import kiểu" — bị xóa hoàn toàn khi build, không tạo phụ thuộc runtime.

### Luồng dữ liệu một chiều (unidirectional)

```text
   người dùng thao tác
        │  (click / submit / change)
        ▼
   app.ts: cập nhật `data` bằng hàm nghiệp vụ
        │
        ▼
   saveData(data)  ──►  localStorage
        │
        ▼
   render():  data ──► tính ViewModel ──► renderApp() ──► #app.innerHTML
```

Không có "data binding hai chiều". Nguồn sự thật duy nhất là biến `data`. Mọi
thay đổi đi qua `data` rồi vẽ lại → giao diện **luôn** khớp dữ liệu, không lệch.

---

## 5. Thuật toán tính toán

Tất cả dựa trên 3 phương thức mảng: `filter`, `reduce`, `sort`.

### Tổng thu / chi = filter rồi reduce

```ts
export function totalExpense(transactions: Transaction[]): number {
  return transactions
    .filter((t) => t.type === "expense")   // giữ khoản chi
    .reduce((sum, t) => sum + t.amount, 0); // cộng dồn, bắt đầu từ 0
}
```

- `filter` duyệt mảng, giữ phần tử làm callback trả `true` → mảng mới.
- `reduce(callback, initial)` "gấp" mảng thành 1 giá trị: `sum` là tích lũy,
  khởi đầu `0`. Giá trị khởi đầu `0` quan trọng — mảng rỗng trả `0` chứ không lỗi.
- Độ phức tạp: O(n) mỗi hàm. `balance = income − expense` duyệt 2 lần → vẫn O(n).

### Đã chi theo danh mục

```ts
export function calcCategorySpending(data, monthTx): CategorySpending[] {
  return data.categories.map((category) => {
    const spent = monthTx
      .filter((t) => t.type === "expense" && t.categoryId === category.id)
      .reduce((sum, t) => sum + t.amount, 0);
    const isOverLimit = category.limit > 0 && spent > category.limit;
    return { category, spent, isOverLimit };
  });
}
```

- `map` biến mỗi danh mục thành 1 object kết quả. Với C danh mục và T giao dịch,
  chi phí O(C×T) — chấp nhận được ở quy mô cá nhân.
- `isOverLimit`: điều kiện `limit > 0` để danh mục "không đặt hạn mức" (limit = 0)
  **không bao giờ** báo vượt. Đây là logic gốc của cảnh báo F05-1.

### Sắp xếp mới nhất trước (F03-3)

```ts
export function sortByDateDesc(transactions: Transaction[]): Transaction[] {
  return transactions
    .slice()                                  // COPY trước khi sort
    .sort((a, b) => b.date.localeCompare(a.date));
}
```

- `.slice()` tạo **bản sao nông** trước khi `sort`. Lý do: `sort` sửa **tại chỗ**
  (mutates) mảng gốc; nếu sort thẳng mảng trong `data` sẽ làm bẩn nguồn dữ liệu.
  Đây là một lỗi tinh vi hay gặp — tách bản sao là cách phòng.
- `b.date.localeCompare(a.date)`: so sánh chuỗi ISO. `b` trước `a` → **giảm dần**
  (mới nhất lên đầu). Dùng được vì định dạng "YYYY-MM-DD" so sánh chuỗi = so sánh
  thời gian (đã nói ở mục 2).

### Bảng tổng hợp (F05-2)

```ts
Object.keys(data.transactionsByMonth)          // ["2026-07","2026-08"]
  .sort((a, b) => b.localeCompare(a))          // mới → cũ
  .map((monthKey) => ({ monthKey,
        income: totalIncome(list),
        expense: totalExpense(list) }));
```

`Object.keys` lấy danh sách tháng có dữ liệu; mỗi tháng tính lại tổng thu/chi.
Dòng "Tổng cộng" ở footer lại `reduce` trên chính mảng summary.

---

## 6. Mô hình render

### Kiến trúc "re-render toàn bộ" (full re-render)

Mỗi khi dữ liệu đổi, `render()` **vẽ lại toàn bộ** `#app` bằng cách gán chuỗi HTML
mới vào `innerHTML`. Không cập nhật từng phần tử.

```ts
function render(): void {
  const vm: ViewModel = { /* ...tính từ data... */ };
  renderApp(root, vm);
}
```

- **Ưu điểm**: giao diện luôn là "hàm thuần" của dữ liệu — `view = f(state)`. Không
  có bug kiểu "sửa số dư mà quên cập nhật danh sách". Đây chính là ý tưởng cốt lõi
  của React/Vue, ở đây làm thủ công.
- **Đánh đổi**: gán `innerHTML` phá và dựng lại DOM → mất focus/scroll của phần
  tử đang tương tác. Ở app này không thành vấn đề vì thao tác là submit/click rời
  rạc. Với dữ liệu cực lớn mới cần render từng phần (diffing).

### ViewModel — tách "tính" khỏi "vẽ"

`ui.ts` **không tự tính** gì cả. `app.ts` tính hết rồi đóng gói vào `ViewModel`:

```ts
interface ViewModel {
  data: AppData; selectedMonth: string;
  monthTransactions: Transaction[];   // ĐÃ sort sẵn
  income: number; expense: number; balance: number;
  totalBudget: number;
  categorySpending: CategorySpending[];
  draftType: TransactionType;
  summaryRows: { monthKey: string; income: number; expense: number }[];
}
```

Nhờ vậy `ui.ts` chỉ là "khuôn": nhận số liệu, đổ ra HTML. Nếu muốn đổi giao diện
hoàn toàn, chỉ sửa `ui.ts`, không đụng logic.

### Thanh tiến trình: chặn chia 0 và tràn 100%

```ts
const percent = budget > 0 ? Math.round((vm.expense / budget) * 100) : 0;
const capped  = Math.min(percent, 100);   // bề rộng thanh không vượt 100%
const over    = budget > 0 && vm.expense > budget;
```

- `budget > 0 ? … : 0`: tránh chia cho 0 khi chưa đặt ngân sách (kết quả sẽ là
  `Infinity`/`NaN`).
- `capped` giới hạn **bề rộng CSS** ≤ 100% để thanh không tràn khung, nhưng
  `percent` gốc (có thể 150%) vẫn hiển thị bằng chữ để người dùng biết vượt bao nhiêu.

---

## 7. Mô hình sự kiện DOM

### Event delegation (ủy thác sự kiện)

Chỉ gắn **3 listener** lên `#app` (cha), không gắn cho từng nút:

```ts
root.addEventListener("click",  (event) => { /* ... */ });
root.addEventListener("change", (event) => { /* month picker */ });
root.addEventListener("submit", (event) => { /* 2 form */ });
```

**Vì sao?** Mỗi lần `render()` thay `innerHTML` → toàn bộ nút cũ bị **hủy**, nút
mới được tạo. Nếu gắn listener cho từng nút thì sau mỗi render phải gắn lại hết.
Gắn ở cha thì listener sống mãi, bất kể con bị vẽ lại bao nhiêu lần.

**Cơ chế chạy được là nhờ EVENT BUBBLING**: click vào nút con → sự kiện "nổi bọt"
lên cha `#app` → listener ở cha bắt được. Ta xem `event.target` (nơi click thật)
để biết xử lý gì:

```ts
const button = target.closest("button");   // tìm nút gần nhất (kể cả click trúng icon SVG bên trong)
const action = button?.dataset.action;      // đọc data-action="delete-tx"...
const id     = button?.dataset.id;
```

- `closest("button")`: đi ngược lên cây DOM tìm `<button>` gần nhất. Cần vì người
  dùng có thể click trúng `<svg>` bên trong nút, không phải chính nút.
- `dataset.action` đọc thuộc tính `data-action` trong HTML → dựa vào đó `if/else`
  để biết đây là xóa giao dịch, xóa danh mục hay sửa danh mục. Đây là cách "định
  tuyến" hành động mà không cần tham chiếu trực tiếp tới từng nút.

### `event.preventDefault()` cho form

```ts
root.addEventListener("submit", (event) => {
  event.preventDefault();   // chặn hành vi mặc định: gửi form + tải lại trang
  ...
});
```

Mặc định `<form>` submit sẽ **reload trang** (điều hướng). `preventDefault()` chặn
việc đó để mình xử lý bằng JS và giữ nguyên trạng thái app (SPA behavior).

### `change` vs `click` vs `submit`

- `change`: dùng cho `<select>` tháng — chỉ chạy khi giá trị đổi. Đổi tháng chỉ
  đổi `selectedMonth` rồi `render()`, **không** `saveData` vì dữ liệu không đổi.
- `submit`: cho 2 form (giao dịch, danh mục). Phân biệt form nào qua `form.id`.
- `click`: cho các nút toggle Thu/Chi và các nút icon xóa/sửa.

---

## 8. Xử lý lỗi

### Nghiệp vụ "ném" lỗi, controller "bắt" lỗi

Hàm nghiệp vụ không tự hiển thị lỗi — nó `throw` để nơi gọi quyết định cách báo:

```ts
// transaction.ts — chỉ ném lỗi
export function addTransaction(data, input): void {
  if (Number.isNaN(input.amount) || input.amount <= 0)
    throw new Error("Số tiền phải là số lớn hơn 0.");
  if (input.categoryId === "") throw new Error("Vui lòng chọn danh mục.");
  ...
}

// app.ts — bắt lỗi, hiện dưới form (không crash app)
try {
  addTransaction(data, {...});
  saveAndRender();
} catch (error) {
  errorEl.textContent = error instanceof Error ? error.message : "Có lỗi xảy ra.";
}
```

- **Tách bạch**: logic biết *cái gì* sai; UI biết *hiển thị thế nào*. Cùng một
  `addTransaction` có thể dùng lại ở nơi khác với cách báo lỗi khác.
- `error instanceof Error`: trong `catch`, TypeScript cho `error` kiểu `unknown`
  (vì JS ném được bất cứ thứ gì, kể cả string). Phải kiểm tra `instanceof Error`
  mới an toàn đọc `.message`. Đây là hệ quả của strict mode (`useUnknownInCatch`).
- `Number.isNaN`: bắt trường hợp `Number("")` hoặc input rỗng → `NaN`.

### Chống crash khi đọc dữ liệu hỏng

```ts
try {
  return JSON.parse(raw) as AppData;
} catch {
  const seed = createSeedData();  // dữ liệu localStorage hỏng → seed lại
  saveData(seed);
  return seed;
}
```

Nếu ai đó sửa tay localStorage thành JSON sai, `JSON.parse` ném lỗi → mình bắt và
khôi phục seed thay vì để trắng màn hình (EXTRA-3).

---

## 9. Bảo mật: XSS

### Nguy cơ

App dùng `innerHTML` để dựng giao diện. Nếu nhét thẳng ghi chú người dùng vào
HTML, một ghi chú như `<img src=x onerror=alert(1)>` sẽ **chạy như code** —
đó là XSS (Cross-Site Scripting).

### Cách chặn: escape mọi text người dùng nhập

```ts
function esc(text: string): string {
  const div = document.createElement("div");
  div.textContent = text;      // gán qua textContent → trình duyệt tự escape
  return div.innerHTML;        // đọc lại ra HTML đã an toàn
}
```

Mẹo: gán vào `textContent` khiến trình duyệt coi chuỗi là **văn bản thuần**, tự
đổi `<` thành `&lt;`, `&` thành `&amp;`... Đọc lại `innerHTML` ra chuỗi đã escape.
Mọi chỗ in tên danh mục / ghi chú đều bọc `esc(...)`:

```ts
<span class="tx-note">${esc(t.note || getCategoryName(...))}</span>
```

Các trường khác an toàn sẵn: `amount` là number, `date` từ `<input type="date">`,
`id` do `crypto.randomUUID()` sinh — không chứa ký tự HTML.

> Với app cá nhân chạy local, XSS ít nguy hiểm hơn (dữ liệu do chính mình nhập),
> nhưng escape là **thói quen đúng** và trả lời được khi thầy hỏi về `innerHTML`.

---

## 10. Định dạng số (Intl)

```ts
new Intl.NumberFormat("vi-VN", {
  style: "currency", currency: "VND", maximumFractionDigits: 0,
}).format(1500000);   // → "1.500.000 ₫"
```

- `Intl.NumberFormat` là API **có sẵn của trình duyệt** (không cần thư viện). Nó
  tự biết quy ước Việt Nam: dấu chấm ngăn cách hàng nghìn, ký hiệu ₫.
- `maximumFractionDigits: 0`: VND không có xu → bỏ phần thập phân.
- CSS bổ trợ: `font-variant-numeric: tabular-nums` khiến mọi chữ số rộng bằng
  nhau → các cột số **thẳng hàng dọc** trong bảng (rất quan trọng với bảng tiền).

`formatMonthLabel("2026-08")` → "Tháng 8, 2026" bằng cách `split("-")` rồi
`Number(month)` để bỏ số 0 đứng đầu.

---

## 11. Pipeline build

### Lúc dev: `npm run dev`

Vite chạy một **dev server** dùng ESM native của trình duyệt: nó phục vụ từng
file `.ts`, biên dịch **on-demand** sang JS bằng esbuild (rất nhanh), và có HMR
(Hot Module Replacement — sửa code là trình duyệt tự cập nhật). Trình duyệt không
đọc được `.ts` trực tiếp; Vite dịch ngầm trước khi gửi.

### Lúc build: `npm run build` = `tsc && vite build`

Hai bước tách bạch, chạy tuần tự (toán tử `&&`: bước 1 lỗi thì dừng):

1. **`tsc`** (`noEmit: true`): chỉ **kiểm tra kiểu** toàn dự án, KHÔNG xuất file.
   Đây là "cổng chất lượng" — sai kiểu là build fail (chính là lỗi
   `'Category' is declared but never used` mình đã gặp và sửa).
2. **`vite build`**: dùng esbuild + Rollup để **transpile** TS→JS, gộp module,
   minify, và băm tên file (`index-Ddzh-2NA.js`) cho cache-busting. Kết quả vào
   `dist/`.

> Điểm hay để trả lời: TypeScript **không** tự chạy trên trình duyệt. Nó luôn
> được biên dịch (transpile) thành JavaScript trước. `tsc` lo phần *kiểm tra*,
> esbuild/Vite lo phần *chuyển đổi* — tách 2 việc nên build nhanh.

`base: "./"` trong `vite.config.ts`: khiến đường dẫn asset trong `dist/index.html`
là tương đối → mở bản build bằng `file://` hoặc đặt thư mục con nào cũng chạy.

---

## 12. tsconfig strict — từng cờ làm gì

`"strict": true` bật một nhóm cờ. Các cờ quan trọng và tác dụng thực tế trong dự án:

| Cờ | Ý nghĩa | Chạm vào code nào |
|----|---------|-------------------|
| `noImplicitAny` | Cấm kiểu `any` ngầm; tham số/biến phải suy ra được hoặc khai báo | mọi hàm đều có kiểu tham số rõ ràng |
| `strictNullChecks` | `null`/`undefined` là kiểu riêng, phải xử lý tường minh | ép dùng `?.`, `??`, kiểm tra `=== undefined` |
| `noUnusedLocals` | Biến/import khai báo mà không dùng → lỗi | bắt lỗi `Category` import thừa |
| `noUnusedParameters` | Tham số hàm không dùng → lỗi | giữ chữ ký hàm gọn |
| `noImplicitReturns` | Mọi nhánh của hàm phải return nhất quán | tránh quên return |
| `noFallthroughCasesInSwitch` | Cấm case switch "rơi" xuống case sau | an toàn switch |

Thêm (ngoài strict): `forceConsistentCasingInFileNames` (tránh lỗi import sai hoa/
thường trên Linux), `isolatedModules` (mỗi file dịch độc lập — cần cho esbuild).

> Câu chứng minh "không dùng any": mở `tsconfig.json` chỉ `strict: true` +
> `noImplicitAny`, rồi `grep -rn "any" src/` → không có kết quả nào là kiểu `any`.

---

## 13. Quyết định thiết kế & đánh đổi

| Quyết định | Lý do chọn | Đánh đổi / khi nào nên khác |
|-----------|-----------|------------------------------|
| Full re-render (`innerHTML`) | Đơn giản, view = f(state), không lệch dữ liệu | Mất focus/scroll; dữ liệu lớn nên dùng diffing |
| Danh mục toàn cục, giao dịch theo tháng | Chuẩn hóa, sửa tên 1 chỗ | Không đặt hạn mức riêng theo từng tháng |
| Số tiền dương + trường `type` | Ít lỗi dấu, validate gọn | Phải filter theo type khi tính tổng |
| `date` là string ISO | Tuần tự hóa an toàn, so sánh chuỗi = so sánh ngày | Muốn cộng/trừ ngày phải `new Date()` lại |
| Event delegation (3 listener) | Sống sót qua mọi re-render | Phải đọc `data-*` để định tuyến |
| localStorage | Không cần server, đúng yêu cầu SRS | 1 máy, ~5MB, không đồng bộ nhiều thiết bị |
| `prompt()` cho sửa danh mục | Nhanh, đủ dùng | Không đẹp bằng form riêng |
| System font stack | Nhẹ, không tải webfont, chạy offline | Không có "cá tính" font riêng |

### Giới hạn đã biết (nói thẳng nếu được hỏi)

- Không có sửa giao dịch (SRS chỉ yêu cầu xóa).
- Không có biểu đồ tròn/cột — SRS cho phép "biểu đồ **hoặc** thanh trạng thái",
  đã chọn thanh tiến trình.
- localStorage giới hạn ~5MB và chỉ trên 1 trình duyệt/máy.
- `crypto.randomUUID()` cần HTTPS hoặc localhost (đúng môi trường dev) và Node 18+.

---

## Phụ lục: đọc code theo thứ tự nào

Muốn hiểu nhanh, đọc theo luồng thực thi:

1. `types.ts` — nắm hình dạng dữ liệu trước.
2. `storage.ts` — dữ liệu từ đâu ra (seed + load).
3. `app.ts` phần đầu — 3 biến state + hàm `render()`.
4. `transaction.ts` + `category.ts` — nghiệp vụ được `render` gọi.
5. `ui.ts` — cách ViewModel biến thành HTML.
6. `app.ts` phần sự kiện — vòng lặp thao tác → cập nhật → lưu → vẽ lại.
