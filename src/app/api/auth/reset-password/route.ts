import { NextRequest, NextResponse } from 'next/server';
import { getUserByResetToken, clearResetToken, updateUser } from '@/lib/userOperations';
import { hashPassword, isValidPassword, getPasswordValidationError } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, newPassword } = body;

    // Validate input
    if (!token) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Reset token is required' },
        { status: 400 }
      );
    }

    if (!newPassword) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'New password is required' },
        { status: 400 }
      );
    }

    // Validate password strength
    const passwordError = getPasswordValidationError(newPassword);
    if (passwordError) {
      return NextResponse.json(
        { error: 'Bad Request', message: passwordError },
        { status: 400 }
      );
    }

    // Find user by reset token (this also validates token expiry)
    const user = await getUserByResetToken(token);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Reset link is invalid or expired' },
        { status: 400 }
      );
    }

    // Hash the new password
    const passwordHash = await hashPassword(newPassword);

    // Update user's password
    await updateUser(user.id, { passwordHash });

    // Clear the reset token
    await clearResetToken(user.email);

    return NextResponse.json(
      { message: 'Password has been successfully reset' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'An error occurred while resetting your password' },
      { status: 500 }
    );
  }
}