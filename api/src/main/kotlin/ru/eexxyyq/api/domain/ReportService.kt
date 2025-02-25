package ru.eexxyyq.api.domain

import org.springframework.stereotype.Service
import java.util.*

@Service
class ReportService {

    fun getReport(): List<ReportDto> {
        return listOf(
            ReportDto(UUID.randomUUID(), "title1", "body1"),
            ReportDto(UUID.randomUUID(), "title2", "body2"),
            ReportDto(UUID.randomUUID(), "title3", "body3")
        )
    }
}

data class ReportDto(
    val id: UUID,
    val title: String,
    val body: String
)