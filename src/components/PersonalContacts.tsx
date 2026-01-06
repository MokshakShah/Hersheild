"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import Link from "next/link";
import { Users } from "lucide-react";
import { getContacts, Contact } from "../services/contacts";

export function PersonalContacts() {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchContacts = async () => {
            try {
                const fetchedContacts = await getContacts();
                setContacts(fetchedContacts);
            } catch (error) {
                console.error('Error fetching contacts:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchContacts();
    }, []);

    const emergencyContacts = contacts.filter(contact => contact.isEmergency);
    const totalContacts = contacts.length;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg font-bold">Personal Contacts</CardTitle>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <p className="text-sm text-muted-foreground">Loading contacts...</p>
                ) : contacts.length > 0 ? (
                    <div className="border rounded-md p-3 mb-3">
                        {contacts.map((contact) => (
                            <div key={contact._id} className="mb-2">
                                <span className="font-semibold">{contact.name}</span>
                                <span className="ml-2 text-sm text-muted-foreground">{contact.phoneNumber}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground">No contacts added yet.</p>
                )}
                <Button asChild className="w-full mt-2">
                    <Link href="/contacts">Manage Contacts</Link>
                </Button>
            </CardContent>
        </Card>
    );
}
