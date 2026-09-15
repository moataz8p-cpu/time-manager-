package com.waqt.organizer.engine

import com.waqt.organizer.data.model.AppSettings
import com.waqt.organizer.data.model.DailyBuffer
import com.waqt.organizer.data.model.DayOfWeekEnum
import com.waqt.organizer.data.model.DevelopmentType
import com.waqt.organizer.data.model.ShiftPreviewItem
import com.waqt.organizer.data.model.Task
import com.waqt.organizer.data.model.TaskCategory
import java.time.LocalTime
import java.time.format.DateTimeFormatter

data class ShiftResult(
    val previewItems: List<ShiftPreviewItem>,
    val updatedTasks: List<Task>,
    val updatedBuffers: List<DailyBuffer>,
    val explanation: String
)

object SchedulingEngine {

    private val timeFormatter: DateTimeFormatter = DateTimeFormatter.ofPattern("HH:mm")

    fun minutesToTime(minutes: Int): String {
        val h = (minutes / 60) % 24
        val m = minutes % 60
        return String.format("%02d:%02d", h, m)
    }

    fun timeToMinutes(timeStr: String): Int {
        val parts = timeStr.split(":")
        val h = parts.getOrNull(0)?.toIntOrNull() ?: 0
        val m = parts.getOrNull(1)?.toIntOrNull() ?: 0
        return h * 60 + m
    }

    fun calculateEndTime(startTime: String, durationMinutes: Int): String {
        val startMins = timeToMinutes(startTime)
        return minutesToTime(startMins + durationMinutes)
    }

