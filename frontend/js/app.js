// Enhanced Video Summarizer App JavaScript

// Global variables to store important elements
let globalFileInput = null;
let globalStartBtn = null;

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  try {
    console.log('📄 DOM loaded, initializing app...');
    initializeApp();
  } catch (error) {
    console.error('❌ Error initializing app:', error);
  }
});

// Also try to initialize if DOM is already loaded
if (document.readyState === 'loading') {
  console.log('📄 DOM still loading...');
} else {
  console.log('📄 DOM already loaded, initializing immediately...');
  // Add a small delay to ensure everything is ready
  setTimeout(() => {
    try {
      initializeApp();
    } catch (error) {
      console.error('❌ Error initializing app:', error);
    }
  }, 100);
}

// Authentication Tab Management
function showAuthTab(tabName) {
  // Hide all forms
  document.querySelectorAll('.auth-form').forEach(form => {
    form.classList.remove('active');
  });
  
  // Remove active class from all tabs
  document.querySelectorAll('.auth-tab').forEach(tab => {
    tab.classList.remove('active');
  });
  
  // Show selected form and activate tab
  document.getElementById(tabName + 'Form').classList.add('active');
  event.target.classList.add('active');
}

// Show forgot password form
function showForgotPassword() {
  document.querySelectorAll('.auth-form').forEach(form => {
    form.classList.remove('active');
  });
  document.getElementById('forgotPasswordForm').classList.add('active');
}

// Handle Sign In
async function handleSignIn(event) {
  event.preventDefault();
  
  const email = document.getElementById('signinEmail').value;
  const password = document.getElementById('signinPassword').value;
  
  // Show loading state
  const submitBtn = event.target.querySelector('button[type="submit"]');
  const originalText = submitBtn.innerHTML;
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing In...';
  submitBtn.disabled = true;
  
  try {
    const result = await authService.signIn(email, password);
    
    if (result.success) {
      showNotification('Welcome back! 🎉', 'success');
      // Auth state change will handle UI update
    } else {
      showNotification(result.error, 'error');
    }
  } catch (error) {
    showNotification('An unexpected error occurred', 'error');
  } finally {
    // Reset button state
    submitBtn.innerHTML = originalText;
    submitBtn.disabled = false;
  }
}

// Handle Sign Up
async function handleSignUp(event) {
  event.preventDefault();
  
  const email = document.getElementById('signupEmail').value;
  const password = document.getElementById('signupPassword').value;
  const confirmPassword = document.getElementById('signupConfirmPassword').value;
  
  // Validate passwords match
  if (password !== confirmPassword) {
    showNotification('Passwords do not match', 'error');
    return;
  }
  
  // Validate password length
  if (password.length < 6) {
    showNotification('Password must be at least 6 characters long', 'error');
    return;
  }
  
  // Show loading state
  const submitBtn = event.target.querySelector('button[type="submit"]');
  const originalText = submitBtn.innerHTML;
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating Account...';
  submitBtn.disabled = true;
  
  try {
    const result = await authService.signUp(email, password);
    
    if (result.success) {
      showNotification('Account created successfully! 🎉', 'success');
      // Auth state change will handle UI update
    } else {
      showNotification(result.error, 'error');
    }
  } catch (error) {
    showNotification('An unexpected error occurred', 'error');
  } finally {
    // Reset button state
    submitBtn.innerHTML = originalText;
    submitBtn.disabled = false;
  }
}

// Handle Google Sign In
async function handleGoogleSignIn() {
  try {
    const result = await authService.signInWithGoogle();
    
    if (result.success) {
      showNotification('Google sign in successful! 🎉', 'success');
      // Auth state change will handle UI update
    } else {
      showNotification(result.error, 'error');
    }
  } catch (error) {
    showNotification('Google sign in failed', 'error');
  }
}

