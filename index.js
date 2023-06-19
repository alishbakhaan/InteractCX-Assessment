const express = require("express");
const app = express();
const { WebhookClient } = require("dialogflow-fulfillment");
const fetch = require("cross-fetch");

app.get("/", (req, res) => {
  res.send("We are live");
});

async function orderId(agent) {
  const getId = agent.parameters.number;

  console.log("Order ID: " + getId);

  try {
    const response = await fetch(
      "https://orderstatusapi-dot-organization-project-311520.uc.r.appspot.com/api/getOrderStatus",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: getId,
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Error: " + response.status);
    }

    const data = await response.json();
    const getDate = new Date(data.shipmentDate).toLocaleDateString("en-US", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    console.log(getDate);
    agent.add(`Your order ${getId} will be shipped by ${getDate}`);
  } catch (error) {
    console.error(error);
    agent.add(
      "Sorry, there was an error retrieving the shipment date for your order."
    );
  }
}
app.post("/", express.json(), (req, res) => {
  const agent = new WebhookClient({
    request: req,
    response: res,
  });

  let intentMap = new Map();
  intentMap.set("getId", orderId);
  agent.handleRequest(intentMap).catch((error) => {
    console.error(error);
    res.status(500).send("Error: Internal Server Error");
  });
});

app.listen(8888, () => console.log("Server is live at port 8888"));
