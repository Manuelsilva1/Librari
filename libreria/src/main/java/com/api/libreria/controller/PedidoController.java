package com.api.libreria.controller;

import com.api.libreria.dto.CreatePedidoRequest;
import com.api.libreria.model.Pedido;
import com.api.libreria.service.PedidoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/pedidos")
public class PedidoController {

    private final PedidoService pedidoService;

    public PedidoController(PedidoService pedidoService) {
        this.pedidoService = pedidoService;
    }

    @PostMapping
    public ResponseEntity<Pedido> crearPedido(@RequestBody CreatePedidoRequest request) {
        return ResponseEntity.ok(pedidoService.crearPedido(request));
    }

    @GetMapping
    public List<Pedido> getPedidos() {
        return pedidoService.getAllPedidos();
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Pedido> actualizarStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String status = body.get("status");
        return ResponseEntity.ok(pedidoService.actualizarEstado(id, status));
    }
}
