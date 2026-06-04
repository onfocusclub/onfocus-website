import { Link, useLocation } from "wouter";
import { useState, useEffect, useRef } from "react";
import { Menu, ChevronDown, LayoutDashboard, Bookmark, LogOut, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

const ARTIST_CATEGORIES = ["Singers", "DJs", "Bands", "Anchors", "Dancers", "Performers"];
const VENDOR_CATEGORIES = ["Decor", "Catering", "Photography", "Makeup", "Production", "Lighting"];
const VENUE_CATEGORIES = ["Banquet Halls", "Rooftops", "Luxury Venues", "Open Lawns", "Clubs"];

function UserAvatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <div className="w-8 h-8 rounded-full bg-foreground text-background flex items-center justify-center text-xs font-semibold select-none">
      {initials}
    </div>
  );
}

function UserDropdown() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!user) return null;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full border border-border/60 pl-2 pr-3 py-1.5 hover:bg-muted/60 transition-colors"
        data-testid="button-user-menu"
      >
        <UserAvatar name={user.name} />
        <span className="text-sm font-medium text-foreground hidden sm:block max-w-[120px] truncate">
          {user.name.split(" ")[0]}
        </span>
        <ChevronDown className={cn("w-3.5 h-3.5 text-muted-foreground transition-transform duration-200", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] w-56 bg-white rounded-xl border border-border shadow-lg py-1.5 z-50 animate-in fade-in-0 zoom-in-95 duration-150">
          <div className="px-4 py-2.5 border-b border-border/50 mb-1">
            <p className="text-sm font-semibold text-foreground truncate">{user.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>

          {[
            { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard", testId: "link-dropdown-dashboard" },
            { icon: Bookmark, label: "Saved", href: "/dashboard", testId: "link-dropdown-saved" },
            { icon: Briefcase, label: "Become a Partner", href: "/join", testId: "link-dropdown-partner" },
          ].map(({ icon: Icon, label, href, testId }) => (
            <Link
              key={label}
              href={href}
              data-testid={testId}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted/60 transition-colors"
            >
              <Icon className="w-4 h-4 text-muted-foreground" />
              {label}
            </Link>
          ))}

          <div className="border-t border-border/50 mt-1 pt-1">
            <button
              data-testid="button-logout"
              onClick={() => { logout(); setOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted/60 transition-colors text-left"
            >
              <LogOut className="w-4 h-4 text-muted-foreground" />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function Navbar() {
  const [location] = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { user, openModal } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 60);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const navClass = cn(
    "fixed top-0 inset-x-0 z-50 transition-all duration-300 ease-in-out border-b",
    isScrolled
      ? "bg-white/90 backdrop-blur-sm border-border shadow-sm py-4"
      : "bg-transparent border-transparent py-6"
  );

  return (
    <nav className={navClass}>
      <div className="container mx-auto px-6 md:px-8 flex items-center justify-between">
        <div className="flex items-center gap-10">
          <Link href="/" className="text-2xl font-bold tracking-tight text-foreground" data-testid="link-home-logo">
            OnFocus
          </Link>

          <div className="hidden lg:flex items-center gap-2">
            <Link
              href="/"
              className={cn("text-sm font-medium transition-colors hover:text-foreground px-4 py-2 rounded-md", location === "/" ? "text-foreground" : "text-muted-foreground")}
              data-testid="link-nav-home"
            >
              Home
            </Link>

            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-sm font-medium text-muted-foreground hover:text-foreground bg-transparent hover:bg-transparent focus:bg-transparent px-4">
                    Artists
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4 md:grid-cols-2">
                      <li className="col-span-2 pb-2 border-b">
                        <NavigationMenuLink asChild>
                          <Link href="/artists" className="block text-sm font-semibold hover:text-primary" data-testid="link-nav-all-artists">
                            All Artists
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      {ARTIST_CATEGORIES.map((cat) => (
                        <li key={cat}>
                          <NavigationMenuLink asChild>
                            <Link href={`/artists?category=${encodeURIComponent(cat)}`} className="block text-sm text-muted-foreground hover:text-foreground transition-colors py-1" data-testid={`link-nav-artist-${cat.toLowerCase()}`}>
                              {cat}
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-sm font-medium text-muted-foreground hover:text-foreground bg-transparent hover:bg-transparent focus:bg-transparent px-4">
                    Vendors
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4 md:grid-cols-2">
                      <li className="col-span-2 pb-2 border-b">
                        <NavigationMenuLink asChild>
                          <Link href="/vendors" className="block text-sm font-semibold hover:text-primary" data-testid="link-nav-all-vendors">
                            All Vendors
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      {VENDOR_CATEGORIES.map((cat) => (
                        <li key={cat}>
                          <NavigationMenuLink asChild>
                            <Link href={`/vendors?category=${encodeURIComponent(cat)}`} className="block text-sm text-muted-foreground hover:text-foreground transition-colors py-1" data-testid={`link-nav-vendor-${cat.toLowerCase()}`}>
                              {cat}
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-sm font-medium text-muted-foreground hover:text-foreground bg-transparent hover:bg-transparent focus:bg-transparent px-4">
                    Venues
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4 md:grid-cols-2">
                      <li className="col-span-2 pb-2 border-b">
                        <NavigationMenuLink asChild>
                          <Link href="/venues" className="block text-sm font-semibold hover:text-primary" data-testid="link-nav-all-venues">
                            All Venues
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      {VENUE_CATEGORIES.map((cat) => (
                        <li key={cat}>
                          <NavigationMenuLink asChild>
                            <Link href={`/venues?category=${encodeURIComponent(cat)}`} className="block text-sm text-muted-foreground hover:text-foreground transition-colors py-1" data-testid={`link-nav-venue-${cat.toLowerCase()}`}>
                              {cat}
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>

            <Link
              href="/about"
              className={cn("text-sm font-medium transition-colors hover:text-foreground px-4 py-2 rounded-md", location === "/about" ? "text-foreground" : "text-muted-foreground")}
              data-testid="link-nav-about"
            >
              About Us
            </Link>
            <Link
              href="/contact"
              className={cn("text-sm font-medium transition-colors hover:text-foreground px-4 py-2 rounded-md", location === "/contact" ? "text-foreground" : "text-muted-foreground")}
              data-testid="link-nav-contact"
            >
              Contact
            </Link>
          </div>
        </div>

        {/* Right side — desktop */}
        <div className="hidden lg:flex items-center gap-4">
          
          <Link href="/explore" className="text-sm font-medium text-foreground hover:text-primary transition-colors" data-testid="link-nav-explore">
            Explore
          </Link>

          {user ? (
            <UserDropdown />
          ) : (
            <>
              <button
                onClick={openModal}
                data-testid="button-nav-login"
                className="text-sm font-medium text-foreground hover:text-primary transition-colors px-1"
              >
                Login
              </button>
              <Button asChild className="rounded-full px-6 font-semibold shadow-none" data-testid="button-nav-join">
                <Link href="/join">Join as Partner</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile nav */}
        <div className="lg:hidden flex items-center gap-2">
          {user ? (
            <UserDropdown />
          ) : (
            <button
              onClick={openModal}
              data-testid="button-nav-login-mobile"
              className="text-sm font-medium text-foreground hover:text-primary transition-colors px-2 py-1"
            >
              Login
            </button>
          )}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-foreground" data-testid="button-nav-mobile-menu">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px] border-l-0 p-0">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <SheetDescription className="sr-only">Access site pages and categories</SheetDescription>
              <div className="flex flex-col h-full bg-white">
                <div className="p-6 border-b border-border/50">
                  <Link href="/" className="text-2xl font-bold tracking-tight text-foreground" data-testid="link-mobile-home-logo">
                    OnFocus
                  </Link>
                </div>
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="flex flex-col gap-6">
                    <Link href="/" className="text-xl font-medium" data-testid="link-mobile-nav-home">Home</Link>
                    <div className="space-y-3">
                      <Link href="/artists" className="text-xl font-medium block" data-testid="link-mobile-nav-artists">Artists</Link>
                      <div className="pl-4 flex flex-col gap-2 border-l border-border/50 text-muted-foreground">
                        {ARTIST_CATEGORIES.map((cat) => (
                          <Link key={cat} href={`/artists?category=${encodeURIComponent(cat)}`} className="text-base" data-testid={`link-mobile-nav-artist-${cat.toLowerCase()}`}>
                            {cat}
                          </Link>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Link href="/vendors" className="text-xl font-medium block" data-testid="link-mobile-nav-vendors">Vendors</Link>
                      <div className="pl-4 flex flex-col gap-2 border-l border-border/50 text-muted-foreground">
                        {VENDOR_CATEGORIES.map((cat) => (
                          <Link key={cat} href={`/vendors?category=${encodeURIComponent(cat)}`} className="text-base" data-testid={`link-mobile-nav-vendor-${cat.toLowerCase()}`}>
                            {cat}
                          </Link>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Link href="/venues" className="text-xl font-medium block" data-testid="link-mobile-nav-venues">Venues</Link>
                      <div className="pl-4 flex flex-col gap-2 border-l border-border/50 text-muted-foreground">
                        {VENUE_CATEGORIES.map((cat) => (
                          <Link key={cat} href={`/venues?category=${encodeURIComponent(cat)}`} className="text-base" data-testid={`link-mobile-nav-venue-${cat.toLowerCase()}`}>
                            {cat}
                          </Link>
                        ))}
                      </div>
                    </div>
                    <Link href="/explore" className="text-xl font-medium" data-testid="link-mobile-nav-explore">Explore All</Link>
                    <Link href="/about" className="text-xl font-medium" data-testid="link-mobile-nav-about">About Us</Link>
                    <Link href="/contact" className="text-xl font-medium" data-testid="link-mobile-nav-contact">Contact</Link>
                  </div>
                </div>
                <div className="p-6 border-t border-border/50 bg-muted/20 space-y-3">
                  {!user && (
                    <Button
                      variant="outline"
                      className="w-full rounded-full h-12 text-base font-semibold shadow-none"
                      onClick={() => { setIsOpen(false); openModal(); }}
                      data-testid="button-mobile-nav-login"
                    >
                      Login / Sign Up
                    </Button>
                  )}
                  <Button className="w-full rounded-full h-12 text-base font-semibold shadow-none" asChild data-testid="button-mobile-nav-join">
                    <Link href="/join">Join as Partner</Link>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
