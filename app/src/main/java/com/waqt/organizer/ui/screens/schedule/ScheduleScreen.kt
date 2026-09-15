package com.waqt.organizer.ui.screens.schedule

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
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
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.Add
import androidx.compose.material.icons.rounded.CheckCircle
import androidx.compose.material.icons.rounded.CheckCircleOutline
import androidx.compose.material.icons.rounded.Menu
import androidx.compose.material.icons.rounded.PlayArrow
import androidx.compose.material.icons.rounded.Shield
import androidx.compose.material.icons.rounded.WarningAmber
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Tab
import androidx.compose.material3.TabRow
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.waqt.organizer.data.model.AppSettings
import com.waqt.organizer.data.model.DailyBuffer
import com.waqt.organizer.data.model.DayOfWeekEnum
import com.waqt.organizer.data.model.DevelopmentType
import com.waqt.organizer.data.model.Task
import com.waqt.organizer.data.model.TaskCategory
import com.waqt.organizer.engine.SchedulingEngine
import com.waqt.organizer.engine.ShiftResult
import com.waqt.organizer.ui.theme.WaqtBeige
import com.waqt.organizer.ui.theme.WaqtDarkBrown
import com.waqt.organizer.ui.theme.WaqtGreen
import com.waqt.organizer.ui.theme.WaqtLightGreen
import com.waqt.organizer.ui.theme.WaqtOffWhite
import java.time.LocalDate

