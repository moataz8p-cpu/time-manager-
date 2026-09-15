package com.waqt.organizer.notification

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.core.app.NotificationCompat
import com.waqt.organizer.ui.MainActivity

object NotificationHelper {

    const val CHANNEL_TIMER_ID = "waqt_task_timer_channel"
    const val CHANNEL_PRAYER_ID = "waqt_prayer_alerts_channel"
    const val TIMER_NOTIFICATION_ID = 1001
    const val PRAYER_NOTIFICATION_ID = 1002

    fun createNotificationChannels(context: Context) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

            // 1. Timer Channel (Ongoing, silent or low interruption while running)
            val timerChannel = NotificationChannel(
                CHANNEL_TIMER_ID,
                "مؤقت المهام والجلسات",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "عرض الوقت المتبقي للمهمة النشطة وجلسات البومودورو"
                setShowBadge(true)
            }

            // 2. Prayer & Alerts Channel (High importance)
            val prayerChannel = NotificationChannel(
                CHANNEL_PRAYER_ID,
                "تنبيهات الصلاة والأذكار",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "تنبيهات دخول مواقيت الصلاة وأذكار الصباح والمساء"
                enableVibration(true)
            }

            notificationManager.createNotificationChannel(timerChannel)
            notificationManager.createNotificationChannel(prayerChannel)
        }
    }

    fun buildTimerNotification(
        context: Context,
        taskTitle: String,
        remainingSeconds: Int,
        isRunning: Boolean
    ): Notification {
        val minutes = remainingSeconds / 60
        val seconds = remainingSeconds % 60
        val formattedTime = String.format("%02d:%02d", minutes, seconds)
        val contentText = "$taskTitle — $formattedTime متبقي"

        val openAppIntent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_SINGLE_TOP or Intent.FLAG_ACTIVITY_CLEAR_TOP
        }
        val pendingIntent = PendingIntent.getActivity(
            context,
            0,
            openAppIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        return NotificationCompat.Builder(context, CHANNEL_TIMER_ID)
            .setContentTitle("مؤقت المهمة النشط")
            .setContentText(contentText)
            .setSmallIcon(android.R.drawable.ic_lock_idle_alarm)
            .setContentIntent(pendingIntent)
            .setOngoing(isRunning)
            .setOnlyAlertOnce(true)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .build()
    }

    fun sendPhaseFinishedNotification(context: Context, title: String, message: String) {
        val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

        val openAppIntent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_SINGLE_TOP or Intent.FLAG_ACTIVITY_CLEAR_TOP
        }
        val pendingIntent = PendingIntent.getActivity(
            context,
            0,
            openAppIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val notification = NotificationCompat.Builder(context, CHANNEL_PRAYER_ID)
            .setContentTitle(title)
            .setContentText(message)
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .setContentIntent(pendingIntent)
            .setAutoCancel(true)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .build()

        notificationManager.notify(PRAYER_NOTIFICATION_ID, notification)
    }
}
