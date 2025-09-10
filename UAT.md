# User Acceptance Testing (UAT) - Dayboard Official

## Overview
This document outlines the user acceptance testing scenarios for the enhanced permission system and checkbox matrix UI components. Each test case includes user stories, acceptance criteria, and expected outcomes.

## Test Environment Setup
- **Database**: Supabase with enhanced permissions schema
- **Required Migration**: `ADD_NAVIGATION_FEATURES.sql` must be executed
- **Test Roles**: Super Admin, Admin, Member
- **Test Households**: At least one household with multiple users

---

## 1. Navigation Access Control System

### 1.1 Super Admin Navigation Control
**User Story**: As a Super Admin, I want to control which navigation features are available to Members and Admins in my household so that I can manage access permissions granularly.

**Acceptance Criteria**:
- [ ] Can access Settings page via sidebar navigation
- [ ] Settings page loads without errors
- [ ] "Super Admin" tab is visible and accessible
- [ ] Navigation Access Control section displays checkbox matrix
- [ ] Matrix shows all navigation features (Dashboard, Meals, Lists, Work, Projects, Profile, Settings)
- [ ] Each feature has separate checkboxes for Member and Admin access
- [ ] Super Admin column shows ✅ (always enabled, disabled checkbox)
- [ ] Can toggle Member access checkboxes on/off
- [ ] Can toggle Admin access checkboxes on/off
- [ ] Changes save automatically
- [ ] Page shows success feedback when settings are saved

**Test Steps**:
1. Login as Super Admin
2. Navigate to Settings page
3. Click "Super Admin" tab
4. Locate "Navigation Access Control" section
5. Verify checkbox matrix display
6. Toggle various Member access permissions
7. Toggle various Admin access permissions
8. Verify changes persist after page refresh

**Expected Outcome**: Super Admin can successfully control navigation access for all user roles through an intuitive checkbox interface.

### 1.2 Member Navigation Restrictions
**User Story**: As a Member, I should only see navigation items that the Super Admin has enabled for my role so that I have appropriate access to household features.

**Acceptance Criteria**:
- [ ] Sidebar navigation only shows items enabled by Super Admin
- [ ] Dashboard always available (core feature)
- [ ] Meals always available (core feature)
- [ ] Lists always available (core feature)
- [ ] Work module hidden by default
- [ ] Projects module hidden by default
- [ ] Profile always available
- [ ] Settings hidden by default
- [ ] Development tools never visible
- [ ] Navigation updates immediately when Super Admin changes permissions
- [ ] Restricted pages return 403/404 when accessed directly via URL

**Test Steps**:
1. Login as Member
2. Verify default navigation items (Dashboard, Meals, Lists, Profile only)
3. Have Super Admin enable Work access for Members
4. Refresh page and verify Work appears in navigation
5. Have Super Admin disable Meals access for Members
6. Refresh page and verify Meals disappears from navigation
7. Try accessing `/work` directly when not enabled
8. Try accessing `/settings` directly as Member

**Expected Outcome**: Member navigation dynamically reflects Super Admin permissions and prevents unauthorized access.

### 1.3 Admin Navigation Access
**User Story**: As an Admin, I should have access to administrative features and any navigation items the Super Admin has enabled for my role so that I can perform household management tasks.

**Acceptance Criteria**:
- [ ] Has access to all Member-enabled features
- [ ] Settings page accessible by default
- [ ] User Management features available
- [ ] Household Management features available
- [ ] Admin-specific navigation items visible
- [ ] Cannot access Super Admin exclusive features
- [ ] Development tools remain hidden
- [ ] Can be restricted by Super Admin via checkbox controls

**Test Steps**:
1. Login as Admin
2. Verify default admin navigation (all Member items + Settings)
3. Access Settings page successfully
4. Verify Admin-specific tabs are visible in Settings
5. Have Super Admin disable specific Admin access
6. Verify navigation updates accordingly
7. Test access to restricted admin features

**Expected Outcome**: Admin has appropriate elevated access while still being subject to Super Admin controls.

---

## 2. Settings Page Checkbox Matrix Components

### 2.1 Navigation Access Matrix Component
**User Story**: As a Super Admin, I want a visual matrix showing which users can access which navigation features so that I can easily understand and manage permissions.

**Acceptance Criteria**:
- [ ] Matrix displays in Settings > Super Admin tab
- [ ] Shows all navigation features as rows
- [ ] Shows user roles as columns (Member, Admin, Super Admin)
- [ ] Member and Admin columns have functional checkboxes
- [ ] Super Admin column shows always-enabled state
- [ ] Checkbox states persist across page reloads
- [ ] Visual feedback when clicking checkboxes
- [ ] Hover states and accessibility features work
- [ ] Responsive design works on mobile devices

