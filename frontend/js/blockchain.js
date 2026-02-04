// frontend/js/blockchain.js - SIMPLIFIED VERSION
class AfyaChainBlockchain {
    constructor() {
        this.isConnected = false;
        this.userAddress = null;
    }
    
    async connectWallet() {
        if (typeof window.ethereum !== 'undefined') {
            try {
                // Request account access
                const accounts = await window.ethereum.request({ 
                    method: 'eth_requestAccounts' 
                });
                
                this.userAddress = accounts[0];
                this.isConnected = true;
                
                // Show success message
                this.showToast(`Wallet connected: ${this.userAddress.substring(0, 6)}...`, 'success');
                
                return {
                    success: true,
                    address: this.userAddress
                };
                
            } catch (error) {
                console.error('Wallet connection failed:', error);
                return {
                    success: false,
                    error: error.message
                };
            }
        } else {
            alert('Please install MetaMask to use blockchain features!');
            return {
                success: false,
                error: 'MetaMask not installed'
            };
        }
    }
    
    async registerOnBlockchain(userData) {
        try {
            // First register on our backend API
            const response = await fetch('http://localhost:5000/api/patients/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData)
            });
            
            const result = await response.json();
            
            if (result.success) {
                // Show blockchain transaction details
                this.showToast(`Registered on blockchain! Transaction: ${result.transactionHash.substring(0, 10)}...`, 'success');
                return result;
            } else {
                throw new Error(result.error);
            }
            
        } catch (error) {
            console.error('Blockchain registration error:', error);
            this.showToast('Blockchain registration failed: ' + error.message, 'error');
            return { success: false, error: error.message };
        }
    }
    
    showToast(message, type = 'info') {
        // Use your existing Toast system from auth.js
        if (typeof Toast !== 'undefined') {
            Toast[type](message);
        } else {
            // Fallback alert
            alert(`${type.toUpperCase()}: ${message}`);
        }
    }
}

// Create global instance
window.afyaChainBlockchain = new AfyaChainBlockchain();

// Auto-connect wallet on page load (optional)
document.addEventListener('DOMContentLoaded', function() {
    // Add wallet connect button to navigation
    const addWalletButton = () => {
        const nav = document.querySelector('.nav-links');
        if (nav && !document.querySelector('#connectWalletBtn')) {
            const walletBtn = document.createElement('a');
            walletBtn.id = 'connectWalletBtn';
            walletBtn.className = 'btn btn-outline';
            walletBtn.innerHTML = '<i class="fas fa-wallet"></i> Connect Wallet';
            walletBtn.style.marginLeft = '10px';
            walletBtn.onclick = () => window.afyaChainBlockchain.connectWallet();
            
            // Insert before login button
            const loginBtn = nav.querySelector('a[href="login.html"]');
            if (loginBtn) {
                nav.insertBefore(walletBtn, loginBtn);
            }
        }
    };
    
    // Add to index.html navigation
    if (window.location.pathname.includes('index.html') || 
        window.location.pathname === '/') {
        addWalletButton();
    }
});