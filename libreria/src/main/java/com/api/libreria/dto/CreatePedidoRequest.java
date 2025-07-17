package com.api.libreria.dto;

import java.util.List;
import lombok.Data;

@Data
public class CreatePedidoRequest {
    private String nombre;
    private String email;
    private String celular;
    private String direccion;
    private String ciudad;
    private String estado;
    private String zip;
    private List<CreatePedidoItemRequest> items;
}
