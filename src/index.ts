import express, { json } from "express";
import { sequelize } from "./config/database";
import { userRouter } from "./routes/userRoutes";
import { carRouter } from "./routes/carRoutes";
import { reserveRouter } from "./routes/reserveRoutes";

const app = express();
const port = 3000;

const jwt = require('jsonwebtoken')

app.use(express.json());



// Rotas

app.use(userRouter);
app.use(carRouter);
app.use(reserveRouter);

// Rota de teste
app.get("/", (req, res) => {
    res.json({
        message: "API de Reserva de Carros",
        version: "1.0.0",
        endpoints: {
            users: "/users",
            cars: "/cars", 
            reserves: "/reserves",

        }
    });
});

app.post('/login', (req, res) => {
    const {username, password} = req.body
})

main();

async function main() {
    if (require.main === module) {
        try {
            // Sincronizar banco de dados
            await sequelize.sync({ force: false }); // Mudei para false para não recriar as tabelas sempre
            console.log("✅ Database sincronizado com sucesso");
            
            // Iniciar servidor
            app.listen(port, () => {
                console.log(`🚀 Servidor rodando em http://localhost:${port}`);
                console.log(`📚 Documentação das rotas disponível em http://localhost:${port}`);
            });
        } catch (error) {
            console.error("❌ Erro ao inicializar aplicação:", error);
            process.exit(1);
        }
    }
}