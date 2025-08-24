"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Shield, Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

export default function SignupForm() {
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const { signup } = useAuth()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await signup(formData.name, formData.phoneNumber, formData.password)
    } finally {
      setLoading(false)
    }
  }

  return (
     <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
        <Card className="mx-auto max-w-sm w-full">
        <CardHeader className="text-center">
             <div className="flex justify-center items-center mb-4">
                <Shield className="h-10 w-10 text-primary"/>
            </div>
            <CardTitle className="text-2xl">Sign Up</CardTitle>
            <CardDescription>
            Enter your information to create an account
            </CardDescription>
        </CardHeader>
        <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-2">
                <Label htmlFor="name">Full name</Label>
                <Input 
                  id="name" 
                  name="name"
                  placeholder="Jane Doe" 
                  value={formData.name}
                  onChange={handleInputChange}
                  required 
                />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                placeholder="1234567890"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                pattern="[0-9]{10}"
                title="Please enter a 10-digit phone number"
                required
                />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  name="password"
                  type="password" 
                  value={formData.password}
                  onChange={handleInputChange}
                  minLength={6}
                  required
                />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  'Create an account'
                )}
            </Button>
            </form>
            <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link href="/login" className="underline">
                Login
            </Link>
            </div>
        </CardContent>
        </Card>
     </div>
  )
}
