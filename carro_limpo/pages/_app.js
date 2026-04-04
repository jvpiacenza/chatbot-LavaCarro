import "@/styles/globals.css";

export default function App({ Component, pageProps }) {
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <main className="flex-1 overflow-y-auto">
        <Component {...pageProps} />
      </main>
    </div>
  );
}