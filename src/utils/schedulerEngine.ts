import {
  DayOfWeek,
  DAYS_OF_WEEK,
  Task,
  DailyBuffer,
  ShiftPreviewItem,
  AppSettings,
} from '../types';
import {
  timeToMinutes,
  minutesToTime,
  calculateEndTime,
} from './timeUtils';

/**
 * Validates that no two tasks overlap in time on a given day
 */
export function hasOverlap(tasks: Task[]): boolean {
  const sorted = [...tasks].sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
  for (let i = 0; i < sorted.length - 1; i++) {
    const endCurrent = timeToMinutes(sorted[i].endTime);
    const startNext = timeToMinutes(sorted[i + 1].startTime);
    if (endCurrent > startNext) {
      return true;
    }
  }
  return false;
}

/**
 * Calculates Emergency Shift Preview
 * Allowed shift minutes: 15, 30, 45, 60, 90
 * Priority:
 *  1. Essential Tasks
 *  2. Buffer (used to absorb delays if enabled)
 *  3. Development Tasks
 *
 * Sequence preservation for Cumulative Development tasks:
 *  If Task A moves forward, Task B must move after Task A, Task C after Task B.
 */
export function calculateEmergencyShift(
  currentDay: DayOfWeek,
  shiftMinutes: 15 | 30 | 45 | 60 | 90,
  allTasks: Task[],
  buffers: DailyBuffer[],
  settings: AppSettings
): {
  previewItems: ShiftPreviewItem[];
  updatedTasks: Task[];
  updatedBuffers: DailyBuffer[];
  explanation: string;
} {
  const dayIndex = DAYS_OF_WEEK.findIndex((d) => d.id === currentDay);
  const dayTasks = allTasks.filter((t) => t.day === currentDay);
  const currentBuffer = buffers.find((b) => b.day === currentDay);

  const previewItems: ShiftPreviewItem[] = [];
  const updatedTasks = allTasks.map((t) => ({ ...t }));
  const updatedBuffers = buffers.map((b) => ({ ...b }));

  // Day boundaries
  const isFriday = currentDay === 'friday';
  const dayStartTimeStr = isFriday ? settings.fridayStartTime : settings.dailyStartTime;
  const dayEndTimeStr = isFriday ? settings.fridayEndTime : settings.dailyEndTime;
  const dayEndMinutes = timeToMinutes(dayEndTimeStr);

  let absorbedByBuffer = 0;
  let remainingShift: number = shiftMinutes;

  // 1. Check if Buffer can absorb part or all of the emergency shift
  if (currentBuffer && currentBuffer.enabled && !currentBuffer.used) {
    if (currentBuffer.durationMinutes >= remainingShift) {
      absorbedByBuffer = remainingShift;
      remainingShift = 0;
      // Mark buffer as used
      const bIndex = updatedBuffers.findIndex((b) => b.day === currentDay);
      if (bIndex !== -1) {
        updatedBuffers[bIndex] = { ...updatedBuffers[bIndex], used: true };
      }
    } else {
      absorbedByBuffer = currentBuffer.durationMinutes;
      remainingShift -= currentBuffer.durationMinutes;
      const bIndex = updatedBuffers.findIndex((b) => b.day === currentDay);
      if (bIndex !== -1) {
        updatedBuffers[bIndex] = { ...updatedBuffers[bIndex], used: true };
      }
    }
  }

  // If buffer completely absorbed the shift, tasks don't need to overflow to another day!
  if (remainingShift === 0) {
    return {
      previewItems: [],
      updatedTasks,
      updatedBuffers,
      explanation: `تم استيعاب إزاحة الطوارئ بالكامل (${shiftMinutes} دقيقة) بنجاح عبر وقت الاحتياط (Buffer) المخصص لنهاية يوم ${DAYS_OF_WEEK[dayIndex].nameAr} دون الحاجة لتأجيل أي مهام.`,
    };
  }

  // 2. We need to shift tasks starting from the first non-completed task or next upcoming task
  // Sort day's tasks by start time
  const sortedDayTasks = [...dayTasks].sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

  // Find tasks to shift
  const uncompletedTasks = sortedDayTasks.filter((t) => !t.completed);
  if (uncompletedTasks.length === 0) {
    return {
      previewItems: [],
      updatedTasks,
      updatedBuffers,
      explanation: 'لا توجد مهام متبقية غير مكتملة في هذا اليوم لتأجيلها.',
    };
  }

  // We shift tasks by remainingShift
  // Priority rule:
  // Essential tasks are kept on the day if possible by shifting their start time.
  // Development tasks might need to overflow to next day or to Friday.
  // Cumulative development tasks must maintain strict sequence order!
  let currentPointerMinutes = timeToMinutes(uncompletedTasks[0].startTime) + remainingShift;

  for (const task of uncompletedTasks) {
    const taskDuration = task.durationMinutes;
    let proposedStartMinutes = currentPointerMinutes;
    let proposedEndMinutes = proposedStartMinutes + taskDuration;

    // Check if task fits before day end (leaving room for buffer if enabled)
    const effectiveDayEnd = currentBuffer?.enabled ? dayEndMinutes - currentBuffer.durationMinutes : dayEndMinutes;

    if (proposedEndMinutes <= effectiveDayEnd) {
      // Fits in current day
      const oldStart = task.startTime;
      const oldEnd = task.endTime;
      const newStart = minutesToTime(proposedStartMinutes);
      const newEnd = minutesToTime(proposedEndMinutes);

      if (oldStart !== newStart) {
        previewItems.push({
          taskId: task.id,
          title: task.title,
          oldDay: currentDay,
          newDay: currentDay,
          oldStartTime: oldStart,
          newStartTime: newStart,
          oldEndTime: oldEnd,
          newEndTime: newEnd,
          reason: `إزاحة طوارئ بمقدار ${remainingShift} دقيقة داخل نفس اليوم`,
        });

        const idx = updatedTasks.findIndex((t) => t.id === task.id);
        if (idx !== -1) {
          updatedTasks[idx] = {
            ...updatedTasks[idx],
            startTime: newStart,
            endTime: newEnd,
          };
        }
      }

      currentPointerMinutes = proposedEndMinutes;
    } else {
      // Does NOT fit in current day -> must overflow!
      // If it's a cumulative development task, all subsequent cumulative tasks must follow in sequence
      const nextDayIndex = (dayIndex + 1) % 7;
      const nextDay = DAYS_OF_WEEK[nextDayIndex].id;

      if (task.category === 'development' && task.developmentType === 'cumulative') {
        // Find all cumulative tasks in the chain
        const allCumulative = updatedTasks
          .filter((t) => t.category === 'development' && t.developmentType === 'cumulative')
          .sort((a, b) => (a.cumulativeOrder ?? 0) - (b.cumulativeOrder ?? 0));

        const thisOrder = task.cumulativeOrder ?? 0;
        const affectedChain = allCumulative.filter((t) => (t.cumulativeOrder ?? 0) >= thisOrder);

        let nextDayPointer = timeToMinutes(settings.dailyStartTime);

        for (let i = 0; i < affectedChain.length; i++) {
          const chainTask = affectedChain[i];
          const targetDay = nextDay;
          const chainNewStart = minutesToTime(nextDayPointer);
          const chainNewEnd = calculateEndTime(chainNewStart, chainTask.durationMinutes);

          previewItems.push({
            taskId: chainTask.id,
            title: chainTask.title,
            oldDay: chainTask.day,
            newDay: targetDay,
            oldStartTime: chainTask.startTime,
            newStartTime: chainNewStart,
            oldEndTime: chainTask.endTime,
            newEndTime: chainNewEnd,
            reason: `نقل المهمة التراكمية مع الحفاظ الصارم على تسلسل السلسلة التراكمية بعد إزاحة الطوارئ`,
          });

          const idx = updatedTasks.findIndex((t) => t.id === chainTask.id);
          if (idx !== -1) {
            updatedTasks[idx] = {
              ...updatedTasks[idx],
              day: targetDay,
              startTime: chainNewStart,
              endTime: chainNewEnd,
            };
          }

          nextDayPointer = timeToMinutes(chainNewEnd) + 15; // 15 min gap
        }

        // Break because we handled the entire subsequent cumulative chain
        break;
      } else {
        // Non-cumulative task or Essential that overflowed
        const targetDay = nextDay;
        const nextDayStart = minutesToTime(timeToMinutes(settings.dailyStartTime));
        const nextDayEnd = calculateEndTime(nextDayStart, task.durationMinutes);

        previewItems.push({
          taskId: task.id,
          title: task.title,
          oldDay: currentDay,
          newDay: targetDay,
          oldStartTime: task.startTime,
          newStartTime: nextDayStart,
          oldEndTime: task.endTime,
          newEndTime: nextDayEnd,
          reason: task.category === 'essential'
            ? 'نقل مهمة أساسية لليوم التالي لعدم توفر متسع بعد إزاحة الطوارئ'
            : 'نقل مهمة تطوير مستقلة (غير تراكمية) لليوم التالي',
        });

        const idx = updatedTasks.findIndex((t) => t.id === task.id);
        if (idx !== -1) {
          updatedTasks[idx] = {
            ...updatedTasks[idx],
            day: targetDay,
            startTime: nextDayStart,
            endTime: nextDayEnd,
          };
        }
      }
    }
  }

  const explanation = previewItems.length > 0
    ? `تمت إعادة جدولة ${previewItems.length} مهمة لتنظيم الوقت بعد إزاحة الطوارئ (${shiftMinutes} دقيقة)، مع منح الأولوية للمهام الأساسية وتطبيق قواعد التتابع للمهام التراكمية.`
    : `تم ترحيل الوقت بمقدار ${shiftMinutes} دقيقة دون إخلال بالجدول اليومي.`;

  return {
    previewItems,
    updatedTasks,
    updatedBuffers,
    explanation,
  };
}
