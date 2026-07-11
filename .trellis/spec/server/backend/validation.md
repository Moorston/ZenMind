# Validation Patterns

## Zod for Input Validation

The server uses **Zod** for validating request inputs. DTOs are defined as Zod schemas, not NestJS class-validator classes.

### Defining DTOs

Place Zod schemas in `server/src/modules/<name>/dto/`:

```typescript
import { z } from 'zod'

export const createCourseSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  category: z.enum(['breathing', 'body-scan', 'visualization', 'loving-kindness', 'mindfulness']),
  level: z.enum(['beginner', 'intermediate', 'advanced']).default('beginner'),
  duration: z.number().int().positive(),
  cover_url: z.string().url(),
  audio_url: z.string().url(),
  instructor_id: z.string().uuid().optional(),
})

export type CreateCourseDto = z.infer<typeof createCourseSchema>
```

Reference: `server/src/modules/courses/dto/create-course.dto.ts`, `server/src/modules/series/dto/create-series.dto.ts`

### Validation in Controllers

Use `safeParse()` in controller methods — do NOT throw on validation failure, return the error envelope:

```typescript
@Post()
@Admin()
async create(@Body() body: unknown) {
  const result = createCourseSchema.safeParse(body)
  if (!result.success) {
    return {
      status: 'error',
      message: 'Validation failed',
      errors: result.error.flatten().fieldErrors,
    }
  }
  const course = await this.coursesService.create(result.data)
  return { status: 'success', data: course }
}
```

### Common Schema Patterns

**Multiple schemas in one file** — when operations share related shapes:

```typescript
// server/src/modules/series/dto/create-series.dto.ts
export const createSeriesSchema = z.object({ title: z.string().min(1), ... })
export const updateSeriesSchema = createSeriesSchema.partial()
export const addCoursesSchema = z.object({ courseIds: z.array(z.string()) })
```

**Query parameter validation** — validate GET query params the same way:

```typescript
@Get()
async findAll(@Query() query: Record<string, string>) {
  const parsed = courseQuerySchema.safeParse(query)
  // ...
}
```

### Anti-Patterns

- Using `class-validator` / `class-transformer` — the project uses Zod exclusively.
- Throwing `HttpException` for validation errors — return the error envelope with HTTP 200 instead.
- Defining inline Zod schemas in controllers — extract to `dto/` files for reuse across controller and service.
