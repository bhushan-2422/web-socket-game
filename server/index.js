import express from "express"
import { createServer } from "node:http"
import { dirname,join } from "node:path";
import { fileURLToPath } from "node:url";
import { Server } from "socket.io";

const app = express()
const server = createServer(app);
const PORT = 3000;
const io = new Server(server);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(express.static(join(__dirname, "../public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

io.on("connection",(socket)=>{
    console.log("user connected");
})

server.listen(PORT, ()=>{
    console.log("app is running on: ",PORT)
})