# Venha - Frontend (Next.js)

Interface web para o sistema de convites online Venha, permitindo que anfitriões gerenciem eventos e convidados confirmem presença.

## 📋 Sobre o Projeto

Este é o frontend do sistema Venha, desenvolvido em Next.js 16 com React. Fornece uma interface moderna e responsiva para criação de eventos, gerenciamento de convites e confirmação de presença (RSVP).

### Funcionalidades Principais

**Para Anfitriões:**
- Cadastro e login de usuários
- Dashboard para criação e gerenciamento de eventos
- Visualização de lista de convidados confirmados
- Interface para editar e deletar eventos
- Exportação de lista de convidados

**Para Convidados:**
- Visualização de detalhes do evento via link único
- Formulário de confirmação de presença (RSVP)
- Visualização de mapa com localização do evento
- Previsão do tempo para a data do evento
- Modificação e cancelamento de confirmação

## 🏗️ Arquitetura da Aplicação

O sistema Venha utiliza uma arquitetura de três camadas (Frontend, Backend API, Banco de Dados) com integração a múltiplas APIs externas.

**Diagrama de Arquitetura Completo:** Consulte o arquivo [`ARCHITECTURE.md`](../backend/ARCHITECTURE.md) no repositório do backend para visualizar o diagrama detalhado da arquitetura, fluxo de dados e integrações com serviços externos.

**Visão Resumida:**
- **Frontend (Next.js):** Interface web responsiva com SSR, páginas públicas (convites) e privadas (dashboard)
- **Backend (Flask REST API):** Lógica de negócio, autenticação, validações e integrações
- **Banco de Dados (SQLite):** Armazenamento de hosts, eventos e confirmações
- **Serviços Externos:** Google Maps/Geocoding (mapas), WeatherAPI (clima), ViaCEP (endereços)

**Comunicação:** HTTP/REST com JSON, autenticação via session cookies, CORS configurado.

## 🛠️ Tecnologias Utilizadas

- **Next.js 16** - Framework React com Turbopack
- **React 19** - Biblioteca de interface
- **Ant Design** - Biblioteca de componentes UI
- **Axios** - Cliente HTTP para requisições à API
- **Google Maps API** - Visualização de mapas
- **WeatherAPI** - Previsão do tempo
- **Tailwind CSS** - Estilização

## 📁 Estrutura do Projeto

```
frontend/
├── src/
│   └── app/
│       ├── components/          # Componentes React reutilizáveis
│       │   ├── EventMap.js     # Mapa do Google
│       │   └── WeatherWidget.js # Widget de clima
│       ├── dashboard/           # Páginas do dashboard do anfitrião
│       │   └── page.js
│       ├── invite/[slug]/       # Página pública do convite
│       │   └── page.js
│       ├── login/               # Página de login
│       │   └── page.js
│       ├── rsvp/[slug]/        # Página de gerenciamento de RSVP
│       │   └── page.js
│       ├── signup/              # Página de cadastro
│       │   └── page.js
│       ├── layout.js            # Layout principal
│       └── page.js              # Página inicial
├── public/                      # Arquivos estáticos
├── docker-compose.yml           # Configuração Docker Compose
├── Dockerfile                   # Dockerfile do frontend
├── .env.local.example           # Template de variáveis de ambiente
└── README.md                    # Este arquivo
```

## 🚀 Como Rodar o Projeto (Docker)

Esta é a forma recomendada de rodar o projeto completo (frontend + backend). Este método garante que todas as dependências sejam instaladas corretamente e que ambos os serviços se comuniquem adequadamente.

### Pré-requisitos
- Docker Desktop instalado e rodando
- Git instalado
- Conexão com internet para download de dependências

### Passo 1: Clonar os Repositórios

Crie um diretório pai e clone ambos os projetos:

```bash
mkdir venha_project
cd venha_project
git clone https://github.com/FernandaFranco/rsvp_app_api.git backend
git clone https://github.com/FernandaFranco/rsvp_app_front_end.git frontend
```

**Importante:** Os comandos acima clonam os repositórios nas pastas `backend` e `frontend` respectivamente, que são os nomes esperados pelo Docker Compose.

**Estrutura de diretórios esperada:**
```
venha_project/
├── backend/    (repositório do backend)
│   ├── app.py
│   ├── .env.example
│   ├── Dockerfile
│   └── ...
└── frontend/   (este repositório)
    ├── docker-compose.yml
    ├── .env.local.example
    ├── Dockerfile
    └── ...
```

