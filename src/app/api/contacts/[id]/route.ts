import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { getSupabaseAdmin } from '@/lib/supabase';

const serializeContact = (row: any) => ({
  _id: row.id,
  id: row.id,
  userId: row.user_id,
  name: row.name,
  phoneNumber: row.phone_number,
  relationship: row.relationship,
  isEmergency: row.is_emergency,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

// PUT - Update a contact
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabaseAdmin();

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

    const { data: contact, error } = await supabase
      .from('contacts')
      .update({
        name,
        phone_number: formattedPhoneNumber,
        relationship: relationship || '',
        is_emergency: isEmergency || false,
      })
      .eq('id', params.id)
      .eq('user_id', userId)
      .select('*')
      .maybeSingle();

    if (error) {
      console.error('Update contact error:', error);
      return NextResponse.json(
        { error: 'Failed to update contact' },
        { status: 500 }
      );
    }

    if (!contact) {
      return NextResponse.json(
        { error: 'Contact not found or access denied' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Contact updated successfully',
      contact: serializeContact(contact)
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
    const supabase = getSupabaseAdmin();

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

    const { error, data: deleted } = await supabase
      .from('contacts')
      .delete()
      .eq('id', params.id)
      .eq('user_id', userId)
      .select('id')
      .maybeSingle();

    if (error) {
      console.error('Delete contact error:', error);
      return NextResponse.json(
        { error: 'Failed to delete contact' },
        { status: 500 }
      );
    }

    if (!deleted) {
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
