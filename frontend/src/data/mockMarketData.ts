// Currency definitions with live exchange rates relative to USD ($1.00)
export interface CurrencyInfo {
  code: string;
  symbol: string;
  rate: number;
  agriRate: number; // Agricultural wholesale market purchasing parity rate per kg
  name: string;
}

export const CURRENCY_RATES: Record<string, CurrencyInfo> = {
  USD: { code: 'USD', symbol: '$', rate: 1.0, agriRate: 1.0, name: 'USD - US Dollar ($)' },
  INR: { code: 'INR', symbol: '₹', rate: 83.5, agriRate: 23.5, name: 'INR - Indian Rupee (₹)' },
  EUR: { code: 'EUR', symbol: '€', rate: 0.92, agriRate: 0.92, name: 'EUR - Euro (€)' },
  GBP: { code: 'GBP', symbol: '£', rate: 0.79, agriRate: 0.79, name: 'GBP - British Pound (£)' },
  JPY: { code: 'JPY', symbol: '¥', rate: 156.0, agriRate: 115.0, name: 'JPY - Japanese Yen (¥)' },
  CAD: { code: 'CAD', symbol: 'C$', rate: 1.36, agriRate: 1.30, name: 'CAD - Canadian Dollar (C$)' },
  AUD: { code: 'AUD', symbol: 'A$', rate: 1.50, agriRate: 1.45, name: 'AUD - Australian Dollar (A$)' },
  BRL: { code: 'BRL', symbol: 'R$', rate: 5.35, agriRate: 4.20, name: 'BRL - Brazilian Real (R$)' },
};

// Geographical Country -> State -> District hierarchy with regional price multiplier
export interface DistrictInfo {
  name: string;
  multiplier: number; // local wholesale mandi price index
}

export interface StateInfo {
  name: string;
  districts: DistrictInfo[];
}

export interface CountryInfo {
  name: string;
  defaultCurrency: string;
  states: StateInfo[];
}

