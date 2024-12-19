import express from "express";
import router from "./todo";

const app = express();

app.use(express.json());

app.use("/api", router)

app.listen(3000, () => {
    console.log("Server Berhasil Dijalankan pada http://localhost:3000/api/tasks")
})