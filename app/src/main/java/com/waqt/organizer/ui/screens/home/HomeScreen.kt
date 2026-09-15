package com.waqt.organizer.ui.screens.home

import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
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
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.Menu
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.waqt.organizer.data.IslamicData
import com.waqt.organizer.ui.theme.WaqtBeige
import com.waqt.organizer.ui.theme.WaqtDarkBrown
import com.waqt.organizer.ui.theme.WaqtGreen
import com.waqt.organizer.ui.theme.WaqtOffWhite
import kotlinx.coroutines.delay
import java.time.LocalTime
import java.time.format.DateTimeFormatter

@Composable
fun HomeScreen(
    onOpenDrawer: () -> Unit,
    onNavigateToSchedule: () -> Unit
) {
    // Real Device Live Clock using actual Android time
    var currentTime by remember { mutableStateOf(LocalTime.now()) }

    LaunchedEffect(Unit) {
        while (true) {
            currentTime = LocalTime.now()
            delay(1000L)
        }
    }

    val hours = String.format("%02d", currentTime.hour)
    val minutes = String.format("%02d", currentTime.minute)
    val seconds = String.format("%02d", currentTime.second)

    // Subtle breathing animation for the main button
    val infiniteTransition = rememberInfiniteTransition(label = "btn_pulse")
    val pulseScale by infiniteTransition.animateFloat(
        initialValue = 1.0f,
        targetValue = 1.03f,
        animationSpec = infiniteRepeatable(
            animation = tween(1200, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "pulse_scale"
    )

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(WaqtOffWhite)
            .verticalScroll(rememberScrollState())
            .padding(horizontal = 20.dp, vertical = 16.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        // Top App Bar with Hamburger Menu
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
                Icon(
                    imageVector = Icons.Rounded.Menu,
                    contentDescription = "القائمة الجانبية",
                    tint = WaqtDarkBrown
                )
            }

            Text(
                text = "منظم الوقت",
                fontSize = 18.sp,
                fontWeight = FontWeight.SemiBold,
                color = WaqtDarkBrown
            )

            // Empty spacer for visual symmetry
            Spacer(modifier = Modifier.size(44.dp))
        }

        Spacer(modifier = Modifier.height(24.dp))

        // Bismillah Banner
        Text(
            text = "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
            fontSize = 30.sp,
            fontWeight = FontWeight.Bold,
            color = WaqtDarkBrown,
            textAlign = TextAlign.Center
        )

        Spacer(modifier = Modifier.height(10.dp))

        // Short Authentic Duaa
        Text(
            text = "«اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا، وَرِزْقًا طَيِّبًا، وَعَمَلاً مُتَقَبَّلاً»",
            fontSize = 14.sp,
            color = WaqtGreen,
            fontWeight = FontWeight.Medium,
            textAlign = TextAlign.Center,
            modifier = Modifier.padding(horizontal = 16.dp)
        )

        Spacer(modifier = Modifier.height(18.dp))

        // Typewriter Text Animation: "نظم وقتك مع معتز"
        TypewriterText(
            text = "نظم وقتك مع معتز"
        )

        Spacer(modifier = Modifier.height(20.dp))

        // Real Live Clock Card
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(24.dp))
                .background(
                    Brush.verticalGradient(
                        colors = listOf(Color.White, WaqtOffWhite)
                    )
                )
                .border(1.dp, WaqtBeige.copy(alpha = 0.6f), RoundedCornerShape(24.dp))
                .padding(vertical = 24.dp, horizontal = 16.dp),
            contentAlignment = Alignment.Center
        ) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Text(
                    text = "الوقت الفعلي الحالي",
                    fontSize = 13.sp,
                    color = WaqtDarkBrown.copy(alpha = 0.6f)
                )

                Spacer(modifier = Modifier.height(12.dp))

                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.Center
                ) {
                    ClockDigitBox(value = hours, label = "ساعة")
                    Text(
                        text = ":",
                        fontSize = 32.sp,
                        fontWeight = FontWeight.Bold,
                        color = WaqtGreen,
                        modifier = Modifier.padding(horizontal = 6.dp)
                    )
                    ClockDigitBox(value = minutes, label = "دقيقة")
                    Text(
                        text = ":",
                        fontSize = 32.sp,
                        fontWeight = FontWeight.Bold,
                        color = WaqtGreen,
                        modifier = Modifier.padding(horizontal = 6.dp)
                    )
                    ClockDigitBox(value = seconds, label = "ثانية")
                }
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        // Main Action Button: "يلا ننظم وقتنا"
        Button(
            onClick = onNavigateToSchedule,
            modifier = Modifier
                .fillMaxWidth()
                .height(60.dp)
                .scale(pulseScale)
                .shadow(8.dp, RoundedCornerShape(18.dp), spotColor = WaqtGreen.copy(alpha = 0.3f)),
            colors = ButtonDefaults.buttonColors(
                containerColor = WaqtGreen,
                contentColor = Color.White
            ),
            shape = RoundedCornerShape(18.dp)
        ) {
            Text(
                text = "يلا ننظم وقتنا",
                fontSize = 20.sp,
                fontWeight = FontWeight.Bold
            )
        }

        Spacer(modifier = Modifier.height(28.dp))

        // Al-Fatiha Card
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(20.dp))
                .background(Color.White)
                .border(1.dp, WaqtBeige.copy(alpha = 0.4f), RoundedCornerShape(20.dp))
                .padding(20.dp)
        ) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Text(
                    text = "سُورَةُ الْفَاتِحَةِ",
                    fontSize = 17.sp,
                    fontWeight = FontWeight.Bold,
                    color = WaqtDarkBrown
                )
                Spacer(modifier = Modifier.height(12.dp))

                IslamicData.alFatihaVerses.forEach { verse ->
                    Text(
                        text = verse,
                        fontSize = 15.sp,
                        color = WaqtDarkBrown.copy(alpha = 0.85f),
                        textAlign = TextAlign.Center,
                        lineHeight = 26.sp,
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 3.dp)
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(30.dp))
    }
}

