package com.github.antalysedev.antalyseintellijextension.services

import com.github.antalysedev.antalyseintellijextension.`antalyse`.CoreMessenger
import com.github.antalysedev.antalyseintellijextension.`antalyse`.CoreMessengerManager
import com.github.antalysedev.antalyseintellijextension.`antalyse`.IdeProtocolClient
import com.github.antalysedev.antalyseintellijextension.`antalyse`.uuid
import com.github.antalysedev.antalyseintellijextension.toolWindow.antalyseBrowser
import com.github.antalysedev.antalyseintellijextension.toolWindow.antalysePluginToolWindowFactory
import com.google.gson.Gson
import com.intellij.openapi.Disposable
import com.intellij.openapi.components.Service
import com.intellij.openapi.project.DumbAware
import com.intellij.openapi.project.Project
import com.intellij.ui.jcef.executeJavaScriptAsync
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.cancel
import kotlinx.coroutines.launch
import java.util.UUID

@Service(Service.Level.PROJECT)
class antalysePluginService(project: Project) : Disposable, DumbAware {
    val coroutineScope = CoroutineScope(Dispatchers.Main)
    var antalysePluginWindow: antalysePluginToolWindowFactory.antalysePluginWindow? = null

    var ideProtocolClient: IdeProtocolClient? = null

    var coreMessengerManager: CoreMessengerManager? = null
    val coreMessenger: CoreMessenger?
        get() = coreMessengerManager?.coreMessenger

    var workspacePaths: Array<String>? = null
    var windowId: String = UUID.randomUUID().toString()

    override fun dispose() {
        coroutineScope.cancel()
    }

    fun sendToWebview(
        messageType: String,
        data: Any?,
        messageId: String = uuid()
    ) {
        antalysePluginWindow?.browser?.sendToWebview(messageType, data, messageId)
    }
}