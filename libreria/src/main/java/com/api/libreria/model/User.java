package com.api.libreria.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "users") // evito el nombre "user" que a veces da problemas en SQL
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // nombre de usuario o nombre público
    private String nombre;

    private String email;

    private String password; // luego esto será hasheado

    private String rol; // Ej: "USER" o "ADMIN"
}
