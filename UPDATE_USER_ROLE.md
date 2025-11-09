# Update User Role API

## Endpoint
`PATCH /api/users/:id/role`

## Description
Updates a user's role. Only accessible by SUPER_ADMIN users.

## Access Control
- **Required Role**: SUPER_ADMIN only
- **Authentication**: JWT token required

## Request

### URL Parameters
- `id` (string, required): The user ID to update

### Body Parameters
```json
{
  "role": "SUPER_ADMIN" | "ACCESS_ADMIN" | "ORG_ADMIN" | "INDIVIDUAL" | "ORG_WARD"
}
```

## Response

### Success Response (200 OK)
```json
{
  "success": true,
  "message": "User role updated to SUPER_ADMIN successfully",
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "username": "johndoe",
      "role": "SUPER_ADMIN",
      "isActive": true,
      "emailVerified": true,
      "createdAt": "2025-11-09T...",
      "updatedAt": "2025-11-09T..."
    }
  }
}
```

### Error Responses

#### 400 Bad Request - Missing role
```json
{
  "success": false,
  "message": "Role is required"
}
```

#### 400 Bad Request - Invalid role
```json
{
  "success": false,
  "message": "Invalid role. Must be one of: SUPER_ADMIN, ACCESS_ADMIN, ORG_ADMIN, INDIVIDUAL, ORG_WARD"
}
```

#### 404 Not Found - User doesn't exist
```json
{
  "success": false,
  "message": "User not found"
}
```

#### 401 Unauthorized - Not authenticated
```json
{
  "success": false,
  "message": "Authentication required"
}
```

#### 403 Forbidden - Not SUPER_ADMIN
```json
{
  "success": false,
  "message": "Access denied. Super admin privileges required"
}
```

## Usage Examples

### Using cURL

#### 1. Make existing user a SUPER_ADMIN
```bash
curl -X PATCH http://localhost:3001/api/users/{USER_ID}/role \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"role": "SUPER_ADMIN"}'
```

#### 2. Make existing user an ACCESS_ADMIN
```bash
curl -X PATCH http://localhost:3001/api/users/{USER_ID}/role \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"role": "ACCESS_ADMIN"}'
```

### Using Postman

1. **Method**: PATCH
2. **URL**: `http://localhost:3001/api/users/{USER_ID}/role`
3. **Headers**:
   - `Authorization`: `Bearer YOUR_JWT_TOKEN`
   - `Content-Type`: `application/json`
4. **Body** (raw JSON):
```json
{
  "role": "SUPER_ADMIN"
}
```

### Using the Backend Database Script

You can also use the existing `db-admin.ts` script:

```bash
cd Backend
npm run db:admin update-role john@example.com SUPER_ADMIN
```

## How to Get User ID

### Method 1: Database Query
```bash
cd Backend
npm run db:admin list-users
```

### Method 2: Check database directly
```bash
cd Backend
npm run db:console
```
Then run:
```sql
SELECT id, name, email, username, role FROM users WHERE email = 'user@example.com';
```

### Method 3: Login and check response
When you login, the response includes the user ID:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "your-user-id-here",
      ...
    }
  }
}
```

## Common Use Cases

### Scenario 1: Promote an existing user to SUPER_ADMIN
1. Login as existing SUPER_ADMIN
2. Get the target user's ID (from database or user management page)
3. Call `PATCH /api/users/{USER_ID}/role` with `{"role": "SUPER_ADMIN"}`

### Scenario 2: Create an ACCESS_ADMIN for resource management only
1. Login as SUPER_ADMIN
2. Get the user's ID
3. Call `PATCH /api/users/{USER_ID}/role` with `{"role": "ACCESS_ADMIN"}`
4. User can now login and will be redirected directly to `/admin/settings`

### Scenario 3: Change user from ORG_ADMIN to SUPER_ADMIN
1. Login as SUPER_ADMIN
2. Get the ORG_ADMIN user's ID
3. Call `PATCH /api/users/{USER_ID}/role` with `{"role": "SUPER_ADMIN"}`
4. User now has super admin privileges

## Security Notes

- ⚠️ Only SUPER_ADMIN users can change roles
- ⚠️ There is no frontend UI for this yet - must use API directly
- ⚠️ Be careful when changing roles - no confirmation dialog
- ⚠️ User must logout and login again for role change to take full effect

## Available Roles

| Role | Description | Dashboard Access |
|------|-------------|------------------|
| `SUPER_ADMIN` | Full system access | `/super-admin-dashboard` |
| `ACCESS_ADMIN` | Resource management only | `/admin/settings` (direct) |
| `ORG_ADMIN` | Organization management | `/organization-dashboard` |
| `ORG_WARD` | Student/ward user | `/ecosystem` |
| `INDIVIDUAL` | Individual user | `/ecosystem` |

## Testing the Endpoint

1. **Start the backend**:
```bash
cd Backend
npm run dev
```

2. **Login as SUPER_ADMIN** (use existing super admin account or create one with db-admin script)

3. **Get JWT token** from login response

4. **Find user ID** you want to update (use db:admin list-users)

5. **Call the endpoint**:
```bash
curl -X PATCH http://localhost:3001/api/users/USER_ID_HERE/role \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"role": "ACCESS_ADMIN"}'
```

6. **Verify** by logging in as that user - they should be redirected to appropriate dashboard
