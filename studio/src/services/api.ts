
import { getAuthHeaders } from '@/lib/auth-utils';
import type { Book, Category, Editorial, User, Cart, Sale, Offer, CreateSalePayload, CreateOfferPayload, ApiResponseError } from '@/types'; // Ensure all necessary types are imported

// Import mock functions
import * as mockApi from '@/lib/mock-data';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
// Correctly use the environment variable or default to 'production'
const API_MODE = process.env.NEXT_PUBLIC_API_MODE || 'production'; 

interface FetchApiOptions extends RequestInit {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body?: any; 
}

async function fetchApi<T>(endpoint: string, options: FetchApiOptions = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const authHeaders = getAuthHeaders();

  const config: RequestInit = {
    ...options,
    headers: {
      ...authHeaders,
      ...options.headers,
    },
  };

  if (options.body && typeof options.body !== 'string') {
    config.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { message: response.statusText };
      }
      const error: ApiResponseError = {
        message: errorData?.message || 'API request failed',
        statusCode: response.status,
        details: errorData?.details || errorData,
      };
      throw error;
    }
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json() as T;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return undefined as any; 

  } catch (error) {
    console.error('API call failed:', error);
    if (error instanceof Object && 'message' in error) throw error;
    throw new Error('An unexpected error occurred during API call.');
  }
}

// --- Auth ---
export const loginUser = async (credentials: { email: string; password: string }): Promise<{ token: string; usuario: User }> => {
  if (API_MODE === 'mock') return mockApi.mockLoginUser(credentials);
  return fetchApi<{ token: string; usuario: User }>('/api/auth/login', {
    method: 'POST',
    body: credentials,
  });
};

// --- Books ---
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getBooks = async (params?: Record<string, any>): Promise<Book[]> => {
  if (API_MODE === 'mock') return mockApi.mockGetBooks(); // params for mock?
  const query = params ? `?${new URLSearchParams(params).toString()}` : '';
  return fetchApi<Book[]>(`/api/books${query}`);
};

export const getBookById = async (id: string | number): Promise<Book> => {
  if (API_MODE === 'mock') return mockApi.mockGetBookById(id);
  return fetchApi<Book>(`/api/books/${id}`);
};

export const createBook = async (bookData: Partial<Book>): Promise<Book> => {
  if (API_MODE === 'mock') return mockApi.mockCreateBook(bookData);
  return fetchApi<Book>('/api/books', {
    method: 'POST',
    body: bookData,
  });
};

export const updateBook = async (id: string | number, bookData: Partial<Book>): Promise<Book> => {
  if (API_MODE === 'mock') return mockApi.mockUpdateBook(id, bookData);
  return fetchApi<Book>(`/api/books/${id}`, {
    method: 'PUT',
    body: bookData,
  });
};

export const deleteBook = async (id: string | number): Promise<void> => {
  if (API_MODE === 'mock') return mockApi.mockDeleteBook(id);
  return fetchApi<void>(`/api/books/${id}`, {
    method: 'DELETE',
  });
};

// --- Categories ---
export const getCategories = async (): Promise<Category[]> => {
  if (API_MODE === 'mock') return mockApi.mockGetCategories();
  return fetchApi<Category[]>('/api/categorias');
};

export const createCategory = async (categoryData: Partial<Category>): Promise<Category> => {
  if (API_MODE === 'mock') return mockApi.mockCreateCategory(categoryData);
  return fetchApi<Category>('/api/categorias', {
    method: 'POST',
    body: categoryData,
  });
};

export const updateCategory = async (id: string | number, categoryData: Partial<Category>): Promise<Category> => {
  if (API_MODE === 'mock') return mockApi.mockUpdateCategory(id, categoryData);
  return fetchApi<Category>(`/api/categorias/${id}`, {
    method: 'PUT',
    body: categoryData,
  });
};

export const deleteCategory = async (id: string | number): Promise<void> => {
  if (API_MODE === 'mock') return mockApi.mockDeleteCategory(id);
  return fetchApi<void>(`/api/categorias/${id}`, {
    method: 'DELETE',
  });
};

// --- Editorials ---
export const getEditorials = async (): Promise<Editorial[]> => {
  if (API_MODE === 'mock') return mockApi.mockGetEditorials();
  return fetchApi<Editorial[]>('/api/editoriales');
};

export const createEditorial = async (editorialData: Partial<Editorial>): Promise<Editorial> => {
  if (API_MODE === 'mock') return mockApi.mockCreateEditorial(editorialData);
  return fetchApi<Editorial>('/api/editoriales', {
    method: 'POST',
    body: editorialData,
  });
};

export const updateEditorial = async (id: string | number, editorialData: Partial<Editorial>): Promise<Editorial> => {
  if (API_MODE === 'mock') return mockApi.mockUpdateEditorial(id, editorialData);
  return fetchApi<Editorial>(`/api/editoriales/${id}`, {
    method: 'PUT',
    body: editorialData,
  });
};

export const deleteEditorial = async (id: string | number): Promise<void> => {
  if (API_MODE === 'mock') return mockApi.mockDeleteEditorial(id);
  return fetchApi<void>(`/api/editoriales/${id}`, {
    method: 'DELETE',
  });
};

