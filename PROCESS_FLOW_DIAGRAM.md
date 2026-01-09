# Hersheild Project - Process Flow Diagram

```mermaid
graph TD
    A[User] -->|Login/Signup| B(Auth API)
    B -->|JWT Token| C[App]
    C -->|Fetch Contacts| D[Contacts API]
    C -->|Fetch News| E[News API]
    C -->|Fetch Evidence| F[Evidence API]
    C -->|Fetch User Density| G[User Density API]
    C -->|Send SMS/Call| H[Twilio Service]
    C -->|Safety Assessment| I[AI/Genkit Flow]
    C -->|View/Manage Contacts| J[Contacts Page]
    C -->|Emergency Services| K[Emergency Service Page]
    C -->|Self Defense Tips| L[Self Defense Page]
    C -->|Nearby Help| M[Nearby Help Page]
    C -->|Profile| N[Profile Page]
    C -->|Logout| O[Logout API]
    D -->|MongoDB| P[(Database)]
    F -->|MongoDB| P
    B -->|Supabase| Q[(Supabase)]
    H -->|Twilio API| R[(Twilio)]
    I -->|AI Model| S[(AI/Genkit)]
```

**Legend:**
- Rectangles: Pages/Components
- Parallelograms: APIs/Services
- Circles: External Services/Databases

This diagram gives a high-level overview of the main flows in the Hersheild project, from user actions to backend services and external integrations.
