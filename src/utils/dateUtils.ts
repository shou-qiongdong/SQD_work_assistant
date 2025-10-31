/**
 * 日期工具函数
 * 用于时间范围过滤和报告生成
 */

/**
 * 获取今日的起止时间
 * @returns [开始时间(00:00:00), 结束时间(23:59:59)]
 */
export function getToday(): [Date, Date] {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
  return [start, end];
}

/**
 * 获取本周的起止时间（周一到周日）
 * @returns [周一00:00:00, 周日23:59:59]
 */
export function getThisWeek(): [Date, Date] {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0-6, 0 = 周日

  // 计算本周周一
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(now);
  monday.setDate(now.getDate() + mondayOffset);
  monday.setHours(0, 0, 0, 0);

  // 计算本周周日
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  return [monday, sunday];
}

/**
 * 获取最近N天的时间范围（包含今天）
 * @param days 天数
 * @returns [N天前00:00:00, 今天23:59:59]
 */
export function getLastNDays(days: number): [Date, Date] {
  const now = new Date();
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

  const start = new Date(end);
  start.setDate(end.getDate() - (days - 1));
  start.setHours(0, 0, 0, 0);

  return [start, end];
}

/**
 * 获取最近7天的时间范围（包含今天）
 * @returns [7天前00:00:00, 今天23:59:59]
 */
export function getLast7Days(): [Date, Date] {
  return getLastNDays(7);
}

/**
 * 判断日期字符串是否在指定范围内
 * @param dateStr 日期字符串 (YYYY-MM-DD HH:mm:ss)
 * @param start 开始日期
 * @param end 结束日期
 * @returns 是否在范围内
 */
export function isInDateRange(dateStr: string, start: Date, end: Date): boolean {
  const date = new Date(dateStr);
  return date >= start && date <= end;
}

/**
 * 格式化单个日期为可读字符串
 * @param date 日期对象
 * @returns YYYY-MM-DD 格式
 */
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 格式化日期范围为可读字符串
 * @param start 开始日期
 * @param end 结束日期
 * @returns "YYYY-MM-DD 至 YYYY-MM-DD" 格式
 */
export function formatDateRange(start: Date, end: Date): string {
  return `${formatDate(start)} 至 ${formatDate(end)}`;
}

/**
 * 获取两个日期之间的所有日期（包含起止日期）
 * @param start 开始日期
 * @param end 结束日期
 * @returns 日期数组
 */
export function getDatesBetween(start: Date, end: Date): Date[] {
  const dates: Date[] = [];
  const current = new Date(start);
  current.setHours(0, 0, 0, 0);

  while (current <= end) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

/**
 * 获取日期的开始时间（00:00:00）
 * @param date 日期
 * @returns 该日期的 00:00:00
 */
export function getDateStart(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * 获取日期的结束时间（23:59:59）
 * @param date 日期
 * @returns 该日期的 23:59:59
 */
export function getDateEnd(date: Date): Date {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
}
