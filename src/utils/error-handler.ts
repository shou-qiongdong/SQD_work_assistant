import { logger } from './logger';

/**
 * 统一的错误处理工具
 * 用于处理 API 调用失败的场景
 */
export class ErrorHandler {
  /**
   * 处理并记录错误
   * @param error 错误对象
   * @param context 错误上下文描述
   * @param defaultMessage 默认错误消息
   * @returns 格式化的错误消息
   */
  static handle(error: unknown, context: string, defaultMessage: string = '操作失败'): string {
    const errorMsg = error instanceof Error ? error.message : String(error);

    logger.error(`${context} - ${defaultMessage}`, { data: errorMsg });

    // 返回用户友好的错误消息
    if (errorMsg.includes('Invalid status')) {
      return '状态值无效，请选择正确的状态';
    }
    if (errorMsg.includes('标题长度')) {
      return errorMsg;
    }
    if (errorMsg.includes('券商名称')) {
      return errorMsg;
    }
    if (errorMsg.includes('结论长度')) {
      return errorMsg;
    }

    // 返回默认错误消息
    return `${defaultMessage}: ${errorMsg}`;
  }
}
