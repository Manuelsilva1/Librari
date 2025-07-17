package com.api.libreria.dto;

import lombok.Data;

@Data
public class CreatePedidoItemRequest {
    private Long libroId;
    private Integer cantidad;
}
