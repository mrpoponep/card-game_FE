// Test exports from api.js
import { apiGet, apiPost } from './api.js';

console.log('✅ apiGet:', typeof apiGet);
console.log('✅ apiPost:', typeof apiPost);

if (typeof apiGet === 'function' && typeof apiPost === 'function') {
    console.log('🎉 All API exports working!');
} else {
    console.error('❌ API exports not working!');
}
