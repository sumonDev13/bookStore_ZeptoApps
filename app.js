// Constants
const API_BASE_URL = 'https://gutendex.com/books';
const WISHLIST_STORAGE_KEY = 'gutenberg-wishlist';

// State
let bookList = [];
let filteredBookList = [];
let currentPage = 1;
let nextPageUrl = null;
let prevPageUrl = null;
let wishlist = JSON.parse(localStorage.getItem(WISHLIST_STORAGE_KEY)) || [];

// DOM Elements
const loadingElement = document.getElementById('loading');
const bookListElement = document.getElementById('book-list');
const paginationElement = document.getElementById('pagination');
const searchInput = document.getElementById('search');
const genreFilter = document.getElementById('genre-filter');

// Cache object to store fetched data
const cache = {};

// Extract unique genres from book data
const extractGenres = (books) => {
    const genreSet = new Set();
    books.forEach(book => {
        book.subjects.forEach(subject => {
            genreSet.add(subject);
        });
    });
    return Array.from(genreSet).sort();
};

// Populate genre dropdown
const populateGenreDropdown = (genres) => {
    genreFilter.innerHTML = '<option value="">All Genres</option>';
    genres.forEach((genre) => {
        const option = document.createElement('option');
        option.value = genre;
        option.textContent = genre;
        genreFilter.appendChild(option);
    });
};

// Fetch books from the API or cache
const fetchBooks = async (page = 1) => {
    showLoading(true);
    try {
        if (cache[page]) {
            // If data is in cache, use it
            updateBookData(cache[page], page);
        } else {
            // If not in cache, fetch from API
            const response = await fetch(`${API_BASE_URL}/?page=${page}`);
            if (!response.ok) {
                throw new Error(`Failed to fetch data: ${response.statusText}`);
            }
            const data = await response.json();
            // Store fetched data in cache
            cache[page] = data;
            updateBookData(data, page);
        }
        renderBooks(bookList);
        setupPagination();
        
        // Extract and populate genres
        const genres = extractGenres(bookList);
        populateGenreDropdown(genres);
    } catch (error) {
        handleFetchError(error);
    } finally {
        showLoading(false);
    }
};

const updateBookData = (data, page) => {
    bookList = data.results;
    nextPageUrl = data.next;
    prevPageUrl = data.previous;
    currentPage = page;
};

const showLoading = (isLoading) => {
    loadingElement.classList.toggle('hidden', !isLoading);
};

const handleFetchError = (error) => {
    console.error('Error fetching books:', error);
    loadingElement.textContent = 'Failed to load data.';
};

// Render the books
const renderBooks = (booksToRender) => {
    bookListElement.innerHTML = '';
    booksToRender.forEach((book) => {
        const bookCard = createBookCard(book);
        bookListElement.appendChild(bookCard);
    });
};

// Clear cache (optional, can be called when needed)
const clearCache = () => {
    cache = {};
};

const createBookCard = (book) => {
    const authorName = book?.authors?.map((author) => author?.name).join(', ');
    const genres = book.subjects.join(', ');
    const bookCard = document.createElement('div');
    bookCard.classList = 'bg-white shadow-lg rounded-lg overflow-hidden p-4 transform transition-all hover:scale-105 cursor-pointer';
    bookCard.innerHTML = `
        <img class="w-full h-64 object-cover" src="${book.formats['image/jpeg'] || 'placeholder.jpg'}" alt="${book.title}">
        <h3 class="text-lg font-bold mt-2">${book.title}</h3>
        <p class="text-gray-600">${authorName}</p>
        <p class="text-sm text-gray-500">${genres || 'N/A'}</p>
        <p class="text-sm text-gray-500">ID: ${book?.id}</p>
        <button class="wishlist-btn mt-4 p-2 bg-red-100 rounded text-red-600">
            ${wishlist.includes(book.id) ? '❤️ Wishlisted' : '♡ Wishlist'}
        </button>
    `;

    // Add click event to the entire book card
    bookCard.addEventListener('click', (event) => {
        if (!event.target.classList.contains('wishlist-btn')) {
            window.location.href = `book.html?id=${book.id}`;
        }
    });

    // Add click event to the wishlist button
    const wishlistBtn = bookCard.querySelector('.wishlist-btn');
    wishlistBtn.addEventListener('click', (event) => {
        event.stopPropagation();
        toggleWishlist(book.id);
    });

    return bookCard;
};

// Update Wishlist Count
const updateWishlistCount = () => {
    const wishlistCount = document.getElementById('wishlist-count');
    wishlistCount.textContent = wishlist.length;
};

// Add/Remove Book from Wishlist
const toggleWishlist = (bookId) => {
    const index = wishlist.indexOf(bookId);
    if (index !== -1) {
        wishlist.splice(index, 1);
    } else {
        wishlist.push(bookId);
    }
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
    updateWishlistCount();
    renderBooks(filteredBookList.length ? filteredBookList : bookList);
};

// Setup Pagination
const setupPagination = () => {
    paginationElement.innerHTML = '';
    if (prevPageUrl) {
        appendPaginationButton('Previous', () => fetchBooks(currentPage - 1));
    }
    if (nextPageUrl) {
        appendPaginationButton('Next', () => fetchBooks(currentPage + 1));
    }
};

const appendPaginationButton = (text, onClick) => {
    const button = document.createElement('button');
    button.innerText = text;
    button.classList = 'mx-2 px-4 py-2 bg-blue-500 text-white rounded';
    button.addEventListener('click', onClick);
    paginationElement.appendChild(button);
};

// Event Listeners
searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    filteredBookList = bookList.filter((book) =>
        book.title.toLowerCase().includes(searchTerm)
    );
    renderBooks(filteredBookList);
});

genreFilter.addEventListener('change', (e) => {
    const selectedGenre = e.target.value;
    filteredBookList = bookList.filter((book) => {
        const matchesGenre = selectedGenre ? book.subjects.includes(selectedGenre) : true;
        const matchesSearch = book.title.toLowerCase().includes(searchInput.value.toLowerCase());
        return matchesGenre && matchesSearch;
    });
    renderBooks(filteredBookList);
});

// Initialize
fetchBooks();
updateWishlistCount();