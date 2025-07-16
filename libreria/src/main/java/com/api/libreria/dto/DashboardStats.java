package com.api.libreria.dto;

import lombok.Data;

@Data
public class DashboardStats {
    private long booksCount;
    private double totalSales;
    private double salesPercentageChange;
    private long usersCount;
    private long newUsersThisWeek;
}
