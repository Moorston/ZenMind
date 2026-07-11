import { Controller, Post, Get, Body, Param } from '@nestjs/common'
import { ApiTags, ApiOperation } from '@nestjs/swagger'
import { PaymentsService } from './payments.service'
import { success, error } from '@/common/api-response'

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('orders')
  async createOrder(
    @Body('userId') userId: string,
    @Body('type') type: 'course' | 'membership',
    @Body('itemId') itemId: string,
  ) {
    if (!userId || !type || !itemId) {
      return error('userId, type and itemId are required')
    }
    const order = await this.paymentsService.createOrder(userId, type, itemId)
    return success(order)
  }

  @Get('orders/:userId')
  async getOrders(@Param('userId') userId: string) {
    const orders = await this.paymentsService.getOrders(userId)
    return success(orders)
  }

  @Post('callback')
  async handleCallback(@Body() body: { orderId: string; paymentId: string }) {
    if (!body.orderId || !body.paymentId) {
      return error('orderId and paymentId are required')
    }
    const order = await this.paymentsService.handlePaymentCallback(body.orderId, body.paymentId)
    if (!order) return error('Order not found')
    return success(order)
  }
}