@Composable
private fun ClockDigitBox(value: String, label: String) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Box(
            modifier = Modifier
                .size(68.dp, 60.dp)
                .clip(RoundedCornerShape(14.dp))
                .background(WaqtOffWhite)
                .border(1.dp, WaqtBeige.copy(alpha = 0.8f), RoundedCornerShape(14.dp)),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = value,
                fontSize = 28.sp,
                fontWeight = FontWeight.Bold,
                color = WaqtDarkBrown
            )
        }
        Spacer(modifier = Modifier.height(4.dp))
        Text(
            text = label,
            fontSize = 11.sp,
            color = WaqtDarkBrown.copy(alpha = 0.6f)
        )
    }
}

/**
 * Typewriter text animation for Arabic text:
 * Types out characters one by one with a smooth cadence.
 * Once completed, the text remains permanently visible without disruptive looping.
 */
@Composable
private fun TypewriterText(
    text: String,
    modifier: Modifier = Modifier
) {
    var displayedText by remember { mutableStateOf("") }

    LaunchedEffect(text) {
        displayedText = ""
        for (i in 1..text.length) {
            displayedText = text.substring(0, i)
            delay(90L)
        }
    }

    Box(
        modifier = modifier
            .clip(RoundedCornerShape(16.dp))
            .background(Color.White)
            .border(1.dp, WaqtBeige.copy(alpha = 0.7f), RoundedCornerShape(16.dp))
            .padding(horizontal = 20.dp, vertical = 10.dp),
        contentAlignment = Alignment.Center
    ) {
        // Invisible baseline text to retain exact size and eliminate layout shifts
        Text(
            text = text,
            fontSize = 18.sp,
            fontWeight = FontWeight.Bold,
            color = Color.Transparent,
            textAlign = TextAlign.Center
        )

        // Animated visible typing text
        Text(
            text = displayedText,
            fontSize = 18.sp,
            fontWeight = FontWeight.Bold,
            color = WaqtDarkBrown,
            textAlign = TextAlign.Center
        )
    }
}
