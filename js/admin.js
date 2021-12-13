//空陣列拿來放訂單資料
let orderData = [];
//抓取訂單DOM
const orderList = document.querySelector(".js-orderList")

//初始化資料
function init() {
    getOrderList();
}
init();

// 取得訂單列表
function getOrderList() {
    axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,
        {
            headers: {
                'Authorization': token
            }
        })
        .then(function (response) {
            orderData = response.data.orders;
            console.log('訂單列表', orderData);
            renderOrderList();
            renderC3()

        })
        .catch(function (error) {
            console.log(error)
        })
}

// 渲染訂單列表在畫面上
function renderOrderList() {
    let str = "";
    orderData.forEach(function (item) {
        // 組時間字串
        const timeStamp = new Date(item.createdAt * 1000); //乘上1000毫秒 會變成13碼  new Date要搭配13碼
        const orderTime = `${timeStamp.getFullYear()}/${timeStamp.getMonth() + 1}/${timeStamp.getDate()}`;//組出想要的時間格式結構，getMonth要+1
        // 組產品字串
        let productItemStr = "";
        item.products.forEach(function (productItem) {
            productItemStr = `<p>${productItem.title} x ${productItem.quantity}</p>`
        })
        // 判斷訂單處理狀態
        let orderStatus = "";
        if (item.paid == true) {
            orderStatus = "已處理";
        } else {
            orderStatus = "未處理";
        }

        str += `<tr>
        <td>${item.id}</td>
        <td>
            <p>${item.user.name}</p>
            <p>${item.user.tel}</p>
        </td>
        <td>${item.user.address}</td>
        <td>${item.user.email}</td>
        <td>
            <p>${productItemStr}</p>
        </td>
        <td>${orderTime}</td>
        <td class="js-orderStatus" >
            <a href="#" data-status="${item.paid}" class="orderStatus" data-id="${item.id}">${orderStatus}</a>
        </td>
        <td>
            <input type="button" class="delSingleOrder-Btn js-orderDelete" data-id="${item.id}" value="刪除">
        </td>
    </tr>`
    })
    orderList.innerHTML = str;
}

// 訂單狀態＆刪除的操作按鈕 主要會取到這兩個值 data-status js-orderDelete  
orderList.addEventListener("click", function (e) {
    e.preventDefault();
    const targetClass = e.target.getAttribute("class");
    let id = e.target.getAttribute("data-id");


    if (targetClass == "delSingleOrder-Btn js-orderDelete") {
        deletOrderItem(id);
        return;
    }
    if (targetClass == "orderStatus") {
        let status = e.target.getAttribute("data-status");
        updateStatus(status, id);
        return;
    }


})

//更新訂單狀態
function updateStatus(status, id) {
    let newStatus;
    //改狀態 已處理與未處理判斷式
    //取得的 e.target.getAttribute("data-status") 目前是字串
    if (status == 'true') {
        newStatus = false;
    } else {
        newStatus = true
    }
    axios.put(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`, {
        "data": {
            "id": id,
            "paid": newStatus
        }
    }, {
        headers: {
            'Authorization': token,
        }
    })
        .then(function (response) {
            alert("修改訂單成功");
            getOrderList();//重新渲染
        })
}

// 刪除該筆特定訂單
function deletOrderItem(id) {
    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders/${id}`, {
        headers: {
            'Authorization': token,
        }
    })
        .then(function (response) {
            alert("刪除該筆訂單成功");
            getOrderList();//重新渲染
        })

}

// 綁定刪除全部訂單DOM
const discardAllBtn = document.querySelector(".discardAllBtn");
// 刪除全部訂單
discardAllBtn.addEventListener("click", function (e) {
    e.preventDefault();
    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`, {
        headers: {
            'Authorization': token,
        }
    })
        .then(function (response) {
            alert("刪除全部訂單成功");
            getOrderList(); //重新渲染
        })
})

function renderC3() {

    // 物件資料蒐集
    let chartData = {};
    orderData.forEach(function (item) {
        item.products.forEach(function (productItem) {
            if (chartData[productItem.category] == undefined) {
                chartData[productItem.category] = productItem.price * productItem.quantity;
            } else {
                chartData[productItem.category] = productItem.price * productItem.quantity;
            }
        })
    })
    console.log(chartData); // {收納: 3780, 床架: 15000, 窗簾: 1200}

    // 做出資料關聯
    let categoryAry;
    categoryAry = Object.keys(chartData);
    console.log(categoryAry); //  ['收納', '床架', '窗簾']

    let newData = [];
    categoryAry.forEach(function (item) {
        let ary = [];
        ary.push(item);
        ary.push(chartData[item]);
        newData.push(ary);
    })
    console.log(newData); //  ['收納', 3780]   ['床架', 15000]  ['窗簾', 1200]

    // C3.js
    let chart = c3.generate({
        bindto: '#chart', // HTML 元素綁定
        data: {
            type: "pie",
            columns: newData,

            colors: {
                "收納": "#9D7FEA",
                "床架": "#5434A7",
                "窗簾": "#DACBFF",
            }
        },
    });
}



