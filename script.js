const send_event = (raw) => {
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  var requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
    redirect: 'follow'
  };
  console.log('The payload:')
  console.log(raw)
  fetch("https://sacramentokings.us-6.evergage.com/api2/event/shopify_test", requestOptions)
    .then(response => response.text())
    .then(result => console.log(result))
    .catch(error => console.log('error', error));
}

const get_mcp_cookie = () => {
  const uuidPattern = /uuid/;
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    cookie = cookie.trim();
    if (cookie.includes('evg')) {
      const [name, value] = cookie.split('=');
      if (uuidPattern.test(value)) {
        let parsed_id = JSON.parse(decodeURIComponent(value)).uuid
        return parsed_id.trim()
      }
    }
  }
  return null;
}

const make_line_items = (line_items, type) => {
  let sol = []
  let item = {}
  for (let i = 0; i < line_items.length; i++) {
    if (type == 0) {
      item = { "catalogObjectType": "Product", "catalogObjectId": line_items[i].merchandise.product.id, "price": line_items[i].merchandise.product.price, "quantity": line_items[i].quantity }
    } else {
      item = { "catalogObjectType": "Product", "catalogObjectId": line_items[i].id }
    }
    sol.push(item)
  }
  return sol
}

const make_add_remove_cart = (lineItem, shop_id, add_or_remove) => {
  let payload = {
    "interaction": {
      "name": "",
      "lineItem": { "catalogObjectType": "Product", "catalogObjectId": lineItem.merchandise.id, "price": lineItem.merchandise.price.amount, "quantity": lineItem.quantity }
    },
    "user": {
      "anonymousId": shop_id,
      "identities": { "shopifyId": shop_id }
    }
  }
  if (add_or_remove == "add") {
    payload.interaction.name = "Add To Cart"
  } else {
    payload.interaction.name = "Remove From Cart"
  }
  return JSON.stringify(payload)
}

const make_view_cart = (line_items, shop_id) => {
  let payload = {
    "interaction": {
      "name": "Replace Cart",
      "lineItems": []
    },
    "user": {
      "anonymousId": shop_id,
      "identities": { "shopifyId": shop_id }
    }
  }
  sol = make_line_items(line_items, 0)
  payload.interaction.lineItems = sol
  return JSON.stringify(payload)
}

const make_purchase = (line_items, shop_id, value, id) => {
  let payload = {
    "interaction": {
      "name": "Purchase",
      "order": {
          "id": id,
        "lineItems": []
      }
    },
    "user": {
        "anonymousId": shop_id
    }
  }
  sol = make_line_items(line_items, 1)
  payload.interaction.lineItems = sol
  return JSON.stringify(payload)
}

analytics.subscribe('cart_viewed', (event) => {
  const user_anon_id = get_mcp_cookie()
  var raw = make_view_cart(event.data.cart.lines, user_anon_id)
  send_event(raw)
})

analytics.subscribe('checkout_completed', (event) => {
  const user_anon_id = get_mcp_cookie()
  var totalVal = event.data.checkout.totalPrice
  var orderId = event.id
  var raw = make_purchase(event.data.checkout.lineItems, user_anon_id, totalVal, orderId)
  send_event(raw)
});

analytics.subscribe('product_added_to_cart', (event) => {
  const user_anon_id = get_mcp_cookie()
  var raw = make_add_remove_cart(event.data.cartLine, user_anon_id, "add")
  send_event(raw)
});

analytics.subscribe('product_removed_from_cart', (event) => {
  const user_anon_id = get_mcp_cookie()
  var raw = make_add_remove_cart(event.data.cartLine, user_anon_id, "remove")
  send_event(raw)
});
