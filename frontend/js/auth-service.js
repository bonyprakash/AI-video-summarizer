// Firebase Authentication Service
class AuthService {
  constructor() {
    this.auth = firebase.auth();
    this.currentUser = null;
    this.authStateListeners = [];
    
    // Listen for authentication state changes
    this.auth.onAuthStateChanged((user) => {
      this.currentUser = user;
      this.notifyAuthStateChange(user);
      
      if (user) {
        console.log('✅ User signed in:', user.email);
        this.updateUIForAuthenticatedUser(user);
      } else {
        console.log('👋 User signed out');
        this.updateUIForUnauthenticatedUser();
      }
    });
  }

  // Sign up with email and password
  async signUp(email, password) {
    try {
      const userCredential = await this.auth.createUserWithEmailAndPassword(email, password);
      console.log('✅ User created successfully:', userCredential.user.email);
      return { success: true, user: userCredential.user };
    } catch (error) {
      console.error('❌ Sign up error:', error);
      return { success: false, error: this.getErrorMessage(error.code) };
    }
  }

  // Sign in with email and password
  async signIn(email, password) {
    try {
      const userCredential = await this.auth.signInWithEmailAndPassword(email, password);
      console.log('✅ User signed in:', userCredential.user.email);
      return { success: true, user: userCredential.user };
    } catch (error) {
      console.error('❌ Sign in error:', error);
      return { success: false, error: this.getErrorMessage(error.code) };
    }
  }

  // Sign in with Google
  async signInWithGoogle() {
    try {
      const provider = new firebase.auth.GoogleAuthProvider();
      const userCredential = await this.auth.signInWithPopup(provider);
      console.log('✅ Google sign in successful:', userCredential.user.email);
      return { success: true, user: userCredential.user };
    } catch (error) {
      console.error('❌ Google sign in error:', error);
      return { success: false, error: this.getErrorMessage(error.code) };
    }
  }

  // Sign out
  async signOut() {
    try {
      await this.auth.signOut();
      console.log('✅ User signed out successfully');
      return { success: true };
    } catch (error) {
      console.error('❌ Sign out error:', error);
      return { success: false, error: this.getErrorMessage(error.code) };
    }
  }

  // Reset password
  async resetPassword(email) {
    try {
      await this.auth.sendPasswordResetEmail(email);
      console.log('✅ Password reset email sent');
      return { success: true };
    } catch (error) {
      console.error('❌ Password reset error:', error);
      return { success: false, error: this.getErrorMessage(error.code) };
    }
  }

  // Get current user
  getCurrentUser() {
    return this.currentUser;
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.currentUser;
  }

  // Add auth state change listener
  onAuthStateChanged(callback) {
    this.authStateListeners.push(callback);
  }

  // Notify all auth state change listeners
  notifyAuthStateChange(user) {
    this.authStateListeners.forEach(callback => callback(user));
  }

  // Update UI for authenticated user
  updateUIForAuthenticatedUser(user) {
    // Show user info
    const userInfo = document.getElementById('userInfo');
    if (userInfo) {
      userInfo.innerHTML = `
        <div class="user-profile">
          <img src="${user.photoURL || 'https://via.placeholder.com/40x40'}" alt="Profile" class="user-avatar">
          <span class="user-email">${user.email}</span>
          <button onclick="authService.signOut()" class="signout-btn">
            <i class="fas fa-sign-out-alt"></i> Sign Out
          </button>
        </div>
      `;
    }

    // Show main content
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
      mainContent.style.display = 'block';
    }

    // Hide auth forms
    const authForms = document.querySelector('.auth-forms');
    if (authForms) {
      authForms.style.display = 'none';
    }

    // Show export button if results exist
    this.showExportButtonIfNeeded();
  }

  // Update UI for unauthenticated user
  updateUIForUnauthenticatedUser() {
    // Hide user info
    const userInfo = document.getElementById('userInfo');
    if (userInfo) {
      userInfo.innerHTML = '';
    }

    // Hide main content
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
      mainContent.style.display = 'none';
    }

    // Show auth forms
    const authForms = document.querySelector('.auth-forms');
    if (authForms) {
      authForms.style.display = 'block';
    }
  }

  // Show export button if results exist
  showExportButtonIfNeeded() {
    const exportBtn = document.getElementById('exportPdfBtn');
    if (exportBtn) {
      const hasResults = document.getElementById('transcript').textContent || 
                        document.getElementById('summary').textContent ||
                        document.querySelectorAll('.translation-item').length > 0;
      
      if (hasResults) {
        exportBtn.style.display = 'inline-flex';
      }
    }
  }

  // Get user-friendly error messages
  getErrorMessage(errorCode) {
    const errorMessages = {
      'auth/user-not-found': 'No account found with this email address.',
      'auth/wrong-password': 'Incorrect password. Please try again.',
      'auth/email-already-in-use': 'An account with this email already exists.',
      'auth/weak-password': 'Password should be at least 6 characters long.',
      'auth/invalid-email': 'Please enter a valid email address.',
      'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
      'auth/popup-closed-by-user': 'Sign-in popup was closed. Please try again.',
      'auth/cancelled-popup-request': 'Sign-in was cancelled.',
      'auth/network-request-failed': 'Network error. Please check your connection.',
      'auth/operation-not-allowed': 'This sign-in method is not enabled.',
      'auth/user-disabled': 'This account has been disabled.',
      'auth/requires-recent-login': 'Please sign in again to continue.',
      'auth/account-exists-with-different-credential': 'An account already exists with the same email address but different sign-in credentials.'
    };
    
    return errorMessages[errorCode] || 'An error occurred. Please try again.';
  }
}

// Create global instance
const authService = new AuthService();
