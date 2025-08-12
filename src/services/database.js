const supabase = require('../supabase');

class DatabaseService {
  // Get all developers
  async getAllDevelopers() {
    const { data, error } = await supabase
      .from('developers')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching developers:', error);
      throw error;
    }
    
    return data || [];
  }

  // Get developer by Discord ID
  async getDeveloperByDiscordId(discordId) {
    const { data, error } = await supabase
      .from('developers')
      .select('*')
      .eq('discord_id', discordId)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('Error fetching developer by Discord ID:', error);
      throw error;
    }
    
    return data;
  }

  // Add a new developer
  async addDeveloper(developerData) {
    const { data, error } = await supabase
      .from('developers')
      .insert([developerData])
      .select()
      .single();
    
    if (error) {
      console.error('Error adding developer:', error);
      throw error;
    }
    
    return data;
  }

  // Update developer
  async updateDeveloper(id, updates) {
    const { data, error } = await supabase
      .from('developers')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating developer:', error);
      throw error;
    }
    
    return data;
  }

  // Delete developer
  async deleteDeveloper(id) {
    const { error } = await supabase
      .from('developers')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting developer:', error);
      throw error;
    }
    
    return true;
  }

  // Get on-call developers
  async getOncallDevelopers() {
    const { data, error } = await supabase
      .from('developers')
      .select('*')
      .eq('is_oncall', true);
    
    if (error) {
      console.error('Error fetching on-call developers:', error);
      throw error;
    }
    
    return data || [];
  }

  // Get developers by skill
  async getDevelopersBySkill(skill) {
    const { data, error } = await supabase
      .from('developers')
      .select('*')
      .ilike('skills', `%${skill}%`);
    
    if (error) {
      console.error('Error fetching developers by skill:', error);
      throw error;
    }
    
    return data || [];
  }

  // Initialize database with sample data
  async initializeDatabase() {
    const sampleDevelopers = [
      { 
        name: 'Alice', 
        discord_id: '123456789012345678', 
        skills: 'node,postgres,graphql', 
        is_oncall: true 
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

    // Check if developers table is empty
    const { data: existingDevelopers } = await supabase
      .from('developers')
      .select('id')
      .limit(1);

    if (existingDevelopers && existingDevelopers.length === 0) {
      const { error } = await supabase
        .from('developers')
        .insert(sampleDevelopers);
      
      if (error) {
        console.error('Error initializing database:', error);
        throw error;
      }
      
      console.log('Database initialized with sample data');
    }
  }
}

module.exports = new DatabaseService(); 