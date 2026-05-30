import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export function About() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 md:px-8 pt-32 pb-32 max-w-4xl">
        <div className="text-center mb-20">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-8 text-foreground" data-testid="text-about-heading">
            We believe great events start with great people.
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-3xl mx-auto" data-testid="text-about-mission">
            OnFocus was founded with a singular vision: to bring transparency, quality, and trust to the event planning process. We are the editorial directory for creative professionals.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-24">
          <div className="flex flex-col text-left">
            <h3 className="text-xl font-bold mb-4 text-foreground">Discovery</h3>
            <p className="text-muted-foreground leading-relaxed">
              Finding the right professional shouldn't be a gamble. It should be an inspiring journey of discovering extraordinary talent.
            </p>
          </div>
          <div className="flex flex-col text-left">
            <h3 className="text-xl font-bold mb-4 text-foreground">Trust</h3>
            <p className="text-muted-foreground leading-relaxed">
              Every profile is carefully vetted. We verify portfolios and professional history so you can book with confidence.
            </p>
          </div>
          <div className="flex flex-col text-left">
            <h3 className="text-xl font-bold mb-4 text-foreground">Excellence</h3>
            <p className="text-muted-foreground leading-relaxed">
              We prioritize quality over quantity. Our platform is a curated space for those who take immense pride in their craft.
            </p>
          </div>
        </div>

        <div className="bg-white p-12 md:p-16 rounded-3xl border border-border text-center">
          <h2 className="text-3xl font-bold mb-6 text-foreground">Join the standard</h2>
          <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            Whether you are organizing an event or you are a professional looking to showcase your work, OnFocus is built for you.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="w-full sm:w-auto rounded-full px-8 font-semibold h-14" asChild data-testid="button-about-explore">
              <Link href="/explore">Explore Directory</Link>
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-full px-8 font-semibold h-14" asChild data-testid="button-about-join">
              <Link href="/join">Apply to Join</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
