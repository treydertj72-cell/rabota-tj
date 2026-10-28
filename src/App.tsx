import React, { useState, useEffect, useMemo, useRef } from 'react';
import { I18nProvider, useI18n } from './context/I18nContext';
import { Listing, UserProfile, CountryCode, OwnerAd, MainSectionType, ListingType } from './types';
import { store, subscribeStore } from './lib/store';
import { getSupabase } from './lib/supabase';
import { Header } from './components/Header';
import { SectionNav } from './components/SectionNav';
import { HeroSection } from './components/HeroSection';
import { TaxiSearchSection } from './components/TaxiSearchSection';
import { ListingCard } from './components/ListingCard';
import { AdBanner } from './components/AdBanner';
import { AdSensePlaceholder } from './components/AdSensePlaceholder';
import { ListingDetailModal } from './components/ListingDetailModal';
import { CreateListingModal } from './components/CreateListingModal';
import { ProfileModal } from './components/ProfileModal';
import { ChatModal } from './components/ChatModal';
import { AuthModal } from './components/AuthModal';
import { AdminPanelModal } from './components/AdminPanelModal';
import { SystemStatusModal } from './components/SystemStatusModal';
import { BottomNav } from './components/BottomNav';
import { COUNTRIES } from './data/locations';
import { PlusCircle, Search, Shield, Globe, MessageCircle, Info, CheckCircle2, Car, Sparkles, Briefcase, Hammer, UserCheck, X } from 'lucide-react';

