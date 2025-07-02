# API de Reserva de Carros

> API RESTful para gestão de reservas de carros, com autenticação JWT, controle de acesso por perfil (admin/usuário), testes unitários e integração.

## Sumário
- [Visão Geral](#visão-geral)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Execução](#execução)
- [Estrutura das Rotas](#estrutura-das-rotas)
- [Autenticação e Autorização](#autenticação-e-autorização)
- [Testes](#testes)
- [Estrutura do Projeto](#estrutura-do-projeto)

## Visão Geral
Esta API permite:
- Cadastro e autenticação de usuários (JWT)
- Cadastro, consulta, atualização e remoção de carros (admin)
- Criação e consulta de reservas de carros (usuário autenticado)
- Controle de acesso por perfil (admin/usuário)
- Testes unitários e de integração com Jest

## Instalação
```bash
npm install
```

## Configuração
Crie um arquivo `.env` com as variáveis:
```
JWT_SECRET=seu_jwt_secret
JWT_REFRESH_SECRET=seu_jwt_refresh_secret
```

## Execução
```bash
npm run dev # ou npm start
```

## Estrutura das Rotas
### Auth
- `POST /auth/login` — Login do usuário
- `POST /auth/refresh` — Renovar token
- `POST /auth/forgot-password` — Solicitar reset de senha
- `POST /auth/reset-password` — Resetar senha
- `POST /auth/logout` — Logout (protegido)
- `POST /auth/logout-all` — Logout de todos dispositivos (protegido)

### Usuários
- `POST /users` — Cadastro de usuário
- `GET /users/:id` — Buscar usuário (admin)
- `PATCH /users/:id` — Atualizar usuário (admin)
- `DELETE /users/:id` — Remover usuário (admin)

### Carros
- `POST /cars/registry` — Registrar carro (admin)
- `PATCH /update-car/:id` — Atualizar carro (admin)
- `DELETE /delete-car/:id` — Remover carro (admin)
- `GET /cars/:id` — Consultar carro (autenticado)

### Reservas
- `POST /reserves` — Criar reserva (autenticado)
- `GET /reserves/:id` — Consultar reserva (autenticado)
- `GET /reserves/user/:userId` — Reservas por usuário (autenticado)
- `GET /reserves/car/:carId` — Reservas por carro (autenticado)
- `PATCH /reserves/:id` — Atualizar reserva (autenticado)
- `DELETE /reserves/:id` — Remover reserva (autenticado)
- `GET /reserves` — Listar todas as reservas (admin)

## Autenticação e Autorização
- Use o header `Authorization: Bearer <token>` para rotas protegidas.
- Apenas admins podem gerenciar usuários, carros e ver todas as reservas.
- Usuários autenticados podem criar e gerenciar suas reservas.

## Testes
- Execute todos os testes:
```bash
npm test
```
- Os testes cobrem controllers, services e middlewares, com mocks para dependências externas.

## Estrutura do Projeto
```
├── src
│   ├── Controllers
│   ├── Middlewares
│   ├── Models
│   ├── Services
│   ├── config
│   └── routes
├── tests
│   ├── Controller_test
│   └── Service_tests
├── package.json
├── tsconfig.json
└── ...
```

---

> Dúvidas? Abra uma issue ou entre em contato.
