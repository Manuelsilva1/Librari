package com.api.libreria.service;

import com.api.libreria.dto.DashboardStats;
import com.api.libreria.repository.BookRepository;
import com.api.libreria.repository.UserRepository;
import com.api.libreria.repository.VentaRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.Optional;

@Service
public class StatsService {
    private final BookRepository bookRepository;
    private final UserRepository userRepository;
    private final VentaRepository ventaRepository;

    public StatsService(BookRepository bookRepository, UserRepository userRepository, VentaRepository ventaRepository) {
        this.bookRepository = bookRepository;
        this.userRepository = userRepository;
        this.ventaRepository = ventaRepository;
    }

    public DashboardStats getDashboardStats() {
        DashboardStats stats = new DashboardStats();
        stats.setBooksCount(bookRepository.count());
        stats.setUsersCount(userRepository.count());
        stats.setTotalSales(Optional.ofNullable(ventaRepository.sumTotalSales()).orElse(0.0));

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfThisMonth = now.with(TemporalAdjusters.firstDayOfMonth()).withHour(0).withMinute(0).withSecond(0).withNano(0);
        LocalDateTime startOfLastMonth = startOfThisMonth.minusMonths(1);
        LocalDateTime endOfLastMonth = startOfThisMonth.minusNanos(1);

        double thisMonth = Optional.ofNullable(ventaRepository.sumTotalSalesBetween(startOfThisMonth, now)).orElse(0.0);
        double lastMonth = Optional.ofNullable(ventaRepository.sumTotalSalesBetween(startOfLastMonth, endOfLastMonth)).orElse(0.0);

        double change = lastMonth != 0 ? ((thisMonth - lastMonth) / lastMonth) * 100.0 : 0.0;
        stats.setSalesPercentageChange(change);
        stats.setNewUsersThisWeek(0L); // Registration date not tracked
        return stats;
    }
}
