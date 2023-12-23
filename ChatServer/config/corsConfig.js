const corsConfig = {
  origin: ["http://34.132.242.170:3000", "http://localhost:3000"],
  methods: ["GET", "POST", "DELETE"],
  credentials: true,
};

module.exports = corsConfig;
