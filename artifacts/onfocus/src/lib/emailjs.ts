import emailjs from "@emailjs/browser";

// Initialize EmailJS
emailjs.init("lAb9elEXbGY_yzd4m");

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
    "service_t4a2rrg",
    "template_4c1op5r",
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
    "-_-L6Ge-PdjfIGdtO"
  );
}

export async function sendRejectionEmail(data: {
  name: string;
  email: string;
  adminNotes: string;
}) {
  return emailjs.send(
    "service_t4a2rrg",
    "template_go0h0wd",
    {
      name:            data.name,
      applicant_email: data.email,
      admin_notes:     data.adminNotes || "",
    },
    "-_-L6Ge-PdjfIGdtO"
  );
}

export async function sendContactEmail(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  return emailjs.send(
    "service_174i379",
    "template_hqa1222",
    {
      from_name:  data.name,
      from_email: data.email,
      subject:    data.subject,
      message:    data.message,
    },
    "lAb9elEXbGY_yzd4m"
  );
}