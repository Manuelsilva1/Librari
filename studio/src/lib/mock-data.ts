
import { formatISO, subDays } from 'date-fns';
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
} from '@/types';

// Mock data stores
let mockBooksStore: Book[] = [
  { id: '1', titulo: 'El Aleph', autor: 'Jorge Luis Borges', isbn: '978-8420633118', precio: 15.99, stock: 10, editorialId: '1', categoriaId: '1', descripcion: 'Una colección de cuentos del maestro argentino.', coverImage: 'https://placehold.co/300x450.png?text=El+Aleph', dateAdded: formatISO(subDays(new Date(), 5)) },
  { id: '2', titulo: 'Cien Años de Soledad', autor: 'Gabriel García Márquez', isbn: '978-0307350438', precio: 18.50, stock: 5, editorialId: '2', categoriaId: '2', descripcion: 'La obra cumbre del realismo mágico.', coverImage: 'https://placehold.co/300x450.png?text=Cien+Años', dateAdded: formatISO(subDays(new Date(), 10)) },
  { id: '3', titulo: 'Ficciones', autor: 'Jorge Luis Borges', isbn: '978-0802130303', precio: 12.75, stock: 15, editorialId: '1', categoriaId: '1', descripcion: 'Otra obra esencial de Borges, llena de laberintos y espejos.', coverImage: 'https://placehold.co/300x450.png?text=Ficciones', dateAdded: formatISO(subDays(new Date(), 15)) },
  { id: '4', titulo: 'Pedro Páramo', autor: 'Juan Rulfo', isbn: '978-0307472215', precio: 14.99, stock: 8, editorialId: '2', categoriaId: '2', descripcion: 'Una obra maestra de la literatura mexicana.', coverImage: 'https://placehold.co/300x450.png?text=Pedro+Paramo', dateAdded: formatISO(subDays(new Date(), 20)) },
  { id: '5', titulo: 'El Señor de los Anillos', autor: 'J.R.R. Tolkien', isbn: '978-84-450-7054-7', precio: 45.25, stock: 12, editorialId: '1', categoriaId: '3', descripcion: 'La épica trilogía de la Tierra Media.', coverImage: 'https://placehold.co/300x450.png?text=El+Señor+de+los+Anillos', dateAdded: formatISO(subDays(new Date(), 25)) },
  { id: '12', titulo: '1984', autor: 'George Orwell', isbn: '978-84-397-2077-8', precio: 35.00, stock: 7, editorialId: '2', categoriaId: '1', descripcion: 'Una distopía clásica sobre el control totalitario.', coverImage: 'https://placehold.co/300x450.png?text=1984', dateAdded: formatISO(subDays(new Date(), 30)) }
];

let mockCategoriesStore: Category[] = [
  { id: '1', nombre: 'Ficción Clásica', descripcion: 'Grandes obras de la ficción clásica.' },
  { id: '2', nombre: 'Realismo Mágico', descripcion: 'Donde la realidad y la fantasía se entrelazan.' },
  { id: '3', nombre: 'Fantasía', descripcion: 'Mundos imaginarios y aventuras épicas.' }
];

let mockEditorialsStore: Editorial[] = [
  { id: '1', nombre: 'Editorial Planeta', sitioWeb: 'https://www.planeta.es' },
  { id: '2', nombre: 'Sudamericana', sitioWeb: 'https://www.penguinlibros.com/ar/sudamericana' }
];

let mockUsersStore: User[] = [
  { id: '1', nombre: 'Admin User', email: 'admin@example.com', rol: 'admin' },
  { id: '2', nombre: 'Cliente Ejemplo', email: 'cliente@example.com', rol: 'cliente' }
];

let mockLoggedInUser: User | null = null;
let mockUserToken: string | null = null;
let mockCartStore: Cart | null = null;

