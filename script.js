// This Event listener is added for when the DOM content is loaded
document.addEventListener("DOMContentLoaded", () => {
    console.log("📚 Book Library Organizer Loaded!");
    updateLibraryDisplay(); // Load library on page load
    initializeFilters(); // Initialize the filters on page load
});

const API_URL = "https://www.googleapis.com/books/v1/volumes?q=";

// Event listener for the search form submission
document.getElementById("search-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const query = document.getElementById("search-input").value.trim();
    if (query) fetchBooks(query); // Fetch books if a valid query is provided
});

// Event listeners for genre and author filters
document.getElementById("author-filter").addEventListener("change", filterBooks);
document.getElementById("genre-filter").addEventListener("change", filterBooks);

// Function to fetch books based on the query provided by the user
async function fetchBooks(query) {
    try {
        const resultsContainer = document.getElementById("results-container");
        resultsContainer.innerHTML = "<p>Loading books...</p>"; // Display loading text while fetching

        // Fetch books from Google Books API with a limit of 10 results
        const response = await fetch(`${API_URL}${query}&maxResults=10`);
        if (!response.ok) throw new Error("Failed to fetch books"); // Handle errors if API fails
        const data = await response.json();

        displayBooks(data.items || []); // Display fetched books
        populateAuthorsFilter(data.items || []); // Populate the author filter dropdown with authors from the fetched books
    } catch (error) {
        console.error("Error fetching books:", error);
        document.getElementById("results-container").innerHTML = "<p>Failed to load books. Try again!</p>"; // Display error message
    }
}

// Function to display the list of books in the results container
function displayBooks(books) {
    const resultsContainer = document.getElementById("results-container");
    resultsContainer.innerHTML = ""; // Clear existing results

    books.forEach(book => {
        const bookInfo = book.volumeInfo;
        if (!bookInfo || !bookInfo.title) return; // Skip books without a title

        const bookElement = document.createElement("div");
        bookElement.classList.add("book");
        bookElement.innerHTML = `
            <h3>${bookInfo.title}</h3>
            <p>${bookInfo.authors?.join(", ") || "Unknown Author"}</p>
            <img src="${bookInfo.imageLinks?.thumbnail || 'https://via.placeholder.com/128'}" alt="Book Cover">
            <button onclick="addToLibrary('${book.id}', '${bookInfo.title.replace(/'/g, "\\'")}', '${bookInfo.authors?.join(", ") || "Unknown Author"}', '${bookInfo.imageLinks?.thumbnail || 'https://via.placeholder.com/128'}')">➕ Add to Library</button>
        `;
        resultsContainer.appendChild(bookElement);
    });
}

// Function to populate the author filter dropdown with authors from the fetched books
function populateAuthorsFilter(books) {
    const authorsFilter = document.getElementById("author-filter");
    const authors = new Set();

    books.forEach(book => {
        const authorsList = book.volumeInfo.authors;
        if (authorsList) {
            authorsList.forEach(author => authors.add(author)); // Add unique authors to the set
        }
    });

    // Clear existing options and add the default "Filter by Author" option
    authorsFilter.innerHTML = '<option value="">Filter by Author</option>';
    
    authors.forEach(author => {
        const option = document.createElement("option");
        option.value = author;
        option.textContent = author;
        authorsFilter.appendChild(option); // Append each author to the dropdown
    });
}

// Function to handle filtering books based on selected author and genre
function filterBooks() {
    const authorFilterValue = document.getElementById("author-filter").value;
    const genreFilterValue = document.getElementById("genre-filter").value;
    const resultsContainer = document.getElementById("results-container");
    const books = Array.from(resultsContainer.getElementsByClassName("book"));

    books.forEach(bookElement => {
        const author = bookElement.querySelector("p").textContent;
        const genre = bookElement.querySelector("h3").textContent.toLowerCase(); // Assuming genre is part of the book title, modify if needed

        // Check if the book matches the selected author and genre
        const matchesAuthor = !authorFilterValue || author.includes(authorFilterValue);
        const matchesGenre = !genreFilterValue || genre.includes(genreFilterValue.toLowerCase());

        if (matchesAuthor && matchesGenre) {
            bookElement.style.display = "block"; // Display the book if it matches both filters
        } else {
            bookElement.style.display = "none"; // Hide the book if it doesn't match the filters
        }
    });
}

// Function to add a book to the library (localStorage)
function addToLibrary(id, title, author, thumbnail) {
    let library = JSON.parse(localStorage.getItem("library")) || {};
    
    // Check if the book is already in the library
    if (!library[id]) {
        library[id] = { title, author, thumbnail };
        localStorage.setItem("library", JSON.stringify(library));
        alert(`📖 The book "${title}" has been added to your library!`); // Alert the user
        console.log(`Added: ${title}`);
        updateLibraryDisplay(); // Update library display after adding the book
    } else {
        alert(`⚠️ The book "${title}" is already in your library!`); // Alert if the book is already in the library
        console.log(`Duplicate: ${title}`);
    }
}

// Function to update the library display on the page
function updateLibraryDisplay() {
    const libraryContainer = document.getElementById("library-container");

    if (!libraryContainer) {
        console.error("❌ Library container not found!"); // Handle case where library container is not found
        return;
    }

    libraryContainer.innerHTML = ""; // Clear existing content
    let library = JSON.parse(localStorage.getItem("library")) || {};

    console.log("📚 Updating Library Display...", library);

    // If the library is empty, display a message
    if (Object.keys(library).length === 0) {
        libraryContainer.innerHTML = "<p>No books in your library yet.</p>";
        return;
    }

    // Loop through the books in the library and display them
    for (const id in library) {
        const book = library[id];

        // Skip invalid books (no title or other issues)
        if (!book || typeof book !== "object" || !book.title) {
            console.warn(`⚠️ Skipping invalid book entry:`, book);
            continue;
        }

        const bookElement = document.createElement("div");
        bookElement.classList.add("book");
        bookElement.innerHTML = `
            <h3>${book.title}</h3>
            <p>${book.author}</p>
            <img src="${book.thumbnail}" alt="Book Cover">
            <button onclick="removeFromLibrary('${id}')">❌ Remove</button>
        `;
        libraryContainer.appendChild(bookElement); // Add book to the library container
    }
}

// Function to remove a book from the library (localStorage)
function removeFromLibrary(id) {
    let library = JSON.parse(localStorage.getItem("library")) || {};
    
    // Check if the book exists in the library
    if (library[id]) {
        console.log(`Removed: ${library[id].title}`);
        delete library[id]; // Remove the book from the library
        localStorage.setItem("library", JSON.stringify(library));
        updateLibraryDisplay(); // Update library display after removal
    }
}
