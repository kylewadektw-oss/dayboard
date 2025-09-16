/*
 * 🛡️ DAYBOARD PROPRIETARY CODE
 * (Rebuilt clean version 2025-09-09 after corruption)
 */

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { Edit, Save, Home, Shield, Bell, Settings } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/utils/supabase/client';
import { Database } from '@/src/lib/types_db';
import { toastHelpers } from '@/utils/toast';

// Lazy permissions tab
const PermissionsTab = dynamic(() => import('./PermissionsTab'), {
  ssr: false,
  loading: () => <div className="bg-white rounded-xl border border-gray-200 p-6 text-sm text-gray-600" id="panel-permissions" role="tabpanel" aria-labelledby="tab-permissions">Loading permissions…</div>
});

// Types
type UserPermissionsRow = Database['public']['Tables']['user_permissions']['Row'];

type ProfileFormState = {
  name: string; preferred_name: string; phone_number: string; date_of_birth: string; timezone: string; language: string; bio: string;
  dietary_preferences: string[]; allergies: string[];
  notification_email: boolean; notification_push: boolean; notification_sms: boolean; notification_daycare_pickup_backup: boolean;
};

const EMPTY_PROFILE: ProfileFormState = {
  name: '', preferred_name: '', phone_number: '', date_of_birth: '', timezone: '', language: 'en', bio: '',
  dietary_preferences: [], allergies: [],
  notification_email: true, notification_push: true, notification_sms: false, notification_daycare_pickup_backup: false
};

const LANGUAGE_OPTIONS = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Spanish' },
  { code: 'fr', label: 'French' },
  { code: 'de', label: 'German' },
  { code: 'it', label: 'Italian' }
];

const DIETARY_OPTIONS = ['vegetarian','vegan','pescatarian','gluten_free','dairy_free','keto','paleo'];
const ALLERGY_OPTIONS = ['peanuts','tree_nuts','shellfish','fish','milk','eggs','wheat','soy','sesame'];

interface WindowWithLogger extends Window {
  appLogger?: Console;
}

const appLogger = (typeof window !== 'undefined') ? (window as WindowWithLogger).appLogger || console : console;

