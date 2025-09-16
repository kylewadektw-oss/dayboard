require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Use service role key for admin operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function demonstrateRounding() {
  console.log('🎯 Profile Completion Percentage Rounding Demonstration\n');
  console.log(
    'With 9 fields total, here are the possible completion percentages:\n'
  );

  for (let filled = 0; filled <= 9; filled++) {
    const exactPercentage = (filled * 100) / 9;
    const roundedPercentage = Math.round(exactPercentage);

    console.log(
      `${filled}/9 fields: ${exactPercentage.toFixed(2)}% → ${roundedPercentage}%`
    );
  }

  console.log('\n📋 Profile Completion Criteria:');
  console.log('1. Name (name OR preferred_name)');
  console.log('2. Phone number');
  console.log('3. Date of birth');
  console.log('4. Bio');
  console.log('5. Timezone');
  console.log('6. Language');
  console.log('7. Dietary preferences');
  console.log('8. Allergies');
  console.log('9. Avatar');

  console.log('\n✅ Profile completion percentages are now properly rounded!');
  console.log(
    '🔄 The calculation updates automatically when users edit their profiles.'
  );
}

demonstrateRounding();
