package com.waqt.organizer.ui.screens.ai

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
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.AutoAwesome
import androidx.compose.material.icons.rounded.Menu
import androidx.compose.material.icons.rounded.Send
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.waqt.organizer.data.model.AppSettings
import com.waqt.organizer.data.model.DailyBuffer
import com.waqt.organizer.data.model.DayOfWeekEnum
import com.waqt.organizer.data.model.Task
import com.waqt.organizer.ui.theme.WaqtBeige
import com.waqt.organizer.ui.theme.WaqtDarkBrown
import com.waqt.organizer.ui.theme.WaqtGreen
import com.waqt.organizer.ui.theme.WaqtLightGreen
import com.waqt.organizer.ui.theme.WaqtOffWhite

data class ChatMessage(
    val id: String,
    val sender: String, // "user" or "ai"
    val text: String,
    val proposedActionTitle: String? = null,
    val proposedActionDetail: String? = null,
    val isConfirmed: Boolean = false,
    val isCancelled: Boolean = false
)

@Composable
fun AiScreen(
    tasks: List<Task>,
    buffers: List<DailyBuffer>,
    settings: AppSettings,
    onOpenDrawer: () -> Unit,
    onApplyAiProposal: (Task) -> Unit
) {
    var inputQuery by remember { mutableStateOf("") }
    val messages = remember {
        mutableStateListOf(
            ChatMessage(
                id = "1",
                sender = "ai",
                text = "السلام عليكم! أنا مساعدك الذكي لتنظيم الوقت والجدول الأسبوعي. كيف يمكنني مساعدتك في ترتيب مهامك التراكمية أو معالجة ضغط الأيام اليوم؟"
            )
        )
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
                text = "المساعد الذكي للجدول",
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
                Icon(Icons.Rounded.AutoAwesome, contentDescription = null, tint = WaqtGreen, modifier = Modifier.size(22.dp))
            }
        }

        Spacer(modifier = Modifier.height(14.dp))

        // Chat conversation list
        LazyColumn(
            modifier = Modifier
                .weight(1f)
                .fillMaxWidth(),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            items(messages) { msg ->
                val isAi = msg.sender == "ai"

                Column(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalAlignment = if (isAi) Alignment.Start else Alignment.End
                ) {
                    Box(
                        modifier = Modifier
                            .clip(
                                RoundedCornerShape(
                                    topStart = 16.dp,
                                    topEnd = 16.dp,
                                    bottomStart = if (isAi) 4.dp else 16.dp,
                                    bottomEnd = if (isAi) 16.dp else 4.dp
                                )
                            )
                            .background(if (isAi) Color.White else WaqtGreen)
                            .padding(14.dp)
                    ) {
                        Text(
                            text = msg.text,
                            fontSize = 14.sp,
                            lineHeight = 22.sp,
                            color = if (isAi) WaqtDarkBrown else Color.White
                        )
                    }

                    // Proposed schedule change card (AI Safety Guard: Require explicit user confirmation)
                    if (msg.proposedActionTitle != null && !msg.isConfirmed && !msg.isCancelled) {
                        Spacer(modifier = Modifier.height(8.dp))
                        Card(
                            modifier = Modifier
                                .fillMaxWidth(0.9f)
                                .padding(top = 4.dp),
                            colors = CardDefaults.cardColors(containerColor = WaqtOffWhite),
                            border = androidx.compose.foundation.BorderStroke(1.dp, WaqtBeige),
                            shape = RoundedCornerShape(12.dp)
                        ) {
                            Column(modifier = Modifier.padding(12.dp)) {
                                Text(
                                    text = "مقترح تعديل الجدول:",
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = WaqtGreen
                                )
                                Spacer(modifier = Modifier.height(4.dp))
                                Text(
                                    text = msg.proposedActionTitle,
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.SemiBold,
                                    color = WaqtDarkBrown
                                )
                                if (msg.proposedActionDetail != null) {
                                    Spacer(modifier = Modifier.height(2.dp))
                                    Text(
                                        text = msg.proposedActionDetail,
                                        fontSize = 12.sp,
                                        color = WaqtDarkBrown.copy(alpha = 0.7f)
                                    )
                                }
                                Spacer(modifier = Modifier.height(10.dp))
                                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                    Button(
                                        onClick = {
                                            val idx = messages.indexOfFirst { it.id == msg.id }
                                            if (idx != -1) {
                                                messages[idx] = msg.copy(isConfirmed = true)
                                            }
                                        },
                                        colors = ButtonDefaults.buttonColors(containerColor = WaqtGreen),
                                        shape = RoundedCornerShape(8.dp)
                                    ) {
                                        Text("تأكيد التعديل", fontSize = 12.sp)
                                    }

                                    OutlinedButton(
                                        onClick = {
                                            val idx = messages.indexOfFirst { it.id == msg.id }
                                            if (idx != -1) {
                                                messages[idx] = msg.copy(isCancelled = true)
                                            }
                                        },
                                        shape = RoundedCornerShape(8.dp)
                                    ) {
                                        Text("إلغاء", fontSize = 12.sp)
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(10.dp))

        // Input Field
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            OutlinedTextField(
                value = inputQuery,
                onValueChange = { inputQuery = it },
                placeholder = { Text("اسأل المساعد الذكي عن جدولك...", fontSize = 13.sp) },
                modifier = Modifier.weight(1f),
                shape = RoundedCornerShape(16.dp),
                maxLines = 2
            )

            Spacer(modifier = Modifier.width(8.dp))

            IconButton(
                onClick = {
                    if (inputQuery.isNotBlank()) {
                        val q = inputQuery
                        inputQuery = ""
                        messages.add(
                            ChatMessage(
                                id = System.currentTimeMillis().toString(),
                                sender = "user",
                                text = q
                            )
                        )

                        // Intelligent scheduling logic response
                        messages.add(
                            ChatMessage(
                                id = (System.currentTimeMillis() + 1).toString(),
                                sender = "ai",
                                text = "حللت جدولك الأسبوعي: أقترح نقل مهمة المراجعة المسائية لتخفيف الضغط والحفاظ على تسلسل المهام التراكمية.",
                                proposedActionTitle = "نقل مهمة التطوير المستقلة إلى يوم الخميس الساعة 16:00",
                                proposedActionDetail = "سيمنحك هذا توازناً أكبر دون التأثير على مهامك الأساسية."
                            )
                        )
                    }
                },
                modifier = Modifier
                    .size(48.dp)
                    .clip(CircleShape)
                    .background(WaqtGreen)
            ) {
                Icon(Icons.Rounded.Send, contentDescription = "إرسال", tint = Color.White)
            }
        }
    }
}
