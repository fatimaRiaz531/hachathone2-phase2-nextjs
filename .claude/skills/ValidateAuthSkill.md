# Validate Authentication Skill

Validate authentication implementations and scenarios using mock JWT tokens.

## Input
$ARGUMENTS - Code snippet or auth scenario (e.g., "Invalid token on GET tasks", "Expired JWT on POST /tasks")

## Instructions

Based on the provided input: **$ARGUMENTS**

### 1. Parse Input Type

Determine input type:
- **Code snippet**: Validate implementation correctness
- **Scenario**: Test auth flow against expected behavior

### 2. Mock JWT Configuration

Use these mock tokens for testing:

```python
# =============================================================================
# Mock JWT Tokens for Validation
# =============================================================================

import jwt
from datetime import datetime, timedelta

SECRET_KEY = "test-secret-key-for-validation-only"
ALGORITHM = "HS256"

# Valid token (user_id: 1, expires in 1 hour)
MOCK_VALID_TOKEN = jwt.encode(
    {
        "sub": "1",
        "user_id": 1,
        "email": "test@example.com",
        "exp": datetime.utcnow() + timedelta(hours=1),
        "iat": datetime.utcnow()
    },
    SECRET_KEY,
    algorithm=ALGORITHM
)

# Expired token (expired 1 hour ago)
MOCK_EXPIRED_TOKEN = jwt.encode(
    {
        "sub": "1",
        "user_id": 1,
        "exp": datetime.utcnow() - timedelta(hours=1),
        "iat": datetime.utcnow() - timedelta(hours=2)
    },
    SECRET_KEY,
    algorithm=ALGORITHM
)

# Invalid signature token
MOCK_INVALID_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwidXNlcl9pZCI6MX0.invalid_signature"

# Malformed token
MOCK_MALFORMED_TOKEN = "not.a.valid.jwt.token"

# Missing claims token
MOCK_MISSING_CLAIMS_TOKEN = jwt.encode(
    {"random": "data"},
    SECRET_KEY,
    algorithm=ALGORITHM
)
```

### 3. Validation Scenarios

| Scenario | Expected Behavior | HTTP Status |
|----------|-------------------|-------------|
| Valid token | Request proceeds | 200/201 |
| Missing token | Unauthorized | 401 |
| Expired token | Unauthorized | 401 |
| Invalid signature | Unauthorized | 401 |
| Malformed token | Unauthorized | 401 |
| Missing required claims | Unauthorized | 401 |
| Wrong user_id in path | Forbidden | 403 |
| Valid token, resource not found | Not Found | 404 |

### 4. Validation Checks

#### For Code Snippets:
- [ ] Token extraction from Authorization header
- [ ] Bearer prefix handling
- [ ] JWT decode with signature verification
- [ ] Expiration check (`exp` claim)
- [ ] Required claims validation (`sub`, `user_id`)
- [ ] User ID path parameter matching
- [ ] Proper error responses with correct status codes
- [ ] No sensitive data in error messages

#### For Scenarios:
- [ ] Expected HTTP status returned
- [ ] Error message format correct
- [ ] Token properly rejected/accepted
- [ ] No information leakage

### 5. Validation Report Format

```
## Authentication Validation Report

**Input:** [code snippet or scenario description]
**Date:** [ISO date]
**Validator:** ValidateAuthSkill

---

### Summary

| Status | Result |
|--------|--------|
| Overall | ✅ PASS / ❌ FAIL |
| Checks Passed | X/Y |
| Critical Issues | N |

---

### Detailed Results

#### Check 1: [Check Name]
- **Status:** ✅ PASS / ❌ FAIL
- **Expected:** [expected behavior]
- **Actual:** [actual behavior]
- **Evidence:** [code reference or test output]

#### Check 2: [Check Name]
...

---

### Issues Found

| # | Severity | Issue | Location | Fix |
|---|----------|-------|----------|-----|
| 1 | CRITICAL/HIGH/MEDIUM/LOW | [description] | [file:line] | [suggested fix] |

---

### Suggested Fixes

#### Issue 1: [Issue Title]

**Problem:**
[description of the issue]

**Current Code:**
\`\`\`python
[problematic code]
\`\`\`

**Fixed Code:**
\`\`\`python
# [Task]: T-XXX
# [From]: @specs/auth/spec.md#validation
[corrected code]
\`\`\`

---

### Test Commands

\`\`\`bash
# Test with valid token
curl -X GET "http://localhost:8000/api/1/tasks" \
  -H "Authorization: Bearer ${VALID_TOKEN}"

# Test with expired token
curl -X GET "http://localhost:8000/api/1/tasks" \
  -H "Authorization: Bearer ${EXPIRED_TOKEN}"

# Test with missing token
curl -X GET "http://localhost:8000/api/1/tasks"
\`\`\`

---

### Recommendations

1. [Recommendation 1]
2. [Recommendation 2]
```

### 6. Common Auth Vulnerabilities to Check

| Vulnerability | Check | Severity |
|---------------|-------|----------|
| No signature verification | Decode without verify | CRITICAL |
| Algorithm confusion | Accept "none" algorithm | CRITICAL |
| Missing expiration check | No exp validation | HIGH |
| Information leakage | Detailed error messages | MEDIUM |
| Missing rate limiting | No brute-force protection | MEDIUM |
| Hardcoded secrets | SECRET_KEY in code | CRITICAL |

### 7. Example Validation Test

```python
# =============================================================================
# [Task]: T-AUTH-VAL
# [From]: @specs/auth/spec.md#validation
# [Description]: Auth validation test cases
# =============================================================================

import pytest
from fastapi.testclient import TestClient

def test_valid_token_accepted(client: TestClient):
    """Valid JWT should allow access."""
    response = client.get(
        "/api/1/tasks",
        headers={"Authorization": f"Bearer {MOCK_VALID_TOKEN}"}
    )
    assert response.status_code == 200

def test_expired_token_rejected(client: TestClient):
    """Expired JWT should return 401."""
    response = client.get(
        "/api/1/tasks",
        headers={"Authorization": f"Bearer {MOCK_EXPIRED_TOKEN}"}
    )
    assert response.status_code == 401
    assert "expired" in response.json()["detail"].lower()

def test_missing_token_rejected(client: TestClient):
    """Missing token should return 401."""
    response = client.get("/api/1/tasks")
    assert response.status_code == 401

def test_invalid_token_rejected(client: TestClient):
    """Invalid signature should return 401."""
    response = client.get(
        "/api/1/tasks",
        headers={"Authorization": f"Bearer {MOCK_INVALID_TOKEN}"}
    )
    assert response.status_code == 401

def test_wrong_user_forbidden(client: TestClient):
    """Token for user 1 accessing user 2 resources should return 403."""
    response = client.get(
        "/api/2/tasks",  # Different user_id
        headers={"Authorization": f"Bearer {MOCK_VALID_TOKEN}"}  # Token for user 1
    )
    assert response.status_code == 403
```

## Example Usage

```
/ValidateAuthSkill Invalid token on GET /api/1/tasks
```

```
/ValidateAuthSkill
def get_current_user(token: str = Depends(oauth2_scheme)):
    payload = jwt.decode(token, SECRET_KEY)  # Missing verify!
    return payload
```

## Output Location

Validation reports saved to: `specs/auth/validation-reports/`
