import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="bg-white border-t border-border mt-auto">
      <div className="container mx-auto px-6 md:px-8 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 lg:gap-16">
          <div className="md:col-span-1">
            <Link href="/" className="text-2xl font-bold tracking-tight inline-block mb-6 text-foreground" data-testid="link-footer-home">
              OnFocus
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
              A trusted creative directory where event organizers, couples, and brands discover verified artists, vendors, and venues.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-sm tracking-wider uppercase text-foreground mb-6">Directory</h3>
            <ul className="space-y-4">
              <li><Link href="/artists" className="text-muted-foreground hover:text-foreground transition-colors text-sm" data-testid="link-footer-artists">Artists</Link></li>
              <li><Link href="/vendors" className="text-muted-foreground hover:text-foreground transition-colors text-sm" data-testid="link-footer-vendors">Vendors</Link></li>
              <li><Link href="/venues" className="text-muted-foreground hover:text-foreground transition-colors text-sm" data-testid="link-footer-venues">Venues</Link></li>
              <li><Link href="/explore" className="text-muted-foreground hover:text-foreground transition-colors text-sm" data-testid="link-footer-explore">Explore All</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-sm tracking-wider uppercase text-foreground mb-6">Company</h3>
            <ul className="space-y-4">
              <li><Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors text-sm" data-testid="link-footer-about">About Us</Link></li>
              <li><Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors text-sm" data-testid="link-footer-contact">Contact</Link></li>
              <li><Link href="/join" className="text-muted-foreground hover:text-foreground transition-colors text-sm" data-testid="link-footer-join">Join as Partner</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-sm tracking-wider uppercase text-foreground mb-6">Legal</h3>
            <ul className="space-y-4">
              <li><span className="text-muted-foreground hover:text-foreground transition-colors text-sm cursor-pointer" data-testid="text-footer-terms">Terms of Service</span></li>
              <li><span className="text-muted-foreground hover:text-foreground transition-colors text-sm cursor-pointer" data-testid="text-footer-privacy">Privacy Policy</span></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border mt-16 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-muted-foreground text-sm" data-testid="text-footer-copyright">
            © {new Date().getFullYear()} OnFocus. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
