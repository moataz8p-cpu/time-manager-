package com.waqt.organizer.ui.theme

import android.app.Activity
import android.content.Context
import android.content.ContextWrapper
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

private tailrec fun Context.findActivity(): Activity? = when (this) {
    is Activity -> this
    is ContextWrapper -> baseContext.findActivity()
    else -> null
}

private val DarkColorScheme = darkColorScheme(
    primary = WaqtGreen,
    onPrimary = SurfaceLight,
    primaryContainer = WaqtGreenDark,
    onPrimaryContainer = WaqtLightGreen,
    secondary = WaqtBeige,
    onSecondary = WaqtDarkBrown,
    background = BackgroundDark,
    onBackground = TextPrimaryDark,
    surface = SurfaceDark,
    onSurface = TextPrimaryDark
)

private val LightColorScheme = lightColorScheme(
    primary = WaqtGreen,
    onPrimary = SurfaceLight,
    primaryContainer = WaqtLightGreen,
    onPrimaryContainer = WaqtGreenDark,
    secondary = WaqtBeige,
    onSecondary = WaqtDarkBrown,
    background = BackgroundLight,
    onBackground = TextPrimaryLight,
    surface = SurfaceLight,
    onSurface = TextPrimaryLight
)

@Composable
fun WaqtTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme
    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            try {
                val activity = view.context.findActivity()
                activity?.window?.let { window ->
                    window.statusBarColor = colorScheme.background.toArgb()
                    WindowCompat.getInsetsController(window, view).isAppearanceLightStatusBars = !darkTheme
                }
            } catch (_: Throwable) {
                // Ignore any system insets / window controller exceptions on specialized OEM ROMs
            }
        }
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = WaqtTypography,
        content = content
    )
}
