# Debug Guide - AI LOC Tracker Extension

## Vấn đề: "command 'aiLocTracker.showMetrics' not found"

### Các bước debug:

#### 1. Kiểm tra Extension đã được activate

**Trong VSCode/Cursor:**
1. Mở Output Panel: `View → Output` (hoặc `Cmd + Shift + U`)
2. Chọn "AI LOC Tracker" từ dropdown
3. Xem logs - phải thấy:
   ```
   AI LOC Tracker extension is activating...
   ✅ Command 'aiLocTracker.showMetrics' registered
   ```

**Nếu KHÔNG thấy logs:**
- Extension chưa được activate
- Có thể do lỗi trong quá trình load
- Kiểm tra Developer Console: `Help → Toggle Developer Tools`

#### 2. Kiểm tra Extension đã được cài đặt

**Trong VSCode/Cursor:**
1. `Cmd + Shift + X` (Extensions)
2. Tìm "AI LOC Tracker"
3. Phải thấy extension đã được cài đặt và enabled

#### 3. Kiểm tra Command có trong Command Palette

1. `Cmd + Shift + P`
2. Gõ: `AI LOC Tracker: Show Metrics`
3. Nếu KHÔNG thấy → Command chưa được register

#### 4. Reload Extension

1. `Cmd + Shift + P`
2. Gõ: `Developer: Reload Window`
3. Hoặc: `Developer: Restart Extension Host`

#### 5. Kiểm tra Settings

Đảm bảo có settings trong `settings.json`:
```json
{
  "aiCodeMetrics.backendUrl": "http://localhost:8000",
  "aiCodeMetrics.developerId": "your-id",
  "aiCodeMetrics.enabled": true
}
```

#### 6. Kiểm tra Compiled Code

Xem file `out/extension.js` có chứa:
```javascript
vscode.commands.registerCommand("aiLocTracker.showMetrics", ...)
```

#### 7. Test thủ công trong Developer Console

1. `Help → Toggle Developer Tools`
2. Trong Console, chạy:
```javascript
vscode.commands.executeCommand('aiLocTracker.showMetrics')
```

Nếu lỗi → Command chưa được register
Nếu không lỗi → Command đã được register nhưng có vấn đề khác

## Các lỗi thường gặp:

### Lỗi 1: Extension không activate
**Nguyên nhân:** Lỗi trong code khi activate
**Giải pháp:** Xem Output Channel để tìm lỗi cụ thể

### Lỗi 2: Command không được register
**Nguyên nhân:** Code return trước khi register command
**Giải pháp:** Đảm bảo command được register TRƯỚC mọi return statement

### Lỗi 3: Extension bị disable
**Nguyên nhân:** Extension bị disable trong Extensions panel
**Giải pháp:** Enable extension lại

### Lỗi 4: Version mismatch
**Nguyên nhân:** Compiled code không khớp với source
**Giải pháp:** Rebuild extension: `npm run build`

## Quick Fix Checklist:

- [ ] Extension đã được cài đặt
- [ ] Extension đã được enable
- [ ] Settings đã được cấu hình (developerId, backendUrl)
- [ ] Đã reload window sau khi cài extension
- [ ] Output Channel không có lỗi
- [ ] Command xuất hiện trong Command Palette
- [ ] Status bar item hiển thị (góc dưới bên phải)

## Nếu vẫn không hoạt động:

1. **Uninstall extension hoàn toàn:**
   - `Cmd + Shift + X` → Tìm extension → Uninstall
   - Xóa folder extension (nếu có)
   - Restart VSCode/Cursor

2. **Cài lại extension:**
   - `Cmd + Shift + P` → `Extensions: Install from VSIX...`
   - Chọn file `.vsix` mới nhất
   - Reload window

3. **Kiểm tra VSCode/Cursor version:**
   - Extension yêu cầu VSCode >= 1.74.0
   - Kiểm tra: `Help → About`

4. **Report issue với logs:**
   - Copy toàn bộ logs từ Output Channel
   - Copy errors từ Developer Console
   - Gửi kèm version VSCode/Cursor

