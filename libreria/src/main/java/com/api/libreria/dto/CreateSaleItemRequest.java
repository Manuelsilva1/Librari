package com.api.libreria.dto;

import lombok.Data;

@Data
public class CreateSaleItemRequest {
    private Long libroId;
    private Integer cantidad;
    private Double precioUnitario;
}
