import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common'
import { Observable } from 'rxjs'
import { tap } from 'rxjs/operators'
import { MetricsService } from '@/modules/metrics/metrics.service'

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(private readonly metricsService: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest()
    const start = Date.now()
    const method = request.method
    const path = request.route?.path || request.url

    return next.handle().pipe(
      tap(() => {
        const duration = (Date.now() - start) / 1000
        const response = context.switchToHttp().getResponse()
        this.metricsService.recordRequest(method, path, response.statusCode, duration)
      }),
    )
  }
}