package com.github.antalysedev.antalyseintellijextension.actions

import com.github.antalysedev.antalyseintellijextension.editor.DiffStreamService
import com.github.antalysedev.antalyseintellijextension.services.antalysePluginService
import com.intellij.openapi.actionSystem.AnAction
import com.intellij.openapi.actionSystem.AnActionEvent
import com.intellij.openapi.actionSystem.PlatformDataKeys
import com.intellij.openapi.components.ServiceManager
import com.intellij.openapi.components.service
import com.intellij.openapi.fileEditor.FileEditorManager
import com.intellij.openapi.project.Project
import com.intellij.openapi.ui.DialogWrapper
import com.intellij.openapi.ui.Messages
import com.intellij.openapi.wm.ToolWindowManager
import java.awt.Dimension
import javax.swing.*
import javax.swing.event.DocumentEvent
import javax.swing.event.DocumentListener
import com.intellij.ui.components.JBScrollPane
import java.awt.BorderLayout

fun getPluginService(project: Project?): antalysePluginService? {
    if (project == null) {
        return null
    }
    return ServiceManager.getService(
        project,
        antalysePluginService::class.java
    )
}

class AcceptDiffAction : AnAction() {
    override fun actionPerformed(e: AnActionEvent) {
        acceptHorizontalDiff(e)
        acceptVerticalDiff(e)
    }

    private fun acceptHorizontalDiff(e: AnActionEvent) {
        val antalysePluginService = getPluginService(e.project) ?: return
        antalysePluginService.ideProtocolClient?.diffManager?.acceptDiff(null)
    }

    private fun acceptVerticalDiff(e: AnActionEvent) {
        val project = e.project ?: return
        val editor =
            e.getData(PlatformDataKeys.EDITOR) ?: FileEditorManager.getInstance(project).selectedTextEditor ?: return
        val diffStreamService = project.service<DiffStreamService>()
        diffStreamService.accept(editor)
    }
}

class RejectDiffAction : AnAction() {
    override fun actionPerformed(e: AnActionEvent) {
        rejectHorizontalDiff(e)
        rejectVerticalDiff(e)
    }

    private fun rejectHorizontalDiff(e: AnActionEvent) {
        val antalysePluginService = getPluginService(e.project) ?: return
        antalysePluginService.ideProtocolClient?.diffManager?.rejectDiff(null)
    }

    private fun rejectVerticalDiff(e: AnActionEvent) {
        val project = e.project ?: return
        val editor =
            e.getData(PlatformDataKeys.EDITOR) ?: FileEditorManager.getInstance(project).selectedTextEditor ?: return
        val diffStreamService = project.service<DiffStreamService>()
        diffStreamService.reject(editor)
    }
}

fun getantalysePluginService(project: Project?): antalysePluginService? {
    if (project != null) {
        val toolWindowManager = ToolWindowManager.getInstance(project)
        val toolWindow = toolWindowManager.getToolWindow("antalyse")

        if (toolWindow != null) {
            if (!toolWindow.isVisible) {
                toolWindow.activate(null)
            }
        }
    }

    return getPluginService(project)
}

fun focusantalyseInput(project: Project?) {
    val antalysePluginService = getantalysePluginService(project) ?: return
    antalysePluginService.antalysePluginWindow?.content?.components?.get(0)?.requestFocus()
    antalysePluginService.sendToWebview("focusantalyseInputWithoutClear", null)

    antalysePluginService.ideProtocolClient?.sendHighlightedCode()
}

class FocusantalyseInputWithoutClearAction : AnAction() {
    override fun actionPerformed(e: AnActionEvent) {
        val project = e.project
        focusantalyseInput(project)
    }
}

class FocusantalyseInputAction : AnAction() {
    override fun actionPerformed(e: AnActionEvent) {
        val antalysePluginService = getantalysePluginService(e.project) ?: return

        antalysePluginService.antalysePluginWindow?.content?.components?.get(0)?.requestFocus()
        antalysePluginService.sendToWebview("focusantalyseInput", null)

        antalysePluginService.ideProtocolClient?.sendHighlightedCode()
    }
}

class NewantalyseSessionAction : AnAction() {
    override fun actionPerformed(e: AnActionEvent) {
        val antalysePluginService = getantalysePluginService(e.project) ?: return
        antalysePluginService.antalysePluginWindow?.content?.components?.get(0)?.requestFocus()
        antalysePluginService.sendToWebview("focusantalyseInputWithNewSession", null)
    }
}

class ViewHistoryAction : AnAction() {
    override fun actionPerformed(e: AnActionEvent) {
        val antalysePluginService = getantalysePluginService(e.project) ?: return
        antalysePluginService.sendToWebview("viewHistory", null)
    }
}