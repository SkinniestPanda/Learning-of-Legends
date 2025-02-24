// auth.js
// This file simulates storing parent account details and authenticating users using localStorage.

// Retrieve the list of registered parent accounts from localStorage.
function getParentAccounts() {
    const accounts = localStorage.getItem('parentAccounts');
    if (accounts) {
      try {
        return JSON.parse(accounts);
      } catch (e) {
        console.error("Error parsing parent accounts:", e);
        return [];
      }
    }
    return [];
  }
  
  // Save the list of parent accounts to localStorage.
  function saveParentAccounts(accounts) {
    localStorage.setItem('parentAccounts', JSON.stringify(accounts));
  }
  
  // Register a new parent account.
  // Returns an object indicating success or failure with a message.
  function registerParent(name, email, password) {
    const accounts = getParentAccounts();
    // Check if an account with this email already exists.
    if (accounts.find(acc => acc.email === email)) {
      return { success: false, message: 'Email already registered' };
    }
    // Create and store the new account.
    const newAccount = { name, email, password };
    accounts.push(newAccount);
    saveParentAccounts(accounts);
    return { success: true, message: 'Registration successful' };
  }
  
  // Log in a parent account by verifying email and password.
  // On success, the account is stored as the current session in localStorage.
  function loginParent(email, password) {
    const accounts = getParentAccounts();
    const account = accounts.find(acc => acc.email === email && acc.password === password);
    if (account) {
      localStorage.setItem('currentParent', JSON.stringify(account));
      return { success: true, account };
    }
    return { success: false, message: 'Invalid email or password' };
  }
  
  // Log out the currently authenticated parent.
  function logoutParent() {
    localStorage.removeItem('currentParent');
  }
  
  // Retrieve the currently logged-in parent's details.
  function getCurrentParent() {
    const current = localStorage.getItem('currentParent');
    if (current) {
      try {
        return JSON.parse(current);
      } catch (e) {
        console.error("Error parsing current parent:", e);
        return null;
      }
    }
    return null;
  }
  