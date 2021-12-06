// 所有產品
let productData = [];

// 產品列表
const productList = document.querySelector(".productWrap")
const productSelect = document.querySelector(".productSelect")

// 初始畫面
function init() {
  getProductList()
}
init();

// 取得產品列表
function getProductList() {
  axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/products`).
    then(function (response) {
      // console.log(response.data);
      productData = response.data.products;
      // console.log(productData);
      renderDataList();
    })

    .catch(function (error) {
      console.log(error)
    })
}

// 渲染產品列表到畫面上
function renderDataList() {
  let str = "";
  productData.forEach(function (item) {
    str += combineProductStr(item);
  })
  productList.innerHTML = str;
}

// 組產品字串
function combineProductStr(item) {
  return `<li class="productCard">
        <h4 class="productType">新品</h4>
        <img
          src="${item.images}"
          alt="">
        <a href="#" class="js-addCart"  id="addCardBtn" data-id="${item.id}">加入購物車</a>
        <h3>${item.title}</h3>
        <del class="originPrice">NT$${item.origin_price}</del>
        <p class="nowPrice">NT$${item.price}</p>
      </li>`
}

// 下拉選單 category
productSelect.addEventListener("change", function (e) {
  // console.log(e.target.value);
  const category = e.target.value;
  // console.log(category);
  if (category == "全部") {
    renderDataList()
    return;
  }
  let str = "";
  productData.forEach(function (item) {
    if (item.category == category) {
      str += combineProductStr(item)
    }
  })
  productList.innerHTML = str;
})



