import { BrowserRouter, Routes, Route } from "react-router-dom";

import RoleSelection from "./pages/RoleSelection";

function App() {
    return (
        <BrowserRouter>
            <Routes>

                <Route path="/" element={<Home />} />

                <Route
                    path="/role-selection"
                    element={<RoleSelection />}
                />

            </Routes>
        </BrowserRouter>
    );
}

function Home() {
    return (
        <div>
            <h1>StartupSync</h1>

            <a href="/role-selection">
                Go to Role Selection
            </a>
        </div>
    );
}

export default App;