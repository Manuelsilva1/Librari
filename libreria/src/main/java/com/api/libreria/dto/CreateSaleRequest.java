package com.api.libreria.dto;

import java.util.List;
import lombok.Data;

@Data
public class CreateSaleRequest {
    private String paymentMethod;
    private List<CreateSaleItemRequest> items;
}