// Expanded comprehensive regional hierarchy across every major state and district
export const REGIONAL_HIERARCHY: Record<string, CountryInfo> = {
  'India': {
    name: 'India',
    defaultCurrency: 'INR',
    states: [
      {
        name: 'Maharashtra',
        districts: [
          { name: 'Vashi APMC Wholesale Mandi Mumbai', multiplier: 0.95 },
          { name: 'Nashik Onion & Grape Mandi', multiplier: 0.88 },
          { name: 'Pune APMC Produce Hub', multiplier: 0.92 },
          { name: 'Nagpur Orange APMC Mandi', multiplier: 0.89 },
          { name: 'Kolhapur Agricultural Mandi', multiplier: 0.91 },
          { name: 'Solapur APMC Hub', multiplier: 0.90 },
          { name: 'Aurangabad Chhatrapati Sambhajinagar APMC', multiplier: 0.90 },
          { name: 'Jalgaon Banana Wholesale Market', multiplier: 0.85 },
          { name: 'Ahmednagar Grain & Vegetable Mandi', multiplier: 0.89 },
          { name: 'Satara APMC Wholesale Market', multiplier: 0.91 },
          { name: 'Sangli Turmeric APMC Mandi', multiplier: 0.93 },
          { name: 'Amravati Cotton & Produce Mandi', multiplier: 0.88 },
          { name: 'Latur Grain & Oilseed Exchange', multiplier: 0.89 },
          { name: 'Nanded Agricultural Mandi', multiplier: 0.90 }
        ]
      },
      {
        name: 'Delhi NCR',
        districts: [
          { name: 'Azadpur National Mandi (Asia Largest)', multiplier: 1.02 },
          { name: 'Ghazipur Agricultural Market', multiplier: 1.00 },
          { name: 'Okhla Wholesale Hub', multiplier: 1.04 },
          { name: 'Noida Phase 2 APMC Hub', multiplier: 1.01 },
          { name: 'Gurugram Khandsa Mandi', multiplier: 1.03 },
          { name: 'Faridabad NIT Vegetable Mandi', multiplier: 0.99 },
          { name: 'Ghaziabad Sahibabad APMC', multiplier: 0.98 }
        ]
      },
      {
        name: 'Uttar Pradesh',
        districts: [
          { name: 'Kanpur Central Grain & Produce Mandi', multiplier: 0.88 },
          { name: 'Lucknow APMC Mandi', multiplier: 0.90 },
          { name: 'Agra Potato & Vegetable Mandi', multiplier: 0.87 },
          { name: 'Varanasi APMC Hub', multiplier: 0.91 },
          { name: 'Prayagraj Allahabad Mandi', multiplier: 0.89 },
          { name: 'Meerut Produce Exchange', multiplier: 0.90 },
          { name: 'Bareilly Grain & Vegetable Hub', multiplier: 0.88 },
          { name: 'Aligarh APMC Market', multiplier: 0.89 },
          { name: 'Gorakhpur Wholesale Mandi', multiplier: 0.90 },
          { name: 'Mathura Agricultural Exchange', multiplier: 0.89 }
        ]
      },
      {
        name: 'Punjab',
        districts: [
          { name: 'Khanna Asia Largest Grain Mandi', multiplier: 0.86 },
          { name: 'Ludhiana APMC Mandi', multiplier: 0.90 },
          { name: 'Amritsar Produce Mandi', multiplier: 0.92 },
          { name: 'Jalandhar APMC Hub', multiplier: 0.89 },
          { name: 'Patiala Grain & Vegetable Mandi', multiplier: 0.88 },
          { name: 'Bathinda Cotton & Grain Market', multiplier: 0.87 },
          { name: 'Mohali Wholesale Terminal', multiplier: 0.93 },
          { name: 'Hoshiarpur Citrus Hub', multiplier: 0.89 },
          { name: 'Pathankot Produce Exchange', multiplier: 0.90 }
        ]
      },
      {
        name: 'Haryana',
        districts: [
          { name: 'Karnal Grain & Rice Mandi', multiplier: 0.88 },
          { name: 'Sonipat Vegetable Mandi', multiplier: 0.91 },
          { name: 'Panipat APMC Market', multiplier: 0.90 },
          { name: 'Hisar Agricultural Exchange', multiplier: 0.87 },
          { name: 'Ambala Grain & Produce Mandi', multiplier: 0.89 },
          { name: 'Rohtak APMC Wholesale Hub', multiplier: 0.90 },
          { name: 'Sirsa Cotton & Wheat Mandi', multiplier: 0.86 },
          { name: 'Kurukshetra Rice Exchange', multiplier: 0.88 }
        ]
      },
      {
        name: 'Karnataka',
        districts: [
          { name: 'Yeshwanthpur APMC Bengaluru', multiplier: 0.96 },
          { name: 'Kolar National Tomato Mandi', multiplier: 0.85 },
          { name: 'Hubballi APMC Mandi', multiplier: 0.91 },
          { name: 'Mysuru APMC Hub', multiplier: 0.93 },
          { name: 'Belagavi Agricultural Exchange', multiplier: 0.90 },
          { name: 'Mangaluru Spice & Produce Market', multiplier: 0.97 },
          { name: 'Shivamogga Arecanut & Spice Mandi', multiplier: 0.92 },
          { name: 'Davangere Cotton & Maize Hub', multiplier: 0.89 },
          { name: 'Ballari Grain & Vegetable Mandi', multiplier: 0.90 },
          { name: 'Hassan Potato Hub', multiplier: 0.88 }
        ]
      },
      {
        name: 'Gujarat',
        districts: [
          { name: 'Unjha Spice Mandi (Asia Largest Spice)', multiplier: 0.94 },
          { name: 'Ahmedabad Jamalpur APMC', multiplier: 0.96 },
          { name: 'Surat APMC Wholesale Market', multiplier: 0.97 },
          { name: 'Rajkot Agricultural Hub', multiplier: 0.91 },
          { name: 'Vadodara APMC Market', multiplier: 0.93 },
          { name: 'Bhavnagar Produce Exchange', multiplier: 0.90 },
          { name: 'Jamnagar Grain & Oilseed Mandi', multiplier: 0.91 },
          { name: 'Junagadh Groundnut & Mango Mandi', multiplier: 0.88 },
          { name: 'Anand Milk & Agricultural Hub', multiplier: 0.92 },
          { name: 'Bhuj Kutch Produce Terminal', multiplier: 0.90 }
        ]
      },
      {
        name: 'Tamil Nadu',
        districts: [
          { name: 'Koyambedu Wholesale Market Chennai', multiplier: 0.98 },
          { name: 'Madurai Central Mandi', multiplier: 0.91 },
          { name: 'Coimbatore Mettupalayam APMC', multiplier: 0.92 },
          { name: 'Ooty Nilgiris Vegetable Hub', multiplier: 0.94 },
          { name: 'Tiruchirappalli Gandhi Market', multiplier: 0.91 },
          { name: 'Salem Mango & Turmeric Mandi', multiplier: 0.89 },
          { name: 'Tirunelveli Produce Exchange', multiplier: 0.90 },
          { name: 'Erode Turmeric & Grain Hub', multiplier: 0.88 },
          { name: 'Vellore APMC Market', multiplier: 0.91 },
          { name: 'Thanjavur Rice Bowl Mandi', multiplier: 0.87 }
        ]
      },
      {
        name: 'Andhra Pradesh',
        districts: [
          { name: 'Guntur Chilli Mandi (Asia Largest)', multiplier: 0.89 },
          { name: 'Vijayawada APMC Produce Hub', multiplier: 0.91 },
          { name: 'Kurnool Onion & Grain Mandi', multiplier: 0.87 },
          { name: 'Visakhapatnam APMC Market', multiplier: 0.94 },
          { name: 'Tirupati Agricultural Hub', multiplier: 0.92 },
          { name: 'Anantapur Groundnut Mandi', multiplier: 0.86 },
          { name: 'Rajahmundry Banana & Fruit Hub', multiplier: 0.89 },
          { name: 'Nellore Rice & Aquaculture Exchange', multiplier: 0.90 }
        ]
      },
      {
        name: 'Telangana',
        districts: [
          { name: 'Bowenpally APMC Hyderabad', multiplier: 0.96 },
          { name: 'Nizamabad Spice & Turmeric Mandi', multiplier: 0.89 },
          { name: 'Warangal Agricultural Mandi', multiplier: 0.90 },
          { name: 'Karimnagar Grain Hub', multiplier: 0.88 },
          { name: 'Khammam Chilli & Cotton Exchange', multiplier: 0.89 },
          { name: 'Mahbubnagar Grain Mandi', multiplier: 0.88 },
          { name: 'Nalgonda Rice Market', multiplier: 0.88 }
        ]
      },
      {
        name: 'West Bengal',
        districts: [
          { name: 'Koley Wholesale Market Kolkata', multiplier: 0.97 },
          { name: 'Siliguri Regulated Mandi', multiplier: 0.93 },
          { name: 'Burdwan Grain & Potato Exchange', multiplier: 0.88 },
          { name: 'Howrah Wholesale Terminal', multiplier: 0.96 },
          { name: 'Malda Mango & Jute Mandi', multiplier: 0.87 },
          { name: 'Asansol APMC Hub', multiplier: 0.91 },
          { name: 'Midnapore Agricultural Exchange', multiplier: 0.88 }
        ]
      },
      {
        name: 'Madhya Pradesh',
        districts: [
          { name: 'Indore APMC Choithram Mandi', multiplier: 0.89 },
          { name: 'Bhopal Karond APMC Mandi', multiplier: 0.90 },
          { name: 'Ujjain Grain & Vegetable Mandi', multiplier: 0.87 },
          { name: 'Jabalpur APMC Wholesale Market', multiplier: 0.89 },
          { name: 'Gwalior Agricultural Hub', multiplier: 0.88 },
          { name: 'Sagar Soybean & Grain Exchange', multiplier: 0.86 },
          { name: 'Ratlam Spice & Produce Mandi', multiplier: 0.88 }
        ]
      },
      {
        name: 'Rajasthan',
        districts: [
          { name: 'Jaipur Muhana APMC Mandi', multiplier: 0.92 },
          { name: 'Kota Grain & Spice Mandi', multiplier: 0.88 },
          { name: 'Jodhpur Cumin & Spice Market', multiplier: 0.90 },
          { name: 'Bikaner Mustard & Grain Hub', multiplier: 0.87 },
          { name: 'Udaipur Agricultural Exchange', multiplier: 0.91 },
          { name: 'Ajmer Produce Mandi', multiplier: 0.89 },
          { name: 'Alwar Grain & Mustard Market', multiplier: 0.88 }
        ]
      },
      {
        name: 'Bihar',
        districts: [
          { name: 'Patna Gulzarbagh Mandi', multiplier: 0.90 },
          { name: 'Muzaffarpur Fruit & Lychee Hub', multiplier: 0.86 },
          { name: 'Gaya Agricultural Market', multiplier: 0.88 },
          { name: 'Bhagalpur Grain & Silk Hub', multiplier: 0.87 },
          { name: 'Purnia Maize Exchange', multiplier: 0.85 },
          { name: 'Darbhanga Produce Mandi', multiplier: 0.87 }
        ]
      },
      {
        name: 'Kerala',
        districts: [
          { name: 'Kochi Pepper & Spice Exchange', multiplier: 1.02 },
          { name: 'Kozhikode Palayam Wholesale Market', multiplier: 0.98 },
          { name: 'Thiruvananthapuram Chalai Mandi', multiplier: 1.00 },
          { name: 'Thrissur APMC Produce Hub', multiplier: 0.97 },
          { name: 'Palakkad Grain & Rice Exchange', multiplier: 0.94 },
          { name: 'Wayanad Cardamom & Coffee Terminal', multiplier: 0.99 }
        ]
      }
    ]
  },
  'United States': {
    name: 'United States',
    defaultCurrency: 'USD',
    states: [
      {
        name: 'California',
        districts: [
          { name: 'Fresno Central Valley Hub', multiplier: 0.96 },
          { name: 'Salinas Agricultural Mandi', multiplier: 1.02 },
          { name: 'Los Angeles Terminal Market', multiplier: 1.08 },
          { name: 'Sacramento Valley Produce Exchange', multiplier: 0.98 },
          { name: 'Kern County Bakersfield Produce Terminal', multiplier: 0.94 },
          { name: 'Tulare County Citrus & Fruit Exchange', multiplier: 0.95 },
          { name: 'Monterey County Vegetable Market', multiplier: 1.01 },
          { name: 'Ventura County Berry Hub', multiplier: 1.04 },
          { name: 'Imperial Valley Winter Crop Terminal', multiplier: 0.93 },
          { name: 'San Joaquin Valley Grain & Produce Bay', multiplier: 0.95 }
        ]
      },
      {
        name: 'Washington',
        districts: [
          { name: 'Yakima Fruit Valley Hub', multiplier: 0.94 },
          { name: 'Wenatchee Apple Terminal', multiplier: 0.93 },
          { name: 'Seattle Produce Exchange', multiplier: 1.05 },
          { name: 'Spokane Agricultural Market', multiplier: 0.96 },
          { name: 'Columbia Basin Potato & Grain Exchange', multiplier: 0.91 },
          { name: 'Tri-Cities Produce Terminal', multiplier: 0.93 }
        ]
      },
      {
        name: 'Florida',
        districts: [
          { name: 'Homestead Agricultural Market', multiplier: 0.98 },
          { name: 'Tampa Citrus Hub', multiplier: 0.97 },
          { name: 'Miami Terminal Exchange', multiplier: 1.06 },
          { name: 'Orlando Central Produce Bay', multiplier: 1.01 },
          { name: 'Jacksonville Wholesale Hub', multiplier: 0.99 },
          { name: 'Polk County Citrus Exchange', multiplier: 0.94 },
          { name: 'Palm Beach County Sweet Corn Market', multiplier: 1.02 }
        ]
      },
      {
        name: 'Texas',
        districts: [
          { name: 'Rio Grande Valley Produce Hub', multiplier: 0.93 },
          { name: 'Dallas Wholesale Market', multiplier: 1.01 },
          { name: 'Houston Agricultural Exchange', multiplier: 1.02 },
          { name: 'San Antonio Terminal Market', multiplier: 0.98 },
          { name: 'Lubbock Cotton & Grain Exchange', multiplier: 0.89 },
          { name: 'El Paso Border Produce Terminal', multiplier: 0.95 }
        ]
      },
      {
        name: 'New York',
        districts: [
          { name: 'Hunts Point Produce Market (NYC)', multiplier: 1.15 },
          { name: 'Buffalo Niagara Grain Hub', multiplier: 1.02 },
          { name: 'Rochester Agricultural Exchange', multiplier: 0.99 },
          { name: 'Syracuse Regional Produce Bay', multiplier: 0.98 },
          { name: 'Long Island Farm Produce Terminal', multiplier: 1.08 }
        ]
      },
      {
        name: 'Illinois',
        districts: [
          { name: 'Chicago International Produce Market', multiplier: 1.07 },
          { name: 'Central Illinois Corn & Soy Terminal', multiplier: 0.92 },
          { name: 'Springfield Agricultural Hub', multiplier: 0.93 },
          { name: 'Peoria Grain & Produce Exchange', multiplier: 0.91 }
        ]
      },
      {
        name: 'Idaho',
        districts: [
          { name: 'Boise Potato Exchange', multiplier: 0.89 },
          { name: 'Twin Falls Agricultural Hub', multiplier: 0.88 },
          { name: 'Idaho Falls Grain & Potato Terminal', multiplier: 0.87 },
          { name: 'Pocatello Regional Produce Bay', multiplier: 0.88 }
        ]
      },
      {
        name: 'Georgia',
        districts: [
          { name: 'Atlanta Farmers Market Hub', multiplier: 1.01 },
          { name: 'Vidalia Onion Terminal', multiplier: 0.92 },
          { name: 'Savannah Port Produce Exchange', multiplier: 0.97 },
          { name: 'Augusta Agricultural Mandi', multiplier: 0.94 }
        ]
      }
    ]
  },
  'United Kingdom': {
    name: 'United Kingdom',
    defaultCurrency: 'GBP',
    states: [
      {
        name: 'England - Greater London',
        districts: [
          { name: 'New Covent Garden Market London', multiplier: 1.12 },
          { name: 'Western International Market London', multiplier: 1.09 },
          { name: 'Spitalfields Wholesale Produce Market', multiplier: 1.10 }
        ]
      },
      {
        name: 'England - Midlands',
        districts: [
          { name: 'Birmingham Wholesale Market', multiplier: 1.05 },
          { name: 'Nottingham Wholesale Produce Exchange', multiplier: 1.02 },
          { name: 'Leicester Agricultural Market Hub', multiplier: 1.01 }
        ]
      },
      {
        name: 'England - North West',
        districts: [
          { name: 'Manchester New Smithfield Market', multiplier: 1.04 },
          { name: 'Liverpool Wholesale Produce Exchange', multiplier: 1.03 },
          { name: 'Preston Agricultural Terminal', multiplier: 1.00 }
        ]
      },
      {
        name: 'Scotland',
        districts: [
          { name: 'Glasgow Blochairn Wholesale Market', multiplier: 1.03 },
          { name: 'Edinburgh Produce Exchange', multiplier: 1.05 },
          { name: 'Aberdeen Regional Produce Terminal', multiplier: 1.04 }
        ]
      },
      {
        name: 'Wales',
        districts: [
          { name: 'Cardiff Wholesale Market', multiplier: 1.02 },
          { name: 'Swansea Agricultural Produce Hub', multiplier: 1.00 }
        ]
      }
    ]
  },
  'European Union': {
    name: 'European Union',
    defaultCurrency: 'EUR',
    states: [
      {
        name: 'France',
        districts: [
          { name: 'Rungis International Paris (World Largest)', multiplier: 1.10 },
          { name: 'Lyon Produce Terminal', multiplier: 1.03 },
          { name: 'Marseille Wholesale Agricultural Hub', multiplier: 1.04 },
          { name: 'Bordeaux Wine & Produce Terminal', multiplier: 1.05 }
        ]
      },
      {
        name: 'Spain',
        districts: [
          { name: 'Almeria Greenhouse Produce Hub', multiplier: 0.91 },
          { name: 'Valencia Citrus Mandi', multiplier: 0.92 },
          { name: 'Madrid Mercamadrid Terminal', multiplier: 1.01 },
          { name: 'Barcelona Mercabarna Wholesale Exchange', multiplier: 1.04 },
          { name: 'Murcia Vegetable & Fruit Hub', multiplier: 0.90 }
        ]
      },
      {
        name: 'Netherlands',
        districts: [
          { name: 'Rotterdam Wholesale Exchange', multiplier: 1.05 },
          { name: 'Westland Greenhouse Hub', multiplier: 0.98 },
          { name: 'Amsterdam Produce Terminal', multiplier: 1.07 }
        ]
      },
      {
        name: 'Italy',
        districts: [
          { name: 'Milan Wholesale Produce Exchange', multiplier: 1.06 },
          { name: 'Rome Agricultural Terminal', multiplier: 1.04 },
          { name: 'Bologna Produce & Grain Market', multiplier: 1.02 },
          { name: 'Naples Southern Produce Exchange', multiplier: 0.99 }
        ]
      },
      {
        name: 'Germany',
        districts: [
          { name: 'Hamburg Wholesale Market', multiplier: 1.07 },
          { name: 'Frankfurt Agricultural Terminal', multiplier: 1.06 },
          { name: 'Munich Großmarkthalle Produce Bay', multiplier: 1.08 },
          { name: 'Berlin Wholesale Produce Exchange', multiplier: 1.05 }
        ]
      }
    ]
  },
  'Brazil': {
    name: 'Brazil',
    defaultCurrency: 'BRL',
    states: [
      {
        name: 'São Paulo',
        districts: [
          { name: 'CEAGESP Wholesale Terminal São Paulo', multiplier: 0.94 },
          { name: 'Campinas Agricultural Hub', multiplier: 0.92 },
          { name: 'Ribeirão Preto Sugar & Grain Bay', multiplier: 0.90 },
          { name: 'Santos Port Agricultural Terminal', multiplier: 0.95 }
        ]
      },
      {
        name: 'Paraná',
        districts: [
          { name: 'Curitiba Wholesale Exchange', multiplier: 0.93 },
          { name: 'Londrina Grain Terminal', multiplier: 0.89 },
          { name: 'Maringá Soybean & Produce Market', multiplier: 0.88 }
        ]
      },
      {
        name: 'Minas Gerais',
        districts: [
          { name: 'CEASA Minas Belo Horizonte', multiplier: 0.94 },
          { name: 'Uberlândia Agricultural Hub', multiplier: 0.90 },
          { name: 'Juiz de Fora Produce Exchange', multiplier: 0.91 }
        ]
      }
    ]
  },
  'Australia': {
    name: 'Australia',
    defaultCurrency: 'AUD',
    states: [
      {
        name: 'New South Wales',
        districts: [
          { name: 'Sydney Markets Flemington', multiplier: 1.08 },
          { name: 'Riverina Agricultural Hub', multiplier: 0.96 },
          { name: 'Newcastle Produce Terminal', multiplier: 1.02 }
        ]
      },
      {
        name: 'Victoria',
        districts: [
          { name: 'Melbourne Wholesale Market (Epping)', multiplier: 1.06 },
          { name: 'Goulburn Valley Produce Hub', multiplier: 0.95 },
          { name: 'Sunraysia Citrus & Fruit Exchange', multiplier: 0.94 }
        ]
      },
      {
        name: 'Queensland',
        districts: [
          { name: 'Brisbane Markets Rocklea', multiplier: 1.05 },
          { name: 'Bundaberg Agricultural Exchange', multiplier: 0.94 },
          { name: 'Cairns Tropical Fruit Terminal', multiplier: 0.96 },
          { name: 'Lockyer Valley Vegetable Hub', multiplier: 0.93 }
        ]
      }
    ]
  }
};

