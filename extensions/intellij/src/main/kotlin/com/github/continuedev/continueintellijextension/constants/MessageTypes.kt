package com.github.antalysedev.antalyseintellijextension.constants

class MessageTypes {
    companion object {
        val generatorTypes = listOf(
            "llm/streamComplete",
            "llm/streamChat",
            "command/run",
            "streamDiffLines"
        )

        val ideMessageTypes = listOf(
            "readRangeInFile",
            "getUniqueId",
            "getWorkspaceConfigs",
            "getDiff",
            "getTerminalContents",
            "getWorkspaceDirs",
            "showLines",
            "listFolders",
            "getantalyseDir",
            "writeFile",
            "fileExists",
            "showVirtualFile",
            "openFile",
            "runCommand",
            "saveFile",
            "readFile",
            "showDiff",
            "getOpenFiles",
            "getCurrentFile",
            "getPinnedFiles",
            "getSearchResults",
            "getProblems",
            "subprocess",
            "getBranch",
            "getTags",
            "getIdeInfo",
            "getIdeSettings",
            "getRepoName",
            "listDir",
            "getGitRootPath",
            "getLastModified",
            "insertAtCursor",
            "applyToFile",
            "getGitHubAuthToken",
            "setGitHubAuthToken",
            "pathSep",
            "getControlPlaneSessionInfo",
            "logoutOfControlPlane",
            "getTerminalContents",
            "showToast",
        )

        val PASS_THROUGH_TO_WEBVIEW = listOf(
            "configUpdate",
            "getDefaultModelTitle",
            "indexProgress",
            "refreshSubmenuItems",
            "didChangeAvailableProfiles",
            "addContextItem"
        )
    }
}