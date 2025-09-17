/*
 * 🛡️ DAYBOARD PROPRIETARY CODE
 * (Enhanced Profile View - Performance Optimized)
 */

'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import {
  Edit,
  Save,
  Home,
  Bell,
  Users,
  Copy,
  UserPlus,
  Star,
  Gift,
  Clock,
  Zap,
  X
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/utils/supabase/client';
import { Database } from '@/src/lib/types_db';
import { toastHelpers } from '@/utils/toast';
import { GoogleAddressInput } from '@/components/ui/GoogleAddressInput';

// Lazy load the map widget to prevent SSR issues
const HouseholdMapWidget = dynamic(
  () =>
    import('@/components/dashboard/HouseholdMapWidget').then((m) => ({
      default: m.HouseholdMapWidget
    })),
  {
    ssr: false,
    loading: () => (
      <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-32 mb-4"></div>
        <div className="h-48 bg-gray-200 rounded-lg"></div>
      </div>
    )
  }
);

// Lazy permissions tab with better loading
const PermissionsTab = dynamic(() => import('./PermissionsTab'), {
  ssr: false,
  loading: () => (
    <div
      className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse"
      id="panel-permissions"
      role="tabpanel"
      aria-labelledby="tab-permissions"
    >
      <div className="h-4 bg-gray-200 rounded w-32 mb-4"></div>
      <div className="space-y-3">
        <div className="h-3 bg-gray-200 rounded w-full"></div>
        <div className="h-3 bg-gray-200 rounded w-3/4"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      </div>
    </div>
  )
});

// Types
type UserPermissionsRow =
  Database['public']['Tables']['user_permissions']['Row'];

type ProfileFormState = {
  name: string;
  preferred_name: string;
  phone_number: string;
  date_of_birth: string;
  timezone: string;
  language: string;
  bio: string;
  dietary_preferences: string[];
  allergies: string[];
  notification_email: boolean;
  notification_push: boolean;
  notification_sms: boolean;
  notification_daycare_pickup_backup: boolean;
};

const EMPTY_PROFILE: ProfileFormState = {
  name: '',
  preferred_name: '',
  phone_number: '',
  date_of_birth: '',
  timezone: '',
  language: 'en',
  bio: '',
  dietary_preferences: [],
  allergies: [],
  notification_email: true,
  notification_push: true,
  notification_sms: false,
  notification_daycare_pickup_backup: false
};

const LANGUAGE_OPTIONS = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Spanish' },
  { code: 'fr', label: 'French' },
  { code: 'de', label: 'German' },
  { code: 'it', label: 'Italian' }
];

const DIETARY_OPTIONS = [
  'none',
  'vegetarian',
  'vegan',
  'pescatarian',
  'gluten_free',
  'dairy_free',
  'keto',
  'paleo'
];
const ALLERGY_OPTIONS = [
  'none',
  'peanuts',
  'tree_nuts',
  'shellfish',
  'fish',
  'milk',
  'eggs',
  'wheat',
  'soy',
  'sesame'
];

// Phone number formatting function
const formatPhoneNumber = (value: string): string => {
  // Remove all non-digits
  const digits = value.replace(/\D/g, '');

  // Limit to 10 digits
  const limitedDigits = digits.slice(0, 10);

  // Format as (XXX) XXX-XXXX
  if (limitedDigits.length >= 6) {
    return `(${limitedDigits.slice(0, 3)}) ${limitedDigits.slice(3, 6)}-${limitedDigits.slice(6)}`;
  } else if (limitedDigits.length >= 3) {
    return `(${limitedDigits.slice(0, 3)}) ${limitedDigits.slice(3)}`;
  } else if (limitedDigits.length > 0) {
    return limitedDigits;
  }
  return '';
};

// Clean phone number for database storage (digits only)
const cleanPhoneNumber = (value: string): string => {
  return value.replace(/\D/g, '');
};

// Format timezone for display (e.g., "America/New_York" -> "New York EST")
const formatTimezone = (timezone: string): string => {
  if (!timezone) return '';

  // Common timezone mappings
  const timezoneMap: { [key: string]: string } = {
    'America/New_York': 'New York EST',
    'America/Los_Angeles': 'Los Angeles PST',
    'America/Chicago': 'Chicago CST',
    'America/Denver': 'Denver MST',
    'America/Phoenix': 'Phoenix MST',
    'America/Anchorage': 'Anchorage AKST',
    'Pacific/Honolulu': 'Honolulu HST',
    'Europe/London': 'London GMT',
    'Europe/Paris': 'Paris CET',
    'Europe/Berlin': 'Berlin CET',
    'Asia/Tokyo': 'Tokyo JST',
    'Asia/Shanghai': 'Shanghai CST',
    'Australia/Sydney': 'Sydney AEDT'
  };

  // Return mapped timezone or try to format the input
  if (timezoneMap[timezone]) {
    return timezoneMap[timezone];
  }

  // Try to extract city name and make it readable
  const parts = timezone.split('/');
  if (parts.length > 1) {
    const city = parts[parts.length - 1].replace(/_/g, ' ');
    return city;
  }

  return timezone;
};

// Type for household member with limited fields from query
type HouseholdMember = {
  id: string;
  name: string | null;
  preferred_name: string | null;
  role: 'super_admin' | 'admin' | 'member' | null;
  family_role: string | null;
  avatar_url: string | null;
  last_seen_at: string | null;
};

