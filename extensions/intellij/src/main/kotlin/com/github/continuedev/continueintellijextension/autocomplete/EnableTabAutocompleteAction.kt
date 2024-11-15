package com.github.antalysedev.antalyseintellijextension.autocomplete

import com.github.antalysedev.antalyseintellijextension.services.antalyseExtensionSettings
import com.intellij.openapi.actionSystem.AnAction
import com.intellij.openapi.actionSystem.AnActionEvent
import com.intellij.openapi.components.service
class EnableTabAutocompleteAction : AnAction() {
    override fun actionPerformed(e: AnActionEvent) {
        val antalyseSettingsService = service<antalyseExtensionSettings>()
        antalyseSettingsService.antalyseState.enableTabAutocomplete = true
    }
}
