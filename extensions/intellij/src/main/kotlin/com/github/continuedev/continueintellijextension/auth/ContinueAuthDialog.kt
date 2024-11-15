package com.github.antalysedev.antalyseintellijextension.auth

import com.intellij.openapi.ui.DialogWrapper
import com.intellij.ui.components.JBLabel
import com.intellij.ui.components.JBTextField
import javax.swing.JComponent
import javax.swing.JPanel
import java.awt.BorderLayout

class antalyseAuthDialog(private val onTokenEntered: (String) -> Unit) : DialogWrapper(true) {
    private val tokenField = JBTextField()

    init {
        init()
        title = "Enter antalyse Authentication Token"
    }

    override fun createCenterPanel(): JComponent {
        val panel = JPanel(BorderLayout())
        panel.add(JBLabel("Please enter your antalyse authentication token:"), BorderLayout.NORTH)
        panel.add(tokenField, BorderLayout.CENTER)
        return panel
    }

    override fun doOKAction() {
        val token = tokenField.text
        if (token.isNotBlank()) {
            onTokenEntered(token)
            super.doOKAction()
        } else {
            setErrorText("Please enter a valid token")
        }
    }
}
