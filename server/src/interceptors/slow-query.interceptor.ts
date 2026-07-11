import { Injectable, Logger, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common'
import { Observable } from 'rxjs'
import { tap } from 'rxjs/operators'

@Injectable()
export class SlowQueryInterceptor implements NestInterceptor {
  private readonly logger = new Logger('SlowQueryInterceptor')
  private static readonly SLOW_THRESHOLD = 100

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest()
    const start = Date.now()
    const method = request.method
    const url = request.url

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - start
        if (duration > SlowQueryInterceptor.SLOW_THRESHOLD) {
          this.logger.warn({
            type: 'slow_request',
            method,
            url,
            duration: `${duration}ms`,
            threshold: `${SlowQueryInterceptor.SLOW_THRESHOLD}ms`,
            timestamp: new Date().toISOString(),
          })
        }
      }),
    )
  }
}