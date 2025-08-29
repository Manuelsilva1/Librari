package com.api.libreria.controller;

import com.api.libreria.model.Book;
import com.api.libreria.repository.BookRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;
import org.springframework.boot.system.ApplicationHome;

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
            @RequestPart(value = "coverImageFile", required = false) MultipartFile file
    ) throws IOException {

        if (file != null && !file.isEmpty()) {
            // ✨ Ruta absoluta definida por ti
            Path dir = Paths.get("C:\\Users\\manue\\OneDrive\\Documentos\\Desarrollo\\librari\\libreria\\uploads");
            Files.createDirectories(dir);

            String fileName = UUID.randomUUID() + "-" + file.getOriginalFilename();
            Path path = dir.resolve(fileName);

            file.transferTo(path);

            System.out.println("Archivo guardado en: " + path.toAbsolutePath());

            // Guarda la ruta absoluta
            request.setCoverImage("/uploads/" + fileName);
        } else {
            System.out.println("No vino ningún archivo");
        }

        Book saved = bookRepository.save(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Book> getBook(@PathVariable Long id) {
        return bookRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/cover")
    public ResponseEntity<Resource> getBookCover(@PathVariable Long id) throws IOException {
        Book book = bookRepository.findById(id).orElse(null);
        if (book == null || book.getCoverImage() == null) {
            return ResponseEntity.notFound().build();
        }

        Path filePath = Paths.get(uploadDir).resolve(Paths.get(book.getCoverImage()).getFileName());
        if (!Files.exists(filePath)) {
            return ResponseEntity.notFound().build();
        }
        Resource resource = new UrlResource(filePath.toUri());
        String contentType = Files.probeContentType(filePath);
        MediaType mediaType = contentType != null ? MediaType.parseMediaType(contentType) : MediaType.APPLICATION_OCTET_STREAM;
        return ResponseEntity.ok()
                .contentType(mediaType)
                .body(resource);
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
        existing.setEditorialId(request.getEditorialId());
        existing.setCategoriaId(request.getCategoriaId());
        existing.setPrecio(request.getPrecio());
        existing.setStock(request.getStock());
        existing.setDescripcion(request.getDescripcion());
        if (file != null && !file.isEmpty()) {
            // ✨ Ruta absoluta definida por ti
            Path dir = Paths.get("C:\\Users\\manue\\OneDrive\\Documentos\\Desarrollo\\librari\\libreria\\uploads");
            Files.createDirectories(dir);

            String fileName = UUID.randomUUID() + "-" + file.getOriginalFilename();
            Path path = dir.resolve(fileName);

            file.transferTo(path);

            System.out.println("Archivo guardado en: " + path.toAbsolutePath());

            // Guarda la ruta absoluta
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