// Handle Forgot Password
async function handleForgotPassword(event) {
  event.preventDefault();
  
  const email = document.getElementById('resetEmail').value;
  
  // Show loading state
  const submitBtn = event.target.querySelector('button[type="submit"]');
  const originalText = submitBtn.innerHTML;
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
  submitBtn.disabled = true;
  
  try {
    const result = await authService.resetPassword(email);
    
    if (result.success) {
      showNotification('Password reset email sent! Check your inbox 📧', 'success');
      // Go back to sign in
      setTimeout(() => showAuthTab('signin'), 2000);
    } else {
      showNotification(result.error, 'error');
    }
  } catch (error) {
    showNotification('An unexpected error occurred', 'error');
  } finally {
    // Reset button state
    submitBtn.innerHTML = originalText;
    submitBtn.disabled = false;
  }
}

// Initialize the application
function initializeApp() {
  console.log('🚀 Initializing AI Video Summarizer...');
  
  // Check if user is already authenticated
  if (authService.isAuthenticated()) {
    console.log('✅ User already authenticated');
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
      mainContent.style.display = 'block';
    }
    
    const authForms = document.querySelector('.auth-forms');
    if (authForms) {
      authForms.style.display = 'none';
    }
  }
  
  // Initialize existing functionality
  initializeExistingFeatures();
}

// Initialize existing app features
function initializeExistingFeatures() {
  console.log('🔧 Initializing existing app features...');
  
  // Check all required elements exist
  const requiredElements = {
    'startBtn': document.getElementById('startBtn'),
    'testBtn': document.getElementById('testBtn'),
    'fileInput': document.getElementById('fileInput'),
    'uploadArea': document.getElementById('uploadArea'),
    'status': document.getElementById('status'),
    'transcript': document.getElementById('transcript'),
    'summary': document.getElementById('summary'),
    'translations': document.getElementById('translations'),
    'exportPdfBtn': document.getElementById('exportPdfBtn')
  };
  
  console.log('🔍 Checking required elements:', requiredElements);
  
  // Store important elements globally
  globalFileInput = requiredElements.fileInput;
  globalStartBtn = requiredElements.startBtn;
  
  console.log('🌍 Global file input stored:', globalFileInput);
  console.log('🌍 Global start button stored:', globalStartBtn);
  
  // Set up event listeners
  const startBtn = requiredElements.startBtn;
  const testBtn = requiredElements.testBtn;
  const exportPdfBtn = requiredElements.exportPdfBtn;
  
  if (startBtn) {
    startBtn.addEventListener('click', function() {
      console.log('🔘 Process Video button clicked!');
      processVideo();
    });
    console.log('✅ Process Video button listener added');
  } else {
    console.log('❌ Process Video button not found!');
  }
  
  if (testBtn) {
    testBtn.addEventListener('click', testJavaScript);
    console.log('✅ Test button listener added');
  } else {
    console.log('❌ Test button not found!');
  }
  
  if (exportPdfBtn) {
    exportPdfBtn.addEventListener('click', exportToPDF);
    console.log('✅ Export PDF button listener added');
  } else {
    console.log('❌ Export PDF button not found!');
  }
  
  if (requiredElements.fileInput) {
    console.log('✅ File input found');
  } else {
    console.log('❌ File input not found!');
  }
  
  setupDragAndDrop();
  setupFileInput();
  
  // Initialize status
  updateStatus('ready', 'Ready to process');
  console.log('🚀 App initialized successfully!');
}

