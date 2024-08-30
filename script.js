var myHeaders = new Headers();
myHeaders.append("Content-Type", "application/json");

// analytics.subscribe("all_standard_events", event => {
//   console.log("Event data ", event?.data);
//   console.log("Client ID", event.clientId);
//   var shop_id = event.clientId


analytics.subscribe('cart_viewed', (event) => {
  var shop_id = event.clientId
  var line_items = event.data.cart.lines;
  var ids = []
  for (var i = 0; i < line_items.length; i++) {
    var id = line_items[i].merchandise.product.id
    ids.push({ "_id": id })
  }
  var raw = JSON.stringify({
    "user": {
      "id": shop_id
    },
    "itemAction": "View Cart",
    "cart": {
      "complete": {
        "Product": ids
      }
    }
  }
  );
  var requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
    redirect: 'follow'
  };
  fetch("https://sacramentokings.us-6.evergage.com/api2/event/shopify_test", requestOptions)
    .then(response => response.text())
    .then(result => console.log(result))
    .catch(error => console.log('error', error));

})

analytics.subscribe('checkout_completed', (event) => {
  // Example for accessing event data
  const checkout = event.data.checkout;

  const checkoutTotalPrice = checkout.totalPrice?.amount;

  const checkoutId = checkout.token;
  const checkoutId2 = event.id;
  console.log("ID1", checkoutId)
  console.log("ID2", checkoutId2)
  var raw = JSON.stringify({
    "user": {
      "id": shop_id
    },
    "itemAction": 'Purchase',
    "order": {
      "Product": {
        "orderId": checkoutId,
        "lineItems": [
          {"id": "123"}
        ]
      }
    }
  }
  );
  var requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
    redirect: 'follow'
  };
  // fetch("https://sacramentokings.us-6.evergage.com/api2/event/shopify_test", requestOptions)
  //   .then(response => response.text())
  //   .then(result => console.log(result))
  //   .catch(error => console.log('error', error));
});

