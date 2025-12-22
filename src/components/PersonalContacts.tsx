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
                <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Personal Contacts
                </CardTitle>
                <CardDescription>
                    {loading ? 'Loading contacts...' : `${totalContacts} contact${totalContacts !== 1 ? 's' : ''} • ${emergencyContacts.length} emergency`}
                </CardDescription>
            </CardHeader>
            <CardContent>
                {/* <p className="text-sm text-muted-foreground">
                    You can add, edit, or remove your trusted emergency contacts. These are the people who will receive an alert with your location when you trigger an SOS.
                </p> */}
                {!loading && totalContacts > 0 && (
                    <div className="mt-3 p-2 bg-muted rounded-md">
                        <p className="text-xs text-muted-foreground">
                            <strong>Recent contacts:</strong> {contacts.slice(0, 3).map(c => c.name).join(', ')}
                            {totalContacts > 3 && ` and ${totalContacts - 3} more`}
                        </p>
                    </div>
                )}
            </CardContent>
            <CardFooter>
                <Button asChild className="w-full">
                    <Link href="/contacts">Manage Contacts</Link>
                </Button>
            </CardFooter>
        </Card>
    );
}