// Test function to verify JavaScript is working
function testJavaScript() {
  console.log('🧪 Test button clicked!');
  showNotification('JavaScript is working! Test successful.', 'success');
  
  // Test if elements exist
  const elements = {
    'startBtn': document.getElementById('startBtn'),
    'fileInput': document.getElementById('fileInput'),
    'transcript': document.getElementById('transcript'),
    'summary': document.getElementById('summary'),
    'translations': document.getElementById('translations')
  };
  
  console.log('🔍 Element check:', elements);
  
  // Test file input specifically
  const fileInput = document.getElementById('fileInput');
  if (fileInput) {
    console.log('✅ File input found:', fileInput);
    console.log('📁 File input files:', fileInput.files);
    console.log('📁 File input files length:', fileInput.files.length);
    
    if (fileInput.files.length > 0) {
      console.log('📁 Selected file:', fileInput.files[0].name);
    } else {
      console.log('📁 No file selected');
    }
  } else {
    console.log('❌ File input not found!');
    console.log('🔍 All input elements:', document.querySelectorAll('input'));
  }
  
  // Test global variables
  console.log('🌍 Global variables check:');
  console.log('  - globalFileInput:', globalFileInput);
  console.log('  - globalStartBtn:', globalStartBtn);
  
  // Test DOM structure
  console.log('🏗️ DOM structure check:');
  console.log('  - Document readyState:', document.readyState);
  console.log('  - Body children count:', document.body.children.length);
  console.log('  - All elements with ID:', document.querySelectorAll('[id]'));
  
  // Test display results with mock data
  const mockStatus = {
    transcript: 'This is a test transcript.',
    summary: 'This is a test summary with key points.',
    translations: {
      'FR': 'Ceci est un résumé de test avec des points clés.',
      'ES': 'Este es un resumen de prueba con puntos clave.'
    }
  };
  
  console.log('🧪 Testing displayResults with mock data...');
  displayResults(mockStatus);
}

// Drag and drop functionality
function setupDragAndDrop() {
  const uploadArea = document.getElementById('uploadArea');
  const fileInput = document.getElementById('fileInput');

  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    uploadArea.addEventListener(eventName, preventDefaults, false);
  });

  function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  ['dragenter', 'dragover'].forEach(eventName => {
    uploadArea.addEventListener(eventName, highlight, false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    uploadArea.addEventListener(eventName, unhighlight, false);
  });

  function highlight(e) {
    uploadArea.classList.add('dragover');
  }

  function unhighlight(e) {
    uploadArea.classList.remove('dragover');
  }

  uploadArea.addEventListener('drop', handleDrop, false);

  function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    
    if (files.length > 0) {
      fileInput.files = files;
      updateFileDisplay(files[0]);
    }
  }
}

// File input handling
function setupFileInput() {
  const fileInput = document.getElementById('fileInput');
  fileInput.addEventListener('change', function(e) {
    if (e.target.files.length > 0) {
      updateFileDisplay(e.target.files[0]);
    }
  });
}

// Update file display
function updateFileDisplay(file) {
  const uploadContent = document.querySelector('.upload-content');
  const fileName = file.name;
  const fileSize = formatFileSize(file.size);
  
  uploadContent.innerHTML = `
    <i class="fas fa-file-video"></i>
    <h3>${fileName}</h3>
    <p>${fileSize}</p>
  `;
  
  updateStatus('ready', `File selected: ${fileName}`);
}

// Format file size
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Update status display
function updateStatus(type, message) {
  const statusElement = document.getElementById('status');
  const progressElement = document.getElementById('progress');
  
  // Remove all status classes
  statusElement.classList.remove('ready', 'processing', 'error', 'success');
  
  // Add appropriate class and update content
  statusElement.classList.add(type);
  statusElement.innerHTML = `
    <i class="fas fa-${getStatusIcon(type)}"></i>
    <span>${message}</span>
  `;
  
  // Show/hide progress bar
  if (type === 'processing') {
    progressElement.style.display = 'block';
  } else {
    progressElement.style.display = 'none';
  }
}

// Get status icon
function getStatusIcon(type) {
  switch(type) {
    case 'ready': return 'circle';
    case 'processing': return 'spinner';
    case 'error': return 'exclamation-triangle';
    case 'success': return 'check-circle';
    default: return 'circle';
  }
}

