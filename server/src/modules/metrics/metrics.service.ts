import { Injectable, OnModuleInit } from '@nestjs/common'
import client from 'prom-client'

@Injectable()
export class MetricsService implements OnModuleInit {
  private httpRequestDuration!: client.Histogram<string>
  private activeConnections!: client.Gauge<string>

  onModuleInit() {
    client.collectDefaultMetrics()

    this.httpRequestDuration = new client.Histogram({
      name: 'http_request_duration_seconds',
      help: 'HTTP request duration in seconds',
      labelNames: ['method', 'path', 'status'],
      buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
    })

    this.activeConnections = new client.Gauge({
      name: 'active_connections',
      help: 'Number of active connections',
    })
  }

  recordRequest(method: string, path: string, status: number, duration: number) {
    this.httpRequestDuration.observe({ method, path, status: String(status) }, duration)
  }

  incrementConnections() {
    this.activeConnections.inc()
  }

  decrementConnections() {
    this.activeConnections.dec()
  }

  getMetrics(): Promise<string> {
    return client.register.metrics()
  }
}