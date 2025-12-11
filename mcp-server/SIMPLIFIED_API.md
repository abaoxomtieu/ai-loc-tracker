# Simplified MCP API

## Only 2 Tools

### 1. `list_recent_features(limit=20)`

**Call this FIRST** before generating any code.

Returns list of recent features with their total LOC counts.

**Example:**
```python
features = list_recent_features(limit=20)
# Shows:
# - User Authentication: 100 LOC
# - Payment System: 200 LOC
# - Dashboard UI: 50 LOC
```

### 2. `track_agent_code(loc_count, feature_name, total_files=1, code_type="code", developer_id="unknown")`

**Call this ONCE at the END of your response** (after all file updates).

**Parameters:**
- `loc_count` (int): Total LOC across all files - REQUIRED
- `feature_name` (str): Feature name from user - REQUIRED (never "unknown")
- `total_files` (int): Number of files updated - default: 1
- `code_type` (str): "code", "test", or "documentation" - default: "code"
- `developer_id` (str): Developer ID - default: "unknown"

**Example:**
```python
# After generating code and updating 3 files with 150 total LOC
track_agent_code(
    loc_count=150,
    feature_name="Payment System",  # From user
    total_files=3,
    code_type="code"
)
```

## Workflow

1. **Start**: Call `list_recent_features()` → Show to user
2. **Ask**: "Which feature are you working on?"
3. **Generate**: Generate code and update files
4. **End**: Call `track_agent_code()` ONCE before finishing response

## Important Notes

- ✅ `list_recent_features()`: Call at the START
- ✅ `track_agent_code()`: Call ONCE at the END
- ❌ No `file_path` parameter (removed)
- ✅ `total_files`: Number of files updated
- ❌ No `track_agent_feature_completion()` (removed)






