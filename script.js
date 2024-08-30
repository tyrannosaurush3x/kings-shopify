var myHeaders = new Headers();
myHeaders.append("Content-Type", "application/json");

// analytics.subscribe("all_standard_events", event => {
//   console.log("Event data ", event?.data);
//   console.log("Client ID", event.clientId);
//   var shop_id = event.clientId
//   var raw = JSON.stringify({
//     "action": "hello world",
//     "user": {
//       "id": shop_id,
//       attributes: {
//         "shopifyId": shop_id
//       }
//     }
//   });
//   var requestOptions = {
//     method: 'POST',
//     headers: myHeaders,
//     body: raw,
//     redirect: 'follow'
//   };
//   fetch("https://sacramentokings.us-6.evergage.com/api2/event/shopify_test", requestOptions)
//   .then(response => response.text())
//   .then(result => console.log(result))
//   .catch(error => console.log('error', error));
// });

analytics.subscribe('cart_viewed', (event) =>{
  var line_items = 	event.data.cart.lines;
  var ids = []
  for (var i=0; i<line_items.length; i++) {
    var id = line_items[i].merchandise
    ids.push(id)
  }
  console.log(ids)
})
