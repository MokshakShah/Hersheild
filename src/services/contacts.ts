export interface Contact {
  _id?: string;
  name: string;
  phoneNumber: string;
  relationship?: string;
  isEmergency: boolean;
}

export interface ContactFormData {
  name: string;
  phoneNumber: string;
  relationship?: string;
  isEmergency: boolean;
}

// Get all contacts for the current user
export async function getContacts(): Promise<Contact[]> {
  try {
    const response = await fetch('/api/contacts');
    if (!response.ok) {
      throw new Error('Failed to fetch contacts');
    }
    const data = await response.json();
    return data.contacts || [];
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return [];
  }
}

// Create a new contact
export async function createContact(contactData: ContactFormData): Promise<{ success: boolean; contact?: Contact; error?: string }> {
  try {
    const response = await fetch('/api/contacts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(contactData),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || 'Failed to create contact' };
    }

    return { success: true, contact: data.contact };
  } catch (error) {
    console.error('Error creating contact:', error);
    return { success: false, error: 'Failed to create contact' };
  }
}

// Update an existing contact
export async function updateContact(id: string, contactData: ContactFormData): Promise<{ success: boolean; contact?: Contact; error?: string }> {
  try {
    const response = await fetch(`/api/contacts/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(contactData),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || 'Failed to update contact' };
    }

    return { success: true, contact: data.contact };
  } catch (error) {
    console.error('Error updating contact:', error);
    return { success: false, error: 'Failed to update contact' };
  }
}

// Delete a contact
export async function deleteContact(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`/api/contacts/${id}`, {
      method: 'DELETE',
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || 'Failed to delete contact' };
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting contact:', error);
    return { success: false, error: 'Failed to delete contact' };
  }
}

// Format phone number for display (remove +91 prefix)
export function formatPhoneForDisplay(phoneNumber: string): string {
  return phoneNumber.replace(/^\+91/, '');
}

// Format phone number for input (ensure +91 prefix)
export function formatPhoneForInput(phoneNumber: string): string {
  if (phoneNumber.startsWith('+91')) {
    return phoneNumber;
  }
  const cleanNumber = phoneNumber.replace(/^(\+91|91|\+)?/, '');
  if (cleanNumber.length === 10) {
    return `+91${cleanNumber}`;
  }
  return phoneNumber;
}
