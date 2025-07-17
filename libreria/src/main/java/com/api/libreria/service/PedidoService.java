package com.api.libreria.service;

import com.api.libreria.model.*;
import com.api.libreria.repository.*;
import com.api.libreria.dto.CreatePedidoItemRequest;
import com.api.libreria.dto.CreatePedidoRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;

@Service
public class PedidoService {
    private final PedidoRepository pedidoRepository;
    private final PedidoItemRepository pedidoItemRepository;
    private final BookRepository bookRepository;
    private final VentaService ventaService;

    public PedidoService(PedidoRepository pedidoRepository,
                         PedidoItemRepository pedidoItemRepository,
                         BookRepository bookRepository,
                         VentaService ventaService) {
        this.pedidoRepository = pedidoRepository;
        this.pedidoItemRepository = pedidoItemRepository;
        this.bookRepository = bookRepository;
        this.ventaService = ventaService;
    }

    @Transactional
    public Pedido crearPedido(CreatePedidoRequest request) {
        Pedido pedido = new Pedido();
        pedido.setNombre(request.getNombre());
        pedido.setEmail(request.getEmail());
        pedido.setCelular(request.getCelular());
        pedido.setDireccion(request.getDireccion());
        pedido.setCiudad(request.getCiudad());
        pedido.setEstado(request.getEstado());
        pedido.setZip(request.getZip());
        pedido.setFecha(LocalDateTime.now());
        pedido.setStatus("PENDING");
        pedido = pedidoRepository.save(pedido);

        if (request.getItems() != null) {
            var items = new ArrayList<PedidoItem>();
            for (CreatePedidoItemRequest itemReq : request.getItems()) {
                Book book = bookRepository.findById(itemReq.getLibroId()).orElseThrow();
                if (book.getStock() < itemReq.getCantidad()) {
                    throw new RuntimeException("Stock insuficiente para: " + book.getTitulo());
                }
                book.setStock(book.getStock() - itemReq.getCantidad());
                bookRepository.save(book);

                PedidoItem item = new PedidoItem();
                item.setPedido(pedido);
                item.setBook(book);
                item.setCantidad(itemReq.getCantidad());
                items.add(pedidoItemRepository.save(item));
            }
            pedido.setItems(items);
        }
        return pedidoRepository.save(pedido);
    }

    public java.util.List<Pedido> getAllPedidos() {
        return pedidoRepository.findAll();
    }

    @Transactional
    public Pedido actualizarEstado(Long id, String status) {
        Pedido p = pedidoRepository.findById(id).orElseThrow();
        p.setStatus(status);
        Pedido saved = pedidoRepository.save(p);
        if ("APPROVED".equalsIgnoreCase(status)) {
            ventaService.crearVentaDesdePedido(saved);
        }
        return saved;
    }
}
