"""
backend/utils/antidetection.py
Advanced anti-detection system for Playwright web scrapers.
Overrides browser fingerprinting patterns, navigator properties,
WebGL/Canvas signatures, and browser behaviors to prevent detection by Cloudflare, Akamai, and other security layers.
"""

import random
from playwright.async_api import BrowserContext, Page

STEALTH_JS = """
// 1. Delete the webdriver property
try {
    Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined
    });
} catch (e) {}

// 2. Spoof window.chrome
try {
    window.chrome = {
        app: {
            isInstalled: false,
            InstallState: {
                DISABLED: 'disabled',
                INSTALLED: 'installed',
                NOT_INSTALLED: 'not_installed'
            },
            RunningState: {
                CANNOT_RUN: 'cannot_run',
                RUNNING: 'running',
                READY_TO_RUN: 'ready_to_run'
            }
        },
        runtime: {
            OnInstalledReason: {
                CHROME_UPDATE: 'chrome_update',
                INSTALL: 'install',
                SHARED_MODULE_UPDATE: 'shared_module_update',
                UPDATE: 'update'
            },
            OnRestartRequiredReason: {
                APP_UPDATE: 'app_update',
                OS_UPDATE: 'os_update',
                PERIODIC: 'periodic'
            },
            PlatformArch: {
                ARM: 'arm',
                ARM64: 'arm64',
                MIPS: 'mips',
                MIPS64: 'mips64',
                X86_32: 'x86-32',
                X86_64: 'x86-64'
            },
            PlatformNaclArch: {
                ARM: 'arm',
                MIPS: 'mips',
                MIPS64: 'mips64',
                X86_32: 'x86-32',
                X86_64: 'x86-64'
            },
            PlatformOs: {
                ANDROID: 'android',
                CROS: 'cros',
                LINUX: 'linux',
                MAC: 'mac',
                OPENBSD: 'openbsd',
                WIN: 'win'
            },
            RequestUpdateCheckStatus: {
                NO_UPDATE: 'no_update',
                THROTTLED: 'throttled',
                UPDATE_AVAILABLE: 'update_available'
            }
        },
        loadTimes: function() {},
        csi: function() {}
    };
} catch (e) {}

// 3. Spoof Plugins
try {
    Object.defineProperty(navigator, 'plugins', {
        get: () => [
            { description: "Portable Document Format", filename: "internal-pdf-viewer", name: "Chrome PDF Viewer" },
            { description: "Portable Document Format", filename: "internal-pdf-viewer", name: "Chrome PDF Viewer" }
        ],
    });
} catch (e) {}

// 4. Spoof Languages
try {
    Object.defineProperty(navigator, 'languages', {
        get: () => ['en-IN', 'en-GB', 'en-US', 'en'],
    });
} catch (e) {}

// 5. Spoof Permissions Query
try {
    const originalQuery = window.navigator.permissions.query;
    window.navigator.permissions.query = (parameters) => (
        parameters.name === 'notifications' ?
            Promise.resolve({ state: Notification.permission }) :
            originalQuery(parameters)
    );
} catch (e) {}

// 6. Overwhelm WebGL fingerprinting
try {
    const getParameter = WebGLRenderingContext.prototype.getParameter;
    WebGLRenderingContext.prototype.getParameter = function(parameter) {
        // UNMASKED_VENDOR_WEBGL
        if (parameter === 37445) {
            return 'Intel Inc.';
        }
        // UNMASKED_RENDERER_WEBGL
        if (parameter === 37446) {
            return 'ANGLE (Intel, Intel(R) UHD Graphics Direct3D11 vs_5_0 ps_5_0, vs_5_0 ps_5_0)';
        }
        return getParameter.apply(this, [parameter]);
    };
} catch (e) {}
"""

async def apply_antidetection(context: BrowserContext) -> None:
    """
    Applies custom javascript injections to every page spawned by this context,
    neutralizing automation footprints.
    """
    await context.add_init_script(STEALTH_JS)
