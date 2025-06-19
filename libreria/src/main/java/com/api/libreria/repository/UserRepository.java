package com.api.libreria.repository;

import com.api.libreria.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByNombre(String nombre);

    Optional<User> findByEmail(String email);
}
