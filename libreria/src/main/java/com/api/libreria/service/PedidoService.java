package com.api.libreria.service;

import com.api.libreria.model.*;
import com.api.libreria.repository.*;
import org.springframework.security.crypto.password.PasswordEncoder;
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
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public PedidoService(PedidoRepository pedidoRepository,
                         PedidoItemRepository pedidoItemRepository,
                         BookRepository bookRepository,
                         VentaService ventaService,
                         UserRepository userRepository,
                         PasswordEncoder passwordEncoder) {
        this.pedidoRepository = pedidoRepository;
        this.pedidoItemRepository = pedidoItemRepository;
        this.bookRepository = bookRepository;
        this.ventaService = ventaService;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public Pedido crearPedido(CreatePedidoRequest request) {
        // Create or fetch user based on email
        userRepository.findByEmail(request.getEmail()).orElseGet(() -> {
            User newUser = new User();
            newUser.setUsername(request.getNombre());
            newUser.setEmail(request.getEmail());
            newUser.setPassword(passwordEncoder.encode(java.util.UUID.randomUUID().toString()));
            newUser.setRole("USER");
            return userRepository.save(newUser);
        });

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
        String previousStatus = p.getStatus();
        p.setStatus(status);
        Pedido saved = pedidoRepository.save(p);
        if ("APPROVED".equalsIgnoreCase(status)) {
            ventaService.crearVentaDesdePedido(saved);
        } else if ("CANCELLED".equalsIgnoreCase(status) &&
                   !"CANCELLED".equalsIgnoreCase(previousStatus)) {
            for (PedidoItem item : saved.getItems()) {
                Book book = item.getBook();
                book.setStock(book.getStock() + item.getCantidad());
                bookRepository.save(book);
            }
        }
        return saved;
    }
}
