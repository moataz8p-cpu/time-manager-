package com.waqt.organizer.ui.navigation

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.DrawerState
import androidx.compose.material3.Icon
import androidx.compose.material3.ModalDrawerSheet
import androidx.compose.material3.ModalNavigationDrawer
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.LocalLayoutDirection
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.LayoutDirection
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.waqt.organizer.ui.theme.WaqtBeige
import com.waqt.organizer.ui.theme.WaqtDarkBrown
import com.waqt.organizer.ui.theme.WaqtGreen
import com.waqt.organizer.ui.theme.WaqtLightGreen
import com.waqt.organizer.ui.theme.WaqtOffWhite

@Composable
fun WaqtNavigationDrawer(
    drawerState: DrawerState,
    currentScreen: Screen,
    onNavigate: (Screen) -> Unit,
    content: @Composable () -> Unit
) {
    // RTL Layout for Arabic Application
    CompositionLocalProvider(LocalLayoutDirection provides LayoutDirection.Rtl) {
        ModalNavigationDrawer(
            drawerState = drawerState,
            drawerContent = {
                ModalDrawerSheet(
                    modifier = Modifier.width(300.dp),
                    drawerContainerColor = WaqtOffWhite
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .fillMaxHeight()
                            .padding(20.dp)
                    ) {
                        // Header
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 24.dp)
                        ) {
                            Column {
                                Text(
                                    text = "منظم الوقت",
                                    fontSize = 24.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = WaqtDarkBrown
                                )
                                Spacer(modifier = Modifier.height(4.dp))
                                Text(
                                    text = "تنظيم متزن للوقت والعبادة والعمل",
                                    fontSize = 13.sp,
                                    color = WaqtDarkBrown.copy(alpha = 0.7f)
                                )
                            }
                        }

                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(1.dp)
                                .background(WaqtBeige.copy(alpha = 0.5f))
                        )

                        Spacer(modifier = Modifier.height(16.dp))

                        // Exactly 5 Navigation Items
                        Screen.allScreens.forEach { screen ->
                            val isSelected = screen.route == currentScreen.route
                            val backgroundColor = if (isSelected) WaqtLightGreen else WaqtOffWhite
                            val contentColor = if (isSelected) WaqtGreen else WaqtDarkBrown

                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(vertical = 4.dp)
                                    .clip(RoundedCornerShape(12.dp))
                                    .background(backgroundColor)
                                    .clickable { onNavigate(screen) }
                                    .padding(horizontal = 16.dp, vertical = 14.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Icon(
                                    imageVector = screen.icon,
                                    contentDescription = screen.title,
                                    tint = contentColor,
                                    modifier = Modifier.size(24.dp)
                                )
                                Spacer(modifier = Modifier.width(16.dp))
                                Text(
                                    text = screen.title,
                                    fontSize = 15.sp,
                                    fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                                    color = contentColor
                                )
                            }
                        }
                    }
                }
            },
            content = content
        )
    }
}
