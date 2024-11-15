package com.github.antalysedev.antalyseintellijextension.autocomplete

import com.github.antalysedev.antalyseintellijextension.services.antalyseExtensionSettings
import com.intellij.openapi.actionSystem.ActionUpdateThread
import com.intellij.openapi.actionSystem.AnActionEvent
import com.intellij.openapi.actionSystem.DefaultActionGroup
import com.intellij.openapi.components.service

class AutocompleteActionGroup : DefaultActionGroup() {
    override fun getActionUpdateThread(): ActionUpdateThread {
        return ActionUpdateThread.EDT
    }

    override fun update(e: AnActionEvent) {
        super.update(e)
        removeAll()

        val antalyseSettingsService = service<antalyseExtensionSettings>()
        if (antalyseSettingsService.antalyseState.enableTabAutocomplete) {
            addAll(
                DisableTabAutocompleteAction(),
            )
        } else {
            addAll(
                EnableTabAutocompleteAction(),
            )
        }
    }
}