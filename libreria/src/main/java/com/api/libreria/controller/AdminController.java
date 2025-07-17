package com.api.libreria.controller;

import com.api.libreria.dto.DashboardStats;
import com.api.libreria.service.StatsService;
import com.api.libreria.service.ReportService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final StatsService statsService;
    private final ReportService reportService;

    public AdminController(StatsService statsService, ReportService reportService) {
        this.statsService = statsService;
        this.reportService = reportService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<String> dashboard() {
        return ResponseEntity.ok("Bienvenido al panel de administración");
    }

    @GetMapping("/stats")
    public ResponseEntity<DashboardStats> getStats() {
        return ResponseEntity.ok(statsService.getDashboardStats());
    }

    @GetMapping("/reports")
    public ResponseEntity<Object> getReports() {
        return ResponseEntity.ok(reportService.generateReports());
    }
}
