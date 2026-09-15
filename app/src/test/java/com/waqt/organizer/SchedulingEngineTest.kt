package com.waqt.organizer

import com.waqt.organizer.data.model.AppSettings
import com.waqt.organizer.data.model.DailyBuffer
import com.waqt.organizer.data.model.DayOfWeekEnum
import com.waqt.organizer.data.model.DevelopmentType
import com.waqt.organizer.data.model.Task
import com.waqt.organizer.data.model.TaskCategory
import com.waqt.organizer.engine.SchedulingEngine
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class SchedulingEngineTest {

    @Test
    fun testBufferAbsorbsShiftCompletely() {
        val settings = AppSettings()
        val buffer = DailyBuffer(day = DayOfWeekEnum.WEDNESDAY, durationMinutes = 45, isEnabled = true, isUsed = false)
        val tasks = listOf(
            Task(
                id = "1",
                title = "مهمة أساسية",
                day = DayOfWeekEnum.WEDNESDAY,
                startTime = "09:00",
                durationMinutes = 60,
                endTime = "10:00",
                category = TaskCategory.ESSENTIAL
            )
        )

        val result = SchedulingEngine.calculateEmergencyShift(
            currentDay = DayOfWeekEnum.WEDNESDAY,
            shiftMinutes = 30,
            allTasks = tasks,
            buffers = listOf(buffer),
            settings = settings
        )

        // Shift was 30 mins <= 45 mins buffer -> absorbed without moving tasks
        assertTrue(result.previewItems.isEmpty())
        assertTrue(result.updatedBuffers.first().isUsed)
    }

    @Test
    fun testCumulativeTasksPreserveStrictSequence() {
        val settings = AppSettings(dailyStartTime = "08:00", dailyEndTime = "12:00")
        val buffer = DailyBuffer(day = DayOfWeekEnum.WEDNESDAY, durationMinutes = 0, isEnabled = false)

        val taskA = Task(
            id = "a",
            title = "Task A",
            day = DayOfWeekEnum.WEDNESDAY,
            startTime = "11:00",
            durationMinutes = 60,
            endTime = "12:00",
            category = TaskCategory.DEVELOPMENT,
            developmentType = DevelopmentType.CUMULATIVE,
            cumulativeOrder = 1
        )

        val taskB = Task(
            id = "b",
            title = "Task B",
            day = DayOfWeekEnum.THURSDAY,
            startTime = "09:00",
            durationMinutes = 60,
            endTime = "10:00",
            category = TaskCategory.DEVELOPMENT,
            developmentType = DevelopmentType.CUMULATIVE,
            cumulativeOrder = 2
        )

        val taskC = Task(
            id = "c",
            title = "Task C",
            day = DayOfWeekEnum.FRIDAY,
            startTime = "15:00",
            durationMinutes = 60,
            endTime = "16:00",
            category = TaskCategory.DEVELOPMENT,
            developmentType = DevelopmentType.CUMULATIVE,
            cumulativeOrder = 3
        )

        val result = SchedulingEngine.calculateEmergencyShift(
            currentDay = DayOfWeekEnum.WEDNESDAY,
            shiftMinutes = 90, // Max 90 minutes
            allTasks = listOf(taskA, taskB, taskC),
            buffers = listOf(buffer),
            settings = settings
        )

        // Task A overflows to Thursday -> Task B and Task C must also remain AFTER Task A
        val updatedA = result.updatedTasks.find { it.id == "a" }!!
        val updatedB = result.updatedTasks.find { it.id == "b" }!!

        assertEquals(DayOfWeekEnum.THURSDAY, updatedA.day)
        // Task B must remain after Task A
        assertTrue((updatedB.cumulativeOrder ?: 0) > (updatedA.cumulativeOrder ?: 0))
    }
}
