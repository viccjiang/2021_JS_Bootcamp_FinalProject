// 所有產品資料
let productData = [];
// 所有購物車資料
let cartData = [];
// 產品列表 DOM
const productList = document.querySelector(".productWrap")
// 下拉選單 DOM
const productSelect = document.querySelector(".productSelect")
// 購物車列表 DOM
const cartList = document.querySelector(".shoppingCart-tableList")
// 刪除全部購物車按鈕 DOM
const discardAllBtn = document.querySelector(".discardAllBtn")
// 送出訂單按鈕 DOM
const orderInfoBtn = document.querySelector(".orderInfo-btn")
// 綁定 form 表單
const orderInfoForm = document.querySelector(".orderInfo-form")
// 初始化畫面
function init() {
  getProductList()
  getCartList()
}
init();

// 取得產品列表
function getProductList() {
  axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/products`).
    then(function (response) {
      // console.log(response.data);
      productData = response.data.products;
      console.log('產品列表', productData);
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
        <a href="#" class="js-addCart" id="addCardBtn" data-id="${item.id}">加入購物車</a>
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

// 加入購物車按鈕行為，要綁定 productList 綁監聽
// 按鈕綁監聽的方式是先監聽整個 list 也就是 ul ( 用外層去操作內層 dom )
productList.addEventListener("click", function (e) {
  e.preventDefault(); //取消預設默認行為
  let addCartClass = e.target.getAttribute("class");
  if (addCartClass !== "js-addCart") {
    alert("您沒按到加入購物車按鈕喔");
    return;
  }
  // 取出 id 資料，加入購物車
  let productId = e.target.getAttribute("data-id")
  let numCheck = 1; //預設都是一筆資料
  cartData.forEach(function (item) {
    if (item.product.id == productId) {
      numCheck = item.quantity += 1;
    }
  })
  // 新增邏輯 post，要看文件後端指定的格式
  axios.post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`,
    {
      "data": {
        "productId": productId,
        "quantity": numCheck
      }
    }).then(function (response) {
      alert("已加入購物車");
      console.log(productId); //查看這個產品的id
      getCartList(); //每做完一件事情後，重新render渲染購物車列表
    })
})

// 取得購物車列表
function getCartList() {
  axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`).
    then(function (response) {
      const jsTotal = document.querySelector(".js-total"); // 總金額
      jsTotal.textContent = response.data.finalTotal;
      cartData = response.data.carts;
      console.log('購物車列表', cartData);
      renderCartList();
    })
    .catch(function (error) {
      console.log(error)
    })
}

// 渲染購物車列表在畫面上
function renderCartList() {
  let str = "";
  cartData.forEach(function (item) {
    str += `<tr>
              <td>
                <div class="cardItem-title">
                    <img src="${item.product.images}" alt="">
                    <p>${item.product.title}</p>
                </div>
              </td>
              <td>NT$${item.product.price}</td>
              <td>${item.quantity}</td>
              <td>NT$${item.product.price * item.quantity}</td>
              <td class="discardBtn">
                  <a href="#" class="material-icons " data-id="${item.id}">
                      clear
                  </a>
              </td> 
              
            </tr>`
  })
  cartList.innerHTML = str;
}

// 刪除購物車內的單一產品
cartList.addEventListener("click", function (e) {
  e.preventDefault();

  const cartId = e.target.getAttribute("data-id") // 此筆訂單 id (要注意這裡不是產品 id) 也就是取到刪除單筆購物車 id
  console.log(cartId);
  if (cartId == null) { //要排除點到其他的地方
    alert("沒點對地方")
    return;
  }
  axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts/${cartId}`)
    .then(function (response) {
      // console.log(response.data);
      alert("已刪除此筆購物車訂單")
      getCartList(); // 重新取得購物車資料
    })
})

// 刪除購物車全部的產品
discardAllBtn.addEventListener("click", function (e) {
  e.preventDefault();
  axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`)
    .then(function (response) {
      console.log(response.data);
      alert("刪除全部購物車成功！");
      getCartList(); // 重新取得購物車資料
    })
    .catch(function (response) {
      alert("購物車已清空，請勿重複點擊")
    })
})

// 表單驗證 Validate
function formValidate() {
  const inputs = document.querySelectorAll("input[name],select[data=payment]");
  // console.log(inputs);
  const form = document.querySelector(".orderInfo-form");
  const constraints = {
    "姓名": {
      presence: {
        message: "必填欄位"
      }
    },
    "電話": {
      presence: {
        message: "必填欄位"
      },
      length: {
        minimum: 8,
        message: "需超過 8 碼"
      }
    },
    "信箱": {
      presence: {
        message: "必填欄位"
      },
      email: {
        message: "格式錯誤"
      }
    },
    "寄送地址": {
      presence: {
        message: "必填欄位"
      }
    },
    "交易方式": {
      presence: {
        message: "必填欄位"
      }
    },
  };

  inputs.forEach((item) => {
    item.addEventListener("change", function () {
      // console.log(item.nextElementSibling);
      item.nextElementSibling.textContent = '';
      let errors = validate(form, constraints) || '';
      console.log(errors)

      if (errors) {
        Object.keys(errors).forEach(function (keys) {
          // console.log(Object.keys(errors));

          console.log(document.querySelector(`[data-message=${keys}]`))
          document.querySelector(`[data-message="${keys}"]`).textContent = errors[keys];
        })
      }
    });
  });
}
formValidate();

// 送出訂單流程，送出預定資料按鈕綁監聽
orderInfoBtn.addEventListener("click", function (e) {
  e.preventDefault(); // 消除預設默認行為
  // console.log(e.target);

  //先確認購物車是否有資訊
  if (cartData.length == 0) {
    alert("請加入購物車");
    return;
  }



  // 綁定 DOM 並且取出表單裡面的值
  const customerName = document.querySelector("#customerName").value;
  const customerPhone = document.querySelector("#customerPhone").value;
  const customerEmail = document.querySelector("#customerEmail").value;
  const customerAddress = document.querySelector("#customerAddress").value;
  const customerTradeWay = document.querySelector("#tradeWay").value;

  // //若表單有空值空字串時就跑return
  // if (customerName == "" || customerPhone == "" || customerEmail == "" || customerAddress == "" || customerTradeWay == "") {
  //   alert("請輸入訂單資料"); //若表單有空值空字串時就跑return
  //   return;
  // }

  axios.post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/orders`,
    {
      "data": {
        "user": {
          "name": customerName,
          "tel": customerPhone,
          "email": customerEmail,
          "address": customerAddress,
          "payment": customerTradeWay
        }
      }
    }
  )
    .then(function (response) {
      alert("訂單建立成功");

      //方法一：訂單建立成功後，清空資料，變回空字串
      orderInfoForm.reset();

      //方法二：訂單建立成功後，清空資料，變回空字串
      // document.querySelector("#customerName").value = "";//訂單建立成功後，清空資料，變回空字串
      // document.querySelector("#customerPhone").value = "";
      // document.querySelector("#customerEmail").value = "";
      // document.querySelector("#customerAddress").value = "";
      // document.querySelector("#tradeWay").value = "ATM";//訂單建立成功後，初始值

      getCartList(); //重新取得購物車資料
    })
})


