# Supabase Database Schema Documentation

_This document provides an overview of all tables, columns, types, and relationships in your current Supabase PostgreSQL database._

---

## Connection Details
- **Project URL:** https://csbwewirwzeitavhvykr.supabase.co

---

## Table of Contents
- [User & Auth Tables](#user--auth-tables)
- [Household & Role System](#household--role-system)
- [Stripe Billing Tables](#stripe-billing-tables)
- [Feature & Permission Tables](#feature--permission-tables)
- [Enums & Types](#enums--types)
- [Relationships](#relationships)

---

## User & Auth Tables

### `users`
| Column           | Type   | Description                                  |
|------------------|--------|----------------------------------------------|
| id               | uuid   | PK, references `auth.users`                  |
| full_name        | text   | User's full name                             |
| avatar_url       | text   | Profile image URL                            |
| billing_address  | jsonb  | Billing address (JSON)                       |
| payment_method   | jsonb  | Payment methods (JSON)                       |

- **RLS:** Only users can view/update their own data.
- **Trigger:** Auto-creates user row on signup via Supabase Auth.

### `customers`
| Column            | Type   | Description                                  |
|-------------------|--------|----------------------------------------------|
| id                | uuid   | PK, references `auth.users`                  |
| stripe_customer_id| text   | Stripe customer ID                           |

- **RLS:** No user access (private table).

---

## Household & Role System

### `households`
| Column             | Type         | Description                                 |
|--------------------|--------------|---------------------------------------------|
| id                 | uuid         | PK                                          |
| name               | text         | Household name                              |
| admin_id           | uuid         | References `profiles.id` (household admin)  |
| subscription_tier  | subscription_tier | Enum: free, premium, family_plus       |
| subscription_id    | text         | Stripe subscription ID                      |
| trial_ends_at      | timestamptz  | Trial end date                              |
| created_at         | timestamptz  | Created timestamp                           |
| updated_at         | timestamptz  | Updated timestamp                           |

### `profiles`
| Column                    | Type      | Description                                  |
|---------------------------|-----------|----------------------------------------------|
| id                        | uuid      | PK, references `auth.users`                  |
| email                     | text      | Unique, user email                           |
| full_name                 | text      | Full legal name                              |
| display_name              | text      | Display name for UI                          |
| avatar_url                | text      | Profile image URL                            |
| **Personal Details**      |           |                                              |
| date_of_birth             | date      | Date of birth                                |
| phone_number              | text      | Phone number                                 |
| bio                       | text      | Personal bio/description                     |
| preferred_name            | text      | What they like to be called                  |
| pronouns                  | text      | Preferred pronouns (he/him, she/her, etc.)   |
| **Location & Contact**    |           |                                              |
| address                   | jsonb     | Full address as JSON                         |
| emergency_contact         | jsonb     | Emergency contact info as JSON               |
| **Preferences & Settings**|           |                                              |
| timezone                  | text      | Timezone (default: America/New_York)         |
| language                  | text      | Language preference (default: en)            |
| notification_preferences  | jsonb     | Notification settings as JSON                |
| privacy_settings          | jsonb     | Privacy settings as JSON                     |
| **Family Role & System**  |           |                                              |
| role                      | user_role | Enum: super_admin, admin, member             |
| household_id              | uuid      | FK to `households.id`                        |
| family_role               | text      | Mom, Dad, Child, Grandparent, etc.           |
| dietary_restrictions      | text[]    | Array of dietary restrictions                |
| allergies                 | text[]    | Array of allergies                           |
| **Status & Activity**     |           |                                              |
| is_active                 | boolean   | Active status                                |
| last_seen_at              | timestamptz| Last seen timestamp                         |
| onboarding_completed      | boolean   | Has completed onboarding flow                |
| profile_completion_percentage| integer | Profile completion (0-100%)                |
| **Timestamps**            |           |                                              |
| created_at                | timestamptz| Created timestamp                            |
| updated_at                | timestamptz| Updated timestamp                            |

- **RLS:** Users can view/update their own profile. Household members can view each other. Admins/super_admins can manage household members.

### `household_invitations`
| Column         | Type      | Description                                  |
|----------------|-----------|----------------------------------------------|
| id             | uuid      | PK                                           |
| household_id   | uuid      | FK to `households.id`                        |
| invited_email  | text      | Email invited                                |
| invited_by     | uuid      | FK to `profiles.id`                          |
| role           | user_role | Role for invitee                             |
| invitation_token| text     | Unique token                                 |
| expires_at     | timestamptz| Expiry                                      |
| accepted_at    | timestamptz| When accepted                                |
| created_at     | timestamptz| Created timestamp                            |

---

## Stripe Billing Tables

### `products`
| Column      | Type   | Description                                    |
|-------------|--------|------------------------------------------------|
| id          | text   | PK, Stripe product ID                          |
| active      | boolean| Is product active                              |
| name        | text   | Product name                                   |
| description | text   | Product description                            |
| image       | text   | Product image URL                              |
| metadata    | jsonb  | Extra info                                     |

### `prices`
| Column         | Type                | Description                                |
|----------------|---------------------|--------------------------------------------|
| id             | text                | PK, Stripe price ID                        |
| product_id     | text                | FK to `products.id`                        |
| active         | boolean             | Is price active                            |
| description    | text                | Price description                          |
| unit_amount    | bigint              | Amount (in smallest currency unit)         |
| currency       | text (3 chars)      | ISO currency code                          |
| type           | pricing_type        | Enum: one_time, recurring                  |
| interval       | pricing_plan_interval| Enum: day, week, month, year              |
| interval_count | integer             | Billing interval count                     |
| trial_period_days| integer           | Default trial days                         |
| metadata       | jsonb               | Extra info                                 |

### `subscriptions`
| Column             | Type                | Description                                |
|--------------------|---------------------|--------------------------------------------|
| id                 | text                | PK, Stripe subscription ID                 |
| user_id            | uuid                | FK to `auth.users`                         |
| status             | subscription_status | Enum: trialing, active, canceled, etc.     |
| metadata           | jsonb               | Extra info                                 |
| price_id           | text                | FK to `prices.id`                          |
| quantity           | integer             | Subscription quantity                      |
| cancel_at_period_end| boolean            | Cancel at period end?                      |
| created            | timestamptz         | Created timestamp                          |
| current_period_start| timestamptz        | Current period start                       |
| current_period_end | timestamptz         | Current period end                         |
| ended_at           | timestamptz         | Ended at                                   |
| cancel_at          | timestamptz         | Cancel at                                  |
| canceled_at        | timestamptz         | Canceled at                                |
| trial_start        | timestamptz         | Trial start                                |
| trial_end          | timestamptz         | Trial end                                  |

---

## Feature & Permission Tables

### `user_permissions`
| Column                | Type      | Description                                |
|-----------------------|-----------|--------------------------------------------|
| id                    | uuid      | PK                                         |
| user_id               | uuid      | FK to `profiles.id`                        |
| dashboard             | boolean   | Dashboard access                           |
| meals                 | boolean   | Meals access                               |
| lists                 | boolean   | Lists access                               |
| work                  | boolean   | Work access                                |
| projects              | boolean   | Projects access                            |
| profile               | boolean   | Profile access                             |
| sports_ticker         | boolean   | Sports ticker access                       |
| financial_tracking    | boolean   | Financial tracking access                  |
| ai_features           | boolean   | AI features access                         |
| household_management  | boolean   | Admin: household management                |
| user_management       | boolean   | Admin: user management                     |
| feature_management    | boolean   | Admin: feature management                  |
| billing_management    | boolean   | Admin: billing management                  |
| system_admin          | boolean   | Super admin: system admin                  |
| global_feature_control| boolean   | Super admin: global feature control        |
| analytics_dashboard   | boolean   | Super admin: analytics dashboard           |
| created_at            | timestamptz| Created timestamp                          |
| updated_at            | timestamptz| Updated timestamp                          |

### `household_features`
| Column                | Type      | Description                                |
|-----------------------|-----------|--------------------------------------------|
| id                    | uuid      | PK                                         |
| household_id          | uuid      | FK to `households.id`                      |
| dashboard             | boolean   | Dashboard enabled                          |
| meals                 | boolean   | Meals enabled                              |
| lists                 | boolean   | Lists enabled                              |
| work                  | boolean   | Work enabled                               |
| projects              | boolean   | Projects enabled                           |
| profile               | boolean   | Profile enabled                            |
| sports_ticker         | boolean   | Sports ticker enabled                      |
| financial_tracking    | boolean   | Financial tracking enabled                 |
| ai_features           | boolean   | AI features enabled                        |
| advanced_analytics    | boolean   | Advanced analytics enabled                 |
| unlimited_storage     | boolean   | Unlimited storage enabled                  |
| created_at            | timestamptz| Created timestamp                          |
| updated_at            | timestamptz| Updated timestamp                          |

### `global_feature_toggles`
| Column                | Type      | Description                                |
|-----------------------|-----------|--------------------------------------------|
| id                    | uuid      | PK                                         |
| feature_key           | text      | Unique feature key                         |
| is_enabled            | boolean   | Is feature enabled                         |
| description           | text      | Feature description                        |
| requires_subscription | boolean   | Requires subscription?                     |
| minimum_tier          | subscription_tier | Minimum subscription tier            |
| created_at            | timestamptz| Created timestamp                          |
| updated_at            | timestamptz| Updated timestamp                          |

---

## Enums & Types
- `user_role`: super_admin, admin, member
- `subscription_tier`: free, premium, family_plus
- `pricing_type`: one_time, recurring
- `pricing_plan_interval`: day, week, month, year
- `subscription_status`: trialing, active, canceled, incomplete, incomplete_expired, past_due, unpaid, paused

---

## Relationships
- `profiles.household_id` → `households.id`
- `households.admin_id` → `profiles.id`
- `user_permissions.user_id` → `profiles.id`
- `household_features.household_id` → `households.id`
- `household_invitations.household_id` → `households.id`
- `household_invitations.invited_by` → `profiles.id`
- `customers.id` → `auth.users.id`
- `users.id` → `auth.users.id`
- `subscriptions.user_id` → `auth.users.id`
- `subscriptions.price_id` → `prices.id`
- `prices.product_id` → `products.id`

---

_Last updated: September 5, 2025_
