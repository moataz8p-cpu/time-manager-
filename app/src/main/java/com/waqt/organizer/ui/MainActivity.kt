package com.waqt.organizer.ui

import android.Manifest
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.DrawerValue
import androidx.compose.material3.Surface
import androidx.compose.material3.rememberDrawerState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.core.content.ContextCompat
import com.waqt.organizer.data.local.SettingsDataStore
import com.waqt.organizer.data.local.TaskEntity
import com.waqt.organizer.data.local.WaqtDatabase
import com.waqt.organizer.data.model.AppSettings
import com.waqt.organizer.data.model.DailyBuffer
import com.waqt.organizer.data.model.DayOfWeekEnum
import com.waqt.organizer.data.model.DevelopmentType
import com.waqt.organizer.data.model.Task
import com.waqt.organizer.data.model.TaskCategory
import com.waqt.organizer.notification.NotificationHelper
import com.waqt.organizer.service.TaskTimerService
import com.waqt.organizer.ui.navigation.Screen
import com.waqt.organizer.ui.navigation.WaqtNavigationDrawer
import com.waqt.organizer.ui.screens.ai.AiScreen
import com.waqt.organizer.ui.screens.home.HomeScreen
import com.waqt.organizer.ui.screens.onboarding.OnboardingDialog
import com.waqt.organizer.ui.screens.prayer.PrayerScreen
import com.waqt.organizer.ui.screens.schedule.ScheduleScreen
import com.waqt.organizer.ui.screens.settings.SettingsScreen
import com.waqt.organizer.ui.theme.WaqtTheme
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

class MainActivity : ComponentActivity() {

    private val requestPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { _ -> }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Initialize Android Notification Channels
        NotificationHelper.createNotificationChannels(this)

