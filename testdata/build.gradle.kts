plugins {
    kotlin("jvm")
    application
}

group = "org.schubert"
version = "0.0.1"

application {
    mainClass.set("org.schubert.MainKt")
}

repositories {
    mavenCentral()
}

dependencies {
    runtimeOnly("org.mariadb.jdbc:mariadb-java-client:3.3.3")
    runtimeOnly("mysql:mysql-connector-java:8.0.33")
    testImplementation("org.jetbrains.kotlin:kotlin-test")
}

tasks.test {
    useJUnitPlatform()
}

tasks.named<JavaExec>("run") {
    setArgsString("jdbc:mysql://localhost:3306/owntracks")
}