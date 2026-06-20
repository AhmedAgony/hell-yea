/*
Discord Voice Perpetual Connector - JavaScript FINAL
Works with @discordjs/voice
*/

const { Client } = require('discord.js-selfbot-v13');
const { joinVoiceChannel } = require('@discordjs/voice');

// قراءة التوكن من متغيرات البيئة (آمن)
const TOKEN = process.env.TOKEN;
const VOICE_CHANNEL_ID = process.env.VOICE_CHANNEL_ID;

// لو مش موجودين، يطلع خطأ واضح
if (!TOKEN || !VOICE_CHANNEL_ID) {
    console.error("[✗] Missing TOKEN or VOICE_CHANNEL_ID in environment variables");
    process.exit(1);
}

const client = new Client({
    checkUpdate: false
});

let connection = null;

client.on('ready', async () => {
    console.log(`[✓] Logged in as: ${client.user.tag}`);
    console.log(`[✓] Server count: ${client.guilds.cache.size}`);
    await joinVoice();
});

async function joinVoice() {
    try {
        const channel = client.channels.cache.get(VOICE_CHANNEL_ID);
        
        if (!channel) {
            console.log(`[✗] Voice channel not found - searching...`);
            
            for (const guild of client.guilds.cache.values()) {
                const found = guild.channels.cache.find(ch => ch.id === VOICE_CHANNEL_ID && ch.isVoice());
                if (found) {
                    console.log(`[✓] Found: ${found.name} in ${guild.name}`);
                    await connectToChannel(found);
                    return;
                }
            }
            setTimeout(joinVoice, 10000);
            return;
        }
        
        await connectToChannel(channel);
        
    } catch (error) {
        console.error(`[!] Error: ${error.message}`);
        setTimeout(joinVoice, 15000);
    }
}

async function connectToChannel(channel) {
    try {
        console.log(`Joining: ${channel.name}...`);
        
        connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator,
            selfMute: true,
            selfDeaf: true
        });
        
        console.log("[✓] Connected successfully!");
        console.log("Mic is locked - no one can hear you");
        console.log("Account will stay here forever");
        
        setInterval(() => {
            process.stdout.write(".");
        }, 60000);
        
    } catch (error) {
        console.error(`[!] Failed to join: ${error.message}`);
        
        if (error.message.includes("4017")) {
            console.log("Channel uses DAVE protocol - try another channel");
        }
        setTimeout(joinVoice, 15000);
    }
}

client.on('voiceStateUpdate', (oldState, newState) => {
    if (newState.member && newState.member.id === client.user.id) {
        if (!newState.channelId) {
            console.log("\n[🔄] Kicked - rejoining...");
            setTimeout(joinVoice, 3000);
        }
    }
});

console.log("=".repeat(50));
console.log("Discord - Stay in Voice Forever (JS)");
console.log("Mic is locked | No one notices you");
console.log(`Channel ID: ${VOICE_CHANNEL_ID}`);
console.log("Press Ctrl + C to stop");
console.log("=".repeat(50));

client.login(TOKEN).catch(err => {
    console.error(`[✗] Login failed: ${err.message}`);
});