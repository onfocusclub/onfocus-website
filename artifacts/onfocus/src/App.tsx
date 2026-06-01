import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AuthProvider } from "@/context/AuthContext";
import { AuthModal } from "@/components/AuthModal";

// Pages
import { Home } from "@/pages/Home";
import { Artists } from "@/pages/Artists";
import { Vendors } from "@/pages/Vendors";
import { Venues } from "@/pages/Venues";
import { Explore } from "@/pages/Explore";
import { About } from "@/pages/About";
import { Contact } from "@/pages/Contact";
import { Join } from "@/pages/Join";
import { ListingProfile } from "@/pages/ListingProfile";
import { Dashboard } from "@/pages/Dashboard";
import AdminPanel from "@/pages/AdminPanel"; 

const queryClient = new QueryClient();

function Router() {
  return (
    <div className="flex min-h-[100dvh] flex-col">
      <Navbar />
      <main className="flex-1">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/artists" component={Artists} />
          <Route path="/vendors" component={Vendors} />
          <Route path="/venues" component={Venues} />
          <Route path="/explore" component={Explore} />
          <Route path="/about" component={About} />
          <Route path="/contact" component={Contact} />
          <Route path="/join" component={Join} />
          <Route path="/listing/:id" component={ListingProfile} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/admin" component={AdminPanel} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
      <AuthModal />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <WouterRouter base={import.meta.env.BASE_URL?.replace(/\/$/, "") || ""}>
            <Router />
          </WouterRouter>
        </AuthProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
