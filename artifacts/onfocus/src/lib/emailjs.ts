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
      Type:        data.type,
      name:        data.name,
      email:       data.email,
      phone:       data.phone       || "Not provided",
      city:        data.city,
      category:    data.category,
      priceRange:  data.priceRange  || "Not provided",
      yearsActive: data.yearsActive || "Not provided",
      website:     data.website     || "Not provided",
      mediaCount:  data.mediaCount,
    },
    
  );
}

export async function sendRejectionEmail(data: {
  name: string;
  email: string;
  adminNotes: string;
}) {
  return emailjs.send(
    import.meta.env.VITE_EMAILJS_SERVICE_ID,
    "template_go0h0wd",
    {
      name:            data.name,
      applicant_email: data.email,
      admin_notes:     data.adminNotes || "",
    },
    
  );
}