let mockSalesStore: Sale[] = [
  {
    id: '1',
    numeroTicket: 'T001',
    fecha: formatISO(subDays(new Date(), 5)),
    total: 45.98,
    usuarioId: '2',
    paymentMethod: 'card',
    items: [
      {
        id: '1',
        ventaId: '1',
        libroId: '1',
        cantidad: 2,
        precioUnitario: 15.99,
        libro: {
          id: '1',
          titulo: 'El Aleph',
          autor: 'Jorge Luis Borges',
          isbn: '978-8420633118',
          precio: 15.99,
          stock: 10,
          editorialId: '1',
          categoriaId: '1',
          descripcion: 'Una colección de cuentos del maestro argentino.',
          coverImage: 'https://placehold.co/300x450.png?text=El+Aleph',
          dateAdded: formatISO(subDays(new Date(), 5))
        }
      },
      {
        id: '2',
        ventaId: '1',
        libroId: '2',
        cantidad: 1,
        precioUnitario: 18.50,
        libro: {
          id: '2',
          titulo: 'Cien Años de Soledad',
          autor: 'Gabriel García Márquez',
          isbn: '978-0307350438',
          precio: 18.50,
          stock: 5,
          editorialId: '2',
          categoriaId: '2',
          descripcion: 'La obra cumbre del realismo mágico.',
          coverImage: 'https://placehold.co/300x450.png?text=Cien+Años',
          dateAdded: formatISO(subDays(new Date(), 10))
        }
      }
    ]
  },
  {
    id: '2',
    numeroTicket: 'T002',
    fecha: formatISO(subDays(new Date(), 3)),
    total: 31.98,
    usuarioId: '2',
    paymentMethod: 'cash',
    items: [
      {
        id: '3',
        ventaId: '2',
        libroId: '3',
        cantidad: 1,
        precioUnitario: 12.75,
        libro: {
          id: '3',
          titulo: 'Ficciones',
          autor: 'Jorge Luis Borges',
          isbn: '978-0802130303',
          precio: 12.75,
          stock: 15,
          editorialId: '1',
          categoriaId: '1',
          descripcion: 'Otra obra esencial de Borges, llena de laberintos y espejos.',
          coverImage: 'https://placehold.co/300x450.png?text=Ficciones',
          dateAdded: formatISO(subDays(new Date(), 15))
        }
      },
      {
        id: '4',
        ventaId: '2',
        libroId: '4',
        cantidad: 1,
        precioUnitario: 14.99,
        libro: {
          id: '4',
          titulo: 'Pedro Páramo',
          autor: 'Juan Rulfo',
          isbn: '978-0307472215',
          precio: 14.99,
          stock: 8,
          editorialId: '2',
          categoriaId: '2',
          descripcion: 'Una obra maestra de la literatura mexicana.',
          coverImage: 'https://placehold.co/300x450.png?text=Pedro+Paramo',
          dateAdded: formatISO(subDays(new Date(), 20))
        }
      }
    ]
  },
  {
    id: '3',
    numeroTicket: 'T003',
    fecha: formatISO(subDays(new Date(), 1)),
    total: 18.50,
    usuarioId: '2',
    paymentMethod: 'card',
    items: [
      {
        id: '5',
        ventaId: '3',
        libroId: '2',
        cantidad: 1,
        precioUnitario: 18.50,
        libro: {
          id: '2',
          titulo: 'Cien Años de Soledad',
          autor: 'Gabriel García Márquez',
          isbn: '978-0307350438',
          precio: 18.50,
          stock: 5,
          editorialId: '2',
          categoriaId: '2',
          descripcion: 'La obra cumbre del realismo mágico.',
          coverImage: 'https://placehold.co/300x450.png?text=Cien+Años',
          dateAdded: formatISO(subDays(new Date(), 10))
        }
      }
    ]
  },
  {
    id: '4',
    numeroTicket: 'T004',
    fecha: formatISO(subDays(new Date(), 10)),
    total: 62.97,
    usuarioId: '2',
    paymentMethod: 'card',
    items: [
      {
        id: '6',
        ventaId: '4',
        libroId: '1',
        cantidad: 3,
        precioUnitario: 15.99,
        libro: {
          id: '1',
          titulo: 'El Aleph',
          autor: 'Jorge Luis Borges',
          isbn: '978-8420633118',
          precio: 15.99,
          stock: 10,
          editorialId: '1',
          categoriaId: '1',
          descripcion: 'Una colección de cuentos del maestro argentino.',
          coverImage: 'https://placehold.co/300x450.png?text=El+Aleph',
          dateAdded: formatISO(subDays(new Date(), 5))
        }
      },
      {
        id: '7',
        ventaId: '4',
        libroId: '2',
        cantidad: 1,
        precioUnitario: 18.50,
        libro: {
          id: '2',
          titulo: 'Cien Años de Soledad',
          autor: 'Gabriel García Márquez',
          isbn: '978-0307350438',
          precio: 18.50,
          stock: 5,
          editorialId: '2',
          categoriaId: '2',
          descripcion: 'La obra cumbre del realismo mágico.',
          coverImage: 'https://placehold.co/300x450.png?text=Cien+Años',
          dateAdded: formatISO(subDays(new Date(), 10))
        }
      }
    ]
  },
  {
    id: '5',
    numeroTicket: 'T005',
    fecha: formatISO(subDays(new Date(), 15)),
    total: 125.50,
    usuarioId: '2',
    paymentMethod: 'card',
    items: [
      {
        id: '8',
        ventaId: '5',
        libroId: '5',
        cantidad: 2,
        precioUnitario: 45.25,
        libro: {
          id: '5',
          titulo: 'El Señor de los Anillos',
          autor: 'J.R.R. Tolkien',
          isbn: '978-84-450-7054-7',
          precio: 45.25,
          stock: 12,
          editorialId: '1',
          categoriaId: '3',
          descripcion: 'La épica trilogía de la Tierra Media.',
          coverImage: 'https://placehold.co/300x450.png?text=El+Señor+de+los+Anillos',
          dateAdded: formatISO(subDays(new Date(), 25))
        }
      },
      {
        id: '9',
        ventaId: '5',
        libroId: '12',
        cantidad: 1,
        precioUnitario: 35.00,
        libro: {
          id: '12',
          titulo: '1984',
          autor: 'George Orwell',
          isbn: '978-84-397-2077-8',
          precio: 35.00,
          stock: 7,
          editorialId: '2',
          categoriaId: '1',
          descripcion: 'Una distopía clásica sobre el control totalitario.',
          coverImage: 'https://placehold.co/300x450.png?text=1984',
          dateAdded: formatISO(subDays(new Date(), 30))
        }
      }
    ]
  }
];

