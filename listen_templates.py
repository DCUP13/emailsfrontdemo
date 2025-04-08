from supabase.lib.client_options import ClientOptions
from supabase import create_client
from dotenv import load_dotenv
import os
import asyncio

# Load environment variables
load_dotenv()

# Initialize Supabase client
supabase_url = os.getenv("VITE_SUPABASE_URL")
supabase_key = os.getenv("VITE_SUPABASE_ANON_KEY")

if not supabase_url or not supabase_key:
    raise ValueError("Missing Supabase environment variables")

async def handle_template_changes(event):
    """Handle template changes"""
    try:
        payload = event.payload
        event_type = payload.get('type')
        record = payload.get('new', {})
        
        if event_type == 'INSERT':
            print(f"New template created: {record.get('name')}")
            print(f"Content: {record.get('content', '')[:100]}...")  # First 100 chars
        
        elif event_type == 'UPDATE':
            old_record = payload.get('old', {})
            print(f"Template updated: {record.get('name')}")
            print(f"Previous update: {old_record.get('updated_at')}")
            print(f"New update: {record.get('updated_at')}")
        
        elif event_type == 'DELETE':
            old_record = payload.get('old', {})
            print(f"Template deleted: {old_record.get('name')}")
            
    except Exception as e:
        print(f"Error handling event: {e}")

async def main():
    """Main async function to handle Supabase connection and listening"""
    try:
        # Initialize client options
        options = ClientOptions(
            schema='public',
            auto_refresh_token=False,
            persist_session=False,
            detect_session_in_url=False
        )
        
        # Initialize Supabase client
        supabase = create_client(supabase_url, supabase_key, options=options)
        
        print("Connecting to Supabase realtime...")
        
        # Create channel
        channel = supabase.channel('templates-changes')
        
        # Subscribe to changes
        channel.on(
            'postgres_changes',
            {
                'event': '*',
                'schema': 'public',
                'table': 'templates'
            },
            handle_template_changes
        ).subscribe()
        
        print("Successfully connected! Listening for template changes... Press Ctrl+C to exit")
        
        # Keep the connection alive
        while True:
            await asyncio.sleep(1)

    except Exception as e:
        print(f"Error: {e}")
        raise

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\nStopping listener...")