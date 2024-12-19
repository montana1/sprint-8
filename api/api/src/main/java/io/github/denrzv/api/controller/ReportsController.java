package io.github.denrzv.api.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class ReportsController {
    @GetMapping("/reports")
    public List<String> getReports() {
        return List.of(
            "Mock Report #1",
            "Mock Report #2",
            "Mock Report #3"
        );
    }
}