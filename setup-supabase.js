require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || 'https://vlariisbpbkrurscsjig.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseKey) {
  console.error('❌ SUPABASE_ANON_KEY environment variable is required');
  console.log('Please add your Supabase anon key to your .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupDatabase() {
  console.log('🚀 Setting up Supabase database...');
  
  try {
    // Create the developers table
    console.log('📋 Creating developers table...');
    
    const { error: createError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS developers (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          discord_id VARCHAR(255) NOT NULL,
          skills TEXT DEFAULT '',
          is_oncall BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT NOW()
        );
        
        -- Add indexes for better performance
        CREATE INDEX IF NOT EXISTS idx_developers_discord_id ON developers(discord_id);
        CREATE INDEX IF NOT EXISTS idx_developers_name ON developers(name);
      `
    });
    
    if (createError) {
      console.log('⚠️  Table creation error (might already exist):', createError.message);
    } else {
      console.log('✅ Developers table created successfully');
    }
    
    // Insert sample data
    console.log('📝 Inserting sample data...');
    
    const sampleDevelopers = [
      { 
        name: 'Alice', 
        discord_id: '123456789012345678', 
        skills: 'node,postgres,graphql', 
        is_oncall: false
      },
      { 
        name: 'Bob', 
        discord_id: '234567890123456789', 
        skills: 'react,ui,css', 
        is_oncall: false
      },
      { 
        name: 'Charlie', 
        discord_id: '345678901234567890', 
        skills: 'substreams,postgres,sql', 
        is_oncall: false
      }
    ];
    
    // Check if data already exists
    const { data: existingData } = await supabase
      .from('developers')
      .select('id')
      .limit(1);
    
    if (!existingData || existingData.length === 0) {
      const { error: insertError } = await supabase
        .from('developers')
        .insert(sampleDevelopers);
      
      if (insertError) {
        console.error('❌ Error inserting sample data:', insertError);
      } else {
        console.log('✅ Sample data inserted successfully');
      }
    } else {
      console.log('ℹ️  Sample data already exists, skipping insertion');
    }
    
    // Test the connection
    console.log('🔍 Testing database connection...');
    const { data: testData, error: testError } = await supabase
      .from('developers')
      .select('*')
      .limit(1);
    
    if (testError) {
      console.error('❌ Database connection test failed:', testError);
    } else {
      console.log('✅ Database connection successful');
      console.log(`📊 Found ${testData.length} developer(s) in database`);
    }
    
    console.log('\n🎉 Supabase setup completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Make sure your .env file has the correct environment variables');
    console.log('2. Run: npm start');
    console.log('3. Test your Discord bot commands');
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

// Run the setup
setupDatabase(); 