
import { generateVehicleImage } from './services/aiImageService.ts';

export const VEHICLES: Record<string, any> = {
  HATCHBACK: {
    type: 'Economy Hatchback',
    models: ['Swift', 'Indica', 'Ritz'],
    capacity: 4,
    maxSeats: 4,
    image: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=80&w=400',
    baseFare: 350,
    tariff: {
      nonAc: [350, 500, 650, 800, 950, 1100, 1300, 1500, 1700, 1900, 2100, 2300],
      ac: [500, 650, 800, 950, 1100, 1300, 1500, 1700, 1900, 2100, 2300, 2500],
      extraKm: { nonAc: 10, ac: 11 }
    },
    syncImage: async () => await generateVehicleImage('Economy Hatchback', ['Swift', 'Indica', 'Ritz'])
  },
  SEDAN: {
    type: 'Premium Sedan',
    models: ['Dzire', 'Etios', 'Xcent'],
    capacity: 4,
    maxSeats: 4,
    image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=400',
    baseFare: 450,
    tariff: {
      nonAc: [450, 600, 750, 900, 1100, 1300, 1500, 1700, 1900, 2100, 2300, 2500],
      ac: [600, 750, 900, 1050, 1300, 1500, 1700, 1900, 2100, 2300, 2500, 2700],
      extraKm: { nonAc: 11, ac: 12 }
    },
    syncImage: async () => await generateVehicleImage('Premium Sedan', ['Dzire', 'Etios', 'Xcent'])
  },
  SUV: {
    type: 'Executive SUV',
    models: ['Innova', 'Xylo', 'Tavera'],
    capacity: 7,
    maxSeats: 7,
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=400',
    baseFare: 1800,
    tariff: {
      nonAc: [1800, 1800, 1800, 2000, 2200, 2400, 2600, 2800, 3000, 3200, 3400, 3700],
      ac: [2000, 2000, 2000, 2200, 2400, 2600, 2800, 3000, 3200, 3500, 3700, 4000],
      extraKm: { nonAc: 14, ac: 16 }
    },
    syncImage: async () => await generateVehicleImage('Executive SUV', ['Innova', 'Xylo', 'Tavera'])
  }
};

export const FIXED_PACKAGES: Record<string, { distance: number, fare: number }> = {
  "Full Kanchipuram 15 Divyadesam Tour": {
    distance: 45,
    fare: 2500
  },
  "Full Kanchipuram 12 Shiva Sivalayangal Tour": {
    distance: 125,
    fare: 4500
  }
};

export const DIVYADESAM_TEMPLES = [
  { id: 1, name: "Varadharajar Temple", location: "Little Kanchipuram (1 KM from Bus Stand)", significance: "Divyadesam #1 - Moolavar Varadhar" },
  { id: 2, name: "Ashtabuja Perumal Temple", location: "Kanchipuram", significance: "Divyadesam #2 - 8-armed Lord" },
  { id: 3, name: "Yathothakaari Temple", location: "Kanchipuram", significance: "Divyadesam #3 - Sonnavannam Seidha Perumal" },
  { id: 4, name: "Deepa Prakasar Temple", location: "Thoopul", significance: "Divyadesam #4 - Vilakkoli Perumal" },
  { id: 5, name: "Azhagiya Singar Temple", location: "Kanchipuram", significance: "Divyadesam #5 - Narasimha Avatar" },
  { id: 6, name: "Vaikunda Perumal Temple", location: "Kanchipuram", significance: "Divyadesam #6 - Parameshwara Vinnagaram" },
  { id: 7, name: "Ulagalantha Perumal Temple", location: "Bus Stand Area", significance: "Divyadesam #7 - Giant Vamana" },
  { id: 8, name: "Jagadeeshwarar Temple", location: "Ulagalantha Complex", significance: "Divyadesam #8 - Neeragam Cluster" },
  { id: 9, name: "Karunakara Perumal Temple", location: "Ulagalantha Complex", significance: "Divyadesam #9 - Karvaanam Cluster" },
  { id: 10, name: "Thiru Kaarvaanar Temple", location: "Ulagalantha Complex", significance: "Divyadesam #10 - Kaavaanam Cluster" },
  { id: 11, name: "Adhi Varaha Perumal Temple", location: "Inside Kamakshi Amman Temple", significance: "Divyadesam #11 - Thirukkalvanoor" },
  { id: 12, name: "Pandava Thoodhar Temple", location: "Near Ekambareswarar", significance: "Divyadesam #12 - Thiruppaadagam" },
  { id: 13, name: "Pavala Vannar Temple", location: "Railway Station Rd", significance: "Divyadesam #13 - Coral Colored Lord" },
  { id: 14, name: "Nilathingal Thundathan", location: "Inside Ekambareswarar Temple", significance: "Divyadesam #14 - Moon Grace" },
  { id: 15, name: "Vijayaraghava Perumal Temple", location: "Thirupputkuzhi (Baluchatti Chatiram)", significance: "Divyadesam #15 - Final Thondai Nadu Site" }
];

