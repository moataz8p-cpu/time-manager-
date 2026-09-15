import React, { useState } from 'react';
import { Task, DailyBuffer, AppSettings, DayOfWeek, ShiftPreviewItem } from '../../types';
import { getCurrentDayOfWeek } from '../../utils/timeUtils';
import {
  Sparkles,
  Send,
  Bot,
  User,
  CheckCircle2,
  XCircle,
  HelpCircle,
  AlertCircle,
  RotateCcw,
  Zap,
} from 'lucide-react';

interface AIPageProps {
  tasks: Task[];
  buffers: DailyBuffer[];
  settings: AppSettings;
  onUpdateTasks: (updated: Task[]) => void;
  onOpenSideMenu: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  proposedChanges?: ShiftPreviewItem[];
  proposedTasks?: Task[];
  applied?: boolean;
}

export const AIPage: React.FC<AIPageProps> = ({
  tasks,
  buffers,
  settings,
  onUpdateTasks,
  onOpenSideMenu,
}) => {
  const currentDay = getCurrentDayOfWeek();
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'ai',
      text: 'السلام عليكم ورحمة الله وبركاته! أنا مساعدك الذكي لتنظيم الوقت والجدول الأسبوعي. أستطيع تحليل جدولك، معالجة الطوارئ، والتأكد من ترتيب مهامك الأساسية والتراكمية دون أي تداخل. كيف يمكنني مساعدتك اليوم؟',
    },
  ]);

  const quickPrompts = [
    'تحليل ضغط اليوم والمهام الحالية',
    'اقتراح إعادة تنظيم الجدول بعد طارئ مفاجئ',
    'فحص تسلسل مهام التطوير التراكمية',
    'كيف أستفيد من وقت الاحتياط (Buffer) بأفضل طريقة؟',
  ];

  const handleSendMessage = async (promptToSend?: string) => {
    const query = (promptToSend || inputQuery).trim();
    if (!query || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/schedule-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          currentDay,
          tasks,
          buffers,
          settings,
        }),
      });

      if (!response.ok) {
        throw new Error('فشل الاتصال بخدمة الذكاء الاصطناعي');
      }

      const data = await response.json();

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: data.response || 'تم تحليل الجدول.',
        proposedChanges: data.proposedChanges,
        proposedTasks: data.proposedTasks,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: 'ai',
          text: 'عذراً، حدث خطأ في معالجة الطلب. جاري استخدام المحرك المنطقي المحلي لتحليل الجدول بدلاً من ذلك.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyProposedChanges = (msgId: string, proposedTasks?: Task[]) => {
    if (!proposedTasks || proposedTasks.length === 0) return;

    onUpdateTasks(proposedTasks);

    setMessages((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, applied: true } : m))
    );
  };

  const handleRejectProposedChanges = (msgId: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, proposedChanges: undefined } : m))
    );
  };

  return (
    <div className="min-h-full p-4 pb-12 flex flex-col justify-between space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            id="ai-side-menu-btn"
            onClick={onOpenSideMenu}
            className="p-2.5 rounded-2xl bg-white/90 dark:bg-black/25 text-[#4AA690] border border-[#E7C690]/40 shadow-sm active:scale-95"
          >
            <Sparkles className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-base font-bold text-[#2C221E] dark:text-white">
              المساعد الذكي للجدول (AI)
            </h2>
            <div className="text-[11px] text-[#2C221E]/60 dark:text-white/60">
              مدعوم بـ Gemini 3.8 Flash • خوارزميات تنظيم أسبوعية دقيقة
            </div>
          </div>
        </div>

        <span className="text-[10px] font-bold bg-[#4AA690]/15 text-[#4AA690] px-2.5 py-1 rounded-full border border-[#4AA690]/30">
          متصل
        </span>
      </div>

      {/* Quick Prompts */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {quickPrompts.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(prompt)}
            disabled={isLoading}
            className="text-[11px] font-semibold whitespace-nowrap bg-white/80 dark:bg-black/20 border border-[#E7C690]/40 text-[#2C221E] dark:text-white px-3 py-1.5 rounded-xl hover:bg-[#E7C690]/15 transition disabled:opacity-50"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Chat Messages Log */}
      <div className="flex-1 overflow-y-auto space-y-3 min-h-[340px] max-h-[460px] p-2 rounded-2xl bg-white/40 dark:bg-black/10 border border-[#E7C690]/30">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex items-start gap-2.5 ${m.sender === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div
              className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                m.sender === 'user'
                  ? 'bg-[#E7C690] text-[#2C221E]'
                  : 'bg-[#4AA690] text-white'
              }`}
            >
              {m.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`max-w-[85%] p-3.5 rounded-2xl text-xs sm:text-[13px] leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-[#4AA690] text-white rounded-tr-none'
                  : 'bg-white dark:bg-[#201915] text-[#2C221E] dark:text-white border border-[#E7C690]/40 shadow-sm rounded-tl-none'
              }`}
            >
              <div className="whitespace-pre-wrap">{m.text}</div>

              {/* Proposed Changes Preview Card */}
              {m.proposedChanges && m.proposedChanges.length > 0 && (
                <div className="mt-3 p-3 rounded-xl bg-[#FAF8F5] dark:bg-black/30 border border-amber-300 text-xs space-y-2">
                  <div className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    <span>مقترح إعادة تنظيم الجدول (معاينة قبل التطبيق):</span>
                  </div>

                  <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                    {m.proposedChanges.map((change, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded-lg bg-white dark:bg-black/40 border border-gray-200 dark:border-white/10 text-[11px]"
                      >
                        <div className="font-bold text-[#2C221E] dark:text-white">
                          {change.title}
                        </div>
                        <div className="text-gray-500">
                          نقل من: {change.oldStartTime} ({change.oldDay}) ← إلى: {change.newStartTime} ({change.newDay})
                        </div>
                        <div className="text-[10px] text-[#4AA690]">{change.reason}</div>
                      </div>
                    ))}
                  </div>

                  {m.applied ? (
                    <div className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>تم تطبيق التغييرات على جدولك الأسبوعي بنجاح!</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => handleApplyProposedChanges(m.id, m.proposedTasks)}
                        className="flex-1 bg-[#4AA690] text-white py-1.5 rounded-lg font-bold text-[11px] hover:bg-[#4AA690]/90 transition"
                      >
                        تطبيق المقترح على الجدول
                      </button>
                      <button
                        onClick={() => handleRejectProposedChanges(m.id)}
                        className="px-3 py-1.5 rounded-lg border border-gray-300 text-gray-600 text-[11px]"
                      >
                        إلغاء
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 p-3 bg-white/60 dark:bg-black/20 rounded-2xl w-fit border border-[#E7C690]/30 text-xs text-gray-500 animate-pulse">
            <Bot className="w-4 h-4 text-[#4AA690]" />
            <span>المساعد الذكي يحلل جدولك وقواعد التتابع...</span>
          </div>
        )}
      </div>

      {/* Bottom Query Input */}
      <div className="pt-2">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2 bg-white dark:bg-[#201915] p-2 rounded-2xl border border-[#E7C690]/50 shadow-sm"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="اسأل المساعد عن تنظيم مهامك أو حل تضارب..."
            className="flex-1 bg-transparent px-2 text-xs sm:text-sm text-[#2C221E] dark:text-white focus:outline-none placeholder-gray-400"
          />
          <button
            type="submit"
            disabled={!inputQuery.trim() || isLoading}
            className="p-2.5 rounded-xl bg-[#4AA690] text-white hover:bg-[#4AA690]/90 transition disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