@Composable
fun ScheduleScreen(
    tasks: List<Task>,
    buffers: List<DailyBuffer>,
    settings: AppSettings,
    onOpenDrawer: () -> Unit,
    onToggleTaskCompletion: (Task) -> Unit,
    onStartTimer: (Task) -> Unit,
    onApplyShift: (ShiftResult) -> Unit,
    onUpdateBuffer: (DailyBuffer) -> Unit
) {
    // Current Real Day from Android calendar
    val todayEnum = remember {
        when (LocalDate.now().dayOfWeek) {
            java.time.DayOfWeek.SATURDAY -> DayOfWeekEnum.SATURDAY
            java.time.DayOfWeek.SUNDAY -> DayOfWeekEnum.SUNDAY
            java.time.DayOfWeek.MONDAY -> DayOfWeekEnum.MONDAY
            java.time.DayOfWeek.TUESDAY -> DayOfWeekEnum.TUESDAY
            java.time.DayOfWeek.WEDNESDAY -> DayOfWeekEnum.WEDNESDAY
            java.time.DayOfWeek.THURSDAY -> DayOfWeekEnum.THURSDAY
            java.time.DayOfWeek.FRIDAY -> DayOfWeekEnum.FRIDAY
        }
    }

    var selectedDay by remember { mutableStateOf(todayEnum) }
    var selectedTab by remember { mutableIntStateOf(0) } // 0: Essential, 1: Development, 2: Buffer, 3: Weekly Graph

    // Emergency Shift Dialog State
    var showShiftDialog by remember { mutableStateOf(false) }
    var selectedShiftMinutes by remember { mutableIntStateOf(30) }
    var previewShiftResult by remember { mutableStateOf<ShiftResult?>(null) }

    val dayTasks = tasks.filter { it.day == selectedDay }
    val essentialTasks = dayTasks.filter { it.category == TaskCategory.ESSENTIAL }
    val developmentTasks = dayTasks.filter { it.category == TaskCategory.DEVELOPMENT }
    val currentBuffer = buffers.find { it.day == selectedDay } ?: DailyBuffer(selectedDay)

    // Calculate real completion percentage
    val totalCount = dayTasks.size
    val completedCount = dayTasks.count { it.isCompleted }
    val completionPercent = if (totalCount > 0) (completedCount * 100) / totalCount else 0

    val motivationalMessage = when {
        totalCount == 0 -> "لا توجد مهام مسجلة لهذا اليوم"
        completionPercent <= 50 -> "معلش شد حيلك"
        completionPercent <= 70 -> "عاش بس فيه أفضل"
        completionPercent <= 80 -> "حلو أوي برافو"
        else -> "عاش جامد كافئ نفسك (بالحلال)"
    }

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
                text = "تنظيم الوقت والجدول الأسبوعي",
                fontSize = 17.sp,
                fontWeight = FontWeight.Bold,
                color = WaqtDarkBrown
            )

            // Emergency Shift Button
            Button(
                onClick = { showShiftDialog = true },
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFC85A32)),
                shape = RoundedCornerShape(12.dp)
            ) {
                Icon(Icons.Rounded.WarningAmber, contentDescription = null, modifier = Modifier.size(16.dp))
                Spacer(modifier = Modifier.width(4.dp))
                Text("إزاحة طوارئ", fontSize = 12.sp, fontWeight = FontWeight.Bold)
            }
        }

        Spacer(modifier = Modifier.height(14.dp))

        // Days Horizontal Bar: Saturday to Friday (Friday is final day)
        LazyRow(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            items(DayOfWeekEnum.values()) { day ->
                val isSelected = day == selectedDay
                val isToday = day == todayEnum

                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(12.dp))
                        .background(if (isSelected) WaqtGreen else Color.White)
                        .border(
                            1.dp,
                            if (isToday && !isSelected) WaqtGreen else WaqtBeige.copy(alpha = 0.5f),
                            RoundedCornerShape(12.dp)
                        )
                        .clickable { selectedDay = day }
                        .padding(horizontal = 14.dp, vertical = 10.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text(
                            text = day.nameAr,
                            fontSize = 13.sp,
                            fontWeight = if (isSelected || isToday) FontWeight.Bold else FontWeight.Normal,
                            color = if (isSelected) Color.White else WaqtDarkBrown
                        )
                        if (isToday) {
                            Spacer(modifier = Modifier.height(2.dp))
                            Box(
                                modifier = Modifier
                                    .size(4.dp)
                                    .clip(CircleShape)
                                    .background(if (isSelected) Color.White else WaqtGreen)
                            )
                        }
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(14.dp))

        // Daily Completion Card
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = Color.White),
            shape = RoundedCornerShape(16.dp),
            elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(14.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = "إنجاز يوم ${selectedDay.nameAr}: $completionPercent%",
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Bold,
                        color = WaqtDarkBrown
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = motivationalMessage,
                        fontSize = 13.sp,
                        color = WaqtGreen,
                        fontWeight = FontWeight.Medium
                    )
                }

                Box(
                    modifier = Modifier
                        .size(48.dp)
                        .clip(CircleShape)
                        .background(WaqtLightGreen),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "$completedCount/$totalCount",
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Bold,
                        color = WaqtGreen
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // Tabs within this single screen: Essential | Development | Buffer | Graph
        val tabs = listOf("الأساسية", "التطوير", "الاحتياط", "المخطط")
        TabRow(
            selectedTabIndex = selectedTab,
            containerColor = Color.White,
            contentColor = WaqtGreen,
            modifier = Modifier.clip(RoundedCornerShape(12.dp))
        ) {
            tabs.forEachIndexed { index, label ->
                Tab(
                    selected = selectedTab == index,
                    onClick = { selectedTab = index },
                    text = {
                        Text(
                            text = label,
                            fontSize = 13.sp,
                            fontWeight = if (selectedTab == index) FontWeight.Bold else FontWeight.Normal
                        )
                    }
                )
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // Tab Content
        when (selectedTab) {
            0 -> {
                // Essential Tasks
                LazyColumn(
                    modifier = Modifier.fillMaxSize(),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    if (essentialTasks.isEmpty()) {
                        item {
                            Text(
                                text = "لا توجد مهام أساسية مسجلة لهذا اليوم.",
                                fontSize = 14.sp,
                                color = WaqtDarkBrown.copy(alpha = 0.6f),
                                modifier = Modifier.padding(16.dp)
                            )
                        }
                    }
                    items(essentialTasks) { task ->
                        TaskItemRow(
                            task = task,
                            onToggle = { onToggleTaskCompletion(task) },
                            onStartTimer = { onStartTimer(task) }
                        )
                    }
                }
            }
            1 -> {
                // Development Tasks (Cumulative & Non-Cumulative)
                LazyColumn(
                    modifier = Modifier.fillMaxSize(),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    if (developmentTasks.isEmpty()) {
                        item {
                            Text(
                                text = "لا توجد مهام تطوير مسجلة لهذا اليوم.",
                                fontSize = 14.sp,
                                color = WaqtDarkBrown.copy(alpha = 0.6f),
                                modifier = Modifier.padding(16.dp)
                            )
                        }
                    }
                    items(developmentTasks) { task ->
                        TaskItemRow(
                            task = task,
                            onToggle = { onToggleTaskCompletion(task) },
                            onStartTimer = { onStartTimer(task) }
                        )
                    }
                }
            }
            2 -> {
                // Buffer (One Buffer per day at the end of the day)
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    shape = RoundedCornerShape(16.dp)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "وقت الاحتياط (Buffer) لنهاية اليوم",
                                fontSize = 16.sp,
                                fontWeight = FontWeight.Bold,
                                color = WaqtDarkBrown
                            )
                            Icon(
                                Icons.Rounded.Shield,
                                contentDescription = null,
                                tint = if (currentBuffer.isEnabled) WaqtGreen else Color.Gray
                            )
                        }
                        Spacer(modifier = Modifier.height(10.dp))
                        Text(
                            text = "هامش زمني مرن (${currentBuffer.durationMinutes} دقيقة) في نهاية يوم ${selectedDay.nameAr} لامتصاص التأخيرات وحماية المهام.",
                            fontSize = 13.sp,
                            color = WaqtDarkBrown.copy(alpha = 0.7f)
                        )
                        Spacer(modifier = Modifier.height(16.dp))
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            OutlinedButton(
                                onClick = {
                                    onUpdateBuffer(currentBuffer.copy(isEnabled = !currentBuffer.isEnabled))
                                }
                            ) {
                                Text(if (currentBuffer.isEnabled) "تعطيل الاحتياط" else "تفعيل الاحتياط")
                            }

                            Button(
                                onClick = {
                                    val newDuration = if (currentBuffer.durationMinutes == 45) 60 else 45
                                    onUpdateBuffer(currentBuffer.copy(durationMinutes = newDuration))
                                },
                                colors = ButtonDefaults.buttonColors(containerColor = WaqtGreen)
                            ) {
                                Text("${currentBuffer.durationMinutes} دقيقة")
                            }
                        }
                    }
                }
            }
            3 -> {
                // Weekly Completion Graph
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    shape = RoundedCornerShape(16.dp)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text(
                            text = "مخطط الإنجاز الأسبوعي (السبت إلى الجمعة)",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold,
                            color = WaqtDarkBrown
                        )
                        Spacer(modifier = Modifier.height(16.dp))
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(160.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.Bottom
                        ) {
                            DayOfWeekEnum.values().forEach { d ->
                                val dayT = tasks.filter { it.day == d }
                                val comp = if (dayT.isNotEmpty()) (dayT.count { it.isCompleted } * 100) / dayT.size else 0
                                Column(
                                    horizontalAlignment = Alignment.CenterHorizontally,
                                    verticalArrangement = Arrangement.Bottom
                                ) {
                                    Text(text = "$comp%", fontSize = 10.sp, color = WaqtGreen)
                                    Spacer(modifier = Modifier.height(4.dp))
                                    Box(
                                        modifier = Modifier
                                            .width(24.dp)
                                            .height((Math.max(10, comp)).dp)
                                            .clip(RoundedCornerShape(topStart = 6.dp, topEnd = 6.dp))
                                            .background(if (d == selectedDay) WaqtGreen else WaqtBeige)
                                    )
                                    Spacer(modifier = Modifier.height(6.dp))
                                    Text(
                                        text = d.nameAr.take(3),
                                        fontSize = 11.sp,
                                        color = WaqtDarkBrown
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    // Emergency Shift Selection & Preview Dialog
    if (showShiftDialog) {
        AlertDialog(
            onDismissRequest = {
                showShiftDialog = false
                previewShiftResult = null
            },
            title = {
                Text(
                    text = "إزاحة طوارئ (Emergency Shift)",
                    fontWeight = FontWeight.Bold,
                    fontSize = 17.sp
                )
            },
            text = {
                Column {
                    Text(
                        text = "اختر مدة التأخير لإعادة تنظيم الجدول تلقائياً بمرونة وأمان:",
                        fontSize = 13.sp,
                        color = WaqtDarkBrown
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        listOf(15, 30, 45, 60, 90).forEach { mins ->
                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(8.dp))
                                    .background(if (selectedShiftMinutes == mins) WaqtGreen else WaqtOffWhite)
                                    .border(1.dp, WaqtBeige, RoundedCornerShape(8.dp))
                                    .clickable { selectedShiftMinutes = mins }
                                    .padding(horizontal = 8.dp, vertical = 6.dp)
                            ) {
                                Text(
                                    text = "$mins د",
                                    fontSize = 12.sp,
                                    color = if (selectedShiftMinutes == mins) Color.White else WaqtDarkBrown
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    if (previewShiftResult == null) {
                        Button(
                            onClick = {
                                previewShiftResult = SchedulingEngine.calculateEmergencyShift(
                                    currentDay = selectedDay,
                                    shiftMinutes = selectedShiftMinutes,
                                    allTasks = tasks,
                                    buffers = buffers,
                                    settings = settings
                                )
                            },
                            colors = ButtonDefaults.buttonColors(containerColor = WaqtGreen),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text("معاينة التعديلات المقترحة")
                        }
                    } else {
                        val res = previewShiftResult!!
                        Text(
                            text = res.explanation,
                            fontSize = 12.sp,
                            color = WaqtDarkBrown,
                            fontWeight = FontWeight.Medium
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = "عدد المهام المتأثرة: ${res.previewItems.size}",
                            fontSize = 12.sp,
                            color = WaqtGreen,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            },
            confirmButton = {
                if (previewShiftResult != null) {
                    Button(
                        onClick = {
                            onApplyShift(previewShiftResult!!)
                            showShiftDialog = false
                            previewShiftResult = null
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = WaqtGreen)
                    ) {
                        Text("تأكيد التطبيق")
                    }
                }
            },
            dismissButton = {
                TextButton(
                    onClick = {
                        showShiftDialog = false
                        previewShiftResult = null
                    }
                ) {
                    Text("إلغاء")
                }
            }
        )
    }
}

@Composable
private fun TaskItemRow(
    task: Task,
    onToggle: () -> Unit,
    onStartTimer: () -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = if (task.isCompleted) Color(0xFFF2FAF6) else Color.White
        ),
        shape = RoundedCornerShape(14.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(14.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                IconButton(onClick = onToggle) {
                    Icon(
                        imageVector = if (task.isCompleted) Icons.Rounded.CheckCircle else Icons.Rounded.CheckCircleOutline,
                        contentDescription = null,
                        tint = if (task.isCompleted) WaqtGreen else Color.Gray
                    )
                }
                Spacer(modifier = Modifier.width(8.dp))
                Column {
                    Text(
                        text = task.title,
                        fontSize = 15.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = WaqtDarkBrown
                    )
                    Spacer(modifier = Modifier.height(3.dp))
                    Text(
                        text = "${task.startTime} - ${task.endTime} (${task.durationMinutes} دقيقة)",
                        fontSize = 12.sp,
                        color = WaqtDarkBrown.copy(alpha = 0.6f)
                    )
                }
            }

            IconButton(
                onClick = onStartTimer,
                modifier = Modifier
                    .size(36.dp)
                    .clip(CircleShape)
                    .background(WaqtLightGreen)
            ) {
                Icon(
                    imageVector = Icons.Rounded.PlayArrow,
                    contentDescription = "بدء المؤقت",
                    tint = WaqtGreen,
                    modifier = Modifier.size(20.dp)
                )
            }
        }
    }
}
