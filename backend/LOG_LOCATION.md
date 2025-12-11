# Vị trí lưu log files

## Đường dẫn mặc định

Log files được lưu tại: **`backend/logs/`**

Đường dẫn đầy đủ: `LOC/backend/logs/`

## Các file log

1. **`code_insertions.json`** - Code insertion events

   - Format: JSON array (tất cả events trong một array)
   - Chứa: completion, agent, manual code events

2. **`test_generations.json`** - Test generation events

   - Format: JSON array
   - Chứa: test code events

3. **`documentation.json`** - Documentation events
   - Format: JSON array
   - Chứa: documentation events

## Xem log

### Xem tất cả events:

```bash
cat backend/logs/code_insertions.json
```

### Xem và format JSON (đã được format sẵn):

```bash
cat backend/logs/code_insertions.json | python3 -m json.tool
```

### Đếm số events:

```bash
python3 -c "import json; print(len(json.load(open('backend/logs/code_insertions.json'))))"
```

### Xem events gần nhất (5 events cuối):

```bash
python3 -c "import json; events = json.load(open('backend/logs/code_insertions.json')); [print(json.dumps(e, indent=2)) for e in events[-5:]]"
```

### Xem events của một developer cụ thể:

```bash
python3 -c "import json; events = json.load(open('backend/logs/code_insertions.json')); dev_events = [e for e in events if e.get('developer_id') == 'dev1']; print(json.dumps(dev_events, indent=2))"
```

## Thay đổi đường dẫn lưu log

Để thay đổi đường dẫn, sửa trong `backend/src/storage/json_storage.py`:

```python
storage = JSONStorage(data_dir=Path("/custom/path/to/logs"))
```

Hoặc set environment variable:

```bash
export AI_METRICS_DATA_DIR=/custom/path/to/logs
```

**Lưu ý**: Mặc định log được lưu tại `backend/logs/` (relative to backend directory)

## Format của file

File JSON chứa một array các events:

```json
[
  {
    "type": "code",
    "source": "completion",
    "lines": 10,
    "file_path": "/path/to/file.py",
    "language": "python",
    "developer_id": "dev1",
    "timestamp": "2025-12-11T09:44:50.381570",
    "metadata": null
  },
  {
    "type": "code",
    "source": "manual",
    "lines": 8,
    "file_path": "/path/to/file2.py",
    "language": "python",
    "developer_id": "dev1",
    "timestamp": "2025-12-11T09:45:00.123456",
    "metadata": null
  }
]
```

## Ưu điểm của JSON format

- ✅ Dễ đọc và format (indented JSON)
- ✅ Dễ parse và validate
- ✅ Có thể edit bằng text editor
- ✅ Hỗ trợ tốt bởi các tools JSON

## Lưu ý

- Mỗi khi có event mới, toàn bộ file JSON được ghi lại (append vào array)
- Với số lượng events lớn, có thể cần optimize (batch writes)
- File JSON được format với indent=2 để dễ đọc
