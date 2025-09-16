"use client";
import { useState, useMemo, useEffect, useCallback } from 'react';
import { Shield, Save, Check } from 'lucide-react';
import { Database } from '@/src/lib/types_db';

// Types replicated for isolation
type UserPermissionsRow = Database['public']['Tables']['user_permissions']['Row'];

type PermissionBooleanKeys = Exclude<keyof UserPermissionsRow, 'id' | 'user_id' | 'created_at' | 'updated_at'> & string;

interface Feedback { type: 'success'|'error'|'info'; message: string }
interface Props {
  permissionsForm: Partial<UserPermissionsRow>;
  setPermissionsForm: (updater: (prev: Partial<UserPermissionsRow>) => Partial<UserPermissionsRow>) => void;
  savePermissions: () => void;
  savingPermissions: boolean;
  permissionsFeedback: Feedback | null;
}

// Define permissions metadata based on actual database columns
const PERMISSION_METADATA = [
  // Core Features
  { key: 'dashboard', title: 'Dashboard', description: 'Access to the main dashboard and overview', category: 'Core Features' },
  { key: 'profile', title: 'Profile Management', description: 'Access to profile settings and personal information', category: 'Core Features' },
  
  // Household Management
  { key: 'household_management', title: 'Household Management', description: 'Manage household settings, members, and configurations', category: 'Household Management' },
  { key: 'user_management', title: 'User Management', description: 'Manage other users in the household', category: 'Household Management' },
  
  // Planning & Organization
  { key: 'meals', title: 'Meal Planning', description: 'Access to meal planning and grocery list features', category: 'Planning & Organization' },
  { key: 'lists', title: 'Lists & Tasks', description: 'Create and manage household lists and tasks', category: 'Planning & Organization' },
  { key: 'work', title: 'Work & Projects', description: 'Access to work tracking and project management', category: 'Planning & Organization' },
  { key: 'projects', title: 'Project Management', description: 'Advanced project management and collaboration tools', category: 'Planning & Organization' },
  
  // Entertainment & Lifestyle
  { key: 'sports_ticker', title: 'Sports Ticker', description: 'Access to sports updates and ticker information', category: 'Entertainment & Lifestyle' },
  
  // Financial
  { key: 'financial_tracking', title: 'Financial Tracking', description: 'Track expenses, budgets, and financial goals', category: 'Financial' },
  { key: 'billing_management', title: 'Billing Management', description: 'Manage subscriptions and billing information', category: 'Financial' },
  
  // Advanced Features
  { key: 'ai_features', title: 'AI Features', description: 'Access to AI-powered recommendations and automation', category: 'Advanced Features' },
  { key: 'analytics_dashboard', title: 'Analytics Dashboard', description: 'View household analytics and insights', category: 'Advanced Features' },
  
  // Administration
  { key: 'feature_management', title: 'Feature Management', description: 'Control which features are enabled for the household', category: 'Administration' },
  { key: 'global_feature_control', title: 'Global Feature Control', description: 'Administrative control over global feature settings', category: 'Administration' },
  { key: 'system_admin', title: 'System Administration', description: 'Full system administrative privileges', category: 'Administration' },
];

const ALL_PERMISSIONS = PERMISSION_METADATA.map(p => p.key);

