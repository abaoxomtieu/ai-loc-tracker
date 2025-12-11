# MCP Server Usage Guide

## Simplified API

API đã được đơn giản hóa để dễ sử dụng hơn.

## Tools

### 1. `track_agent_code`

Track code được generate bởi AI agent.

**Parameters:**
- `loc_count` (int): Số dòng code (LOC) - bắt buộc
- `file_path` (str): Đường dẫn file - bắt buộc
- `feature_name` (str): Tên feature - mặc định: "unknown"
- `code_type` (str): Loại code - "code", "test", hoặc "documentation" - mặc định: "code"
- `developer_id` (str): ID developer - mặc định: "unknown"

**Example:**
```python
track_agent_code(
    loc_count=50,
    file_path="src/auth.py",
    feature_name="User Authentication",
    code_type="code",
    developer_id="agent-user"
)
```

### 2. `track_agent_feature_completion`

Track khi AI agent hoàn thành một feature.

**Parameters:**
- `feature_name` (str): Tên feature - bắt buộc
- `loc_count` (int): Tổng số LOC - bắt buộc
- `files_modified` (list[str]): Danh sách files đã modify - optional
- `developer_id` (str): ID developer - mặc định: "unknown"

**Example:**
```python
track_agent_feature_completion(
    feature_name="Complete Authentication System",
    loc_count=150,
    files_modified=["src/auth.py", "tests/test_auth.py"],
    developer_id="agent-user"
)
```

## Resources

### `metrics://developer/{developer_id}`

Get metrics cho một developer cụ thể.

### `metrics://team`

Get team-wide metrics và leaderboard.

## Thay đổi so với version cũ

**Trước:**
- `code: str` - phải truyền toàn bộ code
- `language: str` - phải specify language
- Tự động count LOC từ code

**Sau:**
- `loc_count: int` - chỉ cần truyền số LOC (đơn giản hơn)
- `feature_name: str` - thay thế language bằng feature name
- Không cần truyền code, chỉ cần số LOC

## Lợi ích

✅ **Đơn giản hơn**: Không cần truyền toàn bộ code
✅ **Nhanh hơn**: Chỉ cần số LOC
✅ **Linh hoạt**: Có thể estimate hoặc dùng số chính xác
✅ **Dễ sử dụng**: Ít parameters hơn






