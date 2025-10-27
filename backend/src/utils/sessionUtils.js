const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client with service role
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

/**
 * Create a session for a user after magic link verification
 * @param {Object} user - User object with id and email
 * @returns {Promise<Object>} { success, token?, redirectUrl? }
 */
async function createSession(user) {
  try {
    // Try to use Supabase's admin API to create a session
    // This will generate a proper Supabase session token
    try {
      const { data, error } = await supabase.auth.admin.generateLink({
        type: 'magiclink',
        email: user.email,
      });
      
      if (!error && data?.properties?.action_link) {
        // Extract token from the action link if needed
        // For now, we'll create our own JWT token
      }
    } catch (supabaseError) {
      console.log('Supabase session creation not available, using JWT fallback');
    }
    
    // Fallback: Create JWT token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('JWT_SECRET not configured');
      return { success: false, error: 'Server configuration error' };
    }
    
    const expiresIn = process.env.JWT_EXPIRATION || '7d';
    
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        type: 'magic_link_auth',
      },
      jwtSecret,
      { expiresIn }
    );
    
    return {
      success: true,
      token,
      redirectUrl: '/',
    };
  } catch (error) {
    console.error('Error in createSession:', error);
    return { success: false, error: 'Failed to create session' };
  }
}

/**
 * Verify a session token
 * @param {string} token - JWT token to verify
 * @returns {Object} { valid, userId?, email? }
 */
function verifySession(token) {
  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return { valid: false };
    }
    
    const decoded = jwt.verify(token, jwtSecret);
    return {
      valid: true,
      userId: decoded.userId,
      email: decoded.email,
    };
  } catch (error) {
    return { valid: false };
  }
}

module.exports = {
  createSession,
  verifySession,
};
