# Agent Workflow - AI LOC Tracker

## Mandatory Workflow

### Step 1: List Recent Features (ALWAYS FIRST)

**Before generating ANY code**, you MUST:

```python
# Call this FIRST
features = list_recent_features(limit=20)

# Display to user
print("Recent features:")
for feature in features["features"]:
    print(f"  - {feature['feature_name']}: {feature['total_loc']} LOC")
```

### Step 2: Ask User for Feature Name

**ALWAYS ask the user** which feature they're working on:

```
I see these recent features:
  - User Authentication: 100 LOC
  - Payment Processing: 200 LOC
  - Dashboard UI: 50 LOC

Which feature are you working on?
- Type an existing feature name to UPDATE it
- Or type a NEW feature name to create one
```

### Step 3: Generate Code

Generate the code as requested.

### Step 4: Track Code (MANDATORY)

**IMMEDIATELY after generating code**, call:

```python
track_agent_code(
    loc_count=<count_lines>,  # Count the lines you generated
    file_path=<file_path>,     # Path to the file
    feature_name=<user_input>, # EXACT name from Step 2
    code_type="code",          # or "test" or "documentation"
    developer_id="agent-user"  # or ask user
)
```

## Examples

### Example 1: New Feature

```python
# 1. List features
features = list_recent_features()
# Shows: "User Authentication: 100 LOC"

# 2. User says: "I want to implement Payment Processing"

# 3. Generate code
code = generate_payment_code()
loc_count = count_lines(code)  # e.g., 150

# 4. Track
track_agent_code(
    loc_count=150,
    file_path="src/payment.py",
    feature_name="Payment Processing",  # From user
    code_type="code"
)
```

### Example 2: Update Existing Feature

```python
# 1. List features
features = list_recent_features()
# Shows: "User Authentication: 100 LOC"

# 2. User says: "Add password reset to User Authentication"

# 3. Generate code
code = generate_password_reset()
loc_count = count_lines(code)  # e.g., 50

# 4. Track with EXACT name
track_agent_code(
    loc_count=50,
    file_path="src/auth.py",
    feature_name="User Authentication",  # EXACT match from list
    code_type="code"
)
# Now "User Authentication" will have 150 LOC total
```

## Rules

✅ **MUST DO:**
- Always call `list_recent_features()` first
- Always show features to user
- Always ask user for feature_name
- Always call `track_agent_code()` after code generation
- Use EXACT feature_name from list if updating

❌ **NEVER DO:**
- Skip listing features
- Use "unknown" as feature_name
- Assume feature name
- Skip tracking code

## Feature Completion

When completing a full feature:

```python
track_agent_feature_completion(
    feature_name="User Authentication",  # Same as used in track_agent_code
    loc_count=150,  # Total LOC for the feature
    files_modified=["src/auth.py", "tests/test_auth.py"],
    developer_id="agent-user"
)
```

## Benefits

- ✅ Consistent feature tracking
- ✅ Easy to see which features are being worked on
- ✅ Accurate LOC counts per feature
- ✅ Prevents duplicate/conflicting feature names






