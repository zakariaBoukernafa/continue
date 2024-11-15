package com.github.antalysedev.antalyseintellijextension.utils

import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

class Debouncer(
    private val interval: Long,
    private val coroutineScope: CoroutineScope
) {
    private var debounceJob: Job? = null
    
    fun debounce(action: suspend () -> Unit) {
        debounceJob?.cancel()
        debounceJob = coroutineScope.launch {
            delay(interval)
            action()
        }
    }
}