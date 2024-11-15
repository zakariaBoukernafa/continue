package com.github.antalysedev.antalyseintellijextension.toolWindow

import com.github.antalysedev.antalyseintellijextension.services.antalysePluginService
import com.intellij.openapi.actionSystem.ActionManager
import com.intellij.openapi.actionSystem.AnAction
import com.intellij.openapi.components.ServiceManager
import com.intellij.openapi.project.DumbAware
import com.intellij.openapi.project.Project
import com.intellij.openapi.wm.ToolWindow
import com.intellij.openapi.wm.ToolWindowFactory
import com.intellij.ui.content.ContentFactory
import javax.swing.*

const val JS_QUERY_POOL_SIZE = "200"

class antalysePluginToolWindowFactory : ToolWindowFactory, DumbAware {
  override fun createToolWindowContent(project: Project, toolWindow: ToolWindow) {
    val antalyseToolWindow = antalysePluginWindow(project)
    val content =
        ContentFactory.getInstance().createContent(antalyseToolWindow.content, null, false)
    toolWindow.contentManager.addContent(content)
    val titleActions = mutableListOf<AnAction>()
    createTitleActions(titleActions)

    // Add MaximizeToolWindow action
    val action = ActionManager.getInstance().getAction("MaximizeToolWindow")
    if (action != null) {
      titleActions.add(action)
    }

    toolWindow.setTitleActions(titleActions)
  }

  private fun createTitleActions(titleActions: MutableList<in AnAction>) {
    val action = ActionManager.getInstance().getAction("antalyseSidebarActionsGroup")
    if (action != null) {
      titleActions.add(action)
    }
  }

  override fun shouldBeAvailable(project: Project) = true

  class antalysePluginWindow(project: Project) {
    private val defaultGUIUrl = "http://antalyse/index.html"

    init {
      System.setProperty("ide.browser.jcef.jsQueryPoolSize", JS_QUERY_POOL_SIZE)
      System.setProperty("ide.browser.jcef.contextMenu.devTools.enabled", "true")
    }

    val browser: antalyseBrowser by lazy {
      val url = System.getenv("GUI_URL")?.toString() ?: defaultGUIUrl

      val browser = antalyseBrowser(project, url)
      val antalysePluginService =
          ServiceManager.getService(project, antalysePluginService::class.java)
      antalysePluginService.antalysePluginWindow = this
      browser
    }

    val content: JComponent
      get() = browser.browser.component
  }
}
