
import { getAuthHeaders, dispatchLogoutEvent } from '@/lib/auth-utils';
import type {
  Book,
  Category,
  Editorial,
  User,
  Cart,
  Sale,
  Offer,
  CreateSalePayload,
  CreateOfferPayload,
  ApiResponseError,
  DashboardStats,
  Pedido,
  CreatePedidoPayload,
} from '@/types';

// Import mock functions
import * as mockApi from '@/lib/mock-data';

// Fallback to empty string so fetch uses a relative URL when the env variable
// is not defined. This avoids runtime errors like `API call failed: {}` when
// `NEXT_PUBLIC_API_BASE_URL` is missing during local development.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';
// Correctly use the environment variable or default to 'production'
const API_MODE = process.env.NEXT_PUBLIC_API_MODE || 'production'; 

interface FetchApiOptions extends RequestInit {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body?: any; 
}

async function fetchApi<T>(endpoint: string, options: FetchApiOptions = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const authHeaders = await getAuthHeaders();

  const headers: Record<string, string> = {
    ...authHeaders,
    ...(options.headers as Record<string, string> | undefined),
  };

  const config: RequestInit = {
    ...options,
    headers,
  };

  if (options.body instanceof FormData) {
    config.body = options.body;
    // Let the browser set the correct Content-Type for FormData
  } else if (options.body && typeof options.body !== 'string') {
    headers['Content-Type'] = 'application/json';
    config.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(url, config);

    if (response.status === 401) {
      dispatchLogoutEvent();
    }

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

async function fetchApiText(endpoint: string, options: FetchApiOptions = {}): Promise<string> {
  const url = `${API_BASE_URL}${endpoint}`;
  const authHeaders = await getAuthHeaders();

  const headers: Record<string, string> = {
    ...authHeaders,
    ...(options.headers as Record<string, string> | undefined),
  };

  const config: RequestInit = {
    ...options,
    headers,
  };

  if (options.body && typeof options.body !== 'string') {
    headers['Content-Type'] = 'application/json';
    config.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(url, config);

    if (response.status === 401) {
      dispatchLogoutEvent();
    }

    if (!response.ok) {
      const message = await response.text();
      const error: ApiResponseError = {
        message: message || 'API request failed',
        statusCode: response.status,
      };
      throw error;
    }

    return await response.text();
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
export const getBooks = async (
  params: Record<string, any> = {},      // page, size, sort, etc.
): Promise<Book[]> => {
  if (API_MODE === 'mock') {
    return mockApi.mockGetBooks();       // asegúrate de que esto retorna Book[]
  }

  if (params.page !== undefined || params.size !== undefined) {
    const query = new URLSearchParams(params).toString();
    const pageData = await fetchApi<Page<Book>>(`/api/books${query ? '?' + query : ''}`);
    return pageData.content;
  }

  const firstPage = await fetchApi<Page<Book>>('/api/books');
  let books = [...firstPage.content];
  for (let p = 1; p < firstPage.totalPages; p++) {
    const query = new URLSearchParams({ ...params, page: p, size: firstPage.size }).toString();
    const nextPage = await fetchApi<Page<Book>>(`/api/books?${query}`);
    books = books.concat(nextPage.content);
  }
  return books;
};

interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}

export const getBookById = async (id: string | number): Promise<Book> => {
  if (API_MODE === 'mock') return mockApi.mockGetBookById(id);
  return fetchApi<Book>(`/api/books/${id}`);
};

export const createBook = async (
  bookData: Partial<Book> & { coverImageFile?: File }
): Promise<Book> => {
  if (API_MODE === 'mock') return mockApi.mockCreateBook(bookData);
  const form = new FormData();
  Object.entries(bookData).forEach(([key, value]) => {
    if (key === 'coverImageFile') {
      if (value) form.append('coverImageFile', value as File);
    } else if (value !== undefined && value !== null) {
      form.append(key, String(value));
    }
  });
  return fetchApi<Book>('/api/books', {
    method: 'POST',
    body: form,
  });
};

export const updateBook = async (
  id: string | number,
  bookData: Partial<Book> & { coverImageFile?: File }
): Promise<Book> => {
  if (API_MODE === 'mock') return mockApi.mockUpdateBook(id, bookData);
  const form = new FormData();
  Object.entries(bookData).forEach(([key, value]) => {
    if (key === 'coverImageFile') {
      if (value) form.append('coverImageFile', value as File);
    } else if (value !== undefined && value !== null) {
      form.append(key, String(value));
    }
  });
  return fetchApi<Book>(`/api/books/${id}`, {
    method: 'PUT',
    body: form,
  });
};

export const deleteBook = async (id: string | number): Promise<void> => {
  if (API_MODE === 'mock') return mockApi.mockDeleteBook(id);
  return fetchApi<void>(`/api/books/${id}`, {
    method: 'DELETE',
  });
};

// --- Categories ---
export const getCategories = async (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params: Record<string, any> = {},
): Promise<Category[]> => {
  if (API_MODE === 'mock') return mockApi.mockGetCategories();

  if (params.page !== undefined || params.size !== undefined) {
    const query = new URLSearchParams(params).toString();
    const pageData = await fetchApi<Page<Category>>(
      `/api/categorias${query ? '?' + query : ''}`,
    );
    return pageData.content;
  }

  const firstPage = await fetchApi<Page<Category>>('/api/categorias');
  let categories = [...firstPage.content];
  for (let p = 1; p < firstPage.totalPages; p++) {
    const query = new URLSearchParams({ ...params, page: p, size: firstPage.size }).toString();
    const nextPage = await fetchApi<Page<Category>>(`/api/categorias?${query}`);
    categories = categories.concat(nextPage.content);
  }
  return categories;
};

export const getCategoryById = async (id: string | number): Promise<Category> => {
  if (API_MODE === 'mock') return mockApi.mockGetCategoryById(id);
  return fetchApi<Category>(`/api/categorias/${id}`);
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
export const getEditorials = async (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params: Record<string, any> = {},
): Promise<Editorial[]> => {
  if (API_MODE === 'mock') return mockApi.mockGetEditorials();

  const query = new URLSearchParams(params).toString();
  const page: Page<Editorial> = await fetchApi<Page<Editorial>>(
    `/api/editoriales${query ? '?' + query : ''}`,
  );

  return page.content;
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

export const getNextTicket = async (): Promise<{ nextTicket: number }> => {
  if (API_MODE === 'mock') return mockApi.mockGetNextTicket();
  return fetchApi<{ nextTicket: number }>('/api/ventas/next-ticket');
};

export const getUserSales = async (page = 0, size = 10): Promise<Sale[]> => {
  if (API_MODE === 'mock') return mockApi.mockGetUserSales();
  const params = new URLSearchParams({ page: String(page), size: String(size) });
  return fetchApi<Sale[]>(`/api/ventas?${params.toString()}`);
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

// --- Orders ---
export const createPedido = async (payload: CreatePedidoPayload): Promise<Pedido> => {
  return fetchApi<Pedido>('/api/pedidos', {
    method: 'POST',
    body: payload,
  });
};

export const getAdminPedidos = async (): Promise<Pedido[]> => {
  return fetchApi<Pedido[]>('/api/pedidos');
};

export const updatePedidoStatus = async (id: string | number, status: string): Promise<Pedido> => {
  return fetchApi<Pedido>(`/api/pedidos/${id}/status`, {
    method: 'PUT',
    body: { status },
  });
};

export const getAdminSaleInvoice = async (saleId: string | number): Promise<string> => {
  if (API_MODE === 'mock') return mockApi.mockGetAdminSaleInvoice(saleId);
  return fetchApiText(`/api/ventas/admin/${saleId}/invoice`, { headers: { Accept: 'text/html' } });
};

export const getDashboardStats = async (): Promise<DashboardStats> => {
  if (API_MODE === 'mock') {
    return {
      booksCount: 125,
      totalSales: 1234.56,
      salesPercentageChange: 10.2,
      usersCount: 78,
      newUsersThisWeek: 5,
    };
  }
  return fetchApi<DashboardStats>('/api/admin/stats');
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

// --- Customers Management ---
export const getCustomers = async (): Promise<User[]> => {
  if (API_MODE === 'mock') return mockApi.mockGetCustomers();
  return fetchApi<User[]>('/api/users');
};

export const createCustomer = async (userData: Partial<User>): Promise<User> => {
  if (API_MODE === 'mock') return mockApi.mockCreateCustomer(userData);
  return fetchApi<User>('/api/users', {
    method: 'POST',
    body: userData,
  });
};

export const updateCustomer = async (id: string | number, userData: Partial<User>): Promise<User> => {
  if (API_MODE === 'mock') return mockApi.mockUpdateCustomer(id, userData);
  return fetchApi<User>(`/api/users/${id}`, {
    method: 'PUT',
    body: userData,
  });
};

export const deleteCustomer = async (id: string | number): Promise<void> => {
  if (API_MODE === 'mock') return mockApi.mockDeleteCustomer(id);
  return fetchApi<void>(`/api/users/${id}`, { method: 'DELETE' });
};

