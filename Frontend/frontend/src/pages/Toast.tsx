import { useEffect } from "react";
import { CheckCircle, XCircle, Info, X } from "lucide-react";
import "./Toast.css";

interface ToastProps {
    message: string;
    type: "success" | "error" | "info";
    onClose: () => void;
}

const icons = {
    success: <CheckCircle size={18} />,
    error: <XCircle size={18} />,
    info: <Info size={18} />,
};

const Toast = ({ message, type, onClose }: ToastProps) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3500);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className={`toast toast-${type}`}>
            <span className="toast-icon">{icons[type]}</span>
            <span className="toast-msg">{message}</span>
            <button className="toast-close" onClick={onClose}>
                <X size={14} />
            </button>
        </div>
    );
};

export default Toast;
