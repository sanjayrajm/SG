import { Language } from './types';

export const TRANSLATIONS: Record<Language, any> = {
  [Language.ENGLISH]: {
    common: {
      back: "BACK",
      backHome: "BACK HOME",
      home: "HOME",
      about: "ABOUT US",
      services: "SERVICES",
      locations: "LOCATIONS",
      contact: "CONTACT US",
      bookNow: "BOOK NOW",
      loading: "Finding the best ride for you...",
      viewAll: "View All",
      moreInfo: "More Info",
      submit: "SUBMIT",
      cancel: "CANCEL",
      save: "SAVE",
      otp: "OTP",
      fare: "FARE",
      distance: "DISTANCE",
      ac: "AC Premium",
      nonAc: "Non-AC",
      viewFares: "VIEW FARES ➔",
      driverPortal: "Driver Portal",
      adminHub: "Admin Hub"
    },
    nav: {
      brand: "SG CALL TAXI",
      tagline: "Premium Service"
    },
    hero: {
      title: "BEST CAB\nSERVICE.",
      subtitle: "Kanchipuram's most trusted taxi network. Safe, professional, and on time.",
      ctaBook: "BOOK NOW",
      ctaFleet: "OUR VEHICLES ➔"
    },
    about: {
      title: "ABOUT US",
      breadcrumb: "Home // About Us",
      heading: "FEW WORDS ABOUT US..",
      description: "Kanchipuram SG Call Taxi is one among the most preferred & trusted taxi/cab services brand in Kanchipuram-Cheyyar-Walajabad and nearby. The journey started in the year 2010 and we are still travelling with satisfied customers on the roads of 2016.",
      missionTitle: "OUR MISSION",
      missionText: "Our Mission is to provide excellent transport service to customers and ensure Safe & Secure transportation of associates to help in your productivity level.",
      visionTitle: "OUR VISION",
      visionText: "Our Vision is to introduce best practices, to provide best service in people Logistics and become the industry bench mark. Stay in touch with customers to understand their ever changing requirement and update ourselves accordingly to satisfy customers in service level.",
      features: [
        "24x7 Service",
        "Ticket Booking",
        "GPS Tracking",
        "Room Booking",
        "Corporate service",
        "Tour Packages"
      ],
      reviewsHeading: "CUSTOMER REVIEWS",
      reviewsSub: "SG CALL TAXI",
      reviews: [
        { name: 'SAMPATH.P', location: 'WALAJABAD', text: 'The service of cab is very good. They charge cheaper service than others.' },
        { name: 'SK VAARI FRIENDS', location: 'ARAKKONAM', text: 'Really a lowest price comparing others. I am satisfied.' },
        { name: 'MURUGESAN.E', location: 'CHEYYAR', text: 'Reliable and Safe Cab Service, I felt secure during my journey.' }
      ]
    },
    fleet: {
      heading: "OUR\nVEHICLES.",
      subheading: "Choose the right car for your travel needs."
    },
    locations: {
      heading: "SERVICE\nAREAS.",
      subheading: "38 Districts Fully Covered",
      label: "Where We Are"
    },
    contact: {
      heading: "CONTACT\nINTEL.",
      subheading: "Strategic Support Units Standing By For Signal Initiation.",
      signalLine: "SIGNAL LINE",
      tacticalChat: "TACTICAL CHAT",
      headquarters: "HEADQUARTERS",
      hqValue: "KANCHIPURAM, TN"
    },
    footer: {
      aboutText: "Kanchipuram SG Call Taxi prioritizes customer satisfaction, safety, and well-maintained vehicles.",
      rights: "SG Call Taxi 2025 © All Rights Reserved."
    },
    promo: {
      discount: "10% Discount",
      discountSub: "On your second booking on the same day.",
      kmOffer: "5% OFF",
      kmOfferSub: "Travel over 250 kms and save more."
    }
  },
  [Language.TAMIL]: {
    common: {
      back: "பின்னால்",
      backHome: "முகப்பிற்குச் செல்க",
      home: "முகப்பு",
      about: "எங்களைப் பற்றி",
      services: "சேவைகள்",
      locations: "இடங்கள்",
      contact: "தொடர்பு கொள்ள",
      bookNow: "முன்பதிவு",
      loading: "உங்களுக்கான வாகனத்தைத் தேடுகிறது...",
      viewAll: "அனைத்தையும் காண்க",
      moreInfo: "கூடுதல் தகவல்",
      submit: "சமர்ப்பி",
      cancel: "ரத்து செய்",
      save: "சேமி",
      otp: "கடவுச்சொல்",
      fare: "கட்டணம்",
      distance: "தூரம்",
      ac: "ஏசி பிரீமியம்",
      nonAc: "ஏசி அல்லாதது",
      viewFares: "கட்டண விவரங்கள் ➔",
      driverPortal: "டிரைவர் பக்கம்",
      adminHub: "நிர்வாக பக்கம்"
    },
    nav: {
      brand: "எஸ்ஜி கால் டாக்ஸி",
      tagline: "சிறந்த சேவை"
    },
    hero: {
      title: "சிறந்த\nடாக்சி சேவை.",
      subtitle: "காஞ்சிபுரத்தின் மிகவும் நம்பகமான டாக்ஸி நெட்வொர்க். பாதுகாப்பான, தொழில்முறை மற்றும் சரியான நேரத்திற்கு.",
      ctaBook: "இப்பொழுதே முன்பதிவு செய்யவும்",
      ctaFleet: "எங்கள் வாகனங்கள் ➔"
    },
    about: {
      title: "எங்களைப் பற்றி",
      breadcrumb: "முகப்பு // எங்களைப் பற்றி",
      heading: "எங்களைப் பற்றி சில வார்த்தைகள்..",
      description: "காஞ்சிபுரம் எஸ்ஜி கால் டாக்ஸி காஞ்சிபுரம்-செய்யார்-வாலாஜாபாத் மற்றும் சுற்றுவட்டாரப் பகுதிகளில் மிகவும் விருப்பமான மற்றும் நம்பகமான டாக்ஸி/கேப் சேவை பிராண்டுகளில் ஒன்றாகும். இந்த பயணம் 2010 ஆம் ஆண்டு தொடங்கப்பட்டது மற்றும் நாங்கள் இன்னும் 2016 ஆம் ஆண்டின் சாலைகளில் திருப்திகரமான வாடிக்கையாளர்களுடன் பயணிக்கிறோம்.",
      missionTitle: "எங்கள் நோக்கம்",
      missionText: "வாடிக்கையாளர்களுக்கு சிறந்த போக்குவரத்து சேவையை வழங்குவதும், உங்கள் உற்பத்தித்திறன் நிலைக்கு உதவ சகாக்களின் பாதுகாப்பான மற்றும் உறுதியான போக்குவரத்தை உறுதி செய்வதும் எங்கள் நோக்கமாகும்.",
      visionTitle: "எங்கள் பார்வை",
      visionText: "சிறந்த நடைமுறைகளை அறிமுகப்படுத்துவதும், மக்கள் தளவாடங்களில் சிறந்த சேவையை வழங்குவதும் மற்றும் தொழில்துறை தர குறியீடாக மாறுவதும் எங்கள் பார்வையாகும். வாடிக்கையாளர்களின் மாறிவரும் தேவையைப் புரிந்துகொள்வதற்கும், சேவை மட்டத்தில் வாடிக்கையாளர்களைத் திருப்திப்படுத்துவதற்கும் ஏற்ப நம்மைப் புதுப்பித்துக் கொள்ள வாடிக்கையாளர்களுடன் தொடர்பில் இருங்கள்.",
      features: [
        "24x7 சேவை",
        "டிக்கெட் முன்பதிவு",
        "ஜிபிஎஸ் கண்காணிப்பு",
        "அறை முன்பதிவு",
        "கார்ப்பரேட் சேவை",
        "சுற்றுலா பேக்கேஜ்கள்"
      ],
      reviewsHeading: "வாடிக்கையாளர் மதிப்புரைகள்",
      reviewsSub: "எஸ்ஜி கால் டாக்ஸி",
      reviews: [
        { name: 'சம்பத்.பி', location: 'வாலாஜாபாத்', text: 'டாக்ஸி சேவை மிகவும் சிறப்பாக உள்ளது. மற்றவர்களை விட குறைந்த கட்டணம் வசூலிக்கிறார்கள்.' },
        { name: 'எஸ்.கே வாரி நண்பர்கள்', location: 'அரக்கோணம்', text: 'மற்றவர்களுடன் ஒப்பிடும்போது உண்மையிலேயே மிகக் குறைந்த விலை. நான் திருப்தி அடைகிறேன்.' },
        { name: 'முருகேசன்.இ', location: 'செய்யார்', text: 'நம்பகமான மற்றும் பாதுகாப்பான டாக்ஸி சேவை, எனது பயணத்தின் போது நான் பாதுகாப்பாக உணர்ந்தேன்.' }
      ]
    },
    fleet: {
      heading: "எங்கள்\nவாகனங்கள்.",
      subheading: "உங்கள் பயணத் தேவைகளுக்கு ஏற்ற காரைத் தேர்வு செய்யவும்."
    },
    locations: {
      heading: "சேவை\nபகுதிகள்.",
      subheading: "38 மாவட்டங்கள் முழுமையாக இணைக்கப்பட்டுள்ளன",
      label: "நாங்கள் இருக்கும் இடங்கள்"
    },
    contact: {
      heading: "தொடர்பு\nவிவரம்.",
      subheading: "உங்களுக்கு உதவ எங்கள் குழு எப்போதும் தயாராக உள்ளது.",
      signalLine: "தொலைபேசி எண்",
      tacticalChat: "வாட்ஸ்அப் சாட்",
      headquarters: "தலைமையகம்",
      hqValue: "காஞ்சிபுரம், தமிழ்நாடு"
    },
    footer: {
      aboutText: "காஞ்சிபுரம் எஸ்ஜி கால் டாக்ஸி வாடிக்கையாளர் திருப்தி, பாதுகாப்பு மற்றும் நன்கு பராமரிக்கப்படும் வாகனங்களுக்கு முன்னுரிமை அளிக்கிறது.",
      rights: "எஸ்ஜி கால் டாக்ஸி 2025 © அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை."
    },
    promo: {
      discount: "10% தள்ளுபடி",
      discountSub: "ஒரே நாளில் உங்களின் இரண்டாவது முன்பதிவுக்கு.",
      kmOffer: "5% தள்ளுபடி",
      kmOfferSub: "250 கிமீக்கு மேல் பயணம் செய்து அதிகம் சேமிக்கவும்."
    }
  }
};