import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Contact from '@/models/Contact';
import { verifyToken } from '@/lib/jwt';

// PUT - Update a contact
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    // Get the auth token from cookies
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify the token and get user info
    const decoded = verifyToken(token);
    const userId = decoded.userId;

    const body = await request.json();
    const { name, phoneNumber, relationship, isEmergency } = body;

    // Validate required fields
    if (!name || !phoneNumber) {
      return NextResponse.json(
        { error: 'Name and phone number are required' },
        { status: 400 }
      );
    }

    // Format phone number with +91 prefix if not already present
    let formattedPhoneNumber = phoneNumber;
    if (!phoneNumber.startsWith('+91')) {
      const cleanNumber = phoneNumber.replace(/^(\+91|91|\+)?/, '');
      if (cleanNumber.length === 10) {
        formattedPhoneNumber = `+91${cleanNumber}`;
      } else {
        return NextResponse.json(
          { error: 'Phone number must be 10 digits' },
          { status: 400 }
        );
      }
    }

    // Find and update the contact (ensure it belongs to the user)
    const contact = await Contact.findOneAndUpdate(
      { _id: params.id, userId },
      {
        name,
        phoneNumber: formattedPhoneNumber,
        relationship: relationship || '',
        isEmergency: isEmergency || false
      },
      { new: true, runValidators: true }
    );

    if (!contact) {
      return NextResponse.json(
        { error: 'Contact not found or access denied' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Contact updated successfully',
      contact
    });

  } catch (error: any) {
    console.error('Update contact error:', error);
    return NextResponse.json(
      { error: 'Failed to update contact' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a contact
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    // Get the auth token from cookies
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify the token and get user info
    const decoded = verifyToken(token);
    const userId = decoded.userId;

    // Find and delete the contact (ensure it belongs to the user)
    const contact = await Contact.findOneAndDelete({ 
      _id: params.id, 
      userId 
    });

    if (!contact) {
      return NextResponse.json(
        { error: 'Contact not found or access denied' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Contact deleted successfully'
    });

  } catch (error: any) {
    console.error('Delete contact error:', error);
    return NextResponse.json(
      { error: 'Failed to delete contact' },
      { status: 500 }
    );
  }
}
