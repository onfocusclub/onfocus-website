import emailjs from "@emailjs/browser";

export interface PartnerFormData {
  type: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  category: string;
  bio: string;
  priceRange: string;
  yearsActive: string;
  website: string;
  mediaCount: number;
}

export async function sendPartnerNotification(data: PartnerFormData) {
  return emailjs.send(
    import.meta.env.VITE_EMAILJS_SERVICE_ID,
    import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
    {
      Type:        data.type,        // matches {{Type}} in template
      name:        data.name,        // matches {{name}}
      email:       data.email,       // matches {{email}}
      phone:       data.phone       || "Not provided",  // matches {{phone}}
      city:        data.city,        // matches {{city}}
      category:    data.category,    // matches {{category}}
      priceRange:  data.priceRange  || "Not provided",  // matches {{priceRange}}
      yearsActive: data.yearsActive || "Not provided",  // matches {{yearsActive}}
      website:     data.website     || "Not provided",  // matches {{website}}
      mediaCount:  data.mediaCount,  // matches {{mediaCount}}
    },
    import.meta.env.VITE_EMAILJS_PUBLIC_KEY  // ← key passed here, NOT in init()
  );
}