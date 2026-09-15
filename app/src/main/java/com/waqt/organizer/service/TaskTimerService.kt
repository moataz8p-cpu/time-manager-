package com.waqt.organizer.service

import android.app.Service
import android.content.Context
import android.content.Intent
import android.os.IBinder
import com.waqt.organizer.notification.NotificationHelper
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class TaskTimerService : Service() {

    private val serviceJob = Job()
    private val serviceScope = CoroutineScope(Dispatchers.Main + serviceJob)
    private var timerJob: Job? = null

    companion object {
        const val ACTION_START = "ACTION_START"
        const val ACTION_PAUSE = "ACTION_PAUSE"
        const val ACTION_RESUME = "ACTION_RESUME"
        const val ACTION_STOP = "ACTION_STOP"

        const val EXTRA_TASK_TITLE = "EXTRA_TASK_TITLE"
        const val EXTRA_DURATION_SECONDS = "EXTRA_DURATION_SECONDS"

        private val _remainingSecondsFlow = MutableStateFlow(0)
        val remainingSecondsFlow: StateFlow<Int> = _remainingSecondsFlow.asStateFlow()

        private val _isRunningFlow = MutableStateFlow(false)
        val isRunningFlow: StateFlow<Boolean> = _isRunningFlow.asStateFlow()

        private val _currentTaskTitleFlow = MutableStateFlow("")
        val currentTaskTitleFlow: StateFlow<String> = _currentTaskTitleFlow.asStateFlow()

        fun startTimer(context: Context, taskTitle: String, durationSeconds: Int) {
            val intent = Intent(context, TaskTimerService::class.java).apply {
                action = ACTION_START
                putExtra(EXTRA_TASK_TITLE, taskTitle)
                putExtra(EXTRA_DURATION_SECONDS, durationSeconds)
            }
            context.startForegroundService(intent)
        }

        fun stopTimer(context: Context) {
            val intent = Intent(context, TaskTimerService::class.java).apply {
                action = ACTION_STOP
            }
            context.startService(intent)
        }
    }

    private var targetEndTimeMillis: Long = 0L
    private var taskTitle: String = ""

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            ACTION_START -> {
                taskTitle = intent.getStringExtra(EXTRA_TASK_TITLE) ?: "مهمة"
                val durationSeconds = intent.getIntExtra(EXTRA_DURATION_SECONDS, 25 * 60)
                _currentTaskTitleFlow.value = taskTitle
                _remainingSecondsFlow.value = durationSeconds
                _isRunningFlow.value = true

                targetEndTimeMillis = System.currentTimeMillis() + (durationSeconds * 1000L)

                val notification = NotificationHelper.buildTimerNotification(
                    this,
                    taskTitle,
                    durationSeconds,
                    true
                )
                startForeground(NotificationHelper.TIMER_NOTIFICATION_ID, notification)
                startTicker()
            }
            ACTION_PAUSE -> {
                _isRunningFlow.value = false
                timerJob?.cancel()
            }
            ACTION_RESUME -> {
                _isRunningFlow.value = true
                targetEndTimeMillis = System.currentTimeMillis() + (_remainingSecondsFlow.value * 1000L)
                startTicker()
            }
            ACTION_STOP -> {
                stopTimerInternal()
            }
        }
        return START_NOT_STICKY
    }

    private fun startTicker() {
        timerJob?.cancel()
        timerJob = serviceScope.launch {
            while (_isRunningFlow.value) {
                val now = System.currentTimeMillis()
                val remaining = Math.max(0, ((targetEndTimeMillis - now) / 1000L).toInt())
                _remainingSecondsFlow.value = remaining

                // Update notification
                val notification = NotificationHelper.buildTimerNotification(
                    this@TaskTimerService,
                    taskTitle,
                    remaining,
                    true
                )
                val manager = getSystemService(Context.NOTIFICATION_SERVICE) as android.app.NotificationManager
                manager.notify(NotificationHelper.TIMER_NOTIFICATION_ID, notification)

                if (remaining <= 0) {
                    _isRunningFlow.value = false
                    NotificationHelper.sendPhaseFinishedNotification(
                        this@TaskTimerService,
                        "اكتملت الجلسة!",
                        "انتهت جلسة المهمة: $taskTitle"
                    )
                    stopTimerInternal()
                    break
                }
                delay(1000L)
            }
        }
    }

    private fun stopTimerInternal() {
        timerJob?.cancel()
        _isRunningFlow.value = false
        _remainingSecondsFlow.value = 0
        stopForeground(STOP_FOREGROUND_REMOVE)
        stopSelf()
    }

    override fun onDestroy() {
        super.onDestroy()
        serviceJob.cancel()
    }

    override fun onBind(intent: Intent?): IBinder? = null
}
