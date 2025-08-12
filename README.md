# Discord Oncall Bot

A Discord bot to manage on-call schedules and route urgent issues to the right developers. Built with Discord.js and Supabase.

## Features

- **Developer Management**: Add, list, and manage developers with their skills and on-call schedules
- **On-Call Scheduling**: Set up weekly on-call rotations
- **Smart Alert Routing**: Automatically route urgent issues to on-call developers or find the best skill match
- **Daily Reminders**: Automated daily on-call reminders
- **Supabase Integration**: Modern database backend with real-time capabilities

## Commands

- `/adddev` - Add a new developer to the system
- `/listdevs` - List all developers and their details
- `/set-oncall` - Set on-call status for a developer
- `/alert` - Raise an urgent issue and notify the appropriate developer

## Setup Instructions

### 1. Prerequisites

- Node.js 18 or higher
- A Discord bot token
- A Supabase project

### 2. Install Dependencies

```bash
npm install
```

### 3. Set up Supabase

1. **Create a Supabase project** at [supabase.com](https://supabase.com)
2. **Get your project credentials**:
   - Go to your project dashboard
   - Navigate to Settings → API
   - Copy your Project URL and anon/public key

### 4. Configure Environment Variables

Create a `.env` file in the project root:

```env
# Discord Bot Configuration
BOT_TOKEN=your_discord_bot_token_here
DISCORD_APPLICATION_ID=your_discord_application_id_here

# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Optional Configuration
DAILY_ONCALL_TIME=09:00
MATCH_THRESHOLD=0.1
```

### 5. Set up the Database

Run the Supabase setup script to create the required table and sample data:

```bash
npm run setup-supabase
```

Alternatively, you can manually create the table in your Supabase SQL Editor:

```sql
-- Create the developers table
CREATE TABLE developers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    discord_id VARCHAR(255) NOT NULL,
    skills TEXT DEFAULT '',
    is_oncall BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX idx_developers_discord_id ON developers(discord_id);
CREATE INDEX idx_developers_name ON developers(name);

-- Insert sample data
INSERT INTO developers (name, discord_id, skills, is_oncall) VALUES
    ('Alice', '123456789012345678', 'node,postgres,graphql', true),
    ('Bob', '234567890123456789', 'react,ui,css', false),
    ('Charlie', '345678901234567890', 'substreams,postgres,sql', false);
```

### 6. Register Discord Commands

Register the slash commands with Discord:

```bash
npm run register-commands
```

### 7. Start the Bot

```bash
# Production
npm start

# Development (with auto-restart)
npm run start:dev
```

## Usage Examples

### Adding a Developer

```
/adddev name:John discordid:123456789012345678 skills:javascript,react,node oncall:true
```

### Setting On-Call Status

```
/set-oncall discordid:123456789012345678 isoncall:true
```

### Raising an Alert

```
/alert issue:Database connection timeout, need immediate assistance
```

### Listing Developers

```
/listdevs
```

## Database Schema

### Developers Table

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| name | VARCHAR(255) | Developer's name |
| discord_id | VARCHAR(255) | Discord user ID |
| skills | TEXT | Comma-separated list of skills |
| is_oncall | BOOLEAN | Whether the developer is currently on-call |
| created_at | TIMESTAMP | Record creation timestamp |

## Architecture

- **Discord.js**: Discord bot framework
- **Supabase**: PostgreSQL database with real-time capabilities
- **Node-cron**: Scheduled tasks for daily reminders
- **Winston**: Logging

## Development

### Project Structure

```
src/
├── commands/          # Discord slash commands
├── services/          # Business logic and database operations
├── index.js          # Main bot entry point
└── supabase.js       # Supabase client configuration
```

### Available Scripts

- `npm start` - Start the bot
- `npm run start:dev` - Start with auto-restart
- `npm run setup-supabase` - Initialize Supabase database
- `npm run register-commands` - Register Discord commands

## Troubleshooting

### Common Issues

1. **"SUPABASE_ANON_KEY environment variable is required"**
   - Make sure your `.env` file has the correct Supabase credentials

2. **"Failed to connect to database"**
   - Verify your Supabase URL and API key
   - Check if the developers table exists

3. **"Discord commands not working"**
   - Ensure you've registered the commands: `npm run register-commands`
   - Check bot permissions in your Discord server

### Logs

The bot uses Winston for logging. Check the console output for detailed error messages and debugging information.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details.