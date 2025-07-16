
import type { Book, Category, Editorial, User, Cart, CartItem, Sale, SaleItem, Offer, CreateSalePayload, CreateOfferPayload, ApiResponseError } from '@/types';
import { subDays, formatISO } from 'date-fns';

// In-memory store for mock data
let mockBooksStore: Book[] = [
  { id: '1', titulo: 'El Aleph', autor: 'Jorge Luis Borges', isbn: '978-8420633118', precio: 15.99, stock: 10, editorialId: '1', categoriaId: '1', descripcion: 'Una colección de cuentos del maestro argentino.', coverImage: 'https://placehold.co/300x450.png?text=El+Aleph', dateAdded: formatISO(subDays(new Date(), 5)) },
  { id: '2', titulo: 'Cien Años de Soledad', autor: 'Gabriel García Márquez', isbn: '978-0307350438', precio: 18.50, stock: 5, editorialId: '2', categoriaId: '2', descripcion: 'La obra cumbre del realismo mágico.', coverImage: 'https://placehold.co/300x450.png?text=Cien+Años', dateAdded: formatISO(subDays(new Date(), 10)) },
  { id: '3', titulo: 'Ficciones', autor: 'Jorge Luis Borges', isbn: '978-0802130303', precio: 12.75, stock: 15, editorialId: '1', categoriaId: '1', descripcion: 'Otra obra esencial de Borges, llena de laberintos y espejos.', coverImage: 'https://placehold.co/300x450.png?text=Ficciones', dateAdded: formatISO(subDays(new Date(), 2)) },
  { id: '4', titulo: 'La Casa de los Espíritus', autor: 'Isabel Allende', isbn: '978-0525562620', precio: 16.20, stock: 8, editorialId: '3', categoriaId: '2', descripcion: 'Una saga familiar épica con elementos de realismo mágico.', coverImage: 'https://placehold.co/300x450.png?text=Casa+Espiritus', dateAdded: formatISO(subDays(new Date(), 20)) },
  { id: '5', titulo: 'Rayuela', autor: 'Julio Cortázar', isbn: '978-8466326540', precio: 19.00, stock: 3, editorialId: '2', categoriaId: '3', descripcion: 'Una novela experimental que invita a múltiples lecturas.', coverImage: 'https://placehold.co/300x450.png?text=Rayuela', dateAdded: formatISO(subDays(new Date(), 30)) },
];

let mockCategoriesStore: Category[] = [
  { id: '1', nombre: 'Ficción Clásica', descripcion: 'Grandes obras de la ficción clásica.' },
  { id: '2', nombre: 'Realismo Mágico', descripcion: 'Donde la realidad y la fantasía se entrelazan.' },
  { id: '3', nombre: 'Novela Experimental', descripcion: 'Narrativas que desafían las convenciones.' },
];

let mockEditorialsStore: Editorial[] = [
  { id: '1', nombre: 'Editorial Planeta', sitioWeb: 'https://www.planeta.es', rut: '11.111.111-1', celular: '912345678' },
  { id: '2', nombre: 'Sudamericana', sitioWeb: 'https://www.penguinlibros.com/ar/sudamericana', rut: '22.222.222-2', celular: '923456789' },
  { id: '3', nombre: 'Alfaguara', sitioWeb: 'https://www.penguinlibros.com/es/alfaguara', rut: '33.333.333-3', celular: '934567890' },
];

let mockUsersStore: User[] = [
  { id: '1', nombre: 'Admin User', email: 'admin@example.com', rol: 'admin' },
  { id: '2', nombre: 'Cliente Ejemplo', email: 'cliente@example.com', rol: 'cliente' },
];
let mockLoggedInUser: User | null = null;
let mockUserToken: string | null = null;

let mockCartStore: Cart | null = null;

let mockSalesStore: Sale[] = [];
let mockOffersStore: Offer[] = [];

// --- Helper functions ---
const generateId = () => String(Date.now() + Math.random());

