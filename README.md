# iOS Alchemy - Image Enhancement Application# Welcome to your Lovable project



A modern web application that enhances images with professional-grade quality improvements. Built with React + TypeScript frontend and Python FastAPI backend.## Project info



## Project Structure**URL**: https://lovable.dev/projects/b2819bd4-4b95-4036-a98f-55750a2b4791



```## How can I edit this code?

ios-alchemy/

├── frontend/                 # React + TypeScript frontendThere are several ways of editing your application.

│   ├── src/                  # Source code

│   ├── public/               # Static assets**Use Lovable**

│   ├── package.json          # Frontend dependencies

│   ├── vite.config.ts        # Vite configurationSimply visit the [Lovable Project](https://lovable.dev/projects/b2819bd4-4b95-4036-a98f-55750a2b4791) and start prompting.

│   ├── tailwind.config.ts    # Tailwind CSS config

│   └── tsconfig.json         # TypeScript configChanges made via Lovable will be committed automatically to this repo.

│

├── backend/                  # Python FastAPI backend**Use your preferred IDE**

│   ├── main.py               # FastAPI server

│   ├── requirements.txt      # Python dependenciesIf you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

│   └── start-backend.bat     # Backend startup script

│The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

├── README.md                 # This file

└── .gitignoreFollow these steps:

```

```sh

## Quick Start# Step 1: Clone the repository using the project's Git URL.

git clone <YOUR_GIT_URL>

### Prerequisites

- Node.js 16+ and npm# Step 2: Navigate to the project directory.

- Python 3.8+cd <YOUR_PROJECT_NAME>



### Backend Setup# Step 3: Install the necessary dependencies.

npm i

```bash

cd backend# Step 4: Start the development server with auto-reloading and an instant preview.

pip install -r requirements.txtnpm run dev

python main.py```

```

**Edit a file directly in GitHub**

The backend will start on `http://localhost:8000`

- Navigate to the desired file(s).

### Frontend Setup- Click the "Edit" button (pencil icon) at the top right of the file view.

- Make your changes and commit the changes.

```bash

cd frontend**Use GitHub Codespaces**

npm install

npm run dev- Navigate to the main page of your repository.

```- Click on the "Code" button (green button) near the top right.

- Select the "Codespaces" tab.

The frontend will start on `http://localhost:3000`- Click on "New codespace" to launch a new Codespace environment.

- Edit files directly within the Codespace and commit and push your changes once you're done.

## Features

## What technologies are used for this project?

- 🎨 **Image Enhancement** - 2x upscaling with quality improvements

- 🚀 **Fast Processing** - Optimized PIL image processingThis project is built with:

- 💾 **Gallery** - LocalStorage-based image gallery

- 📱 **Responsive UI** - Beautiful, iOS-inspired design- Vite

- 🖼️ **Before/After Comparison** - Interactive comparison slider- TypeScript

- 📥 **Drag & Drop** - Easy image upload interface- React

- shadcn-ui

## Technology Stack- Tailwind CSS



### Frontend## How can I deploy this project?

- React 18

- TypeScript 5Simply open [Lovable](https://lovable.dev/projects/b2819bd4-4b95-4036-a98f-55750a2b4791) and click on Share -> Publish.

- Vite 5

- TailwindCSS 3## Can I connect a custom domain to my Lovable project?

- React Router v6

- Sonner (Toasts)Yes, you can!



### BackendTo connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

- FastAPI 0.104

- Uvicorn (ASGI Server)Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)

- Pillow (Image Processing)
- Python 3.8+

## API Endpoints

### Health Check
- `GET /health` - Check backend status

### Image Enhancement
- `POST /api/enhance` - Enhance image (multipart form-data)

### Models Info
- `GET /api/models` - Get available models information

## Environment Configuration

No configuration needed! The app works out of the box:
- Backend: `http://localhost:8000`
- Frontend: `http://localhost:3000`
- Images stored in browser LocalStorage
- No API keys required

## Building for Production

### Frontend Build
```bash
cd frontend
npm run build
```

Output will be in `frontend/dist/`

### Backend Deployment
Deploy `backend/main.py` to your server with Python 3.8+ installed.

## License

MIT
