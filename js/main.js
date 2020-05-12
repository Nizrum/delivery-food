'use strict';

const cartButton = document.querySelector('#cart-button');
const modal = document.querySelector('.modal');
const close = document.querySelector('.close');
const buttonAuth = document.querySelector('.button-auth');
const modalAuth = document.querySelector('.modal-auth');
const closeAuth = document.querySelector('.close-auth');
const logInForm = document.querySelector('#logInForm');
const loginInput = document.querySelector('#login');
const userName = document.querySelector('.user-name');
const buttonOut = document.querySelector('.button-out');
const cardsRestaurants = document.querySelector('.cards-restaurants');
const containerPromo = document.querySelector('.container-promo');
const restaurants = document.querySelector('.restaurants');
const menu = document.querySelector('.menu');
const logo = document.querySelector('.logo');
const cardsMenu = document.querySelector('.cards-menu');
const sectionHeading = document.querySelector('.menu>.section-heading');
const modalBody = document.querySelector('.modal-body');
const modalPrice = document.querySelector('.modal-pricetag');
const buttonClearCart = document.querySelector('.clear-cart');

let login = localStorage.getItem('delivery');

const cart = [];

const loadCart = function () {
  if (localStorage.getItem(login)) {
    JSON.parse(localStorage.getItem(login)).forEach(function (item) {
      cart.push(item);
    });
  }
}

const saveCart = function () {
  localStorage.setItem(login, JSON.stringify(cart));
}

