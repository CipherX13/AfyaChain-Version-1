# AfyaChain - Blockchain-based Healthcare Data Management System

## 📋 Overview
AfyaChain is a decentralized healthcare data management platform built on blockchain technology that enables secure, transparent, and immutable storage of medical records. The system allows patients to own their medical data while giving controlled access to healthcare providers.

## 🎯 Features
- **Patient Data Management**: Secure storage of medical records
- **Smart Contract Integration**: Automated access control and data permissions
- **Role-based Access**: Different permissions for patients, doctors, and hospitals
- **Immutable Audit Trail**: Complete history of data access and modifications
- **Real-time Notifications**: Alerts for data access requests and approvals
- **Data Encryption**: End-to-end encryption of sensitive medical information

## 🏗️ Project Structure
```
afya-chain/
├── backend/                 # Node.js/Express Backend
│   ├── src/
│   │   ├── controllers/    # Request handlers
│   │   ├── models/         # Data models
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Authentication & validation
│   │   └── utils/          # Helper functions
│   ├── config/             # Configuration files
│   ├── tests/              # Backend tests
│   └── server.js           # Main server file
├── blockchain/             # Smart Contracts & Web3 Integration
│   ├── contracts/          # Solidity smart contracts
│   │   ├── AfyaChain.sol   # Main contract
│   │   ├── AccessControl.sol
│   │   └── DataStorage.sol
│   ├── migrations/         # Contract deployment scripts
│   ├── tests/              # Smart contract tests
│   └── web3/               # Web3.js integration
├── frontend/               # React/Next.js Frontend
│   ├── public/             # Static assets
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Application pages
│   │   ├── styles/         # CSS/Styled components
│   │   ├── hooks/          # Custom React hooks
│   │   └── utils/          # Frontend utilities
│   ├── contexts/           # React contexts (Auth, Web3)
│   └── services/           # API service calls
├── .gitignore              # Git ignore file
├── package.json            # Root package.json
├── README.md               # This file
└── docker-compose.yml      # Docker configuration
```

## ⚙️ Prerequisites
- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **Git**
- **MetaMask** browser extension (for blockchain interaction)
- **Ganache** or **Hardhat** (for local blockchain development)
- **MongoDB** (v4.4 or higher)
- **Redis** (for caching and sessions)

## 📦 Installation

### 1. Clone the Repository
```bash
git clone https://github.com/CipherX13/AfyaChain-Version-2.git
cd AfyaChain-Version-2
```

### 2. Install Dependencies
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install blockchain dependencies
cd ../blockchain
npm install

# Install frontend dependencies
cd ../frontend
npm install

cd ..
```

### 3. Environment Setup
Create a `.env` file in the root directory:
```env
# Application
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:3001
BACKEND_URL=http://localhost:3000

# Database
MONGODB_URI=mongodb://localhost:27017/afyachain
REDIS_URL=redis://localhost:6379

# JWT Authentication
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d

# Blockchain
ETHEREUM_NETWORK=localhost
WEB3_PROVIDER=http://localhost:8545
CONTRACT_ADDRESS=your_contract_address_here
PRIVATE_KEY=your_wallet_private_key

# Email (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

### 4. Database Setup
```bash
# Start MongoDB (using Docker)
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Start Redis
docker run -d -p 6379:6379 --name redis redis:alpine

# Or install locally
# Follow official installation guides for MongoDB and Redis
```

### 5. Blockchain Setup
```bash
cd blockchain

# Install Ganache (local blockchain)
npm install -g ganache-cli

# Start local Ethereum node
ganache-cli -h 0.0.0.0 -p 8545

# In a new terminal, compile and deploy contracts
npx hardhat compile
npx hardhat run scripts/deploy.js --network localhost
```

## 🚀 Running the Application

### Method 1: Run All Services Separately

#### Terminal 1: Start Blockchain
```bash
cd blockchain
npm run blockchain  # Starts local Ethereum node
```

#### Terminal 2: Start Backend
```bash
cd backend
npm run dev  # Starts Express server on port 3000
```

#### Terminal 3: Start Frontend
```bash
cd frontend
npm run dev  # Starts React app on port 3001
```

### Method 2: Using Docker (Recommended)
```bash
# Build and start all services
docker-compose up --build

# Or run in detached mode
docker-compose up -d

# Check logs
docker-compose logs -f

# Stop all services
docker-compose down
```

