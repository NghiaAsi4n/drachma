# Kế hoạch hoàn thiện — Thu Chi PWA

> Checklist làm việc. Commit `PLAN.md` cùng repo để đồng bộ tiến độ giữa nhiều máy.
> Phạm vi: iPhone (Safari → Add to Home Screen). Spec: `SKILL.md`. Ảnh mẫu: app Walti.
> Kiến trúc: offline-first, `localStorage` là cache; cloud sync qua Supabase (Postgres + Auth).
> Quy mô: 1 người dùng, thiết kế sẵn cho 5–10 người (mỗi người một tài khoản, RLS tách dữ liệu).
> Repo (private): https://github.com/NghiaAsi4n/drachma — host: Cloudflare Pages, link cài dự kiến: https://drachma.pages.dev/

## Trạng thái hiện tại

- [x] Khung PWA: `index.html`, `style.css`, `app.js`, `sw.js`, `manifest.json`, icons 192/512/maskable/apple-touch
- [x] Data layer `thuchi.v1`: migrate, save mỗi mutation, category mặc định, VND số nguyên, ngày local
- [x] Overview: đổi tháng, header compact, hero Yesterday/Today, budget, categories, recent 5
- [x] History: search bỏ dấu, 3 filter, nhóm theo ngày, sửa, swipe xoá + Undo
- [x] Analytics: so tháng trước, donut, 6 tháng, trung bình ngày, top 3
- [x] Settings: budget, tiền tệ, category, payment method, export JSON/CSV, import, backup warning, demo, xoá
- [x] Add/Edit sheet: amount autofocus, `50k`/`1.5m`, +000, nhớ category/method
- [x] iOS: safe-area, `100dvh`, input ≥16px, visualViewport, SW update toast, storage.persist

## P0 — Font khớp ảnh mẫu

Ảnh mẫu dùng **SF Pro** (toàn bộ UI, số tiền, tiêu đề trang) và **New York** (chỉ dòng "November 2026"). App đang dùng Cinzel nên lệch.

- [x] `style.css`: thêm token `--ui` (SF stack: `-apple-system, "SF Pro Text", system-ui, ...`) và `--serif` (`ui-serif, "New York", Georgia`)
- [x] Đổi `--body` sang SF; bỏ phụ thuộc Cinzel
- [x] `h1.page`, `.item .a`, `.cat-row .am`, `.hero .amount`, `.amt`, `.pill .v` sang SF weight 600/700
- [x] Chỉ dùng `--serif` cho `.title` (dòng tháng ở Overview)
- [x] Tinh chỉnh `letter-spacing` âm nhẹ cho số tiền lớn (ảnh mẫu tracking hẹp)
- [x] `index.html`: xoá 2 preconnect + link Google Fonts
- [x] `app.js`: bỏ `font-family="Cinzel"` trong SVG donut
- [x] `sw.js`: xoá block cache font, bump `CACHE_VERSION` → `v2`
- [ ] Kiểm tra trên iPhone standalone: 4 màn + Add sheet khớp font ảnh mẫu
- [ ] Kiểm tra offline sau khi xoá Google Fonts (không còn request mạng)

**Xong khi:** không còn request fonts.googleapis.com, UI hiển thị SF Pro, header tháng hiển thị serif giống ảnh.

## P1 — Add/Edit sheet theo ảnh mẫu

- [x] Header sheet: ✕ đóng bên trái, tiêu đề "New Expense"/"Edit Expense" ở giữa, ✓ lưu bên phải (mờ khi amount = 0)
- [x] Amount trong card bo góc, số lớn, icon category đang chọn làm watermark bên phải
- [x] Title thành row inline (icon "Aa" + input), bỏ label uppercase
- [x] Category row: icon tag + "Category" + giá trị màu category + chevron; mở grid chip wrap (không cuộn ngang)
- [x] Chip "+ New" trong grid → mở form tạo category nhanh, chọn luôn category vừa tạo
- [x] Payment row: icon thẻ + "None" mặc định + chevron; chip None/Cash/Card/Bank Transfer/Other
- [x] Date row: nút nhanh Today / Yesterday / ngày (mở date picker)
- [x] Note thành row inline (icon lines)
- [x] Giữ nguyên logic lưu/xoá, nhớ category & method, shortcut `50k`
- [x] Thêm 1 khoản trong ≤3 tap (amount → ✓)
- [ ] Kiểm tra bàn phím không che amount trên iPhone thật

