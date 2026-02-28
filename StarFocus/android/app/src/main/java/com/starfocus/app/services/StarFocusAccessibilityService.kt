package com.starfocus.app.services

import android.accessibilityservice.AccessibilityService
import android.accessibilityservice.AccessibilityServiceInfo
import android.content.Intent
import android.util.Log
import android.view.accessibility.AccessibilityEvent
import com.starfocus.app.modules.VibrationModule
import com.starfocus.app.modules.UsageStatsModule

class StarFocusAccessibilityService : AccessibilityService() {

    companion object {
        private const val TAG = "StarFocusA11y"
        
        // This should be dynamic based on JS state, but for the hackathon we can use a basic whitelist
        // or rely on a static flag set by the JS module when a sprint starts
        var isSprintActive = false
        val whitelistedPackages = setOf(
            "com.starfocus",
            "com.android.systemui",
            "com.google.android.inputmethod.latin", // Keyboard
            "com.android.calculator2",
            "com.google.android.calculator"
        )
    }

    override fun onServiceConnected() {
        super.onServiceConnected()
        Log.d(TAG, "Accessibility Service Connected")
        
        val info = AccessibilityServiceInfo()
        info.eventTypes = AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED
        info.feedbackType = AccessibilityServiceInfo.FEEDBACK_GENERIC
        info.flags = AccessibilityServiceInfo.FLAG_INCLUDE_NOT_IMPORTANT_VIEWS
        this.serviceInfo = info
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        if (!isSprintActive || event == null) return

        if (event.eventType == AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) {
            val packageName = event.packageName?.toString()
            
            if (packageName != null && !whitelistedPackages.contains(packageName)) {
                Log.d(TAG, "Distracting app opened: $packageName")
                
                // Increment switches
                UsageStatsModule.incrementAppSwitches()
                
                // Trigger Warning Vibration
                VibrationModule.triggerWarning(this)
            }
        }
    }

    override fun onInterrupt() {
        Log.d(TAG, "Accessibility Service Interrupted")
    }
}
