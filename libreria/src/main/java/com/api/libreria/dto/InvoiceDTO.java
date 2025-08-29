package com.api.libreria.dto;

import com.api.libreria.model.Venta;
import com.api.libreria.model.VentaItem;
import com.api.libreria.model.User;
import lombok.Data;
import lombok.Builder;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class InvoiceDTO {
    
    // Información de la factura
    private Long id;
    private Integer numeroTicket;
    private LocalDateTime fecha;
    private String metodoPago;
    private Double total;
    
    // Información del cliente
    private CustomerInfo customer;
    
    // Items de la factura
    private List<InvoiceItemDTO> items;
    
    // Información adicional
    private String status;
    private String currency;
    
    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class CustomerInfo {
        private Long id;
        private String username;
        private String email;
    }
    
    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class InvoiceItemDTO {
        private Long id;
        private BookInfo book;
        private Integer cantidad;
        private Double precioUnitario;
        private Double subtotal;
    }
    
    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class BookInfo {
        private Long id;
        private String titulo;
        private String autor;
        private String isbn;
        private String editorialId;
        private String categoriaId;
        private String coverImage;
    }
    
    // Método estático para convertir Venta a InvoiceDTO
    public static InvoiceDTO fromVenta(Venta venta, User customer) {
        List<InvoiceItemDTO> items = venta.getItems().stream()
                .map(item -> InvoiceItemDTO.builder()
                        .id(item.getId())
                        .book(BookInfo.builder()
                                .id(item.getBook().getId())
                                .titulo(item.getBook().getTitulo())
                                .autor(item.getBook().getAutor())
                                .isbn(item.getBook().getIsbn())
                                .editorialId(item.getBook().getEditorialId())
                                .categoriaId(item.getBook().getCategoriaId())
                                .coverImage(item.getBook().getCoverImage())
                                .build())
                        .cantidad(item.getCantidad())
                        .precioUnitario(item.getPrecioUnitario())
                        .subtotal(item.getCantidad() * item.getPrecioUnitario())
                        .build())
                .collect(Collectors.toList());
        
        return InvoiceDTO.builder()
                .id(venta.getId())
                .numeroTicket(venta.getNumeroTicket())
                .fecha(venta.getFecha())
                .metodoPago(venta.getMetodoPago())
                .total(venta.getTotal())
                .customer(CustomerInfo.builder()
                        .id(customer.getId())
                        .username(customer.getUsername())
                        .email(customer.getEmail())
                        .build())
                .items(items)
                .status("COMPLETED")
                .currency("USD")
                .build();
    }
}