const simulateApiDelay = <T>(data: T, delay: number = 300): Promise<T> => {
  return new Promise(resolve => setTimeout(() => resolve(data), delay));
};

const simulateApiError = (message: string, statusCode: number = 500): ApiResponseError => {
  return { message, statusCode };
};


// --- Mock Service Functions ---

// Auth
export const mockLoginUser = async (credentials: { email: string; password: string }): Promise<{ token: string; usuario: User }> => {
  const user = mockUsersStore.find(u => u.email === credentials.email); // Simplified: no password check
  if (user) {
    mockLoggedInUser = user;
    mockUserToken = `mock-token-${user.id}-${Date.now()}`;
    return simulateApiDelay({ token: mockUserToken, usuario: user });
  }
  throw simulateApiError('Invalid credentials', 401);
};

// Customers CRUD
export const mockGetCustomers = async (): Promise<User[]> => simulateApiDelay([...mockUsersStore]);

export const mockCreateCustomer = async (userData: Partial<User>): Promise<User> => {
  const newUser: User = { id: generateId(), nombre: userData.nombre || 'Nuevo Cliente', email: userData.email || '', rol: 'cliente', activo: userData.activo ?? true, fechaRegistro: new Date().toISOString(), ...userData };
  mockUsersStore.push(newUser);
  return simulateApiDelay(newUser);
};

export const mockUpdateCustomer = async (id: string | number, userData: Partial<User>): Promise<User> => {
  const index = mockUsersStore.findIndex(u => String(u.id) === String(id));
  if (index !== -1) {
    mockUsersStore[index] = { ...mockUsersStore[index], ...userData };
    return simulateApiDelay(mockUsersStore[index]);
  }
  throw simulateApiError('User not found', 404);
};

export const mockDeleteCustomer = async (id: string | number): Promise<void> => {
  mockUsersStore = mockUsersStore.filter(u => String(u.id) !== String(id));
  return simulateApiDelay(undefined);
};

// Books
export const mockGetBooks = async (): Promise<Book[]> => simulateApiDelay([...mockBooksStore]);

export const mockGetBookById = async (id: string | number): Promise<Book> => {
  const book = mockBooksStore.find(b => String(b.id) === String(id));
  if (book) return simulateApiDelay(book);
  throw simulateApiError('Book not found', 404);
};

export const mockCreateBook = async (bookData: Partial<Book>): Promise<Book> => {
  const newBook: Book = {
    id: generateId(),
    titulo: bookData.titulo || 'Sin Título',
    autor: bookData.autor || 'Anónimo',
    precio: bookData.precio || 0,
    stock: bookData.stock || 0,
    editorialId: bookData.editorialId || '',
    categoriaId: bookData.categoriaId || '',
    descripcion: bookData.descripcion || '',
    coverImage: bookData.coverImage || 'https://placehold.co/300x450.png',
    dateAdded: formatISO(new Date()),
    ...bookData,
  };
  mockBooksStore.unshift(newBook);
  return simulateApiDelay(newBook);
};

export const mockUpdateBook = async (id: string | number, bookData: Partial<Book>): Promise<Book> => {
  const index = mockBooksStore.findIndex(b => String(b.id) === String(id));
  if (index !== -1) {
    mockBooksStore[index] = { ...mockBooksStore[index], ...bookData };
    return simulateApiDelay(mockBooksStore[index]);
  }
  throw simulateApiError('Book not found for update', 404);
};

export const mockDeleteBook = async (id: string | number): Promise<void> => {
  const initialLength = mockBooksStore.length;
  mockBooksStore = mockBooksStore.filter(b => String(b.id) !== String(id));
  if (mockBooksStore.length === initialLength) {
    throw simulateApiError('Book not found for deletion', 404);
  }
  return simulateApiDelay(undefined);
};

