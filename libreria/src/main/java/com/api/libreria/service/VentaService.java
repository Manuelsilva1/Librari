package com.api.libreria.service;

import com.api.libreria.model.*;
import com.api.libreria.repository.*;
import com.api.libreria.dto.CreateSaleItemRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class VentaService  {

    private final VentaRepository ventaRepository;
    private final VentaItemRepository ventaItemRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final BookRepository bookRepository;
    private final UserRepository userRepository;

    public VentaService(VentaRepository ventaRepository, VentaItemRepository ventaItemRepository,
                        CartRepository cartRepository, CartItemRepository cartItemRepository,
                        BookRepository bookRepository, UserRepository userRepository) {
        this.ventaRepository = ventaRepository;
        this.ventaItemRepository = ventaItemRepository;
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.bookRepository = bookRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public synchronized Integer getNextTicket() {
        Venta last = ventaRepository.findTopByOrderByNumeroTicketDesc();
        return last == null ? 1 : last.getNumeroTicket() + 1;
    }

    @Transactional
    public Venta crearVentaDesdeCarrito(Long userId, String metodoPago, Integer numeroTicket) {
        Cart cart = cartRepository.findByUsuarioId(userId)
                .orElseThrow(() -> new RuntimeException("Carrito no encontrado"));

        if (cart.getItems().isEmpty()) {
            throw new RuntimeException("El carrito está vacío");
        }

        // Validar stock
        for (CartItem item : cart.getItems()) {
            if (item.getBook().getStock() < item.getCantidad()) {
                throw new RuntimeException("Stock insuficiente para: " + item.getBook().getTitulo());
            }
        }

        // Descontar stock
        for (CartItem item : cart.getItems()) {
            Book book = item.getBook();
            book.setStock(book.getStock() - item.getCantidad());
            bookRepository.save(book);
        }

        Venta venta = new Venta();
        venta.setUsuarioId(userId);
        venta.setNumeroTicket(numeroTicket);
        venta.setFecha(LocalDateTime.now());
        venta.setMetodoPago(metodoPago);
        venta.setTotal(0.0);

        venta = ventaRepository.save(venta);

        double total = 0.0;

        for (CartItem item : cart.getItems()) {
            VentaItem ventaItem = new VentaItem();
            ventaItem.setVenta(venta);
            ventaItem.setBook(item.getBook());
            ventaItem.setCantidad(item.getCantidad());
            ventaItem.setPrecioUnitario(item.getPrecioUnitario());
            ventaItemRepository.save(ventaItem);

            total += item.getCantidad() * item.getPrecioUnitario();
        }

        venta.setTotal(total);
        ventaRepository.save(venta);

        // Vaciar carrito
        cartItemRepository.deleteAll(cart.getItems());

        return venta;
    }

    @Transactional
    public Venta crearVentaDesdeItems(Long userId, String metodoPago, Integer numeroTicket, List<CreateSaleItemRequest> items) {
        if (items == null || items.isEmpty()) {
            throw new RuntimeException("El carrito est\u00e1 vac\u00edo");
        }

        Map<Long, Book> books = new HashMap<>();

        for (CreateSaleItemRequest item : items) {
            Book book = bookRepository.findById(item.getLibroId())
                    .orElseThrow(() -> new RuntimeException("Libro no encontrado"));
            if (book.getStock() < item.getCantidad()) {
                throw new RuntimeException("Stock insuficiente para: " + book.getTitulo());
            }
            books.put(item.getLibroId(), book);
        }

        Venta venta = new Venta();
        venta.setUsuarioId(userId);
        venta.setNumeroTicket(numeroTicket);
        venta.setFecha(LocalDateTime.now());
        venta.setMetodoPago(metodoPago);
        venta = ventaRepository.save(venta);

        double total = 0.0;
        for (CreateSaleItemRequest item : items) {
            Book book = books.get(item.getLibroId());
            book.setStock(book.getStock() - item.getCantidad());
            bookRepository.save(book);

            VentaItem ventaItem = new VentaItem();
            ventaItem.setVenta(venta);
            ventaItem.setBook(book);
            ventaItem.setCantidad(item.getCantidad());
            ventaItem.setPrecioUnitario(item.getPrecioUnitario());
            ventaItemRepository.save(ventaItem);

            total += item.getCantidad() * item.getPrecioUnitario();
        }

        venta.setTotal(total);
        ventaRepository.save(venta);

        return venta;
    }

    public List<Venta> getAllVentas() {
        return ventaRepository.findAll();
    }

    public Optional<Venta> getVentaById(Long id) {
        return ventaRepository.findById(id);
    }
}
