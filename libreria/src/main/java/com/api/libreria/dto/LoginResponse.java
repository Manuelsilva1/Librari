package com.api.libreria.dto;

import com.api.libreria.model.User;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LoginResponse {
    private String token;
    private User usuario;
}