export default function ProfileViewImproved() {
  const {
    user,
    profile,
    permissions,
    loading: authLoading,
    refreshUser
  } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  // Simple loading state management - just track initial load completion
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // Set initial load complete once auth loading finishes
  useEffect(() => {
    if (!authLoading && !initialLoadComplete) {
      setInitialLoadComplete(true);
    }
  }, [authLoading, initialLoadComplete]);

  // Household
  const [household, setHousehold] = useState<
    Database['public']['Tables']['households']['Row'] | null
  >(null);
  const [householdMembers, setHouseholdMembers] = useState<HouseholdMember[]>(
    []
  );
  const [householdLoading, setHouseholdLoading] = useState(false);
  const [referralCode, setReferralCode] = useState<string>('');

  // UI
  const [activeTab, setActiveTab] = useState<
    'overview' | 'household-settings' | 'permissions'
  >('overview');
  const [overviewEditMode, setOverviewEditMode] = useState(false);
  const [editHighlight, setEditHighlight] = useState(false);

  // Forms
  const [profileForm, setProfileForm] =
    useState<ProfileFormState>(EMPTY_PROFILE);
  const originalProfileRef = useRef<ProfileFormState | null>(null);
  const [permissionsForm, setPermissionsForm] = useState<
    Partial<UserPermissionsRow>
  >({});
  const [householdForm, setHouseholdForm] = useState<{
    name: string;
    household_type:
      | 'solo_user'
      | 'roommate_household'
      | 'couple_no_kids'
      | 'family_household'
      | 'single_parent_household'
      | 'multi_generational_household';
    address: string;
    city: string;
    state: string;
    zip: string;
    coordinates?: { lat: number; lng: number };
  }>({
    name: '',
    household_type: 'family_household',
    address: '',
    city: '',
    state: '',
    zip: '',
    coordinates: undefined
  });

  // Saving / feedback
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPermissions, setSavingPermissions] = useState(false);
  const [savingHousehold, setSavingHousehold] = useState(false);

  const [profileFeedback, setProfileFeedback] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);
  const [permissionsFeedback, setPermissionsFeedback] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);
  const [householdFeedback, setHouseholdFeedback] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  // Loading gate
  const [initialLoading, setInitialLoading] = useState(true);

  // Fetch household and members
  useEffect(() => {
    const run = async () => {
      if (!profile?.household_id) {
        setHousehold(null);
        setHouseholdMembers([]);
        setInitialLoading(false);
        return;
      }
      setHouseholdLoading(true);

      try {
        // Fetch household and members in parallel for better performance
        const [householdResult, membersResult] = await Promise.all([
          supabase
            .from('households')
            .select('*')
            .eq('id', profile.household_id)
            .single(),
          supabase
            .from('profiles')
            .select(
              'id, name, preferred_name, role, family_role, avatar_url, last_seen_at'
            )
            .eq('household_id', profile.household_id)
            .order('role', { ascending: false })
            .order('name')
        ]);

        // Handle household not found gracefully
        if (householdResult.error && householdResult.error.code === 'PGRST116') {
          console.warn('⚠️ Household not found for profile, clearing household_id');
          // Clear the invalid household_id from profile
          await supabase
            .from('profiles')
            .update({ household_id: null })
            .eq('id', profile.id);
          
          // Refresh user data to get updated profile
          await refreshUser();
          setHousehold(null);
          setHouseholdMembers([]);
        } else {
          if (!householdResult.error) setHousehold(householdResult.data);
          if (!membersResult.error) setHouseholdMembers(membersResult.data || []);
        }
      } catch (error) {
        console.error('Error fetching household data:', error);
        setHousehold(null);
        setHouseholdMembers([]);
      }

      setHouseholdLoading(false);
      setInitialLoading(false);
    };

    // Only run after initial auth load is complete
    if (initialLoadComplete && profile) {
      run();
    }
  }, [profile?.household_id, supabase, initialLoadComplete, profile, refreshUser]);

  // Generate referral code
  useEffect(() => {
    const generateReferralCode = () => {
      if (profile?.id) {
        // Create a simple referral code based on user ID and timestamp
        const code = `DB${profile.id.slice(0, 6).toUpperCase()}${Date.now().toString().slice(-4)}`;
        setReferralCode(code);
      }
    };
    generateReferralCode();
  }, [profile]);

  // Redirect if onboarding incomplete - but only once per session
  const hasRedirectedToSetup = useRef(false);
  useEffect(() => {
    if (initialLoadComplete && profile && !profile.onboarding_completed) {
      if (!hasRedirectedToSetup.current) {
        hasRedirectedToSetup.current = true;
        console.log('🔄 Redirecting to profile setup - onboarding incomplete');
        router.replace('/profile/setup');
      }
    }
  }, [initialLoadComplete, profile, router]);

  // Seed profile form
  useEffect(() => {
    if (profile) {
      const next: ProfileFormState = {
        name: profile.preferred_name || profile.name || '',
        preferred_name: profile.preferred_name || '',
        phone_number: formatPhoneNumber(profile.phone_number || ''),
        date_of_birth: profile.date_of_birth || '',
        timezone: profile.timezone || '',
        language: profile.language || 'en',
        bio: profile.bio || '',
        dietary_preferences: Array.isArray(profile.dietary_preferences)
          ? (profile.dietary_preferences as string[])
          : [],
        allergies: Array.isArray(profile.allergies)
          ? (profile.allergies as string[])
          : [],
        notification_email:
          (profile.notification_preferences as Record<string, boolean>)
            ?.email ?? true,
        notification_push:
          (profile.notification_preferences as Record<string, boolean>)?.push ??
          true,
        notification_sms:
          (profile.notification_preferences as Record<string, boolean>)?.sms ??
          false,
        notification_daycare_pickup_backup:
          (profile.notification_preferences as Record<string, boolean>)
            ?.daycare_pickup_backup ?? false
      };
      setProfileForm(next);
      originalProfileRef.current = next; // baseline
    }
  }, [profile]);

  // Seed permissions form
  useEffect(() => {
    if (permissions) {
      setPermissionsForm(permissions);
    } else {
      // Initialize with default values for all permissions if no record exists
      setPermissionsForm({
        dashboard: true, // Default to true for core features
        profile: true,
        meals: false,
        lists: false,
        work: false,
        projects: false,
        sports_ticker: false,
        financial_tracking: false,
        ai_features: false,
        household_management: false,
        user_management: false,
        feature_management: false,
        billing_management: false,
        system_admin: false,
        global_feature_control: false,
        analytics_dashboard: false
      });
    }
  }, [permissions]);

  // Seed household form
  useEffect(() => {
    if (household) {
      // Note: coordinates field removed from schema, using city/state instead
      const coordinates = undefined;

      setHouseholdForm({
        name: household.name || '',
        household_type: household.household_type || 'family_household',
        address: household.address || '',
        city: household.city || '',
        state: household.state || '',
        zip: household.zip || '',
        coordinates
      });
    }
  }, [household?.id, household]);

  // Auto clear success messages
  useEffect(() => {
    if (profileFeedback?.type === 'success') {
      const t = setTimeout(() => setProfileFeedback(null), 4000);
      return () => clearTimeout(t);
    }
  }, [profileFeedback]);
  useEffect(() => {
    if (permissionsFeedback?.type === 'success') {
      const t = setTimeout(() => setPermissionsFeedback(null), 4000);
      return () => clearTimeout(t);
    }
  }, [permissionsFeedback]);
  useEffect(() => {
    if (householdFeedback?.type === 'success') {
      const t = setTimeout(() => setHouseholdFeedback(null), 4000);
      return () => clearTimeout(t);
    }
  }, [householdFeedback]);

  // Tab focus mgmt
  const lastLoggedTabRef = useRef<string | undefined>();
  useEffect(() => {
    if (lastLoggedTabRef.current !== activeTab) {
      lastLoggedTabRef.current = activeTab;
    }
    const el = document.getElementById(`panel-${activeTab}`);
    if (el) {
      el.setAttribute('tabindex', '-1');
      el.focus();
    }
  }, [activeTab]);

  const handleProfileChange = (
    field: keyof ProfileFormState,
    value: string | number | boolean | string[] | null
  ) => setProfileForm((p) => ({ ...p, [field]: value }));

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhoneNumber(value);
    setProfileForm((p) => ({ ...p, phone_number: formatted }));
  };

  const toggleMultiSelect = (
    field: 'dietary_preferences' | 'allergies',
    value: string
  ) => {
    setProfileForm((p) => {
      const currentArray = p[field];
      const exists = currentArray.includes(value);

      let next: string[];

      if (value === 'none') {
        // If selecting "none", clear all other options
        next = exists ? [] : ['none'];
      } else {
        // If selecting any other option, remove "none" if it exists
        const withoutNone = currentArray.filter((v) => v !== 'none');
        next = exists
          ? withoutNone.filter((v) => v !== value) // Remove the clicked option
          : [...withoutNone, value]; // Add the clicked option
      }

      return { ...p, [field]: next };
    });
  };

  const profileDirty = (() => {
    const base = originalProfileRef.current;
    if (!base) return false;
    return Object.keys(base).some((k) => {
      const a = (base as Record<string, unknown>)[k];
      const b = (profileForm as Record<string, unknown>)[k];
      if (Array.isArray(a) && Array.isArray(b))
        return a.slice().sort().join(',') !== b.slice().sort().join(',');
      return a !== b;
    });
  })();

  const saveProfile = useCallback(async () => {
    if (!profile) return;

    setSavingProfile(true);
    setProfileFeedback(null);

    try {
      const updateData = {
        name: profileForm.name,
        preferred_name: profileForm.preferred_name,
        phone_number: cleanPhoneNumber(profileForm.phone_number),
        date_of_birth: profileForm.date_of_birth,
        timezone: profileForm.timezone,
        language: profileForm.language,
        bio: profileForm.bio,
        dietary_preferences: profileForm.dietary_preferences,
        allergies: profileForm.allergies,
        notification_preferences: {
          email: profileForm.notification_email,
          push: profileForm.notification_push,
          sms: profileForm.notification_sms,
          daycare_pickup_backup: profileForm.notification_daycare_pickup_backup
        }
      };

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', profile.id);

      if (error) throw error;

      await refreshUser();
      originalProfileRef.current = { ...profileForm };

      toastHelpers.success('Profile updated');
      setProfileFeedback({ type: 'success', message: 'Profile updated' });
    } catch (e: unknown) {
      const errorMessage =
        e instanceof Error ? e.message : 'Failed to update profile';
      toastHelpers.error(errorMessage);
      setProfileFeedback({ type: 'error', message: errorMessage });
    } finally {
      setSavingProfile(false);
    }
  }, [profile, profileForm, supabase, refreshUser]);

  const savePermissions = useCallback(async () => {
    if (!permissions || !profile) return;
    setSavingPermissions(true);
    setPermissionsFeedback(null);
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, user_id, created_at, updated_at, ...rest } =
        permissionsForm as Record<string, unknown>;
      const { error } = await supabase
        .from('user_permissions')
        .update(rest)
        .eq('id', permissions.id);
      if (error) throw error;
      toastHelpers.success('Permissions updated');
      setPermissionsFeedback({
        type: 'success',
        message: 'Permissions updated'
      });
    } catch (e: unknown) {
      const errorMessage =
        e instanceof Error ? e.message : 'Failed to update permissions';
      toastHelpers.error(errorMessage);
      setPermissionsFeedback({ type: 'error', message: errorMessage });
    } finally {
      setSavingPermissions(false);
    }
  }, [permissions, profile, permissionsForm, supabase]);

  const saveHousehold = useCallback(async () => {
    if (!household?.id) return;
    setSavingHousehold(true);
    setHouseholdFeedback(null);
    try {
      // Prepare the update data with proper types
      const updateData: {
        name: string;
        household_type: Database['public']['Enums']['household_type'];
        address: string;
        city: string;
        state: string;
        zip: string;
        coordinates?: string;
      } = {
        name: householdForm.name,
        household_type:
          householdForm.household_type as Database['public']['Enums']['household_type'],
        address: householdForm.address,
        city: householdForm.city,
        state: householdForm.state,
        zip: householdForm.zip
      };

      // Add coordinates if available
      if (householdForm.coordinates) {
        updateData.coordinates = JSON.stringify(householdForm.coordinates);
      }

      const { data, error } = await supabase
        .from('households')
        .update(updateData)
        .eq('id', household.id)
        .select('*')
        .single();
      if (error) throw error;
      setHousehold((prev: Record<string, unknown> | null) => ({
        ...prev,
        ...(data || {})
      }));
      toastHelpers.success('Household updated');
      setHouseholdFeedback({ type: 'success', message: 'Household updated' });

      // Redirect back to overview tab after successful save
      setTimeout(() => {
        setActiveTab('overview');
      }, 500); // Small delay to show success message
    } catch (e: unknown) {
      const errorMessage =
        e instanceof Error ? e.message : 'Failed to update household';
      toastHelpers.error(errorMessage);
      setHouseholdFeedback({ type: 'error', message: errorMessage });
    } finally {
      setSavingHousehold(false);
    }
  }, [household?.id, householdForm, supabase, setActiveTab]);

  const readable = (val: string) =>
    val.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  const canHouseholdSettings =
    (permissionsForm.household_management === true ||
      profile?.role === 'super_admin' ||
      profile?.role === 'admin' ||
      household?.created_by === profile?.user_id ||
      household?.admin_id === profile?.id) &&
    !!household;

  // Debug logging for permissions
  useEffect(() => {
    console.log('Permission debug:', {
      profile_id: profile?.id,
      hasHousehold: !!household,
      profile_role: profile?.role,
      profile_user_id: profile?.user_id,
      household_admin_id: household?.admin_id,
      canHouseholdSettings,
      household_created_by: household?.created_by,
      household_management: permissionsForm.household_management
    });
  }, [
    permissionsForm.household_management,
    profile?.role,
    household,
    canHouseholdSettings,
    profile?.id,
    profile?.user_id
  ]);

  // Memoize expensive computations for better performance
  // Note: currentUserMember computed but not used in current implementation

  const sortedMembers = useMemo(
    () =>
      [...householdMembers].sort((a, b) => {
        // Sort by role (super_admin, admin, member), then by name
        const roleOrder = { super_admin: 0, admin: 1, member: 2 };
        const roleA = roleOrder[a.role as keyof typeof roleOrder] ?? 3;
        const roleB = roleOrder[b.role as keyof typeof roleOrder] ?? 3;
        if (roleA !== roleB) return roleA - roleB;
        return (a.preferred_name || a.name || '').localeCompare(
          b.preferred_name || b.name || ''
        );
      }),
    [householdMembers]
  );

  const copyToClipboard = useCallback(
    async (text: string, successMessage: string) => {
      try {
        await navigator.clipboard.writeText(text);
        toastHelpers.success(successMessage);
      } catch {
        toastHelpers.error('Failed to copy to clipboard');
      }
    },
    []
  );

  // Prevent sitting on forbidden tab if perms change
  useEffect(() => {
    if (activeTab === 'household-settings' && !canHouseholdSettings)
      setActiveTab('overview');
  }, [activeTab, canHouseholdSettings]);

  // Inline edit highlight on enter
  useEffect(() => {
    if (overviewEditMode) {
      setEditHighlight(true);
      const t = setTimeout(() => setEditHighlight(false), 1200);
      return () => clearTimeout(t);
    }
  }, [overviewEditMode]);

  const renderTabs = () => {
    const ordered: { key: typeof activeTab; label: string; show: boolean }[] = [
      { key: 'overview', label: 'Overview', show: true },
      {
        key: 'household-settings',
        label: 'Household Settings',
        show: canHouseholdSettings
      },
      { key: 'permissions', label: 'Permissions', show: true }
    ];
    const visible = ordered.filter((t) => t.show);
    const onKey = (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault();
        const idx = visible.findIndex((t) => t.key === activeTab);
        if (idx === -1) return;
        const delta = e.key === 'ArrowRight' ? 1 : -1;
        const next = visible[(idx + delta + visible.length) % visible.length];
        setActiveTab(next.key);
      }
    };
    return (
      <div
        className="mb-8"
        role="tablist"
        aria-label="Profile sections"
        onKeyDown={onKey}
      >
        <div className="flex flex-wrap items-center gap-2 p-1 bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/60 shadow-lg">
          {visible.map((t) => (
            <button
              key={t.key}
              id={`tab-${t.key}`}
              role="tab"
              aria-selected={activeTab === t.key}
              aria-controls={`panel-${t.key}`}
              tabIndex={activeTab === t.key ? 0 : -1}
              onClick={() => setActiveTab(t.key)}
              className={`px-6 py-3 text-sm font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                activeTab === t.key
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg transform scale-105'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/70'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderSkeleton = () => (
    <div className="max-w-6xl mx-auto animate-pulse" aria-hidden="true">
      <div className="h-10 w-40 bg-gray-200 rounded mb-8" />
      <div className="h-8 w-60 bg-gray-200 rounded mb-6" />
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="h-64 bg-white/60 rounded-xl border border-gray-200" />
          <div className="h-40 bg-white/60 rounded-xl border border-gray-200" />
        </div>
        <div className="space-y-6">
          <div className="h-48 bg-white/60 rounded-xl border border-gray-200" />
          <div className="h-40 bg-white/60 rounded-xl border border-gray-200" />
        </div>
      </div>
    </div>
  );

  const renderOverviewTab = () => {
    if (!profile) return null;
    return (
      <div className="space-y-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8 hover:shadow-2xl transition-all duration-300 relative">
            {/* Edit button moved to top right corner */}
            {!overviewEditMode && (
              <button
                onClick={() => {
                  // console.log('Profile edit button clicked, enabling inline editing mode'); // Removed to prevent render loops
                  setOverviewEditMode(true);
                }}
                className="absolute top-6 right-6 px-4 py-2 rounded-lg bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 text-sm font-semibold hover:from-gray-200 hover:to-gray-300 shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2 border-0"
              >
                <Edit className="w-4 h-4" /> Edit Profile
              </button>
            )}

            <div className="flex items-start gap-6 mb-8">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center text-white text-3xl font-bold shadow-xl">
                  {(
                    profile.preferred_name ||
                    profile.name ||
                    user?.email ||
                    'U'
                  )
                    .charAt(0)
                    .toUpperCase()}
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-3 border-white shadow-lg"></div>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-3xl font-bold text-gray-900 leading-tight mb-2">
                  {profile.preferred_name || profile.name || 'No name set'}
                </h2>
                {profile.family_role && (
                  <span className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-full text-sm font-semibold tracking-wide shadow-sm">
                    {readable(profile.family_role)}
                  </span>
                )}
              </div>
            </div>

            {!overviewEditMode ? (
              // Display mode - show as facts/truth
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="group">
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        Full Name
                      </h4>
                      <p className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {profileForm.name || (
                          <span className="text-gray-400 italic">Not set</span>
                        )}
                      </p>
                    </div>
                    <div className="group">
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        Phone Number
                      </h4>
                      <p className="text-xl font-semibold text-gray-900 group-hover:text-green-600 transition-colors">
                        {profileForm.phone_number || (
                          <span className="text-gray-400 italic">Not set</span>
                        )}
                      </p>
                    </div>
                    <div className="group">
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                        Date of Birth
                      </h4>
                      <p className="text-xl font-semibold text-gray-900 group-hover:text-pink-600 transition-colors">
                        {profileForm.date_of_birth ? (
                          new Date(
                            profileForm.date_of_birth + 'T00:00:00'
                          ).toLocaleDateString()
                        ) : (
                          <span className="text-gray-400 italic">Not set</span>
                        )}
                      </p>
                    </div>
                    <div className="group">
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        Email
                      </h4>
                      <p className="text-xl font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">
                        {user?.email || (
                          <span className="text-gray-400 italic">Not set</span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="group">
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                        Timezone
                      </h4>
                      <p className="text-xl font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                        {formatTimezone(profileForm.timezone) || (
                          <span className="text-gray-400 italic">Not set</span>
                        )}
                      </p>
                    </div>
                    <div className="group">
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        Language
                      </h4>
                      <p className="text-xl font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                        {LANGUAGE_OPTIONS.find(
                          (l) => l.code === profileForm.language
                        )?.label || 'English'}
                      </p>
                    </div>
                    <div className="group">
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                        Bio
                      </h4>
                      <p className="text-lg leading-relaxed text-gray-800 group-hover:text-teal-600 transition-colors">
                        {profileForm.bio || (
                          <span className="text-gray-400 italic">
                            No bio added
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {(profileForm.dietary_preferences.length > 0 ||
                  profileForm.allergies.length > 0) && (
                  <div className="border-t border-gray-100 pt-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {profileForm.dietary_preferences.length > 0 && (
                        <div>
                          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            Dietary Preferences
                          </h4>
                          <div className="flex flex-wrap gap-3">
                            {profileForm.dietary_preferences.map((pref) => (
                              <span
                                key={pref}
                                className="px-4 py-2 bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 rounded-full text-sm font-semibold shadow-sm hover:shadow-md transition-all"
                              >
                                {readable(pref)}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {profileForm.allergies.length > 0 && (
                        <div>
                          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            Allergies
                          </h4>
                          <div className="flex flex-wrap gap-3">
                            {profileForm.allergies.map((allergy) => (
                              <span
                                key={allergy}
                                className="px-4 py-2 bg-gradient-to-r from-red-100 to-pink-100 text-red-800 rounded-full text-sm font-semibold shadow-sm hover:shadow-md transition-all"
                              >
                                {readable(allergy)}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="border-t border-gray-100 pt-8">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-6 flex items-center gap-2">
                    <Bell className="w-4 h-4 text-blue-500" />
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Notification Preferences
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      {
                        key: 'notification_email',
                        label: 'Email Notifications',
                        enabled: profileForm.notification_email,
                        color: 'blue'
                      },
                      {
                        key: 'notification_push',
                        label: 'Push Notifications',
                        enabled: profileForm.notification_push,
                        color: 'purple'
                      },
                      {
                        key: 'notification_sms',
                        label: 'SMS Notifications',
                        enabled: profileForm.notification_sms,
                        color: 'green'
                      },
                      {
                        key: 'notification_daycare_pickup_backup',
                        label: 'Daycare Pickup Backup',
                        enabled: profileForm.notification_daycare_pickup_backup,
                        color: 'orange'
                      }
                    ].map((item) => (
                      <div
                        key={item.key}
                        className="flex items-center gap-4 p-4 bg-white/50 rounded-2xl border border-gray-100 hover:bg-white/80 transition-all"
                      >
                        <div
                          className={`w-4 h-4 rounded-full flex items-center justify-center ${item.enabled ? 'bg-green-500' : 'bg-gray-300'} transition-all`}
                        >
                          {item.enabled && (
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          )}
                        </div>
                        <span
                          className={`text-sm font-semibold flex-1 ${item.enabled ? 'text-gray-900' : 'text-gray-500'}`}
                        >
                          {item.label}
                        </span>
                        <span
                          className={`text-xs px-3 py-1.5 rounded-full font-bold ${
                            item.enabled
                              ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {item.enabled ? 'ON' : 'OFF'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              // Edit mode - full form
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  saveProfile().then(() => setOverviewEditMode(false));
                }}
                className={`mt-2 pt-4 border-t space-y-8 rounded-md outline-offset-2 transition-shadow ${editHighlight ? 'outline outline-2 outline-purple-400/70 shadow-md' : ''}`}
                aria-label="Inline profile editor"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                      Full Name
                    </label>
                    <input
                      value={profileForm.name}
                      onChange={(e) =>
                        handleProfileChange('name', e.target.value)
                      }
                      className="w-full px-3 py-2 rounded-md border border-gray-300 bg-white text-gray-900 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                      Preferred Name
                    </label>
                    <input
                      value={profileForm.preferred_name}
                      onChange={(e) =>
                        handleProfileChange('preferred_name', e.target.value)
                      }
                      className="w-full px-3 py-2 rounded-md border border-gray-300 bg-white text-gray-900 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                      Phone
                    </label>
                    <input
                      value={profileForm.phone_number}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      placeholder="(555) 123-4567"
                      maxLength={14}
                      className="w-full px-3 py-2 rounded-md border border-gray-300 bg-white text-gray-900 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={profileForm.date_of_birth}
                      onChange={(e) =>
                        handleProfileChange('date_of_birth', e.target.value)
                      }
                      className="w-full px-3 py-2 rounded-md border border-gray-300 bg-white text-gray-900 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                      Timezone
                    </label>
                    <input
                      value={profileForm.timezone}
                      onChange={(e) =>
                        handleProfileChange('timezone', e.target.value)
                      }
                      placeholder="e.g., America/New_York (EST), America/Los_Angeles (PST)"
                      className="w-full px-3 py-2 rounded-md border border-gray-300 bg-white text-gray-900 focus:ring-purple-500 focus:border-purple-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Use format: Region/City (Timezone abbreviation)
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                      Language
                    </label>
                    <select
                      value={profileForm.language}
                      onChange={(e) =>
                        handleProfileChange('language', e.target.value)
                      }
                      className="w-full px-3 py-2 rounded-md border border-gray-300 bg-white text-gray-900 focus:ring-purple-500 focus:border-purple-500"
                    >
                      {LANGUAGE_OPTIONS.map((l) => (
                        <option key={l.code} value={l.code}>
                          {l.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                      Bio
                    </label>
                    <textarea
                      rows={3}
                      value={profileForm.bio}
                      onChange={(e) =>
                        handleProfileChange('bio', e.target.value)
                      }
                      className="w-full px-3 py-2 rounded-md border border-gray-300 bg-white text-gray-900 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                      Dietary Preferences
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {DIETARY_OPTIONS.map((opt) => {
                        const checked =
                          profileForm.dietary_preferences.includes(opt);
                        return (
                          <label
                            key={opt}
                            className={`flex items-center gap-2 text-xs font-medium rounded-md px-2 py-1.5 border cursor-pointer select-none ${checked ? 'bg-green-50 border-green-300 text-green-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                          >
                            <input
                              type="checkbox"
                              className="h-3.5 w-3.5 text-purple-600 rounded border-gray-300"
                              checked={checked}
                              onChange={() =>
                                toggleMultiSelect('dietary_preferences', opt)
                              }
                            />
                            {readable(opt)}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                      Allergies
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {ALLERGY_OPTIONS.map((opt) => {
                        const checked = profileForm.allergies.includes(opt);
                        return (
                          <label
                            key={opt}
                            className={`flex items-center gap-2 text-xs font-medium rounded-md px-2 py-1.5 border cursor-pointer select-none ${checked ? 'bg-red-50 border-red-300 text-red-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                          >
                            <input
                              type="checkbox"
                              className="h-3.5 w-3.5 text-purple-600 rounded border-gray-300"
                              checked={checked}
                              onChange={() =>
                                toggleMultiSelect('allergies', opt)
                              }
                            />
                            {readable(opt)}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <h4 className="text-xs font-semibold text-gray-600 mb-3 uppercase tracking-wide flex items-center gap-2">
                      <Bell className="w-4 h-4 text-purple-500" /> Notification
                      Preferences
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {[
                        {
                          key: 'notification_email',
                          label: 'Email Notifications'
                        },
                        {
                          key: 'notification_push',
                          label: 'Push Notifications'
                        },
                        { key: 'notification_sms', label: 'SMS Notifications' },
                        {
                          key: 'notification_daycare_pickup_backup',
                          label: 'Daycare Pickup Backup'
                        }
                      ].map((item) => (
                        <label
                          key={item.key}
                          className="flex items-center gap-2 text-sm font-medium text-gray-800"
                        >
                          <input
                            type="checkbox"
                            className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                            checked={Boolean(
                              (profileForm as Record<string, unknown>)[item.key]
                            )}
                            onChange={() =>
                              handleProfileChange(
                                item.key as keyof ProfileFormState,
                                !Boolean(
                                  (profileForm as Record<string, unknown>)[
                                    item.key
                                  ]
                                )
                              )
                            }
                          />
                          {item.label}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                {profileFeedback && (
                  <div
                    className={`text-sm ${profileFeedback.type === 'error' ? 'text-red-600' : profileFeedback.type === 'success' ? 'text-green-600' : 'text-gray-600'}`}
                  >
                    {profileFeedback.message}
                  </div>
                )}
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setOverviewEditMode(false);
                      setProfileFeedback(null);
                    }}
                    className="px-4 py-2 text-sm font-medium rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus-visible:ring"
                  >
                    Cancel
                  </button>
                  <button
                    type={profileDirty ? 'submit' : 'button'}
                    onClick={
                      profileDirty
                        ? undefined
                        : () => setOverviewEditMode(false)
                    }
                    disabled={savingProfile}
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-md bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 disabled:opacity-60 focus:outline-none focus-visible:ring focus-visible:ring-purple-500"
                  >
                    {savingProfile ? (
                      <div className="animate-spin h-4 w-4 border-b-2 border-white rounded-full" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}{' '}
                    {savingProfile
                      ? 'Saving...'
                      : profileDirty
                        ? 'Save Changes'
                        : 'No Changes'}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Household Info with Members */}
            {household && (
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                    <Home className="w-4 h-4 text-white" />
                  </div>
                  Household
                </h3>

                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-50/50 to-purple-50/50 border border-indigo-100/50">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                      Household Name
                    </p>
                    <p className="text-lg font-bold text-gray-900">
                      {household.name || 'Unnamed Household'}
                    </p>
                  </div>

                  {household.household_type && (
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50/50 to-indigo-50/50 border border-blue-100/50">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                        Type
                      </p>
                      <p className="text-sm font-semibold text-gray-800">
                        {readable(household.household_type)}
                      </p>
                    </div>
                  )}

                  {(household.address || household.city || household.state) && (
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-50/50 to-amber-50/50 border border-orange-100/50">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                        Address
                      </p>
                      <p className="text-sm font-semibold text-gray-800 leading-relaxed">
                        {household.address && `${household.address}`}
                        {household.address &&
                          (household.city || household.state) && <br />}
                        {household.city && `${household.city}`}
                        {household.city && household.state && ', '}
                        {household.state && `${household.state}`}
                        {household.zip && ` ${household.zip}`}
                      </p>
                    </div>
                  )}

                  {/* Household Members Section - Integrated */}
                  {householdMembers.length > 0 && (
                    <div className="pt-4 border-t border-gray-100">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Household Members
                        <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-blue-500 rounded-full">
                          {householdMembers.length}
                        </span>
                      </p>
                      <div className="space-y-3">
                        {sortedMembers.map((member) => (
                          <div
                            key={member.id}
                            className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-gray-50/50 to-white/50 border border-gray-100/50 hover:from-blue-50/50 hover:to-indigo-50/50 hover:border-blue-200/50 transition-all duration-200 group"
                          >
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 via-purple-500 to-indigo-600 rounded-xl flex items-center justify-center text-white text-xs font-bold shadow-lg group-hover:scale-105 transition-transform">
                              {(member.preferred_name || member.name || 'U')
                                .charAt(0)
                                .toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                                {member.preferred_name ||
                                  member.name ||
                                  'Unnamed'}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                                    member.role === 'super_admin'
                                      ? 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700'
                                      : member.role === 'admin'
                                        ? 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700'
                                        : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700'
                                  }`}
                                >
                                  {member.role === 'super_admin'
                                    ? 'Super Admin'
                                    : readable(member.role || 'member')}
                                </span>
                                {member.last_seen_at && (
                                  <span className="text-xs text-gray-500 flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {new Date(
                                      member.last_seen_at
                                    ).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Household Code for Invites */}
                  {household?.household_code && (
                    <div className="pt-4 border-t border-gray-100">
                      <p className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">
                        Invite new members
                      </p>
                      <div className="flex items-center gap-3">
                        <code className="flex-1 px-3 py-2 rounded-lg bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 text-sm font-mono border border-gray-200/50 shadow-inner">
                          {household.household_code}
                        </code>
                        <button
                          type="button"
                          onClick={() =>
                            household.household_code &&
                            copyToClipboard(
                              household.household_code,
                              'Household code copied!'
                            )
                          }
                          className="px-3 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 border-0"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {canHouseholdSettings && (
                    <button
                      onClick={() => {
                        console.log(
                          'Large household edit button clicked, switching to household-settings tab'
                        );
                        setActiveTab('household-settings');
                      }}
                      className="w-full mt-4 flex items-center justify-center gap-2 p-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      <Edit className="w-4 h-4" />
                      Edit Household Settings
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Household Location Map */}
            {household && (household.address || household.city) && (
              <HouseholdMapWidget className="border border-gray-200" />
            )}

            {/* Quick Actions */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                Quick Actions
              </h3>
              <div className="space-y-3">
                <button
                  onClick={() =>
                    copyToClipboard(referralCode, 'Referral code copied!')
                  }
                  className="w-full flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-emerald-50/50 to-teal-50/50 border border-emerald-100/50 hover:from-emerald-100/50 hover:to-teal-100/50 hover:border-emerald-200/50 text-left transition-all duration-200 group"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Gift className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">
                      Share Referral
                    </p>
                    <p className="text-sm text-gray-600">
                      Copy your referral code
                    </p>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('household-settings')}
                  disabled={!canHouseholdSettings}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-blue-50/50 to-indigo-50/50 border border-blue-100/50 hover:from-blue-100/50 hover:to-indigo-100/50 hover:border-blue-200/50 text-left transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Home className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                      Household Settings
                    </p>
                    <p className="text-sm text-gray-600">
                      Manage your household
                    </p>
                  </div>
                </button>
                <button
                  onClick={() => router.push('/profile/setup')}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-orange-50/50 to-amber-50/50 border border-orange-100/50 hover:from-orange-100/50 hover:to-amber-100/50 hover:border-orange-200/50 text-left transition-all duration-200 group"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                    <UserPlus className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
                      Complete Setup
                    </p>
                    <p className="text-sm text-gray-600">
                      Finish your profile setup
                    </p>
                  </div>
                </button>
              </div>

              {/* Referral Code Display */}
              {referralCode && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <h4 className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider flex items-center gap-2">
                    <Star className="w-3 h-3" /> Your Referral Code
                  </h4>
                  <div className="flex items-center gap-3">
                    <code className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 text-sm font-mono border border-purple-200/50 shadow-inner">
                      {referralCode}
                    </code>
                    <button
                      type="button"
                      onClick={() =>
                        copyToClipboard(referralCode, 'Referral code copied!')
                      }
                      className="px-4 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 border-0"
                    >
                      Copy
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 font-medium">
                    Share with friends to get rewards!
                  </p>
                </div>
              )}

              {/* Profile Completion */}
              {profile?.profile_completion_percentage != null && (
                <div className="mt-6 border-t pt-4">
                  <h4 className="text-xs uppercase tracking-wide text-gray-500 font-semibold mb-2">
                    Completion
                  </h4>
                  <div className="flex items-center justify-between mb-2 text-xs font-medium text-gray-700">
                    <span>Progress</span>
                    <span>{profile.profile_completion_percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                    <div
                      className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${profile.profile_completion_percentage}%`
                      }}
                    />
                  </div>
                  <p className="text-[11px] text-gray-500">
                    Keep adding info to unlock personalization.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const householdSettingsTab = !household ? (
    <div
      className="bg-white rounded-xl border border-gray-200 p-8 text-center"
      id="panel-household-settings"
      role="tabpanel"
      aria-labelledby="tab-household-settings"
    >
      <Home className="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        No Household Found
      </h3>
      <p className="text-gray-600 mb-4">
        You don&apos;t seem to be part of a household yet.
      </p>
      <button
        onClick={() => router.push('/profile/setup')}
        className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
      >
        <UserPlus className="w-4 h-4" />
        Set Up Household
      </button>
    </div>
  ) : (
    <div
      className="space-y-8"
      id="panel-household-settings"
      role="tabpanel"
      aria-labelledby="tab-household-settings"
    >
      <div className="sr-only" aria-live="polite">
        {householdFeedback?.message || ''}
      </div>

      {/* Header Section */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-6 border border-purple-200">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center">
            <Home className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Household Settings
            </h2>
            <p className="text-gray-600">
              Manage your household information and location
            </p>
          </div>
        </div>

        {/* Current Household Summary */}
        <div className="bg-white/70 rounded-xl p-4 border border-white/50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-500 font-medium mb-1">Current Name</p>
              <p className="font-semibold text-gray-900">
                {household.name || 'Unnamed Household'}
              </p>
            </div>
            <div>
              <p className="text-gray-500 font-medium mb-1">Type</p>
              <p className="font-semibold text-gray-900">
                {readable(household.household_type)}
              </p>
            </div>
            <div>
              <p className="text-gray-500 font-medium mb-1">Members</p>
              <p className="font-semibold text-gray-900">
                {householdMembers.length}{' '}
                {householdMembers.length === 1 ? 'member' : 'members'}
              </p>
            </div>
          </div>
          {(household.address || household.city || household.state) && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-gray-500 font-medium mb-1">Current Address</p>
              <p className="font-semibold text-gray-900">
                {household.address && `${household.address}`}
                {household.address &&
                  (household.city || household.state) &&
                  ', '}
                {household.city && `${household.city}`}
                {household.city && household.state && ', '}
                {household.state && `${household.state}`}
                {household.zip && ` ${household.zip}`}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          saveHousehold();
        }}
        className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 space-y-8"
      >
        <div className="border-b border-gray-200 pb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Basic Information
          </h3>
          <p className="text-gray-600">
            Update your household&apos;s basic details
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Household Name
            </label>
            <input
              value={householdForm.name}
              onChange={(e) =>
                setHouseholdForm((f) => ({ ...f, name: e.target.value }))
              }
              placeholder="Enter a name for your household (e.g., The Smith Family)"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
            />
            <p className="text-xs text-gray-500 mt-1">
              This will appear on your dashboard and shared spaces
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Household Type
            </label>
            <select
              value={householdForm.household_type}
              onChange={(e) =>
                setHouseholdForm((f) => ({
                  ...f,
                  household_type: e.target.value as typeof f.household_type
                }))
              }
              className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
            >
              <option value="solo_user">Solo User</option>
              <option value="roommate_household">Roommate Household</option>
              <option value="couple_no_kids">Couple (No Kids)</option>
              <option value="family_household">Family Household</option>
              <option value="single_parent_household">
                Single Parent Household
              </option>
              <option value="multi_generational_household">
                Multi-Generational
              </option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Choose the type that best describes your living situation
            </p>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Location</h3>
          <p className="text-gray-600 mb-6">
            Set your household address for location-based features
          </p>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Address
              </label>
              <GoogleAddressInput
                onAddressSelect={(addressData) => {
                  setHouseholdForm((f) => ({
                    ...f,
                    address: addressData.address,
                    city: addressData.city,
                    state: addressData.state,
                    zip: addressData.zip,
                    coordinates: addressData.coordinates
                  }));
                }}
                initialValue={`${householdForm.address ? householdForm.address + ', ' : ''}${householdForm.city ? householdForm.city + ', ' : ''}${householdForm.state ? householdForm.state + ' ' : ''}${householdForm.zip || ''}`
                  .trim()
                  .replace(/,$/, '')}
                placeholder="Start typing your address and select from suggestions..."
                className="text-gray-900 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Start typing and select from the dropdown to automatically fill
                in your complete address
              </p>
            </div>

            {/* Display selected address details (read-only) */}
            {(householdForm.address ||
              householdForm.city ||
              householdForm.state ||
              householdForm.zip) && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-purple-900 mb-2">
                  Selected Address:
                </h4>
                <div className="text-sm text-purple-800">
                  <div>{householdForm.address}</div>
                  <div>
                    {householdForm.city}, {householdForm.state}{' '}
                    {householdForm.zip}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Household Location Map */}
        {householdForm.address && householdForm.city && householdForm.state && (
          <div className="border-t border-gray-200 pt-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Location Preview
            </h3>
            <p className="text-gray-600 mb-6">
              Your household location as it will appear on the dashboard
            </p>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <HouseholdMapWidget className="border border-gray-300 rounded-lg" />
              <p className="text-xs text-gray-500 mt-3 text-center">
                📍 Interactive map showing your household location
              </p>
            </div>
          </div>
        )}

        {/* Feedback and Actions */}
        <div className="border-t border-gray-200 pt-8">
          {householdFeedback && (
            <div
              className={`p-4 rounded-lg mb-6 ${
                householdFeedback.type === 'error'
                  ? 'bg-red-50 border border-red-200 text-red-700'
                  : householdFeedback.type === 'success'
                    ? 'bg-green-50 border border-green-200 text-green-700'
                    : 'bg-blue-50 border border-blue-200 text-blue-700'
              }`}
            >
              <div className="flex items-center gap-2">
                {householdFeedback.type === 'success' && (
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                )}
                {householdFeedback.type === 'error' && (
                  <X className="w-5 h-5 text-red-500" />
                )}
                <span className="font-medium">{householdFeedback.message}</span>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => {
                // Reset form to original values
                if (household) {
                  setHouseholdForm({
                    name: household.name || '',
                    household_type:
                      household.household_type || 'family_household',
                    address: household.address || '',
                    city: household.city || '',
                    state: household.state || '',
                    zip: household.zip || ''
                  });
                }
                setHouseholdFeedback(null);
              }}
              className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
            >
              Reset Changes
            </button>
            <button
              type="submit"
              disabled={savingHousehold}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-indigo-700 disabled:opacity-60 shadow-lg hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {savingHousehold ? (
                <>
                  <div className="animate-spin h-4 w-4 border-b-2 border-white rounded-full" />
                  Saving Changes...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Household Settings
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );

  // Use stable loading state to prevent oscillation
  const showLoading = !initialLoadComplete || authLoading || householdLoading;
  const shouldHideForSetup =
    !showLoading && (!profile || !profile.onboarding_completed);

  console.log('🔍 [DEBUG] ProfileViewImproved state:', {
    profile: profile
      ? {
          id: profile.id,
          name: profile.name,
          household_id: profile.household_id,
          onboarding_completed: profile.onboarding_completed
        }
      : null,
    authLoading,
    showLoading,
    initialLoading,
    householdLoading,
    shouldHideForSetup
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 text-gray-900">
      {showLoading && (
        <div aria-label="Loading profile content" className="pb-16 p-4 md:p-8">
          {renderSkeleton()}
        </div>
      )}
      {!showLoading && !shouldHideForSetup && (
        <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent">
                Profile
              </h1>
              <p className="text-gray-600 text-lg font-medium">
                Manage your personal information, household, and preferences
              </p>
            </div>
          </div>
          {renderTabs()}
          {activeTab === 'overview' && (
            <div
              id="panel-overview"
              role="tabpanel"
              aria-labelledby="tab-overview"
            >
              {renderOverviewTab()}
            </div>
          )}
          {activeTab === 'household-settings' && householdSettingsTab}
          {activeTab === 'permissions' && (
            <PermissionsTab
              permissionsForm={permissionsForm}
              setPermissionsForm={setPermissionsForm}
              savePermissions={savePermissions}
              savingPermissions={savingPermissions}
              permissionsFeedback={permissionsFeedback}
            />
          )}
        </div>
      )}
    </div>
  );
}
