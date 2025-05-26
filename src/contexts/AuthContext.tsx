import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { useToast } from '@/components/ui/use-toast';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  userSubscription: 'free' | 'silver' | 'gold' | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userSubscription, setUserSubscription] = useState<'free' | 'silver' | 'gold' | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log('Auth state changed:', event, currentSession?.user?.id);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        // Get user subscription plan if we have a user
        if (currentSession?.user) {
          setTimeout(() => {
            fetchUserSubscription(currentSession.user);
          }, 0);
        } else {
          setUserSubscription(null);
          setIsLoading(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      console.log('Got existing session:', currentSession?.user?.id);
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession?.user) {
        fetchUserSubscription(currentSession.user);
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserSubscription = async (currentUser: User) => {
    try {
      // First try to get it from user metadata
      if (currentUser?.user_metadata?.subscription_plan) {
        const plan = currentUser.user_metadata.subscription_plan;
        console.log('Found subscription in user metadata:', plan);
        setUserSubscription(plan as 'free' | 'silver' | 'gold');
        setIsLoading(false);
        return;
      }
      
      // Otherwise fetch from profiles table
      const { data, error } = await supabase
        .from('profiles')
        .select('subscription_plan')
        .eq('id', currentUser.id)
        .single();

      if (error) {
        console.error('Error fetching user subscription:', error);
        setUserSubscription('free');
      } else {
        const plan = data?.subscription_plan as 'free' | 'silver' | 'gold' || 'free';
        console.log('Found subscription in profiles table:', plan);
        setUserSubscription(plan);
      }
    } catch (error) {
      console.error('Error fetching user subscription:', error);
      setUserSubscription('free'); // Default to free if there's an error
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Signed out successfully",
        description: "You have been logged out of your account."
      });
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        variant: "destructive",
        title: "Sign out failed",
        description: "There was a problem signing you out."
      });
    }
  };

  return (
    <AuthContext.Provider value={{ session, user, userSubscription, isLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
