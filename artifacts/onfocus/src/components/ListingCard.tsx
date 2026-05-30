import { Link } from "wouter";
import { Star, MapPin } from "lucide-react";
import { Listing } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";

interface ListingCardProps {
  listing: Listing;
}

export function ListingCard({ listing }: ListingCardProps) {
  return (
    <Link href={`/listing/${listing.id}`} data-testid={`link-listing-card-${listing.id}`}>
      <Card className="overflow-hidden h-full border border-border/40 hover:border-border/80 transition-all duration-300 hover:shadow-md group cursor-pointer bg-white rounded-xl">
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          <img
            src={listing.coverImage}
            alt={listing.name}
            className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-[1.03]"
            data-testid={`img-listing-cover-${listing.id}`}
          />
          {listing.verified && (
            <div className="absolute top-3 right-3 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm">
              Verified
            </div>
          )}
        </div>
        <CardContent className="p-5">
          <div className="flex justify-between items-start mb-1">
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1" data-testid={`text-listing-category-${listing.id}`}>
                {listing.category}
              </p>
              <h3 className="font-semibold text-[17px] leading-tight line-clamp-1 group-hover:text-primary transition-colors text-foreground" data-testid={`text-listing-name-${listing.id}`}>
                {listing.name}
              </h3>
            </div>
          </div>
          
          <div className="flex items-center gap-3 mt-3 mb-4">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="w-3.5 h-3.5" />
              <span className="line-clamp-1 truncate max-w-[120px]" data-testid={`text-listing-city-${listing.id}`}>{listing.city}</span>
            </div>
            <div className="flex items-center gap-1 text-sm font-medium text-foreground ml-auto">
              <Star className="w-3.5 h-3.5 fill-foreground" />
              <span data-testid={`text-listing-rating-${listing.id}`}>{listing.rating.toFixed(1)}</span>
              <span className="text-muted-foreground font-normal ml-0.5">({listing.reviewCount})</span>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed" data-testid={`text-listing-bio-${listing.id}`}>
            {listing.bio}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}

export function ListingCardSkeleton() {
  return (
    <Card className="overflow-hidden h-full border-border/40 rounded-xl">
      <div className="aspect-[4/3] bg-muted animate-pulse" />
      <CardContent className="p-5">
        <div className="h-3 w-24 bg-muted rounded animate-pulse mb-3" />
        <div className="h-5 w-3/4 bg-muted rounded animate-pulse mb-4" />
        <div className="flex justify-between items-center mb-4">
          <div className="h-4 w-24 bg-muted rounded animate-pulse" />
          <div className="h-4 w-16 bg-muted rounded animate-pulse" />
        </div>
        <div className="space-y-2">
          <div className="h-4 w-full bg-muted rounded animate-pulse" />
          <div className="h-4 w-2/3 bg-muted rounded animate-pulse" />
        </div>
      </CardContent>
    </Card>
  );
}
