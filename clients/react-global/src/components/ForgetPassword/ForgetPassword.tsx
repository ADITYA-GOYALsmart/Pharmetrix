import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import "./ForgetPassword.scss";
import { apiFetch } from "../../services/api";

export default function ForgetPassword() {
	const navigate = useNavigate();
	const [step, setStep] = useState<"email" | "verify" | "reset" | "done">("email");
	const [email, setEmail] = useState("");
	const [otp, setOtp] = useState("");
	const [password, setPassword] = useState("");
	const [confirm, setConfirm] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);

	async function sendOtp() {
		setError(null);
		setLoading(true);
		try {
				const normalized = email.trim().toLowerCase();
				const resp = await apiFetch("/otp/send", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ email: normalized }),
				});
			const data = await resp.json().catch(() => ({}));
			if (!resp.ok) {
				setError(data?.message || "Failed to send OTP");
				return;
			}
			setStep("verify");
			setSuccess("OTP sent to your email. It will expire in 10 minutes.");
		} catch (err) {
			setError("Network error. Please try again.");
		} finally {
			setLoading(false);
		}
	}

	async function verifyOtp() {
		setError(null);
		setLoading(true);
		try {
				const normalized = email.trim().toLowerCase();
				const resp = await apiFetch("/otp/verify", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ email: normalized, code: otp }),
				});
			const data = await resp.json().catch(() => ({}));
			if (!resp.ok) {
				setError(data?.message || "OTP verification failed");
				return;
			}
			setStep("reset");
			setSuccess("OTP verified. Enter a new password.");
		} catch (err) {
			setError("Network error. Please try again.");
		} finally {
			setLoading(false);
		}
	}

	async function resetPassword() {
		setError(null);
		if (!password || password.length < 6) {
			setError("Password must be at least 6 characters");
			return;
		}
		if (password !== confirm) {
			setError("Passwords do not match");
			return;
		}
		setLoading(true);
		try {
				const normalized = email.trim().toLowerCase();
				const resp = await apiFetch("/user/reset-password", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ email: normalized, code: otp, password }),
				});
			const data = await resp.json().catch(() => ({}));
			if (!resp.ok) {
				setError(data?.message || "Failed to reset password");
				return;
			}
			setStep("done");
			setSuccess("Password reset successful. You can now sign in.");
		} catch (err) {
			setError("Network error. Please try again.");
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="auth-wrapper">
			<motion.div
				className="auth-card"
				initial={{ opacity: 0, y: 16 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.4 }}
			>
				<motion.div
					className="auth-left"
					initial={{ opacity: 0, x: -12 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ delay: 0.1, duration: 0.4 }}
				>
					<motion.div
						className="logo-tile"
						initial={{ opacity: 0, y: 8 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.15, duration: 0.35 }}
					>
						<img
							src="/title-logo.png"
							alt="Pharmetrix"
							onError={(e) => {
								(e.target as HTMLImageElement).style.display = "none";
							}}
						/>
					</motion.div>
					<motion.h1
						className="title"
						initial={{ opacity: 0, y: 8 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.2, duration: 0.35 }}
					>
						Smart pharmacy management
					</motion.h1>
					<motion.p
						className="subtitle"
						initial={{ opacity: 0, y: 8 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.25, duration: 0.35 }}
					>
						Reset your account password securely using a one-time code.
					</motion.p>
					<div className="backline">
						<a
							href="/"
							className="inline-link"
							onClick={(e) => {
								e.preventDefault();
								navigate("/");
							}}
						>
							Back to Home
						</a>
					</div>
				</motion.div>

				<motion.div
					className="auth-right"
					initial={{ opacity: 0, x: 12 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ delay: 0.15, duration: 0.4 }}
				>
					<motion.form className="auth-form" onSubmit={(e) => e.preventDefault()}>
						<div className="form-header">
							<h2>Reset password</h2>
							<p>Follow the steps to reset your account password</p>
						</div>

						{error && <div className="error">{error}</div>}
						{success && <div className="success">{success}</div>}

						{step === "email" && (
							<>
								<label htmlFor="email">Email</label>
								<input
									id="email"
									type="email"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									required
								/>

								<button className="submit-btn" type="button" onClick={sendOtp} disabled={loading || !email}>
									{loading ? "Sending…" : "Send OTP"}
								</button>
							</>
						)}

						{step === "verify" && (
							<>
								<label htmlFor="otp">Verification code</label>
								<input
									id="otp"
									type="text"
									value={otp}
									onChange={(e) => setOtp(e.target.value)}
									required
								/>
								<div className="row-between">
									<button className="inline-link" type="button" onClick={() => setStep("email")}>Change email</button>
									<button className="inline-link" type="button" onClick={sendOtp} disabled={loading}>Resend</button>
								</div>
								<button className="submit-btn" type="button" onClick={verifyOtp} disabled={loading || !otp}>
									{loading ? "Verifying…" : "Verify"}
								</button>
							</>
						)}

						{step === "reset" && (
							<>
								<label htmlFor="password">New password</label>
								<div className="password-field">
									<input
										id="password"
										type={showPassword ? "text" : "password"}
										value={password}
										onChange={(e) => setPassword(e.target.value)}
										required
									/>
									<button
										type="button"
										onClick={() => setShowPassword((v) => !v)}
										className="eye-btn"
										aria-label={showPassword ? "Hide password" : "Show password"}
									>
										<FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
									</button>
								</div>

								<label htmlFor="confirm">Confirm password</label>
								<input id="confirm" type={showPassword ? "text" : "password"} value={confirm} onChange={(e) => setConfirm(e.target.value)} required />

								<div className="row-between">
									<button className="inline-link" type="button" onClick={() => setStep("verify")}>Back</button>
								</div>

								<button className="submit-btn" type="button" onClick={resetPassword} disabled={loading}>
									{loading ? "Resetting…" : "Reset password"}
								</button>
							</>
						)}

						{step === "done" && (
							<>
								<p className="helper-text">Password has been reset successfully.</p>
								<button className="submit-btn" type="button" onClick={() => navigate("/auth")}>Sign in</button>
							</>
						)}
					</motion.form>
				</motion.div>
			</motion.div>
		</div>
	);
}