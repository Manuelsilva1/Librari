package com.api.libreria.controller;

import com.api.libreria.model.Venta;
import com.api.libreria.repository.UserRepository;
import com.api.libreria.repository.VentaRepository;
import com.api.libreria.service.VentaService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ventas")
// Ventas are available for authenticated users and admins
@PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
public class VentaController {

    private final VentaService ventaService;
    private final VentaRepository ventaRepository;
    private final UserRepository userRepository;

    public VentaController(VentaService ventaService, VentaRepository ventaRepository, UserRepository userRepository) {
        this.ventaService = ventaService;
        this.ventaRepository = ventaRepository;
        this.userRepository = userRepository;
    }

    @PostMapping("/checkout")
    public ResponseEntity<Venta> checkout(@AuthenticationPrincipal UserDetails userDetails,
                                          @RequestParam String metodoPago) {
        Long userId = getUserId(userDetails.getUsername());
        Venta venta = ventaService.crearVentaDesdeCarrito(userId, metodoPago);
        return ResponseEntity.ok(venta);
    }

    @GetMapping
    public Page<Venta> getVentas(@AuthenticationPrincipal UserDetails userDetails,
                                 Pageable pageable) {
        Long userId = getUserId(userDetails.getUsername());
        return ventaRepository.findByUsuarioId(userId, pageable);
    }

    private Long getUserId(String username) {
        return userRepository.findByUsername(username).orElseThrow().getId();
    }
}