### Passo 2: Configurar Backend (.env)

Primeiro, configure o backend:

```bash
cd backend
cp .env.example .env
```

Edite o arquivo `backend/.env`:

```bash
# Obrigatórias
FLASK_APP=app.py
FLASK_ENV=development
SECRET_KEY=sua-chave-secreta-aqui    # Gere com: python3 -c "import secrets; print(secrets.token_hex(32))"
DATABASE_URL=sqlite:///invitations.db

# Opcional - Google Geocoding (usa Nominatim como fallback)
GOOGLE_GEOCODING_API_KEY=sua-chave-google-aqui

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

**Gere o SECRET_KEY:**
```bash
python3 -c "import secrets; print(secrets.token_hex(32))"
```

Veja o README do backend para instruções completas.

### Passo 3: Configurar Frontend (.env.local)

Agora configure o frontend:

```bash
cd ../frontend
cp .env.local.example .env.local
```

Edite o arquivo `.env.local`:

```bash
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=sua-chave-google-maps-aqui
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_WEATHER_API_KEY=sua-chave-weatherapi-aqui
```

**APIs Necessárias:**
- **NEXT_PUBLIC_GOOGLE_MAPS_API_KEY:** Chave do Google Maps JavaScript API (obrigatória para mapas)
- **NEXT_PUBLIC_API_URL:** URL do backend (use `http://localhost:5000`)
- **NEXT_PUBLIC_WEATHER_API_KEY:** Chave do WeatherAPI.com (obrigatória para previsão do tempo)

**Como obter as chaves:**

