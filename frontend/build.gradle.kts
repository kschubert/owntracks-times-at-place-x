import com.github.gradle.node.npm.task.NpxTask

plugins {
    id("com.github.node-gradle.node") version "7.0.1"
}

tasks.register<NpxTask>("build") {
    dependsOn("npmInstall")
    command.set("react-scripts")
    args.set(listOf("build"))
    inputs.files("package.json", "package-lock.json", "tsconfig.json", "tailwind.config.js")
    inputs.dir("src")
    outputs.dirs(buildDir)
}