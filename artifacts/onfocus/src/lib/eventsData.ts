export interface EventItem {
  id: string;
  slug?: string;
  title: string;
  subtitle: string;
  category: "Concerts" | "Open Mics" | "Comedy" | "Community" | "Festivals";
  date: string;
  time: string;
  displayDate: string;
  venue: string;
  address: string;
  city: string;
  price: string;
  performerPrice: number;
  audiencePrice: number;
  image: string;
  bannerImage: string;
  tag?: string;
  genre: string;
  language: string;
  duration: string;
  artistLineup: string[];
  about: string;
  guidelines?: string[];
}

export const CURATED_EVENTS: EventItem[] = [
  {
    id: "jhansi-open-mic-5",
    title: "Jhansi Open Mic 5.0",
    subtitle: "A vibrant cultural stage for raw poets, storytellers, singers, and acoustic performers.",
    category: "Open Mics",
    date: "Sunday, 20 Dec 2026",
    time: "11:00 AM onwards",
    displayDate: "SUN, 20 DEC",
    venue: "Ebiza Night Club & Cultural Lounge",
    address: "Civil Lines, Near Elite Circle, Jhansi (284001)",
    city: "Jhansi",
    price: "₹249 onwards",
    performerPrice: 399,
    audiencePrice: 249,
    image: "/about/openmic-poet.jpg",
    bannerImage: "/about/openmic-group.jpg",
    tag: "Curated",
    genre: "Poetry, Storytelling & Acoustic",
    language: "Hindi, Urdu, English",
    duration: "3.5 Hours",
    artistLineup: ["15+ Community Poets", "Acoustic Musicians", "Storytellers"],
    about:
      "The landmark fifth edition of Jhansi's most celebrated open mic series. Whether you are stepping on stage for the first time or sharing new material with a warm, encouraging audience, OnFocus Jhansi Open Mic 5.0 provides a professional stage, sound setup, and video recording for all performers.",
    guidelines: [
      "Performer slot duration is strictly 4 to 5 minutes.",
      "Check-in begins 30 minutes before showtime.",
      "Original material is highly encouraged.",
      "Family-friendly atmosphere; please avoid hate speech or derogatory remarks.",
      "Audience passes include general seating and complimentary event badge.",
    ],
  },
  {
    id: "raag-festival-2026",
    title: "Raag Festival 2026: Live Open Air Concert",
    subtitle: "A grand evening of soulful live fusion, Sufi, and Bollywood classics under the stars.",
    category: "Concerts",
    date: "Saturday, 12 Dec 2026",
    time: "6:30 PM onwards",
    displayDate: "SAT, 12 DEC",
    venue: "Govt. Amphitheatre, Bundelkhand",
    address: "Fort Road, Cantt Area, Jhansi (284001)",
    city: "Jhansi",
    price: "₹499 onwards",
    performerPrice: 699,
    audiencePrice: 499,
    image: "/about/concert-crowd.jpg",
    bannerImage: "/about/concert-finale.jpg",
    tag: "Filling Fast",
    genre: "Sufi & Bollywood Fusion",
    language: "Hindi",
    duration: "3.5 Hours",
    artistLineup: ["The Raag Collective", "Akanksha Singh", "Guest Ensembles"],
    about:
      "Raag Festival is OnFocus's marquee annual music celebration bringing together top vocalists, instrumentalists, and thousands of live music enthusiasts for an unforgettable audio-visual experience with state-of-the-art concert lighting and sound.",
    guidelines: [
      "Gates open at 5:30 PM. Please arrive early to avoid queue delays.",
      "Seats are on a first-come, first-served basis within allocated zones.",
      "Food and beverage stalls available inside the venue.",
      "Performer registrations include green-room access and sound check slots.",
    ],
  },
  {
    id: "acoustic-soul-dhruv",
    title: "Acoustic Soul: Live Music Evening with Dhruv",
    subtitle: "Intimate acoustic set featuring heartfelt melodies and popular romantic Bollywood covers.",
    category: "Concerts",
    date: "Friday, 18 Dec 2026",
    time: "7:30 PM onwards",
    displayDate: "FRI, 18 DEC",
    venue: "The Heritage Lounge, Civil Lines",
    address: "Near Post Office, Civil Lines, Jhansi (284001)",
    city: "Jhansi",
    price: "₹299 onwards",
    performerPrice: 499,
    audiencePrice: 299,
    image: "/dhruv/photo1.jpeg",
    bannerImage: "/dhruv/photo2.jpeg",
    tag: "Popular",
    genre: "Acoustic & Soft Rock",
    language: "Hindi, English",
    duration: "2 Hours",
    artistLineup: ["Dhruv (Guitar & Lead Vocals)", "Guest Percussionist"],
    about:
      "Experience an intimate live session with Dhruv, performing fan-favorite acoustic renditions, Bollywood covers, and soulful original melodies in a cozy, ambient lounge setting.",
    guidelines: [
      "Intimate seating; limited to 80 attendees.",
      "Lounge dining and mocktails available for purchase.",
      "Performer slots are open for opening acoustic acts (15 mins).",
    ],
  },
  {
    id: "laughter-therapy-comedy",
    title: "Laughter Therapy: Standup Comedy Showcase",
    subtitle: "A non-stop evening of unfiltered punchlines, relatable observational comedy, and fun crowd work.",
    category: "Comedy",
    date: "Saturday, 26 Dec 2026",
    time: "8:00 PM onwards",
    displayDate: "SAT, 26 DEC",
    venue: "The Blackbox Space, Hazratganj",
    address: "Naval Kishore Road, Hazratganj, Lucknow (226001)",
    city: "Lucknow",
    price: "₹399 onwards",
    performerPrice: 299,
    audiencePrice: 399,
    image: "/about/openmic-standup.jpg",
    bannerImage: "/about/openmic-audience-laugh.jpg",
    tag: "Limited Seats",
    genre: "Standup Comedy",
    language: "Hindi, Hinglish",
    duration: "90 Minutes",
    artistLineup: ["3 Headliner Comedians", "2 Fresh Openers"],
    about:
      "Catch some of the sharpest comedic minds in Uttar Pradesh deliver an hour and a half of pure comedy. Ideal for friends, couples, and comedy lovers looking for a weekend laugh riot.",
    guidelines: [
      "Age restriction: 16+ years only.",
      "Audio and video recording during headliner sets is strictly prohibited.",
      "Late entries will only be accommodated between comedian sets.",
    ],
  },
  {
    id: "creator-jam-meetup-5",
    title: "Indie Jam & Creator Meetup #5",
    subtitle: "A collaborative gathering for singers, musicians, songwriters, and content creators to jam and connect.",
    category: "Community",
    date: "Sunday, 03 Jan 2027",
    time: "4:00 PM onwards",
    displayDate: "SUN, 03 JAN",
    venue: "OnFocus Creative Studio",
    address: "Plot 14, Rajghat Road, Jhansi (284001)",
    city: "Jhansi",
    price: "Free Entry (RSVP)",
    performerPrice: 0,
    audiencePrice: 0,
    image: "/about/community-session.jpg",
    bannerImage: "/about/community-group1.jpg",
    tag: "Free RSVP",
    genre: "Jam Session & Networking",
    language: "All Languages",
    duration: "3 Hours",
    artistLineup: ["OnFocus Collective", "Independent Songwriters & Artists"],
    about:
      "Join the OnFocus artist community for an informal acoustic circle, open jamming, collaborative discussions, and live networking with event organizers, filmmakers, and peers.",
    guidelines: [
      "Bring your own acoustic instruments if you wish to jam.",
      "Free RSVP is required for studio capacity management.",
      "Tea and refreshments provided by OnFocus.",
    ],
  },
  {
    id: "underground-beats-dj",
    title: "Underground Beats: Club & DJ Showcase",
    subtitle: "High-octane electronic, deep house, and Bollywood club remixes in a state-of-the-art venue.",
    category: "Concerts",
    date: "Friday, 08 Jan 2027",
    time: "9:00 PM onwards",
    displayDate: "FRI, 08 JAN",
    venue: "Skydeck Club & Lounge, Mall Road",
    address: "The Mall, Phool Bagh, Kanpur (208001)",
    city: "Kanpur",
    price: "₹699 onwards",
    performerPrice: 899,
    audiencePrice: 699,
    image: "/about/concert-stage-group.jpg",
    bannerImage: "/about/concert-bw-stage.jpg",
    tag: "Weekend Special",
    genre: "EDM, Deep House & Commercial",
    language: "English, Hindi",
    duration: "4 Hours",
    artistLineup: ["DJ K-Volt", "Visual DJ Ensemble"],
    about:
      "Kick off your weekend with heavy bass drops, synchronized laser lights, and an electrifying dance floor led by top club DJs and touring producers.",
    guidelines: [
      "Club dress code applies. Smart casuals or party wear mandatory.",
      "Entry for 21+ only. Physical ID proof required at entry.",
      "Couples and stag entries as per club admission policy.",
    ],
  },
  {
    id: "sufi-mehfil-night",
    title: "Sufi Reflections: Classical & Folk Fusion Night",
    subtitle: "Soul-stirring qawwalis, sufi kalam, and folk instruments presented in an open-air heritage courtyard.",
    category: "Concerts",
    date: "Saturday, 16 Jan 2027",
    time: "7:00 PM onwards",
    displayDate: "SAT, 16 JAN",
    venue: "Heritage Lawn & Courtyard",
    address: "Tansen Road, Lashkar, Gwalior (474002)",
    city: "Gwalior",
    price: "₹499 onwards",
    performerPrice: 599,
    audiencePrice: 499,
    image: "/about/concert-guitarist.jpg",
    bannerImage: "/about/concert-performer.jpg",
    tag: "Curated",
    genre: "Sufi, Classical & Folk",
    language: "Hindi, Urdu",
    duration: "3 Hours",
    artistLineup: ["Sufi Mehfil Collective", "Harmonium & Tabla Masters"],
    about:
      "Immerse yourself in timeless mystical poetry by Bulleh Shah, Amir Khusro, and Rumi, arranged with acoustic guitars, flutes, and dynamic tabla rhythms in an authentic heritage setting.",
    guidelines: [
      "Traditional seating and baithak arrangement available.",
      "Family friendly event with heritage cultural vibe.",
      "Photography allowed without flash.",
    ],
  },
  {
    id: "campus-acoustic-waves",
    title: "Campus Acoustic Waves: Youth Music Fest",
    subtitle: "College bands and solo acoustic performers battling it out on the big stage.",
    category: "Festivals",
    date: "Sunday, 24 Jan 2027",
    time: "5:30 PM onwards",
    displayDate: "SUN, 24 JAN",
    venue: "University Central Auditorium",
    address: "Bundelkhand University Campus, Kanpur Road, Jhansi (284128)",
    city: "Jhansi",
    price: "₹249 onwards",
    performerPrice: 399,
    audiencePrice: 249,
    image: "/about/concert-performer.jpg",
    bannerImage: "/about/concert-stage-group.jpg",
    tag: "Youth Fest",
    genre: "Battle of the Bands",
    language: "Hindi, English",
    duration: "4 Hours",
    artistLineup: ["Top 8 University Bands", "Special Guest Headliner"],
    about:
      "The premier inter-college musical festival featuring high-energy rock bands, acoustic duos, and solo prodigies competing for the championship trophy and recording deals.",
    guidelines: [
      "Student discounts applicable with valid college ID card.",
      "Band registration includes sound check slot and 15 mins performance time.",
    ],
  },
];

export function getEventById(id: string): EventItem | undefined {
  return CURATED_EVENTS.find((e) => e.id === id);
}
