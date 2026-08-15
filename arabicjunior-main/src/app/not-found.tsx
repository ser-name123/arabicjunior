import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import React from "react";

function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-orange-500 mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-4 text-orange-500/80">Page Not Found</h2>
        <p className="text-muted-foreground mb-8 max-w-md text-orange-500/70">
          Don&apos;t worry, even the best data sometimes gets lost in the
          internet.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link
            href="/"
            className="flex items-center justify-center px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-500/80 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go To Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}

export default NotFoundPage;