// Categories
export const mockGetCategories = async (): Promise<Category[]> => simulateApiDelay([...mockCategoriesStore]);
export const mockCreateCategory = async (catData: Partial<Category>): Promise<Category> => {
  const newCategory: Category = { id: generateId(), nombre: catData.nombre || 'Nueva Categoría', ...catData };
  mockCategoriesStore.push(newCategory);
  return simulateApiDelay(newCategory);
};
export const mockUpdateCategory = async (id: string | number, catData: Partial<Category>): Promise<Category> => {
  const index = mockCategoriesStore.findIndex(c => String(c.id) === String(id));
  if (index !== -1) {
    mockCategoriesStore[index] = { ...mockCategoriesStore[index], ...catData };
    return simulateApiDelay(mockCategoriesStore[index]);
  }
  throw simulateApiError('Category not found', 404);
};
export const mockDeleteCategory = async (id: string | number): Promise<void> => {
  mockCategoriesStore = mockCategoriesStore.filter(c => String(c.id) !== String(id));
  return simulateApiDelay(undefined);
};

// Editorials
export const mockGetEditorials = async (): Promise<Editorial[]> => simulateApiDelay([...mockEditorialsStore]);
export const mockCreateEditorial = async (editData: Partial<Editorial>): Promise<Editorial> => {
  const newEditorial: Editorial = { id: generateId(), nombre: editData.nombre || 'Nueva Editorial', ...editData };
  mockEditorialsStore.push(newEditorial);
  return simulateApiDelay(newEditorial);
};
export const mockUpdateEditorial = async (id: string | number, editData: Partial<Editorial>): Promise<Editorial> => {
  const index = mockEditorialsStore.findIndex(e => String(e.id) === String(id));
  if (index !== -1) {
    mockEditorialsStore[index] = { ...mockEditorialsStore[index], ...editData };
    return simulateApiDelay(mockEditorialsStore[index]);
  }
  throw simulateApiError('Editorial not found', 404);
};
export const mockDeleteEditorial = async (id: string | number): Promise<void> => {
  mockEditorialsStore = mockEditorialsStore.filter(e => String(e.id) !== String(id));
  return simulateApiDelay(undefined);
};

// Cart
const recalculateCartTotal = () => {
  if (mockCartStore) {
    mockCartStore.total = mockCartStore.items.reduce((sum, item) => sum + item.precioUnitario * item.cantidad, 0);
  }
};

export const mockGetCart = async (): Promise<Cart> => {
  if (!mockLoggedInUser) throw simulateApiError("User not authenticated for cart", 401);
  if (!mockCartStore) {
    mockCartStore = { usuarioId: mockLoggedInUser.id, items: [], total: 0 };
  }
  return simulateApiDelay({ ...mockCartStore });
};

export const mockAddItemToCart = async (item: { libroId: string | number; cantidad: number }): Promise<Cart> => {
  if (!mockLoggedInUser) throw simulateApiError("User not authenticated", 401);
  await mockGetCart(); // Ensure cart is initialized
  const book = mockBooksStore.find(b => String(b.id) === String(item.libroId));
  if (!book) throw simulateApiError("Book not found to add to cart", 404);

  const existingItemIndex = mockCartStore!.items.findIndex(i => String(i.libroId) === String(item.libroId));
  if (existingItemIndex > -1) {
    mockCartStore!.items[existingItemIndex].cantidad += item.cantidad;
  } else {
    mockCartStore!.items.push({
      id: generateId(),
      libroId: item.libroId,
      cantidad: item.cantidad,
      precioUnitario: book.precio,
      libro: book,
    });
  }
  recalculateCartTotal();
  return simulateApiDelay({ ...mockCartStore! });
};

export const mockUpdateCartItem = async (itemId: string | number, updates: { cantidad: number }): Promise<Cart> => {
  if (!mockLoggedInUser || !mockCartStore) throw simulateApiError("Cart not found or user not auth", 404);
  const itemIndex = mockCartStore.items.findIndex(i => String(i.id) === String(itemId));
  if (itemIndex > -1) {
    mockCartStore.items[itemIndex].cantidad = updates.cantidad;
    if (mockCartStore.items[itemIndex].cantidad <= 0) {
      mockCartStore.items.splice(itemIndex, 1);
    }
    recalculateCartTotal();
    return simulateApiDelay({ ...mockCartStore });
  }
  throw simulateApiError("Cart item not found", 404);
};