let mockOffersStore: Offer[] = [];

// Utility functions
const generateId = (): string => Math.random().toString(36).substr(2, 9);

const simulateApiDelay = <T>(data: T): Promise<T> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), Math.random() * 500 + 100);
  });
};

const simulateApiError = (message: string, statusCode: number): ApiResponseError => {
  return {
    message,
    statusCode,
    details: { message, statusCode }
  };
};

// Auth functions
export const mockLoginUser = async (credentials: { email: string; password: string }): Promise<{ token: string; usuario: User }> => {
  const user = mockUsersStore.find(u => u.email === credentials.email);
  if (user) {
    mockLoggedInUser = user;
    mockUserToken = `mock-token-${generateId()}`;
    return simulateApiDelay({
      token: mockUserToken,
      usuario: user
    });
  }
  throw simulateApiError('Invalid credentials', 401);
};

// Books functions
export const mockGetBooks = async (): Promise<Book[]> => {
  return simulateApiDelay([...mockBooksStore]);
};

export const mockGetBookById = async (id: string | number): Promise<Book> => {
  const book = mockBooksStore.find(b => String(b.id) === String(id));
  if (book) return simulateApiDelay(book);
  throw simulateApiError('Book not found', 404);
};

export const mockCreateBook = async (bookData: Partial<Book> & { coverImageFile?: File }): Promise<Book> => {
  const newBook: Book = {
    id: generateId(),
    titulo: bookData.titulo || '',
    autor: bookData.autor || '',
    isbn: bookData.isbn || '',
    precio: bookData.precio || 0,
    stock: bookData.stock || 0,
    editorialId: bookData.editorialId || '',
    categoriaId: bookData.categoriaId || '',
    descripcion: bookData.descripcion || '',
    coverImage: bookData.coverImage || 'https://placehold.co/300x450.png?text=Book',
    dateAdded: formatISO(new Date())
  };
  mockBooksStore.push(newBook);
  return simulateApiDelay(newBook);
};

