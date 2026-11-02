# Drachma — Thu Chi

PWA ghi chi tiêu cá nhân, offline-first, giao diện tối kiểu "Greek god". Không build, không dependency.

## Chạy local

```bash
python -m http.server 4173
```

Mở `http://localhost:4173`.

## Cấu trúc

```text
index.html      khung app + tab bar + sheet
style.css       theme, layout, component
app.js          state, render, data layer, export/import
sw.js           service worker, cache-first app shell
manifest.json   cấu hình PWA
icons/          icon 192/512/maskable + apple-touch-icon
PLAN.md         checklist tiến độ
```

## Deploy (Cloudflare Pages, repo private)

1. Push repo lên GitHub (private).
2. Cloudflare Dashboard → Workers & Pages → Create → Pages → Connect to Git.
3. Chọn repo `drachma`.
4. Framework preset `None`, build command để trống, build output directory `/`.
5. Deploy và mở `https://drachma.pages.dev/`.

Supabase (khi làm P5): thêm domain `https://drachma.pages.dev/` vào Authentication → URL Configuration → Redirect URLs.

## Cài trên iPhone

Safari → mở link HTTPS → **Share** → **Add to Home Screen** → mở app từ icon.

`localStorage` của app đã cài tách biệt với tab Safari, nên hãy cài trước rồi mới nhập dữ liệu. Dữ liệu nhập trong tab Safari sẽ không chuyển sang app.

## Dữ liệu & backup

- Hiện dữ liệu nằm trên máy trong `localStorage`, key `thuchi.v1`.
- Settings → **Export backup (JSON)** → lưu vào Files/iCloud qua share sheet.
- iOS có thể xoá storage khi thiếu dung lượng hoặc khi xoá app → backup định kỳ.
- Cloud sync Supabase: xem `PLAN.md` P5 (chưa triển khai).

## Font

Dùng font hệ thống iOS: SF Pro cho UI/số tiền, New York cho dòng tháng. Không tải webfont nên chạy offline ngay.

## Ghi chú

- Mỗi lần sửa `app.js`/`style.css`/`index.html`: bump `CACHE_VERSION` trong `sw.js` rồi mới deploy.
- Không có backend; host chỉ phục vụ file tĩnh.
