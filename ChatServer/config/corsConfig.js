const corsConfig = {
  origin: [
    "http://34.66.211.252:3000", 
    "http://localhost:3000", 
    "http://newchat.ddns.net:3000", 
    "http://turtlenexus:3000", 
    "http://turtlenexus.ddns.net:3000", 
    "http://192.168.0.184:3000",

    "https://34.66.211.252:3000", 
    "https://localhost:3000", 
    "https://newchat.ddns.net:3000", 
    "https://turtlenexus:3000", 
    "https://turtlenexus.ddns.net:3000", 
    "https://192.168.0.184:3000"
  ],
  methods: ["GET", "POST", "DELETE"],
  credentials: true,
};

module.exports = corsConfig;