export const mockUpdateBook = async (id: string | number, bookData: Partial<Book> & { coverImageFile?: File }): Promise<Book> => {
  const index = mockBooksStore.findIndex(b => String(b.id) === String(id));
  if (index !== -1) {
    mockBooksStore[index] = { ...mockBooksStore[index], ...bookData };
    return simulateApiDelay(mockBooksStore[index]);
  }
  throw simulateApiError('Book not found for update', 404);
};

export const mockDeleteBook = async (id: string | number): Promise<void> => {
  mockBooksStore = mockBooksStore.filter(b => String(b.id) !== String(id));
  return simulateApiDelay(undefined);
};

// Categories functions
export const mockGetCategories = async (): Promise<Category[]> => {
  return simulateApiDelay([...mockCategoriesStore]);
};

export const mockGetCategoryById = async (id: string | number): Promise<Category> => {
  const category = mockCategoriesStore.find(c => String(c.id) === String(id));
  if (category) return simulateApiDelay(category);
  throw simulateApiError('Category not found', 404);
};

export const mockCreateCategory = async (categoryData: Partial<Category>): Promise<Category> => {
  const newCategory: Category = {
    id: generateId(),
    nombre: categoryData.nombre || '',
    descripcion: categoryData.descripcion || ''
  };
  mockCategoriesStore.push(newCategory);
  return simulateApiDelay(newCategory);
};

export const mockUpdateCategory = async (id: string | number, categoryData: Partial<Category>): Promise<Category> => {
  const index = mockCategoriesStore.findIndex(c => String(c.id) === String(id));
  if (index !== -1) {
    mockCategoriesStore[index] = { ...mockCategoriesStore[index], ...categoryData };
    return simulateApiDelay(mockCategoriesStore[index]);
  }
  throw simulateApiError('Category not found for update', 404);
};

export const mockDeleteCategory = async (id: string | number): Promise<void> => {
  mockCategoriesStore = mockCategoriesStore.filter(c => String(c.id) !== String(id));
  return simulateApiDelay(undefined);
};

// Editorials functions
export const mockGetEditorials = async (): Promise<Editorial[]> => {
  return simulateApiDelay([...mockEditorialsStore]);
};

export const mockCreateEditorial = async (editorialData: Partial<Editorial>): Promise<Editorial> => {
  const newEditorial: Editorial = {
    id: generateId(),
    nombre: editorialData.nombre || '',
    sitioWeb: editorialData.sitioWeb || ''
  };
  mockEditorialsStore.push(newEditorial);
  return simulateApiDelay(newEditorial);
};

export const mockUpdateEditorial = async (id: string | number, editorialData: Partial<Editorial>): Promise<Editorial> => {
  const index = mockEditorialsStore.findIndex(e => String(e.id) === String(id));
  if (index !== -1) {
    mockEditorialsStore[index] = { ...mockEditorialsStore[index], ...editorialData };
    return simulateApiDelay(mockEditorialsStore[index]);
  }
  throw simulateApiError('Editorial not found for update', 404);
};

