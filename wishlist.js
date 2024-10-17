// Constants
const API_BASE_URL = 'https://gutendex.com/books';
const WISHLIST_STORAGE_KEY = 'gutenberg-wishlist';

// DOM Elements
const wishlistBooksContainer = document.getElementById('wishlist-books');

// State
let wishlistBooks = JSON.parse(localStorage.getItem(WISHLIST_STORAGE_KEY)) || [];

// Fetch books by their ID from the Gutenberg API
const fetchWishlistBooks = async () => {
  if (wishlistBooks.length === 0) {
    displayEmptyWishlist();
    return;
  }

  try {
    const books = await Promise.all(wishlistBooks.map(fetchBookById));
    renderWishlistBooks(books);
  } catch (error) {
    console.error('Error fetching wishlist books:', error);
    displayErrorMessage();
  }
};

const fetchBookById = async (bookId) => {
  const response = await fetch(`${API_BASE_URL}/${bookId}/`);
  if (!response.ok) {
    throw new Error(`Failed to fetch book with ID ${bookId}`);
  }
  return response.json();
};

const displayEmptyWishlist = () => {
  wishlistBooksContainer.innerHTML = "<p class='text-center'>Your wishlist is empty.</p>";
};

const displayErrorMessage = () => {
  wishlistBooksContainer.innerHTML = "<p class='text-center text-red-500'>Failed to load wishlist books. Please try again later.</p>";
};

// Render wishlisted books in the UI
const renderWishlistBooks = (books) => {
  wishlistBooksContainer.innerHTML = '';
  books.forEach((book) => {
    const bookCard = createBookCard(book);
    wishlistBooksContainer.appendChild(bookCard);
  });
};

const createBookCard = (book) => {
  const authorName = book.authors.map((author) => author.name).join(', ');
  const genres = book.subjects.join(', ');

  const bookCard = document.createElement('div');
  bookCard.classList = 'bg-white shadow-lg rounded-lg overflow-hidden p-4';

  bookCard.innerHTML = `
    <img class="w-full h-64 object-cover cursor-pointer book-image" src="${book.formats['image/jpeg'] || 'placeholder.jpg'}" alt="${book.title}">
    <h3 class="text-lg font-bold mt-2 cursor-pointer book-title">${book.title}</h3>
    <p class="text-gray-600">${authorName}</p>
    <p class="text-sm text-gray-500">${genres || 'N/A'}</p>
    <p class="text-sm text-gray-500">ID: ${book.id}</p>
    <button onclick="removeFromWishlist(${book.id})" class="mt-4 p-2 bg-red-100 rounded text-red-600">Remove from Wishlist</button>
  `;

  addBookCardEventListeners(bookCard, book.id);

  return bookCard;
};

const addBookCardEventListeners = (bookCard, bookId) => {
  const bookImage = bookCard.querySelector('.book-image');
  const bookTitle = bookCard.querySelector('.book-title');

  const redirectToBookPage = () => {
    window.location.href = `book.html?id=${bookId}`;
  };

  bookImage.addEventListener('click', redirectToBookPage);
  bookTitle.addEventListener('click', redirectToBookPage);
};

// Remove a book from the wishlist
const removeFromWishlist = (bookId) => {
  wishlistBooks = wishlistBooks.filter((id) => id !== bookId);
  updateWishlistStorage();
  fetchWishlistBooks();
};

const updateWishlistStorage = () => {
  localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlistBooks));
};

// Initialize
fetchWishlistBooks();