**Test Steps**:
1. Access Settings as Super Admin
2. Navigate to Super Admin tab
3. Locate Navigation Access Matrix
4. Click various checkboxes
5. Verify visual feedback
6. Reload page and verify persistence
7. Test on mobile device
8. Test keyboard navigation

**Expected Outcome**: Matrix provides clear, intuitive interface for permission management.

### 2.2 Feature Access Matrix Component
**User Story**: As a Super Admin, I want to control access to premium features and administrative tools through a comprehensive feature matrix so that I can manage subscription tiers and advanced permissions.

**Acceptance Criteria**:
- [ ] Displays comprehensive feature categories (Core, Premium, Admin, Super Admin)
- [ ] Shows subscription requirements for premium features
- [ ] Access level indicators are clear and accurate
- [ ] Mode switching between Admin and Super Admin views works
- [ ] Category grouping is logical and easy to navigate
- [ ] Feature descriptions are helpful and accurate

**Test Steps**:
1. Access Feature Access Matrix in Settings
2. Verify all feature categories display
3. Check subscription requirement indicators
4. Switch between view modes
5. Verify category organization
6. Read feature descriptions for clarity

**Expected Outcome**: Comprehensive feature control with clear subscription model integration.

### 2.3 Settings Permissions Matrix Component
**User Story**: As a Super Admin, I want granular control over who can view and edit specific settings so that I can maintain security while allowing appropriate access.

**Acceptance Criteria**:
- [ ] Shows view/edit permissions for each setting
- [ ] Role-based permission columns work correctly
- [ ] Settings categories are organized logically
- [ ] Permission rules are enforced consistently
- [ ] Visual distinction between view and edit permissions
- [ ] Settings items grouped by logical categories

**Test Steps**:
1. Access Settings Permissions Matrix
2. Verify view/edit distinction
3. Test permission toggles
4. Verify category organization
5. Check permission enforcement
6. Test edge cases

**Expected Outcome**: Granular settings permission control with clear view/edit separation.

### 2.4 User Role Matrix Component
**User Story**: As a Super Admin, I want to manage user roles and individual permissions through a user-focused matrix so that I can control access at the individual user level.

**Acceptance Criteria**:
- [ ] Displays all household users
- [ ] Shows current role assignments
- [ ] Allows role changes with appropriate validation
- [ ] Individual permission toggles work
- [ ] User invitation functionality integrated
- [ ] Real-time updates when changes are made
- [ ] Prevents invalid role assignments

**Test Steps**:
1. Access User Role Matrix
2. Verify all users display
3. Test role assignment changes
4. Try individual permission toggles
5. Test user invitation flow
6. Verify real-time updates
7. Test validation rules

**Expected Outcome**: Complete user management with role and permission control at individual user level.

---

## 3. Database Function Testing

### 3.1 user_has_feature_access() Function
**User Story**: As the system, I need to accurately determine user feature access based on role and Super Admin settings so that permissions are enforced consistently.

**Acceptance Criteria**:
- [ ] Returns correct boolean for all user/feature combinations
- [ ] Super Admin always returns true for all features
- [ ] Member access follows Super Admin checkbox settings
- [ ] Admin access follows Super Admin checkbox settings
- [ ] Development features restricted to Super Admin only
- [ ] Global feature disabling works correctly
- [ ] Function handles edge cases gracefully

**Test Steps**:
1. Execute function with various user/feature combinations
2. Verify Super Admin universal access
3. Test Member permission scenarios
4. Test Admin permission scenarios
5. Test development feature restrictions
6. Test with globally disabled features
7. Test error handling

**Expected Outcome**: Function provides accurate, consistent permission checking.

### 3.2 get_user_navigation() Function
**User Story**: As the system, I need to generate appropriate navigation menus for each user based on their permissions so that the UI reflects current access rights.

**Acceptance Criteria**:
- [ ] Returns correct navigation items for each user role
- [ ] Includes proper href and icon mappings
- [ ] Access status reflects current permissions
- [ ] Category grouping works correctly
- [ ] Order is logical and consistent
- [ ] Development tools handled appropriately

**Test Steps**:
1. Call function for different user types
2. Verify navigation item accuracy
3. Check href and icon mappings
4. Verify access status calculation
5. Test category and ordering
6. Test with permission changes

**Expected Outcome**: Function generates accurate, complete navigation data for UI consumption.

---

## 4. Integration Testing

### 4.1 End-to-End Permission Flow
**User Story**: As a Super Admin, when I change permissions in the Settings UI, I want those changes to immediately affect user access throughout the application.

**Acceptance Criteria**:
- [ ] Settings changes update database immediately
- [ ] Navigation menus update for affected users
- [ ] Page access restrictions apply immediately
- [ ] Error messages are clear and helpful
- [ ] No data corruption or inconsistencies
- [ ] Audit trail of permission changes