**Xong khi:** sheet khớp bố cục ảnh mẫu ở cả trạng thái thêm và sửa, không regression dữ liệu.

## P2 — Analytics + header

- [x] Thêm tiêu đề trang "Analytics" (`h1.page`) đồng bộ History/Settings
- [x] Segmented 3 mo / 6 mo / 12 mo như ảnh; mặc định 6 mo; tổng, avg, số expense và bar chart cập nhật theo lựa chọn
- [x] Sửa bug `render()` reset `ui.compact`: giữ trạng thái header compact sau khi lưu/xoá
- [x] Overview: header tháng · tổng tiền vẫn đúng sau re-render

**Xong khi:** đổi range không reload, header compact không nhảy về trạng thái đầy đủ.

## P3 — Overview & Settings tinh chỉnh

- [x] Hero amount lên ~64px ở màn 390px, canh lại label/khoảng cách theo ảnh
- [x] Thêm "None" (method rỗng) vào payment methods + migrate dữ liệu cũ
- [x] Danh sách mặc định: Cash, Card, Bank Transfer, Other
- [ ] Kiểm tra màu bar budget ở 80% / 100%, trạng thái "over"
- [ ] Recent: sắp theo ngày rồi `ts`, đúng 5 item

**Xong khi:** Overview và Settings khớp ảnh ở mức typography + spacing, dữ liệu cũ không mất.

## P4 — PWA, offline, bàn giao

- [x] Test offline: mở lại app khi mất mạng, dữ liệu vẫn đọc/ghi được (Edge headless; iPhone chưa test)
- [ ] Lighthouse PWA pass (manifest, SW, icon, HTTPS)
- [x] Bump `CACHE_VERSION` lần cuối → `v4`
- [x] Viết `README.md`: chạy local, deploy Cloudflare Pages, Supabase auth/sync, cài iPhone, cảnh báo iOS xoá storage, export backup
- [ ] Chụp ảnh 4 màn trên iPhone thật để đối chiếu ảnh mẫu

**Xong khi:** cài từ link HTTPS, mở offline vẫn dùng được, README đủ để tự cài lại.

## P5 — Cloud sync với Supabase

Chuyển data từ "chỉ trên máy" sang "local là cache, Supabase là nguồn sự thật". App vẫn dùng offline; có mạng thì sync. Thiết kế cho 1 người dùng, RLS sẵn sàng mở rộng 5–10 người.

**Đang chặn:** chưa có project Supabase — cần `SUPABASE_URL` + `anon key` trước khi viết sync.

**Tài khoản & phiên đăng nhập**
- [ ] Auth mặc định: email OTP 6 số (magic link không dùng được trong PWA đã cài trên iOS vì link mở Safari, storage tách biệt)
- [ ] (Tùy chọn) Google/Apple OAuth — chỉ thêm nếu chấp nhận redirect có thể mở Safari trên iOS
- [ ] Lưu phiên: `persistSession: true` + `autoRefreshToken: true` (supabase-js), hoặc tự lưu access/refresh token trong localStorage nếu dùng `fetch`
- [ ] Chỉ phải đăng nhập lại khi sign out, refresh token bị thu hồi, hoặc iOS xoá storage/cài lại app
- [ ] Settings: email đang đăng nhập, Last synced, Sync now, Sign out
- [ ] Sign out: xoá session + cache local sau khi sync xong
- [ ] Không chặn app khi offline: mở app vẫn đọc/ghi local, sync sau

