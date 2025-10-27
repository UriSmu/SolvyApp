const express = require('express');
const router = express.Router();
const { createMagicLink, verifyMagicLink } = require('../services/magicLinkService');
const { createSession } = require('../utils/sessionUtils');

/**
 * POST /api/auth/magic-link
 * Request a magic link for password reset
 * Body: { email: string }
 * Always returns 200 OK to prevent email enumeration
 */
router.post('/magic-link', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      // Still return success to prevent enumeration
      return res.status(200).json({
        success: true,
        message: 'If the email exists, a magic link has been sent.'
      });
    }
    
    const result = await createMagicLink(email);
    
    // Always return the same message for security
    return res.status(200).json({
      success: true,
      message: 'If the email exists, a magic link has been sent.'
    });
  } catch (error) {
    console.error('Error in POST /api/auth/magic-link:', error);
    // Still return success to prevent enumeration
    return res.status(200).json({
      success: true,
      message: 'If the email exists, a magic link has been sent.'
    });
  }
});

/**
 * GET /api/auth/magic-link/verify?token=...
 * Verify a magic link token and create a session
 * Query: { token: string }
 */
router.get('/magic-link/verify', async (req, res) => {
  try {
    const { token } = req.query;
    
    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Token is required'
      });
    }
    
    const result = await verifyMagicLink(token);
    
    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error || 'Invalid or expired token'
      });
    }
    
    // Create session for the user
    const sessionData = await createSession(result.user);
    
    if (!sessionData.success) {
      return res.status(500).json({
        success: false,
        error: 'Failed to create session'
      });
    }
    
    // Set HttpOnly cookie if token is provided
    if (sessionData.token) {
      res.cookie('auth_token', sessionData.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });
    }
    
    return res.status(200).json({
      success: true,
      redirectUrl: sessionData.redirectUrl || '/',
      token: sessionData.token, // Return token for mobile apps
      user: result.user
    });
  } catch (error) {
    console.error('Error in GET /api/auth/magic-link/verify:', error);
    return res.status(500).json({
      success: false,
      error: 'An error occurred during verification'
    });
  }
});

module.exports = router;
