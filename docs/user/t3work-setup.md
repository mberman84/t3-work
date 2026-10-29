# Install T3Work and use it across computers

Download the Windows installer from the [latest T3Work release](https://github.com/mberman84/t3-work/releases/latest), then run it on each computer. The x64 installer supports Intel and AMD Windows PCs and can run through Windows on Arm's x64 emulation. No development tools or source checkout are needed. These personal builds are unsigned, so Windows may show an unknown-publisher prompt.

T3Work has its own installation identity and stores local data under `~/.t3work`. It does not import or overwrite an existing T3 Code installation. Updates come from this fork's GitHub releases; use **Settings → About** to check for updates.

## Share work from your main computer

Use one main computer as the host. Keep it running and prevent sleep while working from another computer.

1. On the main computer, open **Settings → Sharing & access**, sign in to T3 Connect, and enable it for this computer.
2. On each other computer, install T3Work, sign in to the same T3 Connect account, and select the main computer under **Settings → Environments**.
3. Open or create your chats and projects on that connected computer. They are the same records on every connected device, and use the host's authenticated providers.

The release includes T3's public Connect configuration. If Connect cannot reach the host, use [direct network or Tailscale pairing](remote-access.md#pair-over-a-lan-or-private-network): enable **Network access** on the host, create a fresh pairing link for each device, and paste it into **Add environment** on that device. Pasting the link avoids relying on which app owns `t3code://` links if you also have upstream T3 Code installed.

This is live access to the host, not offline replication. Independent local chats on another computer remain on that computer. Local appearance preferences and Chrome profiles are not copied between computers. Provider credentials stay on the host, which uses them for connected clients. Do not put the live data directory in OneDrive or another folder sync service.

## Use Chrome's existing sign-ins

On the computer running the browser, keep Chrome open, enable remote debugging at `chrome://inspect/#remote-debugging`, then select **Live Chrome** in T3Work's browser profiles. Approve Chrome's connection prompt. T3Work uses that Chrome installation's signed-in sessions without exporting its cookies.

A remote connection uses the host's browser and sign-ins. To use a different computer's Chrome profile, connect to that computer instead and enable Live Chrome there. Chrome's own sync and site sign-ins determine which sessions are available on each computer.

## Publish an update

Push a release tag such as `t3work-v0.1.1` to this repository. The **T3Work Windows release** workflow builds the native installer, validates its packaged payload, and publishes the installer, checksum, and update metadata together. It uses the public values in `.env.example` for T3 Connect; provider credentials and local state are never included. Use a higher version for each release. Installed copies can then download that release through the app's updater.
