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
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { useInspectionStore } from '../store/inspectionStore';

import { CURRENCY_RATES, REGIONAL_HIERARCHY, GLOBAL_RAW_FOOD_ITEMS } from '../data/mockMarketData';

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
    <div className="space-y-6 pb-14">
      {/* 1. Header & Live Global Status Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-4 border-b">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              Market Dashboard
            </h1>
            <Badge variant="default">LIVE WHOLESALE</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
            <Globe className="h-4 w-4 shrink-0" />
            Real-time agricultural pricing across regions with currency conversion.
          </p>
        </div>

        {/* Currency Selector Bar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-muted/50 px-3.5 py-2.5 rounded-2xl border border-white/10 shadow">
            <DollarSign className="h-4 w-4 text-cyan-400" />
            <span className="text-xs font-mono text-muted-foreground font-bold">CURRENCY:</span>
            <select
              value={selectedCurrencyCode}
              onChange={(e) => setSelectedCurrencyCode(e.target.value)}
              className="bg-background text-cyan-400 font-mono font-extrabold text-xs rounded-xl px-2.5 py-1.5 border border-white/15 focus:outline-none focus:border-cyan-500"
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-muted/30 p-4 rounded-2xl border border-cyan-500/20 shadow-lg">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 bg-cyan-950/60 border border-cyan-500/30 px-3.5 py-1.5 rounded-xl">
            <Radio className="h-4 w-4 text-cyan-400 animate-pulse" />
            <span className="text-xs font-mono font-extrabold text-cyan-300">
              LIVE SPOT FEED ONLINE
            </span>
            <span className="text-[10px] font-mono text-cyan-400">({lastSyncTime})</span>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
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
                ? 'bg-cyan-900/30 border-cyan-500/40 text-cyan-300 hover:bg-cyan-900/50' 
                : 'bg-muted/50 border-white/10 text-muted-foreground hover:bg-slate-800'
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
              className="px-2.5 py-1.5 rounded-xl text-xs font-mono text-muted-foreground hover:text-slate-200 border border-white/10 bg-white/[0.02] backdrop-blur-md transition-all"
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
        className="shadow-sm"
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 pt-2 font-mono">
          <div className="p-4 rounded-2xl bg-white/[0.02] backdrop-blur-md border border-cyan-500/20 space-y-1.5 shadow">
            <span className="text-[10px] text-muted-foreground block uppercase font-bold">Approx. Spot Price ({activeSearchedItem.name})</span>
            <span className="text-2xl font-extrabold text-cyan-400 block">
              {currency.symbol}{approxBatchSummary.avgPricePerKg.toFixed(2)} / kg
            </span>
            <span className="text-[11px] text-muted-foreground block">
              Box (20kg): <strong className="text-white">{currency.symbol}{(approxBatchSummary.avgPricePerKg * 20).toFixed(2)}</strong>
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.02] backdrop-blur-md border border-blue-500/30 space-y-1.5 shadow">
            <span className="text-[10px] text-muted-foreground block uppercase font-bold">Estimated Batch Weight</span>
            <span className="text-2xl font-extrabold text-blue-400 block">
              {approxBatchSummary.estimatedTotalWeightKg.toLocaleString()} kg
            </span>
            <span className="text-[11px] text-muted-foreground block">
              Shift Inspected: <strong className="text-white">{recentInspections.length} Trays / Pallets</strong>
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.02] backdrop-blur-md border border-purple-500/30 space-y-1.5 shadow">
            <span className="text-[10px] text-muted-foreground block uppercase font-bold">Approx. Total Batch Worth</span>
            <span className="text-2xl font-extrabold text-purple-400 block">
              {currency.symbol}{approxBatchSummary.totalEstimatedBatchValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
            <span className="text-[11px] text-muted-foreground block">
              Grade A Tier: <strong className="text-cyan-400">{currency.symbol}{approxBatchSummary.gradeAPremiumValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</strong>
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.02] backdrop-blur-md border border-amber-500/30 space-y-1.5 shadow">
            <span className="text-[10px] text-muted-foreground block uppercase font-bold">Quarantine Interception Value</span>
            <span className="text-2xl font-extrabold text-amber-400 block">
              {currency.symbol}{approxBatchSummary.quarantineSavedValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
            <span className="text-[11px] text-cyan-400 font-bold block">
              ✅ Protected against export rejection loss
            </span>
          </div>
        </div>
      </Card>

      {/* 3. REGIONAL GEO-SELECTOR: Country -> State -> Expanded District Mandis */}
      <Card className="p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <MapPin className="h-5 w-5 text-cyan-400 shrink-0" />
            <div>
              <h3 className="text-base font-extrabold text-foreground font-mono uppercase tracking-wider">
                Regional Mandi &amp; Comprehensive District Location Selector
              </h3>
              <p className="text-xs text-muted-foreground">Select any country, state, and specific district mandi to adjust live market indices</p>
            </div>
          </div>
          <div className="text-xs font-mono text-cyan-300 bg-cyan-950/50 border border-cyan-500/30 px-3 py-1.5 rounded-xl font-extrabold shrink-0 shadow">
            LOCAL PRICE INDEX: {(districtMultiplier * 100).toFixed(1)}% OF NATIONAL SPOT
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          {/* Country Select */}
          <div className="space-y-2">
            <label className="block text-xs font-mono font-bold text-muted-foreground">1. SELECT COUNTRY</label>
            <select
              value={selectedCountry}
              onChange={(e) => handleCountryChange(e.target.value)}
              className="w-full bg-background text-foreground text-sm font-bold rounded-xl px-4 py-3 border border-white/15 focus:outline-none focus:border-cyan-500 shadow-inner"
            >
              {Object.keys(REGIONAL_HIERARCHY).map((country) => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
          </div>

          {/* State / Province Select */}
          <div className="space-y-2">
            <label className="block text-xs font-mono font-bold text-muted-foreground">2. SELECT STATE / REGION</label>
            <select
              value={selectedState}
              onChange={(e) => handleStateChange(e.target.value)}
              className="w-full bg-background text-foreground text-sm font-bold rounded-xl px-4 py-3 border border-white/15 focus:outline-none focus:border-cyan-500 shadow-inner"
            >
              <option value="All States & Regions">All States &amp; Regions (National View)</option>
              {currentCountryObj.states.map((st) => (
                <option key={st.name} value={st.name}>{st.name}</option>
              ))}
            </select>
          </div>

          {/* District / Wholesale Mandi Select - Fully Expanded across all districts */}
          <div className="space-y-2">
            <label className="block text-xs font-mono font-bold text-cyan-400">
              3. SELECT DISTRICT / WHOLESALE MANDI ({selectedState === 'All States & Regions' ? currentCountryObj.states.reduce((acc, s) => acc + s.districts.length, 0) : (currentCountryObj.states.find(s => s.name === selectedState)?.districts.length || 0)} Available)
            </label>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full bg-background text-cyan-400 font-extrabold text-sm rounded-xl px-4 py-3 border-2 border-cyan-500/30 focus:outline-none focus:border-cyan-500 shadow-inner"
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
        <Card hoverEffect>
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs text-muted-foreground font-mono uppercase font-bold">Worldwide Tracked Commodities</span>
              <h3 className="text-3xl font-extrabold text-foreground mt-1">{GLOBAL_RAW_FOOD_ITEMS.length} Items</h3>
              <span className="inline-flex items-center gap-1 text-[11px] text-cyan-400 font-semibold mt-2">
                <ArrowUpRight className="h-3.5 w-3.5" /> 35+ Worldwide Agricultural Crops
              </span>
            </div>
            <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/10 text-cyan-400">
              <Globe className="h-6 w-6" />
            </div>
          </div>
        </Card>

        <Card hoverEffect>
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs text-muted-foreground font-mono uppercase font-bold">Regional Spot Valuation</span>
              <h3 className="text-3xl font-extrabold text-blue-400 mt-1">
                {currency.symbol}{(totalSpotValuationCurr / 1000000).toFixed(2)}M
              </h3>
              <span className="text-[11px] text-muted-foreground mt-2 block font-mono">
                Valued in {currency.code} ({selectedDistrict.split(' ')[0]})
              </span>
            </div>
            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <DollarSign className="h-6 w-6" />
            </div>
          </div>
        </Card>

        <Card hoverEffect>
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs text-muted-foreground font-mono uppercase font-bold">Tracked Harvest Volume</span>
              <h3 className="text-3xl font-extrabold text-teal-400 mt-1">
                {(totalInspectedVolumeKg / 1000).toLocaleString()} <span className="text-sm font-normal text-muted-foreground">Tons</span>
              </h3>
              <span className="text-[11px] text-muted-foreground mt-2 block font-mono">
                Active wholesale mandi volume
              </span>
            </div>
            <div className="p-3 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400">
              <Package className="h-6 w-6" />
            </div>
          </div>
        </Card>

        <Card hoverEffect>
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs text-muted-foreground font-mono uppercase font-bold">Active Mandi Location</span>
              <h3 className="text-lg font-extrabold text-amber-400 mt-1 truncate">{selectedDistrict}</h3>
              <span className="text-[11px] text-cyan-400 font-semibold mt-1 block">
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
      <Card className="p-6 shadow-sm">
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-cyan-400" />
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
                className="w-full bg-muted/50 text-foreground placeholder-slate-500 text-sm font-medium rounded-xl pl-12 pr-4 py-3.5 border border-white/10 focus:outline-none focus:border-cyan-500 transition-colors shadow-inner"
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
                      ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20 font-bold'
                      : 'bg-muted/50 text-muted-foreground hover:text-slate-200 border border-white/5'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Fast item chip selector */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 border-t border-white/5">
            <span className="text-xs font-mono text-muted-foreground shrink-0 font-bold">INSTANT PREVIEW:</span>
            {filteredRawFoodItems.slice(0, 15).map((item) => (
              <button
                key={item.id}
                onClick={() => setSelectedRawFoodId(item.id)}
                className={`px-3 py-1 rounded-lg text-xs font-mono transition-all shrink-0 ${
                  selectedRawFoodId === item.id
                    ? 'bg-blue-500 text-white font-bold shadow-md shadow-blue-500/30 border border-blue-400'
                    : 'bg-muted/50 text-muted-foreground hover:bg-slate-800 border border-white/10'
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
        className="shadow-sm"
      >
        {/* Searched Item KPI Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-6 mb-6 border-b border-white/10 font-mono">
          <div className="bg-white/[0.02] backdrop-blur-md p-3.5 rounded-xl border border-cyan-500/10">
            <span className="block text-[10px] text-muted-foreground uppercase font-bold">Local Today Spot Price</span>
            <span className="text-2xl font-extrabold text-cyan-400 mt-1 block">
              {currency.symbol}{convertPrice(activeSearchedItem.priceTodayUSD).toFixed(2)} / kg
            </span>
          </div>

          <div className="bg-white/[0.02] backdrop-blur-md p-3.5 rounded-xl border border-white/10">
            <span className="block text-[10px] text-muted-foreground uppercase font-bold">7-Day Price Trend</span>
            <span className={`text-2xl font-extrabold mt-1 inline-flex items-center gap-1 ${
              activeSearchedItem.change7d >= 0 ? 'text-cyan-400' : 'text-red-400'
            }`}>
              {activeSearchedItem.change7d >= 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
              {activeSearchedItem.change7d >= 0 ? '+' : ''}{activeSearchedItem.change7d}%
            </span>
          </div>

          <div className="bg-white/[0.02] backdrop-blur-md p-3.5 rounded-xl border border-white/10">
            <span className="block text-[10px] text-muted-foreground uppercase font-bold">Grade A Premium ({currency.code})</span>
            <span className="text-2xl font-extrabold text-blue-400 mt-1 block">
              {currency.symbol}{convertPrice(activeSearchedItem.gradeAUSD).toFixed(2)} / kg
            </span>
          </div>

          <div className="bg-white/[0.02] backdrop-blur-md p-3.5 rounded-xl border border-white/10">
            <span className="block text-[10px] text-muted-foreground uppercase font-bold">Daily Market Turnover</span>
            <span className="text-2xl font-extrabold text-slate-200 mt-1 block">
              {(activeSearchedItem.volumeKg / 1000).toFixed(1)} Tons
            </span>
          </div>
        </div>

        {/* 3 Sub-Charts comparing Historical Trend, District Mandis, and Quality Grade */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Sub-Chart 1: Historical Timeline Bar Chart */}
          <div className="space-y-2">
            <h4 className="text-xs font-mono font-bold text-muted-foreground uppercase">
              1. Historical Price Trend ({currency.code}/kg)
            </h4>
            <div className="h-64 w-full bg-white/[0.02] backdrop-blur-md p-3 rounded-xl border border-white/5">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activeSearchedBarData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                  <XAxis dataKey="period" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} unit={` ${currency.symbol}`} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#09090b', borderColor: 'rgba(255,255,255,0.15)', borderRadius: '8px', fontSize: '12px' }}
                    formatter={(val: any) => [`${currency.symbol}${Number(val).toFixed(2)} / kg`, 'Spot Price']}
                  />
                  <Bar dataKey="price" fill="#22d3ee" name={`${activeSearchedItem.name} (${currency.code})`} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Sub-Chart 2: Regional Mandi Comparison in Selected State */}
          <div className="space-y-2">
            <h4 className="text-xs font-mono font-bold text-muted-foreground uppercase">
              2. District Mandis in {selectedState} ({currency.code}/kg)
            </h4>
            <div className="h-64 w-full bg-white/[0.02] backdrop-blur-md p-3 rounded-xl border border-white/5">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={searchedDistrictBarData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                  <XAxis dataKey="mandiName" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} unit={` ${currency.symbol}`} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#09090b', borderColor: 'rgba(255,255,255,0.15)', borderRadius: '8px', fontSize: '12px' }}
                    formatter={(val: any) => [`${currency.symbol}${Number(val).toFixed(2)} / kg`, 'District Price']}
                  />
                  <Bar dataKey="price" fill="#8b5cf6" name="District Spot Price" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Sub-Chart 3: Quality Grade Differentiation */}
          <div className="space-y-2">
            <h4 className="text-xs font-mono font-bold text-muted-foreground uppercase">
              3. Quality Grade Pricing Tier ({currency.code}/kg)
            </h4>
            <div className="h-64 w-full bg-white/[0.02] backdrop-blur-md p-3 rounded-xl border border-white/5">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={searchedGradeBarData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                  <XAxis dataKey="grade" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} unit={` ${currency.symbol}`} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#09090b', borderColor: 'rgba(255,255,255,0.15)', borderRadius: '8px', fontSize: '12px' }}
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
            <Tag className="h-4 w-4 text-cyan-400" />
            <span className="text-xs font-mono text-muted-foreground font-bold">SELECT MARKET CHART VIEW:</span>
          </div>

          <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-xl border border-white/10 font-mono text-xs">
            <button
              onClick={() => setChartMetric('priceHistory')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                chartMetric === 'priceHistory' ? 'bg-cyan-500 text-slate-950 font-bold shadow' : 'text-muted-foreground hover:text-slate-200'
              }`}
            >
              Today vs 7D vs 30D vs 90D ({currency.symbol}/kg)
            </button>
            <button
              onClick={() => setChartMetric('gradeComparison')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                chartMetric === 'gradeComparison' ? 'bg-blue-500 text-slate-950 font-bold shadow' : 'text-muted-foreground hover:text-slate-200'
              }`}
            >
              Grade A vs Grade B vs Processing ({currency.symbol}/kg)
            </button>
            <button
              onClick={() => setChartMetric('volumeValuation')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                chartMetric === 'volumeValuation' ? 'bg-amber-500 text-slate-950 font-bold shadow' : 'text-muted-foreground hover:text-slate-200'
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
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} unit={` ${currency.symbol}`} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#09090b', borderColor: 'rgba(255,255,255,0.15)', borderRadius: '10px', fontSize: '12px' }}
                  formatter={(val: any) => [`${currency.symbol}${Number(val).toFixed(2)}/kg`, '']}
                />
                <Legend wrapperStyle={{ paddingTop: '12px', fontSize: '12px' }} />
                <Bar dataKey="Today" fill="#22d3ee" name={`Today Spot (${currency.symbol}/kg)`} radius={[6, 6, 0, 0]} />
                <Bar dataKey="Past7Days" fill="#8b5cf6" name={`7D Avg (${currency.symbol}/kg)`} radius={[6, 6, 0, 0]} />
                <Bar dataKey="Past30Days" fill="#8b5cf6" name={`30D Avg (${currency.symbol}/kg)`} radius={[6, 6, 0, 0]} />
                <Bar dataKey="Past90Days" fill="#64748b" name={`90D Avg (${currency.symbol}/kg)`} radius={[6, 6, 0, 0]} />
              </BarChart>
            ) : chartMetric === 'gradeComparison' ? (
              <BarChart data={gradeComparisonBarData} margin={{ top: 15, right: 30, left: 10, bottom: 20 }}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} unit={` ${currency.symbol}`} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#09090b', borderColor: 'rgba(255,255,255,0.15)', borderRadius: '10px', fontSize: '12px' }}
                  formatter={(val: any) => [`${currency.symbol}${Number(val).toFixed(2)}/kg`, '']}
                />
                <Legend wrapperStyle={{ paddingTop: '12px', fontSize: '12px' }} />
                <Bar dataKey="GradeA" fill="#22d3ee" name={`Grade A Premium (${currency.symbol}/kg)`} radius={[6, 6, 0, 0]} />
                <Bar dataKey="GradeB" fill="#8b5cf6" name={`Grade B Domestic (${currency.symbol}/kg)`} radius={[6, 6, 0, 0]} />
                <Bar dataKey="Processing" fill="#f59e0b" name={`Processing Puree (${currency.symbol}/kg)`} radius={[6, 6, 0, 0]} />
              </BarChart>
            ) : (
              <BarChart data={volumeValuationBarData} margin={{ top: 15, right: 30, left: 10, bottom: 20 }}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} />
                <YAxis yAxisId="left" stroke="#22d3ee" fontSize={11} unit="t" tickLine={false} axisLine={false} />
                <YAxis yAxisId="right" orientation="right" stroke="#8b5cf6" fontSize={11} unit="k" tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#09090b', borderColor: 'rgba(255,255,255,0.15)', borderRadius: '10px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ paddingTop: '12px', fontSize: '12px' }} />
                <Bar yAxisId="left" dataKey="VolumeTons" fill="#22d3ee" name="Volume (Tons)" radius={[6, 6, 0, 0]} />
                <Bar yAxisId="right" dataKey="ValueCurr" fill="#8b5cf6" name={`Market Value (Thousands ${currency.code})`} radius={[6, 6, 0, 0]} />
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
              <tr className="border-b border-white/10 text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
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
                    className={`transition-colors ${isSelected ? 'bg-cyan-500/10 border-l-4 border-cyan-500' : 'hover:bg-white/[0.02] backdrop-blur-md'}`}
                  >
                    <td className="py-3.5 pl-3 font-semibold text-foreground flex items-center gap-2.5">
                      <span className={`h-2.5 w-2.5 rounded-full ${isSelected ? 'bg-cyan-400 animate-pulse' : 'bg-blue-400'}`} />
                      <span>{item.name}</span>
                    </td>
                    <td className="py-3.5 text-xs text-muted-foreground font-mono">{item.category}</td>
                    <td className="py-3.5 text-right font-mono font-bold text-cyan-400">
                      {currency.symbol}{convertPrice(item.priceTodayUSD).toFixed(2)} / kg
                    </td>
                    <td className="py-3.5 text-right font-mono text-muted-foreground">
                      {currency.symbol}{convertPrice(item.price7dUSD).toFixed(2)}
                    </td>
                    <td className="py-3.5 text-right font-mono text-muted-foreground">
                      {currency.symbol}{convertPrice(item.price30dUSD).toFixed(2)}
                    </td>
                    <td className="py-3.5 text-right font-mono text-slate-500">
                      {currency.symbol}{convertPrice(item.price90dUSD).toFixed(2)}
                    </td>
                    <td className="py-3.5 text-center">
                      <span className={`inline-flex items-center gap-1 font-mono text-xs px-2 py-0.5 rounded-full ${
                        item.change7d >= 0 ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/10' : 'bg-red-500/10 text-red-400 border border-red-500/20'
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
                            ? 'bg-cyan-500 text-slate-950 font-bold'
                            : 'bg-slate-800 text-muted-foreground hover:bg-slate-700'
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
              <tr className="border-b border-white/10 text-[11px] font-mono text-muted-foreground uppercase">
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
                  <tr key={rec.id} className="hover:bg-muted/50/50 transition-colors group">
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
                      <span className={`font-bold ${rec.metrics.freshness_score >= 80 ? 'text-cyan-400' : rec.metrics.freshness_score >= 60 ? 'text-amber-400' : 'text-red-400'}`}>
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
                    <td className="py-3 font-mono text-cyan-400 font-bold">
                      {currency.symbol}{localPrice.toFixed(2)}/kg
                    </td>
                    <td className="py-3 text-right pr-2">
                      <button 
                        onClick={() => handleInspectRecord(rec)}
                        className="p-1.5 rounded-lg bg-slate-800 text-muted-foreground hover:bg-cyan-500 hover:text-slate-950 transition-colors inline-flex items-center gap-1 text-xs font-mono"
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