// Main processing function
window.processVideo = async function() {
  console.log('🔍 processVideo function called!');
  
  // Wait a moment to ensure DOM is fully ready
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Try multiple ways to find the file input
  let fileInputElement = document.getElementById('fileInput');
  console.log('🔍 First attempt - fileInput by ID:', fileInputElement);
  
  if (!fileInputElement) {
    console.log('❌ fileInput by ID not found, trying global variable...');
    fileInputElement = globalFileInput;
    console.log('🔍 Second attempt - global fileInput:', fileInputElement);
  }
  
  if (!fileInputElement) {
    console.log('❌ Global fileInput not found, trying querySelector...');
    fileInputElement = document.querySelector('input[type="file"]');
    console.log('🔍 Third attempt - fileInput by querySelector:', fileInputElement);
  }
  
  if (!fileInputElement) {
    console.log('❌ fileInput by querySelector not found, trying all inputs...');
    const allInputs = document.querySelectorAll('input');
    console.log('🔍 All input elements found:', allInputs);
    
    // Try to find any file input
    for (let input of allInputs) {
      if (input.type === 'file') {
        fileInputElement = input;
        console.log('✅ Found file input in all inputs:', fileInputElement);
        break;
      }
    }
  }
  
  if (!fileInputElement) {
    console.log('❌ fileInput element not found!');
    console.log('🔍 Document body:', document.body);
    console.log('🔍 Document readyState:', document.readyState);
    console.log('🔍 Global variables - fileInput:', globalFileInput, 'startBtn:', globalStartBtn);
    showNotification('File input element not found. Please refresh the page.', 'error');
    return;
  }
  
  console.log('✅ fileInput element found:', fileInputElement);
  console.log('📁 fileInput files:', fileInputElement.files);
  console.log('📁 fileInput files length:', fileInputElement.files.length);
  
  const fileInput = fileInputElement.files[0];
  if (!fileInput) {
    console.log('❌ No file selected');
    showNotification('Please select a video file.', 'error');
    return;
  }

  console.log('✅ File selected:', fileInput.name, 'Size:', fileInput.size);

  // Validate file type
  if (!fileInput.type.startsWith('video/')) {
    console.log('❌ Invalid file type:', fileInput.type);
    showNotification('Please select a valid video file.', 'error');
    return;
  }

  // Validate file size (100MB limit)
  if (fileInput.size > 100 * 1024 * 1024) {
    console.log('❌ File too large:', fileInput.size);
    showNotification('File size must be less than 100MB.', 'error');
    return;
  }

  const contentType = document.getElementById('contentType').value;
  const summaryStyle = document.getElementById('summaryStyle').value;
  const languages = document.getElementById('languages').value;

  console.log('📋 Form data:', { contentType, summaryStyle, languages });

  // Disable button and show processing status
  const startBtn = document.getElementById('startBtn');
  startBtn.disabled = true;
  startBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';

  updateStatus('processing', 'Uploading video...');

  const formData = new FormData();
  formData.append('video', fileInput);
  formData.append('contentType', contentType);
  formData.append('summaryStyle', summaryStyle);
  formData.append('languages', languages);

  try {
    console.log('🚀 Sending upload request to /api/upload...');
    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });
    
    console.log('📡 Upload response status:', res.status);
    
    if (!res.ok) {
      throw new Error(`Upload failed: ${res.status}`);
    }
    
    const data = await res.json();
    console.log('📦 Upload response data:', data);
    
    if (!data.jobId) {
      throw new Error('No job ID received');
    }

    updateStatus('processing', 'Processing video... (this may take several minutes)');
    const jobId = data.jobId;
    console.log('🆔 Job ID received:', jobId);

    // Poll for status updates
    const interval = setInterval(async () => {
      try {
        console.log('🔄 Checking status for job:', jobId);
        const sRes = await fetch(`/api/status/${jobId}`);
        console.log('📡 Status response status:', sRes.status);
        
        if (!sRes.ok) {
          throw new Error(`Status check failed: ${sRes.status}`);
        }
        
        const status = await sRes.json();
        console.log('📊 Status data:', status);
        updateStatus('processing', `Status: ${status.status}`);

        if (status.status === 'done' || status.status === 'error') {
          clearInterval(interval);
          
          if (status.status === 'done') {
            console.log('✅ Processing completed, displaying results...');
            displayResults(status);
            updateStatus('success', 'Processing completed successfully!');
            showNotification('Video processing completed!', 'success');
          } else {
            console.log('❌ Processing failed:', status.error);
            updateStatus('error', `Error: ${status.error || 'Unknown error'}`);
            showNotification('Processing failed. Please try again.', 'error');
          }
          
          // Re-enable button
          startBtn.disabled = false;
          startBtn.innerHTML = '<i class="fas fa-play"></i> Process Video';
        }
      } catch (error) {
        clearInterval(interval);
        console.error('❌ Status check error:', error);
        updateStatus('error', 'Status check failed');
        startBtn.disabled = false;
        startBtn.innerHTML = '<i class="fas fa-play"></i> Process Video';
        showNotification('Status check failed. Please try again.', 'error');
      }
    }, 3000);
    
  } catch (err) {
    console.error('❌ Upload error:', err);
    updateStatus('error', 'Upload failed');
    startBtn.disabled = false;
    startBtn.innerHTML = '<i class="fas fa-play"></i> Process Video';
    showNotification('Upload failed. Please try again.', 'error');
  }
}

