import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  ChefHat,
  ShieldAlert,
  Lock,
  Mail,
  ArrowRight,
  UtensilsCrossed,
  AlertCircle,
  UserPlus,
  LogIn,
} from 'lucide-react';
import gsap from 'gsap';
import { useAuthStore } from '../store/useAuthStore';
import type { UserRole } from '../types';

interface Props {
  role?: 'kitchen' | 'admin';
}

export const LoginPage: React.FC<Props> = ({ role: initialRole = 'kitchen' }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const paramRole = (searchParams.get('role') as UserRole) || initialRole;

  const { login, signUp, error, clearError } = useAuthStore();

  const [selectedRole, setSelectedRole] = useState<UserRole>(paramRole);
  const [isSignUpMode, setIsSignUpMode] = useState<boolean>(false);
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>(
    paramRole === 'admin'
      ? 'admin@smartdining.com'
      : 'chef@smartdining.com'
  );
  const [password, setPassword] = useState<string>('royal123');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const redirectPath = selectedRole === 'admin' ? '/admin' : '/kitchen';

  // GSAP refs
  const logoRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);

  // Mount entrance animation
  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    tl.fromTo(logoRef.current, { scale: 0, autoAlpha: 0, rotation: -20 }, { scale: 1, autoAlpha: 1, rotation: 0, duration: 0.6 })
      .fromTo(titleRef.current, { autoAlpha: 0, y: -20 }, { autoAlpha: 1, y: 0, duration: 0.5 }, '-=0.25')
      .fromTo(subtitleRef.current, { autoAlpha: 0, y: -10 }, { autoAlpha: 1, y: 0, duration: 0.4 }, '-=0.2')
      .fromTo(cardRef.current, { autoAlpha: 0, y: 40, scale: 0.96 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.65 }, '-=0.25');

    return () => { tl.kill(); };
  }, []);

  // Re-animate card on role switch
  const handleRoleChange = (newRole: UserRole) => {
    gsap.fromTo(cardRef.current, { x: 12, autoAlpha: 0.7 }, { x: 0, autoAlpha: 1, duration: 0.3, ease: 'power2.out' });
    setSelectedRole(newRole);
    clearError();
    if (newRole === 'admin') {
      setEmail('admin@smartdining.com');
      setPassword('admin123');
    } else {
      setEmail('chef@smartdining.com');
      setPassword('chef123');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    clearError();

    if (isSignUpMode) {
      const res = await signUp(email, password, selectedRole, fullName);
      setIsSubmitting(false);
      if (res.success) {
        navigate(redirectPath);
      }
    } else {
      const res = await login(email, password, selectedRole);
      setIsSubmitting(false);
      if (res.success) {
        // Slide-out before navigation
        gsap.to(cardRef.current, { autoAlpha: 0, y: -30, duration: 0.35, ease: 'power2.in', onComplete: () => navigate(redirectPath) });
      }
    }
  };

  const accentColor = selectedRole === 'admin' ? '#1c1917' : '#7c1a1a';

  return (
    <div className="min-h-screen bg-transparent flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative z-10">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div ref={logoRef} style={{ display: 'inline-block' }}>
          <Link to="/" className="inline-flex items-center gap-2 mb-3 group">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-xl border border-amber-300/30 group-hover:scale-105 transition-transform"
              style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)` }}
            >
              <UtensilsCrossed className="w-7 h-7 text-amber-300" />
            </div>
          </Link>
        </div>
        <h2 ref={titleRef} className="font-serif text-3xl font-extrabold text-stone-900 tracking-tight" style={{ opacity: 0 }}>
          Staff Portal
        </h2>
        <p ref={subtitleRef} className="mt-1 text-xs text-stone-500 font-medium" style={{ opacity: 0 }}>
          Authorized Staff Access Only
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div
          ref={cardRef}
          className="bg-white/95 backdrop-blur-md py-8 px-6 shadow-2xl rounded-3xl border border-amber-100 sm:px-10 space-y-6"
          style={{ opacity: 0 }}
        >
          {/* Staff Role Switcher Tabs */}
          <div>
            <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-2 text-center">
              Select Staff Role:
            </label>
            <div className="grid grid-cols-2 gap-1.5 bg-stone-100/90 p-1.5 rounded-2xl">
              <button
                type="button"
                onClick={() => handleRoleChange('kitchen')}
                className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                  selectedRole === 'kitchen'
                    ? 'bg-maroon-700 text-white shadow-md'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <ChefHat className="w-3.5 h-3.5" />
                <span>Kitchen Staff</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleChange('admin')}
                className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                  selectedRole === 'admin'
                    ? 'bg-stone-900 text-white shadow-md'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Admin</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Login / Signup Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {isSignUpMode && (
              <div>
                <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder={
                    selectedRole === 'kitchen'
                      ? 'Chef Sanjeev'
                      : 'Manager Rajesh'
                  }
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-maroon-700/20"
                />
              </div>
            )}

            <div>
              <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                {selectedRole === 'kitchen'
                  ? 'Kitchen Staff Email'
                  : 'Admin & Manager Email'}
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  required
                  placeholder={
                    selectedRole === 'kitchen'
                      ? 'chef@smartdining.com'
                      : 'admin@smartdining.com'
                  }
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-maroon-700/20 text-stone-900"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-maroon-700/20 text-stone-900"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full text-white font-bold py-3.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 ${
                selectedRole === 'admin'
                  ? 'bg-stone-900 hover:bg-black shadow-stone-900/20'
                  : 'bg-maroon-700 hover:bg-maroon-800 shadow-maroon-800/20'
              }`}
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : isSignUpMode ? (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>
                    Create{' '}
                    {selectedRole === 'admin' ? 'Admin' : 'Kitchen Staff'}{' '}
                    Account
                  </span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>
                    {selectedRole === 'admin'
                      ? 'Sign In to Admin Panel'
                      : 'Sign In to Kitchen KDS'}
                  </span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </button>
          </form>

          {/* Toggle between Sign In & Sign Up */}
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => {
                setIsSignUpMode(!isSignUpMode);
                clearError();
              }}
              className="text-xs text-stone-500 hover:text-maroon-700 font-semibold"
            >
              {isSignUpMode
                ? 'Already have credentials? Sign In instead'
                : 'Need a new account? Register staff member'}
            </button>
          </div>

          <div className="text-center pt-1">
            <Link to="/" className="text-xs text-maroon-700 font-bold hover:underline inline-flex items-center gap-1">
              <span>← Back to Customer Menu</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
