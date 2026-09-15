package com.waqt.organizer.ui.screens.prayer

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
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.Menu
import androidx.compose.material.icons.rounded.Mosque
import androidx.compose.material.icons.rounded.Restore
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Tab
import androidx.compose.material3.TabRow
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateMapOf
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
import com.waqt.organizer.data.IslamicData
import com.waqt.organizer.data.model.AppSettings
import com.waqt.organizer.ui.theme.WaqtBeige
import com.waqt.organizer.ui.theme.WaqtDarkBrown
import com.waqt.organizer.ui.theme.WaqtGreen
import com.waqt.organizer.ui.theme.WaqtLightGreen
import com.waqt.organizer.ui.theme.WaqtOffWhite

@Composable
fun PrayerScreen(
    settings: AppSettings,
    onOpenDrawer: () -> Unit
) {
    var selectedSection by remember { mutableIntStateOf(0) } // 0: Prayer, 1: Adhkar, 2: Quran, 3: Hadith

    // State for interactive Adhkar counters
    val adhkarCounters = remember {
        mutableStateMapOf<String, Int>().apply {
            IslamicData.morningAdhkar.forEach { this[it.id] = 0 }
            IslamicData.eveningAdhkar.forEach { this[it.id] = 0 }
        }
    }

    val defaultPrayers = listOf(
        Pair("الفجر", settings.manualPrayerOverrides["الفجر"] ?: "04:45"),
        Pair("الشروق", settings.manualPrayerOverrides["الشروق"] ?: "06:12"),
        Pair("الظهر", settings.manualPrayerOverrides["الظهر"] ?: "12:02"),
        Pair("العصر", settings.manualPrayerOverrides["العصر"] ?: "15:28"),
        Pair("المغرب", settings.manualPrayerOverrides["المغرب"] ?: "18:04"),
        Pair("العشاء", settings.manualPrayerOverrides["العشاء"] ?: "19:24")
    )

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
                text = "مواقيت الصلاة والأذكار",
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
                Icon(Icons.Rounded.Mosque, contentDescription = null, tint = WaqtGreen, modifier = Modifier.size(22.dp))
            }
        }

        Spacer(modifier = Modifier.height(14.dp))

        // Tabs
        val sections = listOf("مواقيت الصلاة", "الأذكار", "القرآن", "صحيح البخاري")
        TabRow(
            selectedTabIndex = selectedSection,
            containerColor = Color.White,
            contentColor = WaqtGreen,
            modifier = Modifier.clip(RoundedCornerShape(12.dp))
        ) {
            sections.forEachIndexed { index, title ->
                Tab(
                    selected = selectedSection == index,
                    onClick = { selectedSection = index },
                    text = {
                        Text(
                            text = title,
                            fontSize = 12.sp,
                            fontWeight = if (selectedSection == index) FontWeight.Bold else FontWeight.Normal
                        )
                    }
                )
            }
        }

        Spacer(modifier = Modifier.height(14.dp))

        when (selectedSection) {
            0 -> {
                // Prayer Times Section
                LazyColumn(
                    modifier = Modifier.fillMaxSize(),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    item {
                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            colors = CardDefaults.cardColors(containerColor = Color.White),
                            shape = RoundedCornerShape(16.dp)
                        ) {
                            Column(
                                modifier = Modifier.padding(16.dp),
                                horizontalAlignment = Alignment.CenterHorizontally
                            ) {
                                Text(
                                    text = "المدينة الحالية: ${settings.city}",
                                    fontSize = 13.sp,
                                    color = WaqtDarkBrown.copy(alpha = 0.7f)
                                )
                                Spacer(modifier = Modifier.height(8.dp))
                                Text(
                                    text = "الصلاة القادمة: الظهر",
                                    fontSize = 17.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = WaqtGreen
                                )
                                Spacer(modifier = Modifier.height(4.dp))
                                Text(
                                    text = "متبقي حوالي ساعتين و 15 دقيقة",
                                    fontSize = 13.sp,
                                    color = WaqtDarkBrown
                                )
                            }
                        }
                    }

                    items(defaultPrayers) { (name, time) ->
                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            colors = CardDefaults.cardColors(containerColor = Color.White),
                            shape = RoundedCornerShape(12.dp)
                        ) {
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(14.dp),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(
                                    text = name,
                                    fontSize = 15.sp,
                                    fontWeight = FontWeight.SemiBold,
                                    color = WaqtDarkBrown
                                )
                                Text(
                                    text = time,
                                    fontSize = 16.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = WaqtGreen
                                )
                            }
                        }
                    }
                }
            }
            1 -> {
                // Adhkar Section with interactive counter
                LazyColumn(
                    modifier = Modifier.fillMaxSize(),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    item {
                        Text(
                            text = "أذكار الصباح والمساء (حصن المسلم)",
                            fontSize = 15.sp,
                            fontWeight = FontWeight.Bold,
                            color = WaqtDarkBrown,
                            modifier = Modifier.padding(vertical = 4.dp)
                        )
                    }

                    items(IslamicData.morningAdhkar + IslamicData.eveningAdhkar) { item ->
                        val count = adhkarCounters[item.id] ?: 0
                        val isDone = count >= item.targetCount

                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            colors = CardDefaults.cardColors(
                                containerColor = if (isDone) Color(0xFFF2FAF6) else Color.White
                            ),
                            shape = RoundedCornerShape(14.dp)
                        ) {
                            Column(modifier = Modifier.padding(14.dp)) {
                                Text(
                                    text = item.text,
                                    fontSize = 14.sp,
                                    lineHeight = 22.sp,
                                    color = WaqtDarkBrown,
                                    fontWeight = FontWeight.Medium
                                )
                                if (item.virtue != null) {
                                    Spacer(modifier = Modifier.height(6.dp))
                                    Text(
                                        text = item.virtue,
                                        fontSize = 11.sp,
                                        color = WaqtGreen
                                    )
                                }
                                Spacer(modifier = Modifier.height(10.dp))
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text(
                                        text = "التكرار: $count / ${item.targetCount}",
                                        fontSize = 12.sp,
                                        color = WaqtDarkBrown.copy(alpha = 0.7f)
                                    )

                                    Row {
                                        IconButton(
                                            onClick = { adhkarCounters[item.id] = 0 }
                                        ) {
                                            Icon(Icons.Rounded.Restore, contentDescription = "تصفير", tint = Color.Gray)
                                        }

                                        Button(
                                            onClick = {
                                                if (count < item.targetCount) {
                                                    adhkarCounters[item.id] = count + 1
                                                }
                                            },
                                            colors = ButtonDefaults.buttonColors(
                                                containerColor = if (isDone) Color.Gray else WaqtGreen
                                            ),
                                            shape = RoundedCornerShape(10.dp)
                                        ) {
                                            Text(if (isDone) "اكتمل ✓" else "سبّح")
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            2 -> {
                // Quran Section
                LazyColumn(
                    modifier = Modifier.fillMaxSize(),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    item {
                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            colors = CardDefaults.cardColors(containerColor = Color.White),
                            shape = RoundedCornerShape(16.dp)
                        ) {
                            Column(
                                modifier = Modifier.padding(18.dp),
                                horizontalAlignment = Alignment.CenterHorizontally
                            ) {
                                Text(
                                    text = "سُورَةُ الْفَاتِحَةِ",
                                    fontSize = 18.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = WaqtDarkBrown
                                )
                                Spacer(modifier = Modifier.height(12.dp))
                                IslamicData.alFatihaVerses.forEach { v ->
                                    Text(
                                        text = v,
                                        fontSize = 15.sp,
                                        lineHeight = 26.sp,
                                        color = WaqtDarkBrown,
                                        textAlign = TextAlign.Center,
                                        modifier = Modifier.padding(vertical = 4.dp)
                                    )
                                }
                            }
                        }
                    }
                }
            }
            3 -> {
                // Sahih Al-Bukhari Section
                LazyColumn(
                    modifier = Modifier.fillMaxSize(),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    items(IslamicData.sahihBukhariHadiths) { hadith ->
                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            colors = CardDefaults.cardColors(containerColor = Color.White),
                            shape = RoundedCornerShape(14.dp)
                        ) {
                            Column(modifier = Modifier.padding(14.dp)) {
                                Text(
                                    text = hadith.topic,
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = WaqtGreen
                                )
                                Spacer(modifier = Modifier.height(6.dp))
                                Text(
                                    text = "«${hadith.matn}»",
                                    fontSize = 14.sp,
                                    lineHeight = 22.sp,
                                    fontWeight = FontWeight.Medium,
                                    color = WaqtDarkBrown
                                )
                                Spacer(modifier = Modifier.height(6.dp))
                                Text(
                                    text = "${hadith.narrator} — ${hadith.reference}",
                                    fontSize = 11.sp,
                                    color = WaqtDarkBrown.copy(alpha = 0.6f)
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}