// Display results
function displayResults(status) {
  console.log('🎯 displayResults called with status:', status);
  
  // Display transcript
  const transcriptElement = document.getElementById('transcript');
  console.log('📝 Transcript element found:', !!transcriptElement);
  transcriptElement.textContent = status.transcript || 'No transcript available';
  console.log('📝 Transcript content set:', status.transcript ? 'Yes' : 'No');
  
  // Display summary
  const summaryElement = document.getElementById('summary');
  console.log('🧠 Summary element found:', !!summaryElement);
  summaryElement.textContent = status.summary || 'No summary available';
  console.log('🧠 Summary content set:', status.summary ? 'Yes' : 'No');
  
  // Display translations
  const translationsElement = document.getElementById('translations');
  console.log('🌍 Translations element found:', !!translationsElement);
  translationsElement.innerHTML = '';
  
  if (status.translations) {
    console.log('🌍 Translations data:', status.translations);
    Object.entries(status.translations).forEach(([lang, text]) => {
      console.log(`🌍 Creating translation for ${lang}:`, text.substring(0, 50) + '...');
      const translationItem = document.createElement('div');
      translationItem.className = 'translation-item';
      translationItem.innerHTML = `
        <div class="translation-header">
          <span class="translation-lang">${lang}</span>
          <button class="copy-btn" onclick="copyToClipboard('${lang}')">
            <i class="fas fa-copy"></i>
          </button>
        </div>
        <div class="translation-content">${text}</div>
      `;
      translationsElement.appendChild(translationItem);
    });
  } else {
    console.log('❌ No translations data found');
  }
  
  // Show export button if we have results
  showExportButton(status);
  
  console.log('✅ displayResults completed');
}

// Show export button when results are available
function showExportButton(status) {
  const exportPdfBtn = document.getElementById('exportPdfBtn');
  if (exportPdfBtn) {
    const hasResults = status.transcript || status.summary || (status.translations && Object.keys(status.translations).length > 0);
    if (hasResults) {
      exportPdfBtn.style.display = 'inline-flex';
      console.log('✅ Export button shown');
    } else {
      exportPdfBtn.style.display = 'none';
      console.log('❌ Export button hidden - no results');
    }
  }
}

