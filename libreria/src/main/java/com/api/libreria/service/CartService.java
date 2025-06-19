package com.api.libreria.service;

import com.api.libreria.model.*;
import com.api.libreria.repository.*;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;

    public CartService(CartRepository cartRepository, CartItemRepository cartItemRepository, UserRepository userRepository) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.userRepository = userRepository;
    }

    public Cart getOrCreateCart(Long userId, String guestId) {
        if (userId != null) {
            return cartRepository.findByUsuarioId(userId)
                    .orElseGet(() -> {
                        Cart newCart = new Cart();
                        newCart.setUsuarioId(userId);
                        return cartRepository.save(newCart);
                    });
        } else {
            return cartRepository.findByGuestId(guestId)
                    .orElseGet(() -> {
                        Cart newCart = new Cart();
                        newCart.setGuestId(guestId);
                        return cartRepository.save(newCart);
                    });
        }
    }

    public Cart addItemToCart(Long userId, String guestId, Book book, Integer quantity) {
        Cart cart = getOrCreateCart(userId, guestId);

        Optional<CartItem> existingItem = cart.getItems() == null ? Optional.empty() :
            cart.getItems().stream().filter(item -> item.getBook().getId().equals(book.getId())).findFirst();

        if (existingItem.isPresent()) {
            CartItem item = existingItem.get();
            item.setCantidad(item.getCantidad() + quantity);
            cartItemRepository.save(item);
        } else {
            CartItem item = new CartItem();
            item.setCart(cart);
            item.setBook(book);
            item.setCantidad(quantity);
            item.setPrecioUnitario(book.getPrecio());
            cartItemRepository.save(item);
        }

        if (userId != null) {
            return cartRepository.findByUsuarioId(userId).orElse(cart);
        }
        return cartRepository.findByGuestId(guestId).orElse(cart);
    }

    public Cart updateItemQuantity(Long userId, String guestId, Long itemId, Integer quantity) {
        Cart cart = getOrCreateCart(userId, guestId);

        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item no encontrado"));

        if (!item.getCart().getId().equals(cart.getId())) {
            throw new RuntimeException("Item no pertenece al carrito del usuario");
        }

        if (quantity <= 0) {
            cartItemRepository.delete(item);
        } else {
            item.setCantidad(quantity);
            cartItemRepository.save(item);
        }

        if (userId != null) {
            return cartRepository.findByUsuarioId(userId).orElse(cart);
        }
        return cartRepository.findByGuestId(guestId).orElse(cart);
    }

    public Cart removeItemFromCart(Long userId, String guestId, Long itemId) {
        Cart cart = getOrCreateCart(userId, guestId);

        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item no encontrado"));

        if (!item.getCart().getId().equals(cart.getId())) {
            throw new RuntimeException("Item no pertenece al carrito del usuario");
        }

        cartItemRepository.delete(item);

        if (userId != null) {
            return cartRepository.findByUsuarioId(userId).orElse(cart);
        }
        return cartRepository.findByGuestId(guestId).orElse(cart);
    }
}
