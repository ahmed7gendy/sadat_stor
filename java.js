var firebaseConfig = {
	apiKey: "AIzaSyBXLhnKuTXRFX5PkjaR7m1d8H-_s1UQjrM",
    authDomain: "para-fdf7c.firebaseapp.com",
    databaseURL: "https://para-fdf7c-default-rtdb.firebaseio.com",
    projectId: "para-fdf7c",
    storageBucket: "para-fdf7c.appspot.com",
    messagingSenderId: "1098599277771",
    appId: "1:1098599277771:web:417daeb561bb13e453274e",
    measurementId: "G-SZCCFG0GK8"
};
firebase.initializeApp(firebaseConfig);

var database = firebase.database();
   




// عرض المنتجات
var productsDiv = document.querySelector('.products');
database.ref('products').once('value', function(snapshot) {
	snapshot.forEach(function(childSnapshot) {
		var childData = childSnapshot.val();
		var productDiv = document.createElement('div');
		productDiv.classList.add('product');
		productDiv.innerHTML = `
			<img src="${childData.image}">
			<h2>${childData.name}</h2>
			<p>${childData.price} جنيه</p>
			<button class="add-to-cart" data-product-id="${childSnapshot.key}">أضف للسلة</button>
		`;
		productsDiv.appendChild(productDiv);
	});
});

// إضافة المنتجات إلى السلة
var cart = {};
var cartTable = document.querySelector('.checkout table');
productsDiv.addEventListener('click', function(event) {
	if (event.target.classList.contains('add-to-cart')) {
		var productId = event.target.getAttribute('data-product-id');
		if (cart[productId]) {
			cart[productId].quantity++;
			cart[productId].totalPrice = cart[productId].quantity * cart[productId].price;
			updateCartTable();
		} else {
			database.ref('products/' + productId).once('value', function(snapshot) {
				var productData = snapshot.val();
				productData.quantity = 1;
				productData.totalPrice = productData.price;
				cart[productId] = productData;
				updateCartTable();
			});
		}
	}
});

// تحديث سلة المنتجات
function updateCartTable() {
  cartTable.innerHTML = `
    <tr>
      <th>اسم المنتج</th>
      <th>السعر</th>
      <th>الكمية</th>
      <th>سعر الكمية</th>
      <th>حذف</th>
    </tr>
  `;
  var totalPrice = 0;
  Object.keys(cart).forEach(function(productId) {
    var product = cart[productId];
    var row = document.createElement('tr');
    row.innerHTML = `
      <td>${product.name}</td>
      <td>${product.price} جنيه</td>
      <td>
        <button class="increase-quantity" data-product-id="${productId}">+</button>
        ${product.quantity}
        <button class="decrease-quantity" data-product-id="${productId}">-</button>
      </td>
	  <td class="total-price" data-total-price="${product.totalPrice}">${product.totalPrice} جنيه</td>
      <td><button class="remove-from-cart" data-product-id="${productId}">حذف</button></td>
    `;
    cartTable.appendChild(row);
	database.ref('products/' + productId + '/totalPrice').set(product.totalPrice);
totalPrice += product.totalPrice;
  });
  var totalRow = document.createElement('tr');
  totalRow.innerHTML = `
    <td colspan="4">السعر الإجمالي</td>
    <td>${totalPrice} جنيه</td>
  `;
  cartTable.appendChild(totalRow);

  // تحديث اسم الحقل
  var priceFields = document.querySelectorAll('.total-price');
  priceFields.forEach(function(field) {
	field.textContent = field.dataset.totalPrice + ' جنيه';  });
}
// إزالة المنتجات من السلة
cartTable.addEventListener('click', function(event) {
  if (event.target.classList.contains('remove-from-cart')) {
    var productId = event.target.getAttribute('data-product-id');
    delete cart[productId];
    updateCartTable();
  } else if (event.target.classList.contains('increase-quantity')) {
    var productId = event.target.getAttribute('data-product-id');
    cart[productId].quantity++;
    cart[productId].totalPrice = cart[productId].price * cart[productId].quantity;
    updateCartTable();
  } else if (event.target.classList.contains('decrease-quantity')) {
    var productId = event.target.getAttribute('data-product-id');
    if (cart[productId].quantity > 1) {
      cart[productId].quantity--;
      cart[productId].totalPrice = cart[productId].price * cart[productId].quantity;
      updateCartTable();
    }
  }
});

// تسجيل الطلب
var checkoutBtn = document.querySelector('#checkout-btn');
checkoutBtn.addEventListener('click', function(event) {
  event.preventDefault();
  var phone = document.querySelector('#phone').value;
  var address = document.querySelector('#address').value;
  var cname = document.querySelector('#cname').value;
  if (!phone || !address ||!cname) {
    alert('يرجى إدخال رقم الهاتف والعنوان');
  } else {
    var totalPrice = 0;
    Object.keys(cart).forEach(function(productId) {
      totalPrice += cart[productId].totalPrice;
    });
    database.ref('orders').push({
      phone: phone,
      address: address,
      cname: cname,
      products: cart,
      totalPrice: totalPrice
    })
	.then(function(result) {
	            alert('تم تسجيل الطلب بنجاح');
	            cart = {};
	            updateCartTable();
	            document.querySelector('#phone').value = '';
	            document.querySelector('#address').value = '';
	            document.querySelector('#name').value = '';
	        })
	        .catch(function(error) {
	            alert('حدث خطأ أثناء تسجيل الطلب');
	            console.log(error);
    });
  }
});