**Google Maps API:**
1. Acesse [Google Cloud Console](https://console.cloud.google.com)
2. Crie um projeto ou selecione um existente
3. Ative a API "Maps JavaScript API"
4. Vá em "Credenciais" → "Criar credenciais" → "Chave de API"
5. Copie a chave gerada

**WeatherAPI:**
1. Acesse [WeatherAPI.com](https://www.weatherapi.com/)
2. Crie uma conta gratuita (1 milhão de chamadas/mês grátis)
3. Vá em "My Account" → "API Keys"
4. Copie a chave gerada

**Nota sobre APIs Externas:** As chaves de API serão compartilhadas separadamente para fins de avaliação. Não inclua chaves reais no código versionado.

### Passo 4: Rodar com Docker Compose

Certifique-se de estar na pasta `frontend/` (onde está o `docker-compose.yml`):

```bash
docker-compose up --build
```

**O que acontece:**
- O Docker baixa as imagens base necessárias
- Instala todas as dependências do backend (Python/Flask)
- Instala todas as dependências do frontend (Next.js)
- Inicia ambos os serviços
- Backend fica disponível na porta 5000
- Frontend fica disponível na porta 3000

**Primeira execução:** Pode levar alguns minutos para baixar imagens e instalar tudo.

### Passo 5: Acessar a Aplicação

Aguarde até ver as mensagens indicando que os serviços estão prontos. Então acesse:

- **Frontend (Interface):** http://localhost:3000
- **Backend API:** http://localhost:5000
- **Documentação Swagger:** http://localhost:5000/api/docs

### Comandos Úteis do Docker

**Ver logs em tempo real:**
```bash
docker-compose logs -f
```

**Ver logs apenas do frontend:**
```bash
docker-compose logs -f frontend
```

**Ver logs apenas do backend:**
```bash
docker-compose logs -f backend
```

**Parar containers (mantém os dados):**
```bash
docker-compose down
```

**Parar e remover volumes (limpa o banco de dados):**
```bash
docker-compose down -v
```

**Reiniciar apenas o frontend:**
```bash
docker restart venha_frontend
```

**Acessar terminal do container:**
```bash
docker exec -it venha_frontend sh
docker exec -it venha_backend bash
```

**Reconstruir do zero (se houver problemas):**
```bash
docker-compose down -v
docker-compose up --build --force-recreate
```

## 🌐 APIs Externas

O frontend integra-se com as seguintes APIs externas:

### 1. Google Maps JavaScript API

**URL:** https://developers.google.com/maps/documentation/javascript

**Propósito:** Exibição de mapas interativos nas páginas de convite.

**Licença/Custo:**
- Plano gratuito com crédito mensal de $200 USD
- Primeiras 28.000 carregamentos de mapa/mês são gratuitos
- Licença: Proprietária (Google)

**Uso no Frontend:**
- Componente: `src/app/components/EventMap.js`
- Biblioteca: `@react-google-maps/api`
- Páginas: `/invite/[slug]` (página do convite)

**Endpoints utilizados:**
- Google Maps JavaScript API (carregada via script tag)
  - URL: `https://maps.googleapis.com/maps/api/js`
  - Parâmetros: `key` (API key), `libraries=places`

### 2. WeatherAPI

**URL:** https://www.weatherapi.com/

**Propósito:** Exibição de previsão do tempo na página do convite.

**Licença/Custo:**
- Plano gratuito: 1.000.000 chamadas/mês
- Previsão até 3 dias no futuro (plano gratuito)
- Licença: Proprietária

**Uso no Frontend:**
- Componente: `src/app/components/WeatherWidget.js`
- Funcionalidade: Exibir temperatura, condição climática e ícone do tempo
- Limitação: Apenas eventos com data até 3 dias no futuro exibirão previsão

**Endpoints utilizados:**
- `GET https://api.weatherapi.com/v1/forecast.json`
  - Parâmetros: `key` (API key), `q` (lat,lng), `days=1`, `lang=pt`
  - Retorna: `forecast.forecastday[0].day` (temperatura, condição, ícone)

### 3. Google Geocoding API (via Backend)

**URL:** https://developers.google.com/maps/documentation/geocoding

**Propósito:** Conversão de endereços em coordenadas geográficas (latitude/longitude).

**Licença/Custo:**
- Integrado ao mesmo plano do Google Maps
- Primeiras 40.000 requisições/mês são gratuitas

**Uso:**
- **Backend:** Converte endereços em coordenadas ao criar eventos
- **Fallback:** Usa Nominatim (OpenStreetMap) se Google Geocoding falhar

**Endpoints utilizados:**
- `GET https://maps.googleapis.com/maps/api/geocode/json` (chamado pelo backend)
  - Parâmetros: `address`, `key`
  - Retorna: `results[0].geometry.location` (lat, lng)

### 4. ViaCEP

**URL:** https://viacep.com.br/

**Propósito:** Busca automática de endereços brasileiros a partir do CEP.

**Licença/Custo:**
- API pública e completamente gratuita
- Sem necessidade de registro ou chave de API
- Licença: Livre (domínio público)

**Uso no Frontend:**
- Chamada: **Direta do frontend** (não passa pelo backend)
- Funcionalidade: Busca automática de endereço ao digitar CEP
- Validação: CEP deve ter exatamente 8 dígitos

**Endpoints utilizados:**
- `GET https://viacep.com.br/ws/{cep}/json/`
  - Parâmetros: `cep` (8 dígitos, apenas números)
  - Retorna: `logradouro`, `bairro`, `localidade`, `uf`

## 📧 Notificações por Email - Modo Simulação

O sistema **não envia emails reais**. Quando um convidado confirma, modifica ou cancela presença, o backend **imprime o conteúdo do email no console**.

**Para ver os emails simulados:**

Com o Docker rodando, execute em um novo terminal:
```bash
docker-compose logs -f backend
```

Faça um RSVP no frontend e observe o log formatado com o conteúdo do email.

## 🐛 Solução de Problemas

### Erro: Porta já em uso (3000)
```bash
# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

### Containers não iniciam ou erro de dependências
```bash
docker-compose down -v
docker-compose up --build --force-recreate
```

### Frontend não consegue conectar ao backend (Network Error)
- Verifique se `NEXT_PUBLIC_API_URL=http://localhost:5000` em `frontend/.env.local`
- Verifique se `FRONTEND_URL=http://localhost:3000` em `backend/.env`
- Certifique-se de que ambos os containers estão rodando: `docker ps`

### Google Maps não aparece
1. Verifique se `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` está configurado em `.env.local`
2. Certifique-se de que a API "Maps JavaScript API" está ativa no Google Cloud
3. Abra o console do navegador (F12) para verificar erros
4. Reinicie o container após alterar `.env.local`: `docker restart venha_frontend`

### Previsão do tempo não aparece
1. Verifique se `NEXT_PUBLIC_WEATHER_API_KEY` está configurado em `.env.local`
2. Certifique-se de que o evento tem data até 3 dias no futuro (limitação do plano gratuito)
3. Verifique se o evento tem coordenadas (criado com geocoding bem-sucedido)

## 📝 Notas para Avaliadores

Este projeto foi desenvolvido como parte da Sprint de Arquitetura de Software da Pós-Graduação em Engenharia de Software da PUC-Rio.

### Guia Rápido de Avaliação

**Siga os passos de instalação acima** na seção "Como Rodar o Projeto (Docker)".

### Fluxo de Teste Sugerido

1. **Criar Conta:** Acesse http://localhost:3000 e crie uma conta de anfitrião
2. **Criar Evento:** No dashboard, crie um evento de teste
   - Use um CEP válido (ex: 22040-020 - Copacabana, Rio de Janeiro)
   - Preencha título, descrição, data e horários
   - O sistema buscará o endereço automaticamente via ViaCEP
3. **Visualizar Mapa:** Após criar, o evento terá coordenadas obtidas via Google Geocoding (ou Nominatim)
4. **Copiar Link:** Copie o link do convite gerado
5. **Simular Convidado:** Abra o link em uma aba anônima do navegador
6. **Ver Detalhes:** Observe:
   - Mapa interativo com localização do evento (Google Maps)
   - Previsão do tempo para a data (WeatherAPI - apenas eventos até 3 dias)
   - Detalhes do evento
7. **Confirmar Presença:** Preencha o formulário de RSVP
8. **Ver Notificação:** Execute `docker-compose logs -f backend` para ver o email simulado
9. **Gerenciar RSVPs:** Volte ao dashboard do anfitrião e visualize a lista de confirmações
10. **Exportar CSV:** Teste a exportação da lista de convidados
11. **Modificar/Cancelar:** Use o mesmo WhatsApp para buscar e modificar a confirmação

### 🌐 APIs Externas Utilizadas

Veja a seção **"APIs Externas"** acima para detalhes completos sobre endpoints, parâmetros e uso.

### Comportamento Gracioso

O sistema foi projetado para funcionar mesmo quando algumas APIs não estão disponíveis:

| API | Se não configurada | Impacto no usuário |
|-----|-------------------|-------------------|
| **Google Maps** | Mapa não renderiza | Convite exibido sem mapa, demais informações intactas |
| **WeatherAPI** | Widget não aparece | Convite exibido sem previsão do tempo |
| **Google Geocoding** | Usa Nominatim (OSM) | Nenhum (fallback automático no backend) |
| **Nominatim** | Evento sem coordenadas | Mapas e clima não aparecem, evento funciona normalmente |
| **ViaCEP** | Busca manual de endereço | Usuário precisa digitar endereço completo manualmente |

### 📧 Sistema de Notificações

**O sistema opera em MODO SIMULAÇÃO.**

Os emails **NÃO são enviados** de verdade. Os emails são simulados e aparecem apenas nos logs do backend.

**Para ver os emails simulados:**
1. Com o Docker rodando, abra um novo terminal
2. Execute: `docker-compose logs -f backend`
3. No navegador, faça um RSVP
4. Observe o log formatado no terminal

**Eventos que geram emails simulados:**
- Novo RSVP confirmado
- Modificação de confirmação
- Cancelamento de presença

### 🐳 Comandos Úteis para Avaliação

**Ver logs em tempo real (ambos os serviços):**
```bash
docker-compose logs -f
```

**Ver apenas logs do frontend:**
```bash
docker-compose logs -f frontend
```

**Ver apenas logs do backend (incluindo emails simulados):**
```bash
docker-compose logs -f backend
```

**Parar os containers:**
```bash
docker-compose down
```

**Reiniciar um serviço específico:**
```bash
docker restart venha_frontend
docker restart venha_backend
```

**Limpar tudo e recomeçar:**
```bash
docker-compose down -v
docker-compose up --build --force-recreate
```

### 📚 Documentação Adicional

- **Arquitetura Completa:** Veja `ARCHITECTURE.md` (backend) para diagrama detalhado da arquitetura do sistema
- **API REST:** http://localhost:5000/api/docs para documentação Swagger interativa
- **Código Fonte:** Todos os componentes React estão em `src/app/components/`

## 📄 Licença

Este projeto foi desenvolvido para fins educacionais.

## 👤 Autora

Fernanda Franco

PUC-Rio - Pós-Graduação em Engenharia de Software

Sprint de Arquitetura de Software - 2025
