"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { FileImage, Trash2, Mic, MapPin, HardDrive, Clock, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Link from "next/link";
import { evidenceService, type Evidence } from "@/services/evidence";
import { formatFileSize } from "@/lib/utils";




export default function EvidencePage() {
    const [evidence, setEvidence] = useState<Evidence[]>([]);
    const { toast } = useToast();
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [storageStats, setStorageStats] = useState(evidenceService.getStorageStats());

    const refreshEvidence = () => {
        try {
            const savedEvidence = evidenceService.getEvidence();
            setEvidence(savedEvidence);
            setStorageStats(evidenceService.getStorageStats());
        } catch (error) {
            console.error("Error reading evidence:", error);
            toast({
                variant: 'destructive',
                title: "Load Error",
                description: "Could not load saved evidence from your browser.",
            });
        }
    };

    useEffect(() => {
        refreshEvidence();
        
        // Set up periodic refresh to catch background optimizations
        const refreshInterval = setInterval(() => {
            refreshEvidence();
        }, 2000); // Refresh every 2 seconds to catch background optimizations
        
        return () => clearInterval(refreshInterval);
    }, [toast]);

    const handleManualRefresh = async () => {
        setIsRefreshing(true);
        try {
            // Trigger manual cleanup
            await evidenceService.manualCleanup();
            refreshEvidence();
            toast({ title: "Evidence refreshed and optimized" });
        } catch (error) {
            console.error("Error refreshing evidence:", error);
            toast({
                variant: 'destructive',
                title: "Refresh Error",
                description: "Could not refresh evidence.",
            });
        } finally {
            setIsRefreshing(false);
        }
    };

    const deleteEvidence = (id: string) => {
        if (evidenceService.deleteEvidence(id)) {
            const updatedEvidence = evidenceService.getEvidence();
            setEvidence(updatedEvidence);
            setStorageStats(evidenceService.getStorageStats());
            toast({ title: "Evidence Deleted" });
        } else {
            toast({
                variant: 'destructive',
                title: "Delete Error",
                description: "Could not delete the evidence item.",
            });
        }
    };
    
    const deleteAllEvidence = () => {
        if (evidenceService.deleteAllEvidence()) {
            setEvidence([]);
            setStorageStats(evidenceService.getStorageStats());
            toast({ title: "All evidence cleared", variant: "destructive" });
        } else {
            toast({
                variant: 'destructive',
                title: "Delete Error",
                description: "Could not clear all evidence.",
            });
        }
    };

    return (
        <Card>
            <CardHeader className="flex-row items-start justify-between">
                <div>
                    <CardTitle>Saved Evidence</CardTitle>
                    <CardDescription>Photos and audio clips captured locally on your device.</CardDescription>
                    
                    {/* Storage Information */}
                    <div className="mt-4 space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <HardDrive className="h-4 w-4" />
                            <span>
                                {evidence.length} items • {formatFileSize(storageStats.totalSize)} / {formatFileSize(storageStats.maxSize)}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>
                                Auto-delete after 6 months • Cleanup every hour
                            </span>
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={handleManualRefresh}
                                disabled={isRefreshing}
                                className="ml-2 h-6 px-2 text-xs"
                            >
                                {isRefreshing ? "Refreshing..." : "Refresh"}
                            </Button>
                        </div>
                        {storageStats.totalSize > storageStats.maxSize * 0.8 && (
                            <div className="flex items-center gap-2 text-sm text-amber-600">
                                <AlertTriangle className="h-4 w-4" />
                                <span>Storage nearly full - oldest items will be automatically removed</span>
                            </div>
                        )}
                    </div>
                </div>
                 {evidence.length > 0 && (
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive">
                                <Trash2 className="mr-2 h-4 w-4" /> Clear All
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete all
                                saved evidence from your browser.
                            </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={deleteAllEvidence}>Continue</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                 )}
            </CardHeader>
            <CardContent>
                {evidence.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {evidence.map((item) => (
                            <div key={item.id} className="relative group border rounded-lg p-2 flex flex-col bg-muted/20">
                                {item.type === 'photo' ? (
                                    <div className="aspect-video w-full overflow-hidden rounded-md">
                                        <Image src={item.dataUri} alt="Captured evidence" width={400} height={300} className="w-full h-full object-cover" />
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center aspect-video bg-muted rounded-md p-4">
                                        <Mic className="h-16 w-16 text-primary" />
                                        <audio src={item.dataUri} controls className="w-full mt-4" />
                                    </div>
                                )}
                                <div className="text-xs text-muted-foreground mt-2 space-y-1">
                                    <p>{item.timestamp}</p>
                                    <p>Size: {formatFileSize(item.size)}</p>
                                    <p>Created: {new Date(item.createdAt).toLocaleDateString()}</p>
                                    {item.location && (
                                        <Link
                                            href={`https://www.google.com/maps?q=${item.location.latitude},${item.location.longitude}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1 hover:underline text-primary"
                                        >
                                            <MapPin className="h-3 w-3"/>
                                            View Location
                                        </Link>
                                    )}
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => deleteEvidence(item.id)} className="absolute top-3 right-3 bg-black/50 text-white hover:bg-destructive hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 text-muted-foreground border-2 border-dashed rounded-lg">
                        <FileImage className="mx-auto h-12 w-12" />
                        <p className="mt-4 font-semibold">No evidence has been saved yet.</p>
                        <p className="text-sm">Use the 'Capture Photo' or 'Record Audio' feature on the dashboard.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
