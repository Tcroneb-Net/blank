import React from "react";

export const metadata = {
  title: "Access Restricted | Hostify",
  description: "This page is restricted. Go to Hostify.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          🚫 You're not supposed to be here
        </h1>

        <p className="text-gray-600 mb-6">
          The blog section has been moved to Hostify.
        </p>

        <a
          href="https://hostify.indevs.in"
          className="inline-block bg-black text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-800 transition"
        >
          Go to Hostify
        </a>

        <p className="text-xs text-gray-400 mt-4">
          hostify.indevs.in
        </p>
      </div>
    </div>
  );
}