function MainApp() {
  const { t } = useI18n();

  // Reactive store state
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => store.getCurrentUser());
  const [allListings, setAllListings] = useState<Listing[]>(() => store.getListings());
  const [favorites, setFavorites] = useState<string[]>(() => store.getFavorites());
  const [ownerAds, setOwnerAds] = useState<OwnerAd[]>(() => store.getOwnerAds());

  // 6 Primary platform sections: 'all' | 'vacancies' | 'masters' | 'resumes' | 'taxi' | 'services'
  const [activeSection, setActiveSection] = useState<MainSectionType>('all');

  // General Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<CountryCode | undefined>(undefined); // undefined means ALL CIS COUNTRIES!
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedProfession, setSelectedProfession] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedType, setSelectedType] = useState('all');

  // Taxi-specific search state
  const [taxiFromCountry, setTaxiFromCountry] = useState<CountryCode | undefined>(undefined);
  const [taxiFromCity, setTaxiFromCity] = useState('');
  const [taxiToCountry, setTaxiToCountry] = useState<CountryCode | undefined>(undefined);
  const [taxiToCity, setTaxiToCity] = useState('');
  const [taxiTripDate, setTaxiTripDate] = useState('');
  const [taxiFilterType, setTaxiFilterType] = useState<'all' | 'taxi_driver' | 'taxi_passenger'>('all');

  // Modals state
  const [activeListing, setActiveListing] = useState<Listing | null>(null);
  const [editingListing, setEditingListing] = useState<Listing | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createModalDefaultType, setCreateModalDefaultType] = useState<ListingType>('offering_job');
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [chatTarget, setChatTarget] = useState<{ id: string; name: string; avatarUrl?: string; listing?: Listing } | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Navigation & Scroll Restoration Refs
  const savedScrollPosRef = useRef<number>(0);
  const activeSectionRef = useRef<MainSectionType>(activeSection);
  activeSectionRef.current = activeSection;
  const activeListingRef = useRef<Listing | null>(activeListing);
  activeListingRef.current = activeListing;
  const createModalRef = useRef<boolean>(createModalOpen);
  createModalRef.current = createModalOpen;
  const profileModalRef = useRef<boolean>(profileModalOpen);
  profileModalRef.current = profileModalOpen;
  const authModalRef = useRef<boolean>(authModalOpen);
  authModalRef.current = authModalOpen;
  const adminModalRef = useRef<boolean>(adminModalOpen);
  adminModalRef.current = adminModalOpen;
  const statusModalRef = useRef<boolean>(statusModalOpen);
  statusModalRef.current = statusModalOpen;
  const chatTargetRef = useRef<any>(chatTarget);
  chatTargetRef.current = chatTarget;

  // Initialize view from URL and register popstate listener
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const secParam = params.get('section') as MainSectionType | null;
    const validSections: MainSectionType[] = ['all', 'vacancies', 'masters', 'resumes', 'taxi', 'services'];
    if (secParam && validSections.includes(secParam)) {
      setActiveSection(secParam);
    }
    const adParam = params.get('ad');
    if (adParam) {
      const found = store.getListings().find(l => l.id === adParam);
      if (found) {
        setActiveListing(found);
      }
    }
    const modalParam = params.get('modal');
    if (modalParam === 'create') setCreateModalOpen(true);
    else if (modalParam === 'profile') setProfileModalOpen(true);
    else if (modalParam === 'admin') setAdminModalOpen(true);
    else if (modalParam === 'status') setStatusModalOpen(true);

    // Initial root state (do NOT pushState on initial entry, preserving native browser exit on Back)
    if (!window.history.state) {
      window.history.replaceState({
        type: 'root',
        section: secParam || 'all',
      }, '', window.location.href);
    }

    const handlePopState = (e: PopStateEvent) => {
      const state = e.state;
      const currentParams = new URLSearchParams(window.location.search);
      const urlAd = currentParams.get('ad');
      const urlModal = currentParams.get('modal');
      const urlSection = currentParams.get('section') as MainSectionType | null;

      const hadAd = !!activeListingRef.current;
      const hadCreate = createModalRef.current;
      const hadProfile = profileModalRef.current;
      const hadAdmin = adminModalRef.current;
      const hadStatus = statusModalRef.current;
      const hadAuth = authModalRef.current;
      const hadChat = !!chatTargetRef.current;

      // 1. If an ad detail was open and now neither state nor URL targets this ad, close it & restore scroll
      if (hadAd && (!state || state.modal !== 'listing' || !urlAd)) {
        setActiveListing(null);
        const restoreY = state?.scrollY ?? savedScrollPosRef.current;
        requestAnimationFrame(() => {
          window.scrollTo({ top: restoreY, behavior: 'instant' });
        });
      }

      // 2. Modals close handling on Back gesture/button
      if (hadCreate && (!state || state.modal !== 'create' || urlModal !== 'create')) {
        setCreateModalOpen(false);
      }
      if (hadProfile && (!state || state.modal !== 'profile' || urlModal !== 'profile')) {
        setProfileModalOpen(false);
      }
      if (hadAdmin && (!state || state.modal !== 'admin' || urlModal !== 'admin')) {
        setAdminModalOpen(false);
      }
      if (hadStatus && (!state || state.modal !== 'status' || urlModal !== 'status')) {
        setStatusModalOpen(false);
      }
      if (hadAuth && (!state || state.modal !== 'auth')) {
        setAuthModalOpen(false);
      }
      if (hadChat && (!state || state.modal !== 'chat')) {
        setChatTarget(null);
      }

      // 3. Re-open ad or modal if user navigates forward or directly via history
      if (urlAd && (!activeListingRef.current || activeListingRef.current.id !== urlAd)) {
        const found = store.getListings().find(l => l.id === urlAd);
        if (found) {
          setActiveListing(found);
        }
      }
      if (urlModal === 'create' && !createModalRef.current) setCreateModalOpen(true);
      if (urlModal === 'profile' && !profileModalRef.current) setProfileModalOpen(true);
      if (urlModal === 'admin' && !adminModalRef.current) setAdminModalOpen(true);
      if (urlModal === 'status' && !statusModalRef.current) setStatusModalOpen(true);

      // 4. Section transition on Back (Requirement 2):
      const targetSec = (state?.section || urlSection || 'all') as MainSectionType;
      if (validSections.includes(targetSec) && targetSec !== activeSectionRef.current) {
        setActiveSection(targetSec);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Subscribe to store updates
  useEffect(() => {
    const unsub = subscribeStore(() => {
      setCurrentUser(store.getCurrentUser());
      setAllListings(store.getListings());
      setFavorites(store.getFavorites());
      setOwnerAds(store.getOwnerAds());
    });
    return unsub;
  }, []);

  // Supabase Auth session listener for OAuth redirect flows
  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const u = session.user;
        const userProfile: UserProfile = {
          id: 'supabase_' + u.id,
          email: u.email || '',
          fullName: u.user_metadata?.full_name || u.user_metadata?.name || u.email?.split('@')[0] || 'Пользователь Google',
          avatarUrl: u.user_metadata?.avatar_url || u.user_metadata?.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.email || 'User')}&background=059669&color=fff&rounded=true`,
          role: 'worker',
          countryCode: 'TJ',
          city: 'Душанбе',
          createdAt: new Date().toISOString(),
        };
        store.setCurrentUser(userProfile);
      }
    });

    const { data: authSub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const u = session.user;
        const userProfile: UserProfile = {
          id: 'supabase_' + u.id,
          email: u.email || '',
          fullName: u.user_metadata?.full_name || u.user_metadata?.name || u.email?.split('@')[0] || 'Пользователь Google',
          avatarUrl: u.user_metadata?.avatar_url || u.user_metadata?.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.email || 'User')}&background=059669&color=fff&rounded=true`,
          role: 'worker',
          countryCode: 'TJ',
          city: 'Душанбе',
          createdAt: new Date().toISOString(),
        };
        store.setCurrentUser(userProfile);
      }
    });

    return () => {
      authSub?.subscription?.unsubscribe();
    };
  }, []);

  // Compute listing counts for the 6 sections dynamically
  const sectionCounts: Record<MainSectionType, number> = useMemo(() => {
    const active = allListings.filter(l => l.isActive && (!l.isHiddenByAdmin || currentUser?.isAdmin));
    return {
      all: active.length,
      vacancies: active.filter(l => l.type === 'offering_job').length,
      masters: active.filter(l => l.type === 'offering_service').length,
      resumes: active.filter(l => l.type === 'looking_for_job').length,
      taxi: active.filter(l => l.type === 'taxi_driver' || l.type === 'taxi_passenger').length,
      services: active.filter(l => 
        l.categoryId !== 'taxi' && (l.type === 'offering_service' || l.type === 'looking_for_service')
      ).length,
    };
  }, [allListings, currentUser]);

  // Filter listings based on section and active filters
  // Core rule: Default shows ALL countries simultaneously!
  const filteredListings = useMemo(() => {
    return allListings.filter((l) => {
      // Admin hidden check
      if (l.isHiddenByAdmin && !currentUser?.isAdmin) return false;
      if (!l.isActive) return false;

      // 1. SECTION FILTERING
      if (activeSection === 'vacancies') {
        if (l.type !== 'offering_job') return false;
      } else if (activeSection === 'masters') {
        if (l.type !== 'offering_service' || l.categoryId === 'taxi') return false;
      } else if (activeSection === 'resumes') {
        if (l.type !== 'looking_for_job') return false;
      } else if (activeSection === 'taxi') {
        const isTaxi = l.type === 'taxi_driver' || l.type === 'taxi_passenger';
        if (!isTaxi) return false;

        // Subfilter by driver vs passenger in taxi mode
        if (taxiFilterType !== 'all' && l.type !== taxiFilterType) {
          return false;
        }

        // Taxi From Country
        if (taxiFromCountry && l.taxiDetails?.fromCountry !== taxiFromCountry && l.countryCode !== taxiFromCountry) {
          return false;
        }

        // Taxi From City
        if (taxiFromCity && l.taxiDetails?.fromCity.toLowerCase() !== taxiFromCity.toLowerCase() && l.city.toLowerCase() !== taxiFromCity.toLowerCase()) {
          return false;
        }

        // Taxi To Country
        if (taxiToCountry && l.taxiDetails?.toCountry !== taxiToCountry) {
          return false;
        }

        // Taxi To City
        if (taxiToCity && l.taxiDetails?.toCity.toLowerCase() !== taxiToCity.toLowerCase()) {
          return false;
        }

        // Taxi Trip Date
        if (taxiTripDate && l.taxiDetails?.departureDate !== taxiTripDate) {
          return false;
        }
      } else if (activeSection === 'services') {
        const isService = l.categoryId !== 'taxi' && (
          l.type === 'offering_service' ||
          l.type === 'looking_for_service' ||
          ['construction', 'renovation', 'tiling', 'plumbing', 'electrician', 'welding', 'cargo', 'cleaning', 'appliance_repair', 'tutoring', 'beauty_health', 'it_services', 'delivery', 'domestic'].includes(l.categoryId)
        );
        if (!isService) return false;
      }

      // 2. GENERAL LOCATION FILTERS (applies unless in taxi section which has its own route inputs)
      if (activeSection !== 'taxi') {
        if (selectedCountry && l.countryCode !== selectedCountry) {
          return false;
        }

        if (selectedRegion && l.region !== selectedRegion) {
          return false;
        }

        if (selectedCity && l.city.toLowerCase() !== selectedCity.toLowerCase()) {
          return false;
        }
      }

      // 3. GENERAL PROFESSION & CATEGORY FILTERS
      if (selectedProfession && !l.profession.toLowerCase().includes(selectedProfession.toLowerCase())) {
        return false;
      }

      if (selectedCategory && l.categoryId !== selectedCategory) {
        return false;
      }

      if (selectedType !== 'all' && l.type !== selectedType) {
        return false;
      }

      // 4. SEARCH QUERY (Title, description, profession, city, region)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = l.title.toLowerCase().includes(q);
        const matchesDesc = l.description.toLowerCase().includes(q);
        const matchesProf = l.profession.toLowerCase().includes(q);
        const matchesCity = l.city.toLowerCase().includes(q);
        const matchesReg = l.region.toLowerCase().includes(q);
        const matchesFromCity = l.taxiDetails?.fromCity.toLowerCase().includes(q);
        const matchesToCity = l.taxiDetails?.toCity.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesProf && !matchesCity && !matchesReg && !matchesFromCity && !matchesToCity) {
          return false;
        }
      }

      return true;
    });
  }, [
    allListings,
    activeSection,
    selectedCountry,
    selectedRegion,
    selectedCity,
    selectedProfession,
    selectedCategory,
    selectedType,
    searchQuery,
    taxiFromCountry,
    taxiFromCity,
    taxiToCountry,
    taxiToCity,
    taxiTripDate,
    taxiFilterType,
    currentUser,
  ]);

  const unreadMessagesCount = currentUser ? store.getUnreadCount(currentUser.id) : 0;

  // Active ads by placement
  const heroAds = ownerAds.filter(a => a.isActive && a.placement === 'hero');
  const feedAds = ownerAds.filter(a => a.isActive && a.placement === 'feed');

  const handleSelectSection = (newSection: MainSectionType, pushHistory = true) => {
    if (newSection === activeSection) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (pushHistory) {
      const newUrl = newSection === 'all' ? window.location.pathname : `?section=${newSection}`;
      window.history.pushState({ type: 'section', section: newSection }, '', newUrl);
    }
    setActiveSection(newSection);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenListingDetail = (listing: Listing, pushHistory = true) => {
    store.incrementListingViews(listing.id);
    savedScrollPosRef.current = window.scrollY;
    if (pushHistory) {
      const params = new URLSearchParams(window.location.search);
      params.set('ad', listing.id);
      window.history.pushState(
        { modal: 'listing', listingId: listing.id, section: activeSection, scrollY: window.scrollY },
        '',
        `?${params.toString()}`
      );
    }
    setActiveListing(listing);
  };

  const handleCloseListingDetail = () => {
    if (window.history.state?.modal === 'listing' || window.location.search.includes('ad=')) {
      window.history.back();
    } else {
      setActiveListing(null);
      requestAnimationFrame(() => {
        window.scrollTo({ top: savedScrollPosRef.current, behavior: 'instant' });
      });
    }
  };

  const handleOpenCreateAdWithType = (listingType: ListingType, pushHistory = true) => {
    setEditingListing(null);
    setCreateModalDefaultType(listingType);
    savedScrollPosRef.current = window.scrollY;
    if (pushHistory) {
      const params = new URLSearchParams(window.location.search);
      params.set('modal', 'create');
      window.history.pushState({ modal: 'create', section: activeSection }, '', `?${params.toString()}`);
    }
    setCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    if (window.history.state?.modal === 'create' || window.location.search.includes('modal=create')) {
      window.history.back();
    } else {
      setCreateModalOpen(false);
    }
  };

  const handleListingCreated = (_newAd: Listing) => {
    // 1. Immediately reload all listings to ensure fresh state
    const freshListings = store.getListings();
    setAllListings(freshListings);

    // 2. Close create modal
    setCreateModalOpen(false);
    setEditingListing(null);

    // 3. Clean up modal=create from history URL without polluting history stack
    const params = new URLSearchParams(window.location.search);
    if (params.get('modal') === 'create') {
      params.delete('modal');
      const cleanUrl = params.toString() ? `?${params.toString()}` : window.location.pathname;
      window.history.replaceState({ type: 'root', section: activeSection }, '', cleanUrl);
    }

    // 4. Show success toast notification
    setSuccessToast('✅ Объявление успешно опубликовано!');
    setTimeout(() => {
      setSuccessToast(null);
    }, 5000);

    // 5. Scroll to top so user sees their new listing at the top of the feed
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenProfile = (pushHistory = true) => {
    if (!currentUser) {
      handleOpenAuth();
      return;
    }
    savedScrollPosRef.current = window.scrollY;
    if (pushHistory) {
      const params = new URLSearchParams(window.location.search);
      params.set('modal', 'profile');
      window.history.pushState({ modal: 'profile', section: activeSection }, '', `?${params.toString()}`);
    }
    setProfileModalOpen(true);
  };

  const handleCloseProfile = () => {
    if (window.history.state?.modal === 'profile' || window.location.search.includes('modal=profile')) {
      window.history.back();
    } else {
      setProfileModalOpen(false);
    }
  };

  const handleOpenAdmin = (pushHistory = true) => {
    savedScrollPosRef.current = window.scrollY;
    if (pushHistory) {
      const params = new URLSearchParams(window.location.search);
      params.set('modal', 'admin');
      window.history.pushState({ modal: 'admin', section: activeSection }, '', `?${params.toString()}`);
    }
    setAdminModalOpen(true);
  };

  const handleCloseAdmin = () => {
    if (window.history.state?.modal === 'admin' || window.location.search.includes('modal=admin')) {
      window.history.back();
    } else {
      setAdminModalOpen(false);
    }
  };

  const handleOpenStatus = (pushHistory = true) => {
    savedScrollPosRef.current = window.scrollY;
    if (pushHistory) {
      const params = new URLSearchParams(window.location.search);
      params.set('modal', 'status');
      window.history.pushState({ modal: 'status', section: activeSection }, '', `?${params.toString()}`);
    }
    setStatusModalOpen(true);
  };

  const handleCloseStatus = () => {
    if (window.history.state?.modal === 'status' || window.location.search.includes('modal=status')) {
      window.history.back();
    } else {
      setStatusModalOpen(false);
    }
  };

  const handleOpenAuth = (pushHistory = true) => {
    savedScrollPosRef.current = window.scrollY;
    if (pushHistory) {
      const params = new URLSearchParams(window.location.search);
      params.set('modal', 'auth');
      window.history.pushState({ modal: 'auth', section: activeSection }, '', `?${params.toString()}`);
    }
    setAuthModalOpen(true);
  };

  const handleCloseAuth = () => {
    if (window.history.state?.modal === 'auth' || window.location.search.includes('modal=auth')) {
      window.history.back();
    } else {
      setAuthModalOpen(false);
    }
  };

  const handleOpenChatWithUser = (listing: Listing, pushHistory = true) => {
    if (!currentUser) {
      handleOpenAuth();
      return;
    }
    savedScrollPosRef.current = window.scrollY;
    const target = {
      id: listing.userId,
      name: listing.authorName,
      avatarUrl: listing.authorAvatar,
      listing,
    };
    if (pushHistory) {
      const params = new URLSearchParams(window.location.search);
      params.set('modal', 'chat');
      window.history.pushState({ modal: 'chat', targetId: listing.userId, section: activeSection }, '', `?${params.toString()}`);
    }
    setChatTarget(target);
  };

  const handleOpenSupportChat = (pushHistory = true) => {
    if (!currentUser) {
      handleOpenAuth();
      return;
    }
    savedScrollPosRef.current = window.scrollY;
    const target = {
      id: 'support',
      name: 'Служба поддержки РАБОТА ТҶ',
    };
    if (pushHistory) {
      const params = new URLSearchParams(window.location.search);
      params.set('modal', 'chat');
      window.history.pushState({ modal: 'chat', targetId: 'support', section: activeSection }, '', `?${params.toString()}`);
    }
    setChatTarget(target);
  };

  const handleCloseChat = () => {
    if (window.history.state?.modal === 'chat' || window.location.search.includes('modal=chat')) {
      window.history.back();
    } else {
      setChatTarget(null);
    }
  };

  const handleToggleFavorite = (id: string) => {
    store.toggleFavorite(id);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCountry(undefined);
    setSelectedRegion('');
    setSelectedCity('');
    setSelectedProfession('');
    setSelectedCategory('');
    setSelectedType('all');
    setTaxiFromCountry(undefined);
    setTaxiFromCity('');
    setTaxiToCountry(undefined);
    setTaxiToCity('');
    setTaxiTripDate('');
    setTaxiFilterType('all');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 pb-20 md:pb-0">
      
      {/* Global Success Notification Toast */}
      {successToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 max-w-md w-[92%] sm:w-auto bg-emerald-600 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-2.5 font-bold text-xs sm:text-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-200 shrink-0" />
            <span>{successToast}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessToast(null)}
            className="text-emerald-100 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 1. Header (Brand Wordmark with Ҷ + Desktop Navigation + Controls) */}
      <Header
        currentUser={currentUser}
        onOpenAuth={() => handleOpenAuth()}
        onOpenProfile={() => handleOpenProfile()}
        onOpenCreateAd={() => handleOpenCreateAdWithType('offering_job')}
        onOpenAdmin={() => handleOpenAdmin()}
        activeSection={activeSection}
        onSelectSection={(sec) => handleSelectSection(sec)}
      />

      {/* 2. Top-level 6 Sections Navigation Bar (All / Vacancies / Masters / Resumes / Taxi / Services) */}
      <SectionNav
        activeSection={activeSection}
        onSelectSection={(sec) => handleSelectSection(sec)}
        counts={sectionCounts}
      />

      {/* 3. Hero Section OR Dedicated Taxi Search Section */}
      {activeSection === 'taxi' ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5">
          <TaxiSearchSection
            fromCountry={taxiFromCountry}
            onSelectFromCountry={setTaxiFromCountry}
            fromCity={taxiFromCity}
            onSelectFromCity={setTaxiFromCity}
            toCountry={taxiToCountry}
            onSelectToCountry={setTaxiToCountry}
            toCity={taxiToCity}
            onSelectToCity={setTaxiToCity}
            tripDate={taxiTripDate}
            onSelectTripDate={setTaxiTripDate}
            tripFilterType={taxiFilterType}
            onSelectTripFilterType={setTaxiFilterType}
            onResetFilters={() => {
              setTaxiFromCountry(undefined);
              setTaxiFromCity('');
              setTaxiToCountry(undefined);
              setTaxiToCity('');
              setTaxiTripDate('');
              setTaxiFilterType('all');
            }}
            onOpenCreateTaxiDriver={() => handleOpenCreateAdWithType('taxi_driver')}
            onOpenCreateTaxiPassenger={() => handleOpenCreateAdWithType('taxi_passenger')}
            totalTripsCount={sectionCounts.taxi}
          />
        </div>
      ) : (
        <HeroSection
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCountry={selectedCountry}
          onSelectCountry={setSelectedCountry}
          selectedRegion={selectedRegion}
          onSelectRegion={setSelectedRegion}
          selectedCity={selectedCity}
          onSelectCity={setSelectedCity}
          selectedProfession={selectedProfession}
          onSelectProfession={setSelectedProfession}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          selectedType={selectedType}
          onSelectType={setSelectedType}
          onResetFilters={handleResetFilters}
          totalListingsCount={filteredListings.length}
        />
      )}

      {/* 4. Main Content Feed */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex-1 w-full">
        
        {/* Hero Ad Placement (WhatsApp Official Channel) */}
        {heroAds.length > 0 && activeSection !== 'taxi' && (
          <AdBanner ad={heroAds[0]} variant="hero" />
        )}

        {/* Section title & count */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
              {activeSection === 'taxi'
                ? 'Междугородние и международные поездки'
                : activeSection === 'services'
                ? 'Витрина мастеров и услуг'
                : activeSection === 'vacancies'
                ? 'Актуальные вакансии'
                : activeSection === 'masters'
                ? 'Анкеты опытных мастеров'
                : activeSection === 'resumes'
                ? 'Резюме соискателей'
                : selectedCountry
                ? `Объявления: ${COUNTRIES[selectedCountry]?.nameRu}`
                : 'Общая лента: все страны СНГ'}
              {selectedRegion && ` · ${selectedRegion}`}
              {selectedCity && ` · ${selectedCity}`}
            </h2>
            <span className="text-xs font-semibold text-slate-500 bg-slate-200/60 px-2 py-0.5 rounded-full tabular-nums">
              {filteredListings.length}
            </span>
          </div>

          {/* Action and System Status buttons */}
          <div className="flex items-center gap-2">
            {activeSection === 'taxi' ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenCreateAdWithType('taxi_driver')}
                  className="flex items-center gap-1.5 text-xs text-amber-950 bg-amber-400 hover:bg-amber-300 font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer shadow-xs"
                >
                  <Car className="w-3.5 h-3.5" />
                  <span>Подать поездку</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => handleOpenCreateAdWithType('offering_service')}
                className="flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>Подать объявление</span>
              </button>
            )}

            <button
              onClick={() => setStatusModalOpen(true)}
              className="flex items-center gap-1.5 text-xs text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
              title="Проверить статус интеграций и функций"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Статус & СНГ</span>
            </button>
          </div>
        </div>

        {/* Listings Feed or Empty State */}
        {filteredListings.length > 0 ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredListings.map((listing, index) => (
                <React.Fragment key={listing.id}>
                  
                  {/* Listing Card */}
                  <ListingCard
                    listing={listing}
                    isFavorite={favorites.includes(listing.id)}
                    onToggleFavorite={handleToggleFavorite}
                    onClick={handleOpenListingDetail}
                    onOpenChat={handleOpenChatWithUser}
                  />

                  {/* Interstitial Ad Banner after 3rd item */}
                  {index === 2 && feedAds.length > 0 && (
                    <div className="md:col-span-2 lg:col-span-3">
                      <AdBanner ad={feedAds[0]} variant="feed" />
                    </div>
                  )}

                  {/* Google AdSense slot after 5th item */}
                  {index === 5 && (
                    <div className="md:col-span-2 lg:col-span-3">
                      <AdSensePlaceholder slotId="feed-slot-2" format="horizontal" />
                    </div>
                  )}

                </React.Fragment>
              ))}
            </div>

            {/* Bottom Google AdSense placement */}
            <AdSensePlaceholder slotId="bottom-feed-ad" format="horizontal" />
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center max-w-xl mx-auto my-8">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
              {activeSection === 'taxi' ? (
                <Car className="w-8 h-8" />
              ) : (
                <Search className="w-8 h-8" />
              )}
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              {t('emptyFeedTitle')}
            </h3>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
              {t('emptyFeedSubtitle')}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => handleOpenCreateAdWithType(activeSection === 'taxi' ? 'taxi_driver' : 'offering_job')}
                className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-sm transition-colors cursor-pointer"
              >
                {activeSection === 'taxi' ? 'Опубликовать поездку' : t('publishFirstAd')}
              </button>
              <button
                onClick={handleResetFilters}
                className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
              >
                Сбросить фильтры
              </button>
            </div>
          </div>
        )}

      </main>

      {/* 5. Footer with CIS Information & Admin Access */}
      <footer className="bg-white border-t border-slate-200 text-slate-600 py-8 text-xs mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-900 tracking-tight text-sm">
              РАБОТА <span className="text-emerald-600">ТҶ</span>
            </span>
            <span className="text-slate-300">·</span>
            <span>Единая площадка объявлений, вакансий, мастеров и поездок по всем странам СНГ.</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => handleOpenStatus()}
              className="text-slate-500 hover:text-emerald-700 transition-colors cursor-pointer font-medium"
            >
              Статус базы и честный отчет
            </button>
            <span className="text-slate-300">·</span>
            <button
              onClick={() => handleOpenAdmin()}
              className="text-slate-500 hover:text-emerald-700 transition-colors flex items-center gap-1 cursor-pointer font-medium"
            >
              <Shield className="w-3.5 h-3.5 text-emerald-600" />
              <span>Панель администратора</span>
            </button>
          </div>
        </div>
      </footer>

      {/* 6. Mobile Bottom Navigation Bar */}
      <BottomNav
        currentUser={currentUser}
        unreadCount={unreadMessagesCount}
        onOpenCreateAd={() => handleOpenCreateAdWithType('offering_job')}
        onOpenProfile={() => handleOpenProfile()}
        onOpenAuth={() => handleOpenAuth()}
        onScrollToTop={() => {
          handleSelectSection('all');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenSearchFocus={() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenMessages={() => {
          handleOpenSupportChat();
        }}
        activeTab="feed"
      />

      {/* 7. Modals */}
      {createModalOpen && (
        <CreateListingModal
          onClose={handleCloseCreateModal}
          currentUser={currentUser}
          defaultType={createModalDefaultType}
          onAdCreated={handleListingCreated}
          initialListing={editingListing}
        />
      )}

      {activeListing && (
        <ListingDetailModal
          listing={activeListing}
          onClose={handleCloseListingDetail}
          currentUser={currentUser}
          isFavorite={favorites.includes(activeListing.id)}
          onToggleFavorite={handleToggleFavorite}
          onOpenChat={handleOpenChatWithUser}
          onEditListing={(ad) => {
            handleCloseListingDetail();
            setEditingListing(ad);
            handleOpenCreateAdWithType(ad.type);
          }}
          onListingDeleted={() => {
            handleCloseListingDetail();
          }}
        />
      )}

      {profileModalOpen && currentUser && (
        <ProfileModal
          currentUser={currentUser}
          onClose={handleCloseProfile}
          onLogout={() => {
            store.setCurrentUser(null);
            handleCloseProfile();
          }}
          onOpenListing={handleOpenListingDetail}
          onEditListing={(ad) => {
            handleCloseProfile();
            setEditingListing(ad);
            handleOpenCreateAdWithType(ad.type);
          }}
        />
      )}

      {authModalOpen && (
        <AuthModal
          onClose={handleCloseAuth}
          onLoginSuccess={(user) => {
            setCurrentUser(user);
            handleCloseAuth();
          }}
        />
      )}

      {adminModalOpen && (
        <AdminPanelModal
          onClose={handleCloseAdmin}
          currentUser={currentUser}
          onOpenListing={handleOpenListingDetail}
          onEditListing={(ad) => {
            handleCloseAdmin();
            setEditingListing(ad);
            handleOpenCreateAdWithType(ad.type);
          }}
        />
      )}

      {statusModalOpen && (
        <SystemStatusModal
          onClose={handleCloseStatus}
          onOpenAdmin={() => {
            handleCloseStatus();
            handleOpenAdmin();
          }}
        />
      )}

      {chatTarget && currentUser && (
        <ChatModal
          targetUser={chatTarget}
          currentUser={currentUser}
          onClose={handleCloseChat}
        />
      )}

    </div>
  );
}

export default function App() {
  return (
    <I18nProvider>
      <MainApp />
    </I18nProvider>
  );
}
