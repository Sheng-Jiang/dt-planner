import { NextRequest, NextResponse } from 'next/server';
import { getUserByResetToken, clearResetToken, updateUser } from '@/lib/userOperations';
import { hashPassword, isValidPassword, getPasswordValidationError } from '@/lib/auth';
import { createErrorResponse } from '@/lib/errorHandling';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, newPassword } = body;

    // Validate input
    if (!token) {
      return NextResponse.json(
        createErrorResponse('MISSING_REQUIRED_FIELDS', 'Reset token is required', 400),
        { status: 400 }
      );
    }

    if (!newPassword) {
      return NextResponse.json(
        createErrorResponse('MISSING_REQUIRED_FIELDS', 'New password is required', 400),
        { status: 400 }
      );
    }

    // Validate password strength
    const passwordError = getPasswordValidationError(newPassword);
    if (passwordError) {
      return NextResponse.json(
        createErrorResponse('INVALID_PASSWORD', passwordError, 400),
        { status: 400 }
      );
    }

    // Find user by reset token (this also validates token expiry)
    const user = await getUserByResetToken(token);
    
    if (!user) {
      return NextResponse.json(
        createErrorResponse('INVALID_RESET_TOKEN', 'Reset link is invalid or expired', 400),
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
      createErrorResponse('SERVER_ERROR', 'An error occurred while resetting your password', 500),
      { status: 500 }
    );
  }
}