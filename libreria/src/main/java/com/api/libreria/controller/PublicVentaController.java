package com.api.libreria.controller;

import com.api.libreria.dto.InvoiceDTO;
import com.api.libreria.model.Venta;
import com.api.libreria.service.VentaService;
import java.util.Optional;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ventas/public")
public class PublicVentaController {

    private final VentaService ventaService;

    public PublicVentaController(VentaService ventaService) {
        this.ventaService = ventaService;
    }

    @GetMapping(value = "/invoice/{id}", produces = "application/json")
    public ResponseEntity<InvoiceDTO> getVentaInvoicePublic(@PathVariable Long id) {
        return ventaService.getVentaWithItemsById(id)
                .map(v -> ResponseEntity.ok(ventaService.generateInvoiceDTO(v)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping(value = "/{id}/invoice", produces = "application/json")
    public ResponseEntity<InvoiceDTO> getVentaInvoicePublicOld(@PathVariable Long id) {
        System.out.println("DEBUG: Ruta /{id}/invoice - ID recibido: " + id);
        return ventaService.getVentaWithItemsById(id)
                .map(v -> ResponseEntity.ok(ventaService.generateInvoiceDTO(v)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping(value = "/admin/{id}/invoice", produces = "application/json")
    public ResponseEntity<InvoiceDTO> getVentaAdminInvoicePublic(@PathVariable Long id) {
        System.out.println("=== INICIO: getVentaAdminInvoicePublic ===");
        System.out.println("1. Parámetros recibidos:");
        System.out.println("   - ID de venta: " + id);
        System.out.println("   - Tipo de ID: " + (id != null ? id.getClass().getName() : "null"));
        
        // Sección 1: Validación de parámetros
        System.out.println("\n2. Validación de parámetros:");
        if (id == null) {
            System.out.println("   ❌ ERROR: ID es null");
            System.out.println("   → Retornando BadRequest");
            System.out.println("=== FIN: getVentaAdminInvoicePublic (ERROR) ===");
            return ResponseEntity.badRequest().build();
        }
        System.out.println("   ✅ ID válido: " + id);
        
        // Sección 2: Búsqueda de la venta
        System.out.println("\n3. Búsqueda de la venta en la base de datos:");
        System.out.println("   → Llamando a ventaService.getVentaWithItemsById(" + id + ")");
        
        try {
            var ventaOptional = ventaService.getVentaWithItemsById(id);
            
            if (ventaOptional.isEmpty()) {
                System.out.println("   ❌ ERROR: Venta no encontrada con ID: " + id);
                System.out.println("   → Retornando NotFound");
                System.out.println("=== FIN: getVentaAdminInvoicePublic (NOT_FOUND) ===");
                return ResponseEntity.notFound().build();
            }
            
            var venta = ventaOptional.get();
            System.out.println("   ✅ Venta encontrada:");
            System.out.println("      - ID: " + venta.getId());
            System.out.println("      - Número de ticket: " + venta.getNumeroTicket());
            System.out.println("      - Total: " + venta.getTotal());
            System.out.println("      - Fecha: " + venta.getFecha());
            System.out.println("      - Método de pago: " + venta.getMetodoPago());
            System.out.println("      - Usuario ID: " + venta.getUsuarioId());
            System.out.println("      - Cantidad de items: " + (venta.getItems() != null ? venta.getItems().size() : "null"));
            
            // Sección 3: Generación del DTO
            System.out.println("\n4. Generación del InvoiceDTO:");
            System.out.println("   → Llamando a ventaService.generateInvoiceDTO()");
            
            try {
                var invoiceDTO = ventaService.generateInvoiceDTO(venta);
                System.out.println("   ✅ InvoiceDTO generado exitosamente:");
                System.out.println("      - ID de factura: " + invoiceDTO.getId());
                System.out.println("      - Número de ticket: " + invoiceDTO.getNumeroTicket());
                System.out.println("      - Total: " + invoiceDTO.getTotal());
                System.out.println("      - Cliente: " + (invoiceDTO.getCustomer() != null ? invoiceDTO.getCustomer().getUsername() : "null"));
                System.out.println("      - Cantidad de items: " + (invoiceDTO.getItems() != null ? invoiceDTO.getItems().size() : "null"));
                System.out.println("      - Status: " + invoiceDTO.getStatus());
                System.out.println("      - Currency: " + invoiceDTO.getCurrency());
                
                // Sección 4: Retorno exitoso
                System.out.println("\n5. Retorno exitoso:");
                System.out.println("   → Retornando ResponseEntity.ok() con InvoiceDTO");
                System.out.println("=== FIN: getVentaAdminInvoicePublic (SUCCESS) ===");
                return ResponseEntity.ok(invoiceDTO);
                
            } catch (Exception e) {
                System.out.println("   ❌ ERROR al generar InvoiceDTO:");
                System.out.println("      - Excepción: " + e.getClass().getSimpleName());
                System.out.println("      - Mensaje: " + e.getMessage());
                e.printStackTrace();
                System.out.println("   → Retornando InternalServerError");
                System.out.println("=== FIN: getVentaAdminInvoicePublic (ERROR) ===");
                return ResponseEntity.internalServerError().build();
            }
            
        } catch (Exception e) {
            System.out.println("   ❌ ERROR al buscar la venta:");
            System.out.println("      - Excepción: " + e.getClass().getSimpleName());
            System.out.println("      - Mensaje: " + e.getMessage());
            e.printStackTrace();
            System.out.println("   → Retornando InternalServerError");
            System.out.println("=== FIN: getVentaAdminInvoicePublic (ERROR) ===");
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping(value = "/ping", produces = "text/plain")
    public ResponseEntity<String> ping() {
        return ResponseEntity.ok("Pong! El servidor público está funcionando.");
    }

    @GetMapping(value = "/test/{id}", produces = "text/plain")
    public ResponseEntity<String> testId(@PathVariable Long id) {
        return ResponseEntity.ok("ID recibido: " + id + " (tipo: " + id.getClass().getName() + ")");
    }

    @GetMapping(value = "/simple/{id}", produces = "text/plain")
    public ResponseEntity<String> simpleTest(@PathVariable Long id) {
        System.out.println("DEBUG: Ruta /simple/{id} - ID recibido: " + id);
        return ResponseEntity.ok("Simple test - ID: " + id);
    }
}
