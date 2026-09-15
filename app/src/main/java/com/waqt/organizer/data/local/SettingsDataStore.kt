package com.waqt.organizer.data.local

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.doublePreferencesKey
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.intPreferencesKey
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import com.waqt.organizer.data.model.AppSettings
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "waqt_settings")

class SettingsDataStore(private val context: Context) {

    private object Keys {
        val DAILY_START = stringPreferencesKey("daily_start")
        val DAILY_END = stringPreferencesKey("daily_end")
        val FRIDAY_START = stringPreferencesKey("friday_start")
        val FRIDAY_END = stringPreferencesKey("friday_end")
        val POMODORO_ENABLED = booleanPreferencesKey("pomodoro_enabled")
        val FOCUS_DURATION = intPreferencesKey("focus_duration")
        val BREAK_DURATION = intPreferencesKey("break_duration")
        val BUFFER_ENABLED = booleanPreferencesKey("buffer_enabled")
        val BUFFER_DURATION = intPreferencesKey("buffer_duration")
        val NOTIFICATIONS_ENABLED = booleanPreferencesKey("notifications_enabled")
        val TIMER_NOTIFICATION_ENABLED = booleanPreferencesKey("timer_notification_enabled")
        val SOUND_ENABLED = booleanPreferencesKey("sound_enabled")
        val DARK_MODE = booleanPreferencesKey("dark_mode")
        val CITY = stringPreferencesKey("city")
        val LATITUDE = doublePreferencesKey("latitude")
        val LONGITUDE = doublePreferencesKey("longitude")
        val ONBOARDING_COMPLETED = booleanPreferencesKey("onboarding_completed")
    }

    val settingsFlow: Flow<AppSettings> = context.dataStore.data.map { pref ->
        AppSettings(
            dailyStartTime = pref[Keys.DAILY_START] ?: "08:00",
            dailyEndTime = pref[Keys.DAILY_END] ?: "22:00",
            fridayStartTime = pref[Keys.FRIDAY_START] ?: "14:00",
            fridayEndTime = pref[Keys.FRIDAY_END] ?: "23:00",
            isPomodoroEnabled = pref[Keys.POMODORO_ENABLED] ?: true,
            focusDurationMinutes = pref[Keys.FOCUS_DURATION] ?: 25,
            breakDurationMinutes = pref[Keys.BREAK_DURATION] ?: 5,
            isBufferEnabled = pref[Keys.BUFFER_ENABLED] ?: true,
            defaultBufferDurationMinutes = pref[Keys.BUFFER_DURATION] ?: 45,
            isNotificationsEnabled = pref[Keys.NOTIFICATIONS_ENABLED] ?: true,
            isTimerNotificationEnabled = pref[Keys.TIMER_NOTIFICATION_ENABLED] ?: true,
            isSoundEnabled = pref[Keys.SOUND_ENABLED] ?: true,
            isDarkMode = pref[Keys.DARK_MODE] ?: false,
            city = pref[Keys.CITY] ?: "القاهرة",
            latitude = pref[Keys.LATITUDE] ?: 30.0444,
            longitude = pref[Keys.LONGITUDE] ?: 31.2357,
            isFirstLaunchCompleted = pref[Keys.ONBOARDING_COMPLETED] ?: false
        )
    }

    suspend fun updateSettings(settings: AppSettings) {
        context.dataStore.edit { pref ->
            pref[Keys.DAILY_START] = settings.dailyStartTime
            pref[Keys.DAILY_END] = settings.dailyEndTime
            pref[Keys.FRIDAY_START] = settings.fridayStartTime
            pref[Keys.FRIDAY_END] = settings.fridayEndTime
            pref[Keys.POMODORO_ENABLED] = settings.isPomodoroEnabled
            pref[Keys.FOCUS_DURATION] = settings.focusDurationMinutes
            pref[Keys.BREAK_DURATION] = settings.breakDurationMinutes
            pref[Keys.BUFFER_ENABLED] = settings.isBufferEnabled
            pref[Keys.BUFFER_DURATION] = settings.defaultBufferDurationMinutes
            pref[Keys.NOTIFICATIONS_ENABLED] = settings.isNotificationsEnabled
            pref[Keys.TIMER_NOTIFICATION_ENABLED] = settings.isTimerNotificationEnabled
            pref[Keys.SOUND_ENABLED] = settings.isSoundEnabled
            pref[Keys.DARK_MODE] = settings.isDarkMode
            pref[Keys.CITY] = settings.city
            pref[Keys.LATITUDE] = settings.latitude
            pref[Keys.LONGITUDE] = settings.longitude
            pref[Keys.ONBOARDING_COMPLETED] = settings.isFirstLaunchCompleted
        }
    }
}
