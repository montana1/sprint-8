package ru.eexxyyq.api.application

import org.springframework.web.bind.annotation.CrossOrigin
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import ru.eexxyyq.api.domain.ReportDto
import ru.eexxyyq.api.domain.ReportService

@RestController
@RequestMapping("/reports")
class ReportController(
    private val reportService: ReportService
) {

    @GetMapping
    fun getReport(): List<ReportDto> {
        return reportService.getReport()
    }
}