export const mockRemoveCartItem = async (itemId: string | number): Promise<void> => { // API spec says void, but CartProvider expects Cart. Let's return Cart.
  if (!mockLoggedInUser || !mockCartStore) throw simulateApiError("Cart not found or user not auth", 404);
  mockCartStore.items = mockCartStore.items.filter(i => String(i.id) !== String(itemId));
  recalculateCartTotal();
  // return simulateApiDelay({ ...mockCartStore });
  return simulateApiDelay(undefined); // Matching current service/api.ts type
};

// Sales
export const mockCreateSale = async (saleData: CreateSalePayload): Promise<Sale> => {
  if (!mockLoggedInUser) throw simulateApiError("User not authenticated", 401);
  let totalAmount = 0;
  const saleItems: SaleItem[] = [];

  for (const itemPayload of saleData.items) {
    const book = mockBooksStore.find(b => String(b.id) === String(itemPayload.libroId));
    if (!book || book.stock < itemPayload.cantidad) {
      throw simulateApiError(`Book ${itemPayload.libroId} not available or insufficient stock`, 400);
    }
    book.stock -= itemPayload.cantidad; // Deduct stock
    saleItems.push({
      id: generateId(),
      libroId: itemPayload.libroId,
      cantidad: itemPayload.cantidad,
      precioUnitario: itemPayload.precioUnitario,
      // libro: book, // API SaleItem doesn't include full book
    });
    totalAmount += itemPayload.cantidad * itemPayload.precioUnitario;
  }

  const newSale: Sale = {
    id: generateId(),
    numeroTicket: saleData.numeroTicket,
    usuarioId: saleData.usuarioId ?? mockLoggedInUser.id,
    fecha: new Date().toISOString(),
    total: totalAmount,
    items: saleItems,
    // paymentMethod: saleData.paymentMethod, // Assuming paymentMethod might be part of Sale type in future
  };
  mockSalesStore.unshift(newSale);
  mockCartStore = null; // Clear cart after sale
  return simulateApiDelay(newSale);
};

export const mockGetNextTicket = async (): Promise<{ nextTicket: number }> => {
  const last = mockSalesStore[0];
  const nextTicket = last ? (last.numeroTicket + 1) : 1;
  return simulateApiDelay({ nextTicket });
};

export const mockGetUserSales = async (): Promise<Sale[]> => {
  if (!mockLoggedInUser) return simulateApiDelay([]);
  const userSales = mockSalesStore.filter(s => String(s.usuarioId) === String(mockLoggedInUser!.id));
  return simulateApiDelay(userSales);
};

export const mockGetAdminSales = async (): Promise<Sale[]> => simulateApiDelay([...mockSalesStore]);

export const mockGetAdminSaleById = async (saleId: string | number): Promise<Sale> => {
  const sale = mockSalesStore.find(s => String(s.id) === String(saleId));
  if (sale) return simulateApiDelay(sale);
  throw simulateApiError('Sale not found', 404);
};

export const mockGetAdminSaleInvoice = async (saleId: string | number): Promise<string> => {
  const sale = mockSalesStore.find(s => String(s.id) === String(saleId));
  if (!sale) throw simulateApiError('Sale not found', 404);
  const html = `<html><body><h1>Invoice #${sale.numeroTicket}</h1></body></html>`;
  return simulateApiDelay(html);
};

// Offers
export const mockGetOffers = async (): Promise<Offer[]> => simulateApiDelay([...mockOffersStore]);

export const mockGetOfferById = async (id: string | number): Promise<Offer> => {
  const offer = mockOffersStore.find(o => String(o.id) === String(id));
  if (offer) return simulateApiDelay(offer);
  throw simulateApiError('Offer not found', 404);
};

export const mockCreateOffer = async (offerData: CreateOfferPayload): Promise<Offer> => {
  const newOffer: Offer = {
    id: generateId(),
    ...offerData,
    libroIds: offerData.libroIds || [],
  };
  mockOffersStore.push(newOffer);
  return simulateApiDelay(newOffer);
};