        // Request POST_NOTIFICATIONS on Android 13+
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS)
                != PackageManager.PERMISSION_GRANTED) {
                requestPermissionLauncher.launch(Manifest.permission.POST_NOTIFICATIONS)
            }
        }

        val database = WaqtDatabase.getInstance(this)
        val settingsDataStore = SettingsDataStore(this)

        setContent {
            val settings by settingsDataStore.settingsFlow.collectAsState(initial = AppSettings())
            val scope = rememberCoroutineScope()

            val entities by database.taskDao().getAllTasks().collectAsState(initial = emptyList())
            val tasks = entities.map { it.toDomain() }

            var buffers by remember {
                mutableStateOf(DayOfWeekEnum.values().map { DailyBuffer(it) })
            }

            WaqtTheme(darkTheme = settings.isDarkMode) {
                Surface(modifier = Modifier.fillMaxSize()) {
                    var currentScreen by remember { mutableStateOf<Screen>(Screen.Home) }
                    val drawerState = rememberDrawerState(initialValue = DrawerValue.Closed)

                    WaqtNavigationDrawer(
                        drawerState = drawerState,
                        currentScreen = currentScreen,
                        onNavigate = { screen ->
                            currentScreen = screen
                            scope.launch { drawerState.close() }
                        }
                    ) {
                        when (currentScreen) {
                            Screen.Home -> {
                                HomeScreen(
                                    onOpenDrawer = { scope.launch { drawerState.open() } },
                                    onNavigateToSchedule = { currentScreen = Screen.Schedule }
                                )
                            }
                            Screen.Schedule -> {
                                ScheduleScreen(
                                    tasks = tasks,
                                    buffers = buffers,
                                    settings = settings,
                                    onOpenDrawer = { scope.launch { drawerState.open() } },
                                    onToggleTaskCompletion = { task ->
                                        scope.launch(Dispatchers.IO) {
                                            database.taskDao().updateTask(
                                                TaskEntity.fromDomain(task.copy(isCompleted = !task.isCompleted))
                                            )
                                        }
                                    },
                                    onStartTimer = { task ->
                                        val durationSecs = if (task.isPomodoro && settings.isPomodoroEnabled) {
                                            settings.focusDurationMinutes * 60
                                        } else {
                                            task.durationMinutes * 60
                                        }
                                        TaskTimerService.startTimer(this@MainActivity, task.title, durationSecs)
                                    },
                                    onApplyShift = { shiftResult ->
                                        scope.launch(Dispatchers.IO) {
                                            database.taskDao().insertAll(
                                                shiftResult.updatedTasks.map { TaskEntity.fromDomain(it) }
                                            )
                                        }
                                        buffers = shiftResult.updatedBuffers
                                    },
                                    onUpdateBuffer = { updatedBuffer ->
                                        buffers = buffers.map { if (it.day == updatedBuffer.day) updatedBuffer else it }
                                    }
                                )
                            }
                            Screen.Prayer -> {
                                PrayerScreen(
                                    settings = settings,
                                    onOpenDrawer = { scope.launch { drawerState.open() } }
                                )
                            }
                            Screen.Ai -> {
                                AiScreen(
                                    tasks = tasks,
                                    buffers = buffers,
                                    settings = settings,
                                    onOpenDrawer = { scope.launch { drawerState.open() } },
                                    onApplyAiProposal = { modifiedTask ->
                                        scope.launch(Dispatchers.IO) {
                                            database.taskDao().insertTask(TaskEntity.fromDomain(modifiedTask))
                                        }
                                    }
                                )
                            }
                            Screen.Settings -> {
                                SettingsScreen(
                                    settings = settings,
                                    onUpdateSettings = { newSettings ->
                                        scope.launch {
                                            settingsDataStore.updateSettings(newSettings)
                                        }
                                    },
                                    onOpenDrawer = { scope.launch { drawerState.open() } }
                                )
                            }
                        }

                        // Onboarding Wizard on First Launch
                        if (!settings.isFirstLaunchCompleted) {
                            OnboardingDialog(
                                settings = settings,
                                onComplete = { completedSettings ->
                                    scope.launch {
                                        settingsDataStore.updateSettings(completedSettings)
                                        // Insert initial sample schedule with cumulative development sequence
                                        database.taskDao().insertAll(
                                            listOf(
                                                TaskEntity.fromDomain(
                                                    Task(
                                                        id = "1",
                                                        title = "مراجعة المهام الأساسية والتخطيط",
                                                        day = DayOfWeekEnum.SATURDAY,
                                                        startTime = "09:00",
                                                        durationMinutes = 60,
                                                        endTime = "10:00",
                                                        isPomodoro = true,
                                                        category = TaskCategory.ESSENTIAL
                                                    )
                                                ),
                                                TaskEntity.fromDomain(
                                                    Task(
                                                        id = "2",
                                                        title = "مهمة تطوير تراكمية (المرحلة الأولى A)",
                                                        day = DayOfWeekEnum.WEDNESDAY,
                                                        startTime = "11:00",
                                                        durationMinutes = 90,
                                                        endTime = "12:30",
                                                        category = TaskCategory.DEVELOPMENT,
                                                        developmentType = DevelopmentType.CUMULATIVE,
                                                        cumulativeOrder = 1
                                                    )
                                                ),
                                                TaskEntity.fromDomain(
                                                    Task(
                                                        id = "3",
                                                        title = "مهمة تطوير تراكمية (المرحلة الثانية B)",
                                                        day = DayOfWeekEnum.THURSDAY,
                                                        startTime = "11:00",
                                                        durationMinutes = 90,
                                                        endTime = "12:30",
                                                        category = TaskCategory.DEVELOPMENT,
                                                        developmentType = DevelopmentType.CUMULATIVE,
                                                        cumulativeOrder = 2
                                                    )
                                                ),
                                                TaskEntity.fromDomain(
                                                    Task(
                                                        id = "4",
                                                        title = "مهمة تطوير تراكمية (المرحلة الثالثة C)",
                                                        day = DayOfWeekEnum.FRIDAY,
                                                        startTime = "15:00",
                                                        durationMinutes = 90,
                                                        endTime = "16:30",
                                                        category = TaskCategory.DEVELOPMENT,
                                                        developmentType = DevelopmentType.CUMULATIVE,
                                                        cumulativeOrder = 3
                                                    )
                                                )
                                            )
                                        )
                                    }
                                }
                            )
                        }
                    }
                }
            }
        }
    }
}
