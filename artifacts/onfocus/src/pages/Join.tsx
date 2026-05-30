import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSubmitPartnerApplication } from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check } from "lucide-react";
import { Link } from "wouter";

const joinSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  type: z.enum(["artist", "vendor", "venue"]),
  category: z.string().min(2, "Category is required"),
  city: z.string().min(2, "City is required"),
  description: z.string().min(20, "Please provide a detailed description (min 20 characters)"),
  website: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

export function Join() {
  const [isSuccess, setIsSuccess] = useState(false);
  const submitApplication = useSubmitPartnerApplication();

  const form = useForm<z.infer<typeof joinSchema>>({
    resolver: zodResolver(joinSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      type: "artist",
      category: "",
      city: "",
      description: "",
      website: "",
    },
  });

  function onSubmit(values: z.infer<typeof joinSchema>) {
    submitApplication.mutate(
      { data: { ...values, website: values.website || undefined } },
      {
        onSuccess: () => {
          setIsSuccess(true);
        },
      }
    );
  }

  return (
    <div className="min-h-screen bg-background pt-32 pb-32">
      <div className="container mx-auto px-6 md:px-8 max-w-3xl">
        <div className="text-center mb-16 border-b border-border pb-16">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 text-foreground" data-testid="text-join-heading">Join the Directory.</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed" data-testid="text-join-subheading">
            Apply to feature your portfolio on the premier platform for creative professionals. We review all applications for quality.
          </p>
        </div>

        <div className="bg-white p-10 md:p-14 rounded-3xl border border-border shadow-sm">
          {isSuccess ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-foreground text-background rounded-full flex items-center justify-center mx-auto mb-8">
                <Check className="w-10 h-10" />
              </div>
              <h2 className="text-3xl font-bold mb-4 text-foreground" data-testid="text-success-heading">Application Received</h2>
              <p className="text-lg text-muted-foreground mb-10 max-w-md mx-auto leading-relaxed">
                Thank you for applying. Our curation team will review your application and portfolio within 3-5 business days.
              </p>
              <Button size="lg" className="rounded-full px-10 h-14 font-semibold" asChild data-testid="button-return-home">
                <Link href="/">Return to Home</Link>
              </Button>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
                
                <div className="space-y-8">
                  <h3 className="text-xl font-bold text-foreground pb-2 border-b border-border">Basic Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground">Business / Professional Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Acme Studios" className="h-12 bg-transparent border-border focus-visible:ring-foreground rounded-lg" {...field} data-testid="input-join-name" />
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
                          <FormLabel className="text-foreground">Contact Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="hello@acme.com" className="h-12 bg-transparent border-border focus-visible:ring-foreground rounded-lg" {...field} data-testid="input-join-email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground">Phone Number <span className="text-muted-foreground font-normal">(Optional)</span></FormLabel>
                          <FormControl>
                            <Input placeholder="(555) 123-4567" className="h-12 bg-transparent border-border focus-visible:ring-foreground rounded-lg" {...field} data-testid="input-join-phone" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="website"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground">Portfolio Website <span className="text-muted-foreground font-normal">(Optional)</span></FormLabel>
                          <FormControl>
                            <Input placeholder="https://..." className="h-12 bg-transparent border-border focus-visible:ring-foreground rounded-lg" {...field} data-testid="input-join-website" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-8">
                  <h3 className="text-xl font-bold text-foreground pb-2 border-b border-border">Listing Details</h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground">I am applying as a...</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-12 bg-transparent border-border focus:ring-foreground rounded-lg" data-testid="select-join-type">
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="artist">Artist</SelectItem>
                              <SelectItem value="vendor">Vendor</SelectItem>
                              <SelectItem value="venue">Venue</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground">Primary Category</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Photography" className="h-12 bg-transparent border-border focus-visible:ring-foreground rounded-lg" {...field} data-testid="input-join-category" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground">City</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. San Francisco" className="h-12 bg-transparent border-border focus-visible:ring-foreground rounded-lg" {...field} data-testid="input-join-city" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground">About Your Work</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Tell us about your experience, style, and what makes your work unique. This helps our curation team understand your fit for the platform." 
                            className="min-h-[160px] resize-y bg-transparent border-border focus-visible:ring-foreground rounded-lg text-base p-4" 
                            {...field} 
                            data-testid="textarea-join-description"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button type="submit" className="w-full rounded-full h-14 text-base font-semibold" disabled={submitApplication.isPending} data-testid="button-join-submit">
                  {submitApplication.isPending ? "Submitting..." : "Submit Application"}
                </Button>
              </form>
            </Form>
          )}
        </div>
      </div>
    </div>
  );
}
