import InteractiveLayoutMap from "./BasavaGanguruMap";

export const metadata = {
    title: "Basava Ganguru — Interactive Layout Map",
    description: "Interactive residential layout map — Shivamogga, Karnataka",
};

export default function LayoutMapPage() {
    return (
        <main>
            <InteractiveLayoutMap />
        </main>
    );
}