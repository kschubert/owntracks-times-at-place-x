package com.kschubert.owntracks.analyze

import org.springframework.boot.autoconfigure.EnableAutoConfiguration
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.context.properties.EnableConfigurationProperties
import org.springframework.boot.runApplication

@SpringBootApplication
@EnableConfigurationProperties
class OwntracksAnalyzeApplication

fun main(args: Array<String>) {
	runApplication<OwntracksAnalyzeApplication>(*args)
}
