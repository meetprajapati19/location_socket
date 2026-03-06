const { log } = require("console");
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
  pingTimeout: 60000,
  pingInterval: 25000
});

app.get("/", (req, res) => {
  res.send("RideNow WebSocket Server Running 🚀");
});

io.on("connection", (socket) => {
  console.log("Connected:", socket.id);

  socket.on("joinRide", (rideId) => {
    socket.join(rideId);
    console.log(`Joined ride ${rideId}`);
  });

  socket.on("pilotLocationUpdate", (data) => {
    const { rideId, lat, lng, heading, speed } = data;

    io.to(rideId).emit("locationUpdate", {
      lat,
      lng,
      heading,
      speed,
    });
    log(`Location update for ride ${rideId}:`, { lat, lng, heading, speed });
  });
  socket.on("liveRouteUpdate", (data) => {
    const { rideId, route } = data;

    io.to(rideId).emit("liveRouteUpdate", {
      route
    });
    log(`Live route update for ride ${rideId}:`, route);
  });

  socket.on("disconnect", () => {
    console.log("Disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log("Server running on port", PORT);
});