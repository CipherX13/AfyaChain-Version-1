// ============ NOTIFICATION DROPDOWN ============
document.addEventListener('DOMContentLoaded', function() {
    const notificationBtn = document.getElementById('notificationBtn');
    const notificationDropdown = document.getElementById('notificationDropdown');

    if (notificationBtn && notificationDropdown) {
        // Toggle dropdown on click
        notificationBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            notificationDropdown.classList.toggle('show');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!notificationBtn.contains(e.target)) {
                notificationDropdown.classList.remove('show');
            }
        });

        // Mark all as read functionality
        const markReadBtn = notificationDropdown.querySelector('.mark-read');
        if (markReadBtn) {
            markReadBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                const unreadItems = notificationDropdown.querySelectorAll('.notification-item.unread');
                unreadItems.forEach(item => {
                    item.classList.remove('unread');
                });
                // Update badge
                const badge = notificationBtn.querySelector('.notification-badge');
                if (badge) {
                    badge.textContent = '0';
                    badge.style.display = 'none';
                }
                showToast('All notifications marked as read', 'success');
            });
        }

        // Handle notification item click
        const notificationItems = notificationDropdown.querySelectorAll('.notification-item');
        notificationItems.forEach(item => {
            item.addEventListener('click', function() {
                this.classList.remove('unread');
                // Update badge count
                const unreadCount = notificationDropdown.querySelectorAll('.notification-item.unread').length;
                const badge = notificationBtn.querySelector('.notification-badge');
                if (badge) {
                    badge.textContent = unreadCount;
                    if (unreadCount === 0) {
                        badge.style.display = 'none';
                    }
                }
            });
        });
    }

    // ============ MODAL FUNCTIONALITY ============
    const modalOverlay = document.getElementById('modalOverlay');
    const modalClose = document.getElementById('modalClose');
    const modalCloseBtn = document.getElementById('modalCloseBtn');
    const modalBody = document.getElementById('modalBody');

    function openModal(content) {
        if (modalBody) {
            modalBody.innerHTML = content;
        }
        if (modalOverlay) {
            modalOverlay.classList.add('show');
            document.body.style.overflow = 'hidden';
        }
    }

    function closeModal() {
        if (modalOverlay) {
            modalOverlay.classList.remove('show');
            document.body.style.overflow = '';
        }
    }

    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }

    if (modalCloseBtn) {
        modalCloseBtn.addEventListener('click', closeModal);
    }

    if (modalOverlay) {
        modalOverlay.addEventListener('click', function(e) {
            if (e.target === modalOverlay) {
                closeModal();
            }
        });
    }

    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modalOverlay && modalOverlay.classList.contains('show')) {
            closeModal();
        }
    });

    // ============ VIEW RECORD BUTTONS ============
    const viewRecordBtns = document.querySelectorAll('.view-record');
    viewRecordBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            if (this.disabled) return;

            const recordId = this.getAttribute('data-record-id');
            const recordCard = this.closest('.record-card');

            if (recordCard) {
                const recordType = recordCard.querySelector('.record-type')?.textContent || 'Health Record';
                const recordDate = recordCard.querySelector('.record-date')?.textContent || 'N/A';
                const details = recordCard.querySelectorAll('.record-details p');

                let detailsHTML = '';
                const infoItems = [];

                details.forEach(p => {
                    const text = p.textContent;
                    const parts = text.split(':');
                    if (parts.length >= 2) {
                        const label = parts[0].trim();
                        const value = parts.slice(1).join(':').trim();
                        if (!value.includes('status-badge')) {
                            infoItems.push({ label, value });
                        }
                    }
                });

                // Build modal content
                const modalContent = `
                    <div class="modal-record-header">
                        <span class="modal-record-type">${recordType}</span>
                        <span class="modal-record-date">${recordDate}</span>
                    </div>
                    <div class="modal-info-grid">
                        ${infoItems.map(item => `
                            <div class="modal-info-item">
                                <label>${item.label}</label>
                                <span>${item.value}</span>
                            </div>
                        `).join('')}
                        <div class="modal-info-item">
                            <label>Record ID</label>
                            <span>${recordId}</span>
                        </div>
                        <div class="modal-info-item">
                            <label>Blockchain Status</label>
                            <span style="color: var(--status-granted);">Verified</span>
                        </div>
                    </div>
                    <div class="modal-summary">
                        <h4>Record Summary</h4>
                        <p>This health record is securely stored on the blockchain and can only be accessed with patient consent. All access to this record is logged and auditable.</p>
                    </div>
                `;

                openModal(modalContent);

                // Update modal download button
                const modalDownloadBtn = document.getElementById('modalDownloadBtn');
                if (modalDownloadBtn) {
                    modalDownloadBtn.onclick = function() {
                        downloadRecord(recordId, recordType);
                    };
                }
            }
        });
    });

    // ============ VIEW USER BUTTONS (Admin Dashboard) ============
    const viewUserBtns = document.querySelectorAll('.view-user');
    viewUserBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const userId = this.getAttribute('data-user-id');
            const row = this.closest('tr');

            if (row) {
                const cells = row.querySelectorAll('td');
                const name = cells[1]?.textContent || 'N/A';
                const email = cells[2]?.textContent || 'N/A';
                const role = cells[3]?.textContent || 'N/A';
                const status = cells[4]?.textContent?.trim() || 'N/A';
                const joinedDate = cells[5]?.textContent || 'N/A';

                const modalContent = `
                    <div class="modal-info-grid">
                        <div class="modal-info-item">
                            <label>User ID</label>
                            <span>${userId}</span>
                        </div>
                        <div class="modal-info-item">
                            <label>Full Name</label>
                            <span>${name}</span>
                        </div>
                        <div class="modal-info-item">
                            <label>Email</label>
                            <span>${email}</span>
                        </div>
                        <div class="modal-info-item">
                            <label>Role</label>
                            <span>${role}</span>
                        </div>
                        <div class="modal-info-item">
                            <label>Status</label>
                            <span>${status}</span>
                        </div>
                        <div class="modal-info-item">
                            <label>Joined Date</label>
                            <span>${joinedDate}</span>
                        </div>
                    </div>
                    <div class="modal-summary">
                        <h4>Account Information</h4>
                        <p>This user account is registered on the Afya-Chain platform. All user activities are logged and can be audited through the system.</p>
                    </div>
                `;

                // Update modal header
                const modalHeader = document.querySelector('.modal-header h3');
                if (modalHeader) {
                    modalHeader.textContent = 'User Details';
                }

                openModal(modalContent);

                // Hide download button for user modal
                const modalDownloadBtn = document.getElementById('modalDownloadBtn');
                if (modalDownloadBtn) {
                    modalDownloadBtn.style.display = 'none';
                }
            }
        });
    });

    // ============ DOWNLOAD RECORD BUTTONS ============
    const downloadBtns = document.querySelectorAll('.download-record, .record-actions .btn-outline:not(.view-record)');
    downloadBtns.forEach(btn => {
        if (btn.querySelector('i.fa-download') || btn.textContent.includes('Download')) {
            btn.addEventListener('click', function(e) {
                if (this.disabled) return;
                e.stopPropagation();

                const recordCard = this.closest('.record-card');
                const recordId = this.getAttribute('data-record-id') || 
                                 recordCard?.querySelector('.view-record')?.getAttribute('data-record-id') || 
                                 'RECORD_' + Date.now();
                const recordType = recordCard?.querySelector('.record-type')?.textContent || 'Health Record';

                downloadRecord(recordId, recordType);
            });
        }
    });

    // ============ PATIENT SEARCH (Doctor Dashboard) ============
    const searchForm = document.getElementById('patientSearchForm');
    const patientResults = document.getElementById('patientResults');

    if (searchForm && patientResults) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const searchInput = document.getElementById('patientSearch');
            const nidaNumber = searchInput.value.trim();

            if (nidaNumber) {
                // Show loading state
                patientResults.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-spinner fa-spin fa-3x"></i>
                        <h3>Searching...</h3>
                        <p>Looking for patient records...</p>
                    </div>
                `;

                // Simulate search delay
                setTimeout(() => {
                    // Mock patient data based on NIDA
                    if (nidaNumber === '199012345678901') {
                        patientResults.innerHTML = `
                            <div class="patient-info">
                                <div class="patient-avatar">JM</div>
                                <div>
                                    <h3>John Michael</h3>
                                    <p>NIDA: ${nidaNumber}</p>
                                    <p>Status: <span class="status-badge granted">Access Granted</span></p>
                                </div>
                            </div>
                            <h4>Available Records</h4>
                            <div class="record-cards">
                                <div class="record-card">
                                    <div class="record-header">
                                        <div class="record-type">Laboratory Results</div>
                                        <div class="record-date">Oct 15, 2023</div>
                                    </div>
                                    <div class="record-details">
                                        <p><strong>Facility:</strong> Muhimbili National Hospital</p>
                                        <p><strong>Summary:</strong> Complete blood count, lipid panel</p>
                                    </div>
                                    <div class="record-actions">
                                        <button class="btn btn-outline btn-small view-record" data-record-id="LAB_JM_001">
                                            <i class="fas fa-eye"></i> View
                                        </button>
                                        <button class="btn btn-outline btn-small download-record" data-record-id="LAB_JM_001">
                                            <i class="fas fa-download"></i> Download
                                        </button>
                                    </div>
                                </div>
                            </div>
                        `;
                        showToast('Patient found! Access granted.', 'success');
                        // Re-attach event listeners for new buttons
                        attachRecordButtonListeners();
                    } else {
                        patientResults.innerHTML = `
                            <div class="empty-state">
                                <i class="fas fa-user-slash fa-3x"></i>
                                <h3>Patient Not Found</h3>
                                <p>No patient found with NIDA: ${nidaNumber}</p>
                                <p>Or you may not have access to this patient's records.</p>
                            </div>
                            <div class="access-request" style="margin-top: 1rem;">
                                <h4>Need Access?</h4>
                                <p>If this patient exists, you can request access to their records.</p>
                                <button class="btn btn-primary" onclick="requestAccess('${nidaNumber}')">
                                    <i class="fas fa-handshake"></i> Request Access
                                </button>
                            </div>
                        `;
                        showToast('Patient not found or no access', 'warning');
                    }
                }, 1000);
            } else {
                showToast('Please enter a NIDA number', 'warning');
            }
        });
    }

    // ============ ACCESS TOGGLE SWITCHES ============
    const toggleSwitches = document.querySelectorAll('.toggle-switch input');
    toggleSwitches.forEach(toggle => {
        toggle.addEventListener('change', function() {
            const accessItem = this.closest('.access-item');
            const doctorName = accessItem?.querySelector('.doctor-info h4')?.textContent || 'Doctor';
            const statusText = accessItem?.querySelector('.status-text');

            if (this.checked) {
                if (statusText) {
                    statusText.textContent = 'Access Granted';
                    statusText.className = 'status-text granted';
                }
                showToast(`Access granted to ${doctorName}`, 'success');
            } else {
                if (statusText) {
                    statusText.textContent = 'Access Revoked';
                    statusText.className = 'status-text revoked';
                }
                showToast(`Access revoked for ${doctorName}`, 'warning');
            }
        });
    });
});

// ============ HELPER FUNCTIONS ============

function downloadRecord(recordId, recordType) {
    // Show loading toast
    showToast('Preparing download...', 'info');

    // Simulate download preparation
    setTimeout(() => {
        // Create a mock file content
        const content = `
AFYA-CHAIN HEALTH RECORD
========================

Record ID: ${recordId}
Record Type: ${recordType}
Generated: ${new Date().toLocaleString()}

------------------------
DISCLAIMER
------------------------
This is a demonstration file generated by the Afya-Chain system.
In a production environment, this would contain actual encrypted
health record data retrieved from the blockchain.

The record has been verified and authenticated through the
blockchain-based health data ecosystem.

------------------------
BLOCKCHAIN VERIFICATION
------------------------
Hash: 0x${generateRandomHash()}
Block Number: ${Math.floor(Math.random() * 1000000)}
Timestamp: ${Date.now()}
Status: VERIFIED

------------------------
END OF RECORD
------------------------
        `;

        // Create blob and download
        const blob = new Blob([content], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${recordId}_${recordType.replace(/\s+/g, '_')}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        showToast('Download started successfully', 'success');
    }, 500);
}

function generateRandomHash() {
    const chars = '0123456789abcdef';
    let hash = '';
    for (let i = 0; i < 64; i++) {
        hash += chars[Math.floor(Math.random() * chars.length)];
    }
    return hash;
}

function requestAccess(nidaNumber) {
    showToast('Sending access request...', 'info');
    setTimeout(() => {
        showToast(`Access request sent for patient ${nidaNumber}`, 'success');
    }, 1000);
}

function attachRecordButtonListeners() {
    const newViewBtns = document.querySelectorAll('.view-record:not([data-listener])');
    const newDownloadBtns = document.querySelectorAll('.download-record:not([data-listener])');

    newViewBtns.forEach(btn => {
        btn.setAttribute('data-listener', 'true');
        btn.addEventListener('click', function() {
            const recordId = this.getAttribute('data-record-id');
            const recordCard = this.closest('.record-card');
            const recordType = recordCard?.querySelector('.record-type')?.textContent || 'Health Record';
            const recordDate = recordCard?.querySelector('.record-date')?.textContent || 'N/A';

            const modalContent = `
                <div class="modal-record-header">
                    <span class="modal-record-type">${recordType}</span>
                    <span class="modal-record-date">${recordDate}</span>
                </div>
                <div class="modal-info-grid">
                    <div class="modal-info-item">
                        <label>Record ID</label>
                        <span>${recordId}</span>
                    </div>
                    <div class="modal-info-item">
                        <label>Blockchain Status</label>
                        <span style="color: var(--status-granted);">Verified</span>
                    </div>
                </div>
                <div class="modal-summary">
                    <h4>Record Summary</h4>
                    <p>This health record is securely stored on the blockchain.</p>
                </div>
            `;

            const modalOverlay = document.getElementById('modalOverlay');
            const modalBody = document.getElementById('modalBody');
            if (modalBody) modalBody.innerHTML = modalContent;
            if (modalOverlay) {
                modalOverlay.classList.add('show');
                document.body.style.overflow = 'hidden';
            }
        });
    });

    newDownloadBtns.forEach(btn => {
        btn.setAttribute('data-listener', 'true');
        btn.addEventListener('click', function() {
            const recordId = this.getAttribute('data-record-id');
            const recordCard = this.closest('.record-card');
            const recordType = recordCard?.querySelector('.record-type')?.textContent || 'Health Record';
            downloadRecord(recordId, recordType);
        });
    });
}

// ============ TOAST NOTIFICATION (Dashboard Version) ============
function showToast(message, type = 'info') {
    // Check if toast container exists, create if not
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        container.style.cssText = `
            position: fixed;
            top: 1rem;
            right: 1rem;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        `;
        document.body.appendChild(container);
    }

    const icons = {
        success: 'fa-check-circle',
        error: 'fa-times-circle',
        warning: 'fa-exclamation-circle',
        info: 'fa-info-circle'
    };

    const colors = {
        success: 'var(--status-granted)',
        error: 'var(--status-revoked)',
        warning: 'var(--status-pending)',
        info: 'var(--primary-blue)'
    };

    const toast = document.createElement('div');
    toast.style.cssText = `
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 1rem 1.5rem;
        background-color: var(--neutral-white);
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-lg);
        border-left: 4px solid ${colors[type]};
        transform: translateX(120%);
        opacity: 0;
        transition: all 0.3s ease;
    `;

    toast.innerHTML = `
        <i class="fas ${icons[type]}" style="color: ${colors[type]}; font-size: 1.2rem;"></i>
        <span style="color: var(--neutral-black);">${message}</span>
    `;

    container.appendChild(toast);

    // Animate in
    requestAnimationFrame(() => {
        toast.style.transform = 'translateX(0)';
        toast.style.opacity = '1';
    });

    // Auto remove
    setTimeout(() => {
        toast.style.transform = 'translateX(120%)';
        toast.style.opacity = '0';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

// ============ BLOCKCHAIN INTEGRATION (Simplified) ============
// Note: This is a simplified version - the full blockchain integration
// is in the original dashboard.js and can be enabled when needed

function showNotification(message, type = 'info') {
    showToast(message, type);
}
