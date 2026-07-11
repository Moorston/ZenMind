# Error Handling

## Three-Layer Error Strategy

The server handles errors at three levels:

### 1. Controller-Level (Business Errors)

Controllers handle expected failures by returning the error envelope with HTTP 200:

```typescript
// Not found
if (!course) {
  return { status: 'error', message: 'Course not found' }
}

// Validation failure
const result = schema.safeParse(body)
if (!result.success) {
  return { status: 'error', message: 'Validation failed', errors: result.error.flatten() }
}
```

This means "not found" and "validation failed" responses are always HTTP 200 with `{ status: 'error', ... }`.

### 2. HttpStatusInterceptor (POST Override)

Reference: `server/src/interceptors/http-status.interceptor.ts`

Forces all POST responses that return HTTP 201 back to HTTP 200. Registered globally in `main.ts`.

```typescript
intercept(context: ExecutionContext, next: CallHandler) {
  return next.handle().pipe(
    tap(() => {
      if (context.getType() === 'http' && context.switchToHttp().getResponse().statusCode === 201) {
        context.switchToHttp().getResponse().status(200)
      }
    }),
  )
}
```

### 3. AllExceptionsFilter (Unexpected Errors)

Reference: `server/src/filters/all-exceptions.filter.ts`

Catches all unhandled exceptions. Registered globally in `main.ts`.

- **HttpException**: Extracts status, message, and errors from the response.
- **Generic Error**: Returns HTTP 500 with the error message and logs the stack trace.

Response format: `{ status: 'error', message: string, errors?: any }`

### Error Response Shape

All errors (expected and unexpected) return the same envelope:

```typescript
{
  status: 'error',
  message: 'Human-readable description',
  errors?: any  // Optional details (validation field errors, etc.)
}
```

### Client-Side Implications

Since business errors and success responses both use HTTP 200, client code **must check the `status` field** in the response body:

```typescript
const res = await Network.request({ url: '/api/courses/...' })
if (res.data.status === 'error') {
  // handle error
} else {
  const course = res.data.data
}
```

### Anti-Patterns

- Relying on HTTP status codes to distinguish success from failure — always check the envelope `status` field.
- Using `@HttpCode(201)` on create endpoints — the interceptor overrides it to 200.
- Throwing `HttpException` for business logic errors — return the error envelope instead; reserve thrown exceptions for truly unexpected failures.
