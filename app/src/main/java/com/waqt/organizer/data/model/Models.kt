package com.waqt.organizer.data.model

import java.time.LocalTime
import java.time.format.DateTimeFormatter

enum class DayOfWeekEnum(val id: String, val nameAr: String, val order: Int) {
    SATURDAY("saturday", "السبت", 1),
    SUNDAY("sunday", "الأحد", 2),
    MONDAY("monday", "الاثنين", 3),
    TUESDAY("tuesday", "الثلاثاء", 4),
    WEDNESDAY("wednesday", "الأربعاء", 5),
    THURSDAY("thursday", "الخميس", 6),
    FRIDAY("friday", "الجمعة", 7) // Friday is the final day of the week
}

enum class TaskCategory {
    ESSENTIAL,
    DEVELOPMENT
}

enum class DevelopmentType {
    CUMULATIVE,
    NON_CUMULATIVE
}

data class Task(
    val id: String,
    val title: String,
    val day: DayOfWeekEnum,
    val startTime: String, // "HH:mm"
    val durationMinutes: Int,
    val endTime: String,   // "HH:mm" calculated automatically
    val isPomodoro: Boolean = false,
    val category: TaskCategory,
    val developmentType: DevelopmentType? = null,
    val cumulativeOrder: Int? = null, // Strict sequence order for cumulative tasks (e.g. 1, 2, 3)
    val isCompleted: Boolean = false,
    val createdAt: Long = System.currentTimeMillis()
) {
    fun getStartLocalTime(): LocalTime = LocalTime.parse(startTime, DateTimeFormatter.ofPattern("HH:mm"))
    fun getEndLocalTime(): LocalTime = LocalTime.parse(endTime, DateTimeFormatter.ofPattern("HH:mm"))
}

data class DailyBuffer(
    val day: DayOfWeekEnum,
    val durationMinutes: Int = 45,
    val isEnabled: Boolean = true,
    val isUsed: Boolean = false
)

data class AppSettings(
    val dailyStartTime: String = "08:00",
    val dailyEndTime: String = "22:00",
    val fridayStartTime: String = "14:00",
    val fridayEndTime: String = "23:00",
    val isPomodoroEnabled: Boolean = true,
    val focusDurationMinutes: Int = 25,
    val breakDurationMinutes: Int = 5,
    val isBufferEnabled: Boolean = true,
    val defaultBufferDurationMinutes: Int = 45,
    val isNotificationsEnabled: Boolean = true,
    val isTimerNotificationEnabled: Boolean = true,
    val isSoundEnabled: Boolean = true,
    val isDarkMode: Boolean = false,
    val city: String = "القاهرة",
    val latitude: Double = 30.0444,
    val longitude: Double = 31.2357,
    val manualPrayerOverrides: Map<String, String> = emptyMap(),
    val morningAdhkarOffsetMinutes: Int = 15,
    val eveningAdhkarOffsetMinutes: Int = 45,
    val isFirstLaunchCompleted: Boolean = false
)

data class ShiftPreviewItem(
    val taskId: String,
    val title: String,
    val oldDay: DayOfWeekEnum,
    val newDay: DayOfWeekEnum,
    val oldStartTime: String,
    val newStartTime: String,
    val oldEndTime: String,
    val newEndTime: String,
    val reason: String
)

data class PrayerTime(
    val name: String,
    val time: String,
    val isNext: Boolean = false,
    val isPassed: Boolean = false
)

data class DhikrItem(
    val id: String,
    val text: String,
    val virtue: String?,
    val targetCount: Int,
    val currentCount: Int = 0,
    val isMorning: Boolean
)

data class HadithItem(
    val id: String,
    val matn: String,
    val narrator: String,
    val reference: String,
    val topic: String
)
