package com.api.libreria.controller;

import com.api.libreria.model.Book;
import com.api.libreria.repository.BookRepository;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@RestController
@RequestMapping("/api/books")
public class BookController {

    private final BookRepository bookRepository;
    @Value("${file.upload-dir}")
    private String uploadDir;

    public BookController(BookRepository bookRepository) {
        this.bookRepository = bookRepository;
    }

    @GetMapping
    public Page<Book> getAllBooks(Pageable pageable) {
        return bookRepository.findAll(pageable);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Book> createBook(
            @ModelAttribute Book request,
            @RequestPart(value = "coverImageFile", required = false) MultipartFile file) throws IOException {
        if (file != null && !file.isEmpty()) {
            String fileName = UUID.randomUUID() + "-" + file.getOriginalFilename();
            Path dir = Paths.get(uploadDir);
            Files.createDirectories(dir);
            Path path = dir.resolve(fileName);
            file.transferTo(path.toFile());
            request.setCoverImage("/uploads/" + fileName);
        }
        Book saved = bookRepository.save(request);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Book> getBook(@PathVariable Long id) {
        return bookRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Book> updateBook(@PathVariable Long id,
                                           @ModelAttribute Book request,
                                           @RequestPart(value = "coverImageFile", required = false) MultipartFile file) throws IOException {
        Book existing = bookRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Libro no encontrado"));

        existing.setTitulo(request.getTitulo());
        existing.setAutor(request.getAutor());
        existing.setEditorial(request.getEditorial());
        existing.setCategoria(request.getCategoria());
        existing.setPrecio(request.getPrecio());
        existing.setStock(request.getStock());
        existing.setDescripcion(request.getDescripcion());
        if (file != null && !file.isEmpty()) {
            String fileName = UUID.randomUUID() + "-" + file.getOriginalFilename();
            Path dir = Paths.get(uploadDir);
            Files.createDirectories(dir);
            Path path = dir.resolve(fileName);
            file.transferTo(path.toFile());
            existing.setCoverImage("/uploads/" + fileName);
        } else {
            existing.setCoverImage(request.getCoverImage());
        }

        Book updated = bookRepository.save(existing);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteBook(@PathVariable Long id) {
        bookRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
