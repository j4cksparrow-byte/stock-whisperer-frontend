
import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Profile, AuthState } from '@/types/auth';

interface AuthContextProps {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  signUp: (email: string, password: string, options?: { full_name?: string, username?: string }) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    profile: null,
    isLoading: true
  });
  const [session, setSession] = useState<Session | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log("Auth state changed:", event);
        setSession(currentSession);
        setAuthState(prev => ({ 
          ...prev, 
          user: currentSession?.user ?? null,
          isLoading: false 
        }));

        // Fetch profile when auth state changes
        if (currentSession?.user && event !== 'SIGNED_OUT') {
          // Use setTimeout to avoid potential deadlocks
          setTimeout(() => {
            fetchProfile(currentSession.user.id);
          }, 0);
        } else if (event === 'SIGNED_OUT') {
          setAuthState(prev => ({ ...prev, profile: null }));
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      console.log("Initial session check:", currentSession ? "Logged in" : "Not logged in");
      setSession(currentSession);
      setAuthState(prev => ({ 
        ...prev, 
        user: currentSession?.user ?? null,
        isLoading: false
      }));

      if (currentSession?.user) {
        fetchProfile(currentSession.user.id);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function fetchProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      setAuthState(prev => ({ ...prev, profile: data }));
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  }

  async function signUp(email: string, password: string, options?: { full_name?: string, username?: string }) {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: options?.full_name || null,
            username: options?.username || null
          },
          emailRedirectTo: window.location.origin + '/auth/callback'
        }
      });

      if (error) throw error;
      
      toast({
        title: "Account created",
        description: "Please check your email for verification instructions."
      });
      
    } catch (error: any) {
      console.error("Sign up error:", error);
      toast({
        title: "Sign up failed",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }
  }

  async function signIn(email: string, password: string) {
    try {
      console.log("Attempting sign in for:", email);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      toast({
        title: "Signed in successfully",
      });
    } catch (error: any) {
      console.error("Sign in error:", error);
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }
  }

  async function signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Signed out successfully",
      });
    } catch (error: any) {
      toast({
        title: "Sign out failed",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }
  }

  async function resetPassword(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      });
      
      if (error) throw error;
      
      toast({
        title: "Password reset email sent",
        description: "Check your email for a password reset link"
      });
    } catch (error: any) {
      toast({
        title: "Password reset failed",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }
  }

  async function updateProfile(updates: Partial<Profile>) {
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', authState.user?.id);
        
      if (error) throw error;
      
      // Refresh profile data
      await refreshProfile();
      
      toast({
        title: "Profile updated successfully"
      });
    } catch (error: any) {
      toast({
        title: "Profile update failed",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }
  }

  async function refreshProfile() {
    if (!authState.user?.id) return;
    await fetchProfile(authState.user.id);
  }

  const value = {
    session,
    user: authState.user,
    profile: authState.profile,
    isLoading: authState.isLoading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateProfile,
    refreshProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};
