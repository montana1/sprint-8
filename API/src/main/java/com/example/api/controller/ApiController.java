package com.example.api.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Date;

/**
 * @author D.Starikov
 * @since 15.04.2025
 */
@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/reports")
public class ApiController {

    @GetMapping()
    public ResponseEntity<String> getReports() {
        return ResponseEntity.ok("REPORT!!! " + new Date());
    }
}
