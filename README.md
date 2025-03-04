# 💈 Barbearia Sarty - Sistema de Agendamentos

Um sistema completo de agendamento para barbearias, permitindo que clientes agendem horários e que profissionais gerenciem seus compromissos.

![Barbearia Sarty](https://images.unsplash.com/photo-1585747860715-2ba37e788b70?ixlib=rb-4.0.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1200&q=80)

## 🚀 Funcionalidades

### Para Clientes
- Agendamento de horários com escolha de data e hora
- Interface intuitiva e responsiva
- Confirmação via WhatsApp após o agendamento
- Verificação de disponibilidade em tempo real

### Para Profissionais
- Painel de controle para gerenciar todos os agendamentos
- Confirmação ou cancelamento de agendamentos
- Visualização de agendamentos por período (hoje, futuros, passados)
- Filtros e busca para encontrar agendamentos específicos
- Sistema de autenticação seguro

## 🛠️ Tecnologias Utilizadas

### Frontend
- React.js com TypeScript
- Tailwind CSS para estilização
- React Router para navegação
- Supabase para autenticação e banco de dados
- Lucide React para ícones
- Date-fns para manipulação de datas

### Backend
- Spring Boot
- Spring Security
- Spring Data JPA
- PostgreSQL
- JWT para autenticação

## 📋 Estrutura do Projeto

```
├── backend/                  # API Spring Boot
│   ├── src/                  # Código fonte do backend
│   │   ├── main/
│   │   │   ├── java/
│   │   │   │   └── com/scheduler/
│   │   │   │       ├── controller/    # Controladores REST
│   │   │   │       ├── model/         # Entidades JPA
│   │   │   │       ├── repository/    # Repositórios JPA
│   │   │   │       ├── security/      # Configurações de segurança
│   │   │   │       └── service/       # Lógica de negócios
│   │   │   └── resources/
│   │   │       └── application.properties  # Configurações do Spring
│   └── pom.xml               # Dependências Maven
├── src/                      # Código fonte do frontend
│   ├── components/           # Componentes React
│   │   ├── BookingForm.tsx   # Formulário de agendamento
│   │   ├── Dashboard.tsx     # Painel de controle
│   │   └── Login.tsx         # Tela de login
│   ├── context/              # Contextos React
│   │   └── AuthContext.tsx   # Contexto de autenticação
│   ├── lib/                  # Bibliotecas e utilitários
│   │   └── supabase.ts       # Cliente Supabase
│   ├── App.tsx               # Componente principal
│   └── main.tsx              # Ponto de entrada
├── supabase/                 # Configurações do Supabase
│   └── migrations/           # Migrações do banco de dados
├── public/                   # Arquivos estáticos
└── package.json              # Dependências npm
```

## 🚀 Como Executar

### Pré-requisitos
- Node.js (v16+)
- Java 17
- PostgreSQL
- Conta no Supabase

### Frontend
1. Clone o repositório
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Configure as variáveis de ambiente no arquivo `.env`:
   ```
   VITE_SUPABASE_URL=sua_url_do_supabase
   VITE_SUPABASE_ANON_KEY=sua_chave_anon_do_supabase
   ```
4. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

### Backend
1. Configure o banco de dados PostgreSQL
2. Atualize as configurações em `backend/src/main/resources/application.properties`
3. Execute o backend:
   ```bash
   cd backend
   ./mvnw spring-boot:run
   ```

## 🔐 Autenticação

### Credenciais de Acesso
- Email: barber@admin.com
- Senha: acesso123

## 📱 Telas do Sistema

### Agendamento (Cliente)
- Formulário intuitivo para agendamento
- Seleção de data e hora
- Confirmação via WhatsApp

### Dashboard (Profissional)
- Visão geral de todos os agendamentos
- Filtros por status (pendente, confirmado, cancelado)
- Busca por nome de cliente
- Ações para confirmar ou cancelar agendamentos

## 📊 Banco de Dados

### Tabelas Principais
- `professionals`: Armazena informações dos profissionais
- `appointments`: Registra todos os agendamentos

## 🔄 Fluxo de Trabalho

1. Cliente acessa a página inicial e preenche o formulário de agendamento
2. Após enviar, o cliente pode confirmar via WhatsApp
3. O profissional acessa o dashboard com suas credenciais
4. No dashboard, o profissional visualiza e gerencia todos os agendamentos

## 🤝 Contribuição

Contribuições são bem-vindas! Para contribuir:

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT.

## 👨‍💻 Desenvolvido por

Keven M - 2025