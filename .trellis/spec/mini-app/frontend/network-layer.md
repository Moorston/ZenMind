# Network Layer

## Network Wrapper

All HTTP requests go through the `Network` namespace in `src/network.ts`. This wraps Taro's request APIs and handles URL prefixing.

**CRITICAL**: Never use `Taro.request`, `Taro.uploadFile`, or `Taro.downloadFile` directly. Always use `Network.request`, `Network.uploadFile`, `Network.downloadFile`.

Reference: `src/network.ts`

### URL Resolution

The `PROJECT_DOMAIN` constant is injected at build time (Taro/Vite DefinePlugin). The `createUrl()` helper:

- If URL starts with `http://` or `https://` → use as-is (external URL).
- Otherwise → prepend `PROJECT_DOMAIN`.

In H5 development, Vite's proxy forwards `/api/*` to `http://localhost:3000` — so relative paths work without a configured `PROJECT_DOMAIN`.

**CRITICAL**: Never hardcode `http://localhost:3000` or any domain in request URLs. Always use relative paths like `/api/courses`.

### Request Pattern

```typescript
import { Network } from '@/network'

// GET
const res = await Network.request({ url: '/api/courses' })
const { status, data } = res.data

// POST
const res = await Network.request({
  url: '/api/auth/login',
  method: 'POST',
  data: { email, password },
})
```

### API Module

`src/api/courses.ts` defines the `CourseAPI` namespace with typed endpoint calls:

```typescript
export const CourseAPI = {
  getCourses: async (query?: CourseQuery) => {
    const res = await Network.request<PaginatedResponse<CourseDTO>>({
      url: '/api/courses',
      data: query,
    })
    return res.data
  },
  // ... other endpoints
}
```

All requests have a 10-second timeout. Response shape: `{ status: string; data: T }`.

### Auth Token Handling

The auth token is stored in `useAuthStore` but is **NOT automatically injected** into Network requests. Currently, only the audio player hook reads the token for progress sync endpoints.

This is a known gap — authenticated endpoints may fail silently.

### Response Unwrapping (Double Data Trap)

`Taro.request` returns `{ statusCode, header, data }`. The `data` field is the HTTP response body, which itself contains the server envelope `{ status, data }`.

```typescript
const res = await Network.request({ url: '/api/courses' })
// res.data = { status: 'success', data: [...] }
// res.data.data = [...]  ← actual course array
```

Always access `res.data` for the envelope, then `res.data.data` for the payload.

Anti-pattern: Treating `res.data` as the business object directly.