export const mockUpdateOffer = async (id: string | number, offerData: Partial<Offer>): Promise<Offer> => {
  const index = mockOffersStore.findIndex(o => String(o.id) === String(id));
  if (index !== -1) {
    mockOffersStore[index] = { ...mockOffersStore[index], ...offerData };
    return simulateApiDelay(mockOffersStore[index]);
  }
  throw simulateApiError('Offer not found for update', 404);
};

export const mockDeleteOffer = async (id: string | number): Promise<void> => {
  mockOffersStore = mockOffersStore.filter(o => String(o.id) !== String(id));
  return simulateApiDelay(undefined);
};

export const mockAddBookToOffer = async (offerId: string | number, libroId: string | number): Promise<void> => {
  const offer = mockOffersStore.find(o => String(o.id) === String(offerId));
  if (!offer) throw simulateApiError('Offer not found', 404);
  if (!mockBooksStore.find(b => String(b.id) === String(libroId))) throw simulateApiError('Book not found', 404);
  
  if (!offer.libroIds) offer.libroIds = [];
  if (!offer.libroIds.includes(String(libroId))) {
    offer.libroIds.push(String(libroId));
  }
  return simulateApiDelay(undefined);
};

export const mockRemoveBookFromOffer = async (offerId: string | number, libroId: string | number): Promise<void> => {
  const offer = mockOffersStore.find(o => String(o.id) === String(offerId));
  if (offer && offer.libroIds) {
    offer.libroIds = offer.libroIds.filter(id => String(id) !== String(libroId));
  }
  return simulateApiDelay(undefined);
};

export const mockGetBooksForOffer = async (offerId: string | number): Promise<Book[]> => {
  const offer = mockOffersStore.find(o => String(o.id) === String(offerId));
  if (!offer || !offer.libroIds) return simulateApiDelay([]);
  const books = mockBooksStore.filter(book => offer.libroIds!.includes(String(book.id)));
  return simulateApiDelay(books);
};

// Function to reset all mock data (useful for testing)
export const resetAllMockData = () => {
  mockBooksStore = [
    { id: '1', titulo: 'El Aleph', autor: 'Jorge Luis Borges', isbn: '978-8420633118', precio: 15.99, stock: 10, editorialId: '1', categoriaId: '1', descripcion: 'Una colección de cuentos del maestro argentino.', coverImage: 'https://placehold.co/300x450.png?text=El+Aleph', dateAdded: formatISO(subDays(new Date(), 5)) },
    { id: '2', titulo: 'Cien Años de Soledad', autor: 'Gabriel García Márquez', isbn: '978-0307350438', precio: 18.50, stock: 5, editorialId: '2', categoriaId: '2', descripcion: 'La obra cumbre del realismo mágico.', coverImage: 'https://placehold.co/300x450.png?text=Cien+Años', dateAdded: formatISO(subDays(new Date(), 10)) },
  ];
  mockCategoriesStore = [
    { id: '1', nombre: 'Ficción Clásica', descripcion: 'Grandes obras de la ficción clásica.' },
    { id: '2', nombre: 'Realismo Mágico', descripcion: 'Donde la realidad y la fantasía se entrelazan.' },
  ];
  mockEditorialsStore = [
    { id: '1', nombre: 'Editorial Planeta', sitioWeb: 'https://www.planeta.es' },
    { id: '2', nombre: 'Sudamericana', sitioWeb: 'https://www.penguinlibros.com/ar/sudamericana' },
  ];
  mockUsersStore = [
    { id: '1', nombre: 'Admin User', email: 'admin@example.com', rol: 'admin' },
    { id: '2', nombre: 'Cliente Ejemplo', email: 'cliente@example.com', rol: 'cliente' },
  ];
  mockLoggedInUser = null;
  mockUserToken = null;
  mockCartStore = null;
  mockSalesStore = [];
  mockOffersStore = [];
};
