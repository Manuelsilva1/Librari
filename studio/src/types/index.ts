// Core API Data Structures

export interface User {
  id: number | string; // Assuming ID can be number or string from DB
  nombre: string;
  email: string;
  rol: 'admin' | 'cliente' | string; // Role can be specific or a general string
  // Add other fields as necessary, e.g., password (though typically not sent to client), createdAt, etc.
}

export interface Editorial {
  id: number | string;
  nombre: string;
  sitioWeb?: string; // Optional as per original, but good to have
  rut?: string;
  celular?: string;
  // The following fields were in the original type, keeping them commented for now
  // contactPerson?: string;
  // email?: string; // This might be the company email, not user email
  // phone?: string;
  // address?: string;
  // notes?: string;
}

export interface Category {
  id: number | string;
  nombre: string;
  descripcion?: string;
}

export interface Book {
  id: number | string;
  titulo: string;
  autor: string;
  isbn?: string; // Was in original, good to keep
  precio: number;
  stock: number;
  editorialId: number | string; // Reference to Editorial
  categoriaId: number | string; // Reference to Category
  // Optional: include full objects if API sends them nested
  // editorial?: Editorial; 
  // categoria?: Category;
  // Fields from original type that might still be relevant or map to new ones:
  descripcion?: string; // Was 'description'
  // genre?: string; // Replaced by categoriaId
  coverImage?: string; // URL or path to image
  // targetAudience?: string;
  // themes?: string[];
  // content?: string; 
  // publishedYear?: number;
  // dateAdded?: string; 
}

export interface CartItem {
  id?: number | string; // Optional if items are identified by bookId in some contexts
  libroId: number | string; // Reference to Book
  cantidad: number;
  precioUnitario: number; // Price at the time of adding to cart
  // Optional: include full book object if API sends it nested
  libro?: Book; 
}

export interface Cart {
  id?: number | string; // Cart might not have an ID until saved or if user-session based
  usuarioId?: number | string; // Optional if cart is for anonymous user
  items: CartItem[];
  total?: number; // Calculated total, could be done on frontend or backend
}

export interface SaleItem {
  id?: number | string; // Optional, depends on DB structure for sale line items
  libroId: number | string;
  cantidad: number;
  precioUnitario: number; // Price at the time of sale
  // Optional: include full book object if API sends it nested
  // libro?: Book;
}

export interface Sale {
  id: number | string;
  numeroTicket: number;
  usuarioId?: number | string; // Can be null if it's a guest sale or POS
  fecha: string; // ISO date string typically
  total: number;
  items: SaleItem[];
  // Fields from original SaleRecord that might be relevant:
  // paymentMethod?: 'cash' | 'card' | string; 
  // customerName?: string; 
}

// Payload for creating a new sale
export interface CreateSaleItemPayload {
  libroId: number | string;
  cantidad: number;
  precioUnitario: number; // Price at the time of sale, for record-keeping
}

export interface CreateSalePayload {
  items: CreateSaleItemPayload[];
  paymentMethod: string; // e.g., 'credit_card', 'paypal', 'cash_on_delivery'
  numeroTicket: number;
  // Optional: Add other fields the backend might expect for sale creation
  // paymentConfirmationToken?: string; // If payment is processed externally first
  // shippingAddressId?: string | number;
  // customerNotes?: string;
  // discountCode?: string;
  // totalAmount?: number; // Backend might recalculate this for security
}

export interface Offer {
  id: number | string;
  descripcion: string;
  descuento: number; // e.g., 0.10 for 10%
  fechaInicio: string; // ISO date string
  fechaFin: string; // ISO date string
  // Fields from original Offer type:
  // name?: string; // Could be part of description or a separate field
  // couponCode?: string;
  // conditions?: string; 
  libroIds?: (string | number)[]; // IDs of books included in the offer
}

export type CreateOfferPayload = Omit<Offer, 'id'>; // Simple Omit for now, can be more specific if needed

export interface ApiResponseError {
  message: string;
  details?: string | Record<string, any>; // Could be a simple string or an object with more detailed errors
  statusCode?: number;
}


// --- Potentially Unused Types (Review and Remove if Confirm Unused) ---
// These types (GenAICartItem, GenAIAvailableOffer) seemed to be for mock data or a different feature.
// If they are not used by the actual API, they should be removed.
/*
export type GenAICartItem = {
  name: string;
  price: number;
  quantity: number;
};

export type GenAIAvailableOffer = {
  name: string;
  description: string;
  couponCode: string;
  conditions: string;
};
*/

