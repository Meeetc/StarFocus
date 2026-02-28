package com.starfocus.modules

import android.app.AppOpsManager
import android.app.usage.UsageStatsManager
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.Process
import android.provider.Settings
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule

class UsageStatsModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "UsageStatsModule"

    /**
     * Check if the PACKAGE_USAGE_STATS permission is granted.
     */
    @ReactMethod
    fun hasPermission(promise: Promise) {
        try {
            val appOps = reactContext.getSystemService(Context.APP_OPS_SERVICE) as? AppOpsManager
            if (appOps == null) {
                promise.resolve(false)
                return
            }
            val mode = appOps.checkOpNoThrow(
                AppOpsManager.OPSTR_GET_USAGE_STATS,
                Process.myUid(),
                reactContext.packageName
            )
            promise.resolve(mode == AppOpsManager.MODE_ALLOWED)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    /**
     * Open the system settings for granting usage access permission.
     */
    @ReactMethod
    fun requestPermission() {
        val intent = Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS)
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        reactContext.startActivity(intent)
    }

    /**
     * Get usage stats for the specified time interval.
     * @param intervalMs Time interval in milliseconds (e.g., 24 * 60 * 60 * 1000 for 24 hours)
     */
    @ReactMethod
    fun getUsageStats(intervalMs: Double, promise: Promise) {
        try {
            val usageStatsManager =
                reactContext.getSystemService(Context.USAGE_STATS_SERVICE) as? UsageStatsManager
            
            if (usageStatsManager == null) {
                promise.reject("ERROR", "UsageStatsManager not available")
                return
            }

            val endTime = System.currentTimeMillis()
            val startTime = endTime - intervalMs.toLong()

            val stats = usageStatsManager.queryUsageStats(
                UsageStatsManager.INTERVAL_DAILY,
                startTime,
                endTime
            )

            val result = Arguments.createArray()
            stats?.filter { it.totalTimeInForeground > 0 }
                ?.sortedByDescending { it.totalTimeInForeground }
                ?.forEach { stat ->
                    val item = Arguments.createMap().apply {
                        putString("packageName", stat.packageName)
                        putDouble("totalTimeMs", stat.totalTimeInForeground.toDouble())
                        putDouble(
                            "totalTimeMinutes",
                            stat.totalTimeInForeground.toDouble() / 60000
                        )
                        putDouble("lastTimeUsed", stat.lastTimeUsed.toDouble())
                    }
                    result.pushMap(item)
                }

            promise.resolve(result)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    /**
     * Get the currently foreground app package name.
     */
    @ReactMethod
    fun getForegroundApp(promise: Promise) {
        try {
            val usageStatsManager =
                reactContext.getSystemService(Context.USAGE_STATS_SERVICE) as? UsageStatsManager

            if (usageStatsManager == null) {
                promise.reject("ERROR", "UsageStatsManager not available")
                return
            }

            val endTime = System.currentTimeMillis()
            val startTime = endTime - 10000 // Last 10 seconds

            val stats = usageStatsManager.queryUsageStats(
                UsageStatsManager.INTERVAL_DAILY,
                startTime,
                endTime
            )

            val foreground = stats?.maxByOrNull { it.lastTimeUsed }

            val result = Arguments.createMap().apply {
                putString("packageName", foreground?.packageName ?: "unknown")
                putDouble("lastTimeUsed", foreground?.lastTimeUsed?.toDouble() ?: 0.0)
            }
            promise.resolve(result)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    /**
     * Get total screen time for today in minutes.
     */
    @ReactMethod
    fun getTodayScreenTime(promise: Promise) {
        try {
            val usageStatsManager =
                reactContext.getSystemService(Context.USAGE_STATS_SERVICE) as? UsageStatsManager

            if (usageStatsManager == null) {
                promise.resolve(0.0)
                return
            }

            val calendar = java.util.Calendar.getInstance()
            calendar.set(java.util.Calendar.HOUR_OF_DAY, 0)
            calendar.set(java.util.Calendar.MINUTE, 0)
            calendar.set(java.util.Calendar.SECOND, 0)
            val startTime = calendar.timeInMillis
            val endTime = System.currentTimeMillis()

            val stats = usageStatsManager.queryUsageStats(
                UsageStatsManager.INTERVAL_DAILY,
                startTime,
                endTime
            )

            val totalMs = stats?.sumOf { it.totalTimeInForeground } ?: 0L
            val totalMinutes = totalMs.toDouble() / 60000

            promise.resolve(totalMinutes)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }
}