**Schema & đồng bộ**
- [ ] Local schema `v2`: thêm `pending`, `updated_at`, `deleted`; migrate từ `v1` (backfill `updated_at`, `pending = true`)
- [ ] Bảng `expenses` (id, user_id, title, amount, category_id, method, date, note, ts, updated_at, deleted), `categories`, `settings`
- [ ] `updated_at` do server set (`now()`), không lấy đồng hồ máy
- [ ] RLS cả 3 bảng cho select/insert/update/delete: `user_id = auth.uid()`
- [ ] `sync.js`: push pending, pull bản ghi mới hơn; xung đột last-write-wins
- [ ] Pull phân trang (Supabase mặc định 1000 dòng/lần); pull khi mở app và khi quay lại foreground
- [ ] Xoá mềm + Undo: Undo = `deleted = false` + `updated_at` mới
- [ ] Hàng đợi offline + retry/backoff; hiển thị số pending và lỗi sync, không chặn UI
- [ ] Đồng bộ `categories`/`settings`; xoá category đẩy việc gán lại `other`
- [ ] Lần đăng nhập đầu: export JSON trước, rồi hỏi Merge/Replace
- [ ] Import JSON đánh dấu toàn bộ bản ghi là pending
- [ ] `config.js` chỉ chứa `SUPABASE_URL` + `anon key`; không bao giờ có `service_role`
- [ ] Service worker không cache request tới Supabase
- [ ] Chốt client: `fetch` tới PostgREST (không phụ thuộc) hoặc self-host `supabase-js`
- [ ] Ghi chú free tier: project tự pause sau 7 ngày không hoạt động; 5–10 user vẫn trong hạn mức

**Xong khi:** đăng nhập OTP một lần, đóng/mở app vẫn còn phiên; hai thiết bị cùng tài khoản thấy chung dữ liệu; offline vẫn thêm/sửa được và tự sync khi có mạng.

## P6 — QA UI + sync

**Đã chạy (Edge headless):** thêm khoản, tạo category mới, chọn payment, Today/Yesterday, `50k`, Analytics 3/6/12 tháng, History nhóm ngày, header compact, offline reload. **Chặn:** các mục sync chờ P5.

**UI**
- [ ] Thêm/sửa/xoá + Undo
- [ ] Search tiếng Việt có/không dấu
- [ ] Filter ngày (all/month/7d/30d/range), category, method
- [ ] Import merge và replace; export JSON mở lại được
- [ ] Ranh giới ngày 23:59 → 00:00 (Today/Yesterday)
- [ ] Budget 0đ, 80%, 100%, vượt budget
- [ ] App không có dữ liệu (empty state từng màn)
- [ ] Sheet trên iPhone: bàn phím số, safe-area, xoay màn hình

**Sync & phiên**
- [ ] Đăng nhập OTP; đóng app, mở lại vẫn còn phiên
- [ ] Để qua hơn 1 giờ, token tự refresh, thao tác vẫn bình thường
- [ ] Sign out rồi đăng nhập lại: dữ liệu pull về đủ
- [ ] Hai tài khoản khác nhau: không đọc/ghi được dữ liệu của nhau (RLS)
- [ ] Hai thiết bị cùng tài khoản: thêm/sửa/xoá đồng bộ đúng
- [ ] Offline: thêm/sửa/xoá, mở lại app, có mạng thì sync
- [ ] Xoá rồi Undo trước và sau khi sync
- [ ] Hơn 1000 bản ghi: pull phân trang đủ, không mất dữ liệu
- [ ] Đổi giờ máy: `updated_at` vẫn đúng theo server
- [ ] Mạng chập chờn: retry không tạo bản ghi trùng
- [ ] Export/import với dữ liệu đã sync

