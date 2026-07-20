import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { 
  TrendingUp, TrendingDown, 
  ArrowUpRight, Eye, DollarSign, Tag, Package,
  Search, Globe, MapPin, Calendar, RefreshCw, Activity, Radio
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { useInspectionStore } from '../store/inspectionStore';

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

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { recentInspections, activeBatchNo, setActiveInspection } = useInspectionStore();

  // Geographical selection states
  const [selectedCountry, setSelectedCountry] = useState<string>('India');
  const [selectedState, setSelectedState] = useState<string>('All States & Regions');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('All Districts (National Average)');

  // Currency selection state
  const [selectedCurrencyCode, setSelectedCurrencyCode] = useState<string>('INR');

  // Global search & category filtering
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('All');

  // Active searched / selected food item for the dedicated Price Bar Chart
  const [selectedRawFoodId, setSelectedRawFoodId] = useState<string>('RAW-01');

  // Comparison view mode for the general overview chart
  const [chartMetric, setChartMetric] = useState<'priceHistory' | 'gradeComparison' | 'volumeValuation'>('priceHistory');

  // Current Country & State helpers
  const currentCountryObj = REGIONAL_HIERARCHY[selectedCountry] || REGIONAL_HIERARCHY['United States'];

  // Handle Country Change -> update state & district defaults
  const handleCountryChange = (countryName: string) => {
    setSelectedCountry(countryName);
    setSelectedState('All States & Regions');
    setSelectedDistrict('All Districts (National Average)');
  };

  // Handle State Change -> update district default
  const handleStateChange = (stateName: string) => {
    setSelectedState(stateName);
    if (stateName === 'All States & Regions') {
      setSelectedDistrict('All Districts (National Average)');
    } else {
      const st = currentCountryObj.states.find(s => s.name === stateName);
      if (st && st.districts.length > 0) {
        setSelectedDistrict('All Districts (National Average)');
      }
    }
  };

  // Calculate local district price multiplier
  const districtMultiplier = useMemo(() => {
    if (selectedDistrict === 'All Districts (National Average)') return 1.0;
    for (const st of currentCountryObj.states) {
      const dst = st.districts.find(d => d.name === selectedDistrict);
      if (dst) return dst.multiplier;
    }
    return 1.0;
  }, [currentCountryObj, selectedState, selectedDistrict]);

  // Current Currency object
  const currency = CURRENCY_RATES[selectedCurrencyCode] || CURRENCY_RATES['USD'];

  // Helper function to convert base USD price to local regional currency price
  const convertPrice = (usdPrice: number) => {
    return usdPrice * districtMultiplier * currency.agriRate;
  };

  // Day-to-Day Simulation & Live Price Ticker State
  const [marketDateOffset, setMarketDateOffset] = useState<number>(0);
  const [liveTickerPulse, setLiveTickerPulse] = useState<number>(0);
  const [isLiveFeedEnabled, setIsLiveFeedEnabled] = useState<boolean>(true);
  const [lastSyncTime, setLastSyncTime] = useState<string>(new Date().toLocaleTimeString());

  useEffect(() => {
    if (!isLiveFeedEnabled) return;
    const interval = setInterval(() => {
      setLiveTickerPulse((prev) => prev + 1);
      setLastSyncTime(new Date().toLocaleTimeString());
    }, 4000);
    return () => clearInterval(interval);
  }, [isLiveFeedEnabled]);

  const activeMarketDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + marketDateOffset);
    return d;
  }, [marketDateOffset]);

  // Dynamically calculated real-time & day-to-day wholesale spot prices for all 85 raw food items
  const dynamicRawFoodItems = useMemo(() => {
    const daySeed = activeMarketDate.getFullYear() * 1000 + (activeMarketDate.getMonth() + 1) * 100 + activeMarketDate.getDate();
    return GLOBAL_RAW_FOOD_ITEMS.map((item, idx) => {
      const dayFactor = Math.sin((daySeed + idx * 17) * 0.13) * 0.07;
      const pulseFactor = isLiveFeedEnabled ? Math.cos((liveTickerPulse + idx * 7) * 0.45) * 0.015 : 0;
      const totalFactor = 1 + dayFactor + pulseFactor;

      const updatedToday = Number((item.priceTodayUSD * totalFactor).toFixed(2));
      const updatedChangeToday = Number((item.changeToday + dayFactor * 100 + pulseFactor * 40).toFixed(1));
      const updatedVolume = Math.round(item.volumeKg * (1 + Math.sin(daySeed + idx) * 0.18));

      return {
        ...item,
        priceTodayUSD: updatedToday,
        changeToday: updatedChangeToday,
        volumeKg: updatedVolume,
        gradeAUSD: Number((item.gradeAUSD * totalFactor).toFixed(2)),
        gradeBUSD: Number((item.gradeBUSD * totalFactor).toFixed(2)),
        processingUSD: Number((item.processingUSD * totalFactor).toFixed(2)),
      };
    });
  }, [activeMarketDate, liveTickerPulse, isLiveFeedEnabled]);

  // Filtered raw food items based on Search Bar and Category filter
  const filteredRawFoodItems = useMemo(() => {
    return dynamicRawFoodItems.filter((item) => {
      const matchesSearch = searchQuery.trim() === '' || 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategoryFilter === 'All' || item.category === selectedCategoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [dynamicRawFoodItems, searchQuery, selectedCategoryFilter]);

  // Selected item object for dedicated search bar chart
  const activeSearchedItem = useMemo(() => {
    return dynamicRawFoodItems.find(item => item.id === selectedRawFoodId) || dynamicRawFoodItems[0];
  }, [dynamicRawFoodItems, selectedRawFoodId]);

  // Data for DEDICATED SEARCHED RAW FOOD ITEM PRICE BAR CHART
  const activeSearchedBarData = useMemo(() => {
    return [
      { period: 'Today Spot', price: Number(convertPrice(activeSearchedItem.priceTodayUSD).toFixed(2)) },
      { period: '7-Day Avg', price: Number(convertPrice(activeSearchedItem.price7dUSD).toFixed(2)) },
      { period: '30-Day Avg', price: Number(convertPrice(activeSearchedItem.price30dUSD).toFixed(2)) },
      { period: '90-Day Avg', price: Number(convertPrice(activeSearchedItem.price90dUSD).toFixed(2)) },
      { period: '1-Year Avg', price: Number(convertPrice(activeSearchedItem.price1YrUSD).toFixed(2)) },
    ];
  }, [activeSearchedItem, districtMultiplier, currency]);

  // Regional comparison across districts in selected state for the searched item
  const searchedDistrictBarData = useMemo(() => {
    const st = currentCountryObj.states.find(s => s.name === selectedState) || currentCountryObj.states[0];
    return st.districts.slice(0, 10).map(dst => ({
      mandiName: dst.name.split(' ')[0],
      fullName: dst.name,
      price: Number((activeSearchedItem.priceTodayUSD * dst.multiplier * currency.agriRate).toFixed(2))
    }));
  }, [currentCountryObj, selectedState, activeSearchedItem, currency]);

  // Quality Grade Breakdown for active searched item
  const searchedGradeBarData = useMemo(() => {
    return [
      { grade: 'Grade A Premium', price: Number(convertPrice(activeSearchedItem.gradeAUSD).toFixed(2)) },
      { grade: 'Grade B Domestic', price: Number(convertPrice(activeSearchedItem.gradeBUSD).toFixed(2)) },
      { grade: 'Processing Puree', price: Number(convertPrice(activeSearchedItem.processingUSD).toFixed(2)) },
    ];
  }, [activeSearchedItem, districtMultiplier, currency]);

  // General chart data for top items in converted currency
  const priceHistoryBarData = useMemo(() => {
    return filteredRawFoodItems.slice(0, 10).map(item => ({
      name: item.name.split(' ')[0],
      fullName: item.name,
      Today: Number(convertPrice(item.priceTodayUSD).toFixed(2)),
      Past7Days: Number(convertPrice(item.price7dUSD).toFixed(2)),
      Past30Days: Number(convertPrice(item.price30dUSD).toFixed(2)),
      Past90Days: Number(convertPrice(item.price90dUSD).toFixed(2)),
    }));
  }, [filteredRawFoodItems, districtMultiplier, currency]);

  const gradeComparisonBarData = useMemo(() => {
    return filteredRawFoodItems.slice(0, 10).map(item => ({
      name: item.name.split(' ')[0],
      fullName: item.name,
      GradeA: Number(convertPrice(item.gradeAUSD).toFixed(2)),
      GradeB: Number(convertPrice(item.gradeBUSD).toFixed(2)),
      Processing: Number(convertPrice(item.processingUSD).toFixed(2)),
    }));
  }, [filteredRawFoodItems, districtMultiplier, currency]);

  const volumeValuationBarData = useMemo(() => {
    return filteredRawFoodItems.slice(0, 10).map(item => ({
      name: item.name.split(' ')[0],
      fullName: item.name,
      VolumeTons: Math.round(item.volumeKg / 1000),
      ValueCurr: Math.round((item.volumeKg * convertPrice(item.priceTodayUSD)) / 1000),
    }));
  }, [filteredRawFoodItems, districtMultiplier, currency]);

  // Dynamic KPI calculations
  const totalInspectedVolumeKg = useMemo(() => {
    return dynamicRawFoodItems.reduce((acc, i) => acc + i.volumeKg, 0) + recentInspections.length * 150;
  }, [dynamicRawFoodItems, recentInspections]);

  const totalSpotValuationCurr = useMemo(() => {
    return dynamicRawFoodItems.reduce((acc, i) => acc + (i.volumeKg * convertPrice(i.priceTodayUSD)), 0);
  }, [dynamicRawFoodItems, districtMultiplier, currency]);

  // Approximate Price & Batch Summary Math calculations
  const approxBatchSummary = useMemo(() => {
    const count = Math.max(1, recentInspections.length);
    const estimatedTotalWeightKg = count * 250; // approx 250 kg per inspected batch tray/box
    const avgGrade = count > 0 ? (recentInspections.filter(r => r.metrics.quality_grade === 'A').length / count) : 0.7;
    const avgPricePerKg = convertPrice(activeSearchedItem.priceTodayUSD);
    const totalEstimatedBatchValue = estimatedTotalWeightKg * avgPricePerKg;
    const gradeAPremiumValue = totalEstimatedBatchValue * (avgGrade * 1.25);
    const quarantineSavedValue = estimatedTotalWeightKg * 0.08 * avgPricePerKg; // 8% average quarantine interception savings

    return {
      estimatedTotalWeightKg,
      avgPricePerKg,
      totalEstimatedBatchValue,
      gradeAPremiumValue,
      quarantineSavedValue
    };
  }, [recentInspections, activeSearchedItem, districtMultiplier, currency]);

  const categoriesList = ['All', 'Fruit', 'Vegetable', 'Herbs & Sprouts', 'Raw Dairy & Seafood', 'Grain & Cereals', 'Nuts & Seeds', 'Spices'];

  // Match live spot price for line feed records
  const getPriceForItem = (foodType: string, grade: string) => {
    const match = dynamicRawFoodItems.find(item => 
      foodType.toLowerCase().includes(item.name.split(' ')[0].toLowerCase())
    );
    const base = !match ? (grade === 'A' ? 3.50 : grade === 'B' ? 2.80 : 1.50) : (
      grade === 'A' ? match.gradeAUSD : grade === 'B' ? match.gradeBUSD : match.processingUSD
    );
    return convertPrice(base);
  };

  const handleInspectRecord = (record: any) => {
    setActiveInspection(record);
    navigate('/result');
  };

  return (
    <div className="space-y-8 pb-14">
      {/* 1. Header & Live Global Status Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 p-6 rounded-3xl border border-white/10 shadow-2xl">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
              Live Agricultural &amp; Commodity Price Dashboard
            </h1>
            <Badge label="REAL-WORLD WHOLESALE MANDIS" variant="success" glow />
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1.5 flex items-center gap-2">
            <Globe className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>Real-time wholesale agricultural pricing across every State &amp; District Mandi with instantaneous purchasing power conversion</span>
          </p>
        </div>

        {/* Currency Selector Bar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-900 px-3.5 py-2.5 rounded-2xl border border-white/10 shadow">
            <DollarSign className="h-4 w-4 text-emerald-400" />
            <span className="text-xs font-mono text-slate-300 font-bold">CURRENCY:</span>
            <select
              value={selectedCurrencyCode}
              onChange={(e) => setSelectedCurrencyCode(e.target.value)}
              className="bg-slate-950 text-emerald-400 font-mono font-extrabold text-xs rounded-xl px-2.5 py-1.5 border border-white/15 focus:outline-none focus:border-emerald-500"
            >
              {Object.values(CURRENCY_RATES).map((curr) => (
                <option key={curr.code} value={curr.code}>
                  {curr.code} ({curr.symbol})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 1.1 Live Day-to-Day Dynamic Market Ticker & Calendar Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950/90 p-4 rounded-2xl border border-emerald-500/30 shadow-lg">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 bg-emerald-950/60 border border-emerald-500/40 px-3.5 py-1.5 rounded-xl">
            <Radio className="h-4 w-4 text-emerald-400 animate-pulse" />
            <span className="text-xs font-mono font-extrabold text-emerald-300">
              LIVE SPOT FEED ONLINE
            </span>
            <span className="text-[10px] font-mono text-emerald-400">({lastSyncTime})</span>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
            <Calendar className="h-4 w-4 text-sky-400" />
            <span>MARKET DATE:</span>
            <span className="font-bold text-sky-300">
              {activeMarketDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
            {marketDateOffset !== 0 && (
              <span className="text-[10px] bg-sky-950/80 border border-sky-500/40 text-sky-400 px-1.5 py-0.5 rounded">
                +{marketDateOffset}d simulated
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsLiveFeedEnabled(!isLiveFeedEnabled)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold border transition-all flex items-center gap-1.5 ${
              isLiveFeedEnabled 
                ? 'bg-emerald-900/50 border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/70' 
                : 'bg-slate-900 border-white/10 text-slate-400 hover:bg-slate-800'
            }`}
          >
            <Activity className="h-3.5 w-3.5" />
            {isLiveFeedEnabled ? 'REAL-TIME PULSE ON' : 'PULSE PAUSED'}
          </button>

          <button
            onClick={() => setMarketDateOffset(prev => prev + 1)}
            className="px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold bg-sky-600/20 hover:bg-sky-600/30 border border-sky-500/40 text-sky-300 transition-all flex items-center gap-1.5 shadow-sm"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            ADVANCE DAY (+24H)
          </button>

          {marketDateOffset !== 0 && (
            <button
              onClick={() => setMarketDateOffset(0)}
              className="px-2.5 py-1.5 rounded-xl text-xs font-mono text-slate-400 hover:text-slate-200 border border-white/10 bg-slate-900/60 transition-all"
            >
              RESET TODAY
            </button>
          )}
        </div>
      </div>

      {/* 2. APPROXIMATE PRICE & FINANCIAL VALUATION SUMMARY CONSOLE (NEW SUMMARY ENGINE) */}
      <Card 
        title="Approximate Price & Live Shift Valuation Summary" 
        subtitle={`Real-time financial synthesis of active shift batch (${activeBatchNo}) in ${currency.name} for ${selectedDistrict}`}
        className="border-2 border-emerald-500/40 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/30 shadow-2xl"
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 pt-2 font-mono">
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-emerald-500/30 space-y-1.5 shadow">
            <span className="text-[10px] text-slate-400 block uppercase font-bold">Approx. Spot Price ({activeSearchedItem.name})</span>
            <span className="text-2xl font-extrabold text-emerald-400 block">
              {currency.symbol}{approxBatchSummary.avgPricePerKg.toFixed(2)} / kg
            </span>
            <span className="text-[11px] text-slate-300 block">
              Box (20kg): <strong className="text-white">{currency.symbol}{(approxBatchSummary.avgPricePerKg * 20).toFixed(2)}</strong>
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/90 border border-blue-500/30 space-y-1.5 shadow">
            <span className="text-[10px] text-slate-400 block uppercase font-bold">Estimated Batch Weight</span>
            <span className="text-2xl font-extrabold text-blue-400 block">
              {approxBatchSummary.estimatedTotalWeightKg.toLocaleString()} kg
            </span>
            <span className="text-[11px] text-slate-300 block">
              Shift Inspected: <strong className="text-white">{recentInspections.length} Trays / Pallets</strong>
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/90 border border-purple-500/30 space-y-1.5 shadow">
            <span className="text-[10px] text-slate-400 block uppercase font-bold">Approx. Total Batch Worth</span>
            <span className="text-2xl font-extrabold text-purple-400 block">
              {currency.symbol}{approxBatchSummary.totalEstimatedBatchValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
            <span className="text-[11px] text-slate-300 block">
              Grade A Tier: <strong className="text-emerald-400">{currency.symbol}{approxBatchSummary.gradeAPremiumValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</strong>
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/90 border border-amber-500/30 space-y-1.5 shadow">
            <span className="text-[10px] text-slate-400 block uppercase font-bold">Quarantine Interception Value</span>
            <span className="text-2xl font-extrabold text-amber-400 block">
              {currency.symbol}{approxBatchSummary.quarantineSavedValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
            <span className="text-[11px] text-emerald-400 font-bold block">
              ✅ Protected against export rejection loss
            </span>
          </div>
        </div>
      </Card>

      {/* 3. REGIONAL GEO-SELECTOR: Country -> State -> Expanded District Mandis */}
      <Card className="p-6 border-emerald-500/30 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/20 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <MapPin className="h-5 w-5 text-emerald-400 shrink-0" />
            <div>
              <h3 className="text-base font-extrabold text-slate-100 font-mono uppercase tracking-wider">
                Regional Mandi &amp; Comprehensive District Location Selector
              </h3>
              <p className="text-xs text-slate-400">Select any country, state, and specific district mandi to adjust live market indices</p>
            </div>
          </div>
          <div className="text-xs font-mono text-emerald-300 bg-emerald-950/80 border border-emerald-500/40 px-3 py-1.5 rounded-xl font-extrabold shrink-0 shadow">
            LOCAL PRICE INDEX: {(districtMultiplier * 100).toFixed(1)}% OF NATIONAL SPOT
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          {/* Country Select */}
          <div className="space-y-2">
            <label className="block text-xs font-mono font-bold text-slate-300">1. SELECT COUNTRY</label>
            <select
              value={selectedCountry}
              onChange={(e) => handleCountryChange(e.target.value)}
              className="w-full bg-slate-950 text-slate-100 text-sm font-bold rounded-xl px-4 py-3 border border-white/15 focus:outline-none focus:border-emerald-500 shadow-inner"
            >
              {Object.keys(REGIONAL_HIERARCHY).map((country) => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
          </div>

          {/* State / Province Select */}
          <div className="space-y-2">
            <label className="block text-xs font-mono font-bold text-slate-300">2. SELECT STATE / REGION</label>
            <select
              value={selectedState}
              onChange={(e) => handleStateChange(e.target.value)}
              className="w-full bg-slate-950 text-slate-100 text-sm font-bold rounded-xl px-4 py-3 border border-white/15 focus:outline-none focus:border-emerald-500 shadow-inner"
            >
              <option value="All States & Regions">All States &amp; Regions (National View)</option>
              {currentCountryObj.states.map((st) => (
                <option key={st.name} value={st.name}>{st.name}</option>
              ))}
            </select>
          </div>

          {/* District / Wholesale Mandi Select - Fully Expanded across all districts */}
          <div className="space-y-2">
            <label className="block text-xs font-mono font-bold text-emerald-400">
              3. SELECT DISTRICT / WHOLESALE MANDI ({selectedState === 'All States & Regions' ? currentCountryObj.states.reduce((acc, s) => acc + s.districts.length, 0) : (currentCountryObj.states.find(s => s.name === selectedState)?.districts.length || 0)} Available)
            </label>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full bg-slate-950 text-emerald-400 font-extrabold text-sm rounded-xl px-4 py-3 border-2 border-emerald-500/40 focus:outline-none focus:border-emerald-500 shadow-inner"
            >
              <option value="All Districts (National Average)">All Districts (National Average)</option>
              {selectedState === 'All States & Regions' ? (
                currentCountryObj.states.flatMap((st) =>
                  st.districts.map((dst) => (
                    <option key={`${st.name}-${dst.name}`} value={dst.name}>
                      {dst.name} [{st.name}] ({dst.multiplier > 1 ? `+${((dst.multiplier - 1) * 100).toFixed(0)}%` : `${((dst.multiplier - 1) * 100).toFixed(0)}%`})
                    </option>
                  ))
                )
              ) : (
                (currentCountryObj.states.find(s => s.name === selectedState) || currentCountryObj.states[0]).districts.map((dst) => (
                  <option key={dst.name} value={dst.name}>
                    {dst.name} ({dst.multiplier > 1 ? `+${((dst.multiplier - 1) * 100).toFixed(0)}%` : `${((dst.multiplier - 1) * 100).toFixed(0)}%`})
                  </option>
                ))
              )}
            </select>
          </div>
        </div>
      </Card>

      {/* 4. Global KPI Metrics Bar */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card hoverEffect className="relative overflow-hidden border-emerald-500/20">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs text-slate-400 font-mono uppercase font-bold">Worldwide Tracked Commodities</span>
              <h3 className="text-3xl font-extrabold text-slate-100 mt-1">{GLOBAL_RAW_FOOD_ITEMS.length} Items</h3>
              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-semibold mt-2">
                <ArrowUpRight className="h-3.5 w-3.5" /> 35+ Worldwide Agricultural Crops
              </span>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Globe className="h-6 w-6" />
            </div>
          </div>
        </Card>

        <Card hoverEffect className="relative overflow-hidden border-blue-500/20">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs text-slate-400 font-mono uppercase font-bold">Regional Spot Valuation</span>
              <h3 className="text-3xl font-extrabold text-blue-400 mt-1">
                {currency.symbol}{(totalSpotValuationCurr / 1000000).toFixed(2)}M
              </h3>
              <span className="text-[11px] text-slate-400 mt-2 block font-mono">
                Valued in {currency.code} ({selectedDistrict.split(' ')[0]})
              </span>
            </div>
            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <DollarSign className="h-6 w-6" />
            </div>
          </div>
        </Card>

        <Card hoverEffect className="relative overflow-hidden border-teal-500/20">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs text-slate-400 font-mono uppercase font-bold">Tracked Harvest Volume</span>
              <h3 className="text-3xl font-extrabold text-teal-400 mt-1">
                {(totalInspectedVolumeKg / 1000).toLocaleString()} <span className="text-sm font-normal text-slate-400">Tons</span>
              </h3>
              <span className="text-[11px] text-slate-400 mt-2 block font-mono">
                Active wholesale mandi volume
              </span>
            </div>
            <div className="p-3 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400">
              <Package className="h-6 w-6" />
            </div>
          </div>
        </Card>

        <Card hoverEffect className="relative overflow-hidden border-amber-500/20">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs text-slate-400 font-mono uppercase font-bold">Active Mandi Location</span>
              <h3 className="text-lg font-extrabold text-amber-400 mt-1 truncate">{selectedDistrict}</h3>
              <span className="text-[11px] text-emerald-400 font-semibold mt-1 block">
                {selectedState}, {selectedCountry}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <MapPin className="h-6 w-6" />
            </div>
          </div>
        </Card>
      </div>

      {/* 5. WORLDWIDE RAW FOOD SEARCH BAR & CATEGORY FILTER */}
      <Card className="p-6 border-white/10 bg-slate-950/90 shadow-2xl">
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-emerald-400" />
              <input
                type="text"
                placeholder={`Search any commodity worldwide (e.g. "Apple", "Tomato", "Wheat", "Banana", "Avocado")...`}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  const matches = GLOBAL_RAW_FOOD_ITEMS.filter(item => 
                    item.name.toLowerCase().includes(e.target.value.toLowerCase()) ||
                    item.category.toLowerCase().includes(e.target.value.toLowerCase())
                  );
                  if (matches.length > 0) {
                    setSelectedRawFoodId(matches[0].id);
                  }
                }}
                className="w-full bg-slate-900 text-slate-100 placeholder-slate-500 text-sm font-medium rounded-xl pl-12 pr-4 py-3.5 border border-white/10 focus:outline-none focus:border-emerald-500 transition-colors shadow-inner"
              />
            </div>

            {/* Category Filter Chips */}
            <div className="flex flex-wrap items-center gap-1.5">
              {categoriesList.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategoryFilter(cat)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    selectedCategoryFilter === cat
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 font-bold'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-white/5'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Fast item chip selector */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 border-t border-white/5">
            <span className="text-xs font-mono text-slate-400 shrink-0 font-bold">INSTANT PREVIEW:</span>
            {filteredRawFoodItems.slice(0, 15).map((item) => (
              <button
                key={item.id}
                onClick={() => setSelectedRawFoodId(item.id)}
                className={`px-3 py-1 rounded-lg text-xs font-mono transition-all shrink-0 ${
                  selectedRawFoodId === item.id
                    ? 'bg-blue-500 text-white font-bold shadow-md shadow-blue-500/30 border border-blue-400'
                    : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-white/10'
                }`}
              >
                {item.name} ({currency.symbol}{convertPrice(item.priceTodayUSD).toFixed(2)})
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* 6. DEDICATED SEPARATE PRICE BAR CHART FOR SEARCHED RAW FOOD ITEM */}
      <Card 
        title={`Dedicated Price Bar Chart for "${activeSearchedItem.name}"`}
        subtitle={`Live Spot Market Analysis for ${activeSearchedItem.name} in ${selectedDistrict}, ${selectedState} (${currency.name})`}
        className="border-2 border-emerald-500/40 bg-gradient-to-b from-slate-950 to-slate-900 shadow-2xl"
      >
        {/* Searched Item KPI Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-6 mb-6 border-b border-white/10 font-mono">
          <div className="bg-slate-900/90 p-3.5 rounded-xl border border-emerald-500/20">
            <span className="block text-[10px] text-slate-400 uppercase font-bold">Local Today Spot Price</span>
            <span className="text-2xl font-extrabold text-emerald-400 mt-1 block">
              {currency.symbol}{convertPrice(activeSearchedItem.priceTodayUSD).toFixed(2)} / kg
            </span>
          </div>

          <div className="bg-slate-900/90 p-3.5 rounded-xl border border-white/10">
            <span className="block text-[10px] text-slate-400 uppercase font-bold">7-Day Price Trend</span>
            <span className={`text-2xl font-extrabold mt-1 inline-flex items-center gap-1 ${
              activeSearchedItem.change7d >= 0 ? 'text-emerald-400' : 'text-red-400'
            }`}>
              {activeSearchedItem.change7d >= 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
              {activeSearchedItem.change7d >= 0 ? '+' : ''}{activeSearchedItem.change7d}%
            </span>
          </div>

          <div className="bg-slate-900/90 p-3.5 rounded-xl border border-white/10">
            <span className="block text-[10px] text-slate-400 uppercase font-bold">Grade A Premium ({currency.code})</span>
            <span className="text-2xl font-extrabold text-blue-400 mt-1 block">
              {currency.symbol}{convertPrice(activeSearchedItem.gradeAUSD).toFixed(2)} / kg
            </span>
          </div>

          <div className="bg-slate-900/90 p-3.5 rounded-xl border border-white/10">
            <span className="block text-[10px] text-slate-400 uppercase font-bold">Daily Market Turnover</span>
            <span className="text-2xl font-extrabold text-slate-200 mt-1 block">
              {(activeSearchedItem.volumeKg / 1000).toFixed(1)} Tons
            </span>
          </div>
        </div>

        {/* 3 Sub-Charts comparing Historical Trend, District Mandis, and Quality Grade */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Sub-Chart 1: Historical Timeline Bar Chart */}
          <div className="space-y-2">
            <h4 className="text-xs font-mono font-bold text-slate-300 uppercase">
              1. Historical Price Trend ({currency.code}/kg)
            </h4>
            <div className="h-64 w-full bg-slate-900/80 p-3 rounded-xl border border-white/5">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activeSearchedBarData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                  <XAxis dataKey="period" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} unit={` ${currency.symbol}`} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.15)', borderRadius: '8px', fontSize: '12px' }}
                    formatter={(val: any) => [`${currency.symbol}${Number(val).toFixed(2)} / kg`, 'Spot Price']}
                  />
                  <Bar dataKey="price" fill="#10b981" name={`${activeSearchedItem.name} (${currency.code})`} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Sub-Chart 2: Regional Mandi Comparison in Selected State */}
          <div className="space-y-2">
            <h4 className="text-xs font-mono font-bold text-slate-300 uppercase">
              2. District Mandis in {selectedState} ({currency.code}/kg)
            </h4>
            <div className="h-64 w-full bg-slate-900/80 p-3 rounded-xl border border-white/5">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={searchedDistrictBarData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                  <XAxis dataKey="mandiName" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} unit={` ${currency.symbol}`} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.15)', borderRadius: '8px', fontSize: '12px' }}
                    formatter={(val: any) => [`${currency.symbol}${Number(val).toFixed(2)} / kg`, 'District Price']}
                  />
                  <Bar dataKey="price" fill="#3b82f6" name="District Spot Price" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Sub-Chart 3: Quality Grade Differentiation */}
          <div className="space-y-2">
            <h4 className="text-xs font-mono font-bold text-slate-300 uppercase">
              3. Quality Grade Pricing Tier ({currency.code}/kg)
            </h4>
            <div className="h-64 w-full bg-slate-900/80 p-3 rounded-xl border border-white/5">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={searchedGradeBarData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                  <XAxis dataKey="grade" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} unit={` ${currency.symbol}`} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.15)', borderRadius: '8px', fontSize: '12px' }}
                    formatter={(val: any) => [`${currency.symbol}${Number(val).toFixed(2)} / kg`, 'Wholesale Tier']}
                  />
                  <Bar dataKey="price" fill="#8b5cf6" name="Quality Grade Price" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </Card>

      {/* 7. COMPARATIVE MARKET BAR CHARTS (All Searched / Filtered Items) */}
      <Card 
        title={`Comparative Market Price Index (${currency.code}/kg)`} 
        subtitle={`Showing real-world prices for top ${Math.min(10, filteredRawFoodItems.length)} matched commodities in ${selectedDistrict}, ${selectedState}`}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-emerald-400" />
            <span className="text-xs font-mono text-slate-300 font-bold">SELECT MARKET CHART VIEW:</span>
          </div>

          <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-xl border border-white/10 font-mono text-xs">
            <button
              onClick={() => setChartMetric('priceHistory')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                chartMetric === 'priceHistory' ? 'bg-emerald-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Today vs 7D vs 30D vs 90D ({currency.symbol}/kg)
            </button>
            <button
              onClick={() => setChartMetric('gradeComparison')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                chartMetric === 'gradeComparison' ? 'bg-blue-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Grade A vs Grade B vs Processing ({currency.symbol}/kg)
            </button>
            <button
              onClick={() => setChartMetric('volumeValuation')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                chartMetric === 'volumeValuation' ? 'bg-amber-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Volume (Tons) vs Total Market Value ({currency.code})
            </button>
          </div>
        </div>

        <div className="h-80 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            {chartMetric === 'priceHistory' ? (
              <BarChart data={priceHistoryBarData} margin={{ top: 15, right: 30, left: 10, bottom: 20 }}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} unit={` ${currency.symbol}`} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.15)', borderRadius: '10px', fontSize: '12px' }}
                  formatter={(val: any) => [`${currency.symbol}${Number(val).toFixed(2)}/kg`, '']}
                />
                <Legend wrapperStyle={{ paddingTop: '12px', fontSize: '12px' }} />
                <Bar dataKey="Today" fill="#10b981" name={`Today Spot (${currency.symbol}/kg)`} radius={[6, 6, 0, 0]} />
                <Bar dataKey="Past7Days" fill="#3b82f6" name={`7D Avg (${currency.symbol}/kg)`} radius={[6, 6, 0, 0]} />
                <Bar dataKey="Past30Days" fill="#8b5cf6" name={`30D Avg (${currency.symbol}/kg)`} radius={[6, 6, 0, 0]} />
                <Bar dataKey="Past90Days" fill="#64748b" name={`90D Avg (${currency.symbol}/kg)`} radius={[6, 6, 0, 0]} />
              </BarChart>
            ) : chartMetric === 'gradeComparison' ? (
              <BarChart data={gradeComparisonBarData} margin={{ top: 15, right: 30, left: 10, bottom: 20 }}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} unit={` ${currency.symbol}`} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.15)', borderRadius: '10px', fontSize: '12px' }}
                  formatter={(val: any) => [`${currency.symbol}${Number(val).toFixed(2)}/kg`, '']}
                />
                <Legend wrapperStyle={{ paddingTop: '12px', fontSize: '12px' }} />
                <Bar dataKey="GradeA" fill="#10b981" name={`Grade A Premium (${currency.symbol}/kg)`} radius={[6, 6, 0, 0]} />
                <Bar dataKey="GradeB" fill="#3b82f6" name={`Grade B Domestic (${currency.symbol}/kg)`} radius={[6, 6, 0, 0]} />
                <Bar dataKey="Processing" fill="#f59e0b" name={`Processing Puree (${currency.symbol}/kg)`} radius={[6, 6, 0, 0]} />
              </BarChart>
            ) : (
              <BarChart data={volumeValuationBarData} margin={{ top: 15, right: 30, left: 10, bottom: 20 }}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis yAxisId="left" stroke="#10b981" fontSize={11} unit="t" tickLine={false} axisLine={false} />
                <YAxis yAxisId="right" orientation="right" stroke="#3b82f6" fontSize={11} unit="k" tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.15)', borderRadius: '10px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ paddingTop: '12px', fontSize: '12px' }} />
                <Bar yAxisId="left" dataKey="VolumeTons" fill="#10b981" name="Volume (Tons)" radius={[6, 6, 0, 0]} />
                <Bar yAxisId="right" dataKey="ValueCurr" fill="#3b82f6" name={`Market Value (Thousands ${currency.code})`} radius={[6, 6, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </Card>

      {/* 8. COMPLETE WORLDWIDE RAW FOOD ITEM DIRECTORY & CURRENCY CONVERTER TABLE */}
      <Card 
        title={`Worldwide Raw Food Commodity Directory (${filteredRawFoodItems.length} Items Found)`}
        subtitle={`Prices converted to ${currency.name} for ${selectedDistrict}, ${selectedState}, ${selectedCountry}`}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                <th className="py-3 pl-3">Raw Food Item</th>
                <th className="py-3">Category</th>
                <th className="py-3 text-right">Today Spot ({currency.code}/kg)</th>
                <th className="py-3 text-right">7D Avg ({currency.code}/kg)</th>
                <th className="py-3 text-right">30D Avg ({currency.code}/kg)</th>
                <th className="py-3 text-right">90D Avg ({currency.code}/kg)</th>
                <th className="py-3 text-center">Trend (7D)</th>
                <th className="py-3 text-right pr-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {filteredRawFoodItems.map((item) => {
                const isSelected = selectedRawFoodId === item.id;
                return (
                  <tr 
                    key={item.id} 
                    className={`transition-colors ${isSelected ? 'bg-emerald-500/10 border-l-4 border-emerald-500' : 'hover:bg-slate-900/60'}`}
                  >
                    <td className="py-3.5 pl-3 font-semibold text-slate-100 flex items-center gap-2.5">
                      <span className={`h-2.5 w-2.5 rounded-full ${isSelected ? 'bg-emerald-400 animate-pulse' : 'bg-blue-400'}`} />
                      <span>{item.name}</span>
                    </td>
                    <td className="py-3.5 text-xs text-slate-400 font-mono">{item.category}</td>
                    <td className="py-3.5 text-right font-mono font-bold text-emerald-400">
                      {currency.symbol}{convertPrice(item.priceTodayUSD).toFixed(2)} / kg
                    </td>
                    <td className="py-3.5 text-right font-mono text-slate-300">
                      {currency.symbol}{convertPrice(item.price7dUSD).toFixed(2)}
                    </td>
                    <td className="py-3.5 text-right font-mono text-slate-400">
                      {currency.symbol}{convertPrice(item.price30dUSD).toFixed(2)}
                    </td>
                    <td className="py-3.5 text-right font-mono text-slate-500">
                      {currency.symbol}{convertPrice(item.price90dUSD).toFixed(2)}
                    </td>
                    <td className="py-3.5 text-center">
                      <span className={`inline-flex items-center gap-1 font-mono text-xs px-2 py-0.5 rounded-full ${
                        item.change7d >= 0 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>
                        {item.change7d >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {item.change7d >= 0 ? '+' : ''}{item.change7d}%
                      </span>
                    </td>
                    <td className="py-3.5 text-right pr-3">
                      <button
                        onClick={() => setSelectedRawFoodId(item.id)}
                        className={`px-3 py-1 rounded-lg text-xs font-mono transition-colors inline-flex items-center gap-1 ${
                          isSelected
                            ? 'bg-emerald-500 text-slate-950 font-bold'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        <span>{isSelected ? 'Active Chart' : 'View Chart'}</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* 9. Live Factory Line Feed matching Selected Regional Currency */}
      <Card title="Live Factory Inspection Feed & Converted Regional Valuation" subtitle={`Real-time quality decisions valued in ${currency.name}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-[11px] font-mono text-slate-400 uppercase">
                <th className="pb-3 pl-2">Item Preview</th>
                <th className="pb-3">Crop / ID</th>
                <th className="pb-3">Freshness</th>
                <th className="pb-3">Grade</th>
                <th className="pb-3">Regional Spot ({currency.code}/kg)</th>
                <th className="pb-3 text-right pr-2">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {recentInspections.slice(0, 8).map((rec) => {
                const localPrice = getPriceForItem(rec.food_type, rec.metrics.quality_grade);
                return (
                  <tr key={rec.id} className="hover:bg-slate-900/50 transition-colors group">
                    <td className="py-3 pl-2">
                      <div className="h-10 w-10 rounded-lg overflow-hidden bg-slate-800 border border-white/10 shrink-0">
                        <img src={rec.raw_image_url} alt={rec.food_type} className="h-full w-full object-cover" />
                      </div>
                    </td>
                    <td className="py-3 font-medium text-slate-200">
                      <div>{rec.food_type}</div>
                      <div className="text-[11px] font-mono text-slate-500">{rec.id} • {rec.timestamp}</div>
                    </td>
                    <td className="py-3 font-mono">
                      <span className={`font-bold ${rec.metrics.freshness_score >= 80 ? 'text-emerald-400' : rec.metrics.freshness_score >= 60 ? 'text-amber-400' : 'text-red-400'}`}>
                        {rec.metrics.freshness_score}%
                      </span>
                    </td>
                    <td className="py-3">
                      <Badge 
                        label={`GRADE ${rec.metrics.quality_grade}`} 
                        variant={rec.metrics.quality_grade === 'A' ? 'success' : rec.metrics.quality_grade === 'B' ? 'info' : rec.metrics.quality_grade === 'C' ? 'warning' : 'danger'}
                        size="sm"
                      />
                    </td>
                    <td className="py-3 font-mono text-emerald-400 font-bold">
                      {currency.symbol}{localPrice.toFixed(2)}/kg
                    </td>
                    <td className="py-3 text-right pr-2">
                      <button 
                        onClick={() => handleInspectRecord(rec)}
                        className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-emerald-500 hover:text-slate-950 transition-colors inline-flex items-center gap-1 text-xs font-mono"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
