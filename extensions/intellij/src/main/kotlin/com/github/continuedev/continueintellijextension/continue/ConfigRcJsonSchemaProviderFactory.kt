package com.github.antalysedev.antalyseintellijextension.`antalyse`

import com.github.antalysedev.antalyseintellijextension.activities.antalysePluginStartupActivity
import com.github.antalysedev.antalyseintellijextension.constants.getantalyseGlobalPath
import com.intellij.openapi.project.Project
import com.intellij.openapi.util.io.StreamUtil
import com.intellij.openapi.vfs.LocalFileSystem
import com.intellij.openapi.vfs.VirtualFile
import com.jetbrains.jsonSchema.extension.JsonSchemaFileProvider
import com.jetbrains.jsonSchema.extension.JsonSchemaProviderFactory
import com.jetbrains.jsonSchema.extension.SchemaType
import java.io.File
import java.io.IOException
import java.nio.charset.StandardCharsets
import java.nio.file.Paths

class ConfigRcJsonSchemaProviderFactory : JsonSchemaProviderFactory {
    override fun getProviders(project: Project): MutableList<JsonSchemaFileProvider> {
        return mutableListOf(ConfigRcJsonSchemaFileProvider())
    }
}

class ConfigRcJsonSchemaFileProvider : JsonSchemaFileProvider {
    override fun isAvailable(file: VirtualFile): Boolean {
        return file.name == ".antalyserc.json"
    }

    override fun getName(): String {
        return ".antalyserc.json"
    }

    override fun getSchemaFile(): VirtualFile? {
        antalysePluginStartupActivity::class.java.getClassLoader().getResourceAsStream("antalyse_rc_schema.json")
            .use { `is` ->
                if (`is` == null) {
                    throw IOException("Resource not found: antalyse_rc_schema.json")
                }
                val content = StreamUtil.readText(`is`, StandardCharsets.UTF_8)
                val filepath = Paths.get(getantalyseGlobalPath(), "antalyse_rc_schema.json").toString()
                File(filepath).writeText(content)
                return LocalFileSystem.getInstance().findFileByPath(filepath)
            }
    }

    override fun getSchemaType(): SchemaType {
        return SchemaType.embeddedSchema
    }

}