export const mockDeleteEditorial = async (id: string | number): Promise<void> => {
  mockEditorialsStore = mockEditorialsStore.filter(e => String(e.id) !== String(id));
  return simulateApiDelay(undefined);
};

// Cart functions
export const mockGetCart = async (): Promise<Cart> => {
  if (!mockCartStore) {
    mockCartStore = {
      id: generateId(),
      usuarioId: mockLoggedInUser?.id || '',
      items: [],
      total: 0
    };
  }
  return simulateApiDelay(mockCartStore);
};

export const mockAddItemToCart = async (item: { libroId: string | number; cantidad: number }): Promise<Cart> => {
  if (!mockCartStore) {
    mockCartStore = {
      id: generateId(),
      usuarioId: mockLoggedInUser?.id || '',
      items: [],
      total: 0
    };
  }

  const existingItem = mockCartStore.items.find(i => String(i.libroId) === String(item.libroId));
  if (existingItem) {
    existingItem.cantidad += item.cantidad;
  } else {
    const book = mockBooksStore.find(b => String(b.id) === String(item.libroId));
    if (book) {
      mockCartStore.items.push({
        id: generateId(),
        libroId: String(item.libroId),
        cantidad: item.cantidad,
        precioUnitario: book.precio,
        libro: book
      });
    }
  }

  mockCartStore.total = mockCartStore.items.reduce((sum, item) => sum + (item.precioUnitario * item.cantidad), 0);
  return simulateApiDelay(mockCartStore);
};

export const mockUpdateCartItem = async (itemId: string | number, updates: { cantidad: number }): Promise<Cart> => {
  if (!mockCartStore) throw simulateApiError('Cart not found', 404);

  const item = mockCartStore.items.find(i => String(i.id) === String(itemId));
  if (item) {
    item.cantidad = updates.cantidad;
    mockCartStore.total = mockCartStore.items.reduce((sum, item) => sum + (item.precioUnitario * item.cantidad), 0);
  }
  return simulateApiDelay(mockCartStore);
};

export const mockRemoveCartItem = async (itemId: string | number): Promise<void> => {
  if (!mockCartStore) throw simulateApiError('Cart not found', 404);

  mockCartStore.items = mockCartStore.items.filter(i => String(i.id) !== String(itemId));
  mockCartStore.total = mockCartStore.items.reduce((sum, item) => sum + (item.precioUnitario * item.cantidad), 0);
  return simulateApiDelay(undefined);
};

// Sales functions
export const mockCreateSale = async (saleData: CreateSalePayload): Promise<Sale> => {
  const newSale: Sale = {
    id: generateId(),
    numeroTicket: saleData.numeroTicket,
    fecha: formatISO(new Date()),
    total: saleData.total,
    usuarioId: saleData.usuarioId,
    items: saleData.items
  };
  mockSalesStore.push(newSale);
  return simulateApiDelay(newSale);
};

export const mockGetNextTicket = async (): Promise<{ nextTicket: number }> => {
  const maxTicket = Math.max(...mockSalesStore.map(s => Number(s.numeroTicket)), 0);
  return simulateApiDelay({ nextTicket: maxTicket + 1 });
};

export const mockGetUserSales = async (): Promise<Sale[]> => {
  return simulateApiDelay([...mockSalesStore]);
};

export const mockGetAdminSales = async (): Promise<Sale[]> => {
  return simulateApiDelay([...mockSalesStore]);
};

export const mockGetAdminSaleById = async (saleId: string | number): Promise<Sale> => {
  const sale = mockSalesStore.find(s => String(s.id) === String(saleId));
  if (sale) return simulateApiDelay(sale);
  throw simulateApiError('Sale not found', 404);
};

