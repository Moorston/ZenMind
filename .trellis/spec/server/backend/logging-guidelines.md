# Logging Guidelines

## Current Approach

The server uses **NestJS's built-in Logger** (`@nestjs/common`) and `console.log` for logging. There is no structured logging framework or log aggregation.

### Logger Usage

```typescript
import { Logger } from '@nestjs/common'

@Injectable()
export class CoursesService {
  private readonly logger = new Logger(CoursesService.name)

  async findAll() {
    this.logger.log('Fetching all courses')
    // ...
  }
}
```

### What Gets Logged

- **Startup**: Port number, environment, CORS origins (`main.ts`)
- **Unhandled rejections**: Stack trace via `process.on('unhandledRejection')` (`main.ts`)
- **Exception filter**: Stack traces for 500 errors (`all-exceptions.filter.ts`)
- **Seed operations**: Instructor/course creation counts and results (`seed.ts`)
- **Auth**: Email verification codes logged to console when SMTP is not configured (`auth.service.ts`)

### What NOT to Log

- Passwords or password hashes
- Auth tokens
- Email verification codes in production (console logging is development-only fallback)
- Full request/response bodies (no request logging middleware exists)

### Gaps

- No request/response logging middleware (no HTTP access logs).
- No log levels configured — everything is `log` or `console.log`.
- No structured JSON logging for production.
- No correlation IDs or request tracing.