const getData = async function (url) {
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Ошибка по адресу ${url}, 
      статус ошибки ${response.status}!`);
  }
  
  return await response.json();
};

const valid = function (str) {
  const nameReg = /^[a-zA-Z][a-zA-Z0-9-_\.]{1,20}$/;
  return nameReg.test(str);
};

function toggleModal() {
  modal.classList.toggle('is-open');
}

function toggleModalAuth () {
  modalAuth.classList.toggle('is-open');
  loginInput.style.borderColor = '';
}

function authorized () {

  function logOut () {
    login = null;
    cart.length = 0;
    localStorage.removeItem('delivery');

    buttonAuth.style.display = '';
    userName.style.display = '';
    buttonOut.style.display = '';
    cartButton.style.display = '';
    buttonOut.removeEventListener('click', logOut);
    checkAuth();
  }
  
  console.log('Авторизован');
  userName.textContent = login;
  buttonAuth.style.display = 'none';
  userName.style.display = 'inline';
  buttonOut.style.display = 'flex';
  cartButton.style.display = 'flex';
  buttonOut.addEventListener('click', logOut);
  loadCart();
}

function notAuthorized () {
  console.log('Не авторизован');

  function logIn (event) {
    event.preventDefault();
    if (valid(loginInput.value)) {
      login = loginInput.value;
      loginInput.style.borderColor = '';
      localStorage.setItem('delivery', login);
      toggleModalAuth();
      buttonAuth.removeEventListener('click', toggleModalAuth);
      closeAuth.removeEventListener('click', toggleModalAuth);
      logInForm.removeEventListener('submit', logIn);
      logInForm.reset();
      checkAuth();
    } else {
      loginInput.style.borderColor = 'red';
      loginInput.value = '';
    }
  }

  buttonAuth.addEventListener('click', toggleModalAuth);
  closeAuth.addEventListener('click', toggleModalAuth);
  logInForm.addEventListener('submit', logIn);
}

function checkAuth () {
  if (login) {
    authorized();
  } else {
    notAuthorized();
  }
}

function createCardRestaurant ({ image, kitchen, name, price, products, stars, time_of_delivery: timeOfDelivery }) {
  
  const card = `
    <a class="card card-restaurant" data-products="${products}" data-info="${[name, stars, price, kitchen]}">
      <img src="${image}" alt="image" class="card-image"/>
      <div class="card-text">
        <div class="card-heading">
          <h3 class="card-title">${name}</h3>
          <span class="card-tag tag">${timeOfDelivery} мин</span>
        </div>
        <div class="card-info">
          <div class="rating">
            ${stars}
          </div>
          <div class="price">От ${price} ₽</div>
          <div class="category">${kitchen}</div>
        </div>
      </div>
    </a>
  `;

  cardsRestaurants.insertAdjacentHTML('beforeend', card);

}

function createCardGood ({ description, id, image, name, price }) {
  const card = document.createElement('div');
  card.className = 'card';
   
  card.insertAdjacentHTML('beforeend', `
    <img src="${image}" alt="image" class="card-image"/>
    <div class="card-text">
      <div class="card-heading">
        <h3 class="card-title card-title-reg">${name}</h3>
      </div>
      <div class="card-info">
        <div class="ingredients">
          ${description}
        </div>
    </div>
    <div class="card-buttons">
        <button class="button button-primary button-add-cart" id="${id}">
          <span class="button-card-text">В корзину</span>
          <span class="button-cart-svg"></span>
        </button>
        <strong class="card-price-bold card-price">${price} ₽</strong>
      </div>
    </div>
  `);

  cardsMenu.insertAdjacentElement('beforeend', card);
}

function createInfoRestaurant (restaurant) {
  const dataInfo = restaurant.dataset.info.split(',');
  const [ name, stars, price, kitchen ] = dataInfo;
  const info = `
		<h2 class="section-title restaurant-title">${name}</h2>
		<div class="card-info">
			<div class="rating">
				${stars}
			</div>
			<div class="price">От ${price} ₽</div>
			<div class="category">${kitchen}</div>
		</div>
  `;
  sectionHeading.insertAdjacentHTML('afterbegin', info);
}

function openGoods (event) {
  if (login) {
    const target = event.target;
    const restaurant = target.closest('.card-restaurant');
    if (restaurant) {
      cardsMenu.textContent = '';
      containerPromo.classList.add('hide');
      restaurants.classList.add('hide');
      menu.classList.remove('hide');
      sectionHeading.textContent = '';
      createInfoRestaurant(restaurant);
      getData(`./db/${restaurant.dataset.products}`).then(function(data) {
        data.forEach(createCardGood);
      });
    }
  } else {
    toggleModalAuth();
  } 
}

function addToCart (event) {
  const target = event.target;
  const buttonAddToCart = target.closest('.button-add-cart');
  if (buttonAddToCart) {
    const card = target.closest('.card');
    const title = card.querySelector('.card-title-reg').textContent;
    const cost = card.querySelector('.card-price').textContent;
    const id = buttonAddToCart.id;
    
    const food = cart.find(function (item) {
      return item.id === id;
    });

    if (food) {
      food.count++;
    } else {
      cart.push({
        id,
        title,
        cost,
        count: 1,
      });
    }
  }
  saveCart();
}

function renderCart () {
  modalBody.textContent = '';

  cart.forEach(function ({ id, title, cost, count }) {
    const itemCart = `
      <div class="food-row">
        <span class="food-name">${title}</span>
        <strong class="food-price">${cost}</strong>
        <div class="food-counter">
          <button class="counter-button counter-minus" data-id="${id}">-</button>
          <span class="counter">${count}</span>
          <button class="counter-button counter-plus" data-id="${id}">+</button>
        </div>
      </div>
    `;
    
    modalBody.insertAdjacentHTML('afterbegin', itemCart);
  });
  
  const totalPrice = cart.reduce(function (result, item) {
    return result + (parseFloat(item.cost) * item.count);
  }, 0);

  modalPrice.textContent = totalPrice + ' ₽';
}

function changeCount (event) {
  const target = event.target;

  if (target.classList.contains('counter-button')) {
    const food = cart.find(function (item) {
      return item.id === target.dataset.id;
    });
    if (target.classList.contains('counter-minus')) {
      food.count--;
      if (food.count === 0) {
        cart.splice(cart.indexOf(food), 1);
      }
    }
    if (target.classList.contains('counter-plus')) food.count++;
    renderCart();
    saveCart();
  }
}

function init () {
  getData('./db/partners.json').then(function(data) {
    data.forEach(createCardRestaurant);
  });
  
  cartButton.addEventListener('click', function () {
    renderCart();
    toggleModal();
  });

  buttonClearCart.addEventListener('click', function () {
    cart.length = 0;
    renderCart();
    saveCart();
  });

  modalBody.addEventListener('click', changeCount);

  cardsMenu.addEventListener('click', addToCart);
  
  close.addEventListener('click', toggleModal);
  
  cardsRestaurants.addEventListener('click', openGoods);
  
  logo.addEventListener('click', function () {
    containerPromo.classList.remove('hide');
    restaurants.classList.remove('hide');
    menu.classList.add('hide');
  });
  
  checkAuth();
  
  new Swiper('.swiper-container', {
    loop: true,
    autoplay: {
      delay: 2000,
    },
    speed: 1500,
    slidesPerView: 1,
  });
}

init();

new WOW({mobile: false}).init();