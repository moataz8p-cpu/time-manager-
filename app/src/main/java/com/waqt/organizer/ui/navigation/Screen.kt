package com.waqt.organizer.ui.navigation

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.AutoAwesome
import androidx.compose.material.icons.rounded.CalendarMonth
import androidx.compose.material.icons.rounded.Home
import androidx.compose.material.icons.rounded.Mosque
import androidx.compose.material.icons.rounded.Settings
import androidx.compose.ui.graphics.vector.ImageVector

sealed class Screen(
    val route: String,
    val title: String,
    val icon: ImageVector
) {
    object Home : Screen("home", "الرئيسية", Icons.Rounded.Home)
    object Schedule : Screen("schedule", "تنظيم الوقت والجدول الأسبوعي", Icons.Rounded.CalendarMonth)
    object Prayer : Screen("prayer", "مواقيت الصلاة، الأذكار، والقرآن", Icons.Rounded.Mosque)
    object Ai : Screen("ai", "المساعد الذكي", Icons.Rounded.AutoAwesome)
    object Settings : Screen("settings", "الإعدادات", Icons.Rounded.Settings)

    companion object {
        val allScreens = listOf(Home, Schedule, Prayer, Ai, Settings)
    }
}