    /**
     * Executes Emergency Shift Calculation
     * Priority:
     *  1. Essential Tasks
     *  2. Buffer (absorbed at end of day)
     *  3. Development Tasks
     *
     * Cumulative task sequence is strictly preserved (A -> B -> C).
     */
    fun calculateEmergencyShift(
        currentDay: DayOfWeekEnum,
        shiftMinutes: Int,
        allTasks: List<Task>,
        buffers: List<DailyBuffer>,
        settings: AppSettings
    ): ShiftResult {
        val dayIndex = currentDay.ordinal
        val previewItems = mutableListOf<ShiftPreviewItem>()
        val updatedTasks = allTasks.toMutableList()
        val updatedBuffers = buffers.toMutableList()

        val currentBuffer = buffers.find { it.day == currentDay }
        val isFriday = currentDay == DayOfWeekEnum.FRIDAY
        val dayEndStr = if (isFriday) settings.fridayEndTime else settings.dailyEndTime
        val dayEndMinutes = timeToMinutes(dayEndStr)

        var remainingShift = shiftMinutes

        // 1. Check if Buffer absorbs part or all of the emergency shift
        if (currentBuffer != null && currentBuffer.isEnabled && !currentBuffer.isUsed) {
            if (currentBuffer.durationMinutes >= remainingShift) {
                // Completely absorbed by buffer!
                val bIdx = updatedBuffers.indexOfFirst { it.day == currentDay }
                if (bIdx != -1) {
                    updatedBuffers[bIdx] = currentBuffer.copy(isUsed = true)
                }
                return ShiftResult(
                    previewItems = emptyList(),
                    updatedTasks = updatedTasks,
                    updatedBuffers = updatedBuffers,
                    explanation = "تم استيعاب إزاحة الطوارئ بالكامل ($shiftMinutes دقيقة) عبر وقت الاحتياط (Buffer) المخصص لنهاية يوم ${currentDay.nameAr}."
                )
            } else {
                remainingShift -= currentBuffer.durationMinutes
                val bIdx = updatedBuffers.indexOfFirst { it.day == currentDay }
                if (bIdx != -1) {
                    updatedBuffers[bIdx] = currentBuffer.copy(isUsed = true)
                }
            }
        }

        // 2. Sort uncompleted tasks of current day by start time
        val uncompletedTasks = allTasks
            .filter { it.day == currentDay && !it.isCompleted }
            .sortedBy { timeToMinutes(it.startTime) }

        if (uncompletedTasks.isEmpty()) {
            return ShiftResult(
                previewItems = emptyList(),
                updatedTasks = updatedTasks,
                updatedBuffers = updatedBuffers,
                explanation = "لا توجد مهام متبقية غير مكتملة في هذا اليوم لتأجيلها."
            )
        }

        var currentPointerMinutes = timeToMinutes(uncompletedTasks.first().startTime) + remainingShift

        for (task in uncompletedTasks) {
            val taskDuration = task.durationMinutes
            val proposedStartMinutes = currentPointerMinutes
            val proposedEndMinutes = proposedStartMinutes + taskDuration

            val effectiveDayEnd = if (currentBuffer?.isEnabled == true) {
                dayEndMinutes - currentBuffer.durationMinutes
            } else {
                dayEndMinutes
            }

            if (proposedEndMinutes <= effectiveDayEnd) {
                // Fits in current day
                val oldStart = task.startTime
                val oldEnd = task.endTime
                val newStart = minutesToTime(proposedStartMinutes)
                val newEnd = minutesToTime(proposedEndMinutes)

                if (oldStart != newStart) {
                    previewItems.add(
                        ShiftPreviewItem(
                            taskId = task.id,
                            title = task.title,
                            oldDay = currentDay,
                            newDay = currentDay,
                            oldStartTime = oldStart,
                            newStartTime = newStart,
                            oldEndTime = oldEnd,
                            newEndTime = newEnd,
                            reason = "إزاحة طوارئ بمقدار $remainingShift دقيقة داخل نفس اليوم"
                        )
                    )

                    val idx = updatedTasks.indexOfFirst { it.id == task.id }
                    if (idx != -1) {
                        updatedTasks[idx] = task.copy(startTime = newStart, endTime = newEnd)
                    }
                }
                currentPointerMinutes = proposedEndMinutes
            } else {
                // Overflow to next day!
                val allDays = DayOfWeekEnum.values()
                val nextDay = allDays[(dayIndex + 1) % allDays.size]

                if (task.category == TaskCategory.DEVELOPMENT && task.developmentType == DevelopmentType.CUMULATIVE) {
                    // Cumulative sequence preservation: find all subsequent cumulative tasks
                    val allCumulative = updatedTasks
                        .filter { it.category == TaskCategory.DEVELOPMENT && it.developmentType == DevelopmentType.CUMULATIVE }
                        .sortedBy { it.cumulativeOrder ?: 0 }

                    val currentOrder = task.cumulativeOrder ?: 0
                    val chain = allCumulative.filter { (it.cumulativeOrder ?: 0) >= currentOrder }

                    var nextDayPointer = timeToMinutes(settings.dailyStartTime)

                    for (chainTask in chain) {
                        val chainStart = minutesToTime(nextDayPointer)
                        val chainEnd = calculateEndTime(chainStart, chainTask.durationMinutes)

                        previewItems.add(
                            ShiftPreviewItem(
                                taskId = chainTask.id,
                                title = chainTask.title,
                                oldDay = chainTask.day,
                                newDay = nextDay,
                                oldStartTime = chainTask.startTime,
                                newStartTime = chainStart,
                                oldEndTime = chainTask.endTime,
                                newEndTime = chainEnd,
                                reason = "نقل المهمة التراكمية مع الحفاظ الصارم على تسلسل السلسلة (A → B → C)"
                            )
                        )

                        val idx = updatedTasks.indexOfFirst { it.id == chainTask.id }
                        if (idx != -1) {
                            updatedTasks[idx] = chainTask.copy(
                                day = nextDay,
                                startTime = chainStart,
                                endTime = chainEnd
                            )
                        }

                        nextDayPointer = timeToMinutes(chainEnd) + 15
                    }
                    break
                } else {
                    // Non-cumulative or essential overflow
                    val nextDayStart = settings.dailyStartTime
                    val nextDayEnd = calculateEndTime(nextDayStart, task.durationMinutes)

                    previewItems.add(
                        ShiftPreviewItem(
                            taskId = task.id,
                            title = task.title,
                            oldDay = currentDay,
                            newDay = nextDay,
                            oldStartTime = task.startTime,
                            newStartTime = nextDayStart,
                            oldEndTime = task.endTime,
                            newEndTime = nextDayEnd,
                            reason = if (task.category == TaskCategory.ESSENTIAL)
                                "نقل مهمة أساسية لليوم التالي لعدم توفر متسع بعد إزاحة الطوارئ"
                            else
                                "نقل مهمة تطوير مستقلة (غير تراكمية) لليوم التالي"
                        )
                    )

                    val idx = updatedTasks.indexOfFirst { it.id == task.id }
                    if (idx != -1) {
                        updatedTasks[idx] = task.copy(
                            day = nextDay,
                            startTime = nextDayStart,
                            endTime = nextDayEnd
                        )
                    }
                }
            }
        }

        val explanation = if (previewItems.isNotEmpty()) {
            "تمت إعادة جدولة ${previewItems.size} مهمة بعد إزاحة الطوارئ ($shiftMinutes دقيقة) مع مراعاة الأسبقية وقواعد التتابع."
        } else {
            "تم ترحيل الوقت بمقدار $shiftMinutes دقيقة بنجاح."
        }

        return ShiftResult(
            previewItems = previewItems,
            updatedTasks = updatedTasks,
            updatedBuffers = updatedBuffers,
            explanation = explanation
        )
    }
}
