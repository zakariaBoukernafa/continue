package com.github.antalysedev.antalyseintellijextension.auth

import com.github.antalysedev.antalyseintellijextension.services.antalyseExtensionSettings
import com.github.antalysedev.antalyseintellijextension.services.antalysePluginService
import com.google.gson.Gson
import com.intellij.credentialStore.Credentials
import com.intellij.ide.passwordSafe.PasswordSafe
import com.intellij.ide.util.PropertiesComponent
import com.intellij.openapi.application.ApplicationManager
import com.intellij.openapi.components.Service
import com.intellij.openapi.components.service
import com.intellij.openapi.project.Project
import com.intellij.remoteServer.util.CloudConfigurationUtil.createCredentialAttributes
import kotlinx.coroutines.CoroutineScope
import java.awt.Desktop
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import java.net.URL

@Service
class antalyseAuthService {
    private val coroutineScope = CoroutineScope(Dispatchers.IO)

    companion object {
        fun getInstance(): antalyseAuthService = service<antalyseAuthService>()
        private const val CREDENTIALS_USER = "antalyseAuthUser"
        private const val ACCESS_TOKEN_KEY = "antalyseAccessToken"
        private const val REFRESH_TOKEN_KEY = "antalyseRefreshToken"
        private const val ACCOUNT_ID_KEY = "antalyseAccountId"
        private const val ACCOUNT_LABEL_KEY = "antalyseAccountLabel"
        private const val CONTROL_PLANE_URL = "https://control-plane-api-service-i3dqylpbqa-uc.a.run.app"
//        private const val CONTROL_PLANE_URL = "http://localhost:3001"
    }

    init {
        val settings = service<antalyseExtensionSettings>()
        if (settings.antalyseState.enableantalyseTeamsBeta) {
            setupRefreshTokenInterval()
        }
    }

    fun startAuthFlow(project: Project) {
        // Open login page
        openSignInPage(project)

        // Open a dialog where the user should paste their sign-in token
        ApplicationManager.getApplication().invokeLater {
            val dialog = antalyseAuthDialog() { token ->
                // Store the token
                updateRefreshToken(token)
            }
            dialog.show()
        }
    }

    fun signOut() {
        // Clear the stored tokens
        setAccessToken("")
        setRefreshToken("")
        setAccountId("")
        setAccountLabel("")
    }

    private fun updateRefreshToken(token: String) {
        // Launch a coroutine to call the suspend function
        coroutineScope.launch {
            try {
                val response = refreshToken(token)
                val accessToken = response["accessToken"] as? String
                val refreshToken = response["refreshToken"] as? String
                val user = response["user"] as? Map<*, *>
                val firstName = user?.get("firstName") as? String
                val lastName = user?.get("lastName") as? String
                val label = "$firstName $lastName"
                val id = user?.get("id") as? String

                // Persist the session info
                setRefreshToken(refreshToken!!)
                val sessionInfo = ControlPlaneSessionInfo(accessToken!!, ControlPlaneSessionInfo.Account(id!!, label))
                setControlPlaneSessionInfo(sessionInfo)

                // Notify listeners
                ApplicationManager.getApplication().messageBus.syncPublisher(AuthListener.TOPIC)
                    .handleUpdatedSessionInfo(sessionInfo)

            } catch (e: Exception) {
                // Handle any exceptions
                println("Exception while refreshing token: ${e.message}")
            }
        }
    }

    private fun setupRefreshTokenInterval() {
        // Launch a coroutine to refresh the token every 30 minutes
        coroutineScope.launch {
            while (true) {
                val refreshToken = getRefreshToken()
                if (refreshToken != null) {
                    updateRefreshToken(refreshToken)
                }

                kotlinx.coroutines.delay(15 * 60 * 1000) // 15 minutes in milliseconds
            }
        }
    }

