# CentOS Home Server Setup for the Check Register App

This guide covers turning the old Asus E410M laptop into a simple CentOS home server for the check register app.

## 1. Prepare the laptop

1. Back up anything you want to keep.
2. Download the latest CentOS Stream or CentOS 9 Stream ISO.
3. Create a bootable USB installer.
4. Boot the laptop from USB and install CentOS.

Recommended installation choices:
- Minimal Install
- Set a static hostname, such as `check-home`
- Create a root password and one non-root admin user
- Enable networking during install

## 2. Update the system

After installation, log in and run:

```bash
sudo dnf update -y
sudo dnf install -y git curl wget nano
```

## 3. Install Node.js

CentOS often needs the NodeSource repository for current Node versions.

```bash
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo dnf install -y nodejs
node --version
npm --version
```

## 4. Install a web server/runtime

For this app, the minimum useful setup is:
- Node.js runtime
- a process manager such as `pm2`

Install PM2:

```bash
sudo npm install -g pm2
```

## 5. Install a database (optional for the first pass)

For the first version, you can keep using local storage on the server if you want the simplest path.

If you later want a real database, a common next step is PostgreSQL:

```bash
sudo dnf install -y postgresql-server postgresql-contrib
sudo postgresql-setup --initdb
sudo systemctl enable --now postgresql
```

## 6. Clone the app onto the server

```bash
cd /opt
sudo git clone https://github.com/jcr422003-lab/JCR-Check-Registry.git
cd /opt/JCR-Check-Registry/check-register-app
npm install
npm run build
```

## 7. Run the app as a service

Create a service file:

```bash
sudo nano /etc/systemd/system/check-register.service
```

Example contents:

```ini
[Unit]
Description=Check Register App
After=network.target

[Service]
WorkingDirectory=/opt/JCR-Check-Registry/check-register-app
ExecStart=/usr/bin/npm run dev -- --host 0.0.0.0 --port 3000
Restart=always
User=your-username
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

Then enable it:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now check-register.service
sudo systemctl status check-register.service
```

## 8. Make it reachable on your home network

The laptop should now be reachable on the local network using its IP address.

Example:

```bash
hostname -I
```

Then on another device on your home Wi-Fi, open:

```text
http://<server-ip>:3000
```

## 9. Optional: keep it on automatically

Make sure the laptop is configured to stay awake and not sleep while plugged in:

- set the power settings to never sleep while plugged in
- keep the laptop plugged in when you want it always available

## 10. Optional future step: use the home Wi-Fi as the trusted network

For the app, you can later add logic so that:
- full transaction entry is allowed only when connected to your home Wi-Fi
- away from home the app becomes read-only or queues changes

## Notes

- This setup is intentionally simple and local-first.
- It avoids public internet exposure for now.
- If you later want remote access away from home, the next logical step is a VPN.