**Xong khi:** toàn bộ mục trên pass trên iPhone thật, với 2 tài khoản thử nghiệm.

## P7 — Deploy Cloudflare Pages + Supabase

Repo (private): https://github.com/NghiaAsi4n/drachma
Link cài dự kiến: https://drachma.pages.dev/

Cloudflare Pages hỗ trợ repo private ở gói free, không cần public repo.

- [x] Tạo `.gitignore` gồm `.DS_Store`, `Thumbs.db`, `*.log`
- [x] `git init` rồi `git branch -M main`
- [x] `git add .` (gồm cả `PLAN.md`), commit đầu tiên với message tiếng Anh
- [x] `git remote add origin https://github.com/NghiaAsi4n/drachma.git`
- [x] Push `main` — commit `91f39e8`, remote `main` đã trỏ cùng commit
- [ ] Cài Cloudflare GitHub App, cấp quyền đọc repo `NghiaAsi4n/drachma`
- [ ] Cloudflare Dashboard → Workers & Pages → Create → Pages → Connect to Git → chọn `NghiaAsi4n/drachma`
- [ ] Build settings: Framework preset `None`, Build command để trống, Build output directory `/`
- [ ] Deploy, mở `https://drachma.pages.dev/` kiểm tra 4 màn
- [ ] Xác nhận `manifest.json`, `sw.js`, `icons/` trả 200 ở gốc domain
- [ ] Supabase → Authentication → URL Configuration: thêm `https://drachma.pages.dev/` vào Redirect URLs (và domain riêng nếu có)
- [ ] Đăng nhập thử từ domain `pages.dev` để xác nhận CORS/redirect
- [ ] Trên iPhone: Safari mở link → Share → Add to Home Screen → mở từ icon
- [ ] Đăng nhập trên app đã cài, thêm 1 khoản, kiểm tra bản ghi lên Supabase
- [ ] Đóng app khỏi app switcher rồi mở lại: vẫn còn phiên, không hỏi đăng nhập lại
- [ ] Test offline sau khi cài: tắt Wi-Fi, thêm khoản, bật mạng lại và xác nhận đã sync
- [ ] Ghi link cài + hướng dẫn vào `README.md`
- [ ] (Tùy chọn) Custom domain: Cloudflare Pages → Custom domains + bản ghi DNS
- [x] File `_headers`: `sw.js` + `index.html` → `Cache-Control: no-cache`

**Lưu ý**
- Repo private vẫn deploy được; Cloudflare đọc repo qua GitHub App đã cấp quyền.
- App chạy ở gốc `drachma.pages.dev/` (không còn subpath), đường dẫn relative trong app vẫn đúng.
- Cloudflare chỉ host file tĩnh; dữ liệu nằm ở Supabase, không nằm trong repo.
- Mỗi lần sửa code: bump `CACHE_VERSION` trong `sw.js`, commit, push; iOS có thể phải đóng app khỏi app switcher rồi mở lại mới nhận bản mới.
- `PLAN.md` được commit để đồng bộ nhiều máy; commit và push đều phải chờ xác nhận.
- Vercel (free) cũng deploy được repo private nếu cần preview deploy; đổi host không ảnh hưởng Supabase.
- **Đang chặn:** cần tài khoản Cloudflare để deploy.

**Xong khi:** app cài được từ `drachma.pages.dev` trên iPhone, đăng nhập được, dữ liệu lên Supabase và offline vẫn dùng được.

## Không làm (ngoài scope skill)

- Premium banner / mua trong app
- Daily Reminder, theme Light/Dark, đa ngôn ngữ
- Income, đa tiền tệ, recurring, OCR, ngân sách chia sẻ nhiều người
- Hỗ trợ Android/desktop (chỉ giữ fallback font, không tối ưu)

## Thứ tự thực hiện

P0 → P1 → P2 → P3 → P4 → P5 → P6 → P7. Dừng sau mỗi phase để review trước khi sang phase kế tiếp.
