package com.api.libreria.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "users") // evito el nombre "user" que a veces da problemas en SQL
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // nombre de usuario o nombre público
    private String username;

    private String email;

    private String password; // luego esto será hasheado

    private String role; // Ej: "USER" o "ADMIN"
}
