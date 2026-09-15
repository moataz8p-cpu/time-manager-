package com.waqt.organizer.ui.screens.settings

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.Menu
import androidx.compose.material.icons.rounded.Settings
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.waqt.organizer.data.model.AppSettings
import com.waqt.organizer.ui.theme.WaqtBeige
import com.waqt.organizer.ui.theme.WaqtDarkBrown
import com.waqt.organizer.ui.theme.WaqtGreen
import com.waqt.organizer.ui.theme.WaqtLightGreen
import com.waqt.organizer.ui.theme.WaqtOffWhite

@Composable
fun SettingsScreen(
    settings: AppSettings,
    onUpdateSettings: (AppSettings) -> Unit,
    onOpenDrawer: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(WaqtOffWhite)
            .padding(16.dp)
    ) {
        // Header
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(
                onClick = onOpenDrawer,
                modifier = Modifier
                    .size(44.dp)
                    .clip(CircleShape)
                    .background(Color.White)
                    .border(1.dp, WaqtBeige.copy(alpha = 0.5f), CircleShape)
            ) {
                Icon(Icons.Rounded.Menu, contentDescription = "القائمة", tint = WaqtDarkBrown)
            }

            Text(
                text = "الإعدادات",
                fontSize = 17.sp,
                fontWeight = FontWeight.Bold,
                color = WaqtDarkBrown
            )

            Box(
                modifier = Modifier
                    .size(44.dp)
                    .clip(CircleShape)
                    .background(WaqtLightGreen),
                contentAlignment = Alignment.Center
            ) {
                Icon(Icons.Rounded.Settings, contentDescription = null, tint = WaqtGreen, modifier = Modifier.size(22.dp))
            }
        }

        Spacer(modifier = Modifier.height(14.dp))

        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            item {
                SettingsSectionHeader(title = "ساعات العمل والدراسة")
            }

            item {
                SettingsCard {
                    SettingsRowText(
                        title = "فترة الأيام العادية (السبت - الخميس)",
                        subtitle = "${settings.dailyStartTime} إلى ${settings.dailyEndTime}"
                    )
                    Spacer(modifier = Modifier.height(10.dp))
                    SettingsRowText(
                        title = "فترة يوم الجمعة المستقلة",
                        subtitle = "${settings.fridayStartTime} إلى ${settings.fridayEndTime}"
                    )
                }
            }

            item {
                SettingsSectionHeader(title = "مؤقت البومودورو")
            }

            item {
                SettingsCard {
                    SettingsRowSwitch(
                        title = "تفعيل البومودورو",
                        subtitle = "جلسات تركيز وفترات استراحة منتظمة",
                        checked = settings.isPomodoroEnabled,
                        onCheckedChange = { onUpdateSettings(settings.copy(isPomodoroEnabled = it)) }
                    )
                    Spacer(modifier = Modifier.height(10.dp))
                    SettingsRowText(
                        title = "مدة التركيز والاستراحة",
                        subtitle = "${settings.focusDurationMinutes} دقيقة تركيز / ${settings.breakDurationMinutes} دقائق استراحة"
                    )
                }
            }

            item {
                SettingsSectionHeader(title = "وقت الاحتياط (Buffer)")
            }

            item {
                SettingsCard {
                    SettingsRowSwitch(
                        title = "تفعيل الـ Buffer التلقائي",
                        subtitle = "حجز هامش زمني في نهاية كل يوم لامتصاص الطوارئ",
                        checked = settings.isBufferEnabled,
                        onCheckedChange = { onUpdateSettings(settings.copy(isBufferEnabled = it)) }
                    )
                    Spacer(modifier = Modifier.height(10.dp))
                    SettingsRowText(
                        title = "المدة الافتراضية",
                        subtitle = "${settings.defaultBufferDurationMinutes} دقيقة يومياً"
                    )
                }
            }

            item {
                SettingsSectionHeader(title = "الإشعارات والتنبيهات")
            }

            item {
                SettingsCard {
                    SettingsRowSwitch(
                        title = "إشعارات النظام",
                        subtitle = "تنبيهات دخول مواقيت الصلاة ونهاية الجلسات",
                        checked = settings.isNotificationsEnabled,
                        onCheckedChange = { onUpdateSettings(settings.copy(isNotificationsEnabled = it)) }
                    )
                    Spacer(modifier = Modifier.height(10.dp))
                    SettingsRowSwitch(
                        title = "إشعار المؤقت المستمر",
                        subtitle = "عرض العداد التنازلي في شريط الإشعارات أثناء العمل",
                        checked = settings.isTimerNotificationEnabled,
                        onCheckedChange = { onUpdateSettings(settings.copy(isTimerNotificationEnabled = it)) }
                    )
                    Spacer(modifier = Modifier.height(10.dp))
                    SettingsRowSwitch(
                        title = "الأصوات والتنبيهات",
                        subtitle = "تشغيل نغمات هادئة عند انتهاء المؤقت",
                        checked = settings.isSoundEnabled,
                        onCheckedChange = { onUpdateSettings(settings.copy(isSoundEnabled = it)) }
                    )
                }
            }

            item {
                SettingsSectionHeader(title = "الموقع ومواقيت الصلاة")
            }

            item {
                SettingsCard {
                    SettingsRowText(
                        title = "المدينة المختارة",
                        subtitle = settings.city
                    )
                    Spacer(modifier = Modifier.height(10.dp))
                    SettingsRowText(
                        title = "أذكار الصباح",
                        subtitle = "بعد الفجر بـ ${settings.morningAdhkarOffsetMinutes} دقيقة"
                    )
                    Spacer(modifier = Modifier.height(10.dp))
                    SettingsRowText(
                        title = "أذكار المساء",
                        subtitle = "قبل المغرب بـ ${settings.eveningAdhkarOffsetMinutes} دقيقة"
                    )
                }
            }

            item {
                Spacer(modifier = Modifier.height(20.dp))
            }
        }
    }
}

@Composable
private fun SettingsSectionHeader(title: String) {
    Text(
        text = title,
        fontSize = 14.sp,
        fontWeight = FontWeight.Bold,
        color = WaqtGreen,
        modifier = Modifier.padding(vertical = 4.dp)
    )
}

@Composable
private fun SettingsCard(content: @Composable () -> Unit) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        shape = RoundedCornerShape(14.dp)
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            content()
        }
    }
}

@Composable
private fun SettingsRowText(title: String, subtitle: String) {
    Column {
        Text(text = title, fontSize = 14.sp, fontWeight = FontWeight.SemiBold, color = WaqtDarkBrown)
        Spacer(modifier = Modifier.height(2.dp))
        Text(text = subtitle, fontSize = 12.sp, color = WaqtDarkBrown.copy(alpha = 0.6f))
    }
}

@Composable
private fun SettingsRowSwitch(
    title: String,
    subtitle: String,
    checked: Boolean,
    onCheckedChange: (Boolean) -> Unit
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Column(modifier = Modifier.weight(1f)) {
            Text(text = title, fontSize = 14.sp, fontWeight = FontWeight.SemiBold, color = WaqtDarkBrown)
            Spacer(modifier = Modifier.height(2.dp))
            Text(text = subtitle, fontSize = 12.sp, color = WaqtDarkBrown.copy(alpha = 0.6f))
        }

        Switch(
            checked = checked,
            onCheckedChange = onCheckedChange,
            colors = SwitchDefaults.colors(
                checkedThumbColor = Color.White,
                checkedTrackColor = WaqtGreen
            )
        )
    }
}
