# AI LOC Tracker - Keyboard Shortcuts

## Cách mở Metrics UI

Có **3 cách** để mở Metrics Dashboard:

### 1. Phím tắt (Keyboard Shortcut) ⚡

**macOS:** `Cmd + Shift + M`

**Windows/Linux:** `Ctrl + Shift + M`

> **Lưu ý:** Sau khi cài extension, bạn có thể cần reload Cursor/VSCode để phím tắt có hiệu lực.

### 2. Status Bar (Thanh trạng thái) 📊

- Nhìn vào góc dưới bên phải của Cursor/VSCode
- Bạn sẽ thấy icon **"$(graph) AI LOC"**
- **Click vào icon này** để mở Metrics Dashboard

### 3. Command Palette 🎯

1. Nhấn `Cmd + Shift + P` (macOS) hoặc `Ctrl + Shift + P` (Windows/Linux)
2. Gõ: `AI LOC Tracker: Show Metrics`
3. Nhấn Enter

## Tùy chỉnh phím tắt

Nếu bạn muốn thay đổi phím tắt:

1. Mở Command Palette: `Cmd + Shift + P` (hoặc `Ctrl + Shift + P`)
2. Gõ: `Preferences: Open Keyboard Shortcuts`
3. Tìm: `AI LOC Tracker: Show Metrics`
4. Click vào icon bút chì bên cạnh
5. Nhấn phím tắt mới bạn muốn
6. Nhấn Enter để lưu

## Troubleshooting

### Phím tắt không hoạt động?

1. **Reload Cursor/VSCode:**
   - `Cmd + Shift + P` → `Developer: Reload Window`

2. **Kiểm tra conflict:**
   - Mở Keyboard Shortcuts
   - Tìm `Cmd + Shift + M` xem có bị conflict không
   - Nếu có, đổi phím tắt khác

3. **Kiểm tra extension đã activate:**
   - Xem Output Channel: `View → Output → Select "AI LOC Tracker"`
   - Phải thấy message: "✅ AI LOC Tracker activated"

### Status bar không hiển thị?

1. Kiểm tra extension đã được cài đặt
2. Kiểm tra `developerId` đã được set trong settings
3. Reload window



