# Import browser sessions

## Use your running Chrome inside the Windows app

T3Work uses its own persistent browser by default. To use an existing Chrome login for a
particular tab, choose **New tab in signed-in Chrome** from the browser menu, or select
**Chrome (live)** from the new-tab profile menu.

Keep Chrome 144 or later running. In Chrome, open `chrome://inspect/#remote-debugging`, enable
remote debugging, then open a Chrome (live) tab in T3Work and approve Chrome's connection prompt.
The **Chrome (live)** profile uses the running Chrome's signed-in session and streams the page
into the app's browser panel. Cookies and site storage stay in Chrome. New pages also exist as
Chrome tabs; closing an app browser tab closes that corresponding Chrome tab. Existing Chrome
tabs are left open.

Browser-enabled agents can use this profile too. Disable remote debugging in Chrome to revoke
access. Regular new tabs use T3Work’s own browser and keep their own cookies and logins.
Chrome manages this profile's cookies and cache. Remote clients connect to Chrome on the server's
machine, not the viewing device. This connects Chrome Stable's default user-data directory;
other browser channels and custom user-data directories are not supported yet.

## Copy sessions into the built-in browser

The desktop app can import cookies from another browser so you can reuse its signed-in sessions
in the preview browser.

Open **Settings → Browser → Browser profiles → Import logins / add profile**, then choose a browser under
**Import from**. Close the source browser before importing, and allow an operating-system keyring
unlock prompt if one appears.

This is a one-time copy. Later login changes stay separate between the two browsers, and some
sites may still require you to sign in again.

On macOS, Safari imports need Full Disk Access. Choose **Allow**, drag T3 Code into the
System Settings permission list, and turn access on. **Continue** becomes available when access
is detected. macOS may require you to quit and reopen T3 Code before the grant applies; reopen
the import wizard afterward. You can revoke Full Disk Access once the import is done.

On Windows, import supports Firefox, Zen, and Helium profiles that use standard profile encryption.
Other Chromium-based browsers use app-bound encryption and cannot be imported. Partitioned cookies
are skipped on all platforms.
