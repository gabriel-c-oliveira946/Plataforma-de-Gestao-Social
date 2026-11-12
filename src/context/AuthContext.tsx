import { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase/client';
import {
  UserRole,
  getUserDisplayName,
  getRoleCargo,
  getRoleShortLabel,
  canDeleteAssistido,
  canEditAssistido,
  canRegisterAvaliacao,
  canManageTeam
} from '../types/auth';
import { isUsuarioInativo, saveInativo, saveMensagemDesativacao } from '../utils/equipe';

export interface ProfileRecord {
  id: string;
  nome: string;
  email?: string;
  role?: string;
  cargo?: string;
  status?: string;
  ativo?: boolean;
  mensagem_desativacao?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: ProfileRecord | null;
  loading: boolean;
  role: UserRole;
  displayName: string;
  roleCargo: string;
  roleShortLabel: string;
  canEdit: boolean;
  canDelete: boolean;
  canEvaluate: boolean;
  canManageTeam: boolean;
  refreshProfile: () => Promise<void>;
  setSimulatedRole: (newRole: UserRole | null) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  loading: true,
  role: 'recepcao',
  displayName: 'Operador Social',
  roleCargo: 'Recepção / Voluntário',
  roleShortLabel: 'Recepção',
  canEdit: false,
  canDelete: false,
  canEvaluate: false,
  canManageTeam: false,
  refreshProfile: async () => {},
  setSimulatedRole: () => {}
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<ProfileRecord | null>(null);
  const [loading, setLoading] = useState(true);

  // Limpa qualquer resquício de simulação salvo no navegador
  useEffect(() => {
    localStorage.removeItem('lar_harmonia_simulated_role');
  }, []);

  const setSimulatedRole = (_newRole: UserRole | null) => {
    localStorage.removeItem('lar_harmonia_simulated_role');
  };

  // Carrega os dados do operador diretamente da tabela 'public.profiles'
  const loadProfile = useCallback(async (activeUser: User | null) => {
    if (!activeUser) {
      setProfile(null);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', activeUser.id)
        .maybeSingle();

      if (!error && data) {
        // Se a conta estiver inativa na tabela profiles, encerra a sessão
        if (data.status === 'inativo' || data.ativo === false || data.cargo === 'Inativo') {
          if (activeUser.id) saveInativo(activeUser.id);
          if (activeUser.email) saveInativo(activeUser.email);
          if (data.mensagem_desativacao) {
            if (activeUser.id) saveMensagemDesativacao(activeUser.id, data.mensagem_desativacao);
            if (activeUser.email) saveMensagemDesativacao(activeUser.email, data.mensagem_desativacao);
          }
          await supabase.auth.signOut();
          setSession(null);
          setUser(null);
          setProfile(null);
          return;
        }
        setProfile(data);
        return;
      }

      // Consulta bem-sucedida, mas sem perfil: a conta não foi cadastrada
      // pela Diretoria (ex.: criada pelo cadastro público). Sem acesso.
      if (!error && !data) {
        try {
          sessionStorage.setItem(
            'lar_harmonia_login_aviso',
            'Sua conta não está vinculada à equipe. Peça à Diretoria para cadastrá-la.'
          );
        } catch {}
        await supabase.auth.signOut();
        setSession(null);
        setUser(null);
        setProfile(null);
        return;
      }

      if (error) {
        console.warn('Erro ao consultar tabela profiles:', error);
      }
    } catch (err) {
      console.warn('Erro ao consultar tabela profiles:', err);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) {
      await loadProfile(user);
    }
  }, [user, loadProfile]);

  useEffect(() => {
    let activeChannel: any = null;

    supabase.auth
      .getSession()
      .then(async ({ data: { session } }) => {
        const activeUser = session?.user ?? null;
        if (activeUser && isUsuarioInativo(activeUser)) {
          supabase.auth.signOut();
          setSession(null);
          setUser(null);
          setProfile(null);
          setLoading(false);
          return;
        }
        setSession(session);
        setUser(activeUser);
        if (activeUser) {
          await loadProfile(activeUser);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.warn('Sessão Supabase não carregada:', err);
        setLoading(false);
      });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const activeUser = session?.user ?? null;
      if (activeUser && isUsuarioInativo(activeUser)) {
        supabase.auth.signOut();
        setSession(null);
        setUser(null);
        setProfile(null);
        setLoading(false);
        return;
      }
      setSession(session);
      setUser(activeUser);
      if (activeUser) {
        await loadProfile(activeUser);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
      if (activeChannel) {
        supabase.removeChannel(activeChannel);
      }
    };
  }, [loadProfile]);

  // Sincronização em tempo real caso o perfil seja alterado na tabela profiles
  useEffect(() => {
    if (!user) return;

    let channel: any = null;
    try {
      const hasUrl = typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL;
      if (hasUrl) {
        channel = supabase
          .channel(`profile-realtime-${user.id}`)
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'profiles', filter: `id=eq.${user.id}` },
            async (payload) => {
              const newRow = payload.new as ProfileRecord;
              if (newRow) {
                if (newRow.status === 'inativo' || newRow.ativo === false || newRow.cargo === 'Inativo') {
                  await supabase.auth.signOut();
                  setSession(null);
                  setUser(null);
                  setProfile(null);
                } else {
                  setProfile(newRow);
                }
              }
            }
          )
          .subscribe();
      }
    } catch (channelErr) {
      console.warn('Realtime channel perfil não disponível:', channelErr);
    }

    return () => {
      if (channel) {
        try {
          supabase.removeChannel(channel);
        } catch {}
      }
    };
  }, [user]);

  // Papel (role) vem exclusivamente da tabela 'public.profiles', que só a
  // Diretoria pode alterar (garantido pelo RLS). Sem perfil carregado,
  // aplica o menor privilégio — o banco recusaria as ações de qualquer forma.
  const role = useMemo<UserRole>(() => {
    if (profile?.role === 'admin') return 'admin';
    if (profile?.role === 'servico_social') return 'servico_social';
    return 'recepcao';
  }, [profile]);

  // Nome de exibição definido pela tabela 'public.profiles'
  const displayName = useMemo(() => {
    if (profile?.nome && profile.nome.trim()) {
      return profile.nome.trim();
    }
    return getUserDisplayName(user);
  }, [profile, user]);

  // Cargo formatado definido pela tabela 'public.profiles'
  const roleCargo = useMemo(() => {
    if (profile?.cargo && profile.cargo !== 'Inativo') {
      return profile.cargo;
    }
    return getRoleCargo(role);
  }, [profile, role]);

  const roleShortLabel = useMemo(() => getRoleShortLabel(role), [role]);

  const canEdit = useMemo(() => canEditAssistido(role), [role]);
  const canDelete = useMemo(() => canDeleteAssistido(role), [role]);
  const canEvaluate = useMemo(() => canRegisterAvaliacao(role), [role]);
  const canManageTeamPermission = useMemo(() => canManageTeam(role), [role]);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        role,
        displayName,
        roleCargo,
        roleShortLabel,
        canEdit,
        canDelete,
        canEvaluate,
        canManageTeam: canManageTeamPermission,
        refreshProfile,
        setSimulatedRole
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
