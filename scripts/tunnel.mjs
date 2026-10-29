// FreshLoop Cloudflare Quick Tunnel via Untun
// Provides stable, zero-password HTTPS tunnel directly into localhost:3000

import { startTunnel } from 'untun';

async function main() {
  console.log('🚀 Initializing Cloudflare Quick Tunnel for port 3000...');
  try {
    const tunnel = await startTunnel({
      port: 3000,
      acceptCloudflareNotice: true,
    });
    const url = await tunnel.getURL();
    console.log('==================================================');
    console.log('🌿 FRESHLOOP PUBLIC CLOUDFLARE HTTPS URL:');
    console.log(url);
    console.log('==================================================');
    console.log('✓ Zero password required');
    console.log('✓ Direct mobile and desktop access');
    console.log('✓ Backed by Cloudflare Global Edge');
  } catch (err) {
    console.error('Failed to start Cloudflare tunnel:', err);
    process.exit(1);
  }
}

main();
