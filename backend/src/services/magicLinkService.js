const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const { createClient } = require('@supabase/supabase-js');
const nodemailer = require('nodemailer');
const fs = require('fs').promises;
const path = require('path');

// Initialize Supabase client with service role
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Initialize nodemailer transporter
let transporter;
if (process.env.SMTP_URL) {
  // Use connection string
  transporter = nodemailer.createTransport(process.env.SMTP_URL);
} else {
  // Use individual settings
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

/**
 * Generate a secure random token
 * @returns {Object} { token, hash, jti }
 */
function generateToken() {
  // Generate secure random bytes
  const randomBytes = crypto.randomBytes(32);
  const jti = uuidv4();
  
  // Create token with random bytes and jti
  const token = `${randomBytes.toString('hex')}.${jti}`;
  
  // Hash the token with SHA256
  const hash = crypto.createHash('sha256').update(token).digest('hex');
  
  return { token, hash, jti };
}

/**
 * Hash a token using SHA256
 * @param {string} token - The token to hash
 * @returns {string} The SHA256 hash
 */
function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Create a magic link for password reset
 * @param {string} email - User's email address
 * @returns {Promise<Object>} { success, message }
 */
async function createMagicLink(email) {
  try {
    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();
    
    // Find user by email in Supabase Auth
    const { data: users, error: userError } = await supabase.auth.admin.listUsers();
    
    if (userError) {
      console.error('Error fetching users:', userError);
      // Don't reveal if user exists or not for security
      return { success: true, message: 'If the email exists, a magic link has been sent.' };
    }
    
    const user = users.users.find(u => u.email?.toLowerCase() === normalizedEmail);
    
    if (!user) {
      // Don't reveal if user exists or not for security
      console.log(`User not found for email: ${normalizedEmail}`);
      return { success: true, message: 'If the email exists, a magic link has been sent.' };
    }
    
    // Generate secure token
    const { token, hash, jti } = generateToken();
    
    // Calculate expiration time
    const expirationMinutes = parseInt(process.env.MAGIC_LINK_EXPIRATION) || 60;
    const expiresAt = new Date(Date.now() + expirationMinutes * 60 * 1000);
    
    // Save token hash to database
    const { error: insertError } = await supabase
      .from('magic_link_tokens')
      .insert({
        user_id: user.id,
        token_hash: hash,
        jti: jti,
        expires_at: expiresAt.toISOString(),
      });
    
    if (insertError) {
      console.error('Error saving token:', insertError);
      return { success: false, message: 'Failed to generate magic link' };
    }
    
    // Create magic link URL
    const magicLinkUrl = `${process.env.MAGIC_LINK_BASE_URL}/magic-link-verify?token=${token}`;
    
    // Load email template
    const templatePath = path.join(__dirname, '../emails/magicLink.html');
    let emailHtml;
    try {
      emailHtml = await fs.readFile(templatePath, 'utf8');
      // Replace placeholders
      emailHtml = emailHtml.replace('{{magicLinkUrl}}', magicLinkUrl);
      emailHtml = emailHtml.replace('{{expirationMinutes}}', expirationMinutes);
    } catch (err) {
      console.error('Error loading email template:', err);
      // Fallback to simple HTML
      emailHtml = `
        <h2>Password Reset</h2>
        <p>Click the button below to reset your password:</p>
        <a href="${magicLinkUrl}" style="display: inline-block; padding: 12px 24px; background-color: #007cc0; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
        <p>This link will expire in ${expirationMinutes} minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `;
    }
    
    // Send email
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: normalizedEmail,
        subject: 'Reset Your Password - SolvyApp',
        html: emailHtml,
      });
      
      console.log(`Magic link sent to: ${normalizedEmail}`);
    } catch (emailError) {
      console.error('Error sending email:', emailError);
      // Don't reveal email send failure for security
    }
    
    return { success: true, message: 'If the email exists, a magic link has been sent.' };
  } catch (error) {
    console.error('Error in createMagicLink:', error);
    return { success: false, message: 'An error occurred' };
  }
}

/**
 * Verify a magic link token and return user information
 * @param {string} token - The magic link token
 * @returns {Promise<Object>} { success, user?, error? }
 */
async function verifyMagicLink(token) {
  try {
    if (!token) {
      return { success: false, error: 'Token is required' };
    }
    
    // Hash the provided token
    const hash = hashToken(token);
    
    // Find token in database
    const { data: tokenData, error: fetchError } = await supabase
      .from('magic_link_tokens')
      .select('*')
      .eq('token_hash', hash)
      .single();
    
    if (fetchError || !tokenData) {
      console.error('Token not found or error:', fetchError);
      return { success: false, error: 'Invalid or expired token' };
    }
    
    // Check if token has already been used
    if (tokenData.used_at) {
      console.log('Token already used');
      return { success: false, error: 'Token has already been used' };
    }
    
    // Check if token has expired
    const now = new Date();
    const expiresAt = new Date(tokenData.expires_at);
    if (now > expiresAt) {
      console.log('Token expired');
      return { success: false, error: 'Token has expired' };
    }
    
    // Mark token as used
    const { error: updateError } = await supabase
      .from('magic_link_tokens')
      .update({ used_at: now.toISOString() })
      .eq('id', tokenData.id);
    
    if (updateError) {
      console.error('Error marking token as used:', updateError);
    }
    
    // Get user information
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(tokenData.user_id);
    
    if (userError || !userData.user) {
      console.error('Error fetching user:', userError);
      return { success: false, error: 'User not found' };
    }
    
    return { 
      success: true, 
      user: {
        id: userData.user.id,
        email: userData.user.email,
      }
    };
  } catch (error) {
    console.error('Error in verifyMagicLink:', error);
    return { success: false, error: 'An error occurred' };
  }
}

module.exports = {
  createMagicLink,
  verifyMagicLink,
};