export const SHIVA_TEMPLES = [
  { id: 1, name: "Ekambaranathar Temple", location: "1 KM from Kanchipuram Bus Stand", significance: "Paadal Petra Sivalayam #1" },
  { id: 2, name: "Thirumetrali Swarar Temple", location: "1 KM from Kanchipuram Bus Stand", significance: "Paadal Petra Sivalayam #2" },
  { id: 3, name: "Onakandheeswarar Temple", location: "2 KM from KPM Bus Stand (Panchupettai)", significance: "Paadal Petra Sivalayam #3" },
  { id: 4, name: "Kachi Anekathangavadeswarar", location: "2 KM from Kanchipuram Bus Stand", significance: "Paadal Petra Sivalayam #4" },
  { id: 5, name: "Satyanathar Temple", location: "2 KM from Kanchipuram Bus Stand", significance: "Paadal Petra Sivalayam #5" },
  { id: 6, name: "Tirumagaraleeswarar Temple", location: "Tirumagaral (16 KM from KPM via Keezh Road)", significance: "Paadal Petra Sivalayam #6" },
  { id: 7, name: "Deivanayakeswarar Temple", location: "Elumiyankottur (25 KM from KPM)", significance: "Paadal Petra Sivalayam #7" },
  { id: 8, name: "Vedapureeswarar Temple", location: "Thiruverkadu (10 KM from Chennai CMBT)", significance: "Paadal Petra Sivalayam #8" },
  { id: 9, name: "Kachabeswarar Temple", location: "Thirukkachur (12 KM from Chengalpattu)", significance: "Paadal Petra Sivalayam #9" },
  { id: 10, name: "Gnanapureeswarar Temple", location: "Thiruvadisoolam (9 KM from Chengalpattu)", significance: "Paadal Petra Sivalayam #10" },
  { id: 11, name: "Vedagiriswarar Temple", location: "Thirukazhukundram (17 KM from Chengalpattu)", significance: "Paadal Petra Sivalayam #11" },
  { id: 12, name: "Atchipureeswarar Temple", location: "Atchirupakkam (48 KM from Chengalpattu)", significance: "Paadal Petra Sivalayam #12" }
];

export const NEURAL_LOCATIONS = [
  "Kanchipuram Bus Stand", "Kanchipuram Railway Station", "Ekambareswarar Temple", "Kamakshi Amman Temple",
  "Chennai Airport (MAA)", "Chennai Central", "Koyambedu CMBT", "Mahabalipuram", "Chengalpattu",
  "Vellore CMC", "Sriperumbudur", "Arani", "Cheyyar", "Vandavasi"
];

export const NEURAL_LOCATION_REGISTRY = [
  { id: '1', name: 'Kanchipuram Bus Stand', district: 'Kanchipuram' },
  { id: '2', name: 'Kanchipuram Railway Station', district: 'Kanchipuram' },
  { id: '3', name: 'Ekambareswarar Temple', district: 'Kanchipuram' },
  { id: '4', name: 'Kamakshi Amman Temple', district: 'Kanchipuram' },
  { id: '5', name: 'Chennai Airport (MAA)', district: 'Chennai' },
  { id: '6', name: 'Chennai Central', district: 'Chennai' },
  { id: '7', name: 'Koyambedu CMBT', district: 'Chennai' },
  { id: '8', name: 'Mahabalipuram', district: 'Chengalpattu' },
  { id: '9', name: 'Chengalpattu Junction', district: 'Chengalpattu' },
  { id: '10', name: 'Vellore CMC', district: 'Vellore' }
];

export const TAMIL_NADU_DISTRICTS = [
  "Ariyalur", "Chengalpattu", "Chennai", "Coimbatore", "Cuddalore", "Dharmapuri", "Dindigul", "Erode",
  "Kallakurichi", "Kanchipuram", "Kanyakumari", "Karur", "Krishnagiri", "Madurai", "Mayiladuthurai",
  "Nagapattinam", "Namakkal", "Nilgiris", "Perambalur", "Pudukkottai", "Ramanathapuram", "Ranipet",
  "Salem", "Sivaganga", "Tenkasi", "Thanjavur", "Theni", "Thoothukudi", "Tiruchirappalli", "Tirunelveli",
  "Tirupathur", "Tiruppur", "Tiruvallur", "Tiruvannamalai", "Tiruvarur", "Vellore", "Viluppuram", "Virudhunagar"
];

export const TAMIL_NADU_TOURISM = [
  {
    category: "Heritage & Temples",
    locations: [
      { name: "Kanchipuram", info: "The city of thousand temples and silk sarees." },
      { name: "Madurai Meenakshi", info: "An architectural marvel and spiritual hub." },
      { name: "Thanjavur Big Temple", info: "UNESCO World Heritage site with Chola grandeur." }
    ]
  },
  {
    category: "Nature & Hill Stations",
    locations: [
      { name: "Ooty", info: "Queen of hill stations in the Nilgiris." },
      { name: "Kodaikanal", info: "Princess of hill stations with serene lakes." },
      { name: "Yercaud", info: "The Jewel of the South in Shevaroy Hills." }
    ]
  }
];

export const DISTANCE_SLOTS = [
  '0-10 KM', '11-20 KM', '21-30 KM', '31-40 KM', '41-50 KM', '51-60 KM',
  '61-70 KM', '71-80 KM', '81-90 KM', '91-110 KM', '111-130 KM', '131-150 KM'
];
