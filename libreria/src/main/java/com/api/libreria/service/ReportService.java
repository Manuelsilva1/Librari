package com.api.libreria.service;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ReportService {

    @PersistenceContext
    private EntityManager entityManager;

    @Transactional
    public Map<String, Object> generateReports() {
        Map<String, Object> report = new HashMap<>();
        report.put("salesByDay", getSalesByDay());
        report.put("salesByMonth", getSalesByMonth());
        report.put("salesByYear", getSalesByYear());
        report.put("salesByPaymentMethod", getSalesByPaymentMethod());
        report.put("averageTicket", getAverageTicket());
        report.put("topBooks", getTopBooks());
        report.put("topCategories", getTopCategories());
        report.put("salesByUser", getSalesByUser());
        report.put("salesByMonthEditorial", getSalesByMonthEditorial());
        report.put("currentStock", getCurrentStock());
        report.put("lowStock", getLowStock());
        report.put("noStock", getNoStock());
        report.put("inventoryByEditorial", getInventoryByEditorial());
        report.put("inventoryByCategory", getInventoryByCategory());
        report.put("editorialsByCatalogCount", getEditorialsByCatalogCount());
        report.put("editorialsBySalesAmount", getEditorialsBySalesAmount());
        report.put("editorialsByUnitsSold", getEditorialsByUnitsSold());
        return report;
    }

    private List<?> getSalesByDay() {
        return entityManager.createNativeQuery(
                "SELECT DATE(fecha) AS day, SUM(total) AS total FROM ventas GROUP BY day ORDER BY day")
                .getResultList();
    }

    private List<?> getSalesByMonth() {
        return entityManager.createNativeQuery(
                "SELECT EXTRACT(YEAR FROM fecha) AS year, EXTRACT(MONTH FROM fecha) AS month, SUM(total) AS total " +
                        "FROM ventas GROUP BY year, month ORDER BY year, month")
                .getResultList();
    }

    private List<?> getSalesByYear() {
        return entityManager.createNativeQuery(
                "SELECT EXTRACT(YEAR FROM fecha) AS year, SUM(total) AS total FROM ventas GROUP BY year ORDER BY year")
                .getResultList();
    }

    private List<?> getSalesByPaymentMethod() {
        return entityManager.createNativeQuery(
                "SELECT metodo_pago AS method, SUM(total) AS total FROM ventas GROUP BY metodo_pago")
                .getResultList();
    }

    private Double getAverageTicket() {
        Object result = entityManager.createNativeQuery(
                "SELECT AVG(total) FROM ventas")
                .getSingleResult();
        return result != null ? ((Number) result).doubleValue() : 0.0;
    }

    private List<?> getTopBooks() {
        return entityManager.createNativeQuery(
                "SELECT b.titulo, SUM(vi.cantidad) AS quantity FROM venta_items vi " +
                        "JOIN books b ON vi.book_id = b.id " +
                        "GROUP BY b.id, b.titulo ORDER BY quantity DESC LIMIT 10")
                .getResultList();
    }

    private List<?> getTopCategories() {
        return entityManager.createNativeQuery(
                "SELECT c.nombre, SUM(vi.cantidad) AS quantity FROM venta_items vi " +
                        "JOIN books b ON vi.book_id = b.id " +
                        "JOIN categorias c ON CAST(b.categoria_id AS BIGINT) = c.id " +
                        "GROUP BY c.id, c.nombre ORDER BY quantity DESC LIMIT 5")
                .getResultList();
    }

    private List<?> getSalesByUser() {
        return entityManager.createNativeQuery(
                "SELECT u.username, SUM(v.total) AS total FROM ventas v " +
                        "JOIN users u ON v.usuario_id = u.id " +
                        "GROUP BY u.id, u.username ORDER BY total DESC")
                .getResultList();
    }

    private List<?> getSalesByMonthEditorial() {
        return entityManager.createNativeQuery(
                "SELECT EXTRACT(YEAR FROM v.fecha) AS year, EXTRACT(MONTH FROM v.fecha) AS month, e.nombre, " +
                        "SUM(vi.cantidad * vi.precio_unitario) AS total " +
                        "FROM ventas v " +
                        "JOIN venta_items vi ON vi.venta_id = v.id " +
                        "JOIN books b ON vi.book_id = b.id " +
                        "JOIN editoriales e ON CAST(b.editorial_id AS BIGINT) = e.id " +
                        "GROUP BY year, month, e.id, e.nombre " +
                        "ORDER BY year, month, total DESC")
                .getResultList();
    }

    private List<?> getCurrentStock() {
        return entityManager.createNativeQuery(
                "SELECT id, titulo, stock FROM books ORDER BY titulo")
                .getResultList();
    }

    private List<?> getLowStock() {
        return entityManager.createNativeQuery(
                "SELECT id, titulo, stock FROM books WHERE stock < 5 ORDER BY stock")
                .getResultList();
    }

    private List<?> getNoStock() {
        return entityManager.createNativeQuery(
                "SELECT id, titulo FROM books WHERE stock = 0")
                .getResultList();
    }

    private List<?> getInventoryByEditorial() {
        return entityManager.createNativeQuery(
                "SELECT e.nombre, COUNT(b.id) AS count, SUM(b.precio * b.stock) AS value " +
                        "FROM books b JOIN editoriales e ON CAST(b.editorial_id AS BIGINT) = e.id " +
                        "GROUP BY e.id, e.nombre ORDER BY value DESC")
                .getResultList();
    }

    private List<?> getInventoryByCategory() {
        return entityManager.createNativeQuery(
                "SELECT c.nombre, COUNT(b.id) AS count, SUM(b.precio * b.stock) AS value " +
                        "FROM books b JOIN categorias c ON CAST(b.categoria_id AS BIGINT) = c.id " +
                        "GROUP BY c.id, c.nombre ORDER BY value DESC")
                .getResultList();
    }

    private List<?> getEditorialsByCatalogCount() {
        return entityManager.createNativeQuery(
                "SELECT e.nombre, COUNT(b.id) AS count FROM editoriales e " +
                        "JOIN books b ON CAST(b.editorial_id AS BIGINT) = e.id " +
                        "GROUP BY e.id, e.nombre ORDER BY count DESC")
                .getResultList();
    }

    private List<?> getEditorialsBySalesAmount() {
        return entityManager.createNativeQuery(
                "SELECT e.nombre, SUM(vi.cantidad * vi.precio_unitario) AS total " +
                        "FROM editoriales e " +
                        "JOIN books b ON CAST(b.editorial_id AS BIGINT) = e.id " +
                        "JOIN venta_items vi ON vi.book_id = b.id " +
                        "GROUP BY e.id, e.nombre ORDER BY total DESC")
                .getResultList();
    }

    private List<?> getEditorialsByUnitsSold() {
        return entityManager.createNativeQuery(
                "SELECT e.nombre, SUM(vi.cantidad) AS quantity " +
                        "FROM editoriales e " +
                        "JOIN books b ON CAST(b.editorial_id AS BIGINT) = e.id " +
                        "JOIN venta_items vi ON vi.book_id = b.id " +
                        "GROUP BY e.id, e.nombre ORDER BY quantity DESC")
                .getResultList();
    }
}
