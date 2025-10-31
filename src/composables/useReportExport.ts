import { type Ref } from 'vue';
import type { Todo } from '../types/todo';
import { formatDate, formatDateRange } from '../utils/dateUtils';
import { logger } from '../utils/logger';

export function useReportExport(
  reportTitle: Ref<string>,
  reportTimeRange: Ref<'daily' | 'weekly' | 'custom'>,
  reportTodos: Ref<Todo[]>,
  reportBrokerStats: Ref<Record<string, Todo[]>>,
  getReportDateRange: () => [Date, Date]
) {

  function generateMarkdownReport(): string {
    const [start, end] = getReportDateRange();
    const title = reportTimeRange.value === 'daily' ? '日报' :
      reportTimeRange.value === 'weekly' ? '周报' : '工作报告';

    let md = `# ${title}\n\n`;
    md += `**时间范围**: ${formatDateRange(start, end)}\n\n---\n\n`;
    md += `## 📊 总体概况\n\n`;
    md += `- 已完成任务数：**${reportTodos.value.length}** 个\n`;
    md += `- 涉及券商数：**${Object.keys(reportBrokerStats.value).length}** 个\n\n---\n\n`;
    md += `## 📈 券商工作分布\n\n`;

    const sortedBrokers = Object.entries(reportBrokerStats.value)
      .sort((a, b) => b[1].length - a[1].length);

    sortedBrokers.forEach(([broker, todos]) => {
      const percentage = ((todos.length / reportTodos.value.length) * 100).toFixed(1);
      md += `### ${broker}\n\n`;
      md += `- 完成任务数：**${todos.length}** 个\n`;
      md += `- 工作量占比：**${percentage}%**\n\n**任务列表：**\n\n`;
      todos.forEach((todo, index) => {
        md += `${index + 1}. ✅ ${todo.title}\n`;
      });
      md += '\n';
    });

    md += `---\n\n*报告生成时间：${formatDate(new Date())} ${new Date().toLocaleTimeString('zh-CN')}*\n`;
    return md;
  }

  function generateTextReport(): string {
    const [start, end] = getReportDateRange();
    const title = reportTimeRange.value === 'daily' ? '日报' :
      reportTimeRange.value === 'weekly' ? '周报' : '工作报告';

    let text = `${title}\n时间范围: ${formatDateRange(start, end)}\n${'='.repeat(50)}\n\n`;
    text += `总体概况\n${'-'.repeat(50)}\n`;
    text += `已完成任务数: ${reportTodos.value.length} 个\n`;
    text += `涉及券商数: ${Object.keys(reportBrokerStats.value).length} 个\n\n`;
    text += `券商工作分布\n${'-'.repeat(50)}\n\n`;

    const sortedBrokers = Object.entries(reportBrokerStats.value)
      .sort((a, b) => b[1].length - a[1].length);

    sortedBrokers.forEach(([broker, todos]) => {
      const percentage = ((todos.length / reportTodos.value.length) * 100).toFixed(1);
      text += `【${broker}】\n`;
      text += `  完成任务数: ${todos.length} 个\n`;
      text += `  工作量占比: ${percentage}%\n  任务列表:\n`;
      todos.forEach((todo, index) => {
        text += `    ${index + 1}. ${todo.title}\n`;
      });
      text += '\n';
    });

    text += `${'-'.repeat(50)}\n`;
    text += `报告生成时间: ${formatDate(new Date())} ${new Date().toLocaleTimeString('zh-CN')}\n`;
    return text;
  }

  async function exportMarkdown(onSuccess: () => void, onError: () => void) {
    try {
      const markdown = generateMarkdownReport();
      const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `工作报告_${formatDate(new Date())}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      onSuccess();
    } catch (error) {
      logger.error('Export markdown failed', { context: 'useReportExport', data: error });
      onError();
    }
  }

  async function exportText(onSuccess: () => void, onError: () => void) {
    try {
      const text = generateTextReport();
      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `工作报告_${formatDate(new Date())}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      onSuccess();
    } catch (error) {
      logger.error('Export text failed', { context: 'useReportExport', data: error });
      onError();
    }
  }

  return {
    exportMarkdown,
    exportText
  };
}
