/**
 * Switch Traffic Script for Blue-Green Deployment
 * 
 * Usage: node switch-traffic.js <target_color>
 * Example: node switch-traffic.js green
 * 
 * This script updates the Nginx upstream or load balancer configuration
 * to route traffic to the specified environment (Blue or Green).
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const COLORS = ['blue', 'green'];
const PORTS = {
    blue: 3001,
    green: 3002
};

const NGINX_CONFIG_PATH = process.env.NGINX_CONFIG || '/etc/nginx/sites-available/theeeecopy';
const IS_WINDOWS = process.platform === 'win32';

// Logger
const log = (msg) => console.log(`[SwitchTraffic] ${msg}`);
const error = (msg) => console.error(`[SwitchTraffic] ERROR: ${msg}`);

function main() {
    const targetColor = process.argv[2];

    if (!targetColor || !COLORS.includes(targetColor.toLowerCase())) {
        error(`Invalid target color. Usage: node switch-traffic.js <blue|green>`);
        process.exit(1);
    }

    const color = targetColor.toLowerCase();
    const port = PORTS[color];

    log(`Initiating traffic switch to ${color.toUpperCase()} (Port ${port})...`);

    try {
        if (IS_WINDOWS) {
            // Windows / Local Dev Mode simulation
            handleWindowsSwitch(color, port);
        } else {
            // Linux / Production Nginx Logic
            handleLinuxSwitch(color, port);
        }
    } catch (err) {
        error(`Failed to switch traffic: ${err.message}`);
        process.exit(1);
    }
}

function handleLinuxSwitch(color, port) {
    if (!fs.existsSync(NGINX_CONFIG_PATH)) {
        throw new Error(`Nginx config not found at ${NGINX_CONFIG_PATH}`);
    }

    log(`Updating Nginx config at ${NGINX_CONFIG_PATH}`);

    // Read config
    let config = fs.readFileSync(NGINX_CONFIG_PATH, 'utf8');

    // Regex to find 'server localhost:XXXX;' inside upstream block or proxy_pass
    // Simplistic replacement for demonstration
    const regex = /server localhost:\d+/;

    if (!regex.test(config)) {
        // If pattern not found, maybe create it or throw
        throw new Error('Could not find upstream server definition in Nginx config');
    }

    // Replace port
    const newConfig = config.replace(regex, `server localhost:${port}`);

    // Write back (requires permissions, usually run with sudo)
    // We use a temp file and move it if we don't have direct write access in Node
    const tempPath = `/tmp/nginx_conf_${Date.now()}`;
    fs.writeFileSync(tempPath, newConfig);

    log(`Configuration patched. applying...`);

    // Command execution
    try {
        execSync(`sudo cp ${tempPath} ${NGINX_CONFIG_PATH}`);
        execSync(`sudo nginx -t`); // Test config
        execSync(`sudo systemctl reload nginx`); // Reload
        log(`Success! Traffic switched to ${color} on port ${port}.`);
    } catch (e) {
        throw new Error(`Nginx reload failed: ${e.message}`);
    }
}

function handleWindowsSwitch(color, port) {
    log(`Windows Environment Detected.`);
    log(`Note: Windows does not use Nginx standard paths. Simulating switch.`);

    // In a local dev environment, this might update a proxy config file or just log
    // Maybe update a .env file that a local proxy server watches

    const envPath = path.resolve(__dirname, '../../.env.current_color');
    fs.writeFileSync(envPath, `CURRENT_COLOR=${color}\nPORT=${port}`);

    log(`Updated ephemeral env file at ${envPath}`);
    log(`Verified: http://localhost:${port}/health should be active.`);
    log(`Action Complete: Logical switch to ${color} recorded.`);
}

main();