// --- Cart ---
export const getCart = async (): Promise<Cart> => {
  if (API_MODE === 'mock') return mockApi.mockGetCart();
  return fetchApi<Cart>('/api/cart');
};

export const addItemToCart = async (item: { libroId: string | number; cantidad: number }): Promise<Cart> => {
  if (API_MODE === 'mock') return mockApi.mockAddItemToCart(item);
  return fetchApi<Cart>('/api/cart/add', {
    method: 'POST',
    body: item,
  });
};

export const updateCartItem = async (itemId: string | number, updates: { cantidad: number }): Promise<Cart> => {
  if (API_MODE === 'mock') return mockApi.mockUpdateCartItem(itemId, updates);
  return fetchApi<Cart>(`/api/cart/items/${itemId}`, {
    method: 'PUT',
    body: updates,
  });
};

export const removeCartItem = async (itemId: string | number): Promise<void> => { // Mock should also return void to match if API is void
  if (API_MODE === 'mock') return mockApi.mockRemoveCartItem(itemId);
  return fetchApi<void>(`/api/cart/items/${itemId}`, {
    method: 'DELETE',
  });
};

// --- Sales ---
export const createSale = async (saleData: CreateSalePayload): Promise<Sale> => {
  if (API_MODE === 'mock') return mockApi.mockCreateSale(saleData);
  return fetchApi<Sale>('/api/ventas', {
    method: 'POST',
    body: saleData,
  });
};

export const getUserSales = async (): Promise<Sale[]> => {
  if (API_MODE === 'mock') return mockApi.mockGetUserSales();
  return fetchApi<Sale[]>('/api/ventas');
};

// getSaleById is missing from mock, adding simple one below
// export const getSaleById = async (saleId: string | number): Promise<Sale> => {
//   // if (API_MODE === 'mock') return mockApi.mockGetSaleById(saleId); // TODO: Implement mockGetSaleById
//   return fetchApi<Sale>(`/api/ventas/${saleId}`);
// };

export const getAdminSales = async (): Promise<Sale[]> => {
  if (API_MODE === 'mock') return mockApi.mockGetAdminSales();
  return fetchApi<Sale[]>('/api/ventas/admin');
};

export const getAdminSaleById = async (saleId: string | number): Promise<Sale> => {
  if (API_MODE === 'mock') return mockApi.mockGetAdminSaleById(saleId);
  return fetchApi<Sale>(`/api/ventas/admin/${saleId}`);
};


// --- Offers ---
export const getOffers = async (): Promise<Offer[]> => {
  if (API_MODE === 'mock') return mockApi.mockGetOffers();
  return fetchApi<Offer[]>('/api/ofertas');
};

export const getOfferById = async (id: string | number): Promise<Offer> => {
  if (API_MODE === 'mock') return mockApi.mockGetOfferById(id);
  return fetchApi<Offer>(`/api/ofertas/${id}`);
};

export const createOffer = async (offerData: CreateOfferPayload): Promise<Offer> => {
  if (API_MODE === 'mock') return mockApi.mockCreateOffer(offerData);
  return fetchApi<Offer>('/api/ofertas', {
    method: 'POST',
    body: offerData,
  });
};

export const updateOffer = async (id: string | number, offerData: Partial<Offer>): Promise<Offer> => {
  if (API_MODE === 'mock') return mockApi.mockUpdateOffer(id, offerData);
  return fetchApi<Offer>(`/api/ofertas/${id}`, {
    method: 'PUT',
    body: offerData,
  });
};

export const deleteOffer = async (id: string | number): Promise<void> => {
  if (API_MODE === 'mock') return mockApi.mockDeleteOffer(id);
  return fetchApi<void>(`/api/ofertas/${id}`, {
    method: 'DELETE',
  });
};

export const addBookToOffer = async (offerId: string | number, libroId: string | number): Promise<void> => {
  if (API_MODE === 'mock') return mockApi.mockAddBookToOffer(offerId, libroId);
  return fetchApi<void>(`/api/ofertas/${offerId}/books/${libroId}`, {
    method: 'POST',
  });
};

export const removeBookFromOffer = async (offerId: string | number, libroId: string | number): Promise<void> => {
  if (API_MODE === 'mock') return mockApi.mockRemoveBookFromOffer(offerId, libroId);
  return fetchApi<void>(`/api/ofertas/${offerId}/books/${libroId}`, {
    method: 'DELETE',
  });
};

export const getBooksForOffer = async (offerId: string | number): Promise<Book[]> => {
  if (API_MODE === 'mock') return mockApi.mockGetBooksForOffer(offerId);
  return fetchApi<Book[]>(`/api/ofertas/${offerId}/books`);
};


// --- Users (Example, not fully implemented in mock or all components) ---
export const registerUser = async (userData: Partial<User>): Promise<User> => {
  // if (API_MODE === 'mock') return mockApi.mockRegisterUser(userData); // TODO: Implement mockRegisterUser
  return fetchApi<User>('/api/auth/register', {
    method: 'POST',
    body: userData,
  });
};

export const getUserProfile = async (userId: string | number): Promise<User> => {
  // if (API_MODE === 'mock') return mockApi.mockGetUserProfile(userId); // TODO: Implement mockGetUserProfile
  return fetchApi<User>(`/api/users/${userId}`);
};

