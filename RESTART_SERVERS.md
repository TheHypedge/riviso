# How to Restart Frontend and Backend Servers

## Quick Restart (Both Servers Together)

### Option 1: Using the Root Script (Recommended)

If you started the servers with `npm run dev` from the root directory:

1. **Stop the servers:**
   - Find the terminal where `npm run dev` is running
   - Press `Ctrl + C` (or `Cmd + C` on Mac) to stop both servers

2. **Restart both servers:**
   ```bash
   cd /Volumes/Work/riviso
   npm run dev
   ```

### Option 2: Kill Process and Restart

If you can't find the terminal:

1. **Find and kill the process:**
   ```bash
   # Find the process
   ps aux | grep "npm run dev" | grep -v grep
   
   # Kill it (replace PID with actual process ID)
   kill -9 <PID>
   ```

2. **Restart:**
   ```bash
   cd /Volumes/Work/riviso
   npm run dev
   ```

## Restart Backend Only

### Method 1: If Running Together

1. **Stop the combined process** (Ctrl+C)
2. **Start backend only:**
   ```bash
   cd /Volumes/Work/riviso
   npm run dev:backend
   ```

### Method 2: If Running Separately

1. **Find backend process:**
   ```bash
   ps aux | grep "nest start" | grep -v grep
   # or
   lsof -i :4000
   ```

2. **Kill it:**
   ```bash
   kill -9 <PID>
   ```

3. **Restart:**
   ```bash
   cd /Volumes/Work/riviso/apps/backend
   npm run start:dev
   ```

## Restart Frontend Only

### Method 1: If Running Together

1. **Stop the combined process** (Ctrl+C)
2. **Start frontend only:**
   ```bash
   cd /Volumes/Work/riviso
   npm run dev:frontend
   ```

### Method 2: If Running Separately

1. **Find frontend process:**
   ```bash
   ps aux | grep "next dev" | grep -v grep
   # or
   lsof -i :3000
   ```

2. **Kill it:**
   ```bash
   kill -9 <PID>
   ```

3. **Restart:**
   ```bash
   cd /Volumes/Work/riviso/apps/frontend
   npm run dev
   ```

## Restart After Environment Variable Changes

If you updated `.env` file in the backend:

1. **Stop the backend** (or both servers)
2. **Restart:**
   ```bash
   cd /Volumes/Work/riviso
   npm run dev
   ```

**Important:** Environment variables are only loaded when the server starts, so you must restart after changing `.env` files.

## Using Different Terminals (Recommended for Development)

For easier debugging, run them in separate terminals:

### Terminal 1 - Backend:
```bash
cd /Volumes/Work/riviso/apps/backend
npm run start:dev
```

### Terminal 2 - Frontend:
```bash
cd /Volumes/Work/riviso/apps/frontend
npm run dev
```

This way you can:
- See logs separately
- Restart one without affecting the other
- Easier to debug issues

## Quick Commands Reference

```bash
# Start both (from root)
npm run dev

# Start backend only
npm run dev:backend
# or
cd apps/backend && npm run start:dev

# Start frontend only
npm run dev:frontend
# or
cd apps/frontend && npm run dev

# Stop servers
Ctrl + C (in the terminal running the server)

# Kill by port (if Ctrl+C doesn't work)
lsof -ti:4000 | xargs kill -9  # Backend (port 4000)
lsof -ti:3000 | xargs kill -9  # Frontend (port 3000)
```

## Troubleshooting

### Port Already in Use

If you get "port already in use" error:

```bash
# Find what's using the port
lsof -i :4000  # Backend
lsof -i :3000  # Frontend

# Kill it
kill -9 <PID>
```

### Servers Not Starting

1. Check if ports are available
2. Check for syntax errors in `.env` files
3. Make sure dependencies are installed:
   ```bash
   npm install
   ```

### Changes Not Reflecting

- **Backend changes**: Usually auto-reloads with `start:dev`
- **Frontend changes**: Usually auto-reloads with `dev`
- **Environment variables**: Requires full restart
- **New dependencies**: Restart after `npm install`
