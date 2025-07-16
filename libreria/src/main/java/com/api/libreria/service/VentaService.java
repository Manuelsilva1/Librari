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

    @Transactional(readOnly = true)
    public Optional<Venta> getVentaWithItemsById(Long id) {
        return ventaRepository.findById(id).map(v -> {
            v.getItems().size(); // force lazy collection initialization
            return v;
        });
    }

    public String generateInvoiceHtml(Venta venta) {
        String userName = userRepository.findById(venta.getUsuarioId())
                .map(User::getUsername)
                .orElse("Desconocido");

        StringBuilder html = new StringBuilder();
        html.append("<html><body>");
        html.append("<h1>Factura #").append(venta.getNumeroTicket()).append("</h1>");
        html.append("<p>Cliente: ").append(userName).append("</p>");
        html.append("<p>Fecha: ").append(venta.getFecha()).append("</p>");
        html.append("<p>Método de pago: ").append(venta.getMetodoPago()).append("</p>");
        html.append("<table border='1'><thead><tr><th>Libro</th><th>Cantidad</th><th>Precio unitario</th><th>Total</th></tr></thead><tbody>");
        for (VentaItem item : venta.getItems()) {
            html.append("<tr>")
                .append("<td>").append(item.getBook().getTitulo()).append("</td>")
                .append("<td>").append(item.getCantidad()).append("</td>")
                .append("<td>").append(item.getPrecioUnitario()).append("</td>")
                .append("<td>").append(item.getCantidad() * item.getPrecioUnitario()).append("</td>")
                .append("</tr>");
        }
        html.append("</tbody></table>");
        html.append("<p>Total: ").append(venta.getTotal()).append("</p>");
        html.append("</body></html>");
        return html.toString();
    }
}
