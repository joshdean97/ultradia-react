# UltraDia — Frontend

UltraDia is a personalized rhythm tracker that helps users align their work and rest with their natural ultradian cycles. This React-based frontend interfaces with the UltraDia backend to provide a seamless experience for logging data, visualizing cycles, and managing energy for peak performance.

## 🚀 Features

- 🌅 Log your **wake time** and **HRV** each day
- 🔁 Generate personalized **ultradian rhythm cycles**
- 📊 View cycles visually using **ECharts**
- 🔋 Get dynamic **Energy Potential insights**
- 👤 Customize preferences (cycle count, durations, grog state)
- 🔐 Auth system with login, register, and logout
- 🧭 Navigation bar with routing to all key pages

## 🛠️ Tech Stack

- **React 18**
- **Next.js 13+ (App Router)**
- **TypeScript**
- **Tailwind CSS**
- **ECharts** (for visualizing cycles)
- **REST API** (connected to a Flask backend)

## 📂 Project Structure

```
/components
  ├── EnergyPotentialCard.tsx
  ├── Navbar.tsx
  └── UltradianChart.tsx

/app
  ├── login/page.tsx
  ├── register/page.tsx
  ├── log/page.tsx
  ├── profile/page.tsx
  └── ultradian/page.tsx
```

## 🔧 Getting Started

### 1. Install Dependencies

```bash
npm install
# or
yarn install
```

### 2. Run Development Server

```bash
npm run dev
# or
yarn dev
```

The app runs on [http://localhost:3000](http://localhost:3000)

> ⚠️ Make sure your backend API is running on `http://localhost:5000`

### 3. Environment Variables

The frontend currently assumes API routes like `http://localhost:5000/api/...`. You can customize this using environment variables in future refactors.

## 🧪 Pages Overview

| Route        | Description                        |
|--------------|------------------------------------|
| `/login`     | Login form with cookie-based auth  |
| `/register`  | Register a new account             |
| `/log`       | Log daily wake time and HRV        |
| `/ultradian` | View today's cycles and energy     |
| `/profile`   | Adjust preferences (cycle length etc.) |

## 🧱 Components

- **`EnergyPotentialCard`**: Interprets your HRV and offers advice
- **`UltradianChart`**: Visualizes peak/trough times using ECharts
- **`Navbar`**: Persistent navigation with dynamic user name and logout

## ✅ To Do

- [ ] Add form validation feedback
- [ ] Add support for environment-based API URL
- [ ] Improve mobile responsiveness
- [ ] Add light/dark mode

## 📄 License

MIT — feel free to use, modify, and contribute.
