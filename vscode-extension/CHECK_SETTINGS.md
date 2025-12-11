# Hướng dẫn kiểm tra Settings trong Cursor (macOS)

## Cách 1: Qua UI Settings (Dễ nhất)

1. **Mở Settings:**
   - Nhấn `Cmd + ,` (Command + dấu phẩy)
   - Hoặc `Cmd + Shift + P` → gõ "Preferences: Open Settings"

2. **Tìm extension settings:**
   - Trong ô tìm kiếm ở trên cùng, gõ: `aiCodeMetrics`
   - Hoặc tìm: `AI LOC Tracker`

3. **Kiểm tra các settings:**
   - ✅ **AI Code Metrics: Backend Url** → Phải là `http://localhost:8000`
   - ✅ **AI Code Metrics: Developer Id** → Phải có giá trị (ví dụ: `dev1`, `your-name`)
   - ✅ **AI Code Metrics: Enabled** → Phải được bật (checked)

## Cách 2: Qua Settings JSON (Nhanh nhất)

1. **Mở Settings JSON:**
   - Nhấn `Cmd + Shift + P`
   - Gõ: `Preferences: Open User Settings (JSON)`
   - Nhấn Enter

2. **Thêm hoặc kiểm tra các dòng sau:**

```json
{
  "aiCodeMetrics.backendUrl": "http://localhost:8000",
  "aiCodeMetrics.developerId": "your-developer-id",
  "aiCodeMetrics.enabled": true
}
```

**Lưu ý:** Thay `"your-developer-id"` bằng ID thực tế của bạn (ví dụ: `"dev1"`, `"baohoton"`, v.v.)

3. **Lưu file:** `Cmd + S`

## Cách 3: Qua Command Palette

1. Nhấn `Cmd + Shift + P`
2. Gõ: `Preferences: Open Settings`
3. Tìm `aiCodeMetrics` trong search box

## Cách 4: Kiểm tra qua Terminal (Advanced)

Settings được lưu trong file JSON. Vị trí file trên macOS:

**User Settings:**
```bash
# Cursor
~/Library/Application Support/Cursor/User/settings.json

# VSCode (nếu dùng VSCode)
~/Library/Application Support/Code/User/settings.json
```

**Kiểm tra bằng lệnh:**
```bash
# Xem settings hiện tại
cat ~/Library/Application\ Support/Cursor/User/settings.json | grep -A 3 aiCodeMetrics

# Hoặc mở file để xem toàn bộ
open ~/Library/Application\ Support/Cursor/User/settings.json
```

## Kiểm tra nhanh bằng script

Tạo file script để kiểm tra:

```bash
#!/bin/bash
SETTINGS_FILE="$HOME/Library/Application Support/Cursor/User/settings.json"

if [ -f "$SETTINGS_FILE" ]; then
    echo "=== Checking AI LOC Tracker Settings ==="
    echo ""
    
    if grep -q "aiCodeMetrics.backendUrl" "$SETTINGS_FILE"; then
        echo "✅ Backend URL found:"
        grep "aiCodeMetrics.backendUrl" "$SETTINGS_FILE"
    else
        echo "❌ Backend URL NOT found"
    fi
    
    if grep -q "aiCodeMetrics.developerId" "$SETTINGS_FILE"; then
        echo "✅ Developer ID found:"
        grep "aiCodeMetrics.developerId" "$SETTINGS_FILE"
    else
        echo "❌ Developer ID NOT found"
    fi
    
    if grep -q "aiCodeMetrics.enabled" "$SETTINGS_FILE"; then
        echo "✅ Enabled setting found:"
        grep "aiCodeMetrics.enabled" "$SETTINGS_FILE"
    else
        echo "❌ Enabled setting NOT found"
    fi
else
    echo "❌ Settings file not found at: $SETTINGS_FILE"
fi
```

## Troubleshooting

### Nếu không thấy settings:

1. **Extension chưa được cài đặt:**
   - Kiểm tra: `Cmd + Shift + X` (Extensions)
   - Tìm "AI LOC Tracker"
   - Nếu chưa có, cài lại từ file `.vsix`

2. **Settings không xuất hiện:**
   - Restart Cursor
   - Hoặc thêm thủ công vào Settings JSON

### Nếu settings không lưu:

1. Kiểm tra quyền ghi file
2. Đảm bảo JSON syntax đúng (có dấu phẩy đúng chỗ)
3. Restart Cursor sau khi thay đổi

## Ví dụ Settings JSON hoàn chỉnh

```json
{
  "editor.fontSize": 14,
  "editor.tabSize": 2,
  "aiCodeMetrics.backendUrl": "http://localhost:8000",
  "aiCodeMetrics.developerId": "dev1",
  "aiCodeMetrics.enabled": true
}
```

**Quan trọng:** 
- `developerId` KHÔNG được để trống `""`
- `backendUrl` phải đúng với địa chỉ backend đang chạy
- `enabled` phải là `true` để extension hoạt động