export default function ProfileView() {
  const { user, profile, permissions, loading: authLoading, refreshUser } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  // Household
  const [household, setHousehold] = useState<Database['public']['Tables']['households']['Row'] | null>(null);
  const [householdLoading, setHouseholdLoading] = useState(false);

  // UI
  const [activeTab, setActiveTab] = useState<'overview' | 'household-settings' | 'permissions'>('overview');
  const [overviewEditMode, setOverviewEditMode] = useState(false);
  const [editHighlight, setEditHighlight] = useState(false);

  // Forms
  const [profileForm, setProfileForm] = useState<ProfileFormState>(EMPTY_PROFILE);
  const originalProfileRef = useRef<ProfileFormState | null>(null);
  const [permissionsForm, setPermissionsForm] = useState<Partial<UserPermissionsRow>>({});
  const [householdForm, setHouseholdForm] = useState<{ name: string; household_type: 'solo_user'|'roommate_household'|'couple_no_kids'|'family_household'|'single_parent_household'|'multi_generational_household'; address: string; city: string; state: string; zip: string; }>({
    name: '', household_type: 'family_household', address: '', city: '', state: '', zip: ''
  });

  // Saving / feedback
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPermissions, setSavingPermissions] = useState(false);
  const [savingHousehold, setSavingHousehold] = useState(false);

  const [profileFeedback, setProfileFeedback] = useState<{type:'success'|'error'|'info';message:string}|null>(null);
  const [permissionsFeedback, setPermissionsFeedback] = useState<{type:'success'|'error'|'info';message:string}|null>(null);
  const [householdFeedback, setHouseholdFeedback] = useState<{type:'success'|'error'|'info';message:string}|null>(null);

  // Loading gate
  const [initialLoading, setInitialLoading] = useState(true);

  // Fetch household
  useEffect(() => {
    const run = async () => {
      if (!profile?.household_id) { setHousehold(null); setInitialLoading(false); return; }
      setHouseholdLoading(true);
      const { data, error } = await supabase.from('households').select('*').eq('id', profile.household_id).single();
      if (!error) setHousehold(data);
      setHouseholdLoading(false);
      setInitialLoading(false);
    };
    if (!authLoading) run();
  }, [profile?.household_id, authLoading, supabase]);

  // Redirect if onboarding incomplete
  useEffect(() => {
    if (!authLoading && profile && !profile.onboarding_completed) {
      router.replace('/profile/setup');
    }
  }, [authLoading, profile, router]);

  // Seed profile form
  useEffect(() => {
    if (profile) {
      const next: ProfileFormState = {
        name: profile.preferred_name || profile.name || '',
        preferred_name: profile.preferred_name || '',
        phone_number: profile.phone_number || '',
        date_of_birth: profile.date_of_birth || '',
        timezone: profile.timezone || '',
        language: profile.language || 'en',
        bio: profile.bio || '',
        dietary_preferences: Array.isArray(profile.dietary_preferences) ? profile.dietary_preferences as string[] : [],
        allergies: Array.isArray(profile.allergies) ? profile.allergies as string[] : [],
        notification_email: (profile.notification_preferences as Record<string, boolean>)?.email ?? true,
        notification_push: (profile.notification_preferences as Record<string, boolean>)?.push ?? true,
        notification_sms: (profile.notification_preferences as Record<string, boolean>)?.sms ?? false,
        notification_daycare_pickup_backup: (profile.notification_preferences as Record<string, boolean>)?.daycare_pickup_backup ?? false,
      };
      setProfileForm(next);
      originalProfileRef.current = next; // baseline
    }
  }, [profile?.id, profile]);

  // Seed permissions form
  useEffect(() => { if (permissions) setPermissionsForm(permissions); }, [permissions]);

  // Seed household form
  useEffect(() => {
    if (household) {
      setHouseholdForm({
        name: household.name || '',
        household_type: household.household_type || 'family_household',
        address: household.address || '',
        city: household.city || '',
        state: household.state || '',
        zip: household.zip || ''
      });
    }
  }, [household?.id, household]);

  // Auto clear success messages
  useEffect(() => { if (profileFeedback?.type==='success') { const t=setTimeout(()=>setProfileFeedback(null),4000); return ()=>clearTimeout(t);} }, [profileFeedback]);
  useEffect(() => { if (permissionsFeedback?.type==='success') { const t=setTimeout(()=>setPermissionsFeedback(null),4000); return ()=>clearTimeout(t);} }, [permissionsFeedback]);
  useEffect(() => { if (householdFeedback?.type==='success') { const t=setTimeout(()=>setHouseholdFeedback(null),4000); return ()=>clearTimeout(t);} }, [householdFeedback]);

  // Tab focus mgmt
  const lastLoggedTabRef = useRef<string|undefined>();
  useEffect(() => {
    if (lastLoggedTabRef.current !== activeTab) {
      try { appLogger.info(`[UI] Profile tab changed: ${activeTab}`); } catch {}
      lastLoggedTabRef.current = activeTab;
    }
    const el = document.getElementById(`panel-${activeTab}`);
    if (el) { el.setAttribute('tabindex','-1'); el.focus(); }
  }, [activeTab]);

  const handleProfileChange = (field: keyof ProfileFormState, value: string | number | boolean | string[] | null) => 
    setProfileForm(p => ({ ...p, [field]: value }));
  const toggleMultiSelect = (field: 'dietary_preferences' | 'allergies', value: string) => {
    setProfileForm(p => {
      const exists = p[field].includes(value);
      const next = exists ? p[field].filter(v => v !== value) : [...p[field], value];
      return { ...p, [field]: next };
    });
  };

  const profileDirty = (() => {
    const base = originalProfileRef.current; if (!base) return false;
    return Object.keys(base).some(k => {
      const a = (base as Record<string, unknown>)[k]; const b = (profileForm as Record<string, unknown>)[k];
      if (Array.isArray(a) && Array.isArray(b)) return a.slice().sort().join(',') !== b.slice().sort().join(',');
      return a !== b;
    });
  })();

  const saveProfile = useCallback(async () => {
    if (!profile) return;
    setSavingProfile(true); setProfileFeedback(null);
    try {
      const { error } = await supabase.from('profiles').update({
        name: profileForm.name,
        preferred_name: profileForm.preferred_name,
        phone_number: profileForm.phone_number,
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
          daycare_pickup_backup: profileForm.notification_daycare_pickup_backup,
        }
      }).eq('id', profile.id);
      if (error) throw error;
      await refreshUser();
      originalProfileRef.current = { ...profileForm };
      toastHelpers.success('Profile updated');
      setProfileFeedback({type:'success', message:'Profile updated'});
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Failed to update profile';
      toastHelpers.error(errorMessage);
      setProfileFeedback({type:'error', message: errorMessage});
    } finally { setSavingProfile(false); }
  }, [profile, profileForm, supabase, refreshUser]);

  const savePermissions = useCallback(async () => {
    if (!permissions || !profile) return;
    setSavingPermissions(true); setPermissionsFeedback(null);
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id: _id, user_id: _user_id, created_at: _created_at, updated_at: _updated_at, ...rest } = permissionsForm as Record<string, unknown>;
      const { error } = await supabase.from('user_permissions').update(rest).eq('id', permissions.id);
      if (error) throw error;
      toastHelpers.success('Permissions updated');
      setPermissionsFeedback({type:'success', message:'Permissions updated'});
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Failed to update permissions';
      toastHelpers.error(errorMessage);
      setPermissionsFeedback({type:'error', message: errorMessage});
    } finally { setSavingPermissions(false); }
  }, [permissions, profile, permissionsForm, supabase]);

  const saveHousehold = useCallback( async () => {
    if (!household?.id) return;
    setSavingHousehold(true); setHouseholdFeedback(null);
    try {
      const { data, error } = await supabase.from('households').update({
        name: householdForm.name,
        household_type: householdForm.household_type,
        address: householdForm.address,
        city: householdForm.city,
        state: householdForm.state,
        zip: householdForm.zip
      }).eq('id', household.id).select('*').single();
      if (error) throw error;
      setHousehold((prev: Record<string, unknown> | null) => ({ ...prev, ...(data || {}) }));
      toastHelpers.success('Household updated');
      setHouseholdFeedback({type:'success', message:'Household updated'});
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Failed to update household';
      toastHelpers.error(errorMessage);
      setHouseholdFeedback({type:'error', message: errorMessage});
    } finally { setSavingHousehold(false); }
  }, [household?.id, householdForm, supabase]);

  const readable = (val: string) => val.replace(/_/g,' ').replace(/\b\w/g, c => c.toUpperCase());
  const canHouseholdSettings = permissionsForm.household_management === true && !!household;

  // Prevent sitting on forbidden tab if perms change
  useEffect(() => { if (activeTab==='household-settings' && !canHouseholdSettings) setActiveTab('overview'); }, [activeTab, canHouseholdSettings]);

  // Inline edit highlight on enter
  useEffect(() => { if (overviewEditMode) { setEditHighlight(true); const t=setTimeout(()=>setEditHighlight(false),1200); return ()=>clearTimeout(t);} }, [overviewEditMode]);

  const renderTabs = () => {
    const ordered: { key: typeof activeTab; label: string; show: boolean }[] = [
      { key: 'overview', label: 'Overview', show: true },
      { key: 'household-settings', label: 'Household Settings', show: canHouseholdSettings },
      { key: 'permissions', label: 'Permissions', show: true }
    ];
    const visible = ordered.filter(t => t.show);
    const onKey = (e: React.KeyboardEvent) => {
      if (e.key==='ArrowRight' || e.key==='ArrowLeft') {
        e.preventDefault();
        const idx = visible.findIndex(t => t.key===activeTab); if (idx===-1) return;
        const delta = e.key==='ArrowRight'?1:-1;
        const next = visible[(idx + delta + visible.length) % visible.length];
        setActiveTab(next.key);
      }
    };
    return (
      <div className="flex flex-wrap items-center gap-2 mb-6 border-b border-gray-200" role="tablist" aria-label="Profile sections" onKeyDown={onKey}>
        {visible.map(t => (
          <button key={t.key} id={`tab-${t.key}`} role="tab" aria-selected={activeTab===t.key} aria-controls={`panel-${t.key}`} tabIndex={activeTab===t.key?0:-1} onClick={()=>setActiveTab(t.key)} className={`px-4 py-2 text-sm font-medium rounded-t-md focus:outline-none focus-visible:ring transition-colors ${activeTab===t.key ? 'bg-white text-gray-900 shadow-sm border border-gray-200 border-b-white -mb-px' : 'text-gray-600 hover:text-gray-900'}`}>{t.label}</button>
        ))}
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
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-2xl font-semibold shadow">
                {(profile.preferred_name || profile.name || user?.email || 'U').charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 leading-tight">{profile.preferred_name || profile.name || 'No name set'}</h2>
                <p className="text-sm text-gray-600 mt-0.5">{user?.email}</p>
                {profile.family_role && (
                  <span className="inline-block mt-3 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium tracking-wide">{readable(profile.family_role)}</span>
                )}
              </div>
            </div>
            {!overviewEditMode && (
              <div className="flex justify-end mb-4">
                <button onClick={()=>setOverviewEditMode(true)} className="px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-800 text-sm font-medium hover:bg-gray-50 shadow-sm flex items-center gap-2"><Edit className="w-4 h-4" /> Edit</button>
              </div>
            )}
            {overviewEditMode && (
              <form onSubmit={(e)=>{e.preventDefault(); saveProfile().then(()=>setOverviewEditMode(false));}} className={`mt-2 pt-4 border-t space-y-8 rounded-md outline-offset-2 transition-shadow ${editHighlight ? 'outline outline-2 outline-purple-400/70 shadow-md' : ''}`} aria-label="Inline profile editor">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Full Name</label>
                    <input value={profileForm.name} onChange={e=>handleProfileChange('name', e.target.value)} className="w-full px-3 py-2 rounded-md border border-gray-300 bg-white text-gray-900 focus:ring-purple-500 focus:border-purple-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Preferred Name</label>
                    <input value={profileForm.preferred_name} onChange={e=>handleProfileChange('preferred_name', e.target.value)} className="w-full px-3 py-2 rounded-md border border-gray-300 bg-white text-gray-900 focus:ring-purple-500 focus:border-purple-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Phone</label>
                    <input value={profileForm.phone_number} onChange={e=>handleProfileChange('phone_number', e.target.value)} className="w-full px-3 py-2 rounded-md border border-gray-300 bg-white text-gray-900 focus:ring-purple-500 focus:border-purple-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Date of Birth</label>
                    <input type="date" value={profileForm.date_of_birth} onChange={e=>handleProfileChange('date_of_birth', e.target.value)} className="w-full px-3 py-2 rounded-md border border-gray-300 bg-white text-gray-900 focus:ring-purple-500 focus:border-purple-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Timezone</label>
                    <input value={profileForm.timezone} onChange={e=>handleProfileChange('timezone', e.target.value)} placeholder="America/New_York" className="w-full px-3 py-2 rounded-md border border-gray-300 bg-white text-gray-900 focus:ring-purple-500 focus:border-purple-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Language</label>
                    <select value={profileForm.language} onChange={e=>handleProfileChange('language', e.target.value)} className="w-full px-3 py-2 rounded-md border border-gray-300 bg-white text-gray-900 focus:ring-purple-500 focus:border-purple-500">
                      {LANGUAGE_OPTIONS.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Bio</label>
                    <textarea rows={3} value={profileForm.bio} onChange={e=>handleProfileChange('bio', e.target.value)} className="w-full px-3 py-2 rounded-md border border-gray-300 bg-white text-gray-900 focus:ring-purple-500 focus:border-purple-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Dietary Preferences</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {DIETARY_OPTIONS.map(opt => {
                        const checked = profileForm.dietary_preferences.includes(opt);
                        return (
                          <label key={opt} className={`flex items-center gap-2 text-xs font-medium rounded-md px-2 py-1.5 border cursor-pointer select-none ${checked ? 'bg-green-50 border-green-300 text-green-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
                            <input type="checkbox" className="h-3.5 w-3.5 text-purple-600 rounded border-gray-300" checked={checked} onChange={()=>toggleMultiSelect('dietary_preferences', opt)} />
                            {readable(opt)}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Allergies</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {ALLERGY_OPTIONS.map(opt => {
                        const checked = profileForm.allergies.includes(opt);
                        return (
                          <label key={opt} className={`flex items-center gap-2 text-xs font-medium rounded-md px-2 py-1.5 border cursor-pointer select-none ${checked ? 'bg-red-50 border-red-300 text-red-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
                            <input type="checkbox" className="h-3.5 w-3.5 text-purple-600 rounded border-gray-300" checked={checked} onChange={()=>toggleMultiSelect('allergies', opt)} />
                            {readable(opt)}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <h4 className="text-xs font-semibold text-gray-600 mb-3 uppercase tracking-wide flex items-center gap-2"><Bell className="w-4 h-4 text-purple-500" /> Notification Preferences</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {[
                        { key: 'notification_email', label: 'Email Notifications' },
                        { key: 'notification_push', label: 'Push Notifications' },
                        { key: 'notification_sms', label: 'SMS Notifications' },
                        { key: 'notification_daycare_pickup_backup', label: 'Daycare Pickup Backup' }
                      ].map(item => (
                        <label key={item.key} className="flex items-center gap-2 text-sm font-medium text-gray-800">
                          <input type="checkbox" className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded" checked={Boolean((profileForm as Record<string, unknown>)[item.key])} onChange={()=>handleProfileChange(item.key as keyof ProfileFormState, !Boolean((profileForm as Record<string, unknown>)[item.key]))} />
                          {item.label}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                {profileFeedback && <div className={`text-sm ${profileFeedback.type==='error'?'text-red-600':profileFeedback.type==='success'?'text-green-600':'text-gray-600'}`}>{profileFeedback.message}</div>}
                <div className="flex justify-end gap-3">
                  <button type="button" onClick={()=>{setOverviewEditMode(false); setProfileFeedback(null);}} className="px-4 py-2 text-sm font-medium rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus-visible:ring">Cancel</button>
                  <button type="submit" disabled={savingProfile || !profileDirty} className="inline-flex items-center gap-2 px-5 py-2 rounded-md bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 disabled:opacity-60 focus:outline-none focus-visible:ring focus-visible:ring-purple-500">
                    {savingProfile ? <div className="animate-spin h-4 w-4 border-b-2 border-white rounded-full" /> : <Save className="w-4 h-4" />} {savingProfile ? 'Saving...' : profileDirty ? 'Save Changes' : 'No Changes'}
                  </button>
                </div>
              </form>
            )}
          </div>
          <div className="space-y-6">
            {household && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><Home className="w-5 h-5 text-purple-600" /> Household</h3>
                <div className="space-y-3 text-sm">
                  <div><p className="text-gray-500 text-xs uppercase tracking-wide">Name</p><p className="font-medium text-gray-800">{household.name}</p></div>
                  {household.household_type && <div><p className="text-gray-500 text-xs uppercase tracking-wide">Type</p><p className="font-medium text-gray-800">{readable(household.household_type)}</p></div>}
                  <div><p className="text-gray-500 text-xs uppercase tracking-wide">Members</p><p className="font-medium text-gray-800">{household.members_count}</p></div>
                  {household.city && household.state && <div><p className="text-gray-500 text-xs uppercase tracking-wide">Location</p><p className="font-medium text-gray-800">{household.city}, {household.state}</p></div>}
                  {household.household_code && (
                    <div className="pt-2">
                      <p className="text-gray-500 text-xs uppercase tracking-wide mb-1 flex items-center gap-1">Household Code</p>
                      <div className="flex items-center gap-2">
                        <code className="px-2 py-1 rounded bg-gray-100 text-gray-800 text-xs font-mono border border-gray-200">{household.household_code}</code>
                        <button type="button" onClick={()=>{ 
                          if (household.household_code) {
                            navigator?.clipboard?.writeText?.(household.household_code); 
                            toastHelpers.success('Copied'); 
                          }
                        }} className="text-xs px-2.5 py-1.5 rounded-md border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-medium focus:outline-none focus-visible:ring">
                          Copy
                        </button>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-1">Share this code for others to join.</p>
                    </div>
                  )}
                  {/* Referral code functionality removed - not in current schema */}
                </div>
              </div>
            )}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><Settings className="w-5 h-5 text-purple-600" /> Quick Actions</h3>
              <div className="space-y-3">
                <button onClick={()=>setActiveTab('permissions')} className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors flex items-center gap-3 text-sm font-medium text-gray-700"><Shield className="w-4 h-4 text-gray-400" />Manage Permissions</button>
              </div>
              {profile?.profile_completion_percentage != null && (
                <div className="mt-6 border-t pt-4">
                  <h4 className="text-xs uppercase tracking-wide text-gray-500 font-semibold mb-2">Completion</h4>
                  <div className="flex items-center justify-between mb-2 text-xs font-medium text-gray-700">
                    <span>Progress</span><span>{profile.profile_completion_percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                    <div className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full" style={{ width: `${profile.profile_completion_percentage}%` }} />
                  </div>
                  <p className="text-[11px] text-gray-500">Keep adding info to unlock personalization.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const householdSettingsTab = !household ? (
    <div className="text-sm text-gray-600" id="panel-household-settings" role="tabpanel" aria-labelledby="tab-household-settings">No household found.</div>
  ) : (
    <form onSubmit={(e)=>{e.preventDefault(); saveHousehold();}} className="space-y-6" id="panel-household-settings" role="tabpanel" aria-labelledby="tab-household-settings">
      <div className="sr-only" aria-live="polite">{householdFeedback?.message || ''}</div>
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-1">Household Name</label>
          <input value={householdForm.name} onChange={e=>setHouseholdForm(f=>({...f,name:e.target.value}))} className="w-full px-3 py-2 rounded-md border border-gray-300 bg-white text-gray-900 focus:ring-purple-500 focus:border-purple-500" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-1">Household Type</label>
          <select value={householdForm.household_type} onChange={e=>setHouseholdForm(f=>({...f,household_type:e.target.value as typeof f.household_type}))} className="w-full px-3 py-2 rounded-md border border-gray-300 bg-white text-gray-900 focus:ring-purple-500 focus:border-purple-500">
            <option value="solo_user">Solo User</option>
            <option value="roommate_household">Roommate Household</option>
            <option value="couple_no_kids">Couple (No Kids)</option>
            <option value="family_household">Family Household</option>
            <option value="single_parent_household">Single Parent Household</option>
            <option value="multi_generational_household">Multi-Generational</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-1">Address</label>
          <input value={householdForm.address} onChange={e=>setHouseholdForm(f=>({...f,address:e.target.value}))} className="w-full px-3 py-2 rounded-md border border-gray-300 bg-white text-gray-900 focus:ring-purple-500 focus:border-purple-500" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-1">City</label>
          <input value={householdForm.city} onChange={e=>setHouseholdForm(f=>({...f,city:e.target.value}))} className="w-full px-3 py-2 rounded-md border border-gray-300 bg-white text-gray-900 focus:ring-purple-500 focus:border-purple-500" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-1">State</label>
          <input value={householdForm.state} onChange={e=>setHouseholdForm(f=>({...f,state:e.target.value}))} className="w-full px-3 py-2 rounded-md border border-gray-300 bg-white text-gray-900 focus:ring-purple-500 focus:border-purple-500" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-1">ZIP</label>
          <input value={householdForm.zip} onChange={e=>setHouseholdForm(f=>({...f,zip:e.target.value}))} className="w-full px-3 py-2 rounded-md border border-gray-300 bg-white text-gray-900 focus:ring-purple-500 focus:border-purple-500" />
        </div>
        {householdFeedback && <div className={`text-sm md:col-span-2 ${householdFeedback.type==='error'?'text-red-600':householdFeedback.type==='success'?'text-green-600':'text-gray-600'}`}>{householdFeedback.message}</div>}
        <div className="md:col-span-2 flex justify-end">
          <button type="submit" disabled={savingHousehold} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-purple-600 text-white font-medium hover:bg-purple-700 disabled:opacity-60 shadow focus:outline-none focus-visible:ring focus-visible:ring-purple-500">
            {savingHousehold ? <div className="animate-spin h-4 w-4 border-b-2 border-white rounded-full" /> : <Save className="w-4 h-4" />} {savingHousehold ? 'Saving...' : 'Save Household'}
          </button>
        </div>
      </div>
    </form>
  );

  const showLoading = authLoading || initialLoading || householdLoading;
  const shouldHideForSetup = !showLoading && (!profile || !profile.onboarding_completed);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 p-4 md:p-8 text-gray-900">
      {showLoading && <div aria-label="Loading profile content" className="pb-16">{renderSkeleton()}</div>}
      {!showLoading && !shouldHideForSetup && (
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">Profile</h1>
              <p className="text-sm text-gray-600 mt-1">Manage your personal information, settings, and permissions</p>
            </div>
            <div className="flex gap-2">
              {activeTab === 'overview' && !overviewEditMode && (
                <button onClick={()=>setOverviewEditMode(true)} className="px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-800 text-sm font-medium hover:bg-gray-50 shadow-sm flex items-center gap-2"><Edit className="w-4 h-4" /> Edit</button>
              )}
              {activeTab === 'overview' && overviewEditMode && (
                <button onClick={()=>setOverviewEditMode(false)} className="px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-800 text-sm font-medium hover:bg-gray-50 shadow-sm flex items-center gap-2">Cancel</button>
              )}
            </div>
          </div>
          {renderTabs()}
          {activeTab === 'overview' && <div id="panel-overview" role="tabpanel" aria-labelledby="tab-overview">{renderOverviewTab()}</div>}
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