// --- Internationalization Dictionary Type (Keep As Is) ---
// This type is for the website's text content and is not related to API data structures.
export type Dictionary = {
  siteName: string;
  description: string;
  locale: string;
  header: {
    catalog: string;
    cart: string;
    admin: string;
    toggleTheme: string;
    changeLanguage: string;
    profile?: string;
    logout?: string;
  };
  footer: {
    copyright: string;
  };
  splashPage: {
    welcome: string;
    tagline: string;
    enterCatalog: string;
  };
  languages: {
    english: string;
    spanish:string;
  };
  cartPage: {
    emptyCartTitle: string;
    emptyCartMessage: string;
    startShopping: string;
    yourShoppingCart: string;
    itemsSuffix: string;
    clearCart: string;
    orderSummary: string;
    subtotal: string;
    shipping: string;
    free: string;
    total: string;
    proceedToCheckout: string;
    addedToCartTitle?: string; 
    addedToCartDescription?: string; 
  };
  catalogPage: {
    pageTitle: string;
    searchPlaceholder: string;
    noBooksMatch: string;
    previousPage: string;
    nextPage: string;
    pageIndicator: string;
    addToCartButton?: string; 
    outOfStockButton?: string; 
    newArrivalsSection?: { 
      title: string;
      noNewArrivals: string;
    };
    filtersSection?: { 
      filterBooksTitle: string;
      genreLabel: string;
      allGenres: string;
      authorLabel: string;
      allAuthors: string;
      minPriceLabel: string;
      maxPriceLabel: string;
      sortByLabel: string;
      relevance: string;
      priceAsc: string;
      priceDesc: string;
      titleAsc: string;
      titleDesc: string;
      dateAddedDesc: string;
      applyFilters: string;
      resetFilters: string;
    }
  };
  bookDetailPage?: { 
    byAuthorPrefix?: string;
    publishedPrefix?: string;
    themesPrefix?: string;
  };
  checkoutForm: {
    secureCheckout: string;
    fillDetails: string;
    fullNameLabel: string;
    fullNamePlaceholder: string;
    emailLabel: string;
    emailPlaceholder: string;
    addressLabel: string;
    addressPlaceholder: string;
    cityLabel: string;
    cityPlaceholder: string;
    stateLabel: string;
    statePlaceholder: string;
    zipLabel: string;
    zipPlaceholder: string;
    paymentMethodLabel: string;
    paymentMethodPlaceholder: string;
    paymentMethodDescription: string;
    placeOrder: string;
    orderSubmittedTitle: string;
    orderSubmittedDescription: string;
    orderSubmittedConfirmation: string;
    continueShopping: string;
    emptyCartTitle: string;
    emptyCartDescription: string;
    returnToCart: string;
    orderSubmittedToast: string;
    orderSubmittedToastDesc: string;
    checkoutErrorToast: string;
    checkoutErrorToastDesc: string;
  };
  loginPage: {
    title: string;
    description: string;
    usernameLabel: string;
    usernamePlaceholder: string;
    passwordLabel: string;
    passwordPlaceholder: string;
    loginButton: string;
    loggingIn: string;
  };
  adminPanel: {
    sidebar: {
      dashboard: string;
      manageBooks: string;
      manageUsers: string;
      statusSoon: string;
      pointOfSale: string;
      sales: string;
      manageEditorials: string;
      manageCategories: string;
      statistics: string;
      reports: string; 
    };
    header: {
      titleSuffix: string;
      storefrontLink: string;
      navigationMenuTitle: string;
    };
    footer: {
      text: string;
    };
    dashboardPage: {
      title: string;
      manageBooksCard: {
        title: string;
        booksCount: string;
        inCatalog: string;
        viewBooksButton: string;
      };
      totalSalesCard: {
        title: string;
        amount: string;
        fromLastMonth: string;
        viewReportButton: string;
      };
      registeredUsersCard: {
        title: string;
        usersCount: string;
        newThisWeek: string;
        manageUsersButton: string;
      };
      quickActionsCard: {
        title: string;
        addNewBookButton: string;
        generateReportButton: string;
        viewLogsButton: string;
      };
    };
    booksPage: {
      title: string;
    };
    editorialsPage: {
      title: string;
      addNewEditorial: string;
      editEditorial: string;
      editorialNameLabel: string;
      editorialNamePlaceholder: string;
      contactPersonLabel: string;
      contactPersonPlaceholder: string;
      emailLabel: string;
      emailPlaceholder: string;
      phoneLabel: string;
      phonePlaceholder: string;
      rutLabel: string;
      rutPlaceholder: string;
      celularLabel: string;
      celularPlaceholder: string;
      addressLabel: string;
      addressPlaceholder: string;
      notesLabel: string;
      notesPlaceholder: string;
      deleteConfirmationTitle: string;
      deleteConfirmationMessage: string;
      deleteButton: string;
      cancelButton: string;
      saveButton: string;
      addButton: string;
      noEditorialsFound: string;
      tableHeaderName: string;
      tableHeaderRut: string;
      tableHeaderCelular: string;
      tableHeaderContact: string;
      tableHeaderEmail: string;
      tableHeaderActions: string;
      toastEditorialSaved: string;
      toastEditorialDeleted: string;
      toastError: string;
      toastErrorEditorialSave: string;
      toastErrorEditorialDelete: string;
      editorialNotFound: string;
    };
    categoriesPage: { 
      title: string;
      addNewCategory: string;
      editCategory: string;
      categoryNameLabel: string;
      categoryNamePlaceholder: string;
      categoryDescriptionLabel: string;
      categoryDescriptionPlaceholder: string;
      deleteConfirmationTitle: string;
      deleteConfirmationMessage: string;
      deleteButton: string;
      cancelButton: string;
      saveButton: string;
      addButton: string;
      noCategoriesFound: string;
      tableHeaderName: string;
      tableHeaderDescription: string;
      tableHeaderActions: string;
      toastCategorySaved: string;
      toastCategoryDeleted: string;
      toastError: string;
      errorDuplicateName: string;
    };
    posPage: {
      title: string;
      searchBooksPlaceholder: string;
      noResults: string;
      addToOrder: string;
      currentOrderTitle: string;
      emptyOrder: string;
      bookColumn: string;
      priceColumn: string;
      quantityColumn: string;
      totalColumn: string;
      actionsColumn: string;
      orderSummaryTitle: string;
      subtotal: string;
      grandTotal: string;
      paymentMethodTitle: string;
      cash: string;
      card: string;
      customerNameLabel: string;
      customerNamePlaceholder: string;
      completeSaleButton: string;
      processingSale: string;
      saleCompletedToastTitle: string;
      saleCompletedToastDesc: string;
      errorCompletingSale: string;
      ticketDialog: {
        title: string;
        saleId: string;
        date: string;
        customer: string;
        item: string;
        qty: string;
        price: string;
        total: string;
        subtotal: string;
        grandTotal: string;
        paymentMethod: string;
        cash: string;
        card: string;
        notApplicableShort: string;
        printButton: string;
        closeButton: string;
      };
    };
    salesPage: {
      title: string;
      noSalesFound: string;
      tableHeaderSaleId: string;
      tableHeaderDate: string;
      tableHeaderCustomer: string;
      tableHeaderTotalAmount: string;
      tableHeaderPaymentMethod: string;
      tableHeaderActions: string;
      viewTicketButton: string;
      cash: string;
      card: string;
      notApplicable: string;
      filterByYearLabel: string;
      filterByMonthLabel: string;
      filterByPaymentMethodLabel: string;
      allYears: string;
      allMonths: string;
      allPaymentMethods: string;
      resetFiltersButton: string;
      months: {
        january: string; february: string; march: string; april: string;
        may: string; june: string; july: string; august: string;
        september: string; october: string; november: string; december: string;
      };
    };
    statsPage: {
      title: string;
      salesOverTimeTitle: string;
      selectPeriod: string;
      daily: string;
      weekly: string;
      monthly: string;
      totalSales: string;
      salesCount: string;
      noSalesData: string;
      bestSellingCategoriesTitle: string;
      category: string;
      unitsSold: string;
      revenue: string;
      totalRevenueTitle: string;
      selectDateRange: string;
      startDate: string;
      endDate: string;
      calculateRevenue: string;
      revenueForPeriod: string; 
      noSalesInRange: string;
      monthlyComparisonTitle: string;
      month: string;
      pickAStartDate: string;
      pickAnEndDate: string;
    };
    reportsPage: { 
      title: string;
      generateReportButton: string;
      exportPDFButton: string;
      exportExcelButton: string;
      dateRangeLabel: string;
      pickDateRange: string;
      summaryLevelLabel: string;
      summaryNone: string;
      summaryDaily: string;
      summaryWeekly: string;
      summaryMonthly: string;
      reportSectionTitle: string;
      overallSummaryTitle: string;
      totalSales: string;
      totalOrders: string;
      salesByPaymentMethodTitle: string;
      paymentMethod: string;
      salesByBookCategoryTitle: string;
      category: string;
      quantitySold: string;
      topSellingProductsTitle: string;
      product: string;
      revenue: string;
      periodicSummaryTitle: string; 
      period: string; 
      noDataForReport: string;
      generatingReport: string;
      exportPDFSimulated: string;
      exportExcelSimulated: string;
      errorGeneratingReport: string;
      pleaseSelectDateRange: string;
    };
  };
};
