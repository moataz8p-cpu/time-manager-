package com.waqt.organizer.ui.screens.onboarding

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.waqt.organizer.data.model.AppSettings
import com.waqt.organizer.ui.theme.WaqtDarkBrown
import com.waqt.organizer.ui.theme.WaqtGreen
import com.waqt.organizer.ui.theme.WaqtOffWhite

@Composable
fun OnboardingDialog(
    settings: AppSettings,
    onComplete: (AppSettings) -> Unit
) {
    var draftSettings by remember { mutableStateOf(settings) }

    AlertDialog(
        onDismissRequest = { },
        containerColor = WaqtOffWhite,
        shape = RoundedCornerShape(20.dp),
        title = {
            Text(
                text = "مرحباً بك في منظم الوقت",
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
                color = WaqtDarkBrown
            )
        },
        text = {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .verticalScroll(rememberScrollState()),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Text(
                    text = "لإعداد جدولك الأسبوعي بدقة، يرجى ضبط تفضيلاتك الأساسية (يمكنك تعديلها في أي وقت من الإعدادات):",
                    fontSize = 13.sp,
                    color = WaqtDarkBrown.copy(alpha = 0.8f)
                )

                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Column(modifier = Modifier.padding(12.dp)) {
                        Text("ساعات العمل (السبت - الخميس)", fontSize = 13.sp, fontWeight = FontWeight.SemiBold, color = WaqtGreen)
                        Spacer(modifier = Modifier.height(2.dp))
                        Text("${draftSettings.dailyStartTime} إلى ${draftSettings.dailyEndTime}", fontSize = 12.sp, color = WaqtDarkBrown)

                        Spacer(modifier = Modifier.height(8.dp))
                        Text("ساعات يوم الجمعة المستقلة", fontSize = 13.sp, fontWeight = FontWeight.SemiBold, color = WaqtGreen)
                        Spacer(modifier = Modifier.height(2.dp))
                        Text("${draftSettings.fridayStartTime} إلى ${draftSettings.fridayEndTime}", fontSize = 12.sp, color = WaqtDarkBrown)
                    }
                }

                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(12.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text("تفعيل البومودورو", fontSize = 13.sp, fontWeight = FontWeight.SemiBold, color = WaqtDarkBrown)
                            Text("${draftSettings.focusDurationMinutes} دقيقة تركيز / ${draftSettings.breakDurationMinutes} دقيقة استراحة", fontSize = 11.sp, color = WaqtDarkBrown.copy(alpha = 0.6f))
                        }
                        Switch(
                            checked = draftSettings.isPomodoroEnabled,
                            onCheckedChange = { draftSettings = draftSettings.copy(isPomodoroEnabled = it) },
                            colors = SwitchDefaults.colors(checkedThumbColor = Color.White, checkedTrackColor = WaqtGreen)
                        )
                    }
                }

                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(12.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text("وقت الاحتياط (Buffer)", fontSize = 13.sp, fontWeight = FontWeight.SemiBold, color = WaqtDarkBrown)
                            Text("${draftSettings.defaultBufferDurationMinutes} دقيقة في نهاية اليوم", fontSize = 11.sp, color = WaqtDarkBrown.copy(alpha = 0.6f))
                        }
                        Switch(
                            checked = draftSettings.isBufferEnabled,
                            onCheckedChange = { draftSettings = draftSettings.copy(isBufferEnabled = it) },
                            colors = SwitchDefaults.colors(checkedThumbColor = Color.White, checkedTrackColor = WaqtGreen)
                        )
                    }
                }
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    onComplete(draftSettings.copy(isFirstLaunchCompleted = true))
                },
                colors = ButtonDefaults.buttonColors(containerColor = WaqtGreen),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Text("ابدأ تنظيم وقتك الآن", fontSize = 14.sp, fontWeight = FontWeight.Bold)
            }
        }
    )
}
