// components/PixelTracker.tsx
"use client"; // ✅ Important to ensure it runs on the client

import { useEffect } from "react";
import ReactPixel from "react-facebook-pixel";

const PixelTracker = () => {
    useEffect(() => {
        const pixelId = "959599492909385";
        ReactPixel.init(pixelId);
        ReactPixel.pageView();
    }, []);

    return null;
};

export default PixelTracker;
