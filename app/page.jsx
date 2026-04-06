import React from "react";

export const metadata = {
  title: "Access Restricted",
  description: "Redirect to Hostify",
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="text-center max-w-md">

        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          🚫 You are not supposed to be here
        </h1>

        <p className="text-gray-600 mb-6">
          Please go to the official Hostify website.
        </p>

        <a
          href="https://hostify.indevs.in"
          className="bg-black text-white px-6 py-3 rounded-xl font-semibold"
        >
          Go to Hostify
        </a>

      </div>
    </div>
  );
}
