package com.starfocus.app.app.modules

import android.content.Context
import android.graphics.Color
import android.graphics.PixelFormat
import android.os.Build
import android.provider.Settings
import android.content.Intent
import android.view.Gravity
import android.view.WindowManager
import android.widget.LinearLayout
import android.widget.TextView
import com.facebook.react.bridge.*

class OverlayModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "OverlayModule"

    private var overlayView: LinearLayout? = null
    private var windowManager: WindowManager? = null

    /**
     * Check if SYSTEM_ALERT_WINDOW permission is granted.
     */
    @ReactMethod
    fun hasPermission(promise: Promise) {
        promise.resolve(Settings.canDrawOverlays(reactContext))
    }

    /**
     * Open settings to request overlay permission.
     */
    @ReactMethod
    fun requestPermission() {
        try {
            val intent = Intent(
                Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                android.net.Uri.parse("package:${reactContext.packageName}")
            )
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            reactContext.startActivity(intent)
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    /**
     * Show a full-screen deterrent overlay.
     * @param message Message to display
     * @param level Intervention level: "breathing" | "greyscale" | "vibration"
     */
    @ReactMethod
    fun showOverlay(message: String, level: String) {
        if (!Settings.canDrawOverlays(reactContext)) return

        // Remove existing overlay first
        hideOverlay()

        if (!reactContext.hasActiveCatalystInstance()) return
        val activity = reactContext.currentActivity ?: return

        activity.runOnUiThread {
            if (!reactContext.hasActiveCatalystInstance()) return@runOnUiThread
            try {
                windowManager = reactContext.getSystemService(Context.WINDOW_SERVICE) as? WindowManager
                if (windowManager == null) return@runOnUiThread

                val params = WindowManager.LayoutParams(
                    WindowManager.LayoutParams.MATCH_PARENT,
                    WindowManager.LayoutParams.MATCH_PARENT,
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O)
                        WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
                    else
                        @Suppress("DEPRECATION")
                        WindowManager.LayoutParams.TYPE_PHONE,
                    WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or
                        WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL or
                        WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN,
                    PixelFormat.TRANSLUCENT
                )
                params.gravity = Gravity.CENTER

                // Background color based on intervention level
                val bgColor = when (level) {
                    "breathing" -> Color.argb(200, 10, 14, 26)   // Semi-transparent dark
                    "greyscale" -> Color.argb(230, 30, 30, 30)   // Heavy grey
                    "vibration" -> Color.argb(240, 50, 10, 10)   // Dark red — urgent
                    else -> Color.argb(200, 10, 14, 26)
                }

                val emoji = when (level) {
                    "breathing" -> "🧘"
                    "greyscale" -> "🛡️"
                    "vibration" -> "⚠️"
                    else -> "🧘"
                }

                overlayView = LinearLayout(reactContext).apply {
                    orientation = LinearLayout.VERTICAL
                    gravity = Gravity.CENTER
                    setBackgroundColor(bgColor)
                    setPadding(80, 80, 80, 80)

                    // Emoji
                    addView(TextView(reactContext).apply {
                        text = emoji
                        textSize = 64f
                        gravity = Gravity.CENTER
                    })

                    // Title
                    addView(TextView(reactContext).apply {
                        text = when (level) {
                            "breathing" -> "Time to Breathe"
                            "greyscale" -> "Shield Activated"
                            "vibration" -> "Focus Warning!"
                            else -> "Pause"
                        }
                        textSize = 28f
                        setTextColor(Color.WHITE)
                        gravity = Gravity.CENTER
                        setPadding(0, 24, 0, 16)
                    })

                    // Message
                    addView(TextView(reactContext).apply {
                        text = message
                        textSize = 16f
                        setTextColor(Color.argb(200, 255, 255, 255))
                        gravity = Gravity.CENTER
                        setPadding(0, 0, 0, 32)
                    })

                    // Dismiss instruction
                    addView(TextView(reactContext).apply {
                        text = "Tap anywhere to dismiss"
                        textSize = 12f
                        setTextColor(Color.argb(120, 255, 255, 255))
                        gravity = Gravity.CENTER
                    })

                    setOnClickListener {
                        hideOverlay()
                    }
                }

                overlayView?.let {
                    windowManager?.addView(it, params)
                }
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }

    /**
     * Hide the deterrent overlay.
     */
    @ReactMethod
    fun hideOverlay() {
        if (!reactContext.hasActiveCatalystInstance()) return
        val activity = reactContext.currentActivity ?: return
        activity.runOnUiThread {
            if (!reactContext.hasActiveCatalystInstance()) return@runOnUiThread
            try {
                overlayView?.let {
                    windowManager?.removeView(it)
                    overlayView = null
                }
            } catch (e: Exception) {
                // View may have already been removed
            }
        }
    }

    /**
     * Check if an overlay is currently visible.
     */
    @ReactMethod
    fun isVisible(promise: Promise) {
        promise.resolve(overlayView != null)
    }
}
