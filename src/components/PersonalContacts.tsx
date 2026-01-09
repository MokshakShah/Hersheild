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
                            <div
                                key={contact._id}
                                className="mb-3 flex items-center justify-between bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md transition"
                            >
                                <div className="flex flex-col">
                                    <span className="font-semibold text-gray-800 text-base">{contact.name}</span>
                                    <span className="text-sm text-gray-500">{contact.phoneNumber}</span>
                                </div>
                                <a
                                    href={`tel:${contact.phoneNumber}`}
                                    className="ml-4 px-4 py-2 bg-pink-500 text-white rounded-full font-semibold text-sm shadow hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 transition"
                                    aria-label={`Call ${contact.name}`}
                                >
                                    Call
                                </a>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground">No contacts added yet.</p>
                )}
                <Button asChild className="w-full mt-2 bg-white text-primary">
                    <Link href="/contacts">Manage Contacts</Link>
                </Button>
            </CardContent>
        </Card>
    );
}
