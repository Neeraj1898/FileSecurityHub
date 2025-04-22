/**
 * CryptoSteg - Main JS
 * Handles UI interactions and initialization
 */

document.addEventListener('DOMContentLoaded', function () {
    // Initialize the steganography and encryption modules
    const stego = new Steganography();
    const encryption = new Encryption();

    // Toast for notifications
    const toastEl = document.getElementById('statusToast');
    const toast = new bootstrap.Toast(toastEl);

    // Tab handling for main tabs
    document.querySelectorAll('.nav-link[data-bs-toggle="tab"]').forEach(tab => {
        tab.addEventListener('click', function (e) {
            const target = this.getAttribute('href');
            if (target.startsWith('#')) {
                e.preventDefault();
                document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('show', 'active'));
                document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));

                document.querySelector(target).classList.add('show', 'active');
                this.classList.add('active');
            }
        });
    });

    // Image upload preview for hiding data
    const hideImageUpload = document.getElementById('hideImageUpload');
    const hideImagePreview = document.getElementById('hideImagePreview');
    const hideNoImageMessage = document.getElementById('hideNoImageMessage');
    const hideImageInfo = document.getElementById('hideImageInfo');

    // Image upload preview for extracting data
    const extractImageUpload = document.getElementById('extractImageUpload');
    const extractImagePreview = document.getElementById('extractImagePreview');
    const extractNoImageMessage = document.getElementById('extractNoImageMessage');
    const extractImageInfo = document.getElementById('extractImageInfo');

    // Button elements
    const hideDataBtn = document.getElementById('hideDataBtn');
    const extractDataBtn = document.getElementById('extractDataBtn');
    const hideDownloadBtn = document.getElementById('hideDownloadBtn');

    // Encryption/decryption elements
    const encryptBtn = document.getElementById('encryptBtn');
    const decryptBtn = document.getElementById('decryptBtn');
    const copyEncryptedBtn = document.getElementById('copyEncryptedBtn');
    const copyDecryptedBtn = document.getElementById('copyDecryptedBtn');
    const copyExtractedBtn = document.getElementById('copyExtractedBtn');
    const encryptAlgorithm = document.getElementById('encryptAlgorithm');
    const decryptAlgorithm = document.getElementById('decryptAlgorithm');
    const caesarShiftContainer = document.getElementById('caesarShiftContainer');
    const decryptCaesarShiftContainer = document.getElementById('decryptCaesarShiftContainer');

    // Function to show toast notifications
    function showToast(message, type = 'info', title = 'Notification') {
        const toastTitle = document.getElementById('toastTitle');
        const toastMessage = document.getElementById('toastMessage');
        const toastIcon = document.getElementById('toastIcon');

        toastTitle.textContent = title;
        toastMessage.textContent = message;

        // Set icon and color based on type
        toastIcon.className = 'fas me-2';
        switch (type) {
            case 'success':
                toastIcon.classList.add('fa-check-circle');
                toastIcon.style.color = '#00ff9d';
                break;
            case 'error':
                toastIcon.classList.add('fa-exclamation-circle');
                toastIcon.style.color = '#ff3860';
                break;
            case 'warning':
                toastIcon.classList.add('fa-exclamation-triangle');
                toastIcon.style.color = '#ffdd57';
                break;
            default:
                toastIcon.classList.add('fa-info-circle');
                toastIcon.style.color = '#00ffea';
        }

        toast.show();
    }

    // ============================
    // Steganography - Hide Data
    // ============================

    // Handle hide image upload
    if (hideImageUpload) {
        hideImageUpload.addEventListener('change', function () {
            if (this.files && this.files[0]) {
                const file = this.files[0];

                // Check file type
                const fileType = file.type.split('/')[1];
                if (!['jpeg', 'jpg', 'png', 'gif', 'bmp'].includes(fileType)) {
                    showToast('Please select a valid image file (JPEG, PNG, GIF, BMP)', 'error');
                    this.value = '';
                    return;
                }

                const reader = new FileReader();
                reader.onload = function (e) {
                    // Create an image element to get dimensions
                    const img = new Image();
                    img.onload = function () {
                        // Display the image
                        hideImagePreview.src = e.target.result;
                        hideImagePreview.style.display = 'block';
                        hideNoImageMessage.style.display = 'none';

                        // Calculate max data size
                        const maxSize = stego.calculateMaxTextLength(img);

                        // Show image information
                        hideImageInfo.textContent = `${img.width}x${img.height} px | ${fileType.toUpperCase()} | Max text: ~${maxSize} characters`;
                    };
                    img.src = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Handle hiding data in image
    if (hideDataBtn) {
        hideDataBtn.addEventListener('click', async function () {
            const dataInput = document.getElementById('hideData');
            const password = document.getElementById('hidePassword').value;

            // Check if image is selected
            if (!hideImageUpload.files || !hideImageUpload.files[0]) {
                showToast('Please select an image first', 'error');
                return;
            }

            // Check if data is entered
            if (!dataInput.value.trim()) {
                showToast('Please enter some data to hide', 'error');
                return;
            }

            try {
                // Show loading state
                hideDataBtn.disabled = true;
                hideDataBtn.innerHTML = '<i class="fas fa-sync fa-spin"></i> Processing...';

                // Create an image element from the source
                const img = new Image();
                img.onload = async function () {
                    try {
                        // Hide the data in the image
                        const resultBlob = await stego.hideData(img, dataInput.value, password);

                        // Display the result image
                        const resultUrl = URL.createObjectURL(resultBlob);
                        hideImagePreview.src = resultUrl;

                        // Show download button
                        document.getElementById('hideResultActions').style.display = 'block';

                        // Store the blob for download
                        hideImagePreview.dataset.resultBlob = resultUrl;
                        hideImagePreview.dataset.format = 'png';

                        showToast('Data hidden successfully! You can now download the image.', 'success');
                    } catch (error) {
                        showToast(error.message, 'error', 'Error');
                    } finally {
                        // Reset button state
                        hideDataBtn.disabled = false;
                        hideDataBtn.innerHTML = '<i class="fas fa-eye-slash"></i> Hide Data in Image';
                    }
                };
                img.src = URL.createObjectURL(hideImageUpload.files[0]);
            } catch (error) {
                showToast(error.message, 'error', 'Error');
                hideDataBtn.disabled = false;
                hideDataBtn.innerHTML = '<i class="fas fa-eye-slash"></i> Hide Data in Image';
            }
        });
    }

    // Handle download of stego image
    if (hideDownloadBtn) {
        hideDownloadBtn.addEventListener('click', function () {
            try {
                // Get the image data
                const imageUrl = hideImagePreview.src;
                
                // Create a download link
                const a = document.createElement('a');
                a.href = imageUrl;
                a.download = 'steganography_result.png';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                
                showToast('Image downloaded successfully!', 'success');
            } catch (error) {
                console.error('Download error:', error);
                showToast('Failed to download image: ' + error.message, 'error');
            }
        });
    }

    // ============================
    // Steganography - Extract Data
    // ============================

    // Handle extract image upload
    if (extractImageUpload) {
        extractImageUpload.addEventListener('change', function () {
            if (this.files && this.files[0]) {
                const file = this.files[0];

                // Check file type
                const fileType = file.type.split('/')[1];
                if (!['jpeg', 'jpg', 'png', 'gif', 'bmp'].includes(fileType)) {
                    showToast('Please select a valid image file (JPEG, PNG, GIF, BMP)', 'error');
                    this.value = '';
                    return;
                }

                const reader = new FileReader();
                reader.onload = function (e) {
                    // Create an image element to get dimensions
                    const img = new Image();
                    img.onload = function () {
                        // Display the image
                        extractImagePreview.src = e.target.result;
                        extractImagePreview.style.display = 'block';
                        extractNoImageMessage.style.display = 'none';

                        // Show image information
                        extractImageInfo.textContent = `${img.width}x${img.height} px | ${fileType.toUpperCase()}`;
                    };
                    img.src = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Handle extracting data from image
    if (extractDataBtn) {
        extractDataBtn.addEventListener('click', function () {
            const password = document.getElementById('extractPassword').value;
            const extractedData = document.getElementById('extractedData');

            // Check if image is selected
            if (!extractImageUpload.files || !extractImageUpload.files[0]) {
                showToast('Please select an image first', 'error');
                return;
            }

            try {
                // Show loading state
                extractDataBtn.disabled = true;
                extractDataBtn.innerHTML = '<i class="fas fa-sync fa-spin"></i> Extracting...';

                // Create an image element from the source
                const img = new Image();
                img.onload = async function () {
                    try {
                        // Extract the data from the image
                        const extractedText = await stego.extractData(img, password);
                        
                        // Display the extracted data
                        extractedData.value = extractedText;
                        
                        // Show the extracted data container
                        document.getElementById('extractResultContainer').style.display = 'block';
                        
                        showToast('Data extracted successfully!', 'success');
                    } catch (error) {
                        showToast(error.message, 'error', 'Extraction Error');
                    } finally {
                        // Reset button state
                        extractDataBtn.disabled = false;
                        extractDataBtn.innerHTML = '<i class="fas fa-eye"></i> Extract Data';
                    }
                };
                img.src = URL.createObjectURL(extractImageUpload.files[0]);
            } catch (error) {
                showToast(error.message, 'error', 'Error');
                extractDataBtn.disabled = false;
                extractDataBtn.innerHTML = '<i class="fas fa-eye"></i> Extract Data';
            }
        });
    }

    // ============================
    // Text Encryption
    // ============================

    // Toggle Caesar shift input visibility based on algorithm selection
    if (encryptAlgorithm) {
        encryptAlgorithm.addEventListener('change', function() {
            const algorithm = this.value;
            if (algorithm === 'caesar') {
                caesarShiftContainer.style.display = 'block';
            } else {
                caesarShiftContainer.style.display = 'none';
            }
            
            // Update algorithm info
            updateEncryptionInfo(algorithm);
        });
        
        // Initialize with default algorithm info
        updateEncryptionInfo(encryptAlgorithm.value);
    }

    if (decryptAlgorithm) {
        decryptAlgorithm.addEventListener('change', function() {
            const algorithm = this.value;
            if (algorithm === 'caesar') {
                decryptCaesarShiftContainer.style.display = 'block';
            } else {
                decryptCaesarShiftContainer.style.display = 'none';
            }
        });
    }

    // Function to update encryption algorithm information
    function updateEncryptionInfo(algorithm) {
        const infoContainer = document.getElementById('algorithmInfo');
        if (!infoContainer) return;
        
        const info = encryption.getAlgorithmInfo(algorithm);
        
        infoContainer.innerHTML = `
            <div class="mt-3 p-2 bg-dark rounded">
                <h6 class="mb-2">${info.name}</h6>
                <p class="small mb-1">${info.description}</p>
                <div class="d-flex justify-content-between small">
                    <span>Key Length: ${info.keyLength}</span>
                    <span>Strength: ${info.strength}</span>
                </div>
            </div>
        `;
    }

    // Handle encryption
    if (encryptBtn) {
        encryptBtn.addEventListener('click', function() {
            const plaintext = document.getElementById('plaintext').value;
            const encryptKey = document.getElementById('encryptKey').value;
            const algorithm = document.getElementById('encryptAlgorithm').value;
            const outputFormat = document.getElementById('outputFormat').value;
            
            // Options for Caesar cipher
            const options = {};
            if (algorithm === 'caesar') {
                options.caesarShift = document.getElementById('caesarShift').value;
            }
            
            try {
                if (!plaintext) {
                    throw new Error('Please enter text to encrypt');
                }
                
                if (!encryptKey && algorithm !== 'caesar') {
                    throw new Error('Please enter an encryption key');
                }
                
                // Encrypt the text
                const encrypted = encryption.encrypt(plaintext, encryptKey, algorithm, outputFormat, options);
                
                // Display the encrypted text
                document.getElementById('encrypted').value = encrypted;
                
                showToast('Text encrypted successfully!', 'success');
            } catch (error) {
                showToast(error.message, 'error', 'Encryption Error');
            }
        });
    }

    // Handle decryption
    if (decryptBtn) {
        decryptBtn.addEventListener('click', function() {
            const encryptedInput = document.getElementById('encryptedInput').value;
            const decryptKey = document.getElementById('decryptKey').value;
            const algorithm = document.getElementById('decryptAlgorithm').value;
            const inputFormat = document.getElementById('inputFormat').value;
            
            // Options for Caesar cipher
            const options = {};
            if (algorithm === 'caesar') {
                options.caesarShift = document.getElementById('decryptCaesarShift').value;
            }
            
            try {
                if (!encryptedInput) {
                    throw new Error('Please enter text to decrypt');
                }
                
                if (!decryptKey && algorithm !== 'caesar') {
                    throw new Error('Please enter a decryption key');
                }
                
                // Decrypt the text
                const decrypted = encryption.decrypt(encryptedInput, decryptKey, algorithm, inputFormat, options);
                
                // Display the decrypted text
                document.getElementById('decrypted').value = decrypted;
                
                showToast('Text decrypted successfully!', 'success');
            } catch (error) {
                showToast(error.message, 'error', 'Decryption Error');
            }
        });
    }

    // Copy text to clipboard functions
    function copyToClipboard(text, successMsg) {
        const tempInput = document.createElement('textarea');
        tempInput.value = text;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);
        showToast(successMsg, 'success');
    }

    if (copyEncryptedBtn) {
        copyEncryptedBtn.addEventListener('click', function() {
            const text = document.getElementById('encrypted').value;
            if (text) {
                copyToClipboard(text, 'Encrypted text copied to clipboard!');
            } else {
                showToast('No encrypted text to copy', 'error');
            }
        });
    }

    if (copyDecryptedBtn) {
        copyDecryptedBtn.addEventListener('click', function() {
            const text = document.getElementById('decrypted').value;
            if (text) {
                copyToClipboard(text, 'Decrypted text copied to clipboard!');
            } else {
                showToast('No decrypted text to copy', 'error');
            }
        });
    }

    if (copyExtractedBtn) {
        copyExtractedBtn.addEventListener('click', function() {
            const text = document.getElementById('extractedData').value;
            if (text) {
                copyToClipboard(text, 'Extracted text copied to clipboard!');
            } else {
                showToast('No extracted text to copy', 'error');
            }
        });
    }
});