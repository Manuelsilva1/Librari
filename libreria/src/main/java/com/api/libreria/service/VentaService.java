package com.api.libreria.service;

import com.api.libreria.model.*;
import com.api.libreria.repository.*;
import com.api.libreria.dto.CreateSaleItemRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.text.NumberFormat;
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

    @Transactional
    public Venta crearVentaDesdePedido(Pedido pedido) {
        Integer numeroTicket = getNextTicket();

        Venta venta = new Venta();
        venta.setNumeroTicket(numeroTicket);
        venta.setFecha(LocalDateTime.now());
        venta.setMetodoPago("Acordado con el cliente");
        venta = ventaRepository.save(venta);

        double total = 0.0;
        for (PedidoItem item : pedido.getItems()) {
            Book book = item.getBook();
            if (book.getStock() < item.getCantidad()) {
                throw new RuntimeException("Stock insuficiente para: " + book.getTitulo());
            }
            book.setStock(book.getStock() - item.getCantidad());
            bookRepository.save(book);

            VentaItem ventaItem = new VentaItem();
            ventaItem.setVenta(venta);
            ventaItem.setBook(book);
            ventaItem.setCantidad(item.getCantidad());
            ventaItem.setPrecioUnitario(book.getPrecio());
            ventaItemRepository.save(ventaItem);

            total += item.getCantidad() * book.getPrecio();
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

        NumberFormat currency = NumberFormat.getCurrencyInstance(Locale.US);

        StringBuilder html = new StringBuilder();
        html.append("<!DOCTYPE html>");
        html.append("<html lang='es'>");
        html.append("<head>");
        html.append("<meta charset='UTF-8'>");
        html.append("<title>Factura #").append(venta.getNumeroTicket()).append("</title>");
        html.append("<style>");
        html.append("body{font-family:'Segoe UI',Roboto,sans-serif;margin:1.5rem;background-color:#f7f9fc;color:#222;font-size:14px;line-height:1.4;}");
        html.append(".invoice{max-width:600px;margin:auto;background:#fff;border-radius:6px;box-shadow:0 0 8px rgba(0,0,0,0.05);padding:1.5rem;}");
        html.append("h1{font-size:1.4rem;margin-bottom:0.5rem;color:#333;}");
        html.append(".info{margin-bottom:1rem;font-size:0.95rem;color:#555;}");
        html.append(".info p{margin:0.1rem 0;}");
        html.append("table{width:100%;border-collapse:collapse;margin-bottom:1rem;}");
        html.append("th,td{padding:0.4rem 0.6rem;text-align:left;}");
        html.append("th{background-color:#f1f3f7;color:#555;font-size:0.9rem;font-weight:600;border-bottom:1px solid #ddd;}");
        html.append("tbody tr{border-bottom:1px solid #eee;}");
        html.append("tbody tr:last-child{border-bottom:none;}");
        html.append("td{vertical-align:top;}");
        html.append(".total{text-align:right;font-size:1rem;font-weight:600;margin-top:1rem;}");
        html.append(".highlight{color:#2a7ae2;}");
        html.append("</style>");
        html.append("</head>");
        html.append("<body>");

        html.append("<div class='invoice'>");
        html.append("<h1>Factura <span class='highlight'>#")
                .append(venta.getNumeroTicket())
                .append("</span></h1>");

        html.append("<div class='info'>");
        html.append("<p><strong>Cliente:</strong> ")
                .append(userName)
                .append("</p>");
        html.append("<p><strong>Fecha:</strong> ")
                .append(venta.getFecha())
                .append("</p>");
        html.append("<p><strong>Método de pago:</strong> ")
                .append(venta.getMetodoPago())
                .append("</p>");
        html.append("</div>");

        html.append("<table><thead><tr><th>Libro</th><th>Cantidad</th><th>Precio unitario</th><th>Total</th></tr></thead><tbody>");
        for (VentaItem item : venta.getItems()) {
            html.append("<tr>")
                    .append("<td>").append(item.getBook().getTitulo()).append("</td>")
                    .append("<td>").append(item.getCantidad()).append("</td>")
                    .append("<td>").append(currency.format(item.getPrecioUnitario())).append("</td>")
                    .append("<td>").append(currency.format(item.getCantidad() * item.getPrecioUnitario())).append("</td>")
                    .append("</tr>");
        }
        html.append("</tbody></table>");

        html.append("<p class='total'>Total: <span class='highlight'>")
                .append(currency.format(venta.getTotal()))
                .append("</span></p>");

        html.append("</div>");
        html.append("</body></html>");

        return html.toString();
    }
}
