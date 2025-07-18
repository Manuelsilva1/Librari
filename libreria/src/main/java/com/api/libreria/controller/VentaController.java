package com.api.libreria.controller;

import com.api.libreria.model.Venta;
import com.api.libreria.repository.UserRepository;
import com.api.libreria.repository.VentaRepository;
import com.api.libreria.dto.CreateSaleRequest;
import com.api.libreria.service.VentaService;
import java.util.List;
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

    @GetMapping("/next-ticket")
    public ResponseEntity<?> getNextTicket() {
        Integer next = ventaService.getNextTicket();
        return ResponseEntity.ok(java.util.Collections.singletonMap("nextTicket", next));
    }

    @PostMapping("/checkout")
    public ResponseEntity<Venta> checkout(@AuthenticationPrincipal UserDetails userDetails,
                                          @RequestBody CreateSaleRequest request) {
        Long userId = getUserId(userDetails.getUsername());
        Venta venta = ventaService.crearVentaDesdeItems(userId, request.getPaymentMethod(), request.getNumeroTicket(), request.getItems());
        return ResponseEntity.ok(venta);
    }

    @PostMapping
    public ResponseEntity<Venta> crearVenta(@AuthenticationPrincipal UserDetails userDetails,
                                            @RequestBody CreateSaleRequest request) {
        Long userId = getUserId(userDetails.getUsername());
        Venta venta = ventaService.crearVentaDesdeItems(userId, request.getPaymentMethod(), request.getNumeroTicket(), request.getItems());
        return ResponseEntity.ok(venta);
    }

    @GetMapping
    public Page<Venta> getVentas(@AuthenticationPrincipal UserDetails userDetails,
                                 Pageable pageable) {
        Long userId = getUserId(userDetails.getUsername());
        return ventaRepository.findByUsuarioId(userId, pageable);
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public List<Venta> getAllVentasAdmin() {
        return ventaService.getAllVentas();
    }

    @GetMapping("/admin/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Venta> getVentaAdminById(@PathVariable Long id) {
        return ventaService.getVentaById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping(value = "/admin/{id}/invoice", produces = "text/html")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> getVentaAdminInvoice(@PathVariable Long id) {
        return ventaService.getVentaWithItemsById(id)
                .map(v -> ResponseEntity.ok(ventaService.generateInvoiceHtml(v)))
                .orElse(ResponseEntity.notFound().build());
    }

    private Long getUserId(String nombre) {
        // Auth stores the username value, so search by username instead of email
        return userRepository.findByUsername(nombre).orElseThrow().getId();
    }
}
