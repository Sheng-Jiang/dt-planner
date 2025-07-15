import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail, setResetToken } from '@/lib/userOperations';
import { generateResetToken, generateResetTokenExpiry, isValidEmail } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    // Validate input
    if (!email) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Email is required' },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await getUserByEmail(email);
    
    // Always return success message for security (don't reveal if email exists)
    // This prevents email enumeration attacks
    const successMessage = 'If the email exists, a reset link has been sent';
    
    if (user) {
      // Generate reset token and expiry
      const resetToken = generateResetToken();
      const resetTokenExpiry = generateResetTokenExpiry();
      
      // Save reset token to database
      await setResetToken(email, resetToken, resetTokenExpiry);
      
      // In a real application, you would send an email here
      // For now, we'll just log the token (for development purposes)
      console.log(`Password reset token for ${email}: ${resetToken}`);
      console.log(`Reset link: ${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`);
    }

    return NextResponse.json(
      { message: successMessage },
      { status: 200 }
    );

  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'An error occurred while processing your request' },
      { status: 500 }
    );
  }
}