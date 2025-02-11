const closeCartButton = document.querySelector('.close-cart');
const cartBtn = document.querySelector('.cart-btn');
const clearCartBtn = document.querySelector('.clear-cart');
const cartDOM = document.querySelector('.cart');
const cartOverlay = document.querySelector('.cart-overlay');
const cartItems = document.querySelector('.cart-items');
const cartTotal = document.querySelector('.cart-total');
const cartContent = document.querySelector('.cart-content');
const productDOM = document.querySelector('.products-center');



let cart = [];
// cart.push(8);
// console.log(cart);
let buttonsDOM = [];
//geting Products;

class Products{
    async getProducts() {
        try {
            const res = await fetch('products.json');
            // console.log("Status:",res.status);
            if(!res.ok){
                throw new Error('http not ok ');
            }
            const data = await res.json();
            let products = data.items;
            products = products.map(item => {
               const {title, price} = item.fields;
               const {id} = item.sys;
               const image = item.fields.image.fields.file.url;
               return{title, price, id, image};
            })
            // console.log(products);
        return products;
        } catch (err) {
            console.log(err.message);
        }
    }

    
    
}


//displaying Prodcuts
class UI{
displayProducts(products){
    let result = '';
    products.forEach(product => {
        result +=`
        <article class="product">
            <div class="img-container">
                <img src= ${product.image} alt = "product"
                class = "product-img">
                <button class="bag-btn" data-id = ${product.id}>
                    <i class = "fas fa-shopping-cart"></i>
                    add to cart
                </button>
            </div>
            <h3>${product.title}</h3>
            <h4>$${product.price}</h4>
           </article>
        `
    });
    productDOM.innerHTML = result;
}
getBagButtons(){
    const buttons = [...document.querySelectorAll('.bag-btn')];
    buttonsDOM = buttons;
    buttons.forEach(button => {
    let id  = button.dataset.id;
    let inCart = cart.find(item => item.id === id);
    if(inCart){
        button.innerText = "In cart";
        button.disabled = true;
    }
        button.addEventListener('click', e => {
            e.target.innerText = "In Cart";
            e.target.disabled = true;
           
            //get product from products
            let cartItem = {...Storage.getProducts(id), amount: 1};
            //add product to the cart 
            // cart.push(cartItem);
            cart = [...cart, cartItem];
            //save cart in local storage
            Storage.saveCart(cart);
            //set cart values
            this.updateCartValues(cart);

            //display cart items 
            this.addCartItems(cartItem);

            //show the cart
            this.showCart();

            //close the cart
            this.closeCart();

            //clear cart

        })  
    }) 
}

updateCartValues(cart){
    let tempTotal = 0;
    let itemsTotal = 0;
    cart.map(item => {
       tempTotal += item.price * item.amount;
       itemsTotal += item.amount;
    });
    cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
    cartItems.innerText = itemsTotal;
 }
 

addCartItems(item) {
    const div = document.createElement('div');
    div.classList.add('cart-item');
    div.innerHTML = `
    <img src= ${item.image} alt = "product"/>
                    <div>
                        <h4>${item.title}</h4>
                        <h4>$${item.price}</h4>
                        <span class="remove-item"  data-id = ${item.id}>remove</span>
                    </div>
                    <div>
                     <i class = "fas fa-chevron-up"  data-id = ${item.id}></i>
                     <p class = "item-amount">${item.amount}</p>
                     <i class = "fas fa-chevron-down"  data-id = ${item.id}></i>  
                    </div>
    `
    cartContent.appendChild(div);

}
showCart(){
cartOverlay.classList.add('transparentBcg');
cartDOM.classList.add('showCart');
}

closeCart(){
        cartDOM.classList.remove('showCart');
        cartOverlay.classList.remove('transparentBcg');
}


setupAPP(){
      cart = Storage.getCart();
      this.updateCartValues(cart);
      this.populate(cart);
      cartBtn.addEventListener('click', this.showCart);
      closeCartButton.addEventListener('click',this.closeCart);
}

populate(cart){
    cart.forEach(item => this.addCartItems(item));
}

cartLogic(){
    clearCartBtn.addEventListener('click', () =>{
        this.clearCart();
    });

    cartContent.addEventListener('click', e => {
        // console.log(e.target);
        if(e.target.classList.contains('remove-item'))
        {
            let removeItem = e.target;
            let id = removeItem.dataset.id;
            // cartContent
            cartContent.removeChild(removeItem.parentElement.parentElement);
            this.removeItem(id);
        }
    
        else if(e.target.classList.contains('fa-chevron-up')){
            let addAmount = e.target;
            let id = addAmount.dataset.id;
            let tempItem = cart.find(item => item.id === id);
            tempItem.amount = tempItem.amount + 1;
            Storage.saveCart(cart);
            this.updateCartValues(cart);
            addAmount.nextElementSibling.innerText = tempItem.amount;
        }
        else if(e.target.classList.contains('fa-chevron-down')){
          let lowerAmount = e.target;
          let id = lowerAmount.dataset.id;
          let tempItem = cart.find(item => item.id === id);
          tempItem.amount = tempItem.amount - 1;
          if(tempItem.amount > 0){
              Storage.saveCart(cart);
              this.updateCartValues(cart);
              lowerAmount.previousElementSibling.innerText = tempItem.amount;
          }
          else{
            cartContent.removeChild(lowerAmount.parentElement.parentElement);
            this.removeItem(id);
          }
        }
      })
}

clearCart(){
   let cartItems = cart.map(item => item.id);
//    console.log(cartContent.children);
  cartItems.forEach(id => this.removeItem(id))
  while(cartContent.children.length > 0){
    cartContent.removeChild(cartContent.children[0]);
}
this.closeCart();
}


removeItem(id){
    cart = cart.filter(item => item.id !== id)
    console.log("Item removed: ", id);
    this.updateCartValues(cart);
    Storage.saveCart(cart);
    console.log("Item removed: ", id);
    let button = this.getSingleButton(id);
    button.disabled = false;
    button.innerHTML = `<i class = "fas fa-shopping-cart"></i>add to cart`;
}

getSingleButton(id){
    return buttonsDOM.find(button => button.dataset.id === id);
}

}

//local storage
class   Storage{
  static saveProducts(products){
  localStorage.setItem("products", JSON.stringify(products));
  }

  static getProducts(id){
    let products = JSON.parse(localStorage.getItem("products"));
    return products.find(product => product.id === id);
  }

  static saveCart(cart){
    localStorage.setItem('cart', JSON.stringify(cart))
  }

  static getCart(){
    return localStorage.getItem('cart')?JSON.parse
    (localStorage.getItem('cart')):[];
  }

}

document.addEventListener("DOMContentLoaded", () => {
    const ui = new UI();
    const products = new Products();
    ui.setupAPP();
    // ui.clearCart();

    //get products
    products.getProducts().then(products => {
        ui.displayProducts(products);
        Storage.saveProducts(products);
      }).then(() => {
        ui.getBagButtons();
        ui.cartLogic();
      });
    });



    //set cart values
    //display cart item
    //show the cart 