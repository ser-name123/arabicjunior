import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle2 } from "lucide-react";

interface ThankYouModalProps {
    open: boolean;
    onClose: () => void;
    title?: string;
    message?: string;
}

const ThankYouModal: React.FC<ThankYouModalProps> = ({
    open,
    onClose,
    title = "Thank you for subscribing!",
    message = "You've successfully subscribed to our newsletter. Stay tuned!",
}) => {
    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-sm text-center">
                <DialogHeader>
                    <div className="flex justify-center text-orange-500">
                        <CheckCircle2 size={48} />
                    </div>
                    <DialogTitle className="text-xl text-center font-semibold mt-2">{title}</DialogTitle>
                </DialogHeader>
                <p className="text-gray-600 mt-2">{message}</p>
                <button
                    onClick={onClose}
                    className="mt-4 bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-500/80 transition"
                >
                    Close
                </button>
            </DialogContent>
        </Dialog>
    );
};

export default ThankYouModal;
