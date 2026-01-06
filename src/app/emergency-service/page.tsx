"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Phone, Shield, Flame, HeartPulse, Users } from "lucide-react";
import { getContacts, Contact } from "../../services/contacts";

const emergencyServices = [
  { name: "Police", number: "100", icon: <Shield className="h-8 w-8" /> },
  { name: "Ambulance", number: "102", icon: <HeartPulse className="h-8 w-8" /> },
  { name: "Fire", number: "101", icon: <Flame className="h-8 w-8" /> },
  { name: "National Emergency", number: "112", icon: <Phone className="h-8 w-8" /> },
  { name: "Women Helpline", number: "1091", icon: <Users className="h-8 w-8" /> },
];

export default function EmergencyServicePage() {
  const [emergencyContacts, setEmergencyContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const contacts = await getContacts();
        const emergency = contacts.filter(contact => contact.isEmergency);
        setEmergencyContacts(emergency);
      } catch (error) {
        console.error('Error fetching emergency contacts:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchContacts();
  }, []);

  return (
    <div className="flex items-center justify-center min-h-[300px] m-8">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle>Emergency Services</CardTitle>
          <CardDescription>
            Quick access to emergency numbers and your emergency contacts.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Emergency Services */}
          <div>
            <h4 className="text-sm font-medium mb-2">Official Emergency Numbers</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {emergencyServices.map((service) => (
                <Button variant="outline" asChild key={service.name} className="h-auto p-4">
                  <a href={`tel:${service.number}`} className="flex flex-col items-center gap-2 text-center">
                    <div className="text-primary">{service.icon}</div>
                    <span className="font-semibold">{service.name}</span>
                    <span className="text-sm text-muted-foreground">{service.number}</span>
                  </a>
                </Button>
              ))}
            </div>
          </div>
          {/* User's Emergency Contacts
          <div>
           
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading contacts...</p>
            ) : emergencyContacts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {emergencyContacts.map((contact) => (
                  <Button 
                    variant="outline" 
                    asChild 
                    key={contact._id} 
                    className="h-auto p-3 justify-start"
                  >
                    <a href={`tel:${contact.phoneNumber}`} className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-primary" />
                      <div className="text-left">
                        <div className="font-medium">{contact.name}</div>
                        <div className="text-xs text-muted-foreground">{contact.phoneNumber}</div>
                      </div>
                    </a>
                  </Button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No emergency contacts added yet. Add contacts in Personal Contacts section.
              </p>
            )}
          </div> */}
        </CardContent>
      </Card>
    </div>
  );
}