export interface RawFoodPriceItem {
  id: string;
  name: string;
  category: 'Fruit' | 'Vegetable' | 'Herbs & Sprouts' | 'Raw Dairy & Seafood' | 'Grain & Cereals' | 'Nuts & Seeds' | 'Spices';
  priceTodayUSD: number; // base $/kg
  price7dUSD: number;
  price30dUSD: number;
  price90dUSD: number;
  price1YrUSD: number;
  changeToday: number;
  change7d: number;
  volumeKg: number;
  gradeAUSD: number;
  gradeBUSD: number;
  processingUSD: number;
}

// Extensive Worldwide Raw Food Commodity List (85 worldwide agricultural & raw items)
export const GLOBAL_RAW_FOOD_ITEMS: RawFoodPriceItem[] = [
  // FRUITS (38 items)
  { id: 'RAW-01', name: 'Banana (Cavendish Fresh)', category: 'Fruit', priceTodayUSD: 1.42, price7dUSD: 1.38, price30dUSD: 1.35, price90dUSD: 1.30, price1YrUSD: 1.25, changeToday: 0.7, change7d: 2.9, volumeKg: 85000, gradeAUSD: 1.65, gradeBUSD: 1.35, processingUSD: 0.75 },
  { id: 'RAW-02', name: 'Apple (Fuji / Gala Fresh)', category: 'Fruit', priceTodayUSD: 2.85, price7dUSD: 2.74, price30dUSD: 2.60, price90dUSD: 2.45, price1YrUSD: 2.40, changeToday: 1.8, change7d: 4.0, volumeKg: 62000, gradeAUSD: 3.20, gradeBUSD: 2.65, processingUSD: 1.40 },
  { id: 'RAW-03', name: 'Mango (Alfonso Premium)', category: 'Fruit', priceTodayUSD: 4.25, price7dUSD: 4.10, price30dUSD: 3.95, price90dUSD: 3.70, price1YrUSD: 3.60, changeToday: 1.9, change7d: 3.7, volumeKg: 44000, gradeAUSD: 4.95, gradeBUSD: 3.90, processingUSD: 2.10 },
  { id: 'RAW-04', name: 'Papaya (Red Lady Sweet)', category: 'Fruit', priceTodayUSD: 1.35, price7dUSD: 1.32, price30dUSD: 1.28, price90dUSD: 1.20, price1YrUSD: 1.15, changeToday: 0.5, change7d: 2.3, volumeKg: 51000, gradeAUSD: 1.60, gradeBUSD: 1.25, processingUSD: 0.70 },
  { id: 'RAW-05', name: 'Watermelon (Sugar Baby)', category: 'Fruit', priceTodayUSD: 0.85, price7dUSD: 0.84, price30dUSD: 0.82, price90dUSD: 0.78, price1YrUSD: 0.75, changeToday: 0.4, change7d: 1.2, volumeKg: 140000, gradeAUSD: 1.05, gradeBUSD: 0.80, processingUSD: 0.45 },
  { id: 'RAW-06', name: 'Muskmelon / Cantaloupe', category: 'Fruit', priceTodayUSD: 1.60, price7dUSD: 1.58, price30dUSD: 1.55, price90dUSD: 1.48, price1YrUSD: 1.42, changeToday: 0.8, change7d: 1.3, volumeKg: 48000, gradeAUSD: 1.95, gradeBUSD: 1.50, processingUSD: 0.85 },
  { id: 'RAW-07', name: 'Orange / Sweet Lime (Mosambi)', category: 'Fruit', priceTodayUSD: 1.95, price7dUSD: 1.92, price30dUSD: 1.88, price90dUSD: 1.80, price1YrUSD: 1.75, changeToday: 0.5, change7d: 1.6, volumeKg: 59000, gradeAUSD: 2.35, gradeBUSD: 1.85, processingUSD: 0.95 },
  { id: 'RAW-08', name: 'Pomegranate (Anar Bhagwa)', category: 'Fruit', priceTodayUSD: 3.80, price7dUSD: 3.70, price30dUSD: 3.55, price90dUSD: 3.35, price1YrUSD: 3.20, changeToday: 1.2, change7d: 2.7, volumeKg: 32000, gradeAUSD: 4.40, gradeBUSD: 3.55, processingUSD: 1.90 },
  { id: 'RAW-09', name: 'Grapes (Green / Black Seedless)', category: 'Fruit', priceTodayUSD: 4.10, price7dUSD: 4.00, price30dUSD: 3.85, price90dUSD: 3.65, price1YrUSD: 3.55, changeToday: 1.2, change7d: 2.5, volumeKg: 39000, gradeAUSD: 4.70, gradeBUSD: 3.80, processingUSD: 1.90 },
  { id: 'RAW-10', name: 'Guava (Amrood Allahabad)', category: 'Fruit', priceTodayUSD: 1.90, price7dUSD: 1.86, price30dUSD: 1.80, price90dUSD: 1.72, price1YrUSD: 1.65, changeToday: 0.6, change7d: 2.1, volumeKg: 41000, gradeAUSD: 2.25, gradeBUSD: 1.80, processingUSD: 0.95 },
  { id: 'RAW-11', name: 'Pineapple (MD2 Gold Sweet)', category: 'Fruit', priceTodayUSD: 1.75, price7dUSD: 1.72, price30dUSD: 1.68, price90dUSD: 1.60, price1YrUSD: 1.55, changeToday: 0.9, change7d: 1.7, volumeKg: 62000, gradeAUSD: 2.05, gradeBUSD: 1.65, processingUSD: 0.95 },
  { id: 'RAW-12', name: 'Chickoo (Sapodilla Kalapatti)', category: 'Fruit', priceTodayUSD: 2.10, price7dUSD: 2.05, price30dUSD: 1.98, price90dUSD: 1.88, price1YrUSD: 1.80, changeToday: 0.7, change7d: 2.4, volumeKg: 28000, gradeAUSD: 2.50, gradeBUSD: 1.95, processingUSD: 1.10 },
  { id: 'RAW-13', name: 'Coconut (Tender Water & Fresh Meat)', category: 'Fruit', priceTodayUSD: 1.50, price7dUSD: 1.48, price30dUSD: 1.45, price90dUSD: 1.40, price1YrUSD: 1.35, changeToday: 0.5, change7d: 1.3, volumeKg: 95000, gradeAUSD: 1.80, gradeBUSD: 1.45, processingUSD: 0.80 },
  { id: 'RAW-14', name: 'Strawberry (Albion Fresh)', category: 'Fruit', priceTodayUSD: 6.80, price7dUSD: 6.40, price30dUSD: 5.90, price90dUSD: 5.50, price1YrUSD: 5.40, changeToday: 3.1, change7d: 6.3, volumeKg: 18000, gradeAUSD: 7.80, gradeBUSD: 6.10, processingUSD: 3.20 },
  { id: 'RAW-15', name: 'Blueberry (Cultivated Fresh)', category: 'Fruit', priceTodayUSD: 11.50, price7dUSD: 11.20, price30dUSD: 10.80, price90dUSD: 10.20, price1YrUSD: 9.80, changeToday: 1.5, change7d: 2.7, volumeKg: 12000, gradeAUSD: 13.20, gradeBUSD: 10.50, processingUSD: 5.80 },
  { id: 'RAW-16', name: 'Blackberry (Fresh Berry)', category: 'Fruit', priceTodayUSD: 10.80, price7dUSD: 10.50, price30dUSD: 10.10, price90dUSD: 9.60, price1YrUSD: 9.20, changeToday: 1.4, change7d: 2.8, volumeKg: 9500, gradeAUSD: 12.40, gradeBUSD: 9.80, processingUSD: 5.40 },
  { id: 'RAW-17', name: 'Raspberry (Red Heritage)', category: 'Fruit', priceTodayUSD: 12.20, price7dUSD: 11.90, price30dUSD: 11.40, price90dUSD: 10.80, price1YrUSD: 10.40, changeToday: 1.6, change7d: 2.5, volumeKg: 8800, gradeAUSD: 14.00, gradeBUSD: 11.20, processingUSD: 6.10 },
  { id: 'RAW-18', name: 'Kiwi (Hayward Green)', category: 'Fruit', priceTodayUSD: 4.50, price7dUSD: 4.40, price30dUSD: 4.25, price90dUSD: 4.05, price1YrUSD: 3.90, changeToday: 1.1, change7d: 2.3, volumeKg: 24000, gradeAUSD: 5.20, gradeBUSD: 4.20, processingUSD: 2.20 },
  { id: 'RAW-19', name: 'Avocado (Hass Premium)', category: 'Fruit', priceTodayUSD: 5.40, price7dUSD: 5.10, price30dUSD: 4.85, price90dUSD: 4.60, price1YrUSD: 4.40, changeToday: 2.4, change7d: 5.9, volumeKg: 31000, gradeAUSD: 6.20, gradeBUSD: 4.90, processingUSD: 2.50 },
  { id: 'RAW-20', name: 'Pear (Bartlett / Anjou)', category: 'Fruit', priceTodayUSD: 2.60, price7dUSD: 2.55, price30dUSD: 2.48, price90dUSD: 2.38, price1YrUSD: 2.30, changeToday: 0.8, change7d: 1.9, volumeKg: 35000, gradeAUSD: 3.05, gradeBUSD: 2.45, processingUSD: 1.25 },
  { id: 'RAW-21', name: 'Plum (Black Amber Sweet)', category: 'Fruit', priceTodayUSD: 3.10, price7dUSD: 3.05, price30dUSD: 2.95, price90dUSD: 2.80, price1YrUSD: 2.70, changeToday: 0.9, change7d: 1.6, volumeKg: 22000, gradeAUSD: 3.60, gradeBUSD: 2.90, processingUSD: 1.45 },
  { id: 'RAW-22', name: 'Peach (Yellow Orchard)', category: 'Fruit', priceTodayUSD: 3.40, price7dUSD: 3.35, price30dUSD: 3.20, price90dUSD: 3.05, price1YrUSD: 2.95, changeToday: 0.8, change7d: 1.5, volumeKg: 26000, gradeAUSD: 3.95, gradeBUSD: 3.15, processingUSD: 1.60 },
  { id: 'RAW-23', name: 'Apricot (Royal Sweet)', category: 'Fruit', priceTodayUSD: 4.80, price7dUSD: 4.65, price30dUSD: 4.45, price90dUSD: 4.20, price1YrUSD: 4.00, changeToday: 1.4, change7d: 3.2, volumeKg: 16000, gradeAUSD: 5.60, gradeBUSD: 4.40, processingUSD: 2.30 },
  { id: 'RAW-24', name: 'Cherry (Bing Dark Red)', category: 'Fruit', priceTodayUSD: 8.90, price7dUSD: 8.60, price30dUSD: 8.20, price90dUSD: 7.70, price1YrUSD: 7.40, changeToday: 1.8, change7d: 3.5, volumeKg: 14000, gradeAUSD: 10.40, gradeBUSD: 8.20, processingUSD: 4.40 },
  { id: 'RAW-25', name: 'Lychee (Rose Scented Fresh)', category: 'Fruit', priceTodayUSD: 5.60, price7dUSD: 5.45, price30dUSD: 5.25, price90dUSD: 4.95, price1YrUSD: 4.70, changeToday: 1.3, change7d: 2.7, volumeKg: 19000, gradeAUSD: 6.50, gradeBUSD: 5.20, processingUSD: 2.80 },
  { id: 'RAW-26', name: 'Custard Apple (Sitaphal)', category: 'Fruit', priceTodayUSD: 3.90, price7dUSD: 3.80, price30dUSD: 3.65, price90dUSD: 3.45, price1YrUSD: 3.30, changeToday: 1.1, change7d: 2.6, volumeKg: 21000, gradeAUSD: 4.60, gradeBUSD: 3.65, processingUSD: 1.95 },
  { id: 'RAW-27', name: 'Fig (Fresh Anjeer Poona)', category: 'Fruit', priceTodayUSD: 6.40, price7dUSD: 6.20, price30dUSD: 5.95, price90dUSD: 5.60, price1YrUSD: 5.30, changeToday: 1.6, change7d: 3.2, volumeKg: 11000, gradeAUSD: 7.40, gradeBUSD: 5.90, processingUSD: 3.10 },
  { id: 'RAW-28', name: 'Jackfruit (Ripe Sweet Flesh)', category: 'Fruit', priceTodayUSD: 1.85, price7dUSD: 1.82, price30dUSD: 1.78, price90dUSD: 1.70, price1YrUSD: 1.65, changeToday: 0.6, change7d: 1.6, volumeKg: 46000, gradeAUSD: 2.20, gradeBUSD: 1.75, processingUSD: 0.90 },
  { id: 'RAW-29', name: 'Dates (Fresh Wet Medjool)', category: 'Fruit', priceTodayUSD: 7.50, price7dUSD: 7.30, price30dUSD: 7.00, price90dUSD: 6.60, price1YrUSD: 6.30, changeToday: 1.4, change7d: 2.7, volumeKg: 24000, gradeAUSD: 8.80, gradeBUSD: 6.90, processingUSD: 3.60 },
  { id: 'RAW-30', name: 'Jamun (Java Plum Fresh)', category: 'Fruit', priceTodayUSD: 4.20, price7dUSD: 4.10, price30dUSD: 3.95, price90dUSD: 3.75, price1YrUSD: 3.60, changeToday: 1.0, change7d: 2.4, volumeKg: 17000, gradeAUSD: 4.90, gradeBUSD: 3.90, processingUSD: 2.10 },
  { id: 'RAW-31', name: 'Star Fruit (Carambola Sweet)', category: 'Fruit', priceTodayUSD: 3.70, price7dUSD: 3.60, price30dUSD: 3.48, price90dUSD: 3.30, price1YrUSD: 3.15, changeToday: 0.9, change7d: 2.8, volumeKg: 13000, gradeAUSD: 4.30, gradeBUSD: 3.45, processingUSD: 1.80 },
  { id: 'RAW-32', name: 'Dragon Fruit (Red Pitaya)', category: 'Fruit', priceTodayUSD: 5.20, price7dUSD: 5.05, price30dUSD: 4.85, price90dUSD: 4.60, price1YrUSD: 4.35, changeToday: 1.3, change7d: 3.0, volumeKg: 23000, gradeAUSD: 6.10, gradeBUSD: 4.80, processingUSD: 2.40 },
  { id: 'RAW-33', name: 'Passion Fruit (Purple Tangy)', category: 'Fruit', priceTodayUSD: 6.10, price7dUSD: 5.90, price30dUSD: 5.65, price90dUSD: 5.30, price1YrUSD: 5.05, changeToday: 1.5, change7d: 3.4, volumeKg: 14000, gradeAUSD: 7.10, gradeBUSD: 5.60, processingUSD: 2.90 },
  { id: 'RAW-34', name: 'Grapefruit (Ruby Red Fresh)', category: 'Fruit', priceTodayUSD: 2.30, price7dUSD: 2.25, price30dUSD: 2.18, price90dUSD: 2.05, price1YrUSD: 1.95, changeToday: 0.8, change7d: 2.2, volumeKg: 36000, gradeAUSD: 2.70, gradeBUSD: 2.15, processingUSD: 1.10 },
  { id: 'RAW-35', name: 'Lemon / Lime (Juice Raw Daily)', category: 'Fruit', priceTodayUSD: 2.45, price7dUSD: 2.40, price30dUSD: 2.32, price90dUSD: 2.20, price1YrUSD: 2.10, changeToday: 0.9, change7d: 2.1, volumeKg: 49000, gradeAUSD: 2.85, gradeBUSD: 2.25, processingUSD: 1.20 },
  { id: 'RAW-36', name: 'Gooseberry (Amla Indian)', category: 'Fruit', priceTodayUSD: 2.10, price7dUSD: 2.05, price30dUSD: 1.98, price90dUSD: 1.88, price1YrUSD: 1.80, changeToday: 0.8, change7d: 2.4, volumeKg: 29000, gradeAUSD: 2.45, gradeBUSD: 1.95, processingUSD: 1.05 },
  { id: 'RAW-37', name: 'Wood Apple (Bel Fresh Fruit)', category: 'Fruit', priceTodayUSD: 1.95, price7dUSD: 1.92, price30dUSD: 1.86, price90dUSD: 1.76, price1YrUSD: 1.68, changeToday: 0.6, change7d: 1.5, volumeKg: 18000, gradeAUSD: 2.30, gradeBUSD: 1.80, processingUSD: 0.95 },
  { id: 'RAW-38', name: 'Cranberry (Fresh Harvest Berry)', category: 'Fruit', priceTodayUSD: 7.80, price7dUSD: 7.50, price30dUSD: 7.10, price90dUSD: 6.70, price1YrUSD: 6.40, changeToday: 1.7, change7d: 4.0, volumeKg: 11000, gradeAUSD: 9.10, gradeBUSD: 7.20, processingUSD: 3.80 },

  // VEGETABLES (35 items)
  { id: 'RAW-39', name: 'Tomato (Roma / Beefsteak)', category: 'Vegetable', priceTodayUSD: 1.95, price7dUSD: 2.10, price30dUSD: 2.25, price90dUSD: 2.40, price1YrUSD: 2.15, changeToday: -2.5, change7d: -7.1, volumeKg: 65000, gradeAUSD: 2.30, gradeBUSD: 1.80, processingUSD: 0.95 },
  { id: 'RAW-40', name: 'Cucumber (Kheera Crisp)', category: 'Vegetable', priceTodayUSD: 1.20, price7dUSD: 1.18, price30dUSD: 1.15, price90dUSD: 1.08, price1YrUSD: 1.02, changeToday: 0.5, change7d: 1.7, volumeKg: 78000, gradeAUSD: 1.45, gradeBUSD: 1.10, processingUSD: 0.60 },
  { id: 'RAW-41', name: 'Carrot (Imperator Fresh)', category: 'Vegetable', priceTodayUSD: 1.05, price7dUSD: 1.04, price30dUSD: 1.02, price90dUSD: 0.98, price1YrUSD: 0.94, changeToday: 0.4, change7d: 1.0, volumeKg: 88000, gradeAUSD: 1.28, gradeBUSD: 0.98, processingUSD: 0.52 },
  { id: 'RAW-42', name: 'Red Onion (Storage Globe)', category: 'Vegetable', priceTodayUSD: 1.35, price7dUSD: 1.30, price30dUSD: 1.25, price90dUSD: 1.15, price1YrUSD: 1.10, changeToday: 1.5, change7d: 3.8, volumeKg: 95000, gradeAUSD: 1.58, gradeBUSD: 1.25, processingUSD: 0.70 },
  { id: 'RAW-43', name: 'White / Yellow Onion', category: 'Vegetable', priceTodayUSD: 1.10, price7dUSD: 1.08, price30dUSD: 1.05, price90dUSD: 1.00, price1YrUSD: 0.95, changeToday: 0.8, change7d: 1.9, volumeKg: 110000, gradeAUSD: 1.30, gradeBUSD: 1.02, processingUSD: 0.55 },
  { id: 'RAW-44', name: 'Spring Onion (Scallions Green)', category: 'Vegetable', priceTodayUSD: 2.20, price7dUSD: 2.15, price30dUSD: 2.08, price90dUSD: 1.98, price1YrUSD: 1.90, changeToday: 0.9, change7d: 2.3, volumeKg: 34000, gradeAUSD: 2.60, gradeBUSD: 2.05, processingUSD: 1.10 },
  { id: 'RAW-45', name: 'Radish (Mooli White / Red)', category: 'Vegetable', priceTodayUSD: 0.95, price7dUSD: 0.94, price30dUSD: 0.92, price90dUSD: 0.88, price1YrUSD: 0.84, changeToday: 0.4, change7d: 1.1, volumeKg: 52000, gradeAUSD: 1.15, gradeBUSD: 0.88, processingUSD: 0.45 },
  { id: 'RAW-46', name: 'Green Bell Pepper (Capsicum)', category: 'Vegetable', priceTodayUSD: 2.80, price7dUSD: 2.85, price30dUSD: 2.90, price90dUSD: 2.95, price1YrUSD: 2.70, changeToday: -0.8, change7d: -1.8, volumeKg: 34000, gradeAUSD: 3.25, gradeBUSD: 2.60, processingUSD: 1.30 },
  { id: 'RAW-47', name: 'Red Bell Pepper (Sweet Crisp)', category: 'Vegetable', priceTodayUSD: 3.60, price7dUSD: 3.75, price30dUSD: 3.80, price90dUSD: 3.90, price1YrUSD: 3.50, changeToday: -1.4, change7d: -4.0, volumeKg: 28000, gradeAUSD: 4.10, gradeBUSD: 3.35, processingUSD: 1.70 },
  { id: 'RAW-48', name: 'Yellow Bell Pepper (Sweet Crisp)', category: 'Vegetable', priceTodayUSD: 3.75, price7dUSD: 3.85, price30dUSD: 3.90, price90dUSD: 4.00, price1YrUSD: 3.65, changeToday: -1.2, change7d: -2.6, volumeKg: 25000, gradeAUSD: 4.30, gradeBUSD: 3.50, processingUSD: 1.80 },
  { id: 'RAW-49', name: 'Green Chillies (Raw Pungent)', category: 'Vegetable', priceTodayUSD: 2.90, price7dUSD: 2.85, price30dUSD: 2.78, price90dUSD: 2.65, price1YrUSD: 2.55, changeToday: 0.8, change7d: 1.8, volumeKg: 36000, gradeAUSD: 3.35, gradeBUSD: 2.70, processingUSD: 1.40 },
  { id: 'RAW-50', name: 'Garlic (Consumed Raw Health)', category: 'Vegetable', priceTodayUSD: 4.60, price7dUSD: 4.50, price30dUSD: 4.35, price90dUSD: 4.10, price1YrUSD: 3.95, changeToday: 1.4, change7d: 2.2, volumeKg: 29000, gradeAUSD: 5.30, gradeBUSD: 4.25, processingUSD: 2.40 },
  { id: 'RAW-51', name: 'Ginger (Juice / Raw Shreds)', category: 'Vegetable', priceTodayUSD: 3.85, price7dUSD: 3.75, price30dUSD: 3.65, price90dUSD: 3.45, price1YrUSD: 3.30, changeToday: 1.1, change7d: 2.7, volumeKg: 31000, gradeAUSD: 4.40, gradeBUSD: 3.55, processingUSD: 1.90 },
  { id: 'RAW-52', name: 'Iceberg Lettuce (Crisp Head)', category: 'Vegetable', priceTodayUSD: 2.10, price7dUSD: 2.05, price30dUSD: 1.98, price90dUSD: 1.88, price1YrUSD: 1.80, changeToday: 0.8, change7d: 2.4, volumeKg: 42000, gradeAUSD: 2.45, gradeBUSD: 1.95, processingUSD: 1.00 },
  { id: 'RAW-53', name: 'Romaine Lettuce (Green Leaf)', category: 'Vegetable', priceTodayUSD: 2.40, price7dUSD: 2.35, price30dUSD: 2.28, price90dUSD: 2.18, price1YrUSD: 2.10, changeToday: 0.9, change7d: 2.1, volumeKg: 38000, gradeAUSD: 2.80, gradeBUSD: 2.25, processingUSD: 1.15 },
  { id: 'RAW-54', name: 'Spinach (Baby Spinach Raw Salad)', category: 'Vegetable', priceTodayUSD: 3.20, price7dUSD: 3.15, price30dUSD: 3.10, price90dUSD: 3.00, price1YrUSD: 2.90, changeToday: 0.8, change7d: 1.6, volumeKg: 28000, gradeAUSD: 3.75, gradeBUSD: 2.95, processingUSD: 1.60 },
  { id: 'RAW-55', name: 'Cabbage (Shredded Raw Slaw)', category: 'Vegetable', priceTodayUSD: 0.85, price7dUSD: 0.84, price30dUSD: 0.82, price90dUSD: 0.78, price1YrUSD: 0.74, changeToday: 0.4, change7d: 1.2, volumeKg: 96000, gradeAUSD: 1.05, gradeBUSD: 0.80, processingUSD: 0.40 },
  { id: 'RAW-56', name: 'Purple Cabbage (Red Raw Slaw)', category: 'Vegetable', priceTodayUSD: 1.15, price7dUSD: 1.12, price30dUSD: 1.08, price90dUSD: 1.02, price1YrUSD: 0.98, changeToday: 0.6, change7d: 2.7, volumeKg: 42000, gradeAUSD: 1.38, gradeBUSD: 1.08, processingUSD: 0.55 },
  { id: 'RAW-57', name: 'Beetroot (Fresh Raw Bulb)', category: 'Vegetable', priceTodayUSD: 1.40, price7dUSD: 1.38, price30dUSD: 1.34, price90dUSD: 1.28, price1YrUSD: 1.22, changeToday: 0.6, change7d: 1.4, volumeKg: 48000, gradeAUSD: 1.65, gradeBUSD: 1.30, processingUSD: 0.68 },
  { id: 'RAW-58', name: 'Celery (Crunchy Raw Stalks)', category: 'Vegetable', priceTodayUSD: 1.80, price7dUSD: 1.76, price30dUSD: 1.70, price90dUSD: 1.62, price1YrUSD: 1.55, changeToday: 0.7, change7d: 2.3, volumeKg: 39000, gradeAUSD: 2.10, gradeBUSD: 1.68, processingUSD: 0.88 },
  { id: 'RAW-59', name: 'Zucchini (Green Raw Summer Squash)', category: 'Vegetable', priceTodayUSD: 2.05, price7dUSD: 2.00, price30dUSD: 1.95, price90dUSD: 1.85, price1YrUSD: 1.78, changeToday: 0.8, change7d: 2.5, volumeKg: 41000, gradeAUSD: 2.40, gradeBUSD: 1.90, processingUSD: 1.00 },
  { id: 'RAW-60', name: 'Broccoli (Florets Raw with Dips)', category: 'Vegetable', priceTodayUSD: 2.75, price7dUSD: 2.70, price30dUSD: 2.65, price90dUSD: 2.55, price1YrUSD: 2.45, changeToday: 0.9, change7d: 1.9, volumeKg: 46000, gradeAUSD: 3.20, gradeBUSD: 2.55, processingUSD: 1.40 },
  { id: 'RAW-61', name: 'Cauliflower (Florets Raw Salad)', category: 'Vegetable', priceTodayUSD: 1.65, price7dUSD: 1.62, price30dUSD: 1.58, price90dUSD: 1.50, price1YrUSD: 1.44, changeToday: 0.7, change7d: 1.9, volumeKg: 58000, gradeAUSD: 1.95, gradeBUSD: 1.55, processingUSD: 0.80 },
  { id: 'RAW-62', name: 'Sweet Corn (Tender Raw Kernels)', category: 'Vegetable', priceTodayUSD: 1.25, price7dUSD: 1.22, price30dUSD: 1.18, price90dUSD: 1.12, price1YrUSD: 1.08, changeToday: 0.6, change7d: 2.5, volumeKg: 68000, gradeAUSD: 1.50, gradeBUSD: 1.18, processingUSD: 0.62 },
  { id: 'RAW-63', name: 'Green Peas (Fresh Sweet Raw Pods)', category: 'Vegetable', priceTodayUSD: 2.95, price7dUSD: 2.90, price30dUSD: 2.82, price90dUSD: 2.70, price1YrUSD: 2.60, changeToday: 0.8, change7d: 1.7, volumeKg: 32000, gradeAUSD: 3.45, gradeBUSD: 2.75, processingUSD: 1.45 },
  { id: 'RAW-64', name: 'Turnip (Shalgam White Root)', category: 'Vegetable', priceTodayUSD: 1.10, price7dUSD: 1.08, price30dUSD: 1.04, price90dUSD: 0.98, price1YrUSD: 0.94, changeToday: 0.5, change7d: 1.9, volumeKg: 44000, gradeAUSD: 1.30, gradeBUSD: 1.02, processingUSD: 0.52 },
  { id: 'RAW-65', name: 'Asparagus (Tender Raw Tips)', category: 'Vegetable', priceTodayUSD: 7.40, price7dUSD: 7.10, price30dUSD: 6.80, price90dUSD: 6.30, price1YrUSD: 6.00, changeToday: 1.8, change7d: 4.2, volumeKg: 14000, gradeAUSD: 8.60, gradeBUSD: 6.80, processingUSD: 3.60 },
  { id: 'RAW-66', name: 'Fennel Bulb (Anise Crisp Raw)', category: 'Vegetable', priceTodayUSD: 3.50, price7dUSD: 3.40, price30dUSD: 3.28, price90dUSD: 3.10, price1YrUSD: 2.95, changeToday: 1.0, change7d: 2.9, volumeKg: 17000, gradeAUSD: 4.10, gradeBUSD: 3.25, processingUSD: 1.70 },
  { id: 'RAW-67', name: 'Kale (Curly Green Raw Leaf)', category: 'Vegetable', priceTodayUSD: 3.80, price7dUSD: 3.70, price30dUSD: 3.60, price90dUSD: 3.45, price1YrUSD: 3.30, changeToday: 1.1, change7d: 2.7, volumeKg: 24000, gradeAUSD: 4.40, gradeBUSD: 3.55, processingUSD: 1.85 },
  { id: 'RAW-68', name: 'Rocket Leaves (Arugula Peppery)', category: 'Vegetable', priceTodayUSD: 6.50, price7dUSD: 6.30, price30dUSD: 6.00, price90dUSD: 5.60, price1YrUSD: 5.40, changeToday: 1.5, change7d: 3.2, volumeKg: 12000, gradeAUSD: 7.50, gradeBUSD: 6.00, processingUSD: 3.10 },
  { id: 'RAW-69', name: 'Bok Choy (Tender Inner Leaves)', category: 'Vegetable', priceTodayUSD: 2.60, price7dUSD: 2.55, price30dUSD: 2.48, price90dUSD: 2.35, price1YrUSD: 2.25, changeToday: 0.8, change7d: 2.0, volumeKg: 29000, gradeAUSD: 3.05, gradeBUSD: 2.45, processingUSD: 1.25 },
  { id: 'RAW-70', name: 'Watercress (Fresh Peppery Leaf)', category: 'Vegetable', priceTodayUSD: 5.90, price7dUSD: 5.70, price30dUSD: 5.45, price90dUSD: 5.10, price1YrUSD: 4.90, changeToday: 1.4, change7d: 3.5, volumeKg: 11000, gradeAUSD: 6.80, gradeBUSD: 5.40, processingUSD: 2.80 },
  { id: 'RAW-71', name: 'Radicchio (Bitter Crisp Head)', category: 'Vegetable', priceTodayUSD: 4.80, price7dUSD: 4.65, price30dUSD: 4.45, price90dUSD: 4.20, price1YrUSD: 4.00, changeToday: 1.2, change7d: 3.2, volumeKg: 13000, gradeAUSD: 5.60, gradeBUSD: 4.40, processingUSD: 2.30 },
  { id: 'RAW-72', name: 'Cherry Tomatoes (Sweet Vine Raw)', category: 'Vegetable', priceTodayUSD: 4.20, price7dUSD: 4.10, price30dUSD: 3.95, price90dUSD: 3.75, price1YrUSD: 3.60, changeToday: 1.0, change7d: 2.4, volumeKg: 31000, gradeAUSD: 4.90, gradeBUSD: 3.90, processingUSD: 2.05 },
  { id: 'RAW-73', name: 'Gherkins (Crunchy Mini Pickling)', category: 'Vegetable', priceTodayUSD: 2.85, price7dUSD: 2.80, price30dUSD: 2.72, price90dUSD: 2.60, price1YrUSD: 2.50, changeToday: 0.8, change7d: 1.8, volumeKg: 22000, gradeAUSD: 3.35, gradeBUSD: 2.65, processingUSD: 1.35 },

  // HERBS & LIVING SPROUTS (5 items)
  { id: 'RAW-74', name: 'Coriander Leaves (Dhaniya Fresh)', category: 'Herbs & Sprouts', priceTodayUSD: 3.10, price7dUSD: 3.05, price30dUSD: 2.95, price90dUSD: 2.80, price1YrUSD: 2.70, changeToday: 0.8, change7d: 1.6, volumeKg: 34000, gradeAUSD: 3.65, gradeBUSD: 2.88, processingUSD: 1.45 },
  { id: 'RAW-75', name: 'Mint Leaves (Pudina Fragrant)', category: 'Herbs & Sprouts', priceTodayUSD: 3.60, price7dUSD: 3.50, price30dUSD: 3.38, price90dUSD: 3.20, price1YrUSD: 3.05, changeToday: 1.1, change7d: 2.9, volumeKg: 28000, gradeAUSD: 4.20, gradeBUSD: 3.35, processingUSD: 1.70 },
  { id: 'RAW-76', name: 'Mung Bean Sprouts (Raw Living)', category: 'Herbs & Sprouts', priceTodayUSD: 2.40, price7dUSD: 2.35, price30dUSD: 2.28, price90dUSD: 2.18, price1YrUSD: 2.10, changeToday: 0.7, change7d: 2.1, volumeKg: 36000, gradeAUSD: 2.80, gradeBUSD: 2.25, processingUSD: 1.15 },
  { id: 'RAW-77', name: 'Alfalfa Sprouts (Fresh Salad)', category: 'Herbs & Sprouts', priceTodayUSD: 8.50, price7dUSD: 8.20, price30dUSD: 7.90, price90dUSD: 7.40, price1YrUSD: 7.10, changeToday: 1.8, change7d: 3.7, volumeKg: 9000, gradeAUSD: 9.80, gradeBUSD: 7.80, processingUSD: 4.10 },
  { id: 'RAW-78', name: 'Chickpea Sprouts (Kala Chana)', category: 'Herbs & Sprouts', priceTodayUSD: 2.70, price7dUSD: 2.65, price30dUSD: 2.58, price90dUSD: 2.45, price1YrUSD: 2.35, changeToday: 0.8, change7d: 1.9, volumeKg: 29000, gradeAUSD: 3.15, gradeBUSD: 2.50, processingUSD: 1.30 },

  // RAW DAIRY & SEAFOOD (7 items)
  { id: 'RAW-79', name: 'Raw / Unpasteurised Cow Milk', category: 'Raw Dairy & Seafood', priceTodayUSD: 1.45, price7dUSD: 1.44, price30dUSD: 1.42, price90dUSD: 1.38, price1YrUSD: 1.35, changeToday: 0.4, change7d: 0.7, volumeKg: 180000, gradeAUSD: 1.75, gradeBUSD: 1.38, processingUSD: 0.75 },
  { id: 'RAW-80', name: 'Raw / Unpasteurised Goat Milk', category: 'Raw Dairy & Seafood', priceTodayUSD: 2.80, price7dUSD: 2.75, price30dUSD: 2.70, price90dUSD: 2.60, price1YrUSD: 2.52, changeToday: 0.7, change7d: 1.8, volumeKg: 46000, gradeAUSD: 3.30, gradeBUSD: 2.65, processingUSD: 1.40 },
  { id: 'RAW-81', name: 'Tuna (Sushi / Sashimi Grade)', category: 'Raw Dairy & Seafood', priceTodayUSD: 28.50, price7dUSD: 27.80, price30dUSD: 26.90, price90dUSD: 25.50, price1YrUSD: 24.80, changeToday: 2.5, change7d: 2.5, volumeKg: 8500, gradeAUSD: 34.00, gradeBUSD: 26.50, processingUSD: 14.00 },
  { id: 'RAW-82', name: 'Salmon (Sushi / Sashimi Grade)', category: 'Raw Dairy & Seafood', priceTodayUSD: 24.00, price7dUSD: 23.50, price30dUSD: 22.80, price90dUSD: 21.60, price1YrUSD: 21.00, changeToday: 2.1, change7d: 2.1, volumeKg: 12000, gradeAUSD: 28.50, gradeBUSD: 22.50, processingUSD: 12.00 },
  { id: 'RAW-83', name: 'Oysters (Eaten Raw Half Shell)', category: 'Raw Dairy & Seafood', priceTodayUSD: 18.50, price7dUSD: 18.10, price30dUSD: 17.50, price90dUSD: 16.60, price1YrUSD: 16.00, changeToday: 1.8, change7d: 2.2, volumeKg: 9500, gradeAUSD: 21.80, gradeBUSD: 17.20, processingUSD: 9.00 },
  { id: 'RAW-84', name: 'Raw Egg Yolk (Fresh Culinary)', category: 'Raw Dairy & Seafood', priceTodayUSD: 5.20, price7dUSD: 5.10, price30dUSD: 4.95, price90dUSD: 4.70, price1YrUSD: 4.50, changeToday: 1.1, change7d: 2.0, volumeKg: 28000, gradeAUSD: 6.10, gradeBUSD: 4.85, processingUSD: 2.60 },
  { id: 'RAW-85', name: 'Raw-Milk Cheese (Artisan Feta / Brie)', category: 'Raw Dairy & Seafood', priceTodayUSD: 16.80, price7dUSD: 16.40, price30dUSD: 15.90, price90dUSD: 15.10, price1YrUSD: 14.60, changeToday: 1.5, change7d: 2.4, volumeKg: 11000, gradeAUSD: 19.50, gradeBUSD: 15.60, processingUSD: 8.40 },
];
