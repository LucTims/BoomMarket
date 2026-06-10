import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dynfkwpbgnofzxjckrcs.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5bmZrd3BiZ25vZnp4amNrcmNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA2MDIxNTEsImV4cCI6MjA5NjE3ODE1MX0.oPXrPahSzszJkqDuURNIjIX10eo3g-Qth905CvZyaiw';
const supabase = createClient(supabaseUrl, supabaseKey);

async function createUser() {
    console.log("Creating user...");
    const { data, error } = await supabase.auth.signUp({
        email: 'www.boombooks1@gmail.com',
        password: 'Lucas*5002',
    });

    if (error) {
        console.error("Error creating user:", error.message);
    } else {
        console.log("User created successfully!");
        console.log("User ID:", data.user?.id);
    }
}

createUser();
