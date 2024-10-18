// Constants
const API_BASE_URL = 'https://gutendex.com/books';

// DOM Elements
const bookDetailsContainer = document.getElementById('book-details');
const bookDetailsTitle = document.getElementById('book-details-title');

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

    bookDetailsTitle.textContent = book.title;

    bookDetailsContainer.innerHTML = `
        <img class="w-full h-64 object-cover mb-4" src="${book.formats["image/jpeg"] || 'placeholder.jpg'}" alt="${book.title}">
        <h2 class="text-2xl font-bold mb-4">${book.title}</h2>
        <p class="text-lg mb-2">Author: ${authorName}</p>
        <p class="text-sm text-gray-500 mb-4">Genres: ${genres}</p>
        <h3 class="text-xl font-semibold mb-2">Description:</h3>
        <p class="mt-2">${description}</p>
        <button id="toggle-wishlist" class="mt-4 p-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Add to Wishlist
        </button>
    `;

    updateWishlistButtonState();
    addWishlistButtonListener();
};

// Display error message if fetch fails
const displayErrorMessage = () => {
    bookDetailsContainer.innerHTML = `
        <p class="text-red-500 text-center">Failed to load book details. Please try again later.</p>
    `;
};

// Update wishlist button state
const updateWishlistButtonState = () => {
    const wishlistButton = document.getElementById('toggle-wishlist');
    const wishlist = JSON.parse(localStorage.getItem('gutenberg-wishlist')) || [];
    
    if (wishlist.includes(bookId)) {
        wishlistButton.textContent = 'Remove from Wishlist';
        wishlistButton.classList.remove('bg-blue-500', 'hover:bg-blue-600');
        wishlistButton.classList.add('bg-red-500', 'hover:bg-red-600');
    } else {
        wishlistButton.textContent = 'Add to Wishlist';
        wishlistButton.classList.remove('bg-red-500', 'hover:bg-red-600');
        wishlistButton.classList.add('bg-blue-500', 'hover:bg-blue-600');
    }
};

// Add event listener to wishlist button
const addWishlistButtonListener = () => {
    const wishlistButton = document.getElementById('toggle-wishlist');
    wishlistButton.addEventListener('click', toggleWishlist);
};

// Toggle book in wishlist
const toggleWishlist = () => {
    const wishlist = JSON.parse(localStorage.getItem('gutenberg-wishlist')) || [];
    const index = wishlist.indexOf(bookId);
    
    if (index === -1) {
        wishlist.push(bookId);
        alert('Book added to wishlist!');
    } else {
        wishlist.splice(index, 1);
        alert('Book removed from wishlist.');
    }
    
    localStorage.setItem('gutenberg-wishlist', JSON.stringify(wishlist));
    updateWishlistButtonState();
};

// Initialize
fetchBookDetails();