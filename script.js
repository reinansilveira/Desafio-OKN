let currentPage = 1;
const itemsPerPage = 12;
let products = [];

let currentCategory = 'all'; 
let currentOrder = null;     
let currentSearch = '';      

function InsertProduct(products, page = 1) {
  const productsContainer = document.querySelector('.products-container');
  productsContainer.innerHTML = '';

  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = products.slice(startIndex, endIndex);

  paginatedProducts.forEach(({ id, name, price_in_cents, image_url }) => {
    const productDiv = document.createElement('div');
    productDiv.classList.add('product');

    const productImage = document.createElement('img');
    productImage.setAttribute('src', image_url);

    const divTitle = document.createElement('div');
    divTitle.classList.add('product-div-title');

    const productName = document.createElement('h3');
    productName.textContent = name;

    const productPrice = document.createElement('p');
    productPrice.textContent = `R$ ${(price_in_cents / 100).toFixed(2)}`;

    productDiv.appendChild(productImage);
    divTitle.appendChild(productName);
    divTitle.appendChild(productPrice);
    productDiv.appendChild(divTitle);

    productsContainer.appendChild(productDiv);
  });

  updatePaginationButtons(products.length);
}

function updatePaginationButtons(totalItems) {
  const numbersContainer = document.querySelector('.pagination-numbers');
  numbersContainer.innerHTML = '';

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const rightArrow = document.querySelector('.arrow-right');
  const leftArrow = document.querySelector('.arrow-left');

  for (let i = 1; i <= totalPages; i++) {
    const pageButton = document.createElement('button');
    pageButton.textContent = i;
    pageButton.classList.add('page-button');
    if (i === currentPage) pageButton.classList.add('active');

    pageButton.addEventListener('click', () => {
      currentPage = i;
      renderPage(); 
    });

    numbersContainer.appendChild(pageButton);
  }

  leftArrow.disabled = currentPage === 1;
  rightArrow.disabled = currentPage === totalPages;

  leftArrow.onclick = () => {
    if (currentPage > 1) {
      currentPage--;
      renderPage(); 
    }
  };

  rightArrow.onclick = () => {
    if (currentPage < totalPages) {
      currentPage++;
      renderPage(); 
    }
  };
}


function renderPage() {
  let filteredProducts = [...products];

  if (currentCategory === 't-shirts') {
    filteredProducts = filteredProducts.filter(p => p.category === 't-shirts');
  } else if (currentCategory === 'mugs') {
    filteredProducts = filteredProducts.filter(p => p.category === 'mugs');
  }

  if (currentSearch) {
    filteredProducts = filteredProducts.filter(p =>
      p.name.toLowerCase().includes(currentSearch)
    );
  }

  if (currentOrder === 'asc') {
    filteredProducts = SortProductsByPrice(filteredProducts, 'asc');
  } else if (currentOrder === 'desc') {
    filteredProducts = SortProductsByPrice(filteredProducts, 'desc');
  }

  InsertProduct(filteredProducts, currentPage);
}

function SortProductsByPrice(productsList, order = 'asc') {
  if (order === 'asc') {
    return [...productsList].sort((a, b) => a.price_in_cents - b.price_in_cents);
  }
  if (order === 'desc') {
    return [...productsList].sort((a, b) => b.price_in_cents - a.price_in_cents);
  }
  return productsList;
}

document.addEventListener('DOMContentLoaded', function () {
  const container = document.getElementById('ordenation-container');
  const priceOptions = document.querySelectorAll('.price-option');
  const arrowIcon = document.querySelector('.arrow-icon');
  let isOpen = false;

  container.addEventListener('click', function (e) {
    if (e.target.classList.contains('toggle-trigger')) {
      isOpen = !isOpen;

      priceOptions.forEach(option => {
        option.style.display = isOpen ? 'block' : 'none';
      });

      arrowIcon.classList.toggle('arrow-up', isOpen);
    }
  });
});

const fetchGraphQL = async (query) => {
  const res = await fetch('http://localhost:3000/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });

  const { data } = await res.json();
  return data;
};

const query = `
  query {
    allProducts {
      id
      name
      price_in_cents
      image_url
      category
    }
  }
`;

fetchGraphQL(query)
  .then(({ allProducts }) => {
    products = allProducts;
    renderPage();
  })
  .catch(console.error);

const buttonHighestPrice = document.getElementById('highest-price');
const buttonLowestPrice = document.getElementById('lowest-price');
const buttonAll = document.getElementById('option-all');
const buttonTShirt = document.getElementById('option-t-shirt');
const buttonMug = document.getElementById('option-mug');

buttonAll.addEventListener('click', () => {
  currentCategory = 'all';
  currentPage = 1;
  renderPage();
  buttonAll.classList.add('option-active');
  buttonTShirt.classList.remove('option-active');
  buttonMug.classList.remove('option-active');
});

buttonTShirt.addEventListener('click', () => {
  currentCategory = 't-shirts';
  currentPage = 1;
  renderPage();
  buttonTShirt.classList.add('option-active');
  buttonAll.classList.remove('option-active');
  buttonMug.classList.remove('option-active');
});

buttonMug.addEventListener('click', () => {
  currentCategory = 'mugs';
  currentPage = 1;
  renderPage();
  buttonMug.classList.add('option-active');
  buttonAll.classList.remove('option-active');
  buttonTShirt.classList.remove('option-active');
});


const searchInput = document.querySelector('.pesquisar');

searchInput.addEventListener('input', (event) => {
  currentSearch = event.target.value.toLowerCase();
  currentPage = 1;
  renderPage();
});

buttonHighestPrice.addEventListener('click', () => {
  currentOrder = 'desc';
  currentPage = 1;
  renderPage();
  buttonHighestPrice.classList.add('highest-price');
  buttonLowestPrice.classList.remove('lowest-price');
});

buttonLowestPrice.addEventListener('click', () => {
  currentOrder = 'asc';
  currentPage = 1;
  renderPage();
  buttonLowestPrice.classList.add('lowest-price');
  buttonHighestPrice.classList.remove('highest-price');
});
