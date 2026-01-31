/* Copyright (C) 2023-2025 anonymous

This file is part of PSFree.

PSFree is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

PSFree is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.  */

let retryCount = 0;
const MAX_RETRIES = 3;
let isRetrying = false;

function updateStatus(message) {
    const msgsEl = document.getElementById('msgs');
    if (msgsEl) {
        msgsEl.textContent = message;
    }
}

function handleError(errorType, reason) {
    if (isRetrying) return; // Prevent multiple retry triggers

    const errorMessage =
        `${errorType}\n`
        + `${reason}\n`
        + `${reason.sourceURL || ''}:${reason.line || ''}:${reason.column || ''}\n`
        + `${reason.stack || ''}`;

    console.error(errorMessage);

    retryCount++;

    if (retryCount < MAX_RETRIES) {
        isRetrying = true;

        // User-friendly error message in Bahasa Indonesia
        const userMessage =
            `⚠️ Exploit Error (Percobaan ${retryCount}/${MAX_RETRIES})\n\n`
            + `Akan mencoba lagi otomatis dalam 3 detik...\n`
            + `Jangan tutup halaman ini.\n\n`
            + `Debug Info: ${reason.message || reason}`;

        alert(userMessage);

        updateStatus(`Error! Mencoba lagi (${retryCount}/${MAX_RETRIES})...`);

        // Auto-reload after delay
        setTimeout(() => {
            location.reload();
        }, 3000);

    } else {
        // Max retries reached
        const failMessage =
            `❌ Exploit Gagal Setelah ${MAX_RETRIES} Percobaan\n\n`
            + `Silakan:\n`
            + `1. Tutup browser PS4 (tekan Circle)\n`
            + `2. Clear cache browser (Settings → Application Data)\n`
            + `3. Buka webkit lagi dari bookmark\n`
            + `4. Coba kembali\n\n`
            + `Debug: ${reason.message || reason}`;

        alert(failMessage);

        updateStatus('Exploit gagal. Silakan clear cache dan coba lagi.');

        // Redirect to main page after 5 seconds
        setTimeout(() => {
            if (window.location.pathname.includes('900goldhen_psfree')) {
                window.location.href = '../index.html';
            }
        }, 5000);
    }
}

addEventListener('unhandledrejection', event => {
    event.preventDefault();
    handleError('Unhandled rejection', event.reason);
});

addEventListener('error', event => {
    event.preventDefault();
    handleError('Unhandled error', event.error);
    return true;
});

// Prevent stuck loading: Add timeout watchdog
let loadingStartTime = Date.now();
const LOADING_TIMEOUT = 30000; // 30 seconds max

function checkLoadingTimeout() {
    if (!isRetrying && Date.now() - loadingStartTime > LOADING_TIMEOUT) {
        const msgsEl = document.getElementById('msgs');
        if (msgsEl && msgsEl.textContent.includes('Loading') || msgsEl.textContent.includes('Memuat')) {
            handleError('Loading timeout', {
                message: 'Exploit stuck, auto-retry triggered',
                sourceURL: window.location.href,
                line: 0,
                column: 0,
                stack: 'Timeout after 30s'
            });
        }
    }
}

// Check for stuck loading every 5 seconds
setInterval(checkLoadingTimeout, 5000);

// we have to dynamically import the program if we want to catch its syntax
// errors
try {
    updateStatus('Memuat exploit...');
    import('./psfree.mjs');
} catch (e) {
    handleError('Import error', e);
}
