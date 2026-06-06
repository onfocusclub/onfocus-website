import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { sendContactEmail } from "@/lib/emailjs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Check } from "lucide-react";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(2, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export function Contact() {
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof contactSchema>>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  async function onSubmit(values: z.infer<typeof contactSchema>) {
    setIsSending(true);
    setError(null);
    try {
      await sendContactEmail(values);
      setIsSuccess(true);
      form.reset();
    } catch (err) {
      console.error("EmailJS error:", err);
      setError("Something went wrong. Please try again or email us directly at onfocusclub@gmail.com");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="min-h-screen bg-background pt-32 pb-32">
      <div className="container mx-auto px-6 md:px-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          <div>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-8 text-foreground" data-testid="text-contact-heading">
              Get in touch.
            </h1>
            <p className="text-xl text-muted-foreground mb-16 leading-relaxed max-w-md" data-testid="text-contact-subheading">
              Have a question about the platform? Need help finding the right professional? We're here to help.
            </p>

            <div className="space-y-12">
              <div>
                <h3 className="text-sm font-bold tracking-wider uppercase text-foreground mb-3">Email</h3>
                <a href="mailto:onfocusclub@gmail.com" className="text-muted-foreground text-lg hover:text-foreground transition-colors">
                  onfocusclub@gmail.com
                </a>
              </div>
              <div>
                <h3 className="text-sm font-bold tracking-wider uppercase text-foreground mb-3">Office</h3>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  08 Rise Incubation Centre, Nagar Nigam Elite<br />
                  Jhansi, 284001
                </p>
              </div>
              <div>
                <h3 className="text-sm font-bold tracking-wider uppercase text-foreground mb-3">Hours</h3>
                <p className="text-muted-foreground text-lg">Monday - Saturday: 11am - 6pm IST</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 md:p-12 rounded-3xl border border-border shadow-sm">
            {isSuccess ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-20">
                <div className="w-16 h-16 bg-foreground text-background rounded-full flex items-center justify-center mb-8">
                  <Check className="w-8 h-8" />
                </div>
                <h2 className="text-3xl font-bold mb-4 text-foreground" data-testid="text-success-heading">
                  Message Sent
                </h2>
                <p className="text-lg text-muted-foreground mb-10 max-w-xs mx-auto">
                  Thank you for reaching out. Our team will get back to you shortly.
                </p>
                <Button
                  onClick={() => { setIsSuccess(false); setError(null); }}
                  variant="outline"
                  className="rounded-full px-8 h-12"
                  data-testid="button-send-another"
                >
                  Send another message
                </Button>
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground">Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Your name"
                              className="bg-transparent border-0 border-b border-border rounded-none px-0 focus-visible:ring-0 focus-visible:border-foreground h-12 text-base shadow-none"
                              {...field}
                              data-testid="input-contact-name"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground">Email</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="hello@example.com"
                              className="bg-transparent border-0 border-b border-border rounded-none px-0 focus-visible:ring-0 focus-visible:border-foreground h-12 text-base shadow-none"
                              {...field}
                              data-testid="input-contact-email"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground">Subject</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="How can we help?"
                            className="bg-transparent border-0 border-b border-border rounded-none px-0 focus-visible:ring-0 focus-visible:border-foreground h-12 text-base shadow-none"
                            {...field}
                            data-testid="input-contact-subject"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground">Message</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Tell us more about your inquiry..."
                            className="bg-transparent border-0 border-b border-border rounded-none px-0 focus-visible:ring-0 focus-visible:border-foreground min-h-[120px] resize-none text-base shadow-none py-4"
                            {...field}
                            data-testid="textarea-contact-message"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {error && (
                    <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                      {error}
                    </p>
                  )}

                  <Button
                    type="submit"
                    className="w-full rounded-full h-14 text-base font-semibold mt-4"
                    disabled={isSending}
                    data-testid="button-contact-submit"
                  >
                    {isSending ? "Sending..." : "Send Message"}
                  </Button>
                </form>
              </Form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
