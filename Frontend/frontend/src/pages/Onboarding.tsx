import React, { useState } from "react";
import "./Onboarding.css";

interface OnboardingProps {
    onComplete: () => void;
}

const steps = [
    {
        icon: "🎉",
        title: "Selamat Datang di Kripto-Z!",
        desc: "Simulasi trading crypto tanpa risiko. Kamu bisa belajar trading dengan uang virtual. Mari kenali fitur-fiturnya!",
        accent: "#6366f1",
    },
    {
        icon: "💰",
        title: "Saldo Virtual Rp 1.000.000",
        desc: "Kamu mendapat saldo virtual untuk membeli crypto. Gunakan dengan bijak dan latih strategi tradingmu!",
        accent: "#22c55e",
    },
    {
        icon: "📈",
        title: "Simulasi Trading",
        desc: "Di tab Simulasi, kamu bisa beli dan jual crypto dengan harga real-time. Tidak ada risiko uang sungguhan!",
        accent: "#38bdf8",
    },
    {
        icon: "📚",
        title: "Belajar & Komunitas",
        desc: "Akses materi edukasi di tab Belajar. Diskusi strategi dengan trader lain di Forum Komunitas.",
        accent: "#f59e0b",
    },
    {
        icon: "🎓",
        title: "Mentor Profesional",
        desc: "Konsultasi langsung dengan mentor berpengalaman. Lihat jadwal mentoring dan join sesi via Zoom!",
        accent: "#ec4899",
    },
];

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
    const [step, setStep] = useState(0);
    const [animating, setAnimating] = useState(false);

    const isLast = step === steps.length - 1;
    const current = steps[step];

    const goNext = () => {
        if (isLast) {
            onComplete();
            return;
        }
        setAnimating(true);
        setTimeout(() => {
            setStep((s) => s + 1);
            setAnimating(false);
        }, 200);
    };

    return (
        <div className="onboarding-overlay">
            <div className={`onboarding-card ${animating ? "fade-out" : "fade-in"}`}>
                {/* Glow ring */}
                <div
                    className="onboarding-glow"
                    style={{
                        background: `radial-gradient(circle, ${current.accent}22 0%, transparent 70%)`,
                    }}
                />

                {/* Icon */}
                <div
                    className="onboarding-icon"
                    style={{
                        boxShadow: `0 8px 32px ${current.accent}33`,
                    }}
                >
                    {current.icon}
                </div>

                {/* Text */}
                <h2 className="onboarding-title">{current.title}</h2>
                <p className="onboarding-desc">{current.desc}</p>

                {/* Progress dots */}
                <div className="onboarding-progress">
                    {steps.map((_, i) => (
                        <div
                            key={i}
                            className={`onboarding-dot ${i === step ? "active" : ""} ${i < step ? "done" : ""}`}
                            style={
                                i === step
                                    ? { background: current.accent, boxShadow: `0 0 8px ${current.accent}88` }
                                    : {}
                            }
                        />
                    ))}
                </div>

                {/* Step counter */}
                <span className="onboarding-counter">
                    {step + 1} / {steps.length}
                </span>

                {/* Actions */}
                <div className="onboarding-actions">
                    <button className="onboarding-skip" onClick={onComplete}>
                        Lewati
                    </button>
                    <button
                        className="onboarding-next"
                        onClick={goNext}
                        style={{
                            background: `linear-gradient(135deg, ${current.accent}, ${current.accent}cc)`,
                            boxShadow: `0 6px 20px ${current.accent}44`,
                        }}
                    >
                        {isLast ? "Mulai Sekarang! 🚀" : "Lanjut →"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Onboarding;
