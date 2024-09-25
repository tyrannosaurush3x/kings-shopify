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

const make_line_items = (line_items, type) => {
  let sol = []
  for (let i = 0; i < line_items.length; i++) {
    if (type == 0) {
      let item = { "catalogObjectType": "Product", "catalogObjectId": line_items[i].merchandise.product.id, "price": line_items[i].merchandise.product.price, "quantity": line_items[i].quantity }
    } else {
      let item = { "catalogObjectType": "Product", "catalogObjectId": line_items[i].id }
    }
    sol.append(item)
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

const make_purchase = (line_items, shop_id) => {
  let payload = {
    "interaction": {
      "name": "Purchase",
      "id": "",
      "totalValue": "",
      "lineItems": []
    },
    "user": {
      "anonymousId": shop_id,
      "identities": { "shopifyId": shop_id }
    }
  }
  sol = make_line_items(line_items, 1)
  payload.interaction.lineItems = sol
  return JSON.stringify(payload)
}

analytics.subscribe('cart_viewed', (event) => {
  var raw = make_view_cart(event.data.cart.lines, event.clientId)
  send_event(raw)
})

analytics.subscribe('checkout_completed', (event) => {
  var raw = make_purchase(event.data.checkout.lineItems, event.clientId)
  send_event(raw)
});

analytics.subscribe('product_added_to_cart', (event) => {
  var raw = make_add_remove_cart(event.data.cartLine, event.clientId, "add")
  send_event(raw)
});

analytics.subscribe('product_removed_from_cart', (event) => {
  var raw = make_add_remove_cart(event.data.cartLine, event.clientId, "remove")
  send_event(raw)
});