export const mockGetAdminSaleInvoice = async (saleId: string | number): Promise<string> => {
  const sale = mockSalesStore.find(s => String(s.id) === String(saleId));
  if (!sale) throw simulateApiError('Sale not found', 404);
  
  // Get customer info (mock data)
  const customer = mockUsersStore.find(u => String(u.id) === String(sale.usuarioId)) || {
    id: 1,
    nombre: 'Cliente Ejemplo',
    email: 'cliente@example.com'
  };

  // Get book details for items
  const itemsWithDetails = sale.items.map(item => {
    const book = item.libro || mockBooksStore.find(b => String(b.id) === String(item.libroId));
    return {
      ...item,
      book: book || {
        id: item.libroId,
        titulo: `Libro ID: ${item.libroId}`,
        autor: 'Autor Desconocido',
        isbn: 'N/A'
      }
    };
  });

  const invoiceData = {
    id: sale.id,
    numeroTicket: sale.numeroTicket,
    fecha: sale.fecha,
    metodoPago: sale.paymentMethod || 'Tarjeta de crédito',
    total: sale.total,
    customer: {
      id: customer.id,
      username: customer.nombre,
      email: customer.email
    },
    items: itemsWithDetails.map(item => ({
      id: item.id,
      book: item.book,
      cantidad: item.cantidad,
      precioUnitario: item.precioUnitario,
      subtotal: item.precioUnitario * item.cantidad
    })),
    status: 'COMPLETED',
    currency: 'USD'
  };

  return generateBeautifulInvoice(invoiceData);
};

