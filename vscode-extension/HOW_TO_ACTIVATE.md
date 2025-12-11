# Hướng dẫn Activate Extension - AI LOC Tracker

## Extension tự động activate

Extension sẽ tự động được activate khi VSCode/Cursor khởi động (vì có `activationEvents: ["onStartupFinished"]`).

## Các bước cài đặt và activate

### Bước 1: Cài Extension từ VSIX

1. **Mở VSCode/Cursor**
2. **Mở Command Palette:**
   - macOS: `Cmd + Shift + P`
   - Windows/Linux: `Ctrl + Shift + P`
3. **Gõ và chọn:**
   ```
   Extensions: Install from VSIX...
   ```
4. **Chọn file:** `ai-loc-tracker-0.1.0.vsix`
5. **Chờ cài đặt hoàn tất**

### Bước 2: Kiểm tra Extension đã được cài

1. **Mở Extensions panel:**
   - `Cmd + Shift + X` (hoặc `Ctrl + Shift + X`)
   - Hoặc click icon Extensions ở sidebar bên trái
2. **Tìm "AI LOC Tracker"**
3. **Kiểm tra:**
   - ✅ Extension hiển thị trong danh sách
   - ✅ Có nút "Enable" (nếu bị disable) hoặc "Disable" (nếu đã enable)
   - ✅ Không có nút "Install" (đã được cài)

### Bước 3: Reload Window để activate

Extension sẽ tự động activate khi VSCode khởi động, nhưng sau khi cài mới, bạn cần reload:

1. **Mở Command Palette:** `Cmd + Shift + P`
2. **Gõ và chọn:**
   ```
   Developer: Reload Window
   ```
3. **Hoặc:** Đóng và mở lại VSCode/Cursor

### Bước 4: Kiểm tra Extension đã được activate

#### Cách 1: Kiểm tra Output Channel

1. **Mở Output Panel:**
   - `View → Output` (hoặc `Cmd + Shift + U`)
2. **Trong dropdown, tìm "AI LOC Tracker"**
3. **Nếu thấy** → Extension đã được activate ✅
4. **Nếu KHÔNG thấy** → Extension chưa được activate ❌

#### Cách 2: Kiểm tra Status Bar

1. **Nhìn vào góc dưới bên phải của VSCode**
2. **Tìm icon:** `$(graph) AI LOC`
3. **Nếu thấy** → Extension đã được activate ✅
4. **Nếu KHÔNG thấy** → Extension chưa được activate ❌

#### Cách 3: Kiểm tra Command Palette

1. **Mở Command Palette:** `Cmd + Shift + P`
2. **Gõ:** `AI LOC Tracker: Show Metrics`
3. **Nếu thấy command** → Extension đã được activate ✅
4. **Nếu KHÔNG thấy** → Extension chưa được activate ❌

#### Cách 4: Kiểm tra Developer Console (Advanced)

1. **Mở Developer Tools:**
   - `Help → Toggle Developer Tools`
2. **Vào tab Console**
3. **Tìm message:**
   ```
   AI LOC Tracker extension is activating...
   ```
4. **Nếu thấy** → Extension đã được activate ✅

## Activate thủ công (nếu cần)

Nếu extension không tự động activate, bạn có thể activate thủ công:

### Cách 1: Qua Developer Console

1. **Mở Developer Tools:** `Help → Toggle Developer Tools`
2. **Vào tab Console**
3. **Chạy lệnh:**
   ```javascript
   vscode.extensions.getExtension('ai-loc-tracker.ai-loc-tracker')?.activate()
   ```
4. **Kiểm tra kết quả** - phải trả về `Promise` hoặc không có lỗi

### Cách 2: Qua Command

1. **Mở Command Palette:** `Cmd + Shift + P`
2. **Gõ:** `AI LOC Tracker: Show Metrics`
3. **Nếu command hoạt động** → Extension sẽ được activate tự động

## Troubleshooting

### Vấn đề 1: Extension không activate sau khi cài

**Giải pháp:**
1. Reload Window: `Cmd + Shift + P` → `Developer: Reload Window`
2. Hoặc restart VSCode/Cursor hoàn toàn

### Vấn đề 2: Extension bị disable

**Giải pháp:**
1. Mở Extensions panel: `Cmd + Shift + X`
2. Tìm "AI LOC Tracker"
3. Click nút "Enable"

### Vấn đề 3: Extension activate nhưng không thấy Output Channel

**Giải pháp:**
1. Kiểm tra Developer Console có lỗi không
2. Thử activate thủ công qua Developer Console
3. Xem logs trong Developer Console

### Vấn đề 4: Extension không xuất hiện trong Extensions panel

**Giải pháp:**
1. Kiểm tra file `.vsix` có hợp lệ không
2. Thử cài lại extension
3. Kiểm tra VSCode version (phải >= 1.74.0)

## Checklist sau khi cài

- [ ] Extension hiển thị trong Extensions panel
- [ ] Extension đã được enable
- [ ] Đã reload window
- [ ] Output Channel "AI LOC Tracker" xuất hiện trong dropdown
- [ ] Status bar item `$(graph) AI LOC` hiển thị
- [ ] Command "AI LOC Tracker: Show Metrics" có trong Command Palette

## Lưu ý quan trọng

1. **Extension tự động activate** khi VSCode khởi động (sau khi cài lần đầu)
2. **Không cần activate thủ công** trong hầu hết trường hợp
3. **Reload window** là cách đơn giản nhất để activate extension sau khi cài mới
4. **Output Channel** là cách tốt nhất để kiểm tra extension đã activate chưa

