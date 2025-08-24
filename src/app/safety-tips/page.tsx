import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
const safetyTips = [
  {
    title: "Being Aware of Your Surroundings",
    content: "Always be mindful of who is around you. Avoid distractions like being on your phone or wearing headphones in both ears, especially when walking alone or at night. Trust your instincts; if a situation feels unsafe, leave immediately."
  },
  {
    title: "Safe Social Media Practices",
    content: "Be cautious about what you share online. Avoid posting your live location or details about your daily routine. Check your privacy settings on all social media platforms to control who can see your information."
  },
  {
    title: "Traveling Safely",
    content: "When using ride-sharing services, always verify the car model, license plate, and driver's name before getting in. Share your trip details with a trusted friend or family member. When using public transport, try to sit near the driver or in a well-lit, populated car."
  },
  {
    title: "At Home Safety",
    content: "Ensure all doors and windows are securely locked. Do not open the door to strangers without verification. Install a peephole or a smart doorbell to see who is outside. Keep emergency numbers handy."
  },
  {
    title: "Self-Defense Basics",
    content: "Consider taking a self-defense class. Knowing some basic techniques can boost your confidence. Key areas to target in an attack are the eyes, nose, throat, and groin. Your voice is also a powerful tool; yell 'FIRE!' instead of 'HELP!' to attract more attention."
  },
  {
    title: "Online Dating Safety",
    content: "When meeting someone from a dating app for the first time, always meet in a public place. Inform a friend about your plans, including where you are going and who you are meeting. Never share personal financial information."
  },
  {
    title: "Emergency Contact Setup",
    content: "Keep important emergency contacts saved in your phone under easily recognizable names. Use your phone’s SOS or emergency features to quickly alert trusted people in case of danger."
  },
  {
    title: "Workplace Safety",
    content: "Familiarize yourself with all exits in your workplace. Keep your bag and personal belongings secure. If working late, try to leave with colleagues instead of alone."
  },
  {
    title: "Vehicle Safety",
    content: "Always check the backseat before entering your car. Lock the doors immediately after getting in. Park in well-lit, populated areas and avoid leaving valuables visible inside the car."
  },
  {
    title: "ATM and Banking Safety",
    content: "Use ATMs located in secure, well-lit areas. Shield your PIN when entering it. Avoid withdrawing large amounts of cash at once, and never count money publicly."
  },
  {
    title: "Cybersecurity Awareness",
    content: "Use strong, unique passwords for each online account. Enable two-factor authentication wherever possible. Do not click on suspicious links or attachments in emails or messages."
  },
  {
    title: "Children and Family Safety",
    content: "Teach children how to call emergency numbers. Make a family emergency plan, including meeting points in case of separation. Keep medicines, sharp objects, and cleaning supplies out of children’s reach."
  },
  {
    title: "Public Event Safety",
    content: "When attending concerts, rallies, or crowded areas, identify exits in advance. Carry minimal belongings. If panic or chaos occurs, stay calm, move sideways instead of straight into a crowd, and look for safe exits."
  },
  {
    title: "Health and Medical Preparedness",
    content: "Carry a small first-aid kit and any personal medications. Learn basic first-aid and CPR skills, which can be life-saving in emergencies."
  },
  {
    title: "Fire and Disaster Safety",
    content: "Know escape routes in your home, office, or hotel. Keep a fire extinguisher at home and learn how to use it. During natural disasters, follow official alerts and avoid risky shortcuts."
  },
  {
    title: "Digital Privacy",
    content: "Avoid connecting to unsecured public Wi-Fi. Use a VPN when accessing sensitive information online. Regularly review which apps have access to your location, microphone, and camera."
  }
];

export default function SafetyTipsPage() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Personal Safety Tips & Resources</CardTitle>
                <CardDescription>Knowledge is your best defense. Stay informed with these essential safety guides.</CardDescription>
            </CardHeader>
            <CardContent>
                <Accordion type="single" collapsible className="w-full">
                    {safetyTips.map((tip, index) => (
                        <AccordionItem value={`item-${index}`} key={index}>
                            <AccordionTrigger className="text-left">{tip.title}</AccordionTrigger>
                            <AccordionContent>
                                {tip.content}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </CardContent>
        </Card>
    );
}