**Test Steps**:
1. Login as Super Admin and Member in different browsers
2. Change Member permissions in Super Admin browser
3. Verify immediate updates in Member browser
4. Test direct URL access restrictions
5. Verify database consistency
6. Check for any error conditions

**Expected Outcome**: Seamless, immediate permission updates across the entire application.

### 4.2 Multi-User Household Testing
**User Story**: As a household with multiple users of different roles, permission changes should affect only the intended users and roles.

**Acceptance Criteria**:
- [ ] Permission changes affect only target roles
- [ ] Other users unaffected by irrelevant changes
- [ ] Multiple Super Admins can coexist
- [ ] Role hierarchy respected consistently
- [ ] Cross-household isolation maintained

**Test Steps**:
1. Set up household with multiple users and roles
2. Make targeted permission changes
3. Verify selective impact
4. Test with multiple Super Admins
5. Verify household isolation

**Expected Outcome**: Precise, targeted permission control without unintended side effects.

---

## 5. Error Handling and Edge Cases

### 5.1 Missing User Data
**User Story**: As the system, I should handle missing or invalid user data gracefully without breaking the permission system.

**Acceptance Criteria**:
- [ ] Functions handle null user IDs
- [ ] Missing role data has sensible defaults
- [ ] Orphaned user records handled gracefully
- [ ] Error messages are user-friendly
- [ ] System remains stable under error conditions

### 5.2 Database Migration Rollback
**User Story**: As a developer, I should be able to rollback the permission system if needed without data loss.

**Acceptance Criteria**:
- [ ] Migration can be safely reversed
- [ ] User data remains intact
- [ ] System returns to previous functionality
- [ ] No orphaned data or broken references

---

## 6. Performance Testing

### 6.1 Large Household Performance
**User Story**: As a user in a large household (50+ members), the permission system should remain responsive and efficient.

**Acceptance Criteria**:
- [ ] Settings page loads within 2 seconds
- [ ] Permission checks complete within 100ms
- [ ] Matrix components render smoothly
- [ ] No noticeable lag during permission changes
- [ ] Database queries remain efficient

---

## Test Status Tracking

### Legend
- [ ] Not Started
- 🔄 In Progress  
- ✅ Passed
- ❌ Failed
- ⚠️ Blocked/Issues

### Current Test Status
**Last Updated**: [Date]
**Test Environment**: [Environment]
**Tester**: [Name]

| Test Section | Status | Notes |
|--------------|--------|--------|
| 1.1 Super Admin Navigation Control | [ ] | |
| 1.2 Member Navigation Restrictions | [ ] | |
| 1.3 Admin Navigation Access | [ ] | |
| 2.1 Navigation Access Matrix | [ ] | |
| 2.2 Feature Access Matrix | [ ] | |
| 2.3 Settings Permissions Matrix | [ ] | |
| 2.4 User Role Matrix | [ ] | |
| 3.1 user_has_feature_access() | [ ] | |
| 3.2 get_user_navigation() | [ ] | |
| 4.1 End-to-End Permission Flow | [ ] | |
| 4.2 Multi-User Household Testing | [ ] | |
| 5.1 Missing User Data | [ ] | |
| 5.2 Database Migration Rollback | [ ] | |
| 6.1 Large Household Performance | [ ] | |

---

## Known Issues and Blockers

### Issues Log
| ID | Issue | Severity | Status | Notes |
|----|-------|----------|--------|--------|
| | | | | |

### Blockers Log
| ID | Blocker | Impact | Resolution | Notes |
|----|---------|--------|------------|--------|
| | | | | |

---

## Test Data Requirements

### Required Test Users
- 1 Super Admin with full permissions
- 2 Admins with different permission sets
- 3 Members with varying access levels
- 1 Invited user (not yet activated)

### Required Test Households
- Small household (3-5 users)
- Medium household (10-15 users) 
- Large household (25+ users) for performance testing

### Required Feature States
- Some features globally enabled
- Some features globally disabled
- Mixed permission settings across roles
- Various subscription tier configurations

---

## Post-UAT Actions

### Deployment Checklist
- [ ] All critical tests passing
- [ ] Performance benchmarks met
- [ ] Security review completed
- [ ] Documentation updated
- [ ] Training materials prepared
- [ ] Rollback plan confirmed

### Success Criteria
The permission system UAT is considered successful when:
1. All critical user stories pass acceptance criteria
2. No blocking or critical severity issues remain
3. Performance requirements are met
4. Security and data integrity validated
5. User experience meets design requirements

---

*This UAT document should be updated as features evolve and new test scenarios are identified.*
