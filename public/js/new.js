const predefinedData = {
    "Grocery": {
        "Rice & Pulses":{brands:["Daawat","India Gate","Daawat","Tata","24 Mantra","Shree Lal Mahal","Madhuri","Fortune","Aashirvaad","Madhuri","Kohinoor"]},


        "Milk": { brands: ["Amul", "Mother Dairy",
        "Parag","Gyan","Aavin","Nandini","Verka","Omfed","Mimul","Milma","Gokul","Saras"] },

        "Flours & Atta":{brands:["Aashirvaad","Pillsbury","Annapurna","Nature Fresh","Fortune","Shakti Bhogh","Patanjali","Sujata","rajdhani","MTR"]},
    
        "Oils & Ghee":{brands:["Fortune","Saffola","Dharmani","Patanjali","Amul Ghee","Mother Dairy","Surya","Bansal","Rath","KTC"]},

        "Sugar & Salt":{brands:["Tata","Shakti Bhog","Dalmia","Fortune","Nirma","Aashirvaad","Tata Salt","Indo Nissin","Sujata"]},

        "Spices & Masalas":{brands:["MDH","Everest","Shan","Catch","Badshah","Patanjali","Ramdev","Keya","Surya Masala","Sampann","Goldiee"]},

        "Tea & Coffee":{brands:["Tata Tea","Brooke Bond","Twinings","Nescafe","Bru","Lipton","Tea Trunk","Tata Gold","Leo Coffee","Cafe Coffee Day"]},

        "Dry Fruits & Nuts":{brands:["Nutraj","Wonderland","Rostaa","Borges","Happilo","Golden Nut","Tulsi","24 Mantra","Nourish You","True Elements"]},

        "Cereals & Breakfast Foods":{brands:["Kellogg's","Bagrry’s","Quaker","Britannia","MTR","Saffola","Nestlé"]},

        "Bread":{brands:["Britannia","Modern","Nature Fresh","Harvest Gold","Bonn","English Oven","Cremica","Patanjali","Monginis","Bread & More","Gomati","Bakey","Bread Basket","Bread Talk","Bread World","Bread Box","Bread Basket"]},

        "Biscuits & Snacks":{brands:["Britannia","Parle-G","Treat","Hide & Seek","Lays","Bingo!","Kurkure","Unibic","McVitie’s","Britannia Tiger"]},

        "Chocolates & Sweets":{brands:["Cadbury","Amul","Nestlé","Lindt","Hershey’s","Bournville","Mars","Toblerone","Perk","KitKat"]},
    }
};

let selectedProducts = {};
let selectedBrands = {};

function loadCategories() {
    const categoryList = document.getElementById("category-list");
    categoryList.innerHTML = '';
    Object.keys(predefinedData).forEach(category => {
        categoryList.innerHTML += `
            <div class="col-6">
                <div class="card-selection" onclick="selectCategory('${category}', this)">
                    ${category}
                </div>
            </div>`;
    });
}

function selectCategory(category, element) {
    const allCategoryElements = document.querySelectorAll(".card-selection");
    allCategoryElements.forEach(el => el.classList.remove("selected"));
    element.classList.add("selected");
    showProducts(category);
}

function showProducts(category) {
    const productList = document.getElementById("product-list");
    productList.innerHTML = '';
    document.getElementById("product-container").style.display = "block";

    Object.keys(predefinedData[category]).forEach(product => {
        productList.innerHTML += `
            <div class="col-6">
                <div class="card-selection" onclick="toggleProductSelection('${category}', '${product}', this)">
                    ${product}
                </div>
            </div>`;
    });
}

function toggleProductSelection(category, product, element) {
    element.classList.toggle("selected");
    if (element.classList.contains("selected")) {
        selectedProducts[product] = category;
    } else {
        delete selectedProducts[product];
    }
    updateBrandSelection();
}

function updateBrandSelection() {
    const brandList = document.getElementById("brand-list");
    brandList.innerHTML = '';
    document.getElementById("brand-container").style.display = Object.keys(selectedProducts).length ? "block" : "none";

    Object.keys(selectedProducts).forEach(product => {
        const category = selectedProducts[product];
        brandList.innerHTML += `<h6>${product}</h6>`;
        predefinedData[category][product].brands.forEach(brand => {
            brandList.innerHTML += `
                <span class="brand-badge" onclick="toggleBrandSelection('${product}', '${brand}', this)">
                    ${brand}
                </span>`;
        });
    });
}

function toggleBrandSelection(product, brand, element) {
    element.classList.toggle("selected");
    const key = `${product}-${brand}`;
    if (element.classList.contains("selected")) {
        selectedBrands[key] = { product, brand, quantity: 1, price: 0, image: '' };
    } else {
        delete selectedBrands[key];
    }
    updateQuantityAndPriceSelection();
}

function updateQuantityAndPriceSelection() {
    const quantityContainer = document.getElementById("quantity-container");
    const selectedBrandsList = document.getElementById("selected-brands-list");
    selectedBrandsList.innerHTML = '';

    if (Object.keys(selectedBrands).length > 0) {
        quantityContainer.style.display = "block";
        Object.entries(selectedBrands).forEach(([key, data]) => {
            selectedBrandsList.innerHTML += `
                <div class="d-flex align-items-center mb-2">
                    <span class="me-3">${data.product} - <strong>${data.brand}</strong></span>
                    <select class="form-select w-25" onchange="updateBrandQuantity('${key}', this)">
                        <option value="1">1 Piece</option>
                        <option value="5">5 Pieces</option>
                        <option value="10">10 Pieces</option>
                    </select>
                    <input type="number" class="form-control w-25 ms-3" placeholder="Price" onchange="updateBrandPrice('${key}', this)">
                    <input type="text" class="form-control w-25 ms-3" placeholder="Image URL" onchange="updateBrandImage('${key}', this)">
                </div>`;
        });
    } else {
        quantityContainer.style.display = "none";
    }
}

function updateBrandQuantity(key, element) {
    selectedBrands[key].quantity = element.value;
}

function updateBrandPrice(key, element) {
    selectedBrands[key].price = element.value;
}

function updateBrandImage(key, element) {
    selectedBrands[key].image = element.value;
}

document.addEventListener("DOMContentLoaded", loadCategories);

document.querySelector("form").addEventListener("submit", function (event) {
    const selectedProductsInput = document.createElement("input");
    selectedProductsInput.type = "hidden";
    selectedProductsInput.name = "selectedProducts";
    selectedProductsInput.value = JSON.stringify(Object.values(selectedBrands));
    this.appendChild(selectedProductsInput);
});
