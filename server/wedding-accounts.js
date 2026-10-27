import { authClient, databaseClient } from './admin-access.js';

const accessName = '__Host-nordra_client';
const refreshName = '__Host-nordra_client_refresh';
function cookie(req, name) {
  const value = (req.headers.cookie || '').split(';').map(x => x.trim()).find(x => x.startsWith(name + '='))?.slice(name.length + 1);
  return typeof value === 'string' && /^[A-Za-z0-9._-]{10,6000}$/.test(value) ? value : null;
}
export function clientCookies(res, session) {
  const make = (name,value,age) => `${name}=${value || ''}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${age}`;
  res.setHeader('Set-Cookie', [make(accessName,session?.access_token,session ? Math.min(session.expires_in,3600) : 0),make(refreshName,session?.refresh_token,session ? 30*86400 : 0)]);
}
export function accountService() {
  return {
    async identify(req,res) {
      const client = authClient(), access = cookie(req,accessName);
      if (access) {
        const {data,error} = await client.auth.getUser(access);
        if (!error && data.user?.email_confirmed_at) return data.user;
      }
      const refresh = cookie(req,refreshName);
      if (!refresh) return null;
      const {data,error} = await client.auth.refreshSession({refresh_token:refresh});
      if (error || !data.session || !data.user?.email_confirmed_at) { clientCookies(res,null); return null; }
      clientCookies(res,data.session); return data.user;
    },
    async login(email,password,res) {
      const {data,error} = await authClient().auth.signInWithPassword({email,password});
      if (error || !data.session || !data.user?.email_confirmed_at) return null;
      clientCookies(res,data.session); return data.user;
    },
    async activate(token,password,res,type='magiclink') {
      const client = authClient();
      const {data,error} = await client.auth.verifyOtp({token_hash:token,type});
      if (error || !data.session || !data.user) { console.warn('wedding_activation_failed',{step:'verify',code:error?.code || 'missing_session'}); return null; }
      if (data.user.id === process.env.NORDRA_ADMIN_USER_ID) return null;
      const updated = await client.auth.updateUser({password});
      if (updated.error) { console.warn('wedding_activation_failed',{step:'password',code:updated.error.code}); return null; }
      clientCookies(res,data.session); return updated.data.user;
    },
    async logout(req,res) {
      let access = cookie(req,accessName);
      if (!access && cookie(req,refreshName)) {
        const {data} = await authClient().auth.refreshSession({refresh_token:cookie(req,refreshName)});
        access = data.session?.access_token;
      }
      if (access) await databaseClient().auth.admin.signOut(access,'local');
      clientCookies(res,null);
    },
    async issue(email) {
      const client = databaseClient();
      const admin = await client.auth.admin.getUserById(process.env.NORDRA_ADMIN_USER_ID);
      if (admin.error) throw admin.error;
      if (admin.data.user?.email?.toLowerCase() === email) throw new Error('admin_email');
      // generateLink never sends email. Nordra shares the single-use setup link.
      const {data,error} = await client.auth.admin.generateLink({type:'magiclink',email});
      if (error || !data.user || !data.properties?.hashed_token) throw error || new Error('account_unavailable');
      return {userId:data.user.id,token:data.properties.hashed_token,type:data.properties.verification_type};
    },
  };
}