    private suspend fun refreshToken(refreshToken: String) = withContext(Dispatchers.IO) {
        val client = OkHttpClient()
        val url = URL(CONTROL_PLANE_URL).toURI().resolve("/auth/refresh").toURL()
        val jsonBody = mapOf("refreshToken" to refreshToken)
        val jsonString = Gson().toJson(jsonBody)
        val requestBody = jsonString.toRequestBody("application/json".toMediaType())

        val request = Request.Builder()
            .url(url)
            .post(requestBody)
            .header("Content-Type", "application/json")
            .build()

        val response = client.newCall(request).execute()

        val responseBody = response.body?.string()
        val gson = Gson()
        val responseMap = gson.fromJson(responseBody, Map::class.java)

        responseMap
    }


    private fun openSignInPage(project: Project) {
        val coreMessenger = project.service<antalysePluginService>().coreMessenger
        coreMessenger?.request("auth/getAuthUrl", null, null) { response ->
            val authUrl = (response as? Map<*, *>)?.get("url") as? String
            if (authUrl != null) {
                // Open the auth URL in the browser
                Desktop.getDesktop().browse(java.net.URI(authUrl))
            }
        }
    }

    private fun retrieveSecret(key: String): String? {
        return try {
            val attributes = createCredentialAttributes(key, CREDENTIALS_USER)
            val passwordSafe: PasswordSafe = PasswordSafe.instance

            val credentials: Credentials? = passwordSafe[attributes!!]
            credentials?.getPasswordAsString()
        } catch (e: Exception) {
            // Log the exception or handle it as needed
            println("Error retrieving secret for key $key: ${e.message}")
            null
        }
    }

    private fun storeSecret(key: String, secret: String) {
        try {
            val attributes = createCredentialAttributes(key, CREDENTIALS_USER)
            val passwordSafe: PasswordSafe = PasswordSafe.instance

            val credentials = Credentials(CREDENTIALS_USER, secret)
            passwordSafe.set(attributes!!, credentials)
        } catch (e: Exception) {
            // Log the exception or handle it as needed
            println("Error storing secret for key $key: ${e.message}")
        }
    }

    private fun getAccessToken(): String? {
        return retrieveSecret(ACCESS_TOKEN_KEY)
    }

    private fun setAccessToken(token: String) {
        storeSecret(ACCESS_TOKEN_KEY, token)
    }

    private fun getRefreshToken(): String? {
        return retrieveSecret(REFRESH_TOKEN_KEY)
    }

    private fun setRefreshToken(token: String) {
        storeSecret(REFRESH_TOKEN_KEY, token)
    }

    fun getAccountId(): String? {
        return PropertiesComponent.getInstance().getValue(ACCOUNT_ID_KEY)
    }

    fun setAccountId(id: String) {
        PropertiesComponent.getInstance().setValue(ACCOUNT_ID_KEY, id)
    }

    fun getAccountLabel(): String? {
        return PropertiesComponent.getInstance().getValue(ACCOUNT_LABEL_KEY)
    }

    fun setAccountLabel(label: String) {
        PropertiesComponent.getInstance().setValue(ACCOUNT_LABEL_KEY, label)
    }

    // New method to load all info as an object
    fun loadControlPlaneSessionInfo(): ControlPlaneSessionInfo? {
        val accessToken = getAccessToken()
        val accountId = getAccountId()
        val accountLabel = getAccountLabel()

        return if (accessToken != null && accountId != null && accountLabel != null) {
            ControlPlaneSessionInfo(
                accessToken = accessToken,
                account = ControlPlaneSessionInfo.Account(
                    id = accountId,
                    label = accountLabel
                )
            )
        } else {
            null
        }
    }

    // New method to set all info from a ControlPlaneSessionInfo object
    fun setControlPlaneSessionInfo(info: ControlPlaneSessionInfo) {
        setAccessToken(info.accessToken)
        setAccountId(info.account.id)
        setAccountLabel(info.account.label)
    }

}

// Data class to represent the ControlPlaneSessionInfo
data class ControlPlaneSessionInfo(
    val accessToken: String,
    val account: Account
) {
    data class Account(
        val id: String,
        val label: String
    )
}
