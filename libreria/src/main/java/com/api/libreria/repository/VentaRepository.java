package com.api.libreria.repository;

import com.api.libreria.model.Venta;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VentaRepository extends JpaRepository<Venta, Long> {

    Page<Venta> findByUsuarioId(Long usuarioId, Pageable pageable);

    Venta findTopByOrderByNumeroTicketDesc();

    @org.springframework.data.jpa.repository.Query("SELECT SUM(v.total) FROM Venta v")
    Double sumTotalSales();

    @org.springframework.data.jpa.repository.Query("SELECT SUM(v.total) FROM Venta v WHERE v.fecha BETWEEN :start AND :end")
    Double sumTotalSalesBetween(@org.springframework.data.repository.query.Param("start") java.time.LocalDateTime start,
                                @org.springframework.data.repository.query.Param("end") java.time.LocalDateTime end);
}