// PDF Export function
async function exportToPDF() {
  try {
    console.log('📄 Starting PDF export...');
    
    // Get current results
    const transcript = document.getElementById('transcript').textContent || '';
    const summary = document.getElementById('summary').textContent || '';
    const translations = {};
    
    // Get translations data
    const translationElements = document.querySelectorAll('.translation-item');
    translationElements.forEach(element => {
      const langElement = element.querySelector('.translation-lang');
      const contentElement = element.querySelector('.translation-content');
      if (langElement && contentElement) {
        const lang = langElement.textContent.split(' ')[0]; // Get language code
        translations[lang] = contentElement.textContent;
      }
    });
    
    // Get configuration
    const contentType = document.getElementById('contentType').value;
    const summaryStyle = document.getElementById('summaryStyle').value;
    
    // Show loading state
    const exportBtn = document.getElementById('exportPdfBtn');
    const originalText = exportBtn.innerHTML;
    exportBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating PDF...';
    exportBtn.disabled = true;
    
    // Prepare export data
    const exportData = {
      transcript,
      summary,
      translations,
      fileName: 'video-summary',
      contentType,
      summaryStyle
    };
    
    console.log('📄 Export data prepared:', exportData);
    
    // Make API request
    const response = await fetch('/api/export-pdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(exportData)
    });
    
    if (!response.ok) {
      throw new Error(`PDF export failed: ${response.status}`);
    }
    
    // Get PDF blob
    const pdfBlob = await response.blob();
    
    // Create download link
    const url = window.URL.createObjectURL(pdfBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `video-summary-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    console.log('✅ PDF exported successfully');
    showNotification('PDF exported successfully! 📄', 'success');
    
  } catch (error) {
    console.error('❌ PDF export failed:', error);
    showNotification(`PDF export failed: ${error.message}`, 'error');
  } finally {
    // Reset button state
    const exportBtn = document.getElementById('exportPdfBtn');
    exportBtn.innerHTML = '<i class="fas fa-file-pdf"></i><span>Export to PDF</span>';
    exportBtn.disabled = false;
  }
}

// Copy to clipboard function
function copyToClipboard(elementId) {
  let text;
  
  if (elementId === 'transcript') {
    text = document.getElementById('transcript').textContent;
  } else if (elementId === 'summary') {
    text = document.getElementById('summary').textContent;
  } else {
    // For translations
    const translationItem = document.querySelector(`[onclick="copyToClipboard('${elementId}')"]`).closest('.translation-item');
    text = translationItem.querySelector('.translation-content').textContent;
  }
  
  navigator.clipboard.writeText(text).then(() => {
    showNotification('Copied to clipboard!', 'success');
  }).catch(() => {
    showNotification('Failed to copy to clipboard', 'error');
  });
}

// Show notification
function showNotification(message, type = 'info') {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
    <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-triangle' : 'info-circle'}"></i>
    <span>${message}</span>
  `;
  
  // Add to page
  document.body.appendChild(notification);
  
  // Show notification
  setTimeout(() => {
    notification.classList.add('show');
  }, 100);
  
  // Remove notification after 3 seconds
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}

// Add notification styles
const notificationStyles = `
  .notification {
    position: fixed;
    top: 20px;
    right: 20px;
    background: white;
    padding: 1rem 1.5rem;
    border-radius: 10px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transform: translateX(100%);
    transition: transform 0.3s ease;
    z-index: 1000;
    max-width: 300px;
  }
  
  .notification.show {
    transform: translateX(0);
  }
  
  .notification-success {
    border-left: 4px solid #10b981;
  }
  
  .notification-error {
    border-left: 4px solid #ef4444;
  }
  
  .notification-info {
    border-left: 4px solid #3b82f6;
  }
  
  .notification i {
    font-size: 1.2rem;
  }
  
  .notification-success i {
    color: #10b981;
  }
  
  .notification-error i {
    color: #ef4444;
  }
  
  .notification-info i {
    color: #3b82f6;
  }
`;

// Inject notification styles
const styleSheet = document.createElement('style');
styleSheet.textContent = notificationStyles;
document.head.appendChild(styleSheet);
