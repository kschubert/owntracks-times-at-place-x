package com.kschubert.owntracks.analyze

import org.jooq.SQLDialect
import org.jooq.impl.DSL
import org.jooq.impl.DefaultDSLContext
import org.jooq.impl.SQLDataType
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Controller
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.ResponseBody
import java.math.BigDecimal
import java.time.Instant
import java.time.ZoneId
import java.time.format.DateTimeFormatter
import javax.sql.DataSource

@Controller
class LocationsController(val dataSource: DataSource) {

    val LOG = LoggerFactory.getLogger(javaClass)

    val tableLocations = DSL.table(DSL.name("locations"))
    val timestamp = DSL.field(DSL.sql("epoch"), SQLDataType.BIGINT)
    val longitude = DSL.field(DSL.sql("longitude"), SQLDataType.DECIMAL)
    val latitude = DSL.field(DSL.sql("latitude"), SQLDataType.DECIMAL)

    @GetMapping("/locations")
    @ResponseBody
    fun locations(@RequestParam from: Long, @RequestParam to: Long): List<Location> {
        val dtFormatter = DateTimeFormatter.ofPattern("dd-MM-yyyy")
        val dslContext = DefaultDSLContext(dataSource, SQLDialect.MARIADB)

        data class Previous(val latitude: BigDecimal, val longitude: BigDecimal)

        var previous = Previous(BigDecimal.valueOf(Long.MIN_VALUE), BigDecimal.valueOf(Long.MIN_VALUE))
        val rows = dslContext
            .select(timestamp, longitude, latitude)
            .from(tableLocations)
            .where(
                DSL.and(
                    timestamp.ge(dslContext.select(DSL.max(timestamp)).from(tableLocations).where(timestamp.le(from))),
                    timestamp.le(to)
                )
            )
            .orderBy(timestamp)
            .asSequence()
            .map { r ->
                Location(
                    r[0] as Long,
                    r[1] as BigDecimal,
                    r[2] as BigDecimal,
                )
            }.toList()
        val result = rows
            .filter {
                val oldValue = previous
                previous = Previous(it.latitude, it.longitude)
                previous != oldValue
            }
            .toList()
        LOG.info(
            "retrieving locations for time range %s - %s: %d rows".format(
                dtFormatter.format(Instant.ofEpochSecond(from).atZone(ZoneId.systemDefault())),
                dtFormatter.format(Instant.ofEpochSecond(to).atZone(ZoneId.systemDefault())),
                result.size
            )
        )
        return result
    }
}
