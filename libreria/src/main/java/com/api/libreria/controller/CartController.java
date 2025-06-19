package com.api.libreria.controller;

import com.api.libreria.model.*;
import com.api.libreria.repository.*;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final BookRepository bookRepository;
    private final UserRepository userRepository;

    public CartController(CartRepository cartRepository, CartItemRepository cartItemRepository,
            BookRepository bookRepository, UserRepository userRepository) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.bookRepository = bookRepository;
        this.userRepository = userRepository;
    }

    // GET carrito actual
    @GetMapping
    public ResponseEntity<Cart> getCart(@AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false) String guestId) {
        Long userId = null;
        boolean newGuest = false;
        if (userDetails != null) {
            userId = getUserId(userDetails.getUsername());
        } else {
            if (guestId == null) {
                guestId = UUID.randomUUID().toString();
                newGuest = true;
            }
        }

        Cart cart;
        if (userId != null) {
            final Long uid = userId;
            cart = cartRepository.findByUsuarioId(userId).orElseGet(() -> {
                Cart newCart = new Cart();
                newCart.setUsuarioId(uid);
                return cartRepository.save(newCart);
            });
        } else {
            String gtId = guestId;
            cart = cartRepository.findByGuestId(guestId).orElseGet(() -> {
                Cart newCart = new Cart();
                newCart.setGuestId(gtId);
                return cartRepository.save(newCart);
            });
        }

        ResponseEntity.BodyBuilder builder = ResponseEntity.ok();
        if (newGuest) {
            builder.header("X-Guest-Id", guestId);
        }
        return builder.body(cart);
    }

    // POST agregar libro al carrito
    @PostMapping("/add")
    public ResponseEntity<Cart> addToCart(@AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false) String guestId,
            @RequestParam Long bookId,
            @RequestParam Integer cantidad) {

        Long userId = null;
        boolean newGuest = false;
        if (userDetails != null) {
            userId = getUserId(userDetails.getUsername());
        } else if (guestId == null) {
            guestId = UUID.randomUUID().toString();
            newGuest = true;
        }

        Cart cart;
        if (userId != null) {
            final Long uid = userId;
            cart = cartRepository.findByUsuarioId(userId).orElseGet(() -> {
                Cart newCart = new Cart();
                newCart.setUsuarioId(uid);
                return cartRepository.save(newCart);
            });
        } else {
            String gtId = guestId;
            cart = cartRepository.findByGuestId(guestId).orElseGet(() -> {
                Cart newCart = new Cart();
                newCart.setGuestId(gtId);
                return cartRepository.save(newCart);
            });
        }

        Book book = bookRepository.findById(bookId).orElseThrow(() -> new RuntimeException("Libro no encontrado"));

        // Buscamos si el item ya existe en el carrito
        Optional<CartItem> existingItem = cart.getItems() == null ? Optional.empty()
                : cart.getItems().stream().filter(item -> item.getBook().getId().equals(bookId)).findFirst();

        if (existingItem.isPresent()) {
            CartItem item = existingItem.get();
            item.setCantidad(item.getCantidad() + cantidad);
            cartItemRepository.save(item);
        } else {
            CartItem item = new CartItem();
            item.setBook(book);
            item.setCantidad(cantidad);
            item.setPrecioUnitario(book.getPrice());
            item.setCart(cart);
            cartItemRepository.save(item);
        }

        if (userId != null) {
            cart = cartRepository.findByUsuarioId(userId).get();
        } else {
            cart = cartRepository.findByGuestId(guestId).get();
        }
        ResponseEntity.BodyBuilder builder = ResponseEntity.ok();
        if (newGuest) {
            builder.header("X-Guest-Id", guestId);
        }
        return builder.body(cart);
    }

    // PUT actualizar cantidad de un item
    @PutMapping("/items/{itemId}")
    public ResponseEntity<Cart> updateItemQuantity(@AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false) String guestId,
            @PathVariable Long itemId,
            @RequestParam Integer cantidad) {
        Long userId = null;
        boolean newGuest = false;
        if (userDetails != null) {
            userId = getUserId(userDetails.getUsername());
        } else if (guestId == null) {
            guestId = UUID.randomUUID().toString();
            newGuest = true;
        }

        Cart cart = userId != null
                ? cartRepository.findByUsuarioId(userId)
                        .orElseThrow(() -> new RuntimeException("Carrito no encontrado"))
                : cartRepository.findByGuestId(guestId)
                        .orElseThrow(() -> new RuntimeException("Carrito no encontrado"));

        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item no encontrado"));

        if (!item.getCart().getId().equals(cart.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        if (cantidad <= 0) {
            cartItemRepository.delete(item);
        } else {
            item.setCantidad(cantidad);
            cartItemRepository.save(item);
        }

        if (userId != null) {
            cart = cartRepository.findByUsuarioId(userId).orElse(cart);
        } else {
            cart = cartRepository.findByGuestId(guestId).orElse(cart);
        }
        ResponseEntity.BodyBuilder builder = ResponseEntity.ok();
        if (newGuest) {
            builder.header("X-Guest-Id", guestId);
        }
        return builder.body(cart);
    }

    // DELETE eliminar item del carrito
    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<Cart> removeItem(@AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false) String guestId,
            @PathVariable Long itemId) {
        Long userId = null;
        boolean newGuest = false;
        if (userDetails != null) {
            userId = getUserId(userDetails.getUsername());
        } else if (guestId == null) {
            guestId = UUID.randomUUID().toString();
            newGuest = true;
        }

        Cart cart = userId != null
                ? cartRepository.findByUsuarioId(userId)
                        .orElseThrow(() -> new RuntimeException("Carrito no encontrado"))
                : cartRepository.findByGuestId(guestId)
                        .orElseThrow(() -> new RuntimeException("Carrito no encontrado"));

        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item no encontrado"));

        if (!item.getCart().getId().equals(cart.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        cartItemRepository.delete(item);

        if (userId != null) {
            cart = cartRepository.findByUsuarioId(userId).orElse(cart);
        } else {
            cart = cartRepository.findByGuestId(guestId).orElse(cart);
        }
        ResponseEntity.BodyBuilder builder = ResponseEntity.ok();
        if (newGuest) {
            builder.header("X-Guest-Id", guestId);
        }
        return builder.body(cart);
    }

    private Long getUserId(String username) {
        return userRepository.findByUsername(username).orElseThrow().getId();
    }
}
