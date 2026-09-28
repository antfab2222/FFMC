import React,{useEffect,useState} from 'react';
import {createRoot} from 'react-dom/client';
import type {Session} from '@supabase/supabase-js';
import {ShieldCheck,LogIn,LogOut} from 'lucide-react';
import {configured,supabase,SESSION_LOST_EVENT} from './lib/backend';
import Dashboard from './Dashboard';
import MemberPortal from './MemberPortal';
import './styles.css';
function App(){const [session,setSession]=useState<Session|null>(null),[checking,setChecking]=useState(configured),[member,setMember]=useState(false),[role,setRole]=useState('membre'),[preview,setPreview]=useState(false),[email,setEmail]=useState(''),[password,setPassword]=useState(''),[notice,setNotice]=useState(''),[sending,setSending]=useState(false),[fault,setFault]=useState(''),[retryAt,setRetryAt]=useState(0),[clock,setClock]=useState(Date.now()),[recovery,setRecovery]=useState(false),[newPassword,setNewPassword]=useState('');
const retrySeconds=Math.max(0,Math.ceil((retryAt-clock)/1000));
useEffect(()=>{if(!retryAt)return;const timer=setInterval(()=>setClock(Date.now()),1000);return()=>clearInterval(timer);},[retryAt]);
useEffect(()=>{if(!supabase)return;const client=supabase;let alive=true;let revision=0;async function check(s:Session|null){const checkId=++revision;setSession(s);setMember(false);setRole('membre');setChecking(true);setFault('');if(s){try{const {data,error}=await client.from('ca_members').select('user_id,role').eq('user_id',s.user.id).maybeSingle();if(!alive||checkId!==revision)return;if(error)setFault('Impossible de vérifier votre accès. Réessayez dans un instant.');else {setMember(Boolean(data));setRole(data?.role||'membre');}}catch{if(alive&&checkId===revision)setFault('Impossible de vérifier votre accès. Réessayez.');}}if(alive&&checkId===revision)setChecking(false);}
let authTimer:ReturnType<typeof setTimeout>|undefined;
function lostSession(){
 ++revision;setSession(null);setMember(false);setRole('membre');setChecking(false);
 setFault('Votre session a expiré. Reconnectez-vous pour retrouver vos mails et les actualités.');
}
async function restore(){
 try{const {data,error}=await client.auth.getSession();if(!alive)return;
 if(error||!data.session){setSession(null);setMember(false);setChecking(false);return;}
 await check(data.session);
 }catch{if(alive){setChecking(false);setFault('Connexion indisponible. Réessayez.');}}
}
function resume(){if(document.visibilityState==='visible')void restore();}
const {data:{subscription}}=client.auth.onAuthStateChange((event,s)=>{ if(event==='PASSWORD_RECOVERY')setRecovery(true);
 // Wait until the Auth callback releases its lock before querying PostgREST.
 clearTimeout(authTimer);
 authTimer=setTimeout(()=>{if(alive)void check(s);},0);
});
window.addEventListener(SESSION_LOST_EVENT,lostSession);
window.addEventListener('pageshow',resume);
document.addEventListener('visibilitychange',resume);
return()=>{alive=false;++revision;clearTimeout(authTimer);subscription.unsubscribe();window.removeEventListener(SESSION_LOST_EVENT,lostSession);window.removeEventListener('pageshow',resume);document.removeEventListener('visibilitychange',resume);};},[]);

async function login(e:React.FormEvent){e.preventDefault();if(!supabase||sending)return;setSending(true);setNotice('');try{const {error}=await supabase.auth.signInWithPassword({email:email.trim(),password});if(error)throw error;}catch{setNotice('Adresse email ou mot de passe incorrect, ou compte non autorisé.');}finally{setSending(false);}}
async function resetPassword(){if(!supabase||sending)return;if(!email.trim()){setNotice('Entre d’abord ton adresse email.');return;}setSending(true);setNotice('');try{const {error}=await supabase.auth.resetPasswordForEmail(email.trim(),{redirectTo:'https://ffmc.fabreantoine.com/'});if(error)throw error;setNotice('Email envoyé. Ouvre le lien reçu pour définir ton mot de passe.');}catch(e:any){setNotice(e?.status===429?'Trop de demandes d’email ont été faites. Attends quelques minutes puis réessaie une seule fois.':'Impossible d’envoyer l’email de réinitialisation. Réessaie.');}finally{setSending(false);}}
async function saveNewPassword(e:React.FormEvent){e.preventDefault();if(!supabase||sending||newPassword.length<6)return;setSending(true);const {error}=await supabase.auth.updateUser({password:newPassword});if(error){setNotice('Impossible de définir ce mot de passe. Choisis au moins 6 caractères.');setSending(false);return;}setRecovery(false);setNotice('Mot de passe défini. Tu peux maintenant utiliser ton compte.');setSending(false);history.replaceState({},'',location.pathname);}
async function logout(){const {error}=await supabase!.auth.signOut();if(error)setFault('Déconnexion impossible. Réessayez.');}
if(recovery)return <main className="login-page"><div className="login-card"><div className="brand"><span>06</span><div>FFMC<strong>ESPACE CA</strong></div></div><ShieldCheck size={30}/><h1>Définir votre mot de passe</h1><p>Choisissez le mot de passe qui servira ensuite à vous connecter à l’espace CA.</p><form onSubmit={saveNewPassword}><label>Nouveau mot de passe</label><input type="password" autoComplete="new-password" minLength={6} required value={newPassword} onChange={e=>setNewPassword(e.target.value)}/><button className="primary" disabled={sending||newPassword.length<6}>{sending?'Enregistrement…':'Définir le mot de passe'}</button></form>{notice&&<p className="login-notice">{notice}</p>}</div></main>;
if(session&&member&&!checking)return <><div className="account-bar"><span>{session.user.email} · {role==='coordinateur'?'Coordinateur':'Membre du CA'}</span>{role==='coordinateur'&&<button onClick={()=>setPreview(!preview)}>{preview?'Revenir à la vue coordinateur':'Voir la vue membre du CA'}</button>}<button onClick={logout}><LogOut size={14}/> Se déconnecter</button>{fault&&<span role="alert">{fault}</span>}</div>{role==='coordinateur'&&!preview?<Dashboard key={session.user.id}/>:<MemberPortal key={session.user.id+'-ca'} preview={preview}/>}</>;
return <main className="login-page"><div className="login-card"><div className="brand"><span>06</span><div>FFMC<strong>ESPACE CA</strong></div></div><ShieldCheck size={30}/><h1>{!configured?'L’espace se prépare':checking?'Vérification de votre accès…':session?'Accès au CA requis':'Bienvenue dans l’espace CA'}</h1>{!configured?<><p>La connexion des membres et la sauvegarde partagée doivent encore être activées par le coordinateur.</p><p>Les réunions, dossiers et échéances seront accessibles ici une fois cette configuration terminée.</p></>:checking?<p>Un instant, nous vérifions votre connexion.</p>:session?<><p>{fault||'Votre compte est connecté, mais n’est pas autorisé à consulter les informations du CA. Contactez le coordinateur.'}</p>{fault&&<button className="secondary" onClick={()=>location.reload()}>Réessayer</button>}<button className="secondary" onClick={logout}>Se déconnecter</button></>:<><p>Un espace réservé aux membres autorisés du conseil d’administration de la FFMC 06.</p><form onSubmit={login}><label htmlFor="email">Compte</label><input id="email" type="email" autoComplete="username" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="votre adresse email"/><label htmlFor="password">Mot de passe</label><input id="password" type="password" autoComplete="current-password" required value={password} onChange={e=>setPassword(e.target.value)}/><button className="primary" disabled={sending}><LogIn size={18}/>{sending?'Connexion…':'Se connecter'}</button><button type="button" className="password-link" disabled={sending} onClick={resetPassword}>Définir / mot de passe oublié</button></form><p className="login-help">Pour protéger les informations du CA, le compte et le mot de passe sont demandés à chaque nouvelle ouverture du site.</p>{notice&&<p role="status" className="login-notice">{notice}</p>}{fault&&<p role="alert">{fault}</p>}</>}</div></main>;
}
createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);
