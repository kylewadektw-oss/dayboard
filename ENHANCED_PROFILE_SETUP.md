# Enhanced Profile System Setup Guide

This guide will help you set up the enhanced profile system with photo uploads, date of birth with auto-calculated age, and household dependents (children/pets).

## 🔧 Database Setup

### 1. Run the Enhanced Profile System Migration

Execute this SQL script in your Supabase SQL editor:

```bash
# Run the enhanced profiles system setup
cat enhance_profiles_system.sql
```

This will:
- Add `date_of_birth`, `profile_photo_url`, and `google_avatar_url` columns to profiles
- Create `household_dependents` table for children/pets
- Set up automatic age calculation from date of birth
- Create RLS policies for security
- Add helpful database functions

### 2. Set Up Storage Bucket

**Important**: You need to manually create the storage bucket first:

1. Go to **Storage** in your Supabase dashboard
2. Click **"New Bucket"**
3. Name it **"profile-photos"**
4. Make it **public** ✅
5. Click **"Create Bucket"**

Then run the storage policies setup:

```bash
# Set up storage policies
cat setup_profile_photos_storage.sql
```

## 🎨 Features Added

### ✨ Enhanced Profile Setup

- **Profile Photo Upload**: Users can upload photos from device or use Google avatar
- **Date of Birth**: Automatic age calculation (no more manual age entry)
- **Visual Profile**: Photo preview and enhanced UI

### 👨‍👩‍👧‍👦 Household Dependents Manager

- **Add Children**: Track kids with school grade, emergency contacts, activities
- **Add Pets**: Track pets with breed, medical notes, dietary restrictions
- **Photo Support**: Upload photos for each family member/pet
- **Automatic Age**: Calculates age from date of birth for everyone
- **Rich Details**: Medical notes, dietary restrictions, favorite activities

### 🔄 Automatic Age Updates

- Ages are automatically calculated from date of birth
- No more manual age entry - just set the birthday once
- Database triggers keep ages current

## 🚀 Using the New Features

### For New Users

New users will see the enhanced profile setup with:
- Photo upload option
- Date of birth picker with live age calculation
- Google avatar option (if available)

### For Existing Users

Existing users can:
- Access "Manage Family & Pets" button on profile page
- Add children, pets, or other household members
- Upload photos for each dependent
- Track detailed information for family planning

### Profile Photos

Users can:
- Upload from device (max 5MB, any image format)
- Use Google avatar if signed in with Google
- Photos are stored securely in Supabase Storage
- Automatic image optimization and CDN delivery

## 📱 Updated Components

### EnhancedProfileSetup.tsx
- Replaces the basic ProfileSetup
- Adds photo upload functionality
- Date of birth with auto-age calculation
- Visual profile preview

### HouseholdDependentsManager.tsx
- Complete CRUD operations for family members/pets
- Photo upload for dependents
- Rich form with type-specific fields
- Age auto-calculation

### Updated Profile Page
- Shows profile photo in header
- Enhanced profile information display
- New "Manage Family & Pets" button
- Modal integration for dependents manager

## 🔐 Security Features

- **Row Level Security**: Users can only see their household's dependents
- **Photo Storage**: User-specific folders in storage bucket
- **Access Control**: Household members can view but not edit others' dependents
- **Data Validation**: Type checking and constraints on all fields

## 📊 Database Schema Updates

### Profiles Table
```sql
-- New columns added:
date_of_birth DATE
profile_photo_url TEXT
google_avatar_url TEXT
-- age column now auto-calculated from date_of_birth
```

### New Table: household_dependents
```sql
-- Complete dependent/family member tracking:
id, household_id, created_by, name, type
date_of_birth, age, breed, gender
photo_url, notes, dietary_restrictions
medical_notes, school_grade, favorite_activities
emergency_contact, created_at, updated_at
```

## 🎯 Usage Examples

### Adding a Child
1. Click "Manage Family & Pets" on profile page
2. Click "Add Family Member or Pet"
3. Select "Child" type
4. Fill in name, date of birth (age auto-calculates)
5. Add school grade, activities, emergency contact
6. Upload photo if desired
7. Save

### Adding a Pet
1. Same process but select "Pet" type
2. Add breed, gender
3. Include dietary restrictions, medical notes
4. Upload cute pet photo! 🐾

### Using in Todo Lists
The dependents can now be referenced in:
- Shopping lists (buy snacks for Emma)
- Todo items (pick up Max from vet)
- Meal planning (consider allergies)
- Project assignments

## 🚀 Next Steps

After setup, users can:
1. **Update existing profiles** with photos and dates of birth
2. **Add family members** to start organizing household tasks
3. **Use dependents in lists** for better family organization
4. **Track medical info** and important details
5. **Plan activities** based on ages and interests

The enhanced profile system provides a solid foundation for family-focused task management and household organization! 🏠✨
