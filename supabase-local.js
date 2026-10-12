/* 苏伊温德日历 V1.3.2 · 轻量本地 Supabase 客户端
 * 只实现本日历实际使用的 Auth + PostgREST 接口，避免依赖外部 CDN。
 * 浏览器仍需能够访问项目自身的 *.supabase.co 域名才能登录/同步。
 */
(function(global){
  'use strict';

  function trimSlash(v){ return String(v||'').trim().replace(/\/+$/,''); }
  function errObj(message,status,raw){ return {message:message||'请求失败',status:status||0,raw:raw||null}; }
  async function parseBody(res){
    const text=await res.text();
    if(!text)return null;
    try{return JSON.parse(text)}catch{return text}
  }
  function messageOf(body,fallback){
    if(!body)return fallback||'请求失败';
    if(typeof body==='string')return body;
    return body.message||body.msg||body.error_description||body.error||body.code||fallback||'请求失败';
  }
  function sessionFromResponse(body){
    if(!body||!body.access_token)return null;
    const expiresIn=Number(body.expires_in||3600);
    return {
      access_token:body.access_token,
      refresh_token:body.refresh_token||'',
      token_type:body.token_type||'bearer',
      expires_in:expiresIn,
      expires_at:Number(body.expires_at||Math.floor(Date.now()/1000)+expiresIn),
      user:body.user||null
    };
  }

  function createClient(projectUrl,anonKey,options){
    const url=trimSlash(projectUrl), key=String(anonKey||'').trim();
    if(!/^https:\/\/[^/]+\.supabase\.co$/i.test(url))throw new Error('Supabase Project URL 格式不正确');
    if(!key)throw new Error('Supabase key 不能为空');

    let projectId='default';
    try{projectId=new URL(url).hostname.split('.')[0]||'default'}catch{}
    const authOptions=options?.auth||{};
    const persistSession=authOptions.persistSession!==false;
    const autoRefreshToken=authOptions.autoRefreshToken!==false;
    const storageKey=authOptions.storageKey||('suiwind_supabase_session_'+projectId);
    let listeners=[];
    let refreshPromise=null;
    let refreshTimer=null;

    function loadSession(){
      if(!persistSession)return null;
      try{return JSON.parse(localStorage.getItem(storageKey)||'null')}catch{return null}
    }
    function clearRefreshTimer(){
      if(refreshTimer){clearTimeout(refreshTimer);refreshTimer=null}
    }
    function scheduleRefresh(session){
      clearRefreshTimer();
      if(!autoRefreshToken||!session?.refresh_token||!Number(session.expires_at||0))return;
      const delay=Math.max(30000,Number(session.expires_at)*1000-Date.now()-120000);
      refreshTimer=setTimeout(()=>{refreshSession(true).catch(()=>{})},delay)
    }
    function saveSession(session){
      if(persistSession){
        try{
          if(session)localStorage.setItem(storageKey,JSON.stringify(session));
          else localStorage.removeItem(storageKey);
        }catch{}
      }
      if(session)scheduleRefresh(session);else clearRefreshTimer()
    }
    function emit(event,session){
      listeners.slice().forEach(fn=>{try{fn(event,session)}catch{}});
    }
    function baseHeaders(token,extra){
      const h={apikey:key,...(extra||{})};
      if(token)h.Authorization='Bearer '+token;
      return h;
    }
    async function doFetch(path,opts){
      try{return await fetch(url+path,opts)}
      catch(e){throw errObj('无法连接 Supabase，请检查当前网络是否能访问 '+new URL(url).hostname,0,e)}
    }
    async function refreshSession(force){
      let session=loadSession();
      if(!session?.refresh_token)return session;
      const now=Math.floor(Date.now()/1000);
      if(!force && session.access_token && Number(session.expires_at||0)>now+60){scheduleRefresh(session);return session}
      if(refreshPromise)return refreshPromise;
      refreshPromise=(async()=>{
        const latest=loadSession()||session;
        const res=await doFetch('/auth/v1/token?grant_type=refresh_token',{
          method:'POST',
          headers:baseHeaders('',{'content-type':'application/json'}),
          body:JSON.stringify({refresh_token:latest.refresh_token})
        });
        const body=await parseBody(res);
        if(!res.ok){
          if(res.status===400||res.status===401){saveSession(null);emit('SIGNED_OUT',null);return null}
          throw errObj(messageOf(body,'登录续期暂时失败'),res.status,body)
        }
        const next=sessionFromResponse(body);
        if(next){
          next.user=next.user||latest.user||null;
          saveSession(next);emit('TOKEN_REFRESHED',next);return next
        }
        scheduleRefresh(latest);
        return latest;
      })();
      try{return await refreshPromise}finally{refreshPromise=null}
    }
    async function validSession(){
      let s=loadSession();
      if(!s)return null;
      const now=Math.floor(Date.now()/1000);
      if(!s.access_token || Number(s.expires_at||0)<=now+60)s=await refreshSession(true);
      return s;
    }
    async function authRequest(path,payload){
      const res=await doFetch(path,{
        method:'POST',
        headers:baseHeaders('',{'content-type':'application/json'}),
        body:JSON.stringify(payload||{})
      });
      const body=await parseBody(res);
      if(!res.ok)return {data:{user:null,session:null},error:errObj(messageOf(body,'认证失败'),res.status,body)};
      const session=sessionFromResponse(body);
      if(session){saveSession(session);emit('SIGNED_IN',session)}
      const user=body?.user||session?.user||body||null;
      return {data:{user,session},error:null};
    }

    const auth={
      async getSession(){
        const cached=loadSession();
        try{return {data:{session:await validSession()},error:null}}
        catch(e){return {data:{session:cached},error:e?.message?e:errObj(String(e))}}
      },
      async getUser(){
        try{
          let session=await validSession();
          if(!session?.access_token)return {data:{user:null},error:null};
          let res=await doFetch('/auth/v1/user',{headers:baseHeaders(session.access_token)});
          if(res.status===401 && session.refresh_token){
            session=await refreshSession(true);
            if(session?.access_token)res=await doFetch('/auth/v1/user',{headers:baseHeaders(session.access_token)});
          }
          const body=await parseBody(res);
          if(!res.ok)return {data:{user:null},error:errObj(messageOf(body,'读取账号失败'),res.status,body)};
          if(session){session={...session,user:body};saveSession(session)}
          return {data:{user:body},error:null};
        }catch(e){return {data:{user:null},error:e?.message?e:errObj(String(e))}}
      },
      signUp({email,password}){return authRequest('/auth/v1/signup',{email,password})},
      signInWithPassword({email,password}){return authRequest('/auth/v1/token?grant_type=password',{email,password})},
      async signOut(){
        const session=loadSession();
        try{
          if(session?.access_token)await doFetch('/auth/v1/logout',{method:'POST',headers:baseHeaders(session.access_token)});
        }catch{}
        saveSession(null);emit('SIGNED_OUT',null);
        return {error:null};
      },
      onAuthStateChange(callback){
        if(typeof callback==='function')listeners.push(callback);
        return {data:{subscription:{unsubscribe(){listeners=listeners.filter(x=>x!==callback)}}}};
      }
    };

    const initialSession=loadSession();
    if(initialSession)scheduleRefresh(initialSession);

    async function restFetch(table,method,params,body,prefer){
      let session;
      try{session=await validSession()}catch(e){return {data:null,error:e?.message?e:errObj(String(e))}}
      if(!session?.access_token)return {data:null,error:errObj('云端登录已失效，请重新登录。',401)};
      const q=params&&String(params)?'?'+params.toString():'';
      const headers=baseHeaders(session.access_token,{Accept:'application/json'});
      if(method!=='GET')headers['content-type']='application/json';
      if(prefer)headers.Prefer=prefer;
      let res;
      try{res=await doFetch('/rest/v1/'+encodeURIComponent(table)+q,{method,headers,body:body===undefined?undefined:JSON.stringify(body)})}
      catch(e){return {data:null,error:e?.message?e:errObj(String(e))}}
      if(res.status===401 && session.refresh_token){
        session=await refreshSession(true);
        if(session?.access_token){
          headers.Authorization='Bearer '+session.access_token;
          try{res=await doFetch('/rest/v1/'+encodeURIComponent(table)+q,{method,headers,body:body===undefined?undefined:JSON.stringify(body)})}
          catch(e){return {data:null,error:e?.message?e:errObj(String(e))}}
        }
      }
      const parsed=await parseBody(res);
      if(!res.ok)return {data:null,error:errObj(messageOf(parsed,'云端请求失败'),res.status,parsed)};
      return {data:parsed,error:null};
    }

    function from(table){
      return {
        select(columns){
          const filters=[];
          return {
            eq(col,val){filters.push([col,val]);return this},
            async maybeSingle(){
              const p=new URLSearchParams();p.set('select',columns||'*');filters.forEach(([c,v])=>p.set(c,'eq.'+v));p.set('limit','2');
              const r=await restFetch(table,'GET',p);
              if(r.error)return r;
              const rows=Array.isArray(r.data)?r.data:[];
              if(rows.length>1)return {data:null,error:errObj('云端返回了多条记录')};
              return {data:rows[0]||null,error:null};
            }
          };
        },
        upsert(row,options){
          let columns='*';
          return {
            select(c){columns=c||'*';return this},
            async single(){
              const p=new URLSearchParams();
              if(options?.onConflict)p.set('on_conflict',options.onConflict);
              p.set('select',columns);
              const r=await restFetch(table,'POST',p,row,'resolution=merge-duplicates,return=representation');
              if(r.error)return r;
              const rows=Array.isArray(r.data)?r.data:[r.data];
              if(rows.length!==1)return {data:rows[0]||null,error:rows.length?null:errObj('云端未返回更新结果')};
              return {data:rows[0],error:null};
            }
          };
        }
      };
    }

    return {auth,from};
  }

  global.supabase={createClient};
})(window);
