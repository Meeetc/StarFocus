package com.starfocus.modules

import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import android.content.Context
import com.facebook.react.bridge.*

class VibrationModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "VibrationModule"

    companion object {
        fun triggerWarning(context: Context) {
            try {
                val vibrator = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                    val vibratorManager = context.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as? VibratorManager
                    vibratorManager?.defaultVibrator
                } else {
                    @Suppress("DEPRECATION")
                    context.getSystemService(Context.VIBRATOR_SERVICE) as? Vibrator
                }
                
                if (vibrator?.hasVibrator() != true) return

                val pattern = longArrayOf(0, 100, 50, 200, 50, 400, 100, 600)
                val amplitudes = intArrayOf(0, 80, 0, 120, 0, 180, 0, 255)

                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    val effect = VibrationEffect.createWaveform(pattern, amplitudes, -1)
                    vibrator.vibrate(effect)
                } else {
                    @Suppress("DEPRECATION")
                    vibrator.vibrate(pattern, -1)
                }
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }

    private fun getVibrator(): Vibrator? {
        return try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                val vibratorManager = reactContext.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as? VibratorManager
                vibratorManager?.defaultVibrator
            } else {
                @Suppress("DEPRECATION")
                reactContext.getSystemService(Context.VIBRATOR_SERVICE) as? Vibrator
            }
        } catch (e: Exception) {
            null
        }
    }

    /**
     * Vibrate with a repeating waveform pattern.
     * Pattern: [wait, vibrate, wait, vibrate, ...]
     * Amplitudes: [0=off, 1-255 intensity]
     * Repeat: index to repeat from (-1 = no repeat)
     */
    @ReactMethod
    fun vibrateWaveform(patternArray: ReadableArray, amplitudeArray: ReadableArray, repeat: Int) {
        try {
            val vibrator = getVibrator() ?: return
            if (!vibrator.hasVibrator()) return

            val pattern = LongArray(patternArray.size()) { patternArray.getDouble(it).toLong() }

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                val amplitudes = IntArray(amplitudeArray.size()) { amplitudeArray.getInt(it) }
                val effect = VibrationEffect.createWaveform(pattern, amplitudes, repeat)
                vibrator.vibrate(effect)
            } else {
                @Suppress("DEPRECATION")
                vibrator.vibrate(pattern, repeat)
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    /**
     * Single pulse vibration with intensity.
     * Duration in ms, amplitude 1-255.
     */
    @ReactMethod
    fun vibratePulse(durationMs: Int, amplitude: Int) {
        val vibrator = getVibrator()
        if (vibrator?.hasVibrator() != true) return

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val effect = VibrationEffect.createOneShot(
                durationMs.toLong(),
                amplitude.coerceIn(1, 255)
            )
            vibrator.vibrate(effect)
        } else {
            @Suppress("DEPRECATION")
            vibrator.vibrate(durationMs.toLong())
        }
    }

    /**
     * Uncomfortable deterrent vibration — escalating buzz.
     * Used when the user opens flagged apps during a focus session.
     */
    @ReactMethod
    fun vibrateDeterrent() {
        val vibrator = getVibrator()
        if (vibrator?.hasVibrator() != true) return

        // Escalating discomfort: short-short-long pattern with increasing amplitude
        val pattern = longArrayOf(0, 100, 50, 200, 50, 400, 100, 600)
        val amplitudes = intArrayOf(0, 80, 0, 120, 0, 180, 0, 255)

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val effect = VibrationEffect.createWaveform(pattern, amplitudes, -1)
            vibrator.vibrate(effect)
        } else {
            @Suppress("DEPRECATION")
            vibrator.vibrate(pattern, -1)
        }
    }

    /**
     * Gentle completion haptic — success feedback.
     */
    @ReactMethod
    fun vibrateSuccess() {
        val vibrator = getVibrator()
        if (vibrator?.hasVibrator() != true) return

        val pattern = longArrayOf(0, 50, 50, 100)
        val amplitudes = intArrayOf(0, 100, 0, 60)

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val effect = VibrationEffect.createWaveform(pattern, amplitudes, -1)
            vibrator.vibrate(effect)
        } else {
            @Suppress("DEPRECATION")
            vibrator.vibrate(pattern, -1)
        }
    }

    /**
     * Stop any ongoing vibration.
     */
    @ReactMethod
    fun cancel() {
        getVibrator()?.cancel()
    }
}
