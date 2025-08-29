/**
 * Secure Encryption Utilities for Confidential Data
 * Uses AES-256-GCM encryption with proper key derivation
 */

import { Buffer } from 'buffer';

// Encryption configuration
const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 12; // 96 bits for GCM
const SALT_LENGTH = 32; // 256 bits
const TAG_LENGTH = 16; // 128 bits
const ITERATIONS = 100000; // PBKDF2 iterations

/**
 * Derives an encryption key from a password using PBKDF2
 */
async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: new Uint8Array(salt),
      iterations: ITERATIONS,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: ALGORITHM, length: KEY_LENGTH * 8 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts plaintext using AES-256-GCM
 */
export async function encryptData(plaintext: string, userKey?: string): Promise<string> {
  try {
    // Use environment key as fallback (ensure this is set securely)
    const masterKey = userKey || process.env.NEXT_PUBLIC_ENCRYPTION_KEY || 'fallback-dev-key-change-in-production';
    
    if (masterKey === 'fallback-dev-key-change-in-production' && process.env.NODE_ENV === 'production') {
      throw new Error('Production encryption key not configured');
    }

    // Generate random salt and IV
    const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
    const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
    
    // Derive encryption key
    const key = await deriveKey(masterKey, salt);
    
    // Encrypt the data
    const encoder = new TextEncoder();
    const data = encoder.encode(plaintext);
    
    const encrypted = await crypto.subtle.encrypt(
      {
        name: ALGORITHM,
        iv: iv
      },
      key,
      data
    );

    // Combine salt + iv + encrypted data + auth tag
    const encryptedArray = new Uint8Array(encrypted);
    const result = new Uint8Array(SALT_LENGTH + IV_LENGTH + encryptedArray.length);
    
    result.set(salt, 0);
    result.set(iv, SALT_LENGTH);
    result.set(encryptedArray, SALT_LENGTH + IV_LENGTH);
    
    // Return base64 encoded result
    return Buffer.from(result).toString('base64');
    
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypts ciphertext using AES-256-GCM
 */
export async function decryptData(ciphertext: string, userKey?: string): Promise<string> {
  try {
    // Use environment key as fallback
    const masterKey = userKey || process.env.NEXT_PUBLIC_ENCRYPTION_KEY || 'fallback-dev-key-change-in-production';
    
    if (masterKey === 'fallback-dev-key-change-in-production' && process.env.NODE_ENV === 'production') {
      throw new Error('Production encryption key not configured');
    }

    // Decode the base64 data
    const encryptedData = Buffer.from(ciphertext, 'base64');
    
    if (encryptedData.length < SALT_LENGTH + IV_LENGTH + TAG_LENGTH) {
      throw new Error('Invalid encrypted data format');
    }
    
    // Extract salt, IV, and encrypted data
    const salt = encryptedData.subarray(0, SALT_LENGTH);
    const iv = encryptedData.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
    const encrypted = encryptedData.subarray(SALT_LENGTH + IV_LENGTH);
    
    // Derive decryption key
    const key = await deriveKey(masterKey, salt);
    
    // Decrypt the data
    const decrypted = await crypto.subtle.decrypt(
      {
        name: ALGORITHM,
        iv: iv
      },
      key,
      encrypted
    );
    
    // Convert back to string
    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
    
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data - data may be corrupted or key is incorrect');
  }
}

/**
 * Generates a secure random password for user credentials
 */
export function generateSecurePassword(length: number = 16): string {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  
  return Array.from(array, byte => charset[byte % charset.length]).join('');
}

/**
 * Validates encryption key strength
 */
export function validateEncryptionKey(key: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (key.length < 16) {
    errors.push('Key must be at least 16 characters long');
  }
  
  if (!/[A-Z]/.test(key)) {
    errors.push('Key must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(key)) {
    errors.push('Key must contain at least one lowercase letter');
  }
  
  if (!/[0-9]/.test(key)) {
    errors.push('Key must contain at least one number');
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(key)) {
    errors.push('Key must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Hash a password for storage (for user authentication keys)
 */
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Securely compare two strings to prevent timing attacks
 */
export function secureCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  
  return result === 0;
}