function generateBeautifulInvoice(data: any): string {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-US', {
      style: 'currency',
      currency: data.currency || 'USD'
    }).format(amount);
  };

  return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Factura #${data.numeroTicket} - Librari</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f8f9fa;
        }
        
        .invoice-container {
            max-width: 800px;
            margin: 20px auto;
            background: white;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
            border-radius: 12px;
            overflow: hidden;
        }
        
        .invoice-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px;
            text-align: center;
        }
        
        .invoice-header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
            font-weight: 300;
        }
        
        .invoice-header .subtitle {
            font-size: 1.2em;
            opacity: 0.9;
        }
        
        .invoice-content {
            padding: 40px;
        }
        
        .invoice-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
            margin-bottom: 40px;
            padding: 30px;
            background: #f8f9fa;
            border-radius: 8px;
        }
        
        .info-section h3 {
            color: #667eea;
            margin-bottom: 15px;
            font-size: 1.1em;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .info-section p {
            margin-bottom: 8px;
            color: #555;
        }
        
        .info-section .highlight {
            font-weight: bold;
            color: #333;
        }
        
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin: 30px 0;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .items-table th {
            background: #667eea;
            color: white;
            padding: 15px;
            text-align: left;
            font-weight: 500;
        }
        
        .items-table td {
            padding: 15px;
            border-bottom: 1px solid #eee;
        }
        
        .items-table tr:hover {
            background: #f8f9fa;
        }
        
        .items-table .book-title {
            font-weight: 500;
            color: #333;
        }
        
        .items-table .book-author {
            font-size: 0.9em;
            color: #666;
            margin-top: 4px;
        }
        
        .items-table .quantity {
            text-align: center;
            font-weight: 500;
        }
        
        .items-table .price {
            text-align: right;
            font-weight: 500;
        }
        
        .items-table .subtotal {
            text-align: right;
            font-weight: bold;
            color: #667eea;
        }
        
        .total-section {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 8px;
            text-align: right;
        }
        
        .total-section h2 {
            font-size: 1.8em;
            margin-bottom: 10px;
        }
        
        .total-section .total-amount {
            font-size: 2.5em;
            font-weight: bold;
        }
        
        .footer {
            background: #f8f9fa;
            padding: 30px 40px;
            text-align: center;
            color: #666;
            border-top: 1px solid #eee;
        }
        
        .footer .logo {
            font-size: 1.5em;
            font-weight: bold;
            color: #667eea;
            margin-bottom: 10px;
        }
        
        .footer .tagline {
            font-style: italic;
            margin-bottom: 15px;
        }
        
        .footer .contact {
            font-size: 0.9em;
        }
        
        .status-badge {
            display: inline-block;
            background: #28a745;
            color: white;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 0.9em;
            font-weight: 500;
            text-transform: uppercase;
        }
        
        @media print {
            body {
                background: white;
            }
            .invoice-container {
                box-shadow: none;
                margin: 0;
            }
        }
    </style>
</head>
<body>
    <div class="invoice-container">
        <div class="invoice-header">
            <h1>FACTURA</h1>
            <div class="subtitle">Librari - Tu librería de confianza</div>
        </div>
        
        <div class="invoice-content">
            <div class="invoice-info">
                <div class="info-section">
                    <h3>Información de la Factura</h3>
                    <p><strong>Número de Factura:</strong> #${data.numeroTicket}</p>
                    <p><strong>Fecha:</strong> ${formatDate(data.fecha)}</p>
                    <p><strong>Estado:</strong> <span class="status-badge">${data.status}</span></p>
                    <p><strong>Método de Pago:</strong> ${data.metodoPago}</p>
                </div>
                
                <div class="info-section">
                    <h3>Información del Cliente</h3>
                    <p><strong>Cliente:</strong> ${data.customer.username}</p>
                    <p><strong>Email:</strong> ${data.customer.email}</p>
                    <p><strong>ID Cliente:</strong> ${data.customer.id}</p>
                </div>
            </div>
            
            <table class="items-table">
                <thead>
                    <tr>
                        <th>Producto</th>
                        <th style="text-align: center;">Cantidad</th>
                        <th style="text-align: right;">Precio Unitario</th>
                        <th style="text-align: right;">Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.items.map((item: any) => `
                        <tr>
                            <td>
                                <div class="book-title">${item.book.titulo}</div>
                                <div class="book-author">por ${item.book.autor}</div>
                                <div style="font-size: 0.8em; color: #999; margin-top: 4px;">ISBN: ${item.book.isbn}</div>
                            </td>
                            <td class="quantity">${item.cantidad}</td>
                            <td class="price">${formatCurrency(item.precioUnitario)}</td>
                            <td class="subtotal">${formatCurrency(item.subtotal)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            
            <div class="total-section">
                <h2>Total de la Compra</h2>
                <div class="total-amount">${formatCurrency(data.total)}</div>
            </div>
        </div>
        
        <div class="footer">
            <div class="logo">📚 Librari</div>
            <div class="tagline">"Donde las historias cobran vida"</div>
            <div class="contact">
                <p>Gracias por tu compra</p>
                <p>Para consultas: contacto@librari.com</p>
                <p>© 2024 Librari. Todos los derechos reservados.</p>
            </div>
        </div>
    </div>
</body>
</html>
  `;
}

// Offers functions
export const mockGetOffers = async (): Promise<Offer[]> => {
  return simulateApiDelay([...mockOffersStore]);
};

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

// Customer functions
export const mockGetCustomers = async (): Promise<User[]> => {
  return simulateApiDelay([...mockUsersStore]);
};

export const mockCreateCustomer = async (userData: Partial<User>): Promise<User> => {
  const newUser: User = {
    id: generateId(),
    nombre: userData.nombre || '',
    email: userData.email || '',
    rol: userData.rol || 'cliente'
  };
  mockUsersStore.push(newUser);
  return simulateApiDelay(newUser);
};

export const mockUpdateCustomer = async (id: string | number, userData: Partial<User>): Promise<User> => {
  const index = mockUsersStore.findIndex(u => String(u.id) === String(id));
  if (index !== -1) {
    mockUsersStore[index] = { ...mockUsersStore[index], ...userData };
    return simulateApiDelay(mockUsersStore[index]);
  }
  throw simulateApiError('Customer not found for update', 404);
};

export const mockDeleteCustomer = async (id: string | number): Promise<void> => {
  mockUsersStore = mockUsersStore.filter(u => String(u.id) !== String(id));
  return simulateApiDelay(undefined);
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
