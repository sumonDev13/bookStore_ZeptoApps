// Constants
const API_BASE_URL = 'https://gutendex.com/books';

// DOM Elements
const bookDetailsContainer = document.getElementById('book-details');

// Get book ID from URL parameters
const urlParams = new URLSearchParams(window.location.search);
const bookId = urlParams.get('id');

// Fetch book details from the API
const fetchBookDetails = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/${bookId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch book details');
        }
        const book = await response.json();
        renderBookDetails(book);
    } catch (error) {
        console.error('Error fetching book details:', error);
        displayErrorMessage();
    }
};

// Render book details in the UI
const renderBookDetails = (book) => {
    const authorName = book.authors[0]?.name || 'Unknown Author';
    const genres = book.subjects.join(', ') || 'No genres available';
    const description = book.description || 'No description available';

    bookDetailsContainer.innerHTML = `
        <img class="w-full h-64 object-cover mb-4" src="${book.formats["image/jpeg"] || 'placeholder.jpg'}" alt="${book.title}">
        <h2 class="text-2xl font-bold mb-4">${book.title}</h2>
        <p class="text-lg mb-2">Author: ${authorName}</p>
        <p class="text-sm text-gray-500 mb-4">Genres: ${genres}</p>
        <h3 class="text-xl font-semibold mb-2">Description:</h3>
        <p class="mt-2">${description}</p>
        <button id="add-to-wishlist" class="mt-4 p-2 bg-blue-500 text-white rounded hover:bg-blue-600">Add to Wishlist</button>
    `;

    addWishlistButtonListener(book.id);
};

// Display error message if fetch fails
const displayErrorMessage = () => {
    bookDetailsContainer.innerHTML = `
        <p class="text-red-500 text-center">Failed to load book details. Please try again later.</p>
    `;
};

// Add event listener to wishlist button
const addWishlistButtonListener = (bookId) => {
    const wishlistButton = document.getElementById('add-to-wishlist');
    wishlistButton.addEventListener('click', () => addToWishlist(bookId));
};

// Add book to wishlist
const addToWishlist = (bookId) => {
    const wishlist = JSON.parse(localStorage.getItem('gutenberg-wishlist')) || [];
    if (!wishlist.includes(bookId)) {
        wishlist.push(bookId);
        localStorage.setItem('gutenberg-wishlist', JSON.stringify(wishlist));
        alert('Book added to wishlist!');
    } else {
        alert('This book is already in your wishlist.');
    }
};

// Initialize
fetchBookDetails();