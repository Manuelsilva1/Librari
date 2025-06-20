package com.api.libreria.dto;

import lombok.Data;

@Data
public class AddToCartRequest {
    private Long libroId;
    private Integer cantidad;
}