export default function PermissionsTab({ permissionsForm, setPermissionsForm, savePermissions, savingPermissions, permissionsFeedback }: Props) {
  const [permissionSearch, setPermissionSearch] = useState('');
  const [debouncedPermissionSearch, setDebouncedPermissionSearch] = useState('');
  const [showPermissionDescriptions, setShowPermissionDescriptions] = useState(false);

  useEffect(()=>{
    const id = setTimeout(()=> setDebouncedPermissionSearch(permissionSearch.trim()), 250);
    return ()=> clearTimeout(id);
  }, [permissionSearch]);

  const PERMISSION_MAP = useMemo(() => {
    const map: Record<string, typeof PERMISSION_METADATA[number]> = {};
    PERMISSION_METADATA.forEach(p => { map[p.key] = p; });
    return map;
  }, []);

  const permissionMeta = useCallback((key: string) => {
    return PERMISSION_MAP[key] ? { 
      label: PERMISSION_MAP[key].title, 
      description: PERMISSION_MAP[key].description, 
      category: PERMISSION_MAP[key].category 
    } : { 
      label: key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()), 
      description: '', 
      category: 'Other' 
    };
  }, [PERMISSION_MAP]);

  const filteredPermissionKeys = useMemo(() => {
    // Show all available permissions, using the form data or defaults
    return ALL_PERMISSIONS
      .filter(k => !debouncedPermissionSearch || 
        k.toLowerCase().includes(debouncedPermissionSearch.toLowerCase()) || 
        permissionMeta(k).description.toLowerCase().includes(debouncedPermissionSearch.toLowerCase())
      );
  }, [debouncedPermissionSearch, permissionMeta]);

  const groupedPermissionKeys = useMemo(() => {
    const groups: Record<string, string[]> = {};
    filteredPermissionKeys.forEach(k => {
      const meta = permissionMeta(k);
      const cat = meta.category || 'Other';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(k);
    });
    return Object.entries(groups).map(([category, keys]) => ({ category, keys }));
  }, [filteredPermissionKeys, permissionMeta]);

  const togglePermission = (key: PermissionBooleanKeys) => {
    setPermissionsForm((prev) => ({ ...prev, [key]: !prev?.[key] }));
  };

  const toggleAllPermissions = (value: boolean) => {
    setPermissionsForm((pf) => {
      const clone = { ...pf };
      filteredPermissionKeys.forEach(k => { 
        (clone as Record<string, unknown>)[k] = value; 
      });
      return clone;
    });
  };

  const readable = (val: string) => val.replace(/_/g,' ').replace(/\b\w/g, c => c.toUpperCase());

  return (
    <div className="space-y-6" id="panel-permissions" role="tabpanel" aria-labelledby="tab-permissions">
      <div className="sr-only" aria-live="polite">{permissionsFeedback?.message || ''}</div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2"><Shield className="w-5 h-5 text-purple-600" /> Permissions</h3>
          <div className="flex flex-wrap gap-2 items-center">
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={permissionSearch}
                onChange={e=>setPermissionSearch(e.target.value)}
                placeholder="Search permissions..."
                className="px-2.5 py-1.5 text-sm rounded-md border border-gray-300 bg-white placeholder-gray-400 focus:ring-purple-500 focus:border-purple-500"
                aria-label="Search permissions"
              />
              <button
                type="button"
                onClick={()=>setShowPermissionDescriptions(s=>!s)}
                className="px-2.5 py-1.5 text-xs rounded-md border border-gray-300 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium"
              >{showPermissionDescriptions? 'Hide Descriptions':'Show Descriptions'}</button>
            </div>
            <BulkPermissionToggle filteredKeys={filteredPermissionKeys} permissionsForm={permissionsForm} toggleAll={toggleAllPermissions} />
          </div>
        </div>
        {permissionsFeedback && <div className={`mb-4 p-2 rounded text-xs font-medium ${permissionsFeedback.type==='error'? 'bg-red-50 text-red-700 border border-red-200':permissionsFeedback.type==='success'? 'bg-green-50 text-green-700 border border-green-200':'bg-gray-50 text-gray-700 border border-gray-200'}`}>{permissionsFeedback.message}</div>}
        {groupedPermissionKeys.length === 0 && (
          <div className="text-sm text-center text-gray-500 py-6">No permissions match your search.</div>
        )}
        <div className="space-y-8">
          {groupedPermissionKeys.map(group => (
            <div key={group.category}>
              <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">{group.category}</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {group.keys.map(key => {
                  const { description } = permissionMeta(key);
                  const active = Boolean((permissionsForm as Record<string, unknown>)[key]);
                  return (
                    <div key={key} className={`flex items-start justify-between gap-3 p-4 rounded-lg border transition-colors ${active ? 'bg-purple-50 border-purple-200' : 'bg-gray-50 border-gray-200'}`}>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium text-gray-800 block truncate">{readable(key)}</span>
                        {showPermissionDescriptions && description && (
                          <span className="text-xs text-gray-500 mt-1 line-clamp-3">{description}</span>
                        )}
                      </div>
                      <button onClick={() => togglePermission(key as PermissionBooleanKeys)} aria-pressed={active} className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center transition-all focus:outline-none focus-visible:ring ${active ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}>
                        {active ? <Check className="w-4 h-4" /> : <span className="text-xs font-semibold">+</span>}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-8">
          <button onClick={savePermissions} disabled={savingPermissions} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 disabled:opacity-60 shadow focus:outline-none focus-visible:ring focus-visible:ring-purple-500">
            {savingPermissions ? <div className="animate-spin h-4 w-4 border-b-2 border-white rounded-full" /> : <Save className="w-4 h-4" />}
            {savingPermissions ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

function BulkPermissionToggle({ filteredKeys, permissionsForm, toggleAll }: { 
  filteredKeys: string[]; 
  permissionsForm: Record<string, unknown>; 
  toggleAll: (v:boolean)=>void 
}) {
  const { allOn, allOff } = useMemo(() => {
    let on = 0; let off = 0;
    filteredKeys.forEach(k => { 
      const permission = (permissionsForm as Record<string, unknown>)[k];
      if (permission) {
        on++;
      } else {
        off++;
      }
    });
    return { allOn: on>0 && off===0, allOff: off>0 && on===0 };
  }, [filteredKeys, permissionsForm]);
  const nextEnable = !allOn;
  const label = allOn ? 'Disable All' : allOff ? 'Enable All' : 'Set All';
  return (
    <button
      type="button"
      onClick={() => toggleAll(nextEnable)}
      aria-label={label}
      className={`px-2.5 py-1.5 text-xs rounded-md border font-medium transition-colors flex items-center gap-1 ${allOn ? 'bg-purple-600 border-purple-600 text-white hover:bg-purple-700' : allOff ? 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200' : 'bg-purple-50 border-purple-300 text-purple-700 hover:bg-purple-100'}`}
    >
      {label}
    </button>
  );
}
