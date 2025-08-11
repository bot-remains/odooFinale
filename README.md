# Odoo Finale Project

A full-stack application with Express.js backend and modern frontend.

## Project Structure

```
odooFinale/
├── backend/          # Express.js API server
│   ├── src/          # Source code
│   ├── index.js      # Entry point
│   └── package.json  # Backend dependencies
├── frontend/         # Frontend application (to be added)
└── README.md         # This file
```

## Getting Started

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Copy environment file:
```bash
cp .env.example .env
```

4. Start development server:
```bash
npm run dev
```

The backend server will be running at `http://localhost:3000`

### Available Scripts

#### Backend
- `npm start` - Start production server
- `npm run dev` - Start development server with hot reload
- `npm run lint` - Check code for linting errors
- `npm run lint:fix` - Fix linting errors automatically
- `npm run format` - Format code with Prettier

## Features

### Backend
- ✅ Express.js server
- ✅ CORS configuration
- ✅ Security middleware (Helmet)
- ✅ Request compression
- ✅ Request logging (Morgan)
- ✅ Environment configuration
- ✅ Error handling
- ✅ Health check endpoint
- ✅ Code quality (ESLint + Prettier)

### Frontend
- 🚧 Coming soon...

## Development

This project uses:
- **Backend**: Node.js, Express.js, ES6 modules
- **Code Quality**: ESLint, Prettier
- **Environment**: Dotenv for configuration

## Contributing

1. Clone the repository
2. Create a feature branch
3. Make your changes
4. Run linting and formatting
5. Commit your changes
6. Push to your branch
7. Create a Pull Request

## License

This project is licensed under the ISC License.
