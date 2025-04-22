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

    // Password toggle buttons
    const togglePasswordButtons = [
        'toggleHidePassword',
        'toggleExtractPassword',
        'toggleEncryptKey',
        'toggleDecryptKey'
    ];

    // Setup password visibility toggles
    togglePasswordButtons.forEach(id => {
        const btn = document.getElementById(id);
        if (btn) {
            btn.addEventListener('click', function() {
                const inputId = this.previousElementSibling.id;
                const input = document.getElementById(inputId);
                const icon = this.querySelector('i');
                
                if (input.type === 'password') {
                    input.type = 'text';
                    icon.classList.remove('fa-eye');
                    icon.classList.add('fa-eye-slash');
                } else {
                    input.type = 'password';
                    icon.classList.remove('fa-eye-slash');
                    icon.classList.add('fa-eye');
                }
            });
        }
    });

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
                        hideDataBtn.innerHTML = '<i class="fas fa-eye-slash me-2"></i> Hide Data in Image';
                    }
                };
                img.src = URL.createObjectURL(hideImageUpload.files[0]);
            } catch (error) {
                showToast(error.message, 'error', 'Error');
                hideDataBtn.disabled = false;
                hideDataBtn.innerHTML = '<i class="fas fa-eye-slash me-2"></i> Hide Data in Image';
            }
        });
    }

    // Handle download of stego image
    if (hideDownloadBtn) {
        hideDownloadBtn.addEventListener('click', function () {
            try {
                // Get the image data
                const imageData = hideImagePreview.src;
                const format = hideImagePreview.dataset.format || 'png';

                console.log('Downloading image format:', format);
                console.log('Image data starts with:', imageData.substring(0, 50) + '...');

                // Send to server for download
                fetch('/download_image', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        image: imageData,
                        format: format
                    })
                })
                    .then(response => {
                        if (!response.ok) {
                            // Try to get more detailed error information
                            return response.json().then(errorData => {
                                throw new Error(errorData.error);
                            }).catch(() => {
                                throw new Error('Failed to download image. Server error.');
                            });
                        }
                        return response.blob();
                    })
                    .then(blob => {
                        // Create a download link
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.style.display = 'none';
                        a.href = url;
                        a.download = 'steganography_result.' + format;
                        document.body.appendChild(a);
                        a.click();
                        window.URL.revokeObjectURL(url);
                        showToast('Image downloaded successfully!', 'success');
                    })
                    .catch(error => {
                        console.error('Download error:', error);
                        showToast('Failed to download image: ' + error.message, 'error');
                    });
            } catch (error) {
                console.error('Download preparation error:', error);
                showToast('Error preparing download: ' + error.message, 'error');
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
                        // Extract data from the image
                        const data = await stego.extractData(img, password);
                        
                        // Display the extracted data
                        extractedData.value = data;
                        
                        showToast('Data extracted successfully!', 'success');
                    } catch (error) {
                        showToast(error.message, 'error', 'Error');
                        extractedData.value = '';
                    } finally {
                        // Reset button state
                        extractDataBtn.disabled = false;
                        extractDataBtn.innerHTML = '<i class="fas fa-eye me-2"></i> Extract Hidden Data';
                    }
                };
                img.src = URL.createObjectURL(extractImageUpload.files[0]);
            } catch (error) {
                showToast(error.message, 'error', 'Error');
                extractDataBtn.disabled = false;
                extractDataBtn.innerHTML = '<i class="fas fa-eye me-2"></i> Extract Hidden Data';
            }
        });
    }

    // ============================
    // Encryption Tab
    // ============================

    // Show/hide Caesar shift input based on selected algorithm
    if (encryptAlgorithm) {
        encryptAlgorithm.addEventListener('change', function () {
            if (this.value === 'caesar') {
                caesarShiftContainer.style.display = 'block';
                document.getElementById('encryptKey').parentElement.parentElement.style.display = 'none';
            } else {
                caesarShiftContainer.style.display = 'none';
                document.getElementById('encryptKey').parentElement.parentElement.style.display = 'block';
            }
        });
    }

    if (decryptAlgorithm) {
        decryptAlgorithm.addEventListener('change', function () {
            if (this.value === 'caesar') {
                decryptCaesarShiftContainer.style.display = 'block';
                document.getElementById('decryptKey').parentElement.parentElement.style.display = 'none';
            } else {
                decryptCaesarShiftContainer.style.display = 'none';
                document.getElementById('decryptKey').parentElement.parentElement.style.display = 'block';
            }
        });
    }

    // Handle text encryption
    if (encryptBtn) {
        encryptBtn.addEventListener('click', function () {
            const text = document.getElementById('textToEncrypt').value;
            const key = document.getElementById('encryptKey').value;
            const algorithm = document.getElementById('encryptAlgorithm').value;
            const outputFormat = document.getElementById('encryptOutputFormat').value;
            
            // Additional options for Caesar cipher
            const options = {};
            if (algorithm === 'caesar') {
                options.caesarShift = document.getElementById('caesarShift').value;
            }
            
            try {
                if (!text) {
                    showToast('Please enter text to encrypt', 'error');
                    return;
                }
                
                if (algorithm !== 'caesar' && !key) {
                    showToast('Please enter an encryption key', 'error');
                    return;
                }
                
                // Encrypt the text
                const encrypted = encryption.encrypt(text, key, algorithm, outputFormat, options);
                
                // Display the result
                document.getElementById('encryptedText').value = encrypted;
                
                showToast('Text encrypted successfully!', 'success');
            } catch (error) {
                showToast(error.message, 'error', 'Error');
            }
        });
    }

    // Handle text decryption
    if (decryptBtn) {
        decryptBtn.addEventListener('click', function () {
            const text = document.getElementById('textToDecrypt').value;
            const key = document.getElementById('decryptKey').value;
            const algorithm = document.getElementById('decryptAlgorithm').value;
            const inputFormat = document.getElementById('decryptInputFormat').value;
            
            // Additional options for Caesar cipher
            const options = {};
            if (algorithm === 'caesar') {
                options.caesarShift = document.getElementById('decryptCaesarShift').value;
            }
            
            try {
                if (!text) {
                    showToast('Please enter text to decrypt', 'error');
                    return;
                }
                
                if (algorithm !== 'caesar' && !key) {
                    showToast('Please enter a decryption key', 'error');
                    return;
                }
                
                // Decrypt the text
                const decrypted = encryption.decrypt(text, key, algorithm, inputFormat, options);
                
                // Display the result
                document.getElementById('decryptedText').value = decrypted;
                
                showToast('Text decrypted successfully!', 'success');
            } catch (error) {
                showToast(error.message, 'error', 'Error');
            }
        });
    }

    // Copy button functionality
    function setupCopyButton(buttonId, textAreaId) {
        const button = document.getElementById(buttonId);
        if (button) {
            button.addEventListener('click', function() {
                const textarea = document.getElementById(textAreaId);
                textarea.select();
                document.execCommand('copy');
                
                // Change button text temporarily
                const originalText = this.innerHTML;
                this.innerHTML = '<i class="fas fa-check me-1"></i> Copied!';
                
                setTimeout(() => {
                    this.innerHTML = originalText;
                }, 2000);
            });
        }
    }

    // Setup copy buttons
    setupCopyButton('copyEncryptedBtn', 'encryptedText');
    setupCopyButton('copyDecryptedBtn', 'decryptedText');
    setupCopyButton('copyExtractedBtn', 'extractedData');
});
