-- Active: 1748352866382@@127.0.0.1@5432
-- Exemplo de criação da tabela Users com campo role
CREATE TABLE IF NOT EXISTS "users" (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Exemplo de usuário admin inicial (opcional)
INSERT INTO "users" (name, email, password, role)
VALUES ('Admin', 'admin@empresa.com', '$adriel123', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Substitua $2a$10$hashsenha por uma senha já criptografada (bcrypt)
