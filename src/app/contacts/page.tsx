"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  getContacts, 
  createContact, 
  updateContact, 
  deleteContact, 
  Contact, 
  ContactFormData,
  formatPhoneForDisplay,
  formatPhoneForInput
} from "@/services/contacts";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Phone, 
  User, 
  Heart, 
  Users,
  ArrowLeft
} from "lucide-react";
import Link from "next/link";

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    phoneNumber: "",
    relationship: "",
    isEmergency: false,
  });

  const { toast } = useToast();

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const fetchedContacts = await getContacts();
      setContacts(fetchedContacts);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      toast({
        title: "Error",
        description: "Failed to load contacts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof ContactFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePhoneChange = (value: string) => {
    // Auto-format phone number
    let formatted = value.replace(/\D/g, ''); // Remove non-digits
    if (formatted.length > 10) formatted = formatted.slice(0, 10);
    
    if (formatted.length === 10) {
      formatted = `+91${formatted}`;
    }
    
    setFormData(prev => ({ ...prev, phoneNumber: formatted }));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      phoneNumber: "",
      relationship: "",
      isEmergency: false,
    });
    setEditingContact(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.phoneNumber.trim()) {
      toast({
        title: "Validation Error",
        description: "Name and phone number are required",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingContact) {
        // Update existing contact
        const result = await updateContact(editingContact._id!, formData);
        if (result.success) {
          toast({
            title: "Success",
            description: "Contact updated successfully",
          });
          await fetchContacts();
          resetForm();
        } else {
          toast({
            title: "Error",
            description: result.error || "Failed to update contact",
            variant: "destructive",
          });
        }
      } else {
        // Create new contact
        const result = await createContact(formData);
        if (result.success) {
          toast({
            title: "Success",
            description: "Contact created successfully",
          });
          await fetchContacts();
          resetForm();
        } else {
          toast({
            title: "Error",
            description: result.error || "Failed to create contact",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error('Error saving contact:', error);
      toast({
        title: "Error",
        description: "Failed to save contact",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (contact: Contact) => {
    setEditingContact(contact);
    setFormData({
      name: contact.name,
      phoneNumber: contact.phoneNumber,
      relationship: contact.relationship || "",
      isEmergency: contact.isEmergency,
    });
    setShowForm(true);
  };

  const handleDelete = async (contactId: string) => {
    if (!confirm("Are you sure you want to delete this contact?")) return;

    try {
      const result = await deleteContact(contactId);
      if (result.success) {
        toast({
          title: "Success",
          description: "Contact deleted successfully",
        });
        await fetchContacts();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete contact",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error deleting contact:', error);
      toast({
        title: "Error",
        description: "Failed to delete contact",
        variant: "destructive",
      });
    }
  };

  const emergencyContacts = contacts.filter(c => c.isEmergency);
  const regularContacts = contacts.filter(c => !c.isEmergency);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Manage Contacts</h1>
            <p className="text-muted-foreground">
              Store and manage your emergency contacts securely
            </p>
          </div>
        </div>
        <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Contact
        </Button>
      </div>

      {/* Contact Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingContact ? "Edit Contact" : "Add New Contact"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Enter contact name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number *</Label>
                  <Input
                    id="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder="Enter 10-digit number"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    +91 will be added automatically
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="relationship">Relationship (Optional)</Label>
                <Input
                  id="relationship"
                  value={formData.relationship}
                  onChange={(e) => handleInputChange("relationship", e.target.value)}
                  placeholder="e.g., Family, Friend, Colleague"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isEmergency"
                  checked={formData.isEmergency}
                  onCheckedChange={(checked) => handleInputChange("isEmergency", checked)}
                />
                <Label htmlFor="isEmergency">
                  Mark as Emergency Contact
                </Label>
              </div>

              <div className="flex gap-2">
                <Button type="submit">
                  {editingContact ? "Update Contact" : "Add Contact"}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Emergency Contacts */}
      {emergencyContacts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <Heart className="h-5 w-5" />
              Emergency Contacts ({emergencyContacts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {emergencyContacts.map((contact) => (
                <div
                  key={contact._id}
                  className="flex items-center justify-between p-3 border rounded-lg bg-red-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 rounded-full">
                      <Heart className="h-4 w-4 text-red-600" />
                    </div>
                    <div>
                      <div className="font-medium">{contact.name}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {contact.phoneNumber}
                      </div>
                      {contact.relationship && (
                        <div className="text-xs text-muted-foreground">
                          {contact.relationship}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(contact)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(contact._id!)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Regular Contacts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            All Contacts ({contacts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : contacts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No contacts added yet</p>
              <p className="text-sm">Add your first contact to get started</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {contacts.map((contact) => (
                <div
                  key={contact._id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${
                      contact.isEmergency ? 'bg-red-100' : 'bg-blue-100'
                    }`}>
                      {contact.isEmergency ? (
                        <Heart className="h-4 w-4 text-red-600" />
                      ) : (
                        <User className="h-4 w-4 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium">{contact.name}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {contact.phoneNumber}
                      </div>
                      {contact.relationship && (
                        <div className="text-xs text-muted-foreground">
                          {contact.relationship}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(contact)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(contact._id!)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
