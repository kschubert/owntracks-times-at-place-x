package org.schubert

import java.math.BigDecimal
import java.sql.DriverManager
import java.sql.Timestamp
import java.time.Instant
import java.time.temporal.ChronoUnit
import java.util.*

fun main(args: Array<String>) {
    DriverManager.getConnection(args[0], "owntracks", "owntracks").use { con ->
        con.createStatement().use { stmt ->
            stmt.execute("""
                CREATE TABLE `locations` (
                  `dt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
                  `accuracy` int(11) DEFAULT NULL,
                  `altitude` int(11) DEFAULT NULL,
                  `battery_level` int(11) DEFAULT NULL,
                  `heading` int(11) DEFAULT NULL,
                  `description` varchar(255) DEFAULT NULL,
                  `event` varchar(255) DEFAULT NULL,
                  `latitude` decimal(9,6) DEFAULT NULL,
                  `longitude` decimal(9,6) DEFAULT NULL,
                  `radius` int(11) DEFAULT NULL,
                  `trig` varchar(1) DEFAULT NULL,
                  `tracker_id` char(2) DEFAULT NULL,
                  `epoch` int(11) DEFAULT NULL,
                  `vertical_accuracy` int(11) DEFAULT NULL,
                  `velocity` int(11) DEFAULT NULL,
                  `pressure` decimal(9,6) DEFAULT NULL,
                  `connection` varchar(1) DEFAULT NULL,
                  `user` tinytext NOT NULL
                )
            """.trimIndent())
        }
        con.prepareStatement("insert into locations(dt, epoch, latitude, longitude, user) values(?, ?, ?, ?, ?)").use {stmt ->
            val startDate = Instant.now().truncatedTo(ChronoUnit.DAYS).minus(365, ChronoUnit.DAYS);
            for (i in 0..400) {
                val currentDate = startDate.plus(i.toLong(), ChronoUnit.DAYS);
                stmt.setTimestamp(1, Timestamp(currentDate.toEpochMilli()))
                stmt.setLong(2, currentDate.toEpochMilli() / 1000)
                stmt.setBigDecimal(3, BigDecimal.valueOf(51311262, 6))
                stmt.setBigDecimal(4, BigDecimal.valueOf(12380599, 6))
                stmt.setString(5, "user")
                stmt.addBatch()
            }
            stmt.executeBatch()
        }
    }
}