### Method 3: Using PM2 (Production)
```bash
# Install PM2 globally
npm install -g pm2

# Start all processes
pm2 start ecosystem.config.js

# Monitor
pm2 monit

# View logs
pm2 logs
```

## 🔧 Configuration

### Smart Contract Addresses
Update contract addresses in `blockchain/config/contracts.json` after deployment:
```json
{
  "AfyaChain": "0x1234...",
  "AccessControl": "0x5678...",
  "DataStorage": "0x9abc..."
}
```

### MetaMask Configuration
1. Install MetaMask browser extension
2. Connect to Localhost 8545 network
3. Import test accounts from Ganache
4. Add network:
   - Network Name: Localhost 8545
   - RPC URL: http://localhost:8545
   - Chain ID: 1337

## 📚 API Documentation

### Backend APIs (Port 3000)
```
GET    /api/health          # Health check
POST   /api/auth/register   # User registration
POST   /api/auth/login      # User login
GET    /api/patients        # Get patient list
GET    /api/patients/:id    # Get patient details
POST   /api/records         # Create medical record
PUT    /api/records/:id     # Update record
GET    /api/access/logs     # Get access logs
```

### Blockchain APIs
```
POST   /api/blockchain/deploy      # Deploy contract
POST   /api/blockchain/access      # Request data access
GET    /api/blockchain/verify      # Verify transaction
```

## 🧪 Testing

### Run Tests
```bash
# Backend tests
cd backend
npm test

# Smart contract tests
cd blockchain
npm test

# Frontend tests
cd frontend
npm test

# Run all tests
npm run test:all
```

### Test Coverage
```bash
# Generate coverage reports
cd backend && npm run coverage
cd blockchain && npm run coverage
```

## 🔒 Security Features
1. **End-to-end Encryption**: All medical data encrypted before storage
2. **Multi-signature Access**: Critical operations require multiple approvals
3. **IPFS Integration**: Decentralized file storage for large medical files
4. **Rate Limiting**: API rate limiting to prevent abuse
5. **CORS Configuration**: Strict CORS policies
6. **Input Validation**: Comprehensive request validation

## 📊 Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  walletAddress: String,     // Ethereum wallet address
  role: String,              // patient, doctor, admin
  personalInfo: {
    name: String,
    email: String,
    phone: String,
    dateOfBirth: Date
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Medical Records Collection
```javascript
{
  _id: ObjectId,
  patientId: ObjectId,
  doctorId: ObjectId,
  hospitalId: ObjectId,
  diagnosis: String,
  prescription: [{
    medicine: String,
    dosage: String,
    duration: String
  }],
  labResults: [String],      // IPFS hashes
  accessLogs: [{
    accessedBy: ObjectId,
    timestamp: Date,
    purpose: String
  }],
  createdAt: Date,
  updatedAt: Date
}
```

## 🚢 Deployment

### Heroku Deployment
```bash
# Deploy backend
heroku create afyachain-backend
heroku addons:create mongolab
heroku addons:create heroku-redis
git push heroku main

# Deploy frontend
cd frontend
npm run build
```

### AWS Deployment
```bash
# Using Elastic Beanstalk
eb init afyachain
eb create afyachain-prod
eb deploy
```

## 🐛 Troubleshooting

### Common Issues

1. **Metamask Connection Failed**
   ```bash
   # Reset MetaMask account
   # Check network configuration
   # Ensure contract is deployed
   ```

2. **MongoDB Connection Error**
   ```bash
   # Start MongoDB service
   sudo service mongod start
   # Or restart docker container
   docker restart mongodb
   ```

3. **Contract Deployment Failed**
   ```bash
   # Check Ganache is running
   # Verify private key in .env
   # Check sufficient gas
   ```

### Logs Location
```bash
# Backend logs
tail -f backend/logs/app.log

# Blockchain logs
tail -f blockchain/logs/transactions.log

# PM2 logs
pm2 logs afyachain-backend
```

## 🤝 Contributing
1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments
- Ethereum Foundation
- Web3.js Community
- Healthcare professionals for domain expertise
- Open-source contributors

## 📞 Support
For support, email: support@afyachain.com or create an issue in the GitHub repository.

---

**Note**: This is a development version. For production deployment, ensure proper security measures, SSL certificates, and regular backups.

## 🔄 Update Instructions
To update to the latest version:
```bash
git pull origin main
npm install
npm run build
npm run migrate  # For database migrations
```

---

*Last Updated: $(date)*
