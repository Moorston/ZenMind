# API Layer

## Network Wrapper

`src/api/network.ts` provides a fetch-based wrapper for all HTTP requests.

```typescript
import { Network } from '../api/network'

// GET request
const data = await Network.request<{ status: string; data: Course[] }>({
  url: '/api/courses',
})

// POST request
const result = await Network.request({
  url: '/api/auth/login',
  method: 'POST',
  data: { email, password },
})

// File upload
await Network.uploadFile({
  url: '/api/upload',
  filePath: tempFilePath,
  name: 'file',
})
```

### Base URL

**Hardcoded to `http://localhost:3000`** in `network.ts`. There is no environment variable or config file support.

This means:
- Development on a physical device requires changing the IP address manually.
- Production builds require manual URL changes before building.

Anti-pattern: This should use an environment variable or config file.

### Auth Token Injection

The `Network.request()` method reads the token from `useAuthStore.getState().token` on every request and attaches it as `Authorization: Bearer <token>`.

### Response Format

The server returns `{ status: 'success' | 'error', data?: T, message?: string }`. Client code should check `status`:

```typescript
const res = await Network.request({ url: `/api/courses/${id}` })
if (res.data.status === 'error') {
  // handle error
} else {
  const course = res.data.data
}
```

## CoursesAPI

`src/api/courses.ts` defines typed endpoint calls:

```typescript
export namespace CoursesAPI {
  export async function getCourses(query?: CourseQuery): Promise<Course[]> { ... }
  export async function getCourseById(id: string): Promise<Course> { ... }
  export async function getSeries(): Promise<Series[]> { ... }
  export async function getRecommendedSeries(): Promise<Series[]> { ... }
  export async function getInstructors(): Promise<Instructor[]> { ... }
  export async function updateProgress(userId: string, courseId: string, data: ProgressUpdate): Promise<void> { ... }
  export async function completeCourse(userId: string, courseId: string): Promise<void> { ... }
}
```

### Auth Endpoints (Not in CoursesAPI)

Auth calls are made inline in screen components using `Network.request` directly:

- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/auth/send-code`

This is inconsistent with the mini-app pattern where auth calls are centralized.

### Anti-Patterns

- Hardcoded `localhost:3000` — not configurable per environment.
- Auth calls scattered across screens instead of in a dedicated API module.
- No error handling middleware — errors are thrown and caught per-call.
