package com.waqt.organizer.data.local

import androidx.room.Entity
import androidx.room.PrimaryKey
import com.waqt.organizer.data.model.DayOfWeekEnum
import com.waqt.organizer.data.model.DevelopmentType
import com.waqt.organizer.data.model.Task
import com.waqt.organizer.data.model.TaskCategory

@Entity(tableName = "tasks")
data class TaskEntity(
    @PrimaryKey
    val id: String,
    val title: String,
    val day: String,
    val startTime: String,
    val durationMinutes: Int,
    val endTime: String,
    val isPomodoro: Boolean,
    val category: String,
    val developmentType: String?,
    val cumulativeOrder: Int?,
    val isCompleted: Boolean,
    val createdAt: Long
) {
    fun toDomain(): Task {
        return Task(
            id = id,
            title = title,
            day = DayOfWeekEnum.values().firstOrNull { it.id == day } ?: DayOfWeekEnum.SATURDAY,
            startTime = startTime,
            durationMinutes = durationMinutes,
            endTime = endTime,
            isPomodoro = isPomodoro,
            category = TaskCategory.values().firstOrNull { it.name == category } ?: TaskCategory.ESSENTIAL,
            developmentType = developmentType?.let { typeStr ->
                DevelopmentType.values().firstOrNull { it.name == typeStr }
            },
            cumulativeOrder = cumulativeOrder,
            isCompleted = isCompleted,
            createdAt = createdAt
        )
    }

    companion object {
        fun fromDomain(task: Task): TaskEntity {
            return TaskEntity(
                id = task.id,
                title = task.title,
                day = task.day.id,
                startTime = task.startTime,
                durationMinutes = task.durationMinutes,
                endTime = task.endTime,
                isPomodoro = task.isPomodoro,
                category = task.category.name,
                developmentType = task.developmentType?.name,
                cumulativeOrder = task.cumulativeOrder,
                isCompleted = task.isCompleted,
                createdAt = task.createdAt
            )
        }